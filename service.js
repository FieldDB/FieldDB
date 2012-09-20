var https = require('https')
  , express = require('express')
  , authenticationfunctions = require('./lib/userauthentication.js')
  , node_config = require("./lib/nodeconfig_local")
  , passport = require('passport')
  , flash = require('connect-flash')
  , fs = require('fs')
  , util = require('util');

//read in the specified filenames as the security key and certificate
node_config.httpsOptions.key = fs.readFileSync(node_config.httpsOptions.key);
node_config.httpsOptions.cert = fs.readFileSync(node_config.httpsOptions.cert);


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


/*
 * Routes
 */

/**
 * Responds to requests for login, if sucessful replies with the user's details
 * as json
 */
app.post('/login', function(req, res) {
  authenticationfunctions.authenticateUser(req.body.username, req.body.password, req, function(err, user, info) {
    var returndata = {};
    if (err) {
      console.log(new Date() + " There was an error in the authenticationfunctions.authenticateUser:\n"+ util.inspect(err));
      returndata.errors = [info.message];
    }
    if (!user) {
      returndata.errors = [info.message];
    }else{
      returndata.user = user;
      delete returndata.user.serverlogs;
      returndata.info = [info.message];
      console.log(new Date() + " Returning the existing user as json:\n"+util.inspect(user));
    }
    res.send(returndata);
  });

});


/**
 * Takes in the http request and response. Calls the registerNewUser function in
 * the authenticationfunctions library. The registerNewUser function takes in a
 * method (local/twitter/facebook/etc) the http request, and a function to call
 * after registerNewUer has completed. In this case the function is expected to
 * be called with an err (null if no error), user (null if no user), and an info
 * object containing a message which can be show to the calling application
 * which sent the post request.
 * 
 * If there is an error, the info is added to the 'errors' attribute of the
 * returned json.
 * 
 * If there is a user, the user is added to the 'user' attribute of the returned
 * json. If there is no user, the info is again added to the 'errors' attribute
 * of the returned json.
 * 
 * Finally the returndata json is sent to the calling application via the response.
 */
app.post('/register', function(req, res ) {
  
  authenticationfunctions.registerNewUser('local', req, function(err, user, info) {
    var returndata = {};
    if (err) {
      console.log(new Date() + " There was an error in the authenticationfunctions.registerNewUser"+ util.inspect(err));
      returndata.errors = [info.message];
    }
    if (!user) {
      returndata.errors = [info.message];
    }else{
      returndata.user = user;
      returndata.info = [info.message];
      console.log(new Date() + " Returning the newly built user: "+util.inspect(user));
    }
    res.send(returndata);

  });
});

/**
 * @deprecated not needed for an authentication webservice
 */
app.get('/', function(req, res) {
  res.render('index', {
    user : req.user
  });
});

/*
 * Simple route middleware to ensure user is authenticated. Use this route
 * middleware on any resource that needs to be protected. If the request is
 * authenticated (typically via a persistent login session), the request will
 * proceed. Otherwise, the user will be redirected to the login page.
 *  
 * @deprecated  not needed for an authentication webservice
 */
//function ensureAuthenticated(req, res, next) {
// if (req.isAuthenticated()) {
//   return next();
// }
// res.redirect('/login');
//}

/**
 * @deprecated  not needed for an authentication webservice
 */
//app.get('/account', ensureAuthenticated, function(req, res) {
//  res.render('account', {
//    user : req.user
//  });
//});

/**
 * @deprecated  not needed for an authentication webservice
 */
app.get('/login', function(req, res) {
  res.render('login', {
    user : req.user,
    message : req.flash('error')
  });
});
/**
 * @deprecated  not needed for an authentication webservice
 */
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

https.createServer(node_config.httpsOptions, app).listen(node_config.port); 

//app.listen(node_config.port);
console.log("Express server listening on port %d", node_config.port);


