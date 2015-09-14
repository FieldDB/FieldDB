var User = require("fielddb/api/user/User").User;
var Connection = require("fielddb/api/corpus/Connection").Connection;
var Q = require("q");

var cleanErrorStatus = function(status) {
  if (status && status.length === 3) {
    return status;
  }
  return "";
};

var getUserMask = function getUserMask(username, nano, usersDbConnectionDBname) {
  var deferred = Q.defer();

  Q.nextTick(function() {
    if (!nano || !usersDbConnectionDBname) {
      console.log(new Date() + " the server is misconfigured and cannot reply request for user mask: " + username);
      deferred.reject({
        status: 500,
        userFriendlyErrors: ["Server errored, please report this 5342"]
      });
      return;
    }

    if (!username || typeof username.trim !== "function") {
      username = "";
    } else {
      username = username.trim().toLowerCase();
    }
    var validateIdentifier = Connection.validateIdentifier(username);
    if (!username || validateIdentifier.identifier !== validateIdentifier.original) {
      console.log(new Date() + " someone requested an invalid username: " + validateIdentifier.identifier);
      deferred.reject({
        status: 404,
        userFriendlyErrors: ["This is a strange username, are you sure you didn't mistype it?"],
        error: validateIdentifier
      });
      return;
    }

    var usersdb = nano.db.use(usersDbConnectionDBname);
    usersdb.get(username, function(error, userPrivateDetails) {
      if (error) {
        console.log(new Date() + " missing user " + username, error);
        error = error || {};
        error.status = cleanErrorStatus(error.statusCode) || 500;
        var userFriendlyErrors = ["User not found"];
        if (error.code === "ECONNREFUSED") {
          userFriendlyErrors = ["Server errored, please report this 6339"];
        }
        deferred.reject({
          status: error.status,
          error: error,
          userFriendlyErrors: userFriendlyErrors
        });
        return;
      }

      if (!userPrivateDetails || !userPrivateDetails._id) {
        console.log(new Date() + " user was empty " + username, error);
        deferred.resolve({});
        return;
      }
      console.log(" found user " + username);

      userPrivateDetails = new User(userPrivateDetails);
      if (!userPrivateDetails.userMask) {
        // Cause the mask to be default
        userPrivateDetails.userMask = {};
      }

      if (userPrivateDetails.dateCreated) {
        var year = new Date(userPrivateDetails.dateCreated).getFullYear();
        if (year < new Date().getFullYear()) {
          userPrivateDetails.userMask.startYear = " " + year + " - ";
        }
      }
      if (userPrivateDetails.userMask.corpora && userPrivateDetails.userMask.corpora.length) {
        console.log(new Date() + " getting the user " + username + " their current corpora ", userPrivateDetails.corpora.length);
        deferred.resolve(userPrivateDetails.userMask);
      } else {
        userPrivateDetails.userMask.corpora = [];
        var promises = [];

        userPrivateDetails.corpora.map(function(corpusConnection) {
          if (corpusConnection.dbname === "public-firstcorpus" || corpusConnection.dbname === "lingllama-communitycorpus") {
            return;
          }
          corpusConnection = corpusConnection.toJSON();
          if (corpusConnection.title !== corpusConnection.dbname) {
            // This corpus has already information 
            userPrivateDetails.userMask.corpora.push(corpusConnection);
            return;
          }
          corpusConnection = userPrivateDetails.userMask.corpora.push(corpusConnection);
          corpusConnection.title = "Private Corpus";
          console.log(" looking at ", corpusConnection.toJSON());

          var corpusConnectionPromise = Q.defer();
          promises.push(corpusConnectionPromise.promise);
          console.log(" Requesting the corpus mask details", corpusConnection.dbname);

          // Download the corpus mask 
          nano.db.use(corpusConnection.dbname).get("corpus", function(error, fullCorpusMask) {
            if (error) {
              corpusConnectionPromise.reject(error);
              console.log(new Date() + " wasnt able to find the corpus mask details on the server");
              return;
            }
            console.log(" Downloaded the corpus mask details", fullCorpusMask);
            corpusConnection.title = fullCorpusMask.title;
            corpusConnection.description = fullCorpusMask.description;

            if (!corpusConnection.gravatar && fullCorpusMask.team && fullCorpusMask.team.gravatar) {
              corpusConnection.gravatar = fullCorpusMask.team.gravatar;
              console.log(" Downloaded the corpus mask details", corpusConnection.toJSON());
              corpusConnectionPromise.resolve(corpusConnection);
            } else {
              // Download the team 
              nano.db.use(corpusConnection.dbname).get("team", function(error, fullTeamMask) {
                if (error) {
                  console.log(new Date() + " wasnt able to find the team details on the server");
                }
                if (fullTeamMask && fullTeamMask.gravatar) {
                  corpusConnection.gravatar = fullTeamMask.gravatar
                }
                corpusConnectionPromise.resolve(corpusConnection);
              });
            }

          });

        });

        console.log("Waiting for " + promises.length + " to download details");
        Q.allSettled(promises).done(function(results) {
          console.log("TODO Consider saving the user to avoid making requests again ", results.length);

          console.log("userPrivateDetails.userMask.corpora.titles ", userPrivateDetails.userMask.corpora.map(function(mask) {
            return mask.title;
          }));
          deferred.resolve(userPrivateDetails.userMask);
        });

      }
    });
  });

  return deferred.promise;
};

exports.getUserMask = getUserMask;
