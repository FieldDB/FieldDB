var config = require("config");
var Connection = require("fielddb/api/corpus/Connection").Connection;
var Corpora = require("fielddb/api/corpus/Corpora").Corpora;
var UserMask = require("fielddb/api/user/UserMask").UserMask;
var CORS = require("fielddb/api/CORS").CORS;

function getAllCorpora(){
  return CORS.makeCORSRequest({
      url: config.corpus.url + "/_all_dbs"
    }).then(function(results) {
      console.log(results);
      return new Corpora(results.map(function functionName(item) {
        if (!item) {
          return;
        }

        // An activity feed
        if (/activity_feed/.test(item)) {
          return;
        }

        // An practice corpus
        if (/firstcorpus/.test(item)) {
          return;
        }

        // Not a corpus
        if (!/-/.test(item)) {
          return;
        }

        // A testing db
        if (/test/.test(item)) {
          return;
        }

        // An anonymous langauge learning db
        if (/anonymous/.test(item)) {
          return;
        }

        // An acra db
        if (/acra/.test(item)) {
          return;
        }

        // An devgin db
        if (/devgin/.test(item)) {
          return;
        }

        var connection = new Connection({
          dbname: item,
          title: item,
          titleAsUrl: item
        });
        connection.team = {
          username: connection.owner
        };
        connection.website = "/" + connection.owner + "/" + item;
        connection.gravatar = UserMask.prototype.buildGravatar(item);
        return connection;
      }).filter(function functionName(item) {
        return item;
      }));
    });
}

exports.getAllCorpora = getAllCorpora;
