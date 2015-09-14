var CorpusMask = require("fielddb/api/corpus/CorpusMask").CorpusMask;
var Connection = require("fielddb/api/corpus/Connection").Connection;
var getTeamMask = require("./team").getTeamMask;
var Q = require("q");

var cleanErrorStatus = function(status) {
  if (status && status < 600) {
    return status;
  }
  return "";
};

var OVERWRITE_TEAM_INFO_FROM_DB_ON_DEFAULTS = false;

var getCorpusMask = function(dbname, nano, optionalUserMask) {
  var deferred = Q.defer();

  Q.nextTick(function() {
    if (!nano) {
      console.log(new Date() + " the server is misconfigured and cannot reply request for corpus mask: " + dbname);
      deferred.reject({
        status: 500,
        userFriendlyErrors: ["Server errored, please report this 3242"]
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
        var userFriendlyErrors = ["Database " + dbname + " details not found"];
        if (error.code === "ECONNREFUSED") {
          userFriendlyErrors = ["Server errored, please report this 6339"];
        } else if (error.code === "ETIMEDOUT") {
          error.status = 500;
          userFriendlyErrors = ["Server timed out, please try again later"];
        }
        delete error.uri;
        deferred.reject({
          status: error.status,
          error: error.error,
          userFriendlyErrors: userFriendlyErrors
        });
        return;
      }

      if (!corpusMask.dbname) {
        corpusMask.dbname = dbname;
        console.log(new Date() + "  the corpus for " + dbname + " was missing a poucname/dbname TODO consider saving it.");
      }
      corpusMask = new CorpusMask(corpusMask);
      if (corpusMask.copyright === "Default: Add names of the copyright holders of the corpus.") {
        corpusMask.copyright = corpusMask.team.username;
      }
      // console.log("Corpus mask ", corpusMask.team.toJSON());
      getTeamMask(corpusMask.dbname, nano).then(function(teamMask) {
        if (OVERWRITE_TEAM_INFO_FROM_DB_ON_DEFAULTS && optionalUserMask) {
          corpusMask.team.merge("self", optionalUserMask.toJSON(), "overwrite");
        }
        corpusMask.team.merge("self", teamMask, "overwrite");
        console.log(new Date() + "  TODO consider saving corpus.json with the team inside.");
        // console.log("Corpus mask ", corpusMask.team.toJSON());
      }, function() {
        if (!corpusMask.team) {
          corpusMask.team = {};
        }
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

var getCorpusMaskFromTitleAsUrl = function(userMask, titleAsUrl, nano) {
  var deferred = Q.defer();
  if (!nano) {
    console.log(new Date() + " the server is misconfigured and cannot reply request for corpus mask from titleAsUrl: " + titleAsUrl);
    deferred.reject({
      status: 500,
      userFriendlyErrors: ["Server errored, please report this 3242"]
    });
    return deferred.promise;
  }
  if (!userMask || !userMask.username) {
    deferred.reject({
      status: 500,
      userFriendlyErrors: ["Server errored, please report this 8234"]
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

  var matchingCorpusConnections = userMask.corpora.fuzzyFind("titleAsUrl", titleAsUrl);
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
    // handle situation where the user has access to >1 corpora by other users which have the same titleAsUrl
    if (connection.titleAsUrl === titleAsUrl && connection.dbname && connection.dbname.indexOf(userMask.username) === 0) {
      bestMatch = connection;
    } else {
      console.log(connection.titleAsUrl + " wasnt the best match for " + titleAsUrl, connection.dbname);
    }
  });
  if (!bestMatch) {
    bestMatch = matchingCorpusConnections[0];
  }
  return getCorpusMask(bestMatch.dbname, nano, userMask);
};

exports.getCorpusMask = getCorpusMask;
exports.getCorpusMaskFromTitleAsUrl = getCorpusMaskFromTitleAsUrl;
