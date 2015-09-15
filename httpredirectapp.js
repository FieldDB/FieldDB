var deploy_target = process.env.NODE_DEPLOY_TARGET || "local";

var http = require('http'),
  express = require('express'),
  node_config = require("./lib/nodeconfig_" + deploy_target);

//Everyauth and express keep routing to http rather than https
//http://stackoverflow.com/questions/7450940/automatic-https-connection-redirect-with-node-js-express
var app = express();
app.get('*', function(req, res) {
  res.redirect(node_config.redirectURLforHTTPS + req.url);
});
http.createServer(app).listen("3182");
