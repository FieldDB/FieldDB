var couch_keys = require("./couchkeys_devserver")
    , node_config = require("./nodeconfig_devserver")
, cradle = require('cradle')
, _ = require('underscore')
, util = require('util');

console.log(new Date()+ " Loading the Corpus Builder Module");

/* variable for permissions */
var commenter = "commenter";
var collaborator = "reader";
var contributor = "writer";
var admin = "admin";

/*
 * default database connection is a connection on this local machine, however
 * this can create databases on any couchdb as long as it has admin privildges
 */
var useLocalCouchRatherThanRemoteCouch = true;
cradle.setup({
  host: "127.0.0.1",
  port: 5984,
  auth : {
    username : couch_keys.username,
    password : couch_keys.password
  }
});


module.exports = {};

/*
 * This function creates a new db/corpus using parameters in the dbConnection
 * object, which user it is for, as well as callbacks for success or error. It
 * also builds out the default security settings (ie access control lists, roles
 * and role based permissions for the user's corpus implemented as security
 * settings on the created couchdb
 * 
 * The corpus is composed of the pouchname, prefixed with the user's username
 */
module.exports.createDbaddUser = function(dbConnection, user, successcallback,
    errorcallback) {
  dbConnection.pouchname = user.username + "-" + dbConnection.pouchname;
  console.log(new Date()+ " Creating a new database/corpus: " + dbConnection.pouchname);

  if (useLocalCouchRatherThanRemoteCouch
      && dbConnection.domain == node_config.usersDBExternalDomainName) {
    var c = new cradle.Connection();
  }else{

  var c = new cradle.Connection(dbConnection.protocol + dbConnection.domain + dbConnection.path,
      dbConnection.port, {
    auth : {
      username : couch_keys.username,
      password : couch_keys.password
    }
  // TODO make the username and password come from the user's default config
  // for their couch connection
  });

  }
  /*
   * Create the user, give them the admin role on their corpus,
   * add them to the fielddbuser role so that others can let them
   * see their corpora if they decide to let logged in
   * fielddbusers see their corpus.
   * 
   * references:
   * http://blog.mattwoodward.com/2012/03/definitive-guide-to-couchdb.html
   */
  var usersdb = c
  .database(
      "_users",
      function() {
        console
        .log(new Date() + " In the callback of opening the users database.");
      });
  var userid = 'org.couchdb.user:' + user.username;

  var userParamsForNewUser = {
      name : user.username,
      password : user.password,
      roles : [ dbConnection.pouchname + "_" + admin,
                dbConnection.pouchname + "_" + contributor,
                dbConnection.pouchname + "_" + collaborator, 
                dbConnection.pouchname + "_" + commenter,
                /* Give the user access to other corpora so they can see what it is like to collaborate */
                "lingllama-communitycorpus" + "_" + contributor,
                "public-firstcorpus" + "_" + collaborator,
                "fielddbuser" ],
                type : 'user'
  };
  usersdb.save(userid, userParamsForNewUser, function(err, doc) {
    if (doc == undefined) {
      doc = {
          error : err
      };
    }
    if (err != null || !doc.ok) {
      console.log(new Date()+ " Here are the errors " + util.inspect(err)
          + " \n Here is the doc we get back "
          + util.inspect(doc));

      if(typeof errorcallback == "function"){
        errorcallback();
      }

    } else {
      console.log(new Date()+ " user "+userid+" created as a CouchDB user on: "+ util.inspect(dbConnection));


      /*
       * Prepare the user's activity feed couch
       */
      createDBforUsersActivities(
          user.activityCouchConnection,
          user,
          function(res) {
            console
            .log(new Date() + " There was success in creating the users activity feed: "
                + res);

            /*
             * Prepare the user's first corpus
             */
            createDBforCorpus(
                dbConnection,
                user,
                function(res) {
                  console
                  .log(new Date() + " There was success in creating the users first corpus: "
                      + res);


                  if(typeof successcallback == "function"){
                    successcallback();
                  }


                },
                function(err) {
                  console
                  .log(new Date() + " There was an error in creating users first corpus: "
                      + err);
                  if(typeof errorcallback == "function"){
                    errorcallback();
                  }
                });


          },
          function(err) {
            console
            .log(new Date() + " There was an error in creating users activity feed: "
                + err);
            if(typeof errorcallback == "function"){
              errorcallback();
            }
          });




    }//end successful user creation
  });
};
var addRoleToUser = function(dbConnection, username, roles, successcallback,
    errorcallback) {
  console.log(new Date() + " In addRoleToUser "+util.inspect(roles)+" to "+username+" on " + util.inspect(dbConnection));

if (useLocalCouchRatherThanRemoteCouch
      && dbConnection.domain == node_config.usersDBExternalDomainName) {
    var c = new cradle.Connection();
  }else{
  var c = new cradle.Connection(dbConnection.protocol + dbConnection.domain + dbConnection.path,
      dbConnection.port, {
    auth : {
      username : couch_keys.username,
      password : couch_keys.password
    }
  // TODO make the username and password come from the user's default config
  // for their couch connection
  });
}
  var usersdb = c.database("_users",
      function() {
    console.log(new Date()
    + " In the callback of opening the users database.");
  });

  var userid = 'org.couchdb.user:' + username;
  usersdb.get(userid, function(err, doc) {
    if (err != null || !doc._id) {
      console.log(new Date() + " Here are the errors "
          + util.inspect(err) + " \n Here is the doc we get back "
          + util.inspect(doc));
      if(typeof errorcallback == "function"){
        return errorcallback(err, null, {
          message : "User not found."
        });
      }
      return;
    }
    var userold = doc;
    console.log(new Date()
    + " These are the users's roles before adding a role."
    + util.inspect(userold.roles));

    for ( var r in roles) {
      userold.roles.push(roles[r]);
    }
    var uniqueroles = _.unique(userold.roles);
    userold.roles = uniqueroles;

    usersdb.save(userold, function(err, doc) {
      if (doc == undefined) {
        doc = {
            error : err
        };
      }
      if (err != null || !doc.ok) {
        console.log(new Date() + " Here are the errors "
            + util.inspect(err) + " \n Here is the doc we get back "
            + util.inspect(doc));
        if(typeof errorcallback == "function"){
          return errorcallback(err, null, {
            message : "Problem adding role to user."
          });
        }
      } else {
        console.log(new Date() + " role " + roles
            + " created to the CouchDB user " + username + " on: "
            + util.inspect(dbConnection));
        if(typeof successcallback == "function"){
          return successcallback(null, {roles : roles}, {
            message : "User role added."
          });
        }
      }
    });
  });

  console.log("After calling the open to users database");

};
module.exports.addRoleToUser = addRoleToUser;

