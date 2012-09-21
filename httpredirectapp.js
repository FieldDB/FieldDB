var http = require('http')
    , express = require('express')
    , node_config = require("./lib/nodeconfig_production");

//Everyauth and express keep routing to http rather than https
//http://stackoverflow.com/questions/7450940/automatic-https-connection-redirect-with-node-js-express
var app = express();
app.get('*',function(req,res){  
    res.redirect(node_config.apphttpsdomain+req.url);
});
http.createServer(app).listen("3182"); 

