var express     = require('express')
    ,util       = require('util')
    ,everyauth  = require('everyauth')
    ,https      = require('https')
    ,crypto     = require('crypto')
    ,fs         = require('fs')
    ,users      = require('./lib/users');

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
  app.use(everyauth.middleware());
  app.use(express.static(__dirname + '/public'));
  app.use(app.router);
  app.use(express.errorHandler());
  everyauth.helpExpress(app);
});

app.get('/auth', function (req, res) {
  res.render('auth');
});
app.get('/register', function(req, res){
  res.redirect("https://localhost:3001/register.html");
});


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


port = "3001";
app.listen(port);
console.log("Listening on " + port)
