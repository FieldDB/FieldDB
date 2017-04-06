var config = require("config");
var Connection = require("fielddb/api/corpus/Connection").Connection;
var CORS = require("fielddb/api/CORSNode").CORS;
var Q = require("q");

var SAMPLE_HEAT_MAP = {
  rows: []
};

var activityHeatMap = function(dbname) {
  var deferred = Q.defer();
  var validateIdentifier = Connection.validateIdentifier(dbname);
  if (!dbname || dbname.length < 3 || !validateIdentifier.equivalent()) {
    deferred.resolve(SAMPLE_HEAT_MAP);
    console.log(new Date() + " someone requested an invalid dbname: ", validateIdentifier.identifier);
    return deferred.promise;
  }

  var activityDbname = validateIdentifier.identifier;

  if (activityDbname.length < 14 || activityDbname.indexOf("-activity_feed") !== activityDbname.length - 14) {
    activityDbname = activityDbname + "-activity_feed";
  } else {
    console.log(new Date() + " this db was already an activity feed " + activityDbname);
  }

  CORS.makeCORSRequest({
    url: config.corpus.url + "/" + activityDbname + "/_design/activities/_view/one-year-weekly?group=true"
  }).then(function(body) {
    if (body && body.rows) {
      console.log(new Date() + " responded with activity heat map " + body.rows.length + " for: " + activityDbname);
      return deferred.resolve(body);
    }

    console.log(new Date() + " there was a problem fetching the activity heatmap for: " + activityDbname, body);
    deferred.resolve(SAMPLE_HEAT_MAP);
  }, deferred.reject).fail(deferred.reject);

  return deferred.promise;
};

exports.activityHeatMap = activityHeatMap;
