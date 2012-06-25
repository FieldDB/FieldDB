var cradle = require('cradle'),
    util   = require('util');
var couchkeys = require('../couchkeys');
var c = new cradle.Connection(couchkeys.url, 80, {
  auth: { username: couchkeys.username, password: couchkeys.password}
});
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
      var doc = {
        accessToken: accessToken,
        accessTokenSecret: accessTokenSecret,
        name: twitterUserData.name,
        twitterId: twitterUserData.id
      };
      c.database('users').save(doc, function(err, res) {
        if (err) {
          console.log("Error using users:");
          console.log(err);
          promise.fail(err);
          return;
        }
        console.log('user created: ' + util.inspect(doc));
        promise.fulfill(doc);
      })
    }
  });
}
