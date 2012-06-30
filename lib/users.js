var cradle        = require('cradle')
      ,everyauth  = require('everyauth')
      ,_          = require('underscore')
      ,Backbone   = require('backbone')
      ,MotherMayI = require('mothermayi').MotherMayI
      ,redis      = require('redis')
      ,util       = require('util')
      ,bcrypt     = require('bcrypt');

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




// Test creating a Backbone model 
console.log("Loading the Users");
var b = new Backbone.Model({name: "hi"});
console.log(util.inspect(b));

var couchkeys = require('../couchkeys');
// Test inserting the Backbone model into CouchDB
var c = new cradle.Connection("http://localhost", 5984, {
  auth: { username: couchkeys.username, password: couchkeys.password}
});
c.database('test_insert').save(b.toJSON(), function(err, res) {
  if (err) {
    console.log("ERROR inserting into CouchDB:");
    console.log(util.inspect(err));
  } else {
    console.log('Inserted into CouchDB:');
    console.log(util.inspect(res));
  }
});

// Test Redis
console.log("Loading redis permissions");
//https://github.com/mranney/node_redis/blob/master/examples/web_server.js
var mayi = new MotherMayI('localhost', 6379, 0);
// sapir the owner of Quechua Corpus is granted these actions 
mayi.grant('user:sapir', 'admin', 'Quechua Corpus', function(success) {});
mayi.grant('user:sapir', 'read', 'Quechua Corpus', function(success) {});
mayi.grant('user:sapir', 'edit', 'Quechua Corpus', function(success) {});
mayi.grant('user:sapir', 'comment', 'Quechua Corpus', function(success) {});
mayi.grant('user:sapir', 'export', 'Quechua Corpus', function(success) {});
mayi.grant('user:sapir', 'read', 'Quechua Corpus:datum', function(success) {});
mayi.grant('user:sapir', 'addNew', 'Quechua Corpus:datum', function(success) {});
mayi.grant('user:sapir', 'edit', 'Quechua Corpus:datum', function(success) {});
mayi.grant('user:sapir', 'comment', 'Quechua Corpus:datum', function(success) {});
mayi.grant('user:sapir', 'export', 'Quechua Corpus:datum', function(success) {});
mayi.grant('user:sapir', 'read', 'Quechua Corpus:session', function(success) {});
mayi.grant('user:sapir', 'addNew', 'Quechua Corpus:session', function(success) {});
mayi.grant('user:sapir', 'edit', 'Quechua Corpus:session', function(success) {});
mayi.grant('user:sapir', 'comment', 'Quechua Corpus:session', function(success) {});
mayi.grant('user:sapir', 'export', 'Quechua Corpus:session', function(success) {});
mayi.grant('user:sapir', 'read', 'Quechua Corpus:datalist', function(success) {});
mayi.grant('user:sapir', 'addNew', 'Quechua Corpus:datalist', function(success) {});
mayi.grant('user:sapir', 'edit', 'Quechua Corpus:datalist', function(success) {});
mayi.grant('user:sapir', 'comment', 'Quechua Corpus:datalist', function(success) {});
mayi.grant('user:sapir', 'export', 'Quechua Corpus:datalist', function(success) {});

//tillohash the consultant of Quechua Corpus is granted these actions
// mayi.grant('user:tillohash', 'admin', 'Quechua Corpus', function(success) {});
mayi.grant('user:tillohash', 'read', 'Quechua Corpus', function(success) {});
mayi.grant('user:tillohash', 'edit', 'Quechua Corpus', function(success) {});
mayi.grant('user:tillohash', 'comment', 'Quechua Corpus', function(success) {});
// mayi.grant('user:tillohash', 'export', 'Quechua Corpus', function(success) {});
mayi.grant('user:tillohash', 'read', 'Quechua Corpus:datum', function(success) {});
// mayi.grant('user:tillohash', 'addNew', 'Quechua Corpus:datum', function(success) {});
mayi.grant('user:tillohash', 'edit', 'Quechua Corpus:datum', function(success) {});
mayi.grant('user:tillohash', 'comment', 'Quechua Corpus:datum', function(success) {});
mayi.grant('user:tillohash', 'export', 'Quechua Corpus:datum', function(success) {});
mayi.grant('user:tillohash', 'read', 'Quechua Corpus:session', function(success) {});
mayi.grant('user:tillohash', 'addNew', 'Quechua Corpus:session', function(success) {});
mayi.grant('user:tillohash', 'edit', 'Quechua Corpus:session', function(success) {});
mayi.grant('user:tillohash', 'comment', 'Quechua Corpus:session', function(success) {});
mayi.grant('user:tillohash', 'export', 'Quechua Corpus:session', function(success) {});
mayi.grant('user:tillohash', 'read', 'Quechua Corpus:datalist', function(success) {});
mayi.grant('user:tillohash', 'addNew', 'Quechua Corpus:datalist', function(success) {});
mayi.grant('user:tillohash', 'edit', 'Quechua Corpus:datalist', function(success) {});
mayi.grant('user:tillohash', 'comment', 'Quechua Corpus:datalist', function(success) {});
mayi.grant('user:tillohash', 'export', 'Quechua Corpus:datalist', function(success) {});

