var util = require('util')
    , bcrypt = require('bcrypt')
    , node_config = require("./nodeconfig_devserver")
    , couch_keys = require("./couchkeys_devserver")
    , mail_config = require("./mailconfig_devserver")
    , nodemailer = require("nodemailer")
    , corpus_management = require('./corpusmanagement');

/* variable for permissions */
var collaborator = "reader";
var contributor = "writer";
var admin = "admin";

console.log("Loading the User Authentication Module");
var nano = require('nano')(
    node_config.usersDbConnection.protocol + couch_keys.username + ':'
    + couch_keys.password + '@' + node_config.usersDbConnection.domain
    + ':' + node_config.usersDbConnection.port
    + node_config.usersDbConnection.path);

//Send email see docs https://github.com/andris9/Nodemailer
var smtpTransport = nodemailer.createTransport("SMTP",
    mail_config.mailConnection);
var mailOptions = mail_config.newUserMailOptions();
var emailWhenServerStarts = mailOptions.to;
if (emailWhenServerStarts != "") {
  mailOptions.subject = "FieldDB server restarted";
  mailOptions.text = "The FieldDB server has restarted. (It might have crashed)";
  mailOptions.html = "The FieldDB server has restarted. (It might have crashed)";
  // send mail with defined transport object
  smtpTransport.sendMail(mailOptions, function(error, response) {
    if (error) {
      console.log(new Date() + "Server (re)started Mail error"
          + util.inspect(error));
    } else {
      console.log(new Date() + "Server (re)started, message sent: \n"
          + response.message);
    }
    // if you don't want to use this transport object anymore, uncomment
    // following line
    smtpTransport.close(); // shut down the connection pool, no more messages
  });
} else {
  console
  .log("Didnt email the devs: The LingSync server has restarted. (It might have crashed)");
}

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
          _id : req.body.username,
          email : req.body.email,
          corpuses : req.body.corpuses,
          activityCouchConnection : req.body.activityCouchConnection,

          gravatar : req.body.gravatar,
          researchInterest : req.body.researchInterest,
          affiliation : req.body.affiliation,
          appVersionWhenCreated : req.body.appVersionWhenCreated,
          authUrl : req.body.authUrl,
          description : req.body.description,
          subtitle : req.body.subtitle,
          dataLists : req.body.dataLists,
          prefs : req.body.prefs,
          mostRecentIds : req.body.mostRecentIds,
          firstname : req.body.firstname,
          lastname : req.body.lastname,
          sessionHistory : req.body.sessionHistory,
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
          corpuses : req.body.corpuses,
          activityCouchConnection : req.body.activityCouchConnection
      };
      corpus_management.createDbaddUser(
          userforcouchdb.corpuses[userforcouchdb.corpuses.length - 1],
          userforcouchdb, function(res) {
            console.log(new Date()
            + " There was success in creating the corpus: "
            + util.inspect(res) + "\n");
          }, function(err) {
            console.log(new Date()
            + " There was an error in creating the corpus: "
            + util.inspect(err) + "\n");
          });
      console.log(new Date()
      + " Sent command to create user's corpus to couch: "
      + util.inspect(user.corpuses[user.corpuses.length - 1]));

      // send the user a welcome email
      if (user.email && user.email.length > 5
          && mail_config.mailConnection.auth.user != "") {
        // Send email https://github.com/andris9/Nodemailer
        var smtpTransport = nodemailer.createTransport("SMTP",
            mail_config.mailConnection);
        var mailOptions = mail_config.newUserMailOptions();
        mailOptions.to = user.email + "," + mailOptions.to;
        mailOptions.text = mailOptions.text + user.username;
        mailOptions.html = mailOptions.html + user.username;
        // send mail with defined transport object
        smtpTransport.sendMail(mailOptions, function(error, response) {
          if (error) {
            console.log(new Date() + " Mail error" + util.inspect(error));
          } else {
            console.log(new Date() + " Message sent: \n" + response.message);
            console.log(new Date() + " Sent User " + user.username
                + " a welcome email at " + user.email);
          }
          // if you don't want to use this transport object anymore, uncomment
          // following line
          smtpTransport.close(); // shut down the connection pool, no more
          // messages
        });
      } else {

        console.log(new Date() + " Didnt email welcome to new user"
            + user.username + " why: emailpresent: " + user.email
            + ", valid user email: " + (user.email.length > 5)
            + ", mailconfig: " + (mail_config.mailConnection.auth.user != ""));
      }

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

  findByUsername(
      username,
      function(err, user) {
        if (err) {
          // Don't tell them its because the user doesn't exist.
          return done(err, null, {
            message : 'Username or password is invalid. Please try again.'
          });
        }
        if (!user) {
          // This case is a server error, it should not happen.
          return done(null, false, {
            message : 'Server error. 1292'
          });
        }
        verifyPassword(
            password,
            user,
            function(err, passwordCorrect) {
              if (err) {
                return callback(err, null, {
                  message : 'Server error. 1293'
                });
              }
              if (!passwordCorrect) {
                console.log(new Date()
                + ' User found, but they have entered the wrong password '
                + username);
                /*
                 * Log this unsucessful password attempt
                 */
                user.serverlogs = user.serverlogs || {};
                user.serverlogs.incorrectPasswordAttempts = user.serverlogs.incorrectPasswordAttempts
                || [];
                user.serverlogs.incorrectPasswordAttempts.push(new Date());
                user.serverlogs.incorrectPasswordEmailSentCount = user.serverlogs.incorrectPasswordEmailSentCount || 0;
                var incorrectPasswordAttemptsCount = user.serverlogs.incorrectPasswordAttempts.length;
                var timeToSendAnEmailEveryXattempts = (incorrectPasswordAttemptsCount % 5) == 0;
                if (timeToSendAnEmailEveryXattempts) {
                  user.serverlogs.incorrectPasswordEmailSentCount++;

                  console.log(new Date() + ' User ' + username
                      + ' found, but they have entered the wrong password '
                      + incorrectPasswordAttemptsCount + ' times. ');
                  /*
                   * This emails the user, if the user has an email, if the
                   * email is 'valid' TODO do better email validation. and if
                   * the mail_config has a valid user. For the dev and local
                   * versions of the app, this wil never be fired because the
                   * mail_config doesnt have a valid user. But the production
                   * config does, and it is working.
                   */
                  if (user.email && user.email.length > 5
                      && mail_config.mailConnection.auth.user != "") {
                    var newpassword = makeRandomPassword();
                    // Send email https://github.com/andris9/Nodemailer
                    var smtpTransport = nodemailer.createTransport("SMTP",
                        mail_config.mailConnection);
                    var mailOptions = mail_config.suspendedUserMailOptions();
                    mailOptions.to = user.email + "," + mailOptions.to;
                    mailOptions.text = mailOptions.text + newpassword;
                    mailOptions.html = mailOptions.html + newpassword;
                    // send mail with defined transport object
                    smtpTransport
                    .sendMail(
                        mailOptions,
                        function(error, response) {
                          if (error) {
                            console.log(new Date() + " Mail error"
                                + util.inspect(error));
                            saveUpdateUserToDatabase(user, function() {
                              console.log(new Date()
                              + " Server logs updated in user.");
                            });
                          } else {
                            console.log(new Date() + " Message sent: \n"
                                + response.message);
                            var salt = user.salt = bcrypt.genSaltSync(10);
                            user.hash = bcrypt.hashSync(newpassword, salt);
                            saveUpdateUserToDatabase(user, function() {
                              console.log(new Date()
                              + " Attempted to reset User "
                              + user.username
                              + " password to a temp password.");
                            });
                            // save new password to couch too
                            corpus_management
                            .changeUsersPassword(
                                user.corpuses[user.corpuses.length - 1],
                                user,
                                newpassword,
                                function(res) {
                                  console
                                  .log(new Date()
                                  + " There was success in creating changing the couchdb password: "
                                  + util.inspect(res) + "\n");
                                },
                                function(err) {
                                  console
                                  .log(new Date()
                                  + " There was an error in creating changing the couchdb password "
                                  + util.inspect(err) + "\n");
                                });
                          }
                          // if you don't want to use this transport object
                          // anymore, uncomment following line
                          smtpTransport.close(); // shut down the
                          // connection pool, no
                          // more messages
                        });
                    return done(
                        null,
                        null,
                        {
                          message : 'You have tried to log in too many times. We are sending a temporary password to your email.'
                        });
                  } else {
                    saveUpdateUserToDatabase(user,
                        function() {
                      console.log(new Date()
                      + " Server logs updated in user.");
                    });
                    console
                    .log(new Date()
                    + 'User didn\'t not provide a valid email, so their temporary password was not sent email.');
                    return done(
                        null,
                        null,
                        {
                          message : 'You have tried to log in too many times and you dont seem to have a valid email so we cant send you a temporary password.'
                        });
                  }

                } else {
                  saveUpdateUserToDatabase(user, function() {
                    console.log(new Date() + " Server logs updated in user.");
                  });
                  // Don't tell them its because the password is wrong.
                  console
                  .log(new Date()
                  + " Returning: Username or password is invalid. Please try again.");

                  return done(
                      null,
                      null,
                      {
                        message : 'Username or password is invalid. Please try again.'
                      });
                }
              }
              console.log(new Date() + ' User found, and password verified '
                  + username);

              /*
               * Save the users' updated details, and return to caller TODO Add
               * more attributes from the req.body below
               */
              if (req.body.syncDetails == "true") {
                console.log("Here is syncUserDetails: "
                    + util.inspect(req.body.syncUserDetails));

                if (user.corpuses != req.body.syncUserDetails.corpuses) {
                  console
                  .log(new Date()
                  + " It looks like the user has created some new local corpora. Attempting to make new corpus on the team server so the user can sync.");
                  var userforcouchdb = {
                      username : req.body.username,
                      password : req.body.password,
                      corpuses : req.body.syncUserDetails.corpuses,
                      activityCouchConnection : req.body.activityCouchConnection
                  };
                  createNewCorpusesIfDontExist(user, userforcouchdb,
                      req.body.syncUserDetails.corpuses);

                } else {
                  console.log(new Date() + " User's corpuses are unchanged.");
                }
                user.corpuses = req.body.syncUserDetails.corpuses;
                user.email = req.body.syncUserDetails.email;
                user.gravatar = req.body.syncUserDetails.gravatar;
                user.researchInterest = req.body.syncUserDetails.researchInterest;
                user.affiliation = req.body.syncUserDetails.affiliation;
                user.appVersionWhenCreated = req.body.syncUserDetails.appVersionWhenCreated;
                user.authUrl = req.body.syncUserDetails.authUrl;
                user.description = req.body.syncUserDetails.description;
                user.subtitle = req.body.syncUserDetails.subtitle;
                user.dataLists = req.body.syncUserDetails.dataLists;
                user.prefs = req.body.syncUserDetails.prefs;
                user.mostRecentIds = req.body.syncUserDetails.mostRecentIds;
                user.firstname = req.body.syncUserDetails.firstname;
                user.lastname = req.body.syncUserDetails.lastname;
                user.sessionHistory = req.body.syncUserDetails.sessionHistory;
                user.hotkeys = req.body.syncUserDetails.hotkeys;
              }

              user.updated_at = new Date();
              user.serverlogs = user.serverlogs || {};
              user.serverlogs.successfulLogins = user.serverlogs.successfulLogins
              || [];
              user.serverlogs.successfulLogins.push(new Date());

              return saveUpdateUserToDatabase(user, done);

            });

      });
};

