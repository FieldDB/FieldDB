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

app.get('/activity/:pouchname', function(req, res) {

  var pouchname = req.params.pouchname + '-activity_feed';
  var activitydb = nano.db.use(pouchname);
  var data = {'rows': [{'key': {'action': 'testdata', 'week': 50}, 'value': 77},{'key': {'action': 'added', 'week': 21}, 'value': 1},{'key': {'action': 'added', 'week': 22}, 'value': 1},{'key': {'action': 'attempted', 'week': 12}, 'value': 1},{'key': {'action': 'commented', 'week': 12}, 'value': 21},{'key': {'action': 'downloaded', 'week': 4}, 'value': 6},{'key': {'action': 'imported', 'week': 12}, 'value': 31},{'key': {'action': 'modified', 'week': 26}, 'value': 7},{'key': {'action': 'updated', 'week': 4}, 'value': 10},{'key': {'action': 'updated', 'week': 12}, 'value': 13},{'key': {'action': 'updated', 'week': 21}, 'value': 51},{'key': {'action': 'updated', 'week': 22}, 'value': 1},{'key': {'action': 'updated', 'week': 26}, 'value': 64},{'key': {'action': 'uploaded', 'week': 4}, 'value': 3}]};

  activitydb.view('activities', 'one-year-weekly', {group: true}, function(err, body) {
    if (!err) {
      res.send(body);
    } else {
      res.send(data);
    }
  });

});

app.get('/db/:pouchname', function(req, res) {

  var pouchname = req.params.pouchname;

  getCorpusFromPouchname(pouchname)
    .then(function(result) {
      result.corpus.corpusinfo.copyright = result.corpus.corpusinfo.copyright || result.team.username;
      if(result.corpus.corpusinfo.copyright.indexOf("Add names of the copyright holders") > -1){
        result.corpus.corpusinfo.copyright = result.team.username;
      }
      var defaultLicense = {
        title: "Creative Commons Attribution-ShareAlike (CC BY-SA).",
        humanReadable: "This license lets others remix, tweak, and build upon your work even for commercial purposes, as long as they credit you and license their new creations under the identical terms. This license is often compared to “copyleft” free and open source software licenses. All new works based on yours will carry the same license, so any derivatives will also allow commercial use. This is the license used by Wikipedia, and is recommended for materials that would benefit from incorporating content from Wikipedia and similarly licensed projects.",
        link: "http://creativecommons.org/licenses/by-sa/3.0/"
      };
      if(!result.corpus.corpusinfo.license || typeof result.corpus.corpusinfo.license == "string"){
        result.corpus.corpusinfo.license = defaultLicense;
      }
      result.corpus.corpusinfo.license.title = result.corpus.corpusinfo.license.title.replace(/Default:/,"");
      console.log(result.corpus.corpusinfo.license);
      var defaultTerms = {
        humanReadable: "Sample terms of use: The materials included in this corpus are available for research and educational use. If you want to use the materials for commercial purposes, please notify the author(s) of the corpus (myemail@myemail.org) prior to the use of the materials. Users of this corpus can copy and redistribute the materials included in this corpus, under the condition that the materials copied/redistributed are properly attributed.  Modification of the data in any copied/redistributed work is not allowed unless the data source is properly cited and the details of the modification is clearly mentioned in the work. Some of the items included in this corpus may be subject to further access conditions specified by the owners of the data and/or the authors of the corpus."
      };
      if (!result.corpus.corpusinfo.termsOfUse) {
        if (result.corpus.corpusinfo.terms && typeof result.corpus.corpusinfo.terms !== "string") {
          result.corpus.corpusinfo.termsOfUse = result.corpus.corpusinfo.terms;
        } else {
          result.corpus.corpusinfo.termsOfUse = defaultTerms;
        }
      }
      if (result.corpus.corpusinfo.terms) {
        delete result.corpus.corpusinfo.terms;
      }
     
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
      result.corpus.corpusinfo.copyright = result.corpus.corpusinfo.copyright || result.team.username;
      if(result.corpus.corpusinfo.copyright.indexOf("Add names of the copyright holders") > -1){
        result.corpus.corpusinfo.copyright = result.team.username;
      }
      var defaultLicense = {
        title: "Creative Commons Attribution-ShareAlike (CC BY-SA).",
        humanReadable: "This license lets others remix, tweak, and build upon your work even for commercial purposes, as long as they credit you and license their new creations under the identical terms. This license is often compared to “copyleft” free and open source software licenses. All new works based on yours will carry the same license, so any derivatives will also allow commercial use. This is the license used by Wikipedia, and is recommended for materials that would benefit from incorporating content from Wikipedia and similarly licensed projects.",
        link: "http://creativecommons.org/licenses/by-sa/3.0/"
      };
      if(!result.corpus.corpusinfo.license || typeof result.corpus.corpusinfo.license == "string"){
        result.corpus.corpusinfo.license = defaultLicense;
      }
      result.corpus.corpusinfo.license.title = result.corpus.corpusinfo.license.title.replace(/Default:/,"");
      console.log(result.corpus.corpusinfo.license);

      var defaultTerms = {
        humanReadable: "Sample terms of use: \"The materials included in this corpus are available for research and educational use. If you want to use the materials for commercial purposes, please notify the author(s) of the corpus (myemail@myemail.org) prior to the use of the materials. Users of this corpus can copy and redistribute the materials included in this corpus, under the condition that the materials copied/redistributed are properly attributed.  Modification of the data in any copied/redistributed work is not allowed unless the data source is properly cited and the details of the modification is clearly mentioned in the work. Some of the items included in this corpus may be subject to further access conditions specified by the owners of the data and/or the authors of the corpus.\""
      };
      if (!result.corpus.corpusinfo.termsOfUse) {
        if (result.corpus.corpusinfo.terms && typeof result.corpus.corpusinfo.terms !== "string") {
          result.corpus.corpusinfo.termsOfUse = result.corpus.corpusinfo.terms;
        } else {
          result.corpus.corpusinfo.termsOfUse = defaultTerms;
        }
      }
      if (result.corpus.corpusinfo.terms) {
        delete result.corpus.corpusinfo.terms;
      }

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
    res.render(template, data);
  })
    .fail(function(error) {
    console.log(error);
    var redirect = '/public';
    if (corpus) {
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
        corpus.gravatar = corpus.gravatar || md5(pouchname);
        result.corpus = {corpusinfo: corpus};
        corpusdb.get('team', function(error, team) {
          if (error) {
            df.reject(new Error(error));
          } else {
            if (!team) {
              result.team = {};
              df.resolve(result);
            } else {
              if (!team.gravatar || team.gravatar.indexOf("anonymousbydefault") > -1) {
                if (team.email) {
                  team.gravatar = md5(team.email);
                } else {
                  team.gravatar = md5(pouchname);
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
        result.firstname =  result.firstname || "";
        result.lastname =  result.lastname || "";
        result.subtitle = result.subtitle || result.firstname + ' ' + result.lastname;
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
  var showPublicVersion = true;
  if (showPublicVersion) {
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
            corpusowner = value.pouchname.replace(/-.*/, '');
            value.url = corpusowner + '/' + value.titleAsUrl + '/' + value.pouchname;
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
