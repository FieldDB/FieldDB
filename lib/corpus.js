var config = require("config");
var debug = require("debug")("lib:corpus");
var Connection = require("fielddb/api/corpus/Connection").Connection;
var CorpusMask = require("fielddb/api/corpus/CorpusMask").CorpusMask;
var Corpus = require("fielddb/api/corpus/Corpus").Corpus;
var Q = require("q");

var defaultCorpus = new Corpus(Corpus.prototype.defaults);

var getCorpusMask = function(dbname, next) {
  debug("Get getCorpusMask", dbname);
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
    if (!corpusMask.termsOfUse) {
      corpusMask.termsOfUse = defaultCorpus.termsOfUse;
    }

    corpusMask.team.corpus = corpusMask;
    corpusMask.connection = corpusMask.connection || {};
    corpusMask.team.fetch(config.corpus.url + "/" + validateIdentifier.identifier).then(function() {
      console.log(new Date() + " owners's gravatar in this database " + corpusMask.team.gravatar, corpusMask.startYear);
      console.log(new Date() + " corpus connection's gravatar in this database " + corpusMask.connection.gravatar);
      console.log(new Date() + "  TODO consider saving corpus.json with the team inside.");
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
  debug("Get getCorpusMaskFromTitleAsUrl", userMask, titleAsUrl);
  var deferred = Q.defer();
  var err;
  var dbname;
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
    err = new Error("Couldn't find any corpora for " + userMask.username + ", also tried by constructing the dbname.");
    err.status = 404;
    dbname = userMask.username + "-" + titleAsUrl;
    return getCorpusMask(dbname, function(actualError) {
      console.error("getCorpusMaskFromTitleAsUrl " + dbname, actualError, err);
      next(err);
    });
  }
  if (typeof userMask.corpora.find !== "function") {
    err = new Error("Server errored, please report this 9313");
    deferred.reject(err);
    next(err);
    return deferred.promise;
  }

  titleAsUrl = titleAsUrl + "";
  titleAsUrl = titleAsUrl.toLowerCase();

  // userMask.corpora.debugMode = true;
  var matchingCorpusConnections = userMask.corpora.findCorpusConnectionFromTitleAsUrl(titleAsUrl, userMask.username);
  userMask.corpora.debug('matchingCorpusConnections', matchingCorpusConnections);
  if (!matchingCorpusConnections || !matchingCorpusConnections.length) {
    matchingCorpusConnections = userMask.corpora.fuzzyFind("dbname", titleAsUrl).concat(userMask.corpora.fuzzyFind("titleAsUrl", titleAsUrl));
    userMask.corpora.debug('matchingCorpusConnections using dbname', matchingCorpusConnections);
  }

  if (!matchingCorpusConnections || !matchingCorpusConnections.length) {
    err = new Error("Couldn't find " + titleAsUrl + " among " + userMask.username + "'s  " + userMask.corpora.length + " corpora.");
    err.status = 404;
    dbname = userMask.username + "-" + titleAsUrl;
    return getCorpusMask(dbname, function(actualError) {
      console.error("getCorpusMaskFromTitleAsUrl " + dbname, actualError, err);
      next(err);
    });
  }

  var bestMatch  = matchingCorpusConnections[0];
  console.log(new Date() + " user's default gravatar " + userMask.gravatar);
  userMask.corpora.debug(new Date() + " best match " + bestMatch.dbname);
  return getCorpusMask(bestMatch.dbname, next);
};

exports.getCorpusMask = getCorpusMask;
exports.getCorpusMaskFromTitleAsUrl = getCorpusMaskFromTitleAsUrl;
