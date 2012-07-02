/*
 * This module depends on non-node services which must be running before this file executes
 *  mongodb: a database to store users
 *  redis: a database to store and lookup permissions
 *  
 */


var everyauth       = require('everyauth')
    ,Promise        = everyauth.Promise
    ,mongoose       = require('mongoose')
    ,Schema         = mongoose.Schema
    ,ObjectId       = mongoose.SchemaTypes.ObjectId
    ,mongooseAuth   = require('mongoose-auth')
    ,everyauthconf  = require('./everyauthconfig')
    ,fs             = require('fs')
    
    
      ,_          = require('underscore')
      ,Backbone   = require('backbone')
      ,util       = require('util');


console.log("Loading the User Authentication and Permissions Module");

//Test creating a Backbone model 
var b = new Backbone.Model({name: "hi"});
console.log("\tBackbone models are working: "+util.inspect(b));


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
 */
everyauth.debug = true;
var UserSchema = new Schema({}), User;

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
        return {
          email : req.body.email,
          username : req.body.username,
          password : req.body.password
        };
      }
      ;

      function respondToGetMethod(req, res) {
        respond(res, {
          errors : [ 'Unsupported HTTP method.' ]
        });
      }

      function respondToSucceed(res, user) {
        if (!user)
          return;
        respond(res, {
          user : user
        });
      }

      function respondToFail(req, res, errors) {
        if (!errors || !errors.length)
          return;
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
      myHostname : 'http://local.host:3000',
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