/*
 * This function creates a new corpus database
 * 
 * The db is composed of the pouchname
 */
var createDBforCorpus = function(dbConnection, user,
    success, error) {
  dbConnection.pouchname = dbConnection.pouchname;
  console.log(new Date()+ " Creating a new database/corpus: " + dbConnection.pouchname);
  if (useLocalCouchRatherThanRemoteCouch
      && dbConnection.domain == node_config.usersDBExternalDomainName) {
    var c = new cradle.Connection();
    //console.log(new Date()+ " Using a local couchdb running on the same server instead of  "+node_config.usersDBExternalDomainName);
  }else{
   //console.log(new Date()+ " Using a remote couchdb instead of "+node_config.usersDBExternalDomainName);
   var c = new cradle.Connection(dbConnection.protocol + dbConnection.domain + dbConnection.path,
      dbConnection.port, {
    auth : {
      username : couch_keys.username,
      password : couch_keys.password
    }
  // TODO make the username and password come from the user's default config
  // for their couch connection
  });
  }
  var db = c.database(dbConnection.pouchname);
  db
  .exists(function(err, exists) {
    if (err) {
      console.log(new Date()+ ' error', err);
      if (typeof errorcallback == "function") {
        errorcallback(err);
      }
    } else if (exists) {
      console.log(new Date()+ " The corpus "+dbConnection.pouchname+" exists, calling the errorcallback.");
      if (typeof error == "function") {
        error(dbConnection, "corpus_existed");
      }
    } else {
      // Create database/corpus
      console.log(new Date()+ ' Database/corpus ' + dbConnection.pouchname
          + ' does not exist, creating it.');
      db
      .create(function(err, res) {
        console.log(new Date()+ " In the callback of db create for "
            + dbConnection.pouchname);
        if (err) {
          console.log(new Date()+ " Here is the err: " + err);
        }
        /*
         * Upon success of db creation, set up the collaborator,
         * contributor and admin roles for this corpus
         * 
         * Admins: The admins can perform any operation on the corpus.
         * Members: By adding items to the members the corpus becomes
         * non-public in the sense of couch not allowing access. We can
         * still use FieldDB to perform a fine grained control by
         * creating a special public user which is essentially the
         * checkbox that the user can check to make the corpus private,
         * and adding all fielddbusers to a role fielddbusers which can
         * let the user make the corpus private to the world, but
         * viewable by fielddbusers (to let only signed in users comment
         * on their data etc)
         * 
         * If public corpus (by default its private): -signed in
         * fielddbusers can read other user's corpora until the user
         * takes that role off -public user (ie the general public) can
         * see the user's corpora through fielddb, but not directly the
         * couch database. This is how the public checkbox is
         * implemented in fielddb.
         * 
         * References: http://127.0.0.1:5984/john7corpus/_security
         */
        addRoleToUser(dbConnection, user.username, [
                                                    dbConnection.pouchname + "_" + admin,
                                                    dbConnection.pouchname + "_" + contributor,
                                                    dbConnection.pouchname + "_" + collaborator,
                                                    dbConnection.pouchname + "_" + commenter]);

        var securityParamsforNewDB = {
            "admins" : {
              "names" : [ user.username ],
              "roles" : [ dbConnection.pouchname + "_" + admin ]
            },
            "members" : {
              "names" : [],
              "roles" : [ dbConnection.pouchname + "_" + collaborator,
                          dbConnection.pouchname + "_" + contributor ]
            }
        };
        db.save("_security", securityParamsforNewDB,
            function(err, doc) {
          if (doc == undefined) {
            doc = {
                error : err
            };
          }
          if (err != null || !doc.ok) {
            console.log(new Date()+ " Here are the errors " + util.inspect(err)
                + " \n Here is the doc we get back "
                + util.inspect(doc));
          } else {
            console.log(new Date()+ " Corpus _security created");
          }
        });


        /*
         * Copy all design docs and the couchapp to the new user's database
         */
        c.replicate({"source": 'new_corpus', "target": dbConnection.pouchname}, function(){


          /*
           * Prepare corpus activity feed couch
           */
          createDBforCorpusTeamsActivities(
              dbConnection,
              user,
              function(res) {
                console
                .log(new Date() + " There was success in creating the corpus team's activity feed: "
                    + res);

                if(typeof success == "function"){
                  dbConnection.pouchname.replace("-activity_feed","");
                  success(dbConnection);
                }

              },
              function(err) {
                console
                .log(new Date() + " There was an error in creating the corpus team's activity feed: "
                    + err);
                if(typeof error == "function"){
                  error(dbConnection);
                }
              });
        });// end create activity feeds

      }); //end replicate defaults

    }
  });
};