/*
 * Looks up the user by username, gets the user, confirms this is the right
 * password.
 * 
 * Then adds the role to the user if they exist
 */
module.exports.addRoleToUser = function(req, done) {
  var requestingUser = req.body.username;
  var dbConn = req.body.couchConnection;
  if (!dbConn) {
    return done({
      error : "Client didn't define the database connection."
    }, null, {
      message : "There was a problem adding user to this corpus."
    });
  }
  var rolesSimpleStrings = req.body.roles;
  if (!rolesSimpleStrings) {
    return done({
      error : "Client didnt define the roles to add."
    }, null, {
      message : "There was a problem adding user to this corpus."
    });
  }
  var roles = [];
  for ( var r in rolesSimpleStrings) {
    roles.push('"' + dbConn.pouchname + "_" + rolesSimpleStrings[r] + '"');
  }

  /*
   * Check to see if the user is an admin on the corpus
   */
  var nanoforpermissions = require('nano')(
      dbConn.protocol + couch_keys.username + ':' + couch_keys.password + '@'
      + dbConn.domain + ':' + dbConn.port + dbConn.path);
  var usersdb = nanoforpermissions.db.use("_users");
  usersdb.get("org.couchdb.user:"+requestingUser, function(error, result) {
    if (error) {
      return done({
        error : "User " + requestingUser + " couldn't be found on this server"
      }, null, {
        message : "There was a problem adding user to this corpus."
      });
    
    } else {
      if (result) {
      
        
        
        var userroles = result.roles;
        var userIsAdminOnTeam = false;
        userroles.forEach(function(role) {
          if(role.indexOf('"' + dbConn.pouchname + "_" + admin + '"') > -1){
            userIsAdminOnTeam = true;
            console.log("User "+requestingUser+" is admin on "+dbConn.pouchname+" : "+util.inspect(role));

            /*
             * If they are admin, add the role to the user
             */
            return corpus_management.addRoleToUser(dbConn, req.body.userToAddToRole, roles,
                done, done);


          }else{
            console.log("User "+requestingUser+" is not admin on "+dbConn.pouchname+" : "+util.inspect(role));
          }
        });

        /*
         * If after looping through all users' roles, return an error if they are not admin
         */
        if(!userIsAdminOnTeam){
          return done({
            error : "User " + requestingUser + " is not admin on this corpus: "
            + dbConn.pouchname + " . Denying them the right to add the role "
            + util.inspect(roles) + " to this user "
            + req.body.userToAddToRole
          }, null, {
            message : "You don't have sufficient permissions to add a user to this corpus, please ask a corpus administrator."
          });
        }
        
        
        
        
      } else {
        return done({
          error : "User " + requestingUser + " couldn't be found on this server"
        }, null, {
          message : "There was a problem adding user to this corpus."
        });
      }
    }
  });
  
};

