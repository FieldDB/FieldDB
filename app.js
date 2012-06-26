var express     = require('express')
    ,everyauth  = require('everyauth')
    ,util       = require('util')
    ,https      = require('https')
    ,crypto     = require('crypto')
    ,fs         = require('fs')
    ,users      = require('./lib/users');

var authconf = require('./everyauthconfig');

everyauth.twitter
  .consumerKey(authconf.twitter.consumerKey)
  .consumerSecret(authconf.twitter.consumerSecret)
  .findOrCreateUser(function(session, accessToken, accessTokenSecret, twitterUserData) {
    var promise = this.Promise();
    users.findOrCreateByTwitterData(twitterUserData, accessToken, accessTokenSecret, promise);
    return promise;
  })
  .redirectPath('https://ifield.fieldlinguist.com#user');

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
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  app.use(express.errorHandler());
  everyauth.helpExpress(app);
});

port = "3001";
app.listen(port);
console.log("Listening on " + port)

