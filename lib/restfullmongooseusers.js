/*
 * This module depends on non-node services which must be running before this file executes
 *  mongodb: a database to store users
 *  
 */


var everyauth       = require('everyauth')
    ,Promise        = everyauth.Promise
    ,mongoose       = require('mongoose')
    ,Schema         = mongoose.Schema
    ,ObjectId       = mongoose.SchemaTypes.ObjectId
    ,mongooseAuth   = require('mongoose-auth')
    ,everyauthconf  = require('./everyauthconfig')
    ,couchkeys      = require('./couchkeys')
    ,cradle         = require('cradle')
    ,fs             = require('fs')
    
    
      ,_          = require('underscore')
      ,Backbone   = require('backbone')
      ,util       = require('util');


console.log("Loading the User Authentication and Permissions Module");

//Test creating a Backbone model 
var b = new Backbone.Model({name: "hi"});
console.log("\tBackbone models are working: "+util.inspect(b));

/*
 * Couch functions
 */
//cradle.setup({
//  host: couchkeys.url,
//  cache: true, 
//  raw: false
//});

/*
 * This function creates a new db/corpus using parameters in the dbConnection
 * object, which user it is for, as well as callbacks for success or error. It
 * also builds out the default security settings (ie access control lists, roles
 * and role based permissions for the user's corpus implemented as security
 * settings on the created couchdb
 * 
 * The corpus is composed of the corpusname, prefixed with the user's username
 */