/*
 * Looks returns a list of users ordered by role in that corpus
 */
module.exports.fetchCorpusPermissions = function(req, done) {
  var dbConn = req.body.couchConnection;
  if (!dbConn) {
    return done({
      error : "Client didn't define the database connection."
    }, null, {
      message : "Problem looking up corpus permissions."
    });
  }
  
  var pouchname = dbConn.pouchname;
  var requestingUser = req.body.username;
  var requestingUserIsAMemberOfCorpusTeam = false;
  
  console.log("Looking for corpus permissions on: "+dbConn.protocol + dbConn.domain + ':' + dbConn.port + dbConn.path);
  var nanoforpermissions = require('nano')(
      dbConn.protocol + couch_keys.username + ':' + couch_keys.password + '@'
      + dbConn.domain + ':' + dbConn.port + dbConn.path);

  /*
   * Get user names and roles from the server
   * 
   * https://127.0.0.1:6984/_users/_design/users/_view/userroles
   */
  var usersdb = nanoforpermissions.db.use("_users");
  usersdb.view("users", "userroles", function(error, body) {
    if (error) {
      console.log("Error quering users: " + util.inspect(error));
      console.log("This is the results recieved: " + util.inspect(body));
      return done(error, null, {
        message : 'Error quering users.'
      });
    } else {
      var userroles = body.rows;
      
      /*
       * Get user masks from the server
       */
      var usersdb = nanoforpermissions.db.use(node_config.usersDbConnection.dbname);
      // Put the user in the database and callback
      usersdb.view("users", "usermasks", function(error, body) {
        if (error) {
          console.log("Error quering users: " + util.inspect(error));
          console.log("This is the results recieved: " + util.inspect(body));
          return done(error, null, {
            message : 'Error quering users.'
          });
        } else {
          var usermasks = body.rows;
          
          var rolesAndUsers = {};
          rolesAndUsers.readers = [];
          rolesAndUsers.writers = [];
          rolesAndUsers.admins = [];
          rolesAndUsers.notonteam = [];
          rolesAndUsers.allusers = [];
          
          userroles.forEach(function(doc) {
            var currentUsername = doc.key;
            console.log("Looking at "+currentUsername);
            var userIsOnTeam = false;
            
            /* Get the mask for this user */
            var thisUsersMask = {};
            usermasks.forEach(function(usermask) {
              if(usermask.key == currentUsername){
                thisUsersMask = usermask.value;
                rolesAndUsers.allusers.push(usermask.value);
              }
            });
            
            /* Go through all the user's roles */
            var roles = doc.value;
            roles.forEach(function(role){
              
              /* Check to see if this role is for this corpus */
              if(role.indexOf(pouchname) > -1){
                console.log("This role is for this corpus: "+role);
                requestingUserIsAMemberOfCorpusTeam = true;
                /*
                 * If the role is for this corpus, insert the users's mask into the relevant roles
                 */
                if(role.indexOf(admin) > -1){
                  rolesAndUsers.admins.push(thisUsersMask);
                  userIsOnTeam = true;
                }
                if(role.indexOf(contributor) > -1){
                  rolesAndUsers.writers.push(thisUsersMask);
                  userIsOnTeam = true;
                }
                if(role.indexOf(collaborator) > -1){
                  rolesAndUsers.readers.push(thisUsersMask);
                  userIsOnTeam = true;
                }
              }
            });
            
            if(!userIsOnTeam){
              rolesAndUsers.notonteam.push(thisUsersMask);
            }
            
          });
          
          
          /*
           * Fake the data 
           */
//          rolesAndUsers = {
//              "readers" : [ {
//                "username" : "lingllama"
//              }, {
//                "username" : "bob"
//              }, {
//                "username" : "fred"
//              } ],
//              "writers" : [ {
//                "username" : "lingllama"
//              }, {
//                "username" : "bob"
//              } ],
//              "admins" : [ {
//                "username" : "bob"
//              } ],
//              "notonteam" : [ {
//                "username" : "phil"
//              }, {
//                "username" : "testingnoalldata"
//              }, {
//                "username" : "tom"
//              } ]
//          };
          
          /*
           * Send the results, if the user is part of the team
           */
          if(requestingUserIsAMemberOfCorpusTeam){
            done(null, rolesAndUsers, {
              message : "Look up successful."
            });
          }else{
            done({error: "Requesting user is not a member of the corpus team."}, null, {
              message : "Error quering users."
            });
          }
          
          
        }
      });

    }
  });


};

