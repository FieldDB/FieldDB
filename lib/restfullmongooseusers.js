
var everyauth  = require('everyauth')
    ,Promise        = everyauth.Promise
    
    ,mongoose   = require('mongoose')
    ,Schema         = mongoose.Schema
    ,ObjectId       = mongoose.SchemaTypes.ObjectId
    
    ,mongooseAuth  = require('mongoose-auth')
    ,everyauthconf = require('./everyauthconfig')

    ,fs         = require('fs');

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
     
      //from https://github.com/bnoguchi/mongoose-auth
      var extraParams = {
          username : String
        };
      
      //from everyauth itself
      function extractExtraRegistrationParams(req){
        return {
          email: req.body.email,
          username: req.body.username,
          password: req.body.password
          };
      };
      
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


    //Adds login: String

    mongoose.model('User', UserSchema);

    mongoose.connect('mongodb://localhost/test');

    User = mongoose.model('User');
    /*
     * End everyauth setup
     */

module.exports = UserSchema;
