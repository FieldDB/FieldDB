var passport = require('passport')
    , util = require('util')
    , bcrypt = require('bcrypt')
    , LocalStrategy = require('passport-local').Strategy
    , node_config = require("./nodeconfig_local")
    , couch_keys = require("./couchkeys_local")
    , mail_config = require("./mailconfig_local")
    , nodemailer = require("nodemailer")
    , corpus_management = require('./corpusmanagement');

console.log("Loading the User Authentication Module");
var nano = require('nano')(node_config.usersDbConnection.protocol+'://'+couch_keys.username+':'+couch_keys.password+'@'+node_config.usersDbConnection.domain+':'+node_config.usersDbConnection.port);

/*
 * User Authentication functions
 */
module.exports = {};

/**
 * Takes parameters from the request and creates a new user json, salts and
 * hashes the password, has the corpus_management library create a new couchdb
 * user, permissions and couches for the new user. The returns the save of the
 * user to the users database.
 */
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
        _id: req.body.username,
        email : req.body.email,
        corpuses : req.body.corpuses,
        activityCouchConnection: req.body.activityCouchConnection,

        gravatar : req.body.gravatar,
        researchInterest : req.body.researchInterest,
        affiliation : req.body.affiliation,
        appVersionWhenCreated: req.body.appVersionWhenCreated,
        authUrl : req.body.authUrl,
        description : req.body.description,
        subtitle : req.body.subtitle,
        dataLists : req.body.dataLists,
        prefs : req.body.prefs,
        mostRecentIds : req.body.mostRecentIds,
        firstname : req.body.firstname,
        lastname : req.body.lastname,
        teams : req.body.teams,
        sessionHistory : req.body.sessionHistory,
        permissions : req.body.permissions,
        hotkeys : req.body.hotkeys,

        salt : salt,
        hash : bcrypt.hashSync(req.body.password, salt),
        created_at : new Date(),
        updated_at : new Date()
      };
      
      /*
       * Creates the new user's corpus databases
       */
      var userforcouchdb = {
          username : req.body.username,
          password : req.body.password,
          corpuses : req. body.corpuses,
          activityCouchConnection: req.body.activityCouchConnection
      };
      corpus_management.createDbaddUser(
          userforcouchdb.corpuses[userforcouchdb.corpuses.length - 1],
          userforcouchdb, 
          function(res) {
            console.log(new Date() +" There was success in creating the corpus: "+ util.inspect(res)+"\n");
          }, function(err) {
            console.log(new Date() + " There was an error in creating the corpus: "+ util.inspect(err)+"\n");
          });
      console.log(new Date() + " Sent command to create user's corpus to couch: "
          + util.inspect(user.corpuses[user.corpuses.length - 1]));
      
      /*
       * Saves the new user into the users database
       */
      console.log(new Date() + " Sent command to save user to couch: "
          + util.inspect(node_config.usersDbConnection));
      return saveUpdateUserToDatabase(user, done);
    }
  });
};

/*
 * Looks up the user by username, gets the user, confirms this is the right
 * password. Takes user details from the request and saves them into the user,
 * then calls done with (error, user, info)
 * 
 * If its not the right password does some logging to find out how many times
 * they have attempted, if its too many it emails them a temp password if they
 * have given us a valid email. If this is a local or dev server config, it
 * doesn't email, or change their password.
 */
