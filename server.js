var https = require("https");
var express = require("express");
var favicon = require("serve-favicon");
var logger = require("morgan");
var methodOverride = require("method-override");
var session = require("express-session");
var bodyParser = require("body-parser");
var errorHandler = require("errorhandler");
var consolidate = require("consolidate");

var path = require("path");
var fs = require("fs");

var deploy_target = process.env.NODE_DEPLOY_TARGET || "local";
// deploy_target = "devserver"; 
var node_config = require("./lib/nodeconfig_local"); //always use local node config
var couch_keys = require("./lib/couchkeys_" + deploy_target);

var activityHeatMap = require("./routes/activity").activityHeatMap;
var getUserMask = require("./routes/user").getUserMask;
var getCorpusMask = require("./routes/corpus").getCorpusMask;
var getCorpusMaskFromTitleAsUrl = require("./routes/corpus").getCorpusMaskFromTitleAsUrl;

var corpusWebServiceUrl = node_config.corpusWebService.protocol +
  couch_keys.username + ":" +
  couch_keys.password + "@" +
  node_config.corpusWebService.domain +
  ":" + node_config.corpusWebService.port +
  node_config.corpusWebService.path;

var acceptSelfSignedCertificates = {
  strictSSL: false
};
if (deploy_target === "production") {
  acceptSelfSignedCertificates = {};
}
var nano = require("nano")({
  url: corpusWebServiceUrl,
  requestDefaults: acceptSelfSignedCertificates
});


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
  secret: node_config.session_key
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(path.join(__dirname, "public")));

/*
 * Routes
 */
app.get("/activity/:dbname", function(req, res) {
  activityHeatMap(req.params.dbname, nano).then(function(heatMapData) {
    res.send(heatMapData);
  }, function(reason) {
    res.status(reason.status);
    res.send({});
  }).fail(function(exception) {
    console.log(exception.stack);
    res.status(500);
    res.render("500");
  });
});

app.get("/db/:dbname", function(req, res) {
  getCorpusMask(req.params.dbname, nano).then(function(mask) {
    res.render("corpus", {
      corpusMask: mask
    });
  }, function(reason) {
    res.status(reason.status);
    if (reason.status >= 500) {
      res.render("500", {
        userFriendlyErrors: reason.userFriendlyErrors
      });
    } else {
      res.render("404", {
        userFriendlyErrors: reason.userFriendlyErrors
      });
    }
  }).fail(function(exception) {
    console.log(exception.stack);
    res.status(404);
    res.render("500");
  });
});

app.get("/:username/:anything/:dbname", function(req, res) {
  res.redirect("/" + req.params.username + "/" + req.params.dbname);
});

app.get("/:username/:titleAsUrl", function(req, res) {
  if (req.params.titleAsUrl.indexOf(req.params.username) === 0) {
    getCorpusMask(req.params.titleAsUrl, nano).then(function(mask) {
      res.render("corpus", {
        corpusMask: mask
      });
    }, function(reason) {
      res.status(reason.status);
      if (reason.status >= 500) {
        res.render("500", {
          status: reason.status,
          userFriendlyErrors: reason.userFriendlyErrors
        });
      } else {
        res.render("404", {
          status: reason.status,
          userFriendlyErrors: reason.userFriendlyErrors
        });
      }
    }).fail(function(exception) {
      console.log(exception.stack);
      res.status(404);
      res.render("500");
    });
    return;
  }
  getUserMask(req.params.username, nano, node_config.corpusWebService.users).then(function(userMask) {
    getCorpusMaskFromTitleAsUrl(userMask, req.params.titleAsUrl, nano).then(function(mask) {
      res.render("corpus", {
        corpusMask: mask
      });
    }, function(reason) {
      res.status(reason.status);
      if (reason.status >= 500) {
        res.render("500", {
          status: reason.status,
          userFriendlyErrors: reason.userFriendlyErrors,
          tryLookingHere: "/" + req.params.username
        });
      } else {
        res.render("404", {
          status: reason.status,
          userFriendlyErrors: reason.userFriendlyErrors,
          tryLookingHere: "/" + req.params.username
        });
      }
    }).fail(function(exception) {
      console.log(exception.stack);
      res.status(404);
      res.render("500");
    });
  }, function(reason) {
    res.status(reason.status);
    res.render("404", {
      userFriendlyErrors: reason.userFriendlyErrors
    });
  }).fail(function(exception) {
    console.log(exception.stack);
    res.status(500);
    res.render("500");
  });
});

app.get("/:username", function(req, res) {

  var html5Routes = req.params.username;
  var pageNavs = ["tutorial", "people", "contact", "home"];
  if (pageNavs.indexOf(html5Routes) > -1) {
    res.redirect("/#/" + html5Routes);
    return;
  }

  getUserMask(req.params.username, nano, node_config.corpusWebService.users).then(function(mask) {
    res.render("user", {
      userMask: mask
    });
  }, function(reason) {
    res.status(reason.status);
    if (reason.status >= 500) {
      res.render("500", {
        status: reason.status,
        userFriendlyErrors: reason.userFriendlyErrors,
      });
    } else {
      res.render("404", {
        status: reason.status,
        userFriendlyErrors: reason.userFriendlyErrors,
      });
    }
  }).fail(function(exception) {
    console.log(exception.stack);
    res.status(500);
    res.render("500");
  });
});

// error handling middleware should be loaded after the loading the routes
if ("production" !== app.get("env")) {
  app.use(errorHandler());
}


console.log("process.env.NODE_DEPLOY_TARGET " + process.env.NODE_DEPLOY_TARGET);
if (process.env.NODE_DEPLOY_TARGET === "production") {
  app.listen(node_config.port);
  console.log("Running in production mode behind an Nginx proxy, Listening on http port %d", node_config.port);
} else {
  //read in the specified filenames as the security key and certificate
  // config.httpsOptions.key = FileSystem.readFileSync(config.httpsOptions.key);
  // config.httpsOptions.cert = FileSystem.readFileSync(config.httpsOptions.cert);
  node_config.httpsOptions.key = fs.readFileSync(node_config.httpsOptions.key);
  node_config.httpsOptions.cert = fs.readFileSync(node_config.httpsOptions.cert);

  https.createServer(node_config.httpsOptions, app).listen(node_config.port);
  // https.createServer(config.httpsOptions, AuthWebService).listen(node_config.port, function() {
  console.log("Listening on https port %d", node_config.port);
  // });
}

exports.app = app;
