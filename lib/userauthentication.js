var passport = require('passport'), util = require('util'), bcrypt = require('bcrypt'), nano = require(
    'nano')('http://admin:none@localhost:5984'), LocalStrategy = require('passport-local').Strategy, node_config = require("./nodeconfig_local"), couch_keys = require("./couchkeys_local"), corpus_management = require('./corpusmanagement');

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
module.exports = {};

module.exports.registerNewUser = function(localOrNot, req, done) {
  // Make sure the username doesn't exist.
  findByUsername(req.body.username, function(err, user) {
    if (user) {
      return done(err, null, {
        message : 'Username already exists, try a different username.'
      });
    } else {
      console.log(new Date() + ' Registering new user: ' + req.body.username);
      var salt = bcrypt.genSaltSync(10);
      /*
       * Add more attributes from the req.body below
       */
      var user = {
        jsonType : 'user',
        username : req.body.username,
        salt : salt,
        hash : bcrypt.hashSync(req.body.password, salt),
        created_at : new Date(),
        updated_at : new Date()
      };
      // console.log(new Date()+' Registering new user: '+ util.inspect(user));

      // Preparing the couch connection
      var usersdb = nano.db.use('zfielddbuserscouch');
      // Put the user in the database and callback
      usersdb.insert(user, user.username, function(error, resultuser) {
        if (error) {
          console.log("Error creating a user: " + util.inspect(error));
          return done(error, null, {
            message : 'Error creating a new user in the database. '
          });
        } else {
          if(resultuser.ok){
            console.log(new Date() + " No error creating a user: " + util.inspect(resultuser));
            user.id = resultuser.id;
            return done(null, user, {
              message : "User created."
            });
          }else{
            console.log(new Date() + " No error creating a user, but response was not okay: " + util.inspect(resultuser));
            returndata.errors = ['Error creating a new user in the database. The app might be down.'];
            return done(resultuser, null, {
              message : 'Unknown server result, this might be a bug.'
            });
          }
        }
      });
      console.log(new Date() + " Sent command to save user to couch: "
          + util.inspect(node_config.usersDbConnection));
    }
  });
};

/*
 * This function connects to the usersdb, tries the doc with the provided id,
 * returns the (error_message, user)
 */
function findById(id, fn) {
  var usersdb = nano.db.use('zfielddbuserscouch');
  usersdb.get(id, function(error, result) {
    if (error) {
      if(error.error == "not_found"){
        console.log(new Date() + ' No User found: ' + id);
        return fn('User ' + id + ' does not exist', null );
      }else{
        console.log(new Date() + ' Error looking up the user: ' + id+ '\n'
            + util.inspect(error));
        return fn('Error looking up the user ' + id
          + ' please report this bug. ', null );
      }
    } else {
      if (result) {
        console.log(new Date() + ' User found: ' + result);
        return fn(null, result);
      } else {
        console.log(new Date() + ' No User found: ' + id);
        return fn('User ' + id + ' does not exist' , null);
      }
    }
  });
}

/*
 * This function uses findById since we have decided to save usernames as id's
 * in the couchdb
 */
findByUsername = function(username, done) {
  return findById(username, done);
};

function setPassword(oldpassword, newpassword, user, done) {
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
        console.log(new Date() + ' User found, and password verified ' + id);
        //TODO save the users' updated details 
        return done(null, user);
      });

    });
  });
}));
