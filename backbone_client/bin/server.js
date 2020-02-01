// var compression = require("compression");
var express = require("express");
var debug = require("debug")("server");
// var favicon = require("serve-favicon");
var path = require("path");

var app = express();

// app.use(favicon(__dirname + "/public/favicon.ico"));
app.use(function(req, res, next) {
  debug(`${req.method} ${req.path}`);
  next();
});
app.use(express.static(path.join(__dirname, "../")));
// app.use(compression())

module.exports = app;
