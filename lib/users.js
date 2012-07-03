var cradle        = require('cradle')
      ,_          = require('underscore')
      ,Backbone   = require('backbone')
      ,MotherMayI = require('mothermayi').MotherMayI
      ,redis      = require('redis')
      ,util       = require('util');

// Test creating a Backbone model 
console.log("Loading the Users");
var b = new Backbone.Model({name: "hi"});
console.log(util.inspect(b));

// Test inserting the Backbone model into CouchDB
var c = new cradle.Connection("http://localhost", 5984, {});
c.database('test_insert').save(b.toJSON(), function(err, res) {
  if (err) {
    console.log("ERROR inserting into CouchDB:");
    console.log(util.inspect(err));
  } else {
    console.log('Inserted into CouchDB:');
    console.log(util.inspect(res));
  }
});

// Test Redis
console.log("Loading redis permissions");
//https://github.com/mranney/node_redis/blob/master/examples/web_server.js
var mayi = new MotherMayI('localhost', 6379, 0);
// sapir the owner of Quechua Corpus is granted these actions 
mayi.grant('user:sapir', 'admin', 'Quechua Corpus', function(success) {});
mayi.grant('user:sapir', 'read', 'Quechua Corpus', function(success) {});
mayi.grant('user:sapir', 'edit', 'Quechua Corpus', function(success) {});
mayi.grant('user:sapir', 'comment', 'Quechua Corpus', function(success) {});
mayi.grant('user:sapir', 'export', 'Quechua Corpus', function(success) {});
mayi.grant('user:sapir', 'read', 'Quechua Corpus:datum', function(success) {});
mayi.grant('user:sapir', 'addNew', 'Quechua Corpus:datum', function(success) {});
mayi.grant('user:sapir', 'edit', 'Quechua Corpus:datum', function(success) {});
mayi.grant('user:sapir', 'comment', 'Quechua Corpus:datum', function(success) {});
mayi.grant('user:sapir', 'export', 'Quechua Corpus:datum', function(success) {});
mayi.grant('user:sapir', 'read', 'Quechua Corpus:session', function(success) {});
mayi.grant('user:sapir', 'addNew', 'Quechua Corpus:session', function(success) {});
mayi.grant('user:sapir', 'edit', 'Quechua Corpus:session', function(success) {});
mayi.grant('user:sapir', 'comment', 'Quechua Corpus:session', function(success) {});
mayi.grant('user:sapir', 'export', 'Quechua Corpus:session', function(success) {});
mayi.grant('user:sapir', 'read', 'Quechua Corpus:datalist', function(success) {});
mayi.grant('user:sapir', 'addNew', 'Quechua Corpus:datalist', function(success) {});
mayi.grant('user:sapir', 'edit', 'Quechua Corpus:datalist', function(success) {});
mayi.grant('user:sapir', 'comment', 'Quechua Corpus:datalist', function(success) {});
mayi.grant('user:sapir', 'export', 'Quechua Corpus:datalist', function(success) {});

