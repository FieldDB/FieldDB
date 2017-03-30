var config = require("config");
var nanoErrorHandler = require("./../lib/error-handler").nanoErrorHandler;
var User = require("fielddb/api/user/User").User;
var Corpora = require("fielddb/api/corpus/Corpora").Corpora;
var CorpusMask = require("fielddb/api/corpus/CorpusMask").CorpusMask;
var Connection = require("fielddb/api/corpus/Connection").Connection;
var Q = require("q");

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
    if (!username || validateIdentifier.identifier.length < 3 || validateIdentifier.identifier !== validateIdentifier.original) {
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
      if (error || !userPrivateDetails) {
        console.log(new Date() + " username lookup failed " + username, error);
        var reason = nanoErrorHandler(error, ["User not found."]);
        deferred.reject(reason);
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
        return deferred.resolve(userPrivateDetails.userMask);
      }

      userPrivateDetails.userMask.corpora = new Corpora();
      var promises = [];

      userPrivateDetails.corpora.map(function(corpusConnection) {
        // Correct error from a version of the auth service
        if (corpusConnection.dbname === "lingllama-community_corpus") {
          corpusConnection.dbname = "lingllama-communitycorpus";
        }
        if ((userPrivateDetails.username !== "public" && corpusConnection.dbname === "public-firstcorpus") ||
          (userPrivateDetails.username !== "lingllama" && corpusConnection.dbname === "lingllama-communitycorpus")) {
          // Skip sample corpora if not showing the sample user who owns the corpus
          return;
        }
        if (corpusConnection.title !== corpusConnection.dbname &&
          (corpusConnection.owner + "-" + corpusConnection.title) !== corpusConnection.dbname) {
          console.log(new Date() + " Dont need to fetch title and description for  ", corpusConnection.owner + "-" + corpusConnection.title);
          corpusConnection = corpusConnection.toJSON();
          if (!corpusConnection.gravatar) {
            corpusConnection.gravatar = userPrivateDetails.userMask.buildGravatar(corpusConnection.dbname);
          }
          userPrivateDetails.userMask.corpora.push(corpusConnection);
          return;
        }

        console.log(new Date() + " Requesting the corpus mask details", corpusConnection.dbname);
        var corpusMask = new CorpusMask({
          dbname: corpusConnection.dbname,
          url: config.corpus.url + "/" + corpusConnection.dbname
        });

        promises.push(corpusMask.fetch().then(function() {
          // Must prime the gravatar
          console.log(new Date() + " Using connection from the corpus mask details", corpusMask.connection.owner,  corpusMask.connection.gravatar);
          corpusMask.connection.title = corpusMask.connection.title;
          corpusMask.connection.description = corpusMask.connection.description;
          userPrivateDetails.userMask.corpora.push(corpusMask.connection);

          return corpusMask.connection;
        }));
      });

      console.log(new Date() + " Waiting for " + promises.length + " to download details");
      return Q.allSettled(promises).done(function(results) {
        console.log(new Date() + " TODO Consider saving the user to avoid making requests again ", results.length);

        console.log(new Date() + " userPrivateDetails.userMask.corpora.titles ", userPrivateDetails.userMask.corpora.map(function(mask) {
          return mask.title;
        }));
        deferred.resolve(userPrivateDetails.userMask);
      });
    });
  });

  return deferred.promise;
};

exports.getUserMask = getUserMask;
