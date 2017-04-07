var config = require("config");
var express = require("express");
var debug = require("debug")("server");
var favicon = require("serve-favicon");
var logger = require("morgan");
var methodOverride = require("method-override");
var session = require("express-session");
var bodyParser = require("body-parser");
var errorHandler = require("./middleware/error-handler").errorHandler;
var consolidate = require("consolidate");
var path = require("path");

var activityRoutes = require("./routes/activity").router;
var corpusRoutes = require("./routes/corpus").router;
var userRoutes = require("./routes/user").router;

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

/*
 * Routes
 */
app.use('/activity', activityRoutes);
app.use('/', corpusRoutes);
app.use('/', userRoutes);

// error handling middleware should be loaded after the loading the routes
app.use(errorHandler);

module.exports = app;
