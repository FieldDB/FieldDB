var https = require('https'),
  express = require('express'),
  app = express(),
  Q = require('q'),
  md5 = require('MD5'),
  fs = require('fs'),
  util = require('util'),
  node_config = require("./lib/nodeconfig_devserver"),
  couch_keys = require("./lib/couchkeys_devserver");

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
app.get('/db/:pouchname', function(req, res) {

  var pouchname = req.params.pouchname;

  getCorpusFromPouchname(pouchname)
    .then(function(result) {
      var data = {
        corpora: [result.corpus],
        ghash: result.team.gravatar,
        user: result.team
      };
      res.render('corpus', data);
  })
    .fail(function(error) {
    console.log(error);
    res.redirect('/public');
  })
    .done();

});

app.get('/:user/:corpus/:pouchname', function(req, res) {

  var pouchname = req.params.pouchname;

  getCorpusFromPouchname(pouchname)
    .then(function(result) {
      var data = {
        corpora: [result.corpus],
        ghash: result.team.gravatar,
        user: result.team
      };
      res.render('corpus', data);
  })
    .fail(function(error) {
    console.log(error);
    res.redirect('/public');
  })
    .done();

});

app.get('/:user/:corpus', function(req, res) {

  var user = req.params.user;
  var corpus = req.params.corpus;

  getData(res, user, corpus);

});

app.get('/:user', function(req, res) {

  var user = req.params.user;

  getData(res, user);

});

/*
 * Promise handlers
 */

function getData(res, user, corpus) {

  var userdetails = {};

  getUser(user)
    .then(function(result) {
    userdetails = result;
    return getRequestedCorpus(result.corpuses, corpus, user);
  })
    .then(function(result) {
    var ghash = md5(userdetails.email);
    var data = {
      corpora: result,
      ghash: ghash,
      user: userdetails
    };
    var template = corpus ? 'corpus' : 'user';
    console.log(template);
    console.log(data);
    res.render(template, data);
  })
    .fail(function(error) {
    console.log(error);
    var redirect = '/public/';
    if(corpus){
      redirect = '/' + user;
    }
    res.redirect(redirect);
  })
    .done();

}

function getCorpusFromPouchname(pouchname) {

  var df = Q.defer();
  var corpusdb = nano.db.use(pouchname);
  var result = {};

  corpusdb.get('corpus', function(error, corpus) {
    if (error) {
      df.reject(new Error(error));
    } else {
      if (!corpus) {
        df.resolve({});
      } else {
        corpus.gravatar =  corpus.gravatar || md5(pouchname);
        result.corpus = {corpusinfo: corpus};
        corpusdb.get('team', function(error, team) {
          if (error) {
            df.reject(new Error(error));
          } else {
            if (!team) {
              result.team = {};
              df.resolve(result);
            } else {
              if(!team.gravatar){
                if (team.email) {
                  team.gravatar = md5(team.email);
                } else {
                  teami.gravatar = md5(pouchname);
                }
              }
              team.subtitle = team.subtitle || team.firstname + ' ' + team.lastname;
              result.team = team;
              df.resolve(result);
            }
          }
        });

      }
    }
  });

  return df.promise;

}

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
        result.subtitle = result.subtitle || result.firstname + ' ' + result.lastname
        df.resolve(result);
      }
    }
  });

  return df.promise;

}

function getCorpus(pouchId, titleAsUrl, corpusid) {

  var df = Q.defer();
  var corpusdb = nano.db.use(pouchId);
  var doc = corpusid;
  var public = true;
  if (public) {
    doc = 'corpus';
  }
  corpusdb.get(doc, function(error, result) {
    if (error) {
      console.log(error);
      df.reject(new Error(error));
    } else {
      if (!result) {
        console.log('No result');
        df.reject(new Error('No result'));
      } else {
        df.resolve(result);
      }
    }
  });

  return df.promise;

}

function getRequestedCorpus(corporaArray, titleAsUrl, corpusowner) {

  var df = Q.defer();
  var resultingPromises = [];

  for (corpus in corporaArray) {
    resultingPromises[corpus] = getCorpus(corporaArray[corpus].pouchname, titleAsUrl, corporaArray[corpus].corpusid);
  }

  Q.allSettled(resultingPromises)
    .then(function(results) {
    for (corpus in corporaArray) {
      corporaArray[corpus].corpusinfo = {
        url: corpusowner + '/Unknown/' + corpusowner + '-firstcorpus',
        title: 'Unknown',
        gravatar: md5(corporaArray[corpus].pouchname),
        description: 'Private corpus'
      };
      results.forEach(function(result) {
        if (result.state === 'fulfilled') {
          var value = result.value;
          if (corporaArray[corpus].pouchname == value.pouchname) {
            corpusowner = value.pouchname.replace(/-.*/,'');
            value.url = corpusowner + '/' + value.titleAsUrl + '/'+ value.pouchname;
            value.gravatar = md5(corporaArray[corpus].pouchname);
            corporaArray[corpus].corpusinfo = value;
          }
        }
      });
    }
    df.resolve(corporaArray);
  });

  return df.promise;

}

https.createServer(node_config.httpsOptions, app).listen(node_config.port);

console.log(new Date() + 'Node+Express server listening on port %d', node_config.port);
