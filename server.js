var https = require('https'),
  express = require('express'),
  app     = express(),
  Q       = require('q'),
  md5     = require('MD5'),
  fs      = require('fs'),
  util    = require('util'),
  node_config = require("./lib/nodeconfig_local"),
  couch_keys  = require("./lib/couchkeys_devserver");

//read in the specified filenames as the security key and certificate
node_config.httpsOptions.key = fs.readFileSync(node_config.httpsOptions.key);
node_config.httpsOptions.cert = fs.readFileSync(node_config.httpsOptions.cert);

var connect = node_config.usersDbConnection.protocol + couch_keys.username + ':' +
  couch_keys.password + '@' + node_config.usersDbConnection.domain +
  ':' + node_config.usersDbConnection.port +
  node_config.usersDbConnection.path;
var nano = require('nano')(connect);

// configure Express
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger());
  app.use(express.static(__dirname + '/public'));
  app.use(express.cookieParser());
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.session({
    secret: 'CtlFYUMLlrwr1VdIr35'
  }));
  app.use(app.router);
});

/*
 * Routes
 */

app.get('/:user/:corpus', function(req, res) {

  var user = req.params.user;
  var corpus = req.params.corpus;
  var userdetails = {};

  getUser(user)
    .then(function(result) {
      userdetails = result;
      return getRequestedCorpus(result.corpuses, corpus);
    })
    .then(function(result) {
      var ghash = md5(userdetails.email);
      res.render('corpus', {json: result, ghash: ghash, user: userdetails});
    })
    .fail(function(error) {
      console.log(error);
      res.redirect('/' + user);
    })
    .done();

});

app.get('/:user', function(req, res) {

  var user = req.params.user;

  getUser(user)
    .then(function(result) {
      var ghash = md5(result.email);
      res.render('user', {json: result, ghash: ghash});
      // res.send(result);
    })
    .fail(function(error) {
      console.log(error);
      res.render('user', {json: {}, ghash: {}});
    })
    .done();

});

/*
 * Promise handlers
 */

function getUser(userId) {

  var df = Q.defer();
  var usersdb = nano.db.use(node_config.usersDbConnection.dbname);

  usersdb.get(userId, function(error, result) {
    if (error) {
      df.reject(new Error(error));
    } else {
      if (!result) {
        df.resolve({});
      } else {
        for (pouch in result.corpuses) {
          result.corpuses[pouch].phash = md5(result.corpuses[pouch].pouchname);
        }
        df.resolve(result);
      }
    }
  });

  return df.promise;

}

function getCorpus(pouchId, titleAsUrl, corpusid) {

  var df = Q.defer();
  var corpusdb = nano.db.use(pouchId);

  corpusdb.get(corpusid, function(error, result) {
    if (error) {
      console.log(error);
      df.reject(new Error(error));
    } else {
      if (!result) {
        console.log('No result');
        df.reject(new Error('No result'));
      } else {
        if (titleAsUrl && (result.titleAsUrl == titleAsUrl)) {
          console.log('Match found: ' + result.titleAsUrl);
          df.resolve(result);
        } else {
          console.log('No match: ' + result.titleAsUrl);
          df.reject(new Error('No match'));
        }
      }
    }
  });

  return df.promise;

}

function getRequestedCorpus(corporaArray, titleAsUrl) {

  var df = Q.defer();
  var resultingPromises = [];

  for (corpus in corporaArray) {
    resultingPromises[corpus] = getCorpus(corporaArray[corpus].pouchname, titleAsUrl, corporaArray[corpus].corpusid);
  }

  Q.allSettled(resultingPromises)
    .then(function(results) {
      results.forEach(function(result) {
          if (result.state === 'fulfilled') {
              var value = result.value;
              df.resolve(value);
          } else {
              var reason = result.reason;
              df.reject(reason);
          }
      });
  });

  return df.promise;

}

https.createServer(node_config.httpsOptions, app).listen(node_config.port);

console.log(new Date() + 'Node+Express server listening on port %d', node_config.port);
