var express = require('express');

//Everyauth and express keep routing to http rather than https
//http://stackoverflow.com/questions/7450940/automatic-https-connection-redirect-with-node-js-express
var http = express.createServer();
http.get('*',function(req,res){  
    res.redirect('https://ifield.fieldlinguist.com'+req.url)
})
http.listen(8080);