function createNewCorpusesIfDontExist(user, userforcouchdb, corpuses) {
  /*
   * Creates the user's new corpus databases
   */
  for ( var potentialnewcorpus in corpuses) {
    corpus_management
    .createDBforCorpus(
        userforcouchdb.corpuses[potentialnewcorpus],
        userforcouchdb,
        function(corpusConnectionThatWasCreated) {

          console
          .log(new Date()
          + " Added the corpus connection to the user in the database. "
          + util.inspect(corpusConnectionThatWasCreated) + "\n");

        },
        function(corpusConnectionThatWasNotCreated, alreadyexisted) {

          if (alreadyexisted == "corpus_existed") {
            console.log(new Date() + " The corpus already existed. "
                + util.inspect(corpusConnectionThatWasNotCreated) + "\n");
          } else {
            console
            .log(new Date()
            + " There was an error in creating the new corpus, when the user logs in again, we'll try again. "
            + util.inspect(corpusConnectionThatWasNotCreated)
            + "\n");
          }

        });
  }

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
function saveUpdateUserToDatabase(user, done) {
  // Preparing the couch connection
  var usersdb = nano.db.use(node_config.usersDbConnection.dbname);
  // Put the user in the database and callback
  usersdb.insert(user, user.username, function(error, resultuser) {
    if (error) {
      console.log("Error saving a user: " + util.inspect(error));
      console.log("This is the user who was not saved: "
          + util.inspect(resultuser));
      return done(error, null, {
        message : 'Error saving a user in the database. '
      });
    } else {
      if (resultuser.ok) {
        console.log(new Date() + " No error saving a user: "
            + util.inspect(resultuser));
        return done(null, user, {
          message : "User details saved."
        });
      } else {
        console.log(new Date()
        + " No error creating a user, but response was not okay: "
        + util.inspect(resultuser));
        return done(resultuser, null, {
          message : 'Unknown server result, this might be a bug.'
        });
      }
    }
  });
}

/**
 * This function connects to the usersdb, tries to retrieve the doc with the
 * provided id, returns the call of the fn with (error_message, user)
 * 
 * @param id
 * @param fn
 */
function findById(id, fn) {
  var usersdb = nano.db.use(node_config.usersDbConnection.dbname);
  usersdb.get(id, function(error, result) {
    if (error) {
      if (error.error == "not_found") {
        console.log(new Date() + ' No User found: ' + id);
        return fn('User ' + id + ' does not exist', null);
      } else {
        console.log(new Date() + ' Error looking up the user: ' + id + '\n'
            + util.inspect(error));
        return fn('Error looking up the user ' + id
            + ' please report this bug. ', null);
      }
    } else {
      if (result) {
        console.log(new Date() + ' User ' + id + ' found: \n'
            + util.inspect(result));
        return fn(null, result);
      } else {
        console.log(new Date() + ' No User found: ' + id);
        return fn('User ' + id + ' does not exist', null);
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
 * TODO test this function by setting up an API call for users to change their
 * passwords.
 * 
 * @param oldpassword
 * @param newpassword
 * @param user
 * @param done
 */
function setPassword(oldpassword, newpassword, user, done) {
  bcrypt
  .compare(
      oldpassword,
      user.hash,
      function(err, passwordCorrect) {
        if (err) {
          return done(err);
        }
        if (passwordCorrect) {
          var salt = user.salt = bcrypt.genSaltSync(10);
          user.hash = bcrypt.hashSync(newpassword, salt);
          console.log(salt, user.hash);
          // Save new password to couch too
          corpus_management
          .changeUsersPassword(
              user.corpuses[user.corpuses.length - 1],
              user,
              newpassword,
              function(res) {
                console
                .log(new Date()
                + " There was success in creating changing the couchdb password: "
                + util.inspect(res) + "\n");
              },
              function(err) {
                console
                .log(new Date()
                + " There was an error in creating changing the couchdb password "
                + util.inspect(err) + "\n");
              });

          // Save user to database
          return saveUpdateUserToDatabase(user, done);

        }
      });
}

/**
 * This function generates a temporary password which is alpha-numeric and 10
 * chars long
 * 
 * @returns {String}
 */
function makeRandomPassword() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for ( var i = 0; i < 10; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  return text;
}
function verifyPassword(password, user, done) {
  bcrypt.compare(password, user.hash, done);
}
