var Collection = require('./../Collection').Collection;
var Activity = require('./Activity').Activity;

/**
 * @class

 * @name  Activities
 * @description The Activities is a minimal customization of the Collection
 * to add an internal model of Activity.
 *
 * @extends Collection
 * @constructs
 */
var Activities = function Activities(options) {
  this.debug("Constructing Activities ", options);
  Collection.apply(this, arguments);
};

Activities.prototype = Object.create(Collection.prototype, /** @lends Activities.prototype */ {
  constructor: {
    value: Activities
  },

  primaryKey: {
    value: 'timestamp'
  },

  INTERNAL_MODELS: {
    value: {
      item: Activity
    }
  },

  add: {
    value: function(bareActivityObject) {
      // bareActivityObject.verb = bareActivityObject.verb.replace("href=", "target='_blank' href=");
      // bareActivityObject.directobject = bareActivityObject.directobject.replace("href=", "target='_blank' href=");
      // bareActivityObject.indirectobject = bareActivityObject.indirectobject.replace("href=", "target='_blank' href=");
      // bareActivityObject.context = bareActivityObject.context.replace("href=", "target='_blank' href=");
      if (!bareActivityObject.timestamp) {
        bareActivityObject.timestamp = Date.now();
      }
      // if (OPrime.debugMode) OPrime.debug("Saving activity: ", bareActivityObject);
      // var backboneActivity = new Activity(bareActivityObject);

      // var couchConnection = this.get("couchConnection");
      // var activitydb = couchConnection.pouchname + "-activity_feed";
      // if (bareActivityObject.teamOrPersonal != "team") {
      //   activitydb = this.get("authentication").get("userPrivate").get("username") + "-activity_feed";
      //   backboneActivity.attributes.user.gravatar = this.get("authentication").get("userPrivate").get("gravatar");
      // }
      Collection.prototype.add.apply(this, [new Activity(bareActivityObject)]);
      // var couchurl = OPrime.getCouchUrl(couchConnection, "/" + activitydb);

      // OPrime.makeCORSRequest({
      //   type: 'POST',
      //   url: couchurl,
      //   data: backboneActivity.toJSON(),
      //   success: function(resp) {
      //     if (OPrime.debugMode) OPrime.debug("Successfully saved activity to your activity couch.", resp);
      //   },
      //   error: function(e, f, g) {
      //     if (OPrime.debugMode) OPrime.debug("Error saving activity", e, f, g);
      //     localStorage.setItem("activity" + Date.now(), backboneActivity.toJSON());
      //   }
      // });


      //      if (bareActivityObject.get("teamOrPersonal") == "team") {
      //        window.app.get("currentCorpusTeamActivityFeed").addActivity(bareActivityObject);
      //      } else {
      //        window.app.get("currentUserActivityFeed").addActivity(bareActivityObject);
      //      }
    },
  }


});
exports.Activities = Activities;