module.exports.createDBforCorpus = createDBforCorpus;

/*
 * This function creates a new corpus team activity feed database
 * 
 * The db is composed of the pouchname
 */
var createDBforCorpusTeamsActivities = function(dbConnection, user,
    successcallback, errorcallback) {
  dbConnection.pouchname = dbConnection.pouchname + "-activity_feed";
  console.log(new Date()+ " Creating a new database/corpus: " + dbConnection.pouchname);
  if (useLocalCouchRatherThanRemoteCouch
      && dbConnection.domain == node_config.usersDBExternalDomainName) {
    var c = new cradle.Connection();
  }else{
   var c = new cradle.Connection(dbConnection.protocol + dbConnection.domain + dbConnection.path,
      dbConnection.port, {
    auth : {
      username : couch_keys.username,
      password : couch_keys.password
    }
  // TODO make the username and password come from the user's default config
  // for their couch connection
  });
  }
  var db = c.database(dbConnection.pouchname);
  db
  .exists(function(err, exists) {
    if (err) {
      console.log(new Date()+ ' error', err);
      if (typeof errorcallback == "function") {
        errorcallback(err);
      }
    } else if (exists) {
      console
      .log(new Date() + " The users activity db exists, calling the errorcallback.");
      if (typeof errorcallback == "function") {
        errorcallback(dbConnection, "corpus_existed");
      }
    } else {
      // Create database/corpus
      console.log(new Date()+ ' Database ' + dbConnection.pouchname
          + ' does not exist, creating it.');
      db
      .create(function(err, res) {
        console.log(new Date()+ " In the callback of db create for "
            + dbConnection.pouchname);

        if (err != null) {
          console.log(new Date()+ " Here are the errors " + util.inspect(err));
        } else {
          console.log(new Date()+ " corpus created");
        }

        /*
         * Upon success of db creation, set up the collaborator,
         * contributor and admin roles for this corpus teams activity
         * feed, at the moment its readers are the same as the corpus
         * itself, and its admins are only the app.
         * 
         * References: http://127.0.0.1:5984/john7corpus/_security
         */

        var securityParamsforNewDB = {
            "admins" : {
              "names" : [ "fielddbdbadmin" ],
              "roles" : []
            },
            "members" : {
              "names" : [],
              "roles" : [
                         dbConnection.pouchname.replace("-activity_feed","") + "_" + collaborator ,
                         dbConnection.pouchname.replace("-activity_feed","") + "_" + contributor ]
            }
        };
        db.save("_security", securityParamsforNewDB,
            function(err, doc) {
          if (doc == undefined) {
            doc = {
                error : err
            };
          }
          if (err != null || !doc.ok) {
            console.log(new Date()+ " Here are the errors " + util.inspect(err)
                + " \n Here is the doc we get back "
                + util.inspect(doc));
          } else {
            console.log(new Date()+ " TeamsActivities _security created");
          }
        });

        /*
         * Replicate the validation design docs and the couch app to the new activity feed
         */
        c.replicate({"source": 'new_corpus_activity_feed', "target": dbConnection.pouchname}, function(){
          if (typeof successcallback == "function") {
            successcallback();
          }
        });// end replicate defaults

      });// end createdb
    }
  });
};

