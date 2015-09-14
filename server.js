var https = require("https");
var express = require("express");
var fs = require("fs");

var deploy_target = process.env.NODE_DEPLOY_TARGET || "local";
// deploy_target = "devserver"; 
var node_config = require("./lib/nodeconfig_local"); //always use local node config
var couch_keys = require("./lib/couchkeys_" + deploy_target);

var activityHeatMap = require("./routes/activity").activityHeatMap;
var getUserMask = require("./routes/user").getUserMask;
var getCorpusMask = require("./routes/corpus").getCorpusMask;

var connect = node_config.usersDbConnection.protocol + couch_keys.username + ":" +
  couch_keys.password + "@" + node_config.usersDbConnection.domain +
  ":" + node_config.usersDbConnection.port +
  node_config.usersDbConnection.path;
var nano = require("nano")(connect);


var app = express();

// var errorHandler = require("express-error-handler"),
//   handler = errorHandler({
//     static: {
//       "404": "404.html"
//     }
//   });

// configure Express
app.configure(function() {
  app.set("views", __dirname + "/views");
  app.set("view engine", "jade");
  app.use(express.favicon());
  app.use(express.logger());
  app.use(express.static(__dirname + "/public"));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({
    secret: "CtlFYUMLlrwr1VdIr35"
  }));
  // app.use(errorHandler.httpError(404) );
  app.use(app.router);
});


/*
 * Routes
 */
app.get("/activity/:dbname", function(req, res) {
  activityHeatMap(req.params.dbname, nano).then(function(heatMapData) {
    res.send(heatMapData);
  }, function() {
    res.status(404);
    res.send({});
  }).fail(function() {
    res.status(500);
    res.status(404);
    res.redirect("404.html");
  });
});

app.get("/db/:dbname", function(req, res) {
  getCorpusMask(req.params.dbname, nano).then(function(mask) {
    if (mask && typeof mask.toJSON === "function") {
      mask = mask.toJSON();
    }
    res.render("corpus", {
      corpusMask: mask
    });
  }, function() {
    res.status(404);
    res.redirect("404.html");
  }).fail(function() {
    res.status(404);
    res.redirect("500.html");
  });
});

app.get("/:user/:corpus/:dbname", function(req, res) {
  getCorpusMask(req.params.dbname).then(function(mask) {
    if (mask && typeof mask.toJSON === "function") {
      mask = mask.toJSON();
    }
    res.render("corpus", mask);
  }, function() {
    res.status(404);
    res.redirect("404.html");
  }).fail(function() {
    res.status(500);
    res.redirect("500.html");
  });
});

app.get("/:user/:dbname", function(req, res) {
  getCorpusMask(req.params.dbname).then(function(mask) {
    if (mask && typeof mask.toJSON === "function") {
      mask = mask.toJSON();
    }
    res.render("user", mask);
  }, function() {
    res.status(404);
    res.redirect("404.html");
  }).fail(function() {
    res.status(500);
    res.redirect("500.html");
  });
});


app.get("/:username", function(req, res) {

  var html5Routes = req.params.username;
  var pageNavs = ["tutorial", "people", "contact", "home"];
  if (pageNavs.indexOf(html5Routes) > -1) {
    res.redirect("/#/" + html5Routes);
    return;
  }

  getUserMask(req.params.username, nano, node_config.usersDbConnection.dbname).then(function(mask) {
    mask = mask;
    res.render("user", {
      userMask: mask
    });
  }, function() {
    res.status(404);
    res.redirect("404.html");
  }).fail(function() {
    res.status(500);
    res.redirect("500.html");
  });
});


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
