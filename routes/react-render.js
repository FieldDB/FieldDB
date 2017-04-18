/* globals escape */
var debugFactory = require("debug");
var createMemoryHistory = require("history").createMemoryHistory;
var useQueries = require("history").useQueries;
var Helmet = require("react-helmet").default;
var Promise = require("bluebird");
var Provider = require("react-redux").Provider;
var ReactDOMServer = require("react-dom/server");
var useRouterHistory = require("react-router").useRouterHistory;
var RouterContext = require("react-router").RouterContext;
var match = require("react-router").match;

var configureStore = require("../app/components/App/store").default;
var createRoutes = require("../app/components/App/routes").default;

var debug = debugFactory("route:react-render");
var scriptSrcs;
process.env.ON_SERVER = true; // TODO this is not used

var styleSrc;
if (process.env.NODE_ENV === "production") {
  // build scripts serving from dist
  var refManifest = require("../dist/rev-manifest.json");
  scriptSrcs = [
    "/" + refManifest["vendor.js"],
    "/" + refManifest["app.js"]
  ];
  styleSrc = "/" + refManifest["app.css"];
} else {
  // scripts serving from webpack
  scriptSrcs = [
    "//localhost:3001/static/vendor.js",
    "//localhost:3001/static/dev.js",
    "//localhost:3001/static/app.js"
  ];
  styleSrc = "/app.css";
}

function reduxRender(req, res, next) {
  var history = useRouterHistory(useQueries(createMemoryHistory))();
  var store = configureStore();
  var routes = createRoutes(history);
  var location = history.createLocation(req.url);

  match({
    routes: routes,
    location: location
  }, function(error, redirectLocation, renderProps) {
    debug("req.url ", req.url, renderProps.params);
    function getReduxPromise() {
      var query = renderProps.query;
      var params = renderProps.params;
      var comp = renderProps.components[renderProps.components.length - 1].WrappedComponent;
      var promise = comp.fetchData ? comp.fetchData({
        query: query,
        params: params,
        store: store,
        history: history
      }) : Promise.resolve();

      return promise;
    }

    if (redirectLocation) {
      debug("redirecting to ", redirectLocation);
      res.redirect(301, redirectLocation.pathname + redirectLocation.search);
    } else if (error) {
      debug("error ", error);
      return next(error);
    }

    if (renderProps == null) {
      debug("renderProps was null, not found ", renderProps);
      var err = new Error("Not found");
      err.status = 404;
      return next(err);
    }

    function subscribeUrl() {
      var currentUrl = location.pathname + location.search;
      debug("subscribeUrl currentUrl ", currentUrl);
      var unsubscribe = history.listen(function(newLoc) {
        if (newLoc.action === "PUSH" || newLoc.action === "REPLACE") {
          currentUrl = newLoc.pathname + newLoc.search;
          debug("unsubscribe currentUrl ", currentUrl);
        }
      });
      return [
        function() {
          return currentUrl;
        },
        unsubscribe
      ];
    }

    var subscribeUrl = subscribeUrl();
    var getCurrentUrl = subscribeUrl.getCurrentUrl;
    var unsubscribe = subscribeUrl.unsubscribe;
    var reqUrl = location.pathname + location.search;
    debug("reqUrl ", reqUrl);

    getReduxPromise().then(function() {
      var reduxState = escape(JSON.stringify(store.getState()));
      var html;
      /* jshint ignore:start */
      html = ReactDOMServer.renderToString(
        <Provider store={store}>
            { <RouterContext {...renderProps} /> }
          </Provider>
      );
      /* jshint ignore:end */
      debug("using react to create html", ReactDOMServer, Provider, RouterContext);

      var metaHeader = Helmet.rewind();

      if (getCurrentUrl() === reqUrl) {
        debug("rendering ", {
          metaHeader: metaHeader,
          html: html,
          scriptSrcs: scriptSrcs,
          reduxState: reduxState,
          styleSrc: styleSrc
        });
        res.render("index", {
          metaHeader: metaHeader,
          html: html,
          scriptSrcs: scriptSrcs,
          reduxState: reduxState,
          styleSrc: styleSrc
        });
      } else {
        debug("redirecting 302 ", reqUrl);
        // var err = new Error("Error please report this " + reqUrl);
        var err = new Error("Sorry, the page " + reqUrl + " you are looking for was not found.");
        err.status = 404;
        next(err);
      // res.redirect(302, getCurrentUrl())
      }
      unsubscribe();
    })
      .catch(function(err) {
        Helmet.rewind();
        unsubscribe();
        next(err);
      });
  });
}

exports.reduxRender = reduxRender;