/*
 * This function creates a new user's activity feed database
 * 
 * The db is composed of the pouchname
 */
var createDBforUsersActivities = function(dbConnection, user, successcallback,
    errorcallback) {
  console.log(new Date()+ " Creating a new database/corpus: " + dbConnection.pouchname);
  if (useLocalCouchRatherThanRemoteCouch
      && dbConnection.domain == node_config.usersDBExternalDomainName) {
    var c = new cradle.Connection();
  }else{
  var c = new cradle.Connection(dbConnection.protocol + dbConnection.domain + dbConnection.path,
      dbConnection.port, {
    auth : {
      username : couch_keys.username,
      password : couch_keys.password
    }
  // TODO make the username and password come from the user's default config
  // for their couch connection
  });
  }
  var db = c.database(dbConnection.pouchname);
  db.exists(function(err, exists) {
    if (err) {
      console.log(new Date()+ ' error', err);
      if (typeof errorcallback == "function") {
        errorcallback(err);
      }
    } else if (exists) {
      console.log(new Date()+ " The users activity db exists, calling the errorcallback.");
      var errmessage = 'The database already exists, this is problematic.';
      if (typeof errorcallback == "function") {
        errorcallback(errmessage);
      }
    } else {
      // Create database/corpus
      console.log(new Date()+ ' Database ' + dbConnection.pouchname
          + ' does not exist, creating it.');
      db.create(function(err, res) {
        console.log(new Date()+ " In the callback of db create for "
            + dbConnection.pouchname);
        if (err) {
          console.log(new Date()+ " Here is the err: " + err);
        }
        /*
         * Upon success of db creation, set up the collaborator, contributor and
         * admin roles for this corpus
         * 
         * Admins: Only the app is the admin Members: Only the user is a member
         * 
         * References: http://127.0.0.1:5984/john7corpus/_security
         */
        var securityParamsforNewDB = {
            "admins" : {
              "names" : [ "fielddbdbadmin" ],
              "roles" : []
            },
            "members" : {
              "names" : [ user.username ],
              "roles" : []
            }
        };
        db.save("_security", securityParamsforNewDB, function(err, doc) {
          if (doc == undefined) {
            doc = {
                error : err
            };
          }
          if (err != null || !doc.ok) {
            console.log(new Date()+ " Here are the errors " + util.inspect(err)
                + " \n Here is the doc we get back " + util.inspect(doc));
          } else {
            console.log(new Date()+ " UserActivity _security created");
          }
        });

        /*
         * Replicate the validation design docs and the couch app to the new activity feed
         */
        c.replicate({"source": 'new_user_activity_feed', "target": dbConnection.pouchname}, function(){
          if (typeof successcallback == "function") {
            successcallback();
          }
        });// end replicate defaults

      });// end createdb
    }
  });
};

module.exports.changeUsersPassword = function(dbConnection, user, newpassword,
    successcallback, errorcallback) {
  if (useLocalCouchRatherThanRemoteCouch
      && dbConnection.domain == node_config.usersDBExternalDomainName) {
    var c = new cradle.Connection();
  }else{
  var c = new cradle.Connection(dbConnection.protocol + dbConnection.domain + dbConnection.path,
      dbConnection.port, {
    auth : {
      username : couch_keys.username,
      password : couch_keys.password
    }
  // TODO make the username and password come from the user's default config
  // for their couch connection
  });
  }
  var usersdb = c.database("_users", function() {
    console.log(new Date() + " In the callback of opening the users database.");
  });

  // Get the user's current details,
  var userid = 'org.couchdb.user:' + user.username;
  usersdb.get(userid, function(err, doc) {
    var userold = doc;
    console.log(new Date() + " These are the users's details before changing their password."
        + util.inspect(userold));

    // Delete the user
    usersdb.remove(userid, userold._rev, function(err, res) {

      // Save the user with a new password
      var userParamsForNewUser = {
          name : user.username,
          password : newpassword,
          roles : userold.roles,
          previous_rev : userold._rev,
          type : 'user'
      };
      usersdb.save(userid, userParamsForNewUser, function(err, doc) {
        if (doc == undefined) {
          doc = {
              error : err
          };
        }
        if (err != null || !doc.ok) {
          console.log(new Date() + " Here are the errors " + util.inspect(err)
              + " \n Here is the doc we get back " + util.inspect(doc));
          if (typeof errorcallback == "function") {
            errorcallback(err);
          }
        } else {
          console.log(new Date() + " User's couchdb password changed old revision number: "+userold._rev);
          if (typeof successcallback == "function") {
            successcallback(doc);
          }
        }
      });

    });
  });

};
/*
 * End couch functions
 */
