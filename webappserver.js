var express = require('express')
  , passport = require('passport')
  , htts = require('https')
  , OAuth = require('oauth').OAuth
  , crypto = require('crypto')
  , util = require('util')
  , fs = require('fs')
  , LocalStrategy = require('passport-local').Strategy;
  
//var couchkeys = require('./couchkeys');

/**
 * Prepare to use Twitter as a possible OAuth
 */
var twitterkeys = require('./twitterkeys');
var oa = new OAuth(
    "https://api.twitter.com/oauth/request_token",
    "https://api.twitter.com/oauth/access_token",
    twitterkeys.consumerKey,
    twitterkeys.consumerSecret,
    "1.0",
    "https://ifield.fieldlinguist.com/auth/twitter/callback",
    "HMAC-SHA1"
  );



var httpsOptions ={
  key: fs.readFileSync('ifield.key'),
  cert: fs.readFileSync('ifield.crt')};
var app = express.createServer(httpsOptions);

// configure Express
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({ secret: 'keyboard cat' }));
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.get('/auth/twitter', function(req, res){
  oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
    if (error) {
      console.log(error);
      res.send("Yeah no. Didn't work.");
    }
    else {
      req.session.oauth = {};
      req.session.oauth.token = oauth_token;
      //console.log('oauth.token: ' + req.session.oauth.token);
      req.session.oauth.token_secret = oauth_token_secret;
      //console.log('oauth.token_secret: ' + req.session.oauth.token_secret);
      res.redirect('https://twitter.com/oauth/authenticate?oauth_token='+oauth_token)
  }
  });
});
app.get('/auth/twitter/callback', function(req, res, next){
  if (req.session.oauth) {
    req.session.oauth.verifier = req.query.oauth_verifier;
    var oauth = req.session.oauth;

    oa.getOAuthAccessToken(oauth.token,oauth.token_secret,oauth.verifier, 
    function(error, oauth_access_token, oauth_access_token_secret, results){
      if (error){
        console.log(error);
        res.send("Yeah something broke.");
      } else {
        req.session.oauth.access_token = oauth_access_token;
        req.session.oauth,access_token_secret = oauth_access_token_secret;
        console.log(results);
	//{ user_id: '615219118', screen_name: 'EdSapir' }
        //res.send("Redirecting you to your user page.");
	res.redirect("index.html#user/"+results.screen_name);
      }
    }
    );
  } else
    next(new Error("you're not supposed to be here."))
});

var port = process.env.PORT || 3001;
app.listen(port, function() {
  console.log("Listening on " + port);
});

