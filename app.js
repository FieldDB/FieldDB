var express     = require('express')
    ,util       = require('util')
    ,node_config = require("./lib/nodeconfig_devserver")

    ,mongooseAuth  = require('mongoose-auth')
    ,Users = require('./lib/restfullmongooseusers.js')
    
    ,https      = require('https')
    ,crypto     = require('crypto')
    ,fs         = require('fs');

//read in the specified filenames as the security key and certificate
node_config.httpsOptions.key = fs.readFileSync(node_config.httpsOptions.key);
node_config.httpsOptions.cert = fs.readFileSync(node_config.httpsOptions.cert);
var app = express.createServer(node_config.httpsOptions);

//http://stackoverflow.com/questions/11181546/node-js-express-cross-domain-scripting%20
//app.use(function(req, res, next) {
//  res.header("Access-Control-Allow-Origin", "https://ilanguage.iriscouch.com");
//  res.header("Access-Control-Allow-Headers", "X-Requested-With");
//  next();
//});

app.configure(function() {
  app.use(express.logger());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({secret: "90ndsj9dfdsfwewfead3"}));
  app.use(express.static(__dirname + '/public'));
//  app.use(app.router); //do not turn this on, see notes on https://github.com/bnoguchi/mongoose-auth/
  app.use(mongooseAuth.middleware());
  app.use(express.errorHandler());
});

//http://stackoverflow.com/questions/11181546/node-js-express-cross-domain-scripting%20
//app.all('/', function(req, res, next) {
//  res.header("Access-Control-Allow-Origin", "https://ilanguage.iriscouch.com");
//  res.header("Access-Control-Allow-Headers", "X-Requested-With");
//  next();
// });

app.post('/usernamelogin/:username', function(req,res){
  console.log("User wants to log in "+req.params.username);
  // TODO Look up username in mongodb, find their login service, and redirect them to
  // that service. if username and password, reply to backbone with a message to
  // show login and password
  
  res.redirect('/login');
});
app.get('/:usergeneric/:corpusordatalist', function(req, res){
  console.log("hi");
  var usergeneric = req.params.usergeneric
    , corpusordatalist = req.params.corpusordatalist;
  var corpusid = "";
  var datalistid = "";
  //TOOD look up the usergeneric, then look up the corpus id so that the backbone router will show/fetch that corpus, if it is a datalist, do that instead
//  res.redirect(node_config.apphttpsdomain+'#corpus/'+corpusid);
//  res.redirect("https://localhost:3183\#data/"+req.params.datalistid);
  res.redirect("https://ifield.fieldlinguist.com\#corpus/"+req.params.corpusid);
});

app.get('/:usergeneric', function(req, res){
  res.redirect("https://ifield.fieldlinguist.com\#user/"+req.params.usergeneric);
});


mongooseAuth.helpExpress(app);

app.listen(node_config.port);
console.log("Listening on " + node_config.apphttpsdomain+ "\n"+new Date());
