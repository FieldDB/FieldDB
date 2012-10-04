var https = require('https')
  , express = require('express')
  , node_config = require("./lib/nodeconfig_devserver")
  , fs = require('fs')
  , util = require('util');

//read in the specified filenames as the security key and certificate
node_config.httpsOptions.key = fs.readFileSync(node_config.httpsOptions.key);
node_config.httpsOptions.cert = fs.readFileSync(node_config.httpsOptions.cert);


var app = express();

// configure Express
app.configure(function() {
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({
    secret : 'CtlFYUMLlrwr1VdIr35'
  }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});


/*
 * Routes
 */



https.createServer(node_config.httpsOptions, app).listen(node_config.port); 

console.log(new Date()+" Node+Exress server listening on port %d", node_config.port);