var createDbaddUser = function(dbConnection, user, successcallback, errorcallback){
  dbConnection.corpusname = user.username +"-"+ dbConnection.corpusname;
  console.log("Creating a new database/corpus: "+dbConnection.corpusname);
  var c = new cradle.Connection(
      dbConnection.protocol + dbConnection.domain,
      dbConnection.port, {
        auth : {
          username : couchkeys.username,
          password : couchkeys.password
        }
      //TODO make the username and password come from the user's default config for their couch connection
      });
  var db = c.database(dbConnection.corpusname);
  db.exists(function (err, exists) {
    if (err) {
      console.log('error', err);
      if(typeof errorcallback == "function"){
        errorcallback(err);
      }
    } else if (exists) {
      console.log("The corpus exists, calling the errorcallback.");
      var errmessage = 'The database/corpus already exists, this is problematic. You should choose another corpus name.';
      if(typeof errorcallback == "function"){
        errorcallback(errmessage);
      }
    } else {
      //Create database/corpus
      console.log('Database/corpus '+dbConnection.corpusname+' does not exist, creating it.');
      db.create(function(err,res){
        console.log("In the callback of db create for "+dbConnection.corpusname);
        console.log("Here is the err: "+err);
      
        /*
         * Upon success of db creation, set up the collaborator, contributor and admin roles for this corpus
         * 
         * Admins: The admins can perform any operation on the corpus. 
         * Members: By adding items to the members the corpus becomes non-public in the sense of 
         *  couch not allowing access. We can still use iField to perform a fine grained control by creating a 
         *  special ifieldpublicuser which is essentially the checkbox that the user can check to make the corpus private,
         *  and adding all ifieldusers to a role ifieldusers which can let the user make the corpus private to the world, 
         *  but viewable by ifieldusers (to let only signed in users comment on their data etc)
         * 
         * By default:
         * -signed in ifieldusers can read other user's corpora until the user takes that role off
         * -public user (ie the general public) can see the user's corpora through ifield, but not directly the couch database.
         *  This is how the public checkbox is implemented in ifield.
         *  
         *  References: http://127.0.0.1:5984/john7corpus/_security
         */
        var collaborator = "collaborator"; 
        var contributor = "contributor";
        var admin = "admin";
        var securityParamsforNewDB = {
            "admins" : {
              "names" : [ '"'+user.username+'"' ],
              "roles" : [ '"'+dbConnection.corpusname + "_" + admin+'"' ]
            },
            "members" : {
              "names" : ["ifieldpublicuser"],
              "roles" : [ '"'+dbConnection.corpusname + "_" + collaborator+'"',
                          '"'+dbConnection.corpusname + "_" + contributor+'"',
                          "ifielduser"]
            }
        };
        db.save("_security", securityParamsforNewDB, function (err, doc) {
	  if(doc == undefined){
	    doc = {error: err};
	  }
          console.log("Here are the errors "+util.inspect(err)+" \n Here is the doc we get back "+util.inspect(doc));
        });
        
        
        /*
         * Create the user, give them the admin role on their corpus, 
         * add them to the ifielduser role so that others can let them see their corpora 
         * if they decide to let logged in ifieldusers see their corpus.
         *
         * references: http://blog.mattwoodward.com/2012/03/definitive-guide-to-couchdb.html
         */
        var usersdb = c.database("_users", function(){
          console.log("In the callback of opening the users database.");
        });
        var userid = 'org.couchdb.user:'+user.username;
        var userParamsForNewUser  = {
            name: user.username, password: user.password, roles: ['"'+dbConnection.corpusname + "_" + admin+'"', "ifielduser"], type: 'user'
        };
        usersdb.save(userid, userParamsForNewUser, function (err, doc) {
	  if(doc == undefined){
            doc = {error: err};
          }
          console.log("Here are the errors "+util.inspect(err)+" \n Here is the doc we get back "+util.inspect(doc));
        });
        
        /*
         * Make the corpus writable by only contributors/admins that the user has authorized.
         */
        var blockNonContribAdminWrites = "function(new_doc, old_doc, userCtx) {   if( (userCtx.roles.indexOf('"
          +dbConnection.corpusname + "_" + contributor
          +"') == -1 ) && (userCtx.roles.indexOf('"
          +dbConnection.corpusname + "_" + admin
          +"') == -1 ) ) {     throw({forbidden: 'Not Authorized, you are not a "+contributor+" on "
          +dbConnection.corpusname
          +", you will have to ask "
          +user.username+" to add you as a "+contributor+". You currently have these roles: '+userCtx.roles});   } }  ";
        db.save("_design/blockNonContribAdminWrites", {
          "language": "javascript",
          "validate_doc_update": blockNonContribAdminWrites
        }, function (err, doc) {
	  if(doc == undefined){
            doc = {error: err};
          }
          console.log("Here are the errors "+util.inspect(err)+" \n Here is the doc we get back "+util.inspect(doc));
        });
        
        /*
         * The view that sorts by the Datum by dateModified.
         */
        var sortByDateModified = 
          "function (doc) {" +
            "if (doc.dateModified) {" +
              "emit(doc.dateModified, doc);" +
            "}" +
          "}";
        db.save("_design/get_datum_ids", {
          "language" : "javascript",
          "views" : {
            "by_date" : {
              "map" : sortByDateModified
            }
          } 
        }, function(err, doc) {
	  if(doc == undefined){
            doc = {error: err};
          }
          console.log("Here are the errors " + err + " \n Here is the doc we get back " + doc);
        });
             
        /**
         * Make the corpus' datums searchable.
         */
        var searchDatum = "function (doc) {" +
          "if ((doc.datumFields) && (doc.session)) {" +
            "var obj = {};" +
            "for (i = 0; i < doc.datumFields.length; i++) {" +
              "if (doc.datumFields[i].value) {" +
                "obj[doc.datumFields[i].label] = doc.datumFields[i].value;" +
              "}" +
            "}" +
            "if (doc.session.sessionFields) {" +
              "for (j = 0; j < doc.session.sessionFields.length; j++) {" +
                "if (doc.session.sessionFields[j].value) {" +
                  "obj[doc.session.sessionFields[j].label] = doc.session.sessionFields[j].value;" +
                "}" +
              "}" +
            "}" +
            "emit(obj, doc._id);" +
          "}" +
        "}";
        db.save("_design/get_datum_field", {
          "language": "javascript",
          "views": {
            "get_datum_fields" : {
              "map" : searchDatum
            }
          }
        }, function (err, doc) {
	  if(doc == undefined){
            doc = {error: err};
          }
          console.log("Here are the errors "+util.inspect(err)+" \n Here is the doc we get back "+util.inspect(doc));
        });
        
        /* 
         * TODO Populate design documents 
         */
        
        if(typeof successcallback == "function"){
          successcallback();
        }
        
      
      });//end createdb      
    }
  });
};
/*
 * End couch functions
 */



/**
 * this function compares the client and server's version of the user, combines them, saves them to the server and returns the user.
 * references: https://github.com/bnoguchi/mongoose-auth
 */
