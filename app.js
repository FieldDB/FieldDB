var express     = require('express')
    ,everyauth  = require('everyauth')
    ,util       = require('util')
    ,https      = require('https')
    ,crypto     = require('crypto')
    ,fs         = require('fs')
    ,users      = require('./lib/users');

var apphttpsdomain = "https://localhost:3001";
var authconf = require('./everyauthconfig');

everyauth.debug = true;


var usersById = {};
var nextUserId = 0;

function addUser(source, sourceUser) {
  var user;
  if (arguments.length === 1) { // password-based
    user = sourceUser = source;
    user.id = ++nextUserId;
    return usersById[nextUserId] = user;
  } else { // non-password-based
    user = usersById[++nextUserId] = {
      id : nextUserId
    };
    user[source] = sourceUser;
  }
  return user;
}

var usersByDropboxId = {};
var usersByFbId = {};
var usersByGhId = {};
var usersByTwitId = {};
var usersByGoogleId = {};
var usersByYahooId = {};
var usersByGoogleHybridId = {};
var usersByOpenId = {};
var usersByEvernoteId = {};
var usersByLogin = {
  'brian@example.com' : addUser({
    login : 'brian@example.com',
    password : 'password'
  })
};

everyauth.everymodule.findUserById(function(id, callback) {
  callback(null, usersById[id]);
});

everyauth.twitter.consumerKey(authconf.twitter.consumerKey).consumerSecret(
    authconf.twitter.consumerSecret).findOrCreateUser(
    function(session, accessToken, accessTokenSecret, twitterUserData) {
      var promise = this.Promise();
      users.findOrCreateByTwitterData(twitterUserData, accessToken,
          accessTokenSecret, promise);
      return promise;
    }).redirectPath(apphttpsdomain+'#user');


everyauth.password.loginWith('email').getLoginPath('/login').postLoginPath(
    '/login').loginView('login.jade')
//  .loginLocals({
//    title: 'Login'
//  })
//  .loginLocals(function (req, res) {
//    return {
//      title: 'Login'
//    }
//  })
.loginLocals(function(req, res, done) {
  setTimeout(function() {
    done(null, {
      title : 'Async login'
    });
  }, 200);
}).authenticate(function(login, password) {
  var errors = [];
  if (!login)
    errors.push('Missing login');
  if (!password)
    errors.push('Missing password');
  if (errors.length)
    return errors;
  var user = usersByLogin[login];
  if (!user)
    return [ 'Login failed' ];
  if (user.password !== password)
    return [ 'Login failed' ];
  return user;
})

.getRegisterPath('/register').postRegisterPath('/register').registerView(
    'register.jade')
//  .registerLocals({
//    title: 'Register'
//  })
//  .registerLocals(function (req, res) {
//    return {
//      title: 'Sync Register'
//    }
//  })
.registerLocals(function(req, res, done) {
  setTimeout(function() {
    done(null, {
      title : 'Async Register'
    });
  }, 200);
}).validateRegistration(function(newUserAttrs, errors) {
  var login = newUserAttrs.login;
  if (usersByLogin[login])
    errors.push('Login already taken');
  return errors;
}).registerUser(function(newUserAttrs) {
  var login = newUserAttrs[this.loginKey()];
  return usersByLogin[login] = addUser(newUserAttrs);
})
.loginSuccessRedirect(apphttpsdomain+'#user').registerSuccessRedirect(apphttpsdomain+'#user');


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
app.configure( function () {
  app.set('view engine', 'jade');
  app.set('views', 'views');
});

app.get('/auth', function (req, res) {
  res.render('auth');
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