module.exports.authenticateUser = function(username, password, req, done) {

  findByUsername(username, function(err, user) {
    if (err) {
      //Don't tell them its because the user doesn't exist.
      return done(err, null, {
        message : 'Username or password is invalid. Please try again.'
      });
    }
    if (!user) {
      //This case is a server error, it should not happen.
      return done(null, false, {
        message : 'Server error. 1292'
      });
    }
    verifyPassword(password, user, function(err, passwordCorrect) {
      if (err) {
        return callback(err, null, {
          message : 'Server error. 1293'
        });
      }
      if (!passwordCorrect) {
        console.log(new Date() + ' User found, but they have entered the wrong password ' + username);
        /*
         * Log this unsucessful password attempt
         */
        user.serverlogs = user.serverlogs || {};
        user.serverlogs.incorrectPasswordAttempts =  user.serverlogs.incorrectPasswordAttempts ||[];
        user.serverlogs.incorrectPasswordAttempts.push(new Date());
        user.serverlogs.incorrectPasswordEmailSentCount = user.serverlogs.incorrectPasswordEmailSentCount || 0;
        var incorrectPasswordAttemptsCount = user.serverlogs.incorrectPasswordAttempts.length;
        var timeToSendAnEmailEveryXattempts = (incorrectPasswordAttemptsCount % 5 ) == 0;
        if(timeToSendAnEmailEveryXattempts){
          user.serverlogs.incorrectPasswordEmailSentCount ++;
          
          console.log(new Date() + ' User '+username+' found, but they have entered the wrong password ' + incorrectPasswordAttemptsCount+' times. ');
          /*
           * This emails the user, if the user has an email, if the email is 'valid' TODO do better email validation. and if the mail_config has a valid user. 
           * For the dev and local versions of the app, this wil never be fired because the mail_config doesnt have a valid user. 
           * But the production config does, and it is working. 
           */
          if(user.email && user.email.length > 5 && mail_config.mailConnection.auth.user != ""){
            var temppassword = makeRandomPassword();
            //Send email https://github.com/andris9/Nodemailer
            var smtpTransport = nodemailer.createTransport("SMTP", mail_config.mailConnection);
            var mailOptions = mail_config.suspendedUserMailOptions;
            mailOptions.to = user.email;
            mailOptions.text = mailOptions.text+temppassword;
            mailOptions.html = mailOptions.html+temppassword;
            // send mail with defined transport object
            smtpTransport.sendMail(mailOptions, function(error, response){
                if(error){
                    console.log(new Date() +" Mail error"+util.inspect(error));
                    saveUpdateUserToDatabase(user, function(){
                      console.log(new Date()+ " Server logs updated in user.");
                    });
                }else{
                  console.log(new Date() + " Message sent: \n" + response.message);
                  var salt = user.salt = bcrypt.genSaltSync(10);
                  user.hash = bcrypt.hashSync(temppassword, salt);
                  saveUpdateUserToDatabase(user, function(){
                    console.log(new Date() + " Attempted to reset User "+user.username+" password to a temp password.");
                  });
                }
                // if you don't want to use this transport object anymore, uncomment following line
                smtpTransport.close(); // shut down the connection pool, no more messages
            });
            return done(null, null, {
              message : 'You have tried to log in too many times. We are sending a temporary password to your email.'
            });
          }else{
            saveUpdateUserToDatabase(user, function(){
              console.log(new Date()+ " Server logs updated in user.");
            });
            console.log(new Date() + 'User didn\'t not provide a valid email, so their temporary password was not sent email.');
            return done(null, null, {
              message : 'You have tried to log in too many times and you dont seem to have a valid email so we cant send you a temporary password.'
            });
          }
          
        }else{
          saveUpdateUserToDatabase(user, function(){
            console.log(new Date()+ " Server logs updated in user.");
          });
          //Don't tell them its because the password is wrong.
          return done(null, null, {
            message : 'Username or password is invalid. Please try again.'
          });
        }
      }
      console.log(new Date() + ' User found, and password verified ' + username);
     
      /*
       * Save the users' updated details, and return to caller
       * TODO Add more attributes from the req.body below
       */
      console.log("Here is syncUserDetails: "+util.inspect(req.body.syncUserDetails));
      if(req.body.syncDetails == "true"){
        
        user.email = req.body.syncUserDetails.email;
        gravatar = req.body.syncUserDetails.gravatar;
        researchInterest = req.body.syncUserDetails.researchInterest;
        affiliation = req.body.syncUserDetails.affiliation;
        appVersionWhenCreated= req.body.syncUserDetails.appVersionWhenCreated;
        authUrl = req.body.syncUserDetails.authUrl;
        description = req.body.syncUserDetails.description;
        subtitle = req.body.syncUserDetails.subtitle;
        dataLists = req.body.syncUserDetails.dataLists;
        prefs = req.body.syncUserDetails.prefs;
        mostRecentIds = req.body.syncUserDetails.mostRecentIds;
        firstname = req.body.syncUserDetails.firstname;
        lastname = req.body.syncUserDetails.lastname;
        teams = req.body.syncUserDetails.teams;
        sessionHistory = req.body.syncUserDetails.sessionHistory;
        permissions = req.body.syncUserDetails.permissions;
        hotkeys = req.body.syncUserDetails.hotkeys;
      }
      
      
      user.updated_at = new Date();
      user.serverlogs = user.serverlogs || {};
      user.serverlogs.successfulLogins = user.serverlogs.successfulLogins|| [];
      user.serverlogs.successfulLogins.push(new Date());
      
      return saveUpdateUserToDatabase(user, done);
      
    });

  });
};

