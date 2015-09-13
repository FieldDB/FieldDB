var Q = require("q");
var SAMPLE_HEAT_MAP = require("./../lib/sample-activity-heatmap");
var Connection = require("fielddb/api/corpus/Connection").Connection;

var activityHeatMap = function(dbname, nano) {
  var deferred = Q.defer();

  Q.nextTick(function() {
    if (!nano) {
      deferred.resolve(SAMPLE_HEAT_MAP);
      console.log(new Date() + " nano was not available, using sample heat map instead of: " + dbname);
      return;
    }
    if (!dbname || dbname.length < 3 || typeof dbname.trim !== "function") {
      deferred.resolve(SAMPLE_HEAT_MAP);
      console.log(new Date() + " someone requested an invalid dbname: " + dbname);
      return;
    }

    dbname = dbname.trim().toLowerCase();
    var validateIdentifier = Connection.validateIdentifier(dbname);
    if (validateIdentifier.identifier !== validateIdentifier.original) {
      deferred.resolve(SAMPLE_HEAT_MAP);
      console.log(new Date() + " someone requested an invalid dbname: ", validateIdentifier.identifier);
      return;
    }

    if (dbname.indexOf("-activity_feed") !== dbname.length - 14) {
      dbname = dbname + "-activity_feed";
    }

    var activitydb = nano.db.use(dbname);
    activitydb.view("activities", "one-year-weekly", {
      group: true
    }, function(err, body) {
      if (!err && body.rows) {
        console.log(new Date() + " responded with activity heat map " + body.rows.length + " for: " + dbname);
        deferred.resolve(body);
      } else {
        console.log(new Date() + " there was a problem fetching the activity heatmap for: " + dbname);
        deferred.resolve(SAMPLE_HEAT_MAP);
      }
    });
  });


  return deferred.promise;
};

exports.activityHeatMap = activityHeatMap;
