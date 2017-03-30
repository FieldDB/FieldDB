var config = require("config");
var CorpusMask = require("fielddb/api/corpus/CorpusMask").CorpusMask;
var Connection = require("fielddb/api/corpus/Connection").Connection;
var Q = require("q");

var getCorpusMask = function(dbname) {
  if (!dbname || typeof dbname.trim !== "function") {
    dbname = "";
  } else {
    dbname = dbname.trim().toLowerCase();
  }
  var validateIdentifier = Connection.validateIdentifier(dbname);
  if (!dbname || validateIdentifier.identifier.length < 3 || validateIdentifier.identifier !== validateIdentifier.original) {
    console.log(new Date() + " someone requested an invalid dbname: " + validateIdentifier.identifier);
    var deferred = Q.defer();
    deferred.reject({
      status: 404,
      userFriendlyErrors: ["This is a strange database identifier, are you sure you didn't mistype it?"],
      error: validateIdentifier
    });
    return deferred.promise;
  }

  var corpusMask = new CorpusMask({
    dbname: dbname,
    url: config.corpus.url + "/" + dbname
  });

  return corpusMask.fetch().then(function() {
    if (corpusMask.copyright === "Default: Add names of the copyright holders of the corpus.") {
      corpusMask.copyright = corpusMask.team.name;
    }
    console.log(new Date() + " corpus team ", corpusMask.team.gravatar);
    // if (optionalUserMask) {
    //   corpusMask.team = optionalUserMask;
    //   return corpusMask;
    // }
    // return corpusMask;

    // console.log("Corpus mask ", corpusMask.team.toJSON());
    corpusMask.team.corpus = corpusMask;
    return corpusMask.team.fetch().then(function(fetched) {
      console.log(new Date() + " owners's gravatar in this database " + corpusMask.team.description);
      console.log(new Date() + "  TODO consider saving corpus.json with the team inside.");
      // console.log("Corpus mask ", corpusMask.team.toJSON());
      return corpusMask;
    }, function() {
      return corpusMask;
    }).fail(function() {
      return corpusMask;
    });
  }).fail(function(exception) {
    console.log(new Date() + " ", exception.stack);
    return deferred.reject({
      status: 500,
      error: exception,
      userFriendlyErrors: ["Server errored, please report this 78923"]
    });
  });
};

var getCorpusMaskFromTitleAsUrl = function(userMask, titleAsUrl) {
  var deferred = Q.defer();
  if (!userMask || !userMask.username) {
    deferred.reject({
      status: 500,
      userFriendlyErrors: ["Server errored, please report this 8234"]
    });
    return deferred.promise;
  }
  if (!titleAsUrl) {
    deferred.reject({
      status: 404,
      userFriendlyErrors: ["This is a strange title for a database, are you sure you didn't mistype it?"]
    });
    return deferred.promise;
  } else {
    titleAsUrl = titleAsUrl + "";
    titleAsUrl = titleAsUrl.toLowerCase();
  }
  if (!userMask.corpora || !userMask.corpora.length) {
    deferred.reject({
      status: 404,
      userFriendlyErrors: ["Couldn't find any corpora for " + userMask.username + ", if this is an error please report it to us."]
    });
    return deferred.promise;
  }
  if (typeof userMask.corpora.find !== "function") {
    deferred.reject({
      status: 500,
      userFriendlyErrors: ["Server errored, please report this 9313"]
    });
    return deferred.promise;
  }

  var matchingCorpusConnections = userMask.corpora.fuzzyFind("titleAsUrl", titleAsUrl);
  if (!matchingCorpusConnections || !matchingCorpusConnections.length) {
    matchingCorpusConnections = userMask.corpora.fuzzyFind("dbname", titleAsUrl);
    if (!matchingCorpusConnections || !matchingCorpusConnections.length) {
      deferred.reject({
        status: 404,
        userFriendlyErrors: ["Couldn't find " + titleAsUrl + " among " + userMask.username + "'s  " + userMask.corpora.length + " corpora."],
        error: {}
      });
      return deferred.promise;
    }
  }

  var bestMatch;
  matchingCorpusConnections.map(function(connection) {
    // handle situation where the user has access to >1 corpora by other users which have the same titleAsUrl
    if (connection.titleAsUrl.toLowerCase().indexOf(titleAsUrl) > -1 && connection.dbname && connection.dbname.indexOf(userMask.username) === 0) {
      bestMatch = connection;
    } else {
      console.log(connection.titleAsUrl + " wasnt the best match for " + titleAsUrl, connection.dbname);
    }
  });
  if (!bestMatch) {
    bestMatch = matchingCorpusConnections[0];
  }
  console.log(new Date() + " user's default gravatar " + userMask.gravatar);
  return getCorpusMask(bestMatch.dbname);
};

exports.getCorpusMask = getCorpusMask;
exports.getCorpusMaskFromTitleAsUrl = getCorpusMaskFromTitleAsUrl;
