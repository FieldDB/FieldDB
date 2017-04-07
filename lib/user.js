var config = require("config");
var CORS = require("fielddb/api/CORSNode").CORS;
var Corpora = require("fielddb/api/corpus/Corpora").Corpora;
var CorpusMask = require("fielddb/api/corpus/CorpusMask").CorpusMask;
var Connection = require("fielddb/api/corpus/Connection").Connection;
var User = require("fielddb/api/user/User").User;
var Q = require("q");

var getUserMask = function getUserMask(username, next) {
  var deferred = Q.defer();
  var validateIdentifier = Connection.validateIdentifier(username);
  if (!username || validateIdentifier.identifier.length < 3 || !validateIdentifier.equivalent()) {
    console.log(new Date() + " someone requested an invalid username: " + validateIdentifier.identifier);
    var err = new Error("Not Found.");
    err.status = 404;
    err.userFriendlyErrors = ["This is a strange username, are you sure you didn't mistype it?"];
    err.validateIdentifier = validateIdentifier;
    deferred.reject(err);
    next(err);
    return deferred.promise;
  }

  CORS.makeCORSRequest({
    url: config.corpus.url + "/" + config.corpus.databases.users + "/" + validateIdentifier.identifier
  }).then(function(userPrivateDetails) {
    var userPrivate = new User(userPrivateDetails);
    if (!userPrivate.userMask) {
      // Cause the mask to be default
      userPrivate.userMask = {};
    }

    if (userPrivate.dateCreated) {
      var year = new Date(userPrivate.dateCreated).getFullYear();
      if (year < new Date().getFullYear()) {
        userPrivate.userMask.startYear = " " + year + " - ";
      }
    }
    // New users will be missing their corpora 
    // until the apps save them in the public corpora list
    // if (userPrivate.userMask.corpora && userPrivate.userMask.corpora.length) {
    //   console.log(new Date() + " not getting the user " + username + " their current corpora ", userPrivate.corpora.length);
    //   return deferred.resolve(userPrivate.userMask);
    // }

    userPrivate.userMask.corpora = new Corpora();
    var promises = [];
    userPrivate.corpora.map(function(corpusConnection) {
      // Correct error from a version of the auth service
      if (corpusConnection.dbname === "lingllama-community_corpus") {
        corpusConnection.dbname = "lingllama-communitycorpus";
      }
      if ((userPrivate.username !== "public" && corpusConnection.dbname === "public-firstcorpus") ||
        (userPrivate.username !== "lingllama" && corpusConnection.dbname === "lingllama-communitycorpus")) {
        // Skip sample corpora if not showing the sample user who owns the corpus
        return;
      }
      if (corpusConnection.title !== corpusConnection.dbname &&
        (corpusConnection.owner + "-" + corpusConnection.title) !== corpusConnection.dbname) {
        console.log(new Date() + " Dont need to fetch title and description for  ", corpusConnection.owner + "-" + corpusConnection.title);
        corpusConnection = corpusConnection.toJSON();
        if (!corpusConnection.gravatar) {
          corpusConnection.gravatar = userPrivate.userMask.buildGravatar(corpusConnection.dbname);
        }
        userPrivate.userMask.corpora.push(corpusConnection);
        return;
      }
      console.log(new Date() + " Requesting the corpus mask details", corpusConnection.dbname);
      var corpusMask = new CorpusMask({
        connection: corpusConnection
      });
      promises.push(corpusMask.fetch(config.corpus.url + "/" + corpusConnection.dbname).then(function() {
        // Must prime the gravatar
        console.log(new Date() + " Using connection from the corpus mask details", corpusMask.connection.owner, corpusMask.connection.gravatar);
        corpusMask.connection.title = corpusMask.connection.title;
        corpusMask.connection.description = corpusMask.connection.description;
        if (!corpusMask.connection.websiteUrl || corpusMask.connection.websiteUrl === config.public.url || corpusMask.connection.websiteUrl.indexOf("lingsync.org") === corpusMask.connection.websiteUrl.length - 12) {
          corpusMask.connection.websiteUrl = "/" + corpusConnection.dbname.replace("-", "/");
        }
        userPrivate.userMask.corpora.push(corpusMask.connection);
        return corpusMask.connection;
      }).fail(function(err) {
        console.log("failed to fetchcorpus mask", err);
        corpusMask.connection.websiteUrl = corpusMask.connection.websiteUrl || "/" + corpusConnection.dbname.replace("-", "/");
        userPrivate.userMask.corpora.push(corpusConnection);
      }));
    });

    console.log(new Date() + " Waiting for " + promises.length + " to download details");
    Q.allSettled(promises).done(function(results) {
      console.log(new Date() + " TODO Consider saving the user to avoid making requests again ", results.length);
      console.log(new Date() + " userPrivate.userMask.corpora.titles ", userPrivate.userMask.corpora.map(function(mask) {
        return mask.title;
      }));
      deferred.resolve(userPrivate.userMask);
    });
  }).fail(next);
  return deferred.promise;
};

exports.getUserMask = getUserMask;
