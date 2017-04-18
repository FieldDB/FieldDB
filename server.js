var compression = require("compression");
var config = require("config");
var express = require("express");
var debug = require("debug")("server");
var favicon = require("serve-favicon");
var logger = require("morgan");
var methodOverride = require("method-override");
var session = require("express-session");
var bodyParser = require("body-parser");
var errorHandler = require("./lib/error-handler").errorHandler;
var consolidate = require("consolidate");
var path = require("path");

var activityHeatMap = require("./routes/activity").activityHeatMap;
var getUserMask = require("./routes/user").getUserMask;
var getCorpusMask = require("./routes/corpus").getCorpusMask;
var getCorpusMaskFromTitleAsUrl = require("./routes/corpus").getCorpusMaskFromTitleAsUrl;
var reduxRender = require("./routes/react-render").reduxRender;
var mockAPI = require('./app/server/mock_api');
var acceptSelfSignedCertificates = {
  strictSSL: false
};
if (process.env.NODE_ENV === "production") {
  acceptSelfSignedCertificates = {};
}

var app = express();

// configure Express
app.engine("html", consolidate.handlebars);
app.set("view engine", ".html");
app.set("views", path.join(__dirname, "views"));
app.use(favicon(__dirname + "/public/favicon.ico"));
app.use(logger("common"));
app.use(methodOverride());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: config.session_key
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(path.join(__dirname, "public")));


app.use(compression())

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist', 'public')))
} else {
  app.use('/assets', express.static(path.join(__dirname, 'app', 'assets')))
  app.use(express.static(path.join(__dirname, 'dist')))
}
/*
 * Routes
 */

app.get('/api/corpora', (req, res) => {
  console.log('returning mockAPI corpora', mockAPI.corpora);
  res.send(mockAPI.corpora)
});

app.get("/api/activity/:dbname", function(req, res, next) {
  if (!req.params.dbname) {
    return next();
  }
  activityHeatMap(req.params.dbname, next).then(function(heatMapData) {
    res.json(heatMapData);
  }, next).fail(next);
});

app.get("/api/corpora/:dbname", function(req, res, next) {
  getCorpusMask(req.params.dbname, next).then(function(corpusMask) {
    var corpus = corpusMask.toJSON();
    corpus.lexicon = {
      url: config.lexicon.public.url
    };
    corpus.search = {
      url: config.search.public.url
    };
    corpus.speech = {
      url: config.speech.public.url
    };
    corpus.corpus = {
      url: config.corpus.public.url
    };
    corpus.team.name = corpusMask.team.name;
    console.log("Corpus mask team ", corpus.team);
    res.json(corpus);
  }, next).fail(next);
});

app.get("/api/users/:username", function(req, res, next) {
  var html5Routes = req.params.username;
  var pageNavs = ["tutorial", "people", "contact", "home"];
  if (pageNavs.indexOf(html5Routes) > -1) {
    res.redirect("/#/" + html5Routes);
    return;
  }

  getUserMask(req.params.username, next).then(function(userMask) {
    console.log(userMask);
    var user = userMask.toJSON();
    user.name = userMask.name;
    user.username = user.username || userMask.id;
    user.corpora.map(function(connection) {
      connection.owner = userMask.corpora[connection.dbname].owner;
    });
    res.json(user);
  }, next).fail(next);
});

app.get("/api/:username/:titleAsUrl", function(req, res, next) {
  if (req.params.titleAsUrl.indexOf(req.params.username) === 0) {
    getCorpusMask(req.params.titleAsUrl, next).then(function(corpus) {
      // debug('replying with getCorpusMask', corpus);
      corpus.lexicon = {
        url: config.lexicon.public.url
      };
      corpus.search = {
        url: config.search.public.url
      };
      corpus.speech = {
        url: config.speech.public.url
      };
      if (req.session && req.headers['x-requested-with'] === 'XMLHttpRequest') {
        return res.json({
          corpusMask: corpus
        });
      }
      res.json(corpus);
    }, next).fail(next);
    return;
  }
  getUserMask(req.params.username, next).then(function(userMask) {
    getCorpusMaskFromTitleAsUrl(userMask, req.params.titleAsUrl, next).then(function(corpus) {
      corpus.lexicon = {
        url: config.lexicon.public.url
      };
      corpus.search = {
        url: config.search.public.url
      };
      corpus.speech = {
        url: config.speech.public.url
      };
      debug('replying with getCorpusMaskFromTitleAsUrl ', corpus);
      if (req.session && req.headers['x-requested-with'] === 'XMLHttpRequest') {
        return res.json({
          corpusMask: corpus
        });
      }
      res.json(corpus);
    }, next).fail(next);
  }, next).fail(next);
});

app.get("*", reduxRender);

// error handling middleware should be loaded after the loading the routes
app.use(errorHandler);

module.exports = app;
