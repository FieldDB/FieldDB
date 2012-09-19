var passport = require('passport')
    , util = require('util')
    , bcrypt = require('bcrypt')
    , nano = require('nano')('http://admin:none@localhost:5984')
    , LocalStrategy = require('passport-local').Strategy
    , node_config = require("./nodeconfig_local")
    , couch_keys = require("./couchkeys_local")
    , corpus_management = require('./corpusmanagement');


/*
 * Test Users
 */
var users = [ {
  id : 1,
  username : 'bob',
  password : 'secret',
  email : 'bob@example.com',
  salt : '$2a$10$0SCtlFYUMLl1VdIr35z.5e',
  hash : '$2a$10$0SCtlFYUMLl1VdIr35z.5e6oh5lrX6MziZ7oapo/5cn3zuMSkgg3G'
}, {
  id : 2,
  username : 'joe',
  password : 'birthday',
  email : 'joe@example.com'
} ];

/*
 * User Authentication functions
 */
module.exports = {
  registerNewUser : function(localOrNot, req, done) {
    console.log("This is what the request looks like: " + util.inspect(req));
    var salt = bcrypt.genSaltSync(10);
    var user = {
//      id : users.length + 1,
      jsonType : 'user',
      username : req.body.username,
      salt : salt,
      hash : bcrypt.hashSync(req.body.password, salt),
      created_at : new Date(),
      updated_at : new Date()
    };
    console
        .log("This is what the user looks like in the registerNewUser function: "
            + util.inspect(user));
    users.push(user);

    //Preparing the couch connection
    var usersdb = nano.db.use('zfielddbuserscouch');
    // Put the user in the database and callback
    usersdb.insert(user,  function(error, resultuser) {
      var returndata = {};
      if (error) {
        console.log("Error creating a user: " + error);
        returndata.error = error;
        return done(error, returndata, {
          message : 'Error creating a new user in the database. '
        });
      } else {
        console.log("No error creating a user: "+resultuser);
        user.id = resultuser.id;
        returndata.user = user;
        return done(null, returndata, {
          message : "User created"
        });
      }
    });
    console.log("Sent command to save user to couch: "+util.inspect(node_config.usersDbConnection));
  }
}

function findById(id, fn) {
  var idx = id - 1;
  if (users[idx]) {
    fn(null, users[idx]);
  } else {
    fn(new Error('User ' + id + ' does not exist'));
  }
}

function findByUsername(username, fn) {
  for ( var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
    if (user.username === username) {
      return fn(null, user);
    }
  }
  return fn(null, null);
}
function setPassword(oldpassword, newpassword, done) {
  bcrypt.compare(oldpassword, user.hash, function(err, passwordCorrect) {
    if (err) {
      return done(err);
    }
    if (passwordCorrect) {
      var salt = user.salt = bcrypt.genSaltSync(10);
      user.hash = bcrypt.hashSync(newpassword, salt);
      console.log(salt, user.hash);
      // TODO save user to database

      return done(null, user);
    }
  });
}

function verifyPassword(password, user, done) {
  bcrypt.compare(password, user.hash, done);
}

/*
 * Passport session setup To support persistent login sessions, Passport needs
 * to be able to serialize users into and deserialize users out of the session.
 * Typically, this will be as simple as storing the user ID when serializing,
 * and finding the user by ID when deserializing.
 */
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  findById(id, function(err, user) {
    done(err, user);
  });
});

/*
 * Use the LocalStrategy within Passport. Strategies in passport require a
 * `verify` function, which accept credentials (in this case, a username and
 * password), and invoke a callback with a user object. In the real world, this
 * would query a database; however, in this example we are using a baked-in set
 * of users.
 */

passport.use(new LocalStrategy(function(username, password, done) {
  // asynchronous verification, for effect...
  process.nextTick(function() {

    // Find the user by username. If there is no user with the given
    // username, or the password is not correct, set the user to `false` to
    // indicate failure and set a flash message. Otherwise, return the
    // authenticated `user`.
    findByUsername(username, function(err, user) {
      if (err) {
        return done(err);
      }
      if (!user) {
        return done(null, false, {
          message : 'Unknown user ' + username
        });
      }
      verifyPassword(password, user, function(err, passwordCorrect) {
        if (err) {
          return callback(err);
        }
        if (!passwordCorrect) {
          return done(null, false, {
            message : 'Invalid password'
          });
        }
        return done(null, user);
      });

    });
  });
}));
