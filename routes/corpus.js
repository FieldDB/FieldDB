var config = require("config");
var Connection = require("fielddb/api/corpus/Connection").Connection;
var CorpusMask = require("fielddb/api/corpus/CorpusMask").CorpusMask;
var Corpus = require("fielddb/api/corpus/Corpus").Corpus;
var Q = require("q");

var defaultCorpus = new Corpus(Corpus.prototype.defaults);

var getCorpusMask = function(dbname, next) {
  var deferred = Q.defer();
  var validateIdentifier = Connection.validateIdentifier(dbname);
  if (!dbname || validateIdentifier.identifier.length < 3 || !validateIdentifier.equivalent()) {
    console.log(new Date() + " someone requested an invalid dbname: " + validateIdentifier.identifier);
    var err = new Error("Not Found.");
    err.status = 404;
    err.userFriendlyErrors = ["This is a strange database identifier, are you sure you didn't mistype it?"];
    err.validateIdentifier = validateIdentifier;
    deferred.reject(err);
    next(err);
    return deferred.promise;
  }

  var corpusMask = new CorpusMask({
    dbname: validateIdentifier.identifier
  });
  // corpusMask.debugMode = true;

  corpusMask.fetch(config.corpus.url + "/" + validateIdentifier.identifier).then(function() {
    if (!corpusMask.copyright || corpusMask.copyright === "Default: Add names of the copyright holders of the corpus.") {
      corpusMask.copyright = corpusMask.team.name;
    }
    if (!corpusMask.license || !corpusMask.license.humanReadable) {
      corpusMask.license = defaultCorpus.license;
    }
    if (!corpusMask.termsOfUse || !corpusMask.termsOfUse.humanReadable) {
      corpusMask.termsOfUse = defaultCorpus.termsOfUse;
    }

    corpusMask.team.corpus = corpusMask;
    corpusMask.connection = corpusMask.connection || {};
    corpusMask.team.fetch(config.corpus.url + "/" + validateIdentifier.identifier).then(function() {
      console.log(new Date() + " owners's gravatar in this database " + corpusMask.team.gravatar, corpusMask.startYear);
      console.log(new Date() + " corpus connection's gravatar in this database " + corpusMask.connection.gravatar);
      console.log(new Date() + "  TODO consider saving corpus.json with the team inside.");
      // console.log("Corpus mask ", corpusMask.team.toJSON());
      deferred.resolve(corpusMask);
    }, function(err) {
      console.log("error fetching corpus team", err);
      deferred.resolve(corpusMask);
    }).fail(function(err) {
      console.log("error fetching corpus team", err);
      deferred.resolve(corpusMask);
    });
  }, next).fail(next);

  return deferred.promise;
};

var getCorpusMaskFromTitleAsUrl = function(userMask, titleAsUrl, next) {
  var deferred = Q.defer();
  var err;
  if (!userMask || !userMask.username) {
    err = new Error("Server errored, please report this 8234");
    deferred.reject(err);
    next(err);
    return deferred.promise;
  }
  if (!titleAsUrl) {
    err = new Error("This is a strange title for a database, are you sure you didn't mistype it?");
    err.status = 404;
    deferred.reject(err);
    next(err);
    return deferred.promise;
  }

  if (!userMask.corpora || !userMask.corpora.length) {
    err = new Error("Couldn't find any corpora for " + userMask.username + ", if this is an error please report it to us.");
    err.status = 404;
    deferred.reject(err);
    next(err);
    return deferred.promise;
  }
  if (typeof userMask.corpora.find !== "function") {
    err = new Error("Server errored, please report this 9313");
    deferred.reject(err);
    next(err);
    return deferred.promise;
  }

  titleAsUrl = titleAsUrl + "";
  titleAsUrl = titleAsUrl.toLowerCase();

  var matchingCorpusConnections = userMask.corpora.fuzzyFind("titleAsUrl", titleAsUrl)
    .concat(userMask.corpora.fuzzyFind("dbname", titleAsUrl));

  if (!matchingCorpusConnections || !matchingCorpusConnections.length) {
    deferred.reject({
      status: 404,
      userFriendlyErrors: ["Couldn't find " + titleAsUrl + " among " + userMask.username + "'s  " + userMask.corpora.length + " corpora."],
      error: {}
    });
    return deferred.promise;
  }

  var bestMatch;
  matchingCorpusConnections.map(function(connection) {
    // console.log("Looking at", connection.dbname);
    // handle situation where the user has access to >1 corpora by other users which have the same titleAsUrl
    if (connection.dbname && (connection.titleAsUrl.indexOf(titleAsUrl) > -1 || (userMask.username + "-" + titleAsUrl) === connection.dbname)) {
      if (!bestMatch) {
        // console.log(connection.titleAsUrl + " / " + connection.dbname + " was a pretty good match for " + titleAsUrl);
        bestMatch = connection;
        return;
      }
      if (bestMatch && (connection.titleAsUrl.length < bestMatch.length || connection.dbname.indexOf(userMask.username) === 0)) {
        // console.log("found " + connection.dbname + " was a better match than " + bestMatch.dbname);
        bestMatch = connection;
        return;
      }
    } else {
      // console.log(connection.titleAsUrl + " / " + connection.dbname + " wasnt the best match for " + titleAsUrl);
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
