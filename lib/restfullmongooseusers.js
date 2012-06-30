
var everyauth  = require('everyauth')
    ,Promise        = everyauth.Promise
    
    ,mongoose   = require('mongoose')
    ,Schema         = mongoose.Schema
    ,ObjectId       = mongoose.SchemaTypes.ObjectId
    
    ,mongooseAuth  = require('mongoose-auth')
    ,everyauthconf = require('./everyauthconfig')

    ,fs         = require('fs');

   


    /*
     * Everyauth set up
     */
    everyauth.debug = true;
    var UserSchema = new Schema({})
    , User;

    UserSchema.plugin(mongooseAuth, {
      everymodule: {
        everyauth: {
            User: function () {
              return User;
            }
        }
      }
    , facebook: {
        everyauth: {
            myHostname: 'http://local.host:3000'
          , appId: everyauthconf.facebook.appId
          , appSecret: everyauthconf.facebook.appSecret
          , redirectPath: '/'
        }
      }
    , twitter: {
        everyauth: {
            myHostname: 'http://local.host:3000'
          , consumerKey: everyauthconf.twitter.consumerKey
          , consumerSecret: everyauthconf.twitter.consumerSecret
          , redirectPath: '/'
        }
      }
    , password: {
          loginWith: 'email'
        , extraParams: {
              phone: String
            , name: {
                  first: String
                , last: String
              }
          }
        , everyauth: {
              getLoginPath: '/login'
            , postLoginPath: '/login'
            , loginView: 'login.jade'
            , getRegisterPath: '/register'
            , postRegisterPath: '/register'
            , registerView: 'register.jade'
            , loginSuccessRedirect: '/'
            , registerSuccessRedirect: '/'
          }
      }
    , github: {
        everyauth: {
            myHostname: 'http://local.host:3000'
          , appId: everyauthconf.github.appId
          , appSecret: everyauthconf.github.appSecret
          , redirectPath: '/'
        }
      }
    , google: {
        everyauth: {
            myHostname: 'http://localhost:3000'
          , appId: everyauthconf.google.clientId
          , appSecret: everyauthconf.google.clientSecret
          , redirectPath: '/'
          , scope: 'https://www.google.com/m8/feeds'
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
