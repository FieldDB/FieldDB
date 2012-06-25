var cradle        = require('cradle')
      ,_          = require('underscore')
      ,Backbone   = require('backbone')
      ,acl        = require('acl')
      ,redis      = require('redis')
      ,util       = require('util');

var couchkeys = require('../couchkeys');
var c = new cradle.Connection(couchkeys.url, 80, {
  auth: { username: couchkeys.username, password: couchkeys.password}
});

console.log("Loading the Users");
var b = new Backbone.Model({name: "hi"});
console.log(util.inspect(b));

console.log("Loading redis permissions");
//https://github.com/mranney/node_redis/blob/master/examples/web_server.js
var redisClient = require("redis").createClient(6379, '127.0.0.1');
acl = new acl(redisClient);
console.log("Testing redis permission inserts and queries");
redisClient.sadd("bigset", "a member");

//acl.allow('guest', 'users', 'view');
//acl.allow('guest', 'corpora', 'view');
//acl.allow('authenticateduser', 'datum', 'view');
//acl.addUserRoles('sapir', 'authenticateduser');
//acl.isAllowed('sapir', 'datum', 'view', function(err, res){
//  if(res){
//      console.log("User joed is allowed to view blogs");
//  }
//});


var users = c.database(couchkeys.usersdb);
exports.findOrCreateByTwitterData = function(twitterUserData, accessToken, accessTokenSecret, promise) {
  users.view('docs/twitterId', {key: twitterUserData.id_str}, function(err, docs) {
    if (err) {
      console.log("Error using users/_design/docs/_view/twitterId:");
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
        username: twitterUserData.username,
        name: twitterUserData.name,
        twitterId: twitterUserData.id
      });
      console.log(util.inspect(u));
      
      var doc = u.toJSON();
      c.database('users').save(doc, function(err, res) {
        if (err) {
          console.log("Error using users:");
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
