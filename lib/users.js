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
var usersdb = c.database("users");
var usersdbname = "users";

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


console.log("Loading the Users Authentication and Permissions Module");


// Test creating a Backbone model 
var b = new Backbone.Model({name: "hi"});
console.log("\tBackbone models are working: "+util.inspect(b));

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
    console.log('\tCouch is up and running. Inserted into CouchDB:');
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

/*
 * Every auth user registration and login functions
 */


everyauth.everymodule.findUserById(function(id, callback) {
  //todo implement couch search instead
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


/*
 * Configuration for email authentication
 */
everyauth.password.loginWith('email')
/*
 * Authentication for users who login with email, Compares hashed password using
 * bcrypt and the POST password to authenticate user
 */
.authenticate(function(email, password) {
  var promise;
  var errors = [];
  if (!email) errors.push('Missing login.');
  if (!password) errors.push('Missing password.');
  if (errors.length) return errors;
  
  promise = this.Promise();

  //findUser passes an error or user to a callback after finding the
  // user by login
  var userDataWithJustEmail = {};
  userDataWithJustEmail.email = email;
  findOrCreateByEmail( userDataWithJustEmail, promise, function (err, user) {
    if (err) {
      errors.push(err.message || err);
      return promise.fulfill(errors);
    }
    if (!user) {
      errors.push('User with login ' + email + ' does not exist.');
      return promise.fulfill(errors);
    }
    bcrypt.compare(password, user.hash, function (err, didSucceed) {
      if (err) {
        return promise.fail(err);
        errors.push('Wrong password.');
        return promise.fulfill(errors);
      }
      if (didSucceed) return promise.fulfill(user);
      errors.push('Wrong password.');
      return promise.fulfill(errors);
    });
  });
  return promise;
/*
 * Put any customized or additional paramaters used for registration here
 */  
}).extractExtraRegistrationParams( function (req) {
  return {
    email: req.body.email,
    username: req.body.username,
    password: req.body.password
    };
}).registerUser(function(newUserAttrs) {
  console.log("In registerUser" + util.inspect(newUserAttrs));
  var promise = this.Promise()
  , password = newUserAttrs.password;

  delete newUserAttrs.password; // Don't store password
  newUserAttrs.salt = bcrypt.genSaltSync(10);
  newUserAttrs.hash = bcrypt.hashSync(password, salt);
  
  //Create a new user in data store
  findOrCreateByEmail( newUserAttrs, promise, function (err, createdUser) {
    if (err) return promise.fail(err);
    return promise.fulfill(createdUser);
  });

  return promise;
})

var findOrCreateByEmail = function(userData, promise, callback){
  console.log("Creating or checking a email/password user");
  
  usersdb.view('docs/email', {key: userData.email}, function(err, docs) {
    if (err) {
      console.log("Error using "+usersdbname+"/_design/docs/_view/email:");
      console.log('Error in createEmailUser'+util.inspect(err));
      promise.fail(err);
      return; // leave the couch lookup function
    }
    console.log("Array of other users found with the same key of email: "+util.inspect(docs));
    /*
     * If the user is found in the couch view, dont add it
     */
    if (docs.length > 0) {
      var user = docs[0].value;
      console.log('user exists: ' + util.inspect(user));
      promise.fulfill(user);//Promise is used to store the user and return after the Post request
      return; //leave the couch lookup function 
    }
    /*
     * if UserData is just an email, dont make a new user. instead fail and say
     * no user exists.
     */
    if(userData.length == 1){
      promise.fail("No such user.");
      return; //leave the couch lookup function 
    }
    /*
     * Create a new Backbone user
     */
    var u = new Backbone.Model({
      username: userData.username,
      passwordId : true,
      email: userData.email,
      salt: userData.salt,
      hash: userData.hash,
      userData: userData
    });
    
    /*
     * Save user to the couch
     */
    var doc = u.toJSON();
    c.database(usersdbname).save(doc, function(err, res) {
      if (err) {
        console.log("Error using "+usersdbname+":");
        console.log(err);
        promise.fail(err);
        return; //leave the couch lookup function
      }
    
      console.log('User created: ' + util.inspect(doc));
      promise.fulfill(doc);
    
    });
  });
  /*
   * Perform callback that was sent to the findorCreateByEmail function.
   */
  if(typeof callback == "function"){
    callback();
  }
};

findOrCreateByTwitterData = function(twitterUserData, accessToken, accessTokenSecret, promise) {
  usersdb.view('docs/twitterId', {key: twitterUserData.id_str}, function(err, docs) {
    if (err) {
      console.log("Error using "+usersdbname+"/_design/docs/_view/twitterId:");
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
      c.database(usersdbname).save(doc, function(err, res) {
        if (err) {
          console.log("Error using "+usersdbname+":");
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