//public user interested in Quechua Corpus is granted these actions
// mayi.grant('user:public', 'admin', 'Quechua Corpus', function(success) {});
mayi.grant('user:public', 'read', 'Quechua Corpus', function(success) {});
// mayi.grant('user:public', 'edit', 'Quechua Corpus', function(success) {});
mayi.grant('user:public', 'comment', 'Quechua Corpus', function(success) {});
// mayi.grant('user:public', 'export', 'Quechua Corpus', function(success) {});
mayi.grant('user:public', 'read', 'Quechua Corpus:datum', function(success) {});
// mayi.grant('user:public', 'addNew', 'Quechua Corpus:datum', function(success) {});
// mayi.grant('user:public', 'edit', 'Quechua Corpus:datum', function(success) {});
mayi.grant('user:public', 'comment', 'Quechua Corpus:datum', function(success) {});
// mayi.grant('user:public', 'export', 'Quechua Corpus:datum', function(success) {});
mayi.grant('user:public', 'read', 'Quechua Corpus:session', function(success) {});
// mayi.grant('user:public', 'addNew', 'Quechua Corpus:session', function(success) {});
// mayi.grant('user:public', 'edit', 'Quechua Corpus:session', function(success) {});
mayi.grant('user:public', 'comment', 'Quechua Corpus:session', function(success) {});
// mayi.grant('user:public', 'export', 'Quechua Corpus:session', function(success) {});
mayi.grant('user:public', 'read', 'Quechua Corpus:datalist', function(success) {});
// mayi.grant('user:public', 'addNew', 'Quechua Corpus:datalist', function(success) {});
// mayi.grant('user:public', 'edit', 'Quechua Corpus:datalist', function(success) {});
mayi.grant('user:public', 'comment', 'Quechua Corpus:datalist', function(success) {});
// mayi.grant('user:public', 'export', 'Quechua Corpus:datalist', function(success) {});

//checking permitted actions
mayi.may('user:public', 'edit', 'Quechua Corpus:datalist', function(may) {
	  if(may) {
	      console.log('Please edit the datalist');
	  } else {
	      console.log('You are not permitted to edit datalists');
	  }
	  
// may.grant('userid', 'verb', 'corpusid:datum', function(success) {}); 	  

//mayi.grant('user:Bilbo', 'wear', 'TheOneRing', function(success) {});
//mayi.may('user:Bilbo', 'wear', 'TheOneRing', function(may) {
//  if(may) {
//      console.log('Bilbo may where the One Ring!');
//  } else {
//      console.log('Bilbo may NOT wear the One Ring');
//  }
});



everyauth.everymodule.findUserById(function(id, callback) {
  callback(null, usersById[id]);
});

everyauth.twitter.consumerKey(authconf.twitter.consumerKey).consumerSecret(
    authconf.twitter.consumerSecret).findOrCreateUser(
    function(session, accessToken, accessTokenSecret, twitterUserData) {
      var promise = this.Promise();
      findOrCreateByTwitterData(twitterUserData, accessToken,
          accessTokenSecret, promise);
      return promise;
    }).redirectPath(apphttpsdomain + '#user');

/*
 * This is the original twitter, here to see how it compares with the promise
 * version above
 */
// everyauth.twitter.consumerKey(conf.twit.consumerKey).consumerSecret(
// conf.twit.consumerSecret).findOrCreateUser(
// function(sess, accessToken, accessSecret, twitUser) {
// return usersByTwitId[twitUser.id]
// || (usersByTwitId[twitUser.id] = addUser('twitter', twitUser));
// }).redirectPath('/');