var syncUserDetails = function(User, clientsUser, serversUser, callback){
  console.log("this is the clients user");
  console.log(util.inspect(clientsUser));
  
//  console.log(" this is the servers user:");
//  console.log(util.inspect(serversUser));
  
  console.log("Updating "+clientsUser._id);
  try{
    User.findById(clientsUser._id, function (err, doc){
      doc.mostRecentIds = clientsUser.mostRecentIds;
      doc.prefs = clientsUser.prefs;
      doc.hotkeys = clientsUser.hotkeys;
      doc.sessionHistory = clientsUser.sessionHistory;
      doc.dataLists = clientsUser.dataLists;
      doc.activityHistory = clientsUser.activityHistory;
      doc.permissions = clientsUser.permissions;
      doc.teams = clientsUser.teams;
      
      doc.email = clientsUser.email;
//      username = clientsUser.username;
//      doc.password = clientsUser.password;
      doc.corpuses = clientsUser.corpuses;
      doc.gravatar = clientsUser.gravatar;
      doc.researchInterest = clientsUser.researchInterest;
      doc.affiliation = clientsUser.affiliation;
      doc.description = clientsUser.description;
      doc.subtitle = clientsUser.subtitle;
      firstname = clientsUser.firstname;
      lastname = clientsUser.lastname;

      doc.save( function (err, doc) {
        if (err) {
          console.log("Here are the errors "+util.inspect(err));
          if(typeof callback == "function"){
            callback(clientsUser);
          }
        }else{
          console.log("Save didnt error. This is what the saved doc looked like:" + util.inspect(doc));
          if(typeof callback == "function"){
            callback(doc);
          }
        }
      });

    });
  }catch(e){
    console.log("There was an error in trying to find the model and modify it."+util.inspect(e));
    if(typeof callback == "function"){
      callback(clientsUser);
    }
  }
};
  

////Test Redis and permissions
//console.log("Loading redis permissions");
////https://github.com/mranney/node_redis/blob/master/examples/web_server.js
//var mayi = new MotherMayI('localhost', 6379, 0);
////sapir the owner of Quechua Corpus is granted these actions 
//mayi.grant('user:sapir', 'admin', 'Quechua Corpus', function(success) {});
//mayi.grant('user:sapir', 'read', 'Quechua Corpus', function(success) {});
//mayi.grant('user:sapir', 'edit', 'Quechua Corpus', function(success) {});
//mayi.grant('user:sapir', 'comment', 'Quechua Corpus', function(success) {});
//mayi.grant('user:sapir', 'export', 'Quechua Corpus', function(success) {});
//mayi.grant('user:sapir', 'read', 'Quechua Corpus:datum', function(success) {});
//mayi.grant('user:sapir', 'addNew', 'Quechua Corpus:datum', function(success) {});
//mayi.grant('user:sapir', 'edit', 'Quechua Corpus:datum', function(success) {});
//mayi.grant('user:sapir', 'comment', 'Quechua Corpus:datum', function(success) {});
//mayi.grant('user:sapir', 'export', 'Quechua Corpus:datum', function(success) {});
//mayi.grant('user:sapir', 'read', 'Quechua Corpus:session', function(success) {});
//mayi.grant('user:sapir', 'addNew', 'Quechua Corpus:session', function(success) {});
//mayi.grant('user:sapir', 'edit', 'Quechua Corpus:session', function(success) {});
//mayi.grant('user:sapir', 'comment', 'Quechua Corpus:session', function(success) {});
//mayi.grant('user:sapir', 'export', 'Quechua Corpus:session', function(success) {});
//mayi.grant('user:sapir', 'read', 'Quechua Corpus:datalist', function(success) {});
//mayi.grant('user:sapir', 'addNew', 'Quechua Corpus:datalist', function(success) {});
//mayi.grant('user:sapir', 'edit', 'Quechua Corpus:datalist', function(success) {});
//mayi.grant('user:sapir', 'comment', 'Quechua Corpus:datalist', function(success) {});
//mayi.grant('user:sapir', 'export', 'Quechua Corpus:datalist', function(success) {});
//
////tillohash the consultant of Quechua Corpus is granted these actions
////mayi.grant('user:tillohash', 'admin', 'Quechua Corpus', function(success) {});
//mayi.grant('user:tillohash', 'read', 'Quechua Corpus', function(success) {});
//mayi.grant('user:tillohash', 'edit', 'Quechua Corpus', function(success) {});
//mayi.grant('user:tillohash', 'comment', 'Quechua Corpus', function(success) {});
////mayi.grant('user:tillohash', 'export', 'Quechua Corpus', function(success) {});
//mayi.grant('user:tillohash', 'read', 'Quechua Corpus:datum', function(success) {});
////mayi.grant('user:tillohash', 'addNew', 'Quechua Corpus:datum', function(success) {});
//mayi.grant('user:tillohash', 'edit', 'Quechua Corpus:datum', function(success) {});
//mayi.grant('user:tillohash', 'comment', 'Quechua Corpus:datum', function(success) {});
//mayi.grant('user:tillohash', 'export', 'Quechua Corpus:datum', function(success) {});
//mayi.grant('user:tillohash', 'read', 'Quechua Corpus:session', function(success) {});
//mayi.grant('user:tillohash', 'addNew', 'Quechua Corpus:session', function(success) {});
//mayi.grant('user:tillohash', 'edit', 'Quechua Corpus:session', function(success) {});
//mayi.grant('user:tillohash', 'comment', 'Quechua Corpus:session', function(success) {});
//mayi.grant('user:tillohash', 'export', 'Quechua Corpus:session', function(success) {});
//mayi.grant('user:tillohash', 'read', 'Quechua Corpus:datalist', function(success) {});
//mayi.grant('user:tillohash', 'addNew', 'Quechua Corpus:datalist', function(success) {});
//mayi.grant('user:tillohash', 'edit', 'Quechua Corpus:datalist', function(success) {});
//mayi.grant('user:tillohash', 'comment', 'Quechua Corpus:datalist', function(success) {});
//mayi.grant('user:tillohash', 'export', 'Quechua Corpus:datalist', function(success) {});
//
////public user interested in Quechua Corpus is granted these actions
////mayi.grant('user:public', 'admin', 'Quechua Corpus', function(success) {});
//mayi.grant('user:public', 'read', 'Quechua Corpus', function(success) {});
////mayi.grant('user:public', 'edit', 'Quechua Corpus', function(success) {});
//mayi.grant('user:public', 'comment', 'Quechua Corpus', function(success) {});
////mayi.grant('user:public', 'export', 'Quechua Corpus', function(success) {});
//mayi.grant('user:public', 'read', 'Quechua Corpus:datum', function(success) {});
////mayi.grant('user:public', 'addNew', 'Quechua Corpus:datum', function(success) {});
////mayi.grant('user:public', 'edit', 'Quechua Corpus:datum', function(success) {});
//mayi.grant('user:public', 'comment', 'Quechua Corpus:datum', function(success) {});
////mayi.grant('user:public', 'export', 'Quechua Corpus:datum', function(success) {});
//mayi.grant('user:public', 'read', 'Quechua Corpus:session', function(success) {});
////mayi.grant('user:public', 'addNew', 'Quechua Corpus:session', function(success) {});
////mayi.grant('user:public', 'edit', 'Quechua Corpus:session', function(success) {});
//mayi.grant('user:public', 'comment', 'Quechua Corpus:session', function(success) {});
////mayi.grant('user:public', 'export', 'Quechua Corpus:session', function(success) {});
//mayi.grant('user:public', 'read', 'Quechua Corpus:datalist', function(success) {});
////mayi.grant('user:public', 'addNew', 'Quechua Corpus:datalist', function(success) {});
////mayi.grant('user:public', 'edit', 'Quechua Corpus:datalist', function(success) {});
//mayi.grant('user:public', 'comment', 'Quechua Corpus:datalist', function(success) {});
////mayi.grant('user:public', 'export', 'Quechua Corpus:datalist', function(success) {});
//
////checking permitted actions
//mayi.may('user:public', 'edit', 'Quechua Corpus:datalist', function(may) {
// if(may) {
//     console.log('Please edit the datalist');
// } else {
//     console.log('You are not permitted to edit datalists');
// }
// 
//may.grant('userid', 'verb', 'corpusid:datum', function(success) {});     

