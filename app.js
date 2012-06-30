var express     = require('express')
    ,util       = require('util')
    
    ,everyauth  = require('everyauth')
    ,Promise        = everyauth.Promise
    
    ,mongoose   = require('mongoose')
    ,Schema         = mongoose.Schema
    ,ObjectId       = mongoose.SchemaTypes.ObjectId

    ,mongooseAuth  = require('mongoose-auth')
    ,Users = require('./lib/restfullmongooseusers.js')
    
    ,https      = require('https')
    ,crypto     = require('crypto')
    ,fs         = require('fs');

var apphttpsdomain = "https://localhost:3001";

var httpsOptions ={
    key: fs.readFileSync('ifield.key'),
    cert: fs.readFileSync('ifield.crt')};
var app = express.createServer(httpsOptions);
app.configure(function() {
  app.use(express.logger());
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({secret: "90ndsj9dfdsfwewfead3"}));
//  app.use(everyauth.middleware()); //replaced by mongooseAuth
  app.use(express.static(__dirname + '/public'));
//  app.use(app.router); //see notes on https://github.com/bnoguchi/mongoose-auth/
  app.use(mongooseAuth.middleware());
  app.use(express.errorHandler());
//  everyauth.helpExpress(app); //replaced by mongooseauth
});

//app.get('/auth', function (req, res) {
//  res.render('auth');
//});
//app.get('/register', function(req, res){
//  res.redirect("https://localhost:3001/register.html");
//});




app.get('/:usergeneric/:corpusordatalist', function(req, res){
  console.log("hi");
  var usergeneric = req.params.usergeneric
    , corpusordatalist = req.params.corpusordatalist;
  var corpusid = "";
  var datalistid = "";
  //TOOD look up the usergeneric, then look up the corpus id so that the backbone router will show/fetch that corpus, if it is a datalist, do that instead
//  res.redirect(apphttpsdomain+'#corpus/'+corpusid);
//  res.redirect("https://localhost:3001\#data/"+req.params.datalistid);
  res.redirect("https://localhost:3001\#corpus/"+req.params.corpusid);
});

app.get('/:usergeneric', function(req, res){
  console.log("Got a route");
  res.redirect("https://localhost:3001\#user/"+req.params.usergeneric);
});


mongooseAuth.helpExpress(app);

port = "3001";
app.listen(port);
console.log("Listening on " + port)