everyauth.password.loginWith('email').getLoginPath('/login').postLoginPath(
    '/login').loginView('login.jade')
// .loginLocals({
// title: 'Login'
// })
// .loginLocals(function (req, res) {
// return {
// title: 'Login'
// }
// })
.loginLocals(function(req, res, done) {
  console.log("In loginLocals" + util.inspect(req));

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
}).getRegisterPath('/register').postRegisterPath('/register').registerView(
    'register.jade').registerLocals(function(req, res, done) {
  console.log("In registerLocals" + util.inspect(req));

  setTimeout(function() {
    done(null, {
      title : 'Async Register'
    });
  }, 200);
}).extractExtraRegistrationParams( function (req) {
  return {
    email: req.body.email,
    username: req.body.username,
    password: req.body.password
    };
}).validateRegistration(function(newUserAttrs, errors) {
  var login = newUserAttrs.login;
  if (usersByLogin[login])
    errors.push('Login already taken');
  return errors;
}).registerUser(function(newUserAttrs) {
  console.log("In registerUser" + util.inspect(newUserAttrs));
  var login = newUserAttrs[this.loginKey()];
  // Adds the user to the database
  var password = newUserAttrs.password;
  delete newUserAttrs.password; // Don't store password
  newUserAttrs.salt = bcrypt.genSaltSync(10);
  newUserAttrs.hash = bcrypt.hashSync(password, salt);
  
  var promise = this.Promise();
  console.log("Successfully made a promise now calling function");
  var result = findOrCreateByEmailData(newUserAttrs, promise);

  if (result != null) {
    console.log("There was an error inserting Username users.");
    errors.push(result);
    return errors;
  }

  // return promise; //TODO findout what this is and wheter we want to use
  // addUser
  console.log("here were the userids " + util.inspect(usersById))
  return usersByLogin[login] = addUser(newUserAttrs);
}).loginSuccessRedirect(apphttpsdomain + '#user').registerSuccessRedirect(
    apphttpsdomain + '#user');


var users = c.database("users");
findOrCreateByTwitterData = function(twitterUserData, accessToken, accessTokenSecret, promise) {
  users.view('docs/twitterId', {key: twitterUserData.id_str}, function(err, docs) {
    if (err) {
      console.log("Error using users/_design/docs/_view/twitterId:");
      console.log(err);
      promise.fail(err);
      return;
    }
    if (docs.length > 0) {
      var user = docs[0].value;
      console.log('user exists: ' + util.inspect(user));
      promise.fulfill(user);
    } else {
      var u = new Backbone.Model({
        accessToken: accessToken,
        accessTokenSecret: accessTokenSecret,
        username: twitterUserData.screen_name,
        name: twitterUserData.name,
        gravatar: twitterUserData.profile_image_url,
        twitterId: twitterUserData.id,
        userData: twitterUserData
      });
      console.log(util.inspect(u));
      
      var doc = u.toJSON();
      c.database('users').save(doc, function(err, res) {
        if (err) {
          console.log("Error using users:");
          console.log(err);
          promise.fail(err);
          return;
        }
        console.log('user created: ' + util.inspect(doc));
        promise.fulfill(doc);
      });
    }
  });
};

findOrCreateByEmailData = function(userData, promise) {
  console.log("Creating or checking a pasword user"+util.inspect(userData));
  users.view('docs/email', {key: userData.email}, function(err, docs) {
    if (err) {
      console.log("Error using users/_design/docs/_view/email:");
      console.log('error in findOrCreateByemailData'+util.inspect(err));
      promise.fail(err);
      return err;
    }
    console.log("Other users found with the same key of email: "+util.inspect(docs));
    /*
     * If the user is found in the couch view, dont add it
     */
    if (docs.length > 0) {
      var user = docs[0].value;
      console.log('user exists: ' + util.inspect(user));
      promise.fulfill(user);//TODO find out what this does
    } else {
      var u = new Backbone.Model({
        username: userData.username,
        passwordId : true,
        email: userData.email,
        salt: userData.salt,
        hash: userData.hash,
        userData: userData
      });
      console.log(util.inspect(u));
      
      var doc = u.toJSON();
      c.database('users').save(doc, function(err, res) {
        if (err) {
          console.log("Error using users:");
          console.log(err);
          promise.fail(err);
          return err;
        }
        console.log('User created: ' + util.inspect(doc));
        promise.fulfill(doc);
      });
    }
  });
};