//mayi.grant('user:Bilbo', 'wear', 'TheOneRing', function(success) {});
//mayi.may('user:Bilbo', 'wear', 'TheOneRing', function(may) {
//if(may) {
//   console.log('Bilbo may where the One Ring!');
//} else {
//   console.log('Bilbo may NOT wear the One Ring');
//}
//});



/*
 * Prepare everyauth and mongodb
 * 
 * references: https://github.com/bnoguchi/mongoose-auth/pull/89/files
 */
everyauth.debug = true;
var UserSchema = new Schema({
  mostRecentIds: Schema.Types.Mixed,
  gravatar: String,
  researchInterest: String,
  affiliation: String,
  description: String,
  subtitle: String,
  corpuses: Array,
  dataLists: Array,
  prefs: Schema.Types.Mixed,
  firstname: String,
  lastname: String,
  teams: Array,
  sessionHistory: Array,
  activities: Array,
  hotkeys: Schema.Types.Mixed
});
var User;

/*
 * Restful everyauth overrides for password logins
 * from https://gist.github.com/2938492
 */

UserSchema.plugin(mongooseAuth, {

  everymodule : {
    everyauth : {

      User : function() {
        return User;
      },

      handleLogout : function(req, res) {
        req.logout();
        res.contentType('application/json');
        res.send(JSON.stringify({
          user : null
        }));
      }
    }
  },
  password : {
    everyauth : (function() {

      var registerPath = '/register', loginPath = '/login';

      //from everyauth itself, add other fields here from the original POST 
      //which you want to include in the user creation
      function extractExtraRegistrationParams(req) {
        var userparams = {
          email : req.body.email,
          username : req.body.username,
          password : req.body.password,
          corpuses : req.body.corpuses,
          gravatar : req.body.gravatar,
          researchInterest : req.body.researchInterest,
          affiliation : req.body.affiliation,
          description : req.body.description,
          subtitle : req.body.subtitle,
          dataLists : req.body.dataLists,
          prefs : req.body.prefs,
          mostRecentIds : req.body.mostRecentIds,
          firstname : req.body.firstname,
          lastname : req.body.lastname,
          teams : req.body.teams,
          sessionHistory : req.body.sessionHistory,
          activityHistory : req.body.activityHistory,
          permissions : req.body.permissions,
          hotkeys : req.body.hotkeys
        };
        /*
         * Create a database here just before registering the user, ideally this
         * is too early, but it is the only time we have their unhashed password
         * so that it will match their couch password.
         */ 
        console.log("The userparams: " + util.inspect(userparams));
        console.log("Creating db/corpus for the user: "
            + util.inspect(userparams));

        createDbaddUser(
            userparams.corpuses[userparams.corpuses.length - 1],
            userparams, 
            function(res) {
              console.log("There was success in creating the corpus: "+res);
            }, function(err) {
              console.log("There was an error in creating the corpus: "+err);
            });

        //return userparams regardless of whether creating their corpus suceeded.
        //chances are that if the corpus existed, the user did too so mongoose-auth will give the proper error to the user
        //TODO this should be changed to pass the corpus error too perhaps, perhaps not.
        return userparams;
      };

      function respondToGetMethod(req, res) {
        respond(res, {
          errors : [ 'Unsupported HTTP method.' ]
        });
      }

      function respondToSucceed(res, user) {
        if (!user)
          return;
//        console.log("In the succeed function this is what the res req body looks like "+util.inspect(res.req.body));
        
        try{
          if(res.req.body.syncDetails == "true"){
            var clientuser = JSON.parse(res.req.body.syncUserDetails);
            syncUserDetails(User, clientuser, user, function(returneduser){
              //return the server's synced user
              respond(res, {
                user : returneduser
              });
            });
          }else{
            //return the standard response user created by mongoose auth
            respond(res, {
              user : user
            });
          }
        }catch(e){
          console.log("Somethign is wrong with the res structure. Returning user normally instead of syncing.");
        //return the standard response user created by mongoose auth
          respond(res, {
            user : user
          });
        }
      }

      function respondToFail(req, res, errors) {
        if (!errors || !errors.length){
          return;
        }
        console.log("Fail errors: "+util.inspect(errors));
        respond(res, {
          errors : errors
        });
      }

      function respond(res, output) {
        res.contentType('application/json');
        res.send(JSON.stringify(output));
      }

      return {
        getRegisterPath : registerPath,
        displayRegister : respondToGetMethod,
        postRegisterPath : registerPath,
        respondToRegistrationSucceed : respondToSucceed,
        respondToRegistrationFail : respondToFail,
        getLoginPath : loginPath,
        displayLogin : respondToGetMethod,
        postLoginPath : loginPath,
        respondToLoginSucceed : respondToSucceed,
        respondToLoginFail : respondToFail,
        extractExtraRegistrationParams : extractExtraRegistrationParams
      };

    })()
  },
  facebook : {
    everyauth : {
      myHostname : 'http://local.host:3000',
      appId : everyauthconf.facebook.appId,
      appSecret : everyauthconf.facebook.appSecret,
      redirectPath : '/'
    }
  },
  twitter : {
    everyauth : {
      myHostname : 'https://ifield.fieldlinguist.com',
      consumerKey : everyauthconf.twitter.consumerKey,
      consumerSecret : everyauthconf.twitter.consumerSecret,
      redirectPath : '/'
    }
  },
  github : {
    everyauth : {
      myHostname : 'http://local.host:3000',
      appId : everyauthconf.github.appId,
      appSecret : everyauthconf.github.appSecret,
      redirectPath : '/'
    }
  },
  google : {
    everyauth : {
      myHostname : 'http://localhost:3000',
      appId : everyauthconf.google.clientId,
      appSecret : everyauthconf.google.clientSecret,
      redirectPath : '/',
      scope : 'https://www.google.com/m8/feeds'
    }
  }
});


mongoose.model('User', UserSchema);

mongoose.connect('mongodb://localhost/test');

User = mongoose.model('User');
/*
 * End everyauth setup
 */

module.exports = UserSchema;