/**
 * This function takes a user and a function. The done function is called back
 * with (error, user, info) where error contains the server's detailed error
 * (not to be shared with the client), and info contains a client readible error
 * message.
 * 
 * @param user
 * @param done
 */
function saveUpdateUserToDatabase(user, done){
  // Preparing the couch connection
  var usersdb = nano.db.use(node_config.usersDbConnection.dbname);
  // Put the user in the database and callback
  usersdb.insert(user, user.username, function(error, resultuser) {
    if (error) {
      console.log("Error saving a user: " + util.inspect(error));
      return done(error, null, {
        message : 'Error saving a user in the database. '
      });
    } else {
      if(resultuser.ok){
        console.log(new Date() + " No error saving a user: " + util.inspect(resultuser));
        return done(null, user, {
          message : "User details saved."
        });
      }else{
        console.log(new Date() + " No error creating a user, but response was not okay: " + util.inspect(resultuser));
        return done(resultuser, null, {
          message : 'Unknown server result, this might be a bug.'
        });
      }
    }
  });
}

/**
 * This function connects to the usersdb, tries to retrieve the doc with the provided id,
 * returns the call of the fn with (error_message, user)
 * @param id
 * @param fn
 */
function findById(id, fn) {
  var usersdb = nano.db.use(node_config.usersDbConnection.dbname);
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
        console.log(new Date() + ' User '+id+' found: \n' + util.inspect(result));
        return fn(null, result);
      } else {
        console.log(new Date() + ' No User found: ' + id);
        return fn('User ' + id + ' does not exist' , null);
      }
    }
  });
}

/**
 * This function uses findById since we have decided to save usernames as id's
 * in the couchdb
 */
findByUsername = function(username, done) {
  return findById(username, done);
};

/**
 * This function accepts an old and new password, a user and a function to be
 * called with (error, user, info)
 * 
 * TODO test this function by setting up an API call for users to change their passwords. 
 * 
 * @param oldpassword
 * @param newpassword
 * @param user
 * @param done
 */
function setPassword(oldpassword, newpassword, user, done) {
  bcrypt.compare(oldpassword, user.hash, function(err, passwordCorrect) {
    if (err) {
      return done(err);
    }
    if (passwordCorrect) {
      var salt = user.salt = bcrypt.genSaltSync(10);
      user.hash = bcrypt.hashSync(newpassword, salt);
      console.log(salt, user.hash);
      // Save user to database
      return saveUpdateUserToDatabase(user, done);
    }
  });
}

/**
 * This function generates a temporary password which is alpha-numeric and 10 chars long
 * @returns {String}
 */
function makeRandomPassword(){
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for( var i=0; i < 10; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
}
function verifyPassword(password, user, done) {
  bcrypt.compare(password, user.hash, done);
}

/*
 * Passport session setup To support persistent login sessions, Passport needs
 * to be able to serialize users into and deserialize users out of the session.
 * Typically, this will be as simple as storing the user ID when serializing,
 * and finding the user by ID when deserializing.
 * 
 * @Deprecated we not using passport at all, this maybe useful if this becomes a
 *             user facing authentication code, at the moment is just a webservice.
 */
passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(username, done) {
  findByUsername(username, function(err, user) {
    done(err, user);
  });
});

/*
 * Use the LocalStrategy within Passport. Strategies in passport require a
 * `verify` function, which accept credentials (in this case, a username and
 * password), and invoke a callback with a user object. In the real world, this
 * would query a database; however, in this example we are using a baked-in set
 * of users.
 * 
 * @Deprecated we not using passport at all, this maybe useful if this becomes a
 *             user facing authentication code, at the moment is just a webservice.
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
        console.log(new Date() + ' User found, and password verified ' + username);
        //TODO save the users' updated details 
        return done(null, user);
      });

    });
  });
}));
