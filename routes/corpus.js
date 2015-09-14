var CorpusMask = require("fielddb/api/corpus/CorpusMask").CorpusMask;
var Connection = require("fielddb/api/corpus/Connection").Connection;
var getTeamMask = require("./team").getTeamMask;
var Q = require("q");

var cleanErrorStatus = function(status) {
  if (status && status.length === 3) {
    return status;
  }
  return "";
};

var getCorpusMask = function(dbname, nano) {
  var deferred = Q.defer();

  Q.nextTick(function() {
    if (!nano) {
      console.log(new Date() + " the server is misconfigured and cannot reply request for corpus mask: " + dbname);
      deferred.reject({
        status: 500,
        userFriendlyErrors: ["Server errored, please report this 5342"]
      });
      return;
    }

    if (!dbname || typeof dbname.trim !== "function") {
      dbname = "";
    } else {
      dbname = dbname.trim().toLowerCase();
    }
    var validateIdentifier = Connection.validateIdentifier(dbname);
    if (!dbname || validateIdentifier.identifier.length < 3 || validateIdentifier.identifier !== validateIdentifier.original) {
      console.log(new Date() + " someone requested an invalid dbname: " + validateIdentifier.identifier);
      deferred.reject({
        status: 404,
        userFriendlyErrors: ["This is a strange database identifier, are you sure you didn't mistype it?"],
        error: validateIdentifier
      });
      return;
    }

    var corpusdb = nano.db.use(dbname);
    corpusdb.get("corpus", function(error, corpusMask) {
      if (error || !corpusMask) {
        console.log(new Date() + " corpusMask was missing " + dbname);
        error = error || {};
        error.status = cleanErrorStatus(error.statusCode) || 500;
        var userFriendlyErrors = ["Database details not found"];
        if (error.code === "ECONNREFUSED") {
          userFriendlyErrors = ["Server errored, please report this 6339"];
        } else if (error.code === "ETIMEDOUT") {
          error.status = 500;
          userFriendlyErrors = ["Server timed out, please try again later"];
        }
        deferred.reject({
          status: error.status,
          error: error,
          userFriendlyErrors: userFriendlyErrors
        });
        return;
      }

      corpusMask = new CorpusMask(corpusMask);
      var year = new Date(corpusMask.dateCreated).getFullYear();
      if (year < new Date().getFullYear()) {
        corpusMask.startYear = " " + year + " - ";
      }
      getTeamMask(corpusMask.dbname, nano).then(function(teamMask) {
        corpusMask.team = teamMask;
      }, function() {
        corpusMask.team = {};
      }).fail(function(exception) {
        console.log(new Date() + " ", exception.stack);
        deferred.reject({
          status: 500,
          error: exception,
          userFriendlyErrors: ["Server errored, please report this 78923"]
        });
      }).done(function() {
        deferred.resolve(corpusMask);
      });
    });

  });

  return deferred.promise;
};

var getCorpus = function getCorpus(dbname, titleAsUrl, corpusid) {

  dbname = sanitizeAgainstInjection(dbname);
  if (!dbname) {
    res.status(404);
    res.redirect("404.html")
    return;
  }
  titleAsUrl = sanitizeAgainstInjection(titleAsUrl);
  if (titleAsUrl === false) {
    res.status(404);
    res.redirect("404.html")
    return;
  }
  corpusid = sanitizeAgainstInjection(corpusid);
  //console.log("The corpus id" + corpusid);
  if (corpusid === false) {
    res.status(404);
    res.redirect("404.html")
    return;
  }

  var df = Q.defer();
  var corpusdb = nano.db.use(dbname);
  var doc = corpusid;
  var showPublicVersion = true;
  if (showPublicVersion) {
    doc = 'corpus';
  }
  //console.log("Getting corpus public mask");
  corpusdb.get(doc, function(error, result) {
    if (error) {
      console.log(new Date() + " there was a problem getting corpusdb", error);
      df.reject(new Error(error));
    } else {
      if (!result) {
        console.log(new Date() + 'No result', result);
        df.reject(new Error('No result'));
      } else {
        result = new CorpusMask(result);
        //console.log(" Recieved result corpus mask");
        df.resolve(result);
      }
    }
  });

  return df.promise;

}

function getRequestedCorpus(corporaCollection, titleAsUrl, corpusowner) {

  var df = Q.defer();
  var resultingPromises = [];

  corporaCollection.map(function(connection) {
    resultingPromises.push(getCorpus(connection.dbname, titleAsUrl, connection.corpusid))
  });

  //console.log("Requested corpus masks " + resultingPromises.length);
  Q.allSettled(resultingPromises)
    .then(function(results) {

      results = results.map(function(result) {
        if (result.state === 'fulfilled') {
          //console.log(" Got back a corpus mask for " + result.value.dbname);
          if (!result.value.connection) {
            result.value.connection = corporaCollection[result.value.dbname];
          }
          // corporaCollection[value.dbname] = value;
          // corporaCollection[value.dbname] 
          // // var value = new CorpusMask(result.value);
          // result.value.connection.gravatar = result.value.connection.gravatar || md5(result.value.dbname)
          result.value.corpuspage = corpusowner + '/' + result.value.titleAsUrl + '/' + result.value.dbname;
          return result.value
        } else {
          console.log(new Date() + " One of the corpora had no corpus document." + corpusowner)
          return new CorpusMask({
            corpuspage: corpusowner + '/Unknown/' + corpusowner + '-firstcorpus',
            title: 'Unknown',
            dbname: corpusowner + '-firstcorpus',
            connection: corporaCollection[corpusowner + '-firstcorpus'],
            gravatar: "",
            description: 'Private corpus'
          });
        }
      });

      // for (corpus in corporaCollection) {
      //   //console.log("Processing corpus", corporaCollection[corpus]);
      //   corporaCollection[corpus] = new CorpusMask({
      //     connection: corporaCollection[corpus]
      //   });

      //   // {
      //   //   corpuspage: corpusowner + '/Unknown/' + corpusowner + '-firstcorpus',
      //   //   title: 'Unknown',
      //   //   gravatar: md5(corporaCollection[corpus].dbname),
      //   //   description: 'Private corpus'
      //   // };

      // }
      df.resolve(results);
    }).done(function() {
      //console.log("done promises");
    });

  return df.promise;

}


exports.getCorpusMask = getCorpusMask;
