define([ 
    "backbone", 
    "activity/Activity",
    "activity/Activities"
], function(
    Backbone, 
    Activity,
    Activities
) {
  var ActivityFeed = Backbone.Model.extend(
  /** @lends ActivityFeed.prototype */
  {
    /**
     * @class A model of the Activity Feed. The activity feed is a container for
     *        the Activities collection. It is the primary way to view an
     *        Activities Collection. see <a href =
     *        "http://ui-patterns.com/patterns/ActivityStream">"http://ui-patterns.com/patterns/ActivityStream"</a>
     * 
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
      if(!this.get("activities")) {
        this.set("activities", window.app.get("authentication").get("userPrivate").get("activities"));
      }
      this.pouch = Backbone.sync.pouch(Utils.androidApp() ? Utils.activityFeedTouchUrl
          : Utils.activityFeedPouchUrl);
      
    },
//    defaults: {
//      activities: Activities
//    },
    // Internal models: used by the parse function
    model : {
      activities: Activities  
    },
    
    
     
    /**
     * not tested
     */
    saveUserActivities : function(){
      window.app.get("authentication").get("userPrivate").get("activities").each( function(a){
        a.save();
      });
      
    },
    /**
     * Synchronize the server and local databases.
     */
    replicateActivityFeed : function(couchConnection, fromcallback, tocallback) {
      var self = this;
      self.pouch(function(err, db) {
       var couchurl = Utils.activityFeedCouchUrl;
        db.replicate.to(couchurl, {
          continuous : false
        }, function(err, resp) {
          Utils.debug("Replicate to " + couchurl);
          Utils.debug(resp);
          Utils.debug(err);
          if (typeof tocallback == "function") {
            tocallback();
          }
        });
        // We can leave the to and from replication async, and make two
        // callbacks.
        db.replicate.from(couchurl, {
          continuous : false
        }, function(err, resp) {
          Utils.debug("Replicate from " + couchurl);
          Utils.debug(resp);
          Utils.debug(err);
          if (err == null || err == undefined) {
            // This was a valid connection, lets save it into localstorage.
            localStorage.setItem("mostRecentCouchConnection", JSON
                .stringify(couchConnection));

            // Display the most recent datum in this corpus
            appView.datumsView.updateDatums();
          }
          if (typeof fromcallback == "function") {
            fromcallback();
          }
          window.appView.allSyncedDoc();

          window.app.get("authentication").get("userPrivate").get(
          "activities").unshift(new Activity({
            verb : "synced",
            directobject : "their activity feed",
            indirectobject : "with their team server",
            context : "via Offline App",
            user : window.app.get("authentication").get("userPublic")
          }));
        });
      });
    }
  });

  return ActivityFeed;
});