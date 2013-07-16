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

  var pouchname = req.params.pouchname;

  Date.prototype.getWeek = function(dowOffset) {
    dowOffset = typeof(dowOffset) == 'int' ? dowOffset : 0;
    var newYear = new Date(this.getFullYear(), 0, 1);
    var day = newYear.getDay() - dowOffset;
    day = (day >= 0 ? day : day + 7);
    var daynum = Math.floor((this.getTime() - newYear.getTime() -
      (this.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) / 86400000) + 1;
    var weeknum;
    if (day < 4) {
      weeknum = Math.floor((daynum + day - 1) / 7) + 1;
      if (weeknum > 52) {
        nYear = new Date(this.getFullYear() + 1, 0, 1);
        nday = nYear.getDay() - dowOffset;
        nday = nday >= 0 ? nday : nday + 7;
        weeknum = nday < 4 ? 1 : 53;
      }
    } else {
      weeknum = Math.floor((daynum + day - 1) / 7);
    }
    return weeknum;
  };

  var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var data = {"rows":[{"key":{"action":"added","week":50},"value":77},{"key":{"action":"added","week":21},"value":1},{"key":{"action":"added","week":22},"value":1},{"key":{"action":"attempted","week":12},"value":1},{"key":{"action":"commented","week":12},"value":21},{"key":{"action":"downloaded","week":4},"value":6},{"key":{"action":"imported","week":12},"value":31},{"key":{"action":"modified","week":26},"value":7},{"key":{"action":"updated","week":4},"value":10},{"key":{"action":"updated","week":12},"value":13},{"key":{"action":"updated","week":21},"value":51},{"key":{"action":"updated","week":22},"value":1},{"key":{"action":"updated","week":26},"value":64},{"key":{"action":"uploaded","week":4},"value":3}]};

  var matrix = {};
  var weeknow = new Date().getWeek();

  for (var row in data.rows) {
    matrix[data.rows[row].key.action] = matrix[data.rows[row].key.action] || [];
    if (data.rows[row].key.week <= weeknow) { //move dates to last week and before
      var diff = 52 - weeknow;
      matrix[data.rows[row].key.action][data.rows[row].key.week + diff] = data.rows[row].value;
    } else { //move dates to beginning of table
      matrix[data.rows[row].key.action][53 - data.rows[row].key.week] = data.rows[row].value;
    }
  }

  // console.log(matrix);

  var s = '<table style="table-layout:fixed;width:675px;font-family:monospace;font-size:0.75em">';

  // Set up the 53 data columns
  s += '<col style="width:80px">';
  for (var i = 1; i < 53; i++) {
    s += '<col style="width:1.1em">';
  }

  // Add bi-monthly column descriptors
  // 2627994240 = appx 1 month in milliseconds
  s += '<tr><td>';
  var now = new Date();
  for (var i = 11; i >= 0; i--) {
    if (i % 3 === 0) {
      s += '<td colspan=5 style="text-align:right">';
    } else {
      s += '<td colspan=4 style="text-align:right">';
    }
    s += months[new Date(now.getTime() - 2627994240 * i).getMonth()] + ' ';
    s += (new Date(now.getTime() - 2627994240 * i).getFullYear() + '').slice(-2);
  }

  // Fill in data squares in either blanks, or three shades of red:
  // Darker = more transactions.
  for (var verb in matrix) {
    s += '<tr><td style="text-align:right;height:1em">' + verb;
    for (var i = 1; i < 53; i++) {
      if (matrix[verb][i] === undefined) {
        s += '<td style="background:whitesmoke;height:1em">';
      } else {
        var counts = matrix[verb][i];
        if (counts <= 10) {
          s += '<td title="' + counts + '" style="background-color:#FCC;height:1em">';
        }
        if (counts > 10 && counts <= 50) {
          s += '<td title="' + counts + '" style="background-color:#F66;height:1em">';
        }
        if (counts > 50) {
          s += '<td title="' + counts + '" style="background-color:#C00;height:1em">';
        }
      }
    }
  }

  s += '</table>';

  res.send(s);

});

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
              if (!team.gravatar) {
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
