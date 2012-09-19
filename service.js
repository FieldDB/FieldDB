var express = require('express')
  , authenticationfunctions = require('./lib/userauthentication.js')
  , passport = require('passport')
  , flash = require('connect-flash')
  , util = require('util')
  

var app = express();

// configure Express
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.engine('ejs', require('ejs-locals'));
  app.use(express.logger());
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({
    secret : 'CtlFYUMLl1VdIr35'
  }));
  app.use(flash());
  // Initialize Passport! Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(app.router);
  app.use(express.static(__dirname + '/../../public'));
});


/*Simple route middleware to ensure user is authenticated.
Use this route middleware on any resource that needs to be protected.  If
the request is authenticated (typically via a persistent login session),
the request will proceed.  Otherwise, the user will be redirected to the
login page.*/
function ensureAuthenticated(req, res, next) {
 if (req.isAuthenticated()) {
   return next();
 }
 res.redirect('/login');
}


/*
 * Routes
 */
app.get('/', function(req, res) {
  res.render('index', {
    user : req.user
  });
});

app.get('/account', ensureAuthenticated, function(req, res) {
  res.render('account', {
    user : req.user
  });
});

app.get('/login', function(req, res) {
  res.render('login', {
    user : req.user,
    message : req.flash('error')
  });
});

// POST /login
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
//
//   curl -v -d "username=bob&password=secret" http://127.0.0.1:3000/login
app.post('/login', passport.authenticate('local', {
  failureRedirect : '/login',
  failureFlash : true
}), function(req, res) {
  res.redirect('/');
});
  
// POST /login
//   This is an alternative implementation that uses a custom callback to
//   acheive the same functionality.
/*
app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err) }
    if (!user) {
      req.flash('error', info.message);
      return res.redirect('/login')
    }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.redirect('/users/' + user.username);
    });
  })(req, res, next);
});
*/

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

app.listen(3000);



