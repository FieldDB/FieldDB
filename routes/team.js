var nanoErrorHandler = require("./../lib/error-handler").nanoErrorHandler;
var Team = require("fielddb/api/user/Team").Team;
var Connection = require("fielddb/api/corpus/Connection").Connection;
var Q = require("q");

var cleanErrorStatus = function(status) {
  if (status && status.length === 3) {
    return status;
  }
  return "";
};

var getTeamMask = function(dbname, nano) {
  var deferred = Q.defer();

  Q.nextTick(function() {
    if (!nano) {
      console.log(new Date() + " the server is misconfigured and cannot reply request for team mask: " + dbname);
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
    corpusdb.get("team", function(error, teamMask) {
      if (error || !teamMask) {
        console.log(new Date() + " teamMask was missing " + dbname);
        var reason = nanoErrorHandler(error, ["Team " + dbname + " details not found."]);
        deferred.reject(reason);
        return;
      }

      teamMask = new Team(teamMask);
      deferred.resolve(teamMask);
    });
  });
  return deferred.promise;
};
exports.getTeamMask = getTeamMask;
