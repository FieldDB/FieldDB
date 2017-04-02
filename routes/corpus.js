var config = require("config");
var CorpusMask = require("fielddb/api/corpus/CorpusMask").CorpusMask;
var Connection = require("fielddb/api/corpus/Connection").Connection;
var Q = require("q");

var getCorpusMask = function(dbname) {
  var validateIdentifier = Connection.validateIdentifier(dbname);
  if (!dbname || validateIdentifier.identifier.length < 3 || !validateIdentifier.equivalent()) {
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
    dbname: validateIdentifier.identifier
  });
  // corpusMask.debugMode = true;

  return corpusMask.fetch(config.corpus.url + "/" + validateIdentifier.identifier).then(function() {
    if (corpusMask.copyright === "Default: Add names of the copyright holders of the corpus.") {
      corpusMask.copyright = corpusMask.team.name;
    }

    corpusMask.team.corpus = corpusMask;
    return corpusMask.team.fetch(config.corpus.url + "/" + validateIdentifier.identifier).then(function() {
      console.log(new Date() + " owners's gravatar in this database " + corpusMask.team.gravatar);
      console.log(new Date() + "  TODO consider saving corpus.json with the team inside.");
      // console.log("Corpus mask ", corpusMask.team.toJSON());
      return corpusMask;
    }).fail(function(err) {
      console.log("fail to fetch corpus team", err);
      return corpusMask;
    });
  }).fail(function(exception) {
    console.log(new Date() + " ", exception.stack);
    var deferred = Q.defer();
    deferred.reject({
      status: 500,
      error: exception,
      userFriendlyErrors: ["Server errored, please report this 78923"]
    });
    return deferred.promise;
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

  titleAsUrl = titleAsUrl + "";
  titleAsUrl = titleAsUrl.toLowerCase();

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
      if (!bestMatch) {
        bestMatch = connection;
        return;
      }
      if (bestMatch && connection.titleAsUrl.length < bestMatch.length) {
        bestMatch = connection;
        return;
      }
    }
    console.log(connection.titleAsUrl + " wasnt the best match for " + titleAsUrl, connection.dbname);
  });
  if (!bestMatch) {
    bestMatch = matchingCorpusConnections[0];
  }
  console.log(new Date() + " user's default gravatar " + userMask.gravatar);
  return getCorpusMask(bestMatch.dbname);
};

exports.getCorpusMask = getCorpusMask;
exports.getCorpusMaskFromTitleAsUrl = getCorpusMaskFromTitleAsUrl;