//tillohash the consultant of Quechua Corpus is granted these actions
// mayi.grant('user:tillohash', 'admin', 'Quechua Corpus', function(success) {});
mayi.grant('user:tillohash', 'read', 'Quechua Corpus', function(success) {});
mayi.grant('user:tillohash', 'edit', 'Quechua Corpus', function(success) {});
mayi.grant('user:tillohash', 'comment', 'Quechua Corpus', function(success) {});
// mayi.grant('user:tillohash', 'export', 'Quechua Corpus', function(success) {});
mayi.grant('user:tillohash', 'read', 'Quechua Corpus:datum', function(success) {});
// mayi.grant('user:tillohash', 'addNew', 'Quechua Corpus:datum', function(success) {});
mayi.grant('user:tillohash', 'edit', 'Quechua Corpus:datum', function(success) {});
mayi.grant('user:tillohash', 'comment', 'Quechua Corpus:datum', function(success) {});
mayi.grant('user:tillohash', 'export', 'Quechua Corpus:datum', function(success) {});
mayi.grant('user:tillohash', 'read', 'Quechua Corpus:session', function(success) {});
mayi.grant('user:tillohash', 'addNew', 'Quechua Corpus:session', function(success) {});
mayi.grant('user:tillohash', 'edit', 'Quechua Corpus:session', function(success) {});
mayi.grant('user:tillohash', 'comment', 'Quechua Corpus:session', function(success) {});
mayi.grant('user:tillohash', 'export', 'Quechua Corpus:session', function(success) {});
mayi.grant('user:tillohash', 'read', 'Quechua Corpus:datalist', function(success) {});
mayi.grant('user:tillohash', 'addNew', 'Quechua Corpus:datalist', function(success) {});
mayi.grant('user:tillohash', 'edit', 'Quechua Corpus:datalist', function(success) {});
mayi.grant('user:tillohash', 'comment', 'Quechua Corpus:datalist', function(success) {});
mayi.grant('user:tillohash', 'export', 'Quechua Corpus:datalist', function(success) {});

//public user interested in Quechua Corpus is granted these actions
// mayi.grant('user:public', 'admin', 'Quechua Corpus', function(success) {});
mayi.grant('user:public', 'read', 'Quechua Corpus', function(success) {});
// mayi.grant('user:public', 'edit', 'Quechua Corpus', function(success) {});
mayi.grant('user:public', 'comment', 'Quechua Corpus', function(success) {});
// mayi.grant('user:public', 'export', 'Quechua Corpus', function(success) {});
mayi.grant('user:public', 'read', 'Quechua Corpus:datum', function(success) {});
// mayi.grant('user:public', 'addNew', 'Quechua Corpus:datum', function(success) {});
// mayi.grant('user:public', 'edit', 'Quechua Corpus:datum', function(success) {});
mayi.grant('user:public', 'comment', 'Quechua Corpus:datum', function(success) {});
// mayi.grant('user:public', 'export', 'Quechua Corpus:datum', function(success) {});
mayi.grant('user:public', 'read', 'Quechua Corpus:session', function(success) {});
// mayi.grant('user:public', 'addNew', 'Quechua Corpus:session', function(success) {});
// mayi.grant('user:public', 'edit', 'Quechua Corpus:session', function(success) {});
mayi.grant('user:public', 'comment', 'Quechua Corpus:session', function(success) {});
// mayi.grant('user:public', 'export', 'Quechua Corpus:session', function(success) {});
mayi.grant('user:public', 'read', 'Quechua Corpus:datalist', function(success) {});
// mayi.grant('user:public', 'addNew', 'Quechua Corpus:datalist', function(success) {});
// mayi.grant('user:public', 'edit', 'Quechua Corpus:datalist', function(success) {});
mayi.grant('user:public', 'comment', 'Quechua Corpus:datalist', function(success) {});
// mayi.grant('user:public', 'export', 'Quechua Corpus:datalist', function(success) {});

//checking permitted actions
mayi.may('user:public', 'edit', 'Quechua Corpus:datalist', function(may) {
	  if(may) {
	      console.log('Please edit the datalist');
	  } else {
	      console.log('You are not permitted to edit datalists');
	  }, 
	  
// may.grant('userid', 'verb', 'corpusid:datum', function(success) {}); 	  

//mayi.grant('user:Bilbo', 'wear', 'TheOneRing', function(success) {});
//mayi.may('user:Bilbo', 'wear', 'TheOneRing', function(may) {
//  if(may) {
//      console.log('Bilbo may where the One Ring!');
//  } else {
//      console.log('Bilbo may NOT wear the One Ring');
//  }
});


var users = c.database("users");
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
        username: twitterUserData.screen_name,
        name: twitterUserData.name,
	gravatar: twitterUserData.profile_image_url,
        twitterId: twitterUserData.id,
   	twitterUserData: twitterUserData
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
