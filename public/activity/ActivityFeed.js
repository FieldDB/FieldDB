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
//      this.set("activities", window.app.get("authentication").get("userPrivate").get("activities"));
        this.set("activities", new Activities());
      }
      //TODO remove this, and us the change corpus instead. by keepint htis now, it puts all activity feeds into one.
//      this.pouch = Backbone.sync.pouch(Utils.androidApp() ? Utils.activityFeedTouchUrl
//          : Utils.activityFeedPouchUrl);
      
    },
//    defaults: {
//      activities: Activities
//    },
    // Internal models: used by the parse function
    model : {
      activities: Activities  
    },
    saveAndInterConnectInApp : function(callback){
      
      if(typeof callback == "function"){
        callback();
      }
    },
    
     
    /**
     * not tested
     */
    saveUserActivities : function(){
      window.app.get("authentication").get("userPrivate").get("activities").each( function(a){
        a.saveAndInterConnectInApp();
      });
      
    },
    /**
     * This is not really being used as long as the pouch is set in the initialize. 
     * @param couchConnection
     * @param callback
     */
    changePouch : function(couchConnection, callback) {
      if (couchConnection == null || couchConnection == undefined) {
        couchConnection = this.get("couchConnection");
      }else{
        this.set("couchConnection", couchConnection);
      }
      //TODO test this
      if(couchConnection.pouchname.indexOf("activity_feed") == -1){
        alert("this is not a well formed activity feed couch connection");
      }
      if (this.pouch == undefined) {
        this.pouch = Backbone.sync
        .pouch(Utils.androidApp() ? Utils.touchUrl
            + couchConnection.pouchname : Utils.pouchUrl
            + couchConnection.pouchname);
      }

      if (typeof callback == "function") {
        callback();
      }
    },  
    /**
     * Synchronize the server and local databases. First to, then from.
     */
    replicateActivityFeed : function(couchConnection, successcallback, failurecallback) {
      var self = this;
      this.replicateToActivityFeed(couchConnection, function(){
        
        //if to was successful, call the from.
        self.replicateFromActivityFeed(couchConnection, successcallback, failurecallback );
        
      },function(){
        alert("Replicate to activity feed failure");
        if(typeof fromcallback == "function"){
          fromcallback();
        }
      });
    },
    replicateToActivityFeed : function(couchConnection, successcallback, failurecallback) {
      var self = this;
      
      if(couchConnection == null || couchConnection == undefined){
        couchConnection = self.get("couchConnection");
      }
      //if the couchConnection is still not set, then try to set it using the corpus's connection and adding activity feed to it.
      if(!couchConnection){
        couchConnection = window.app.get("corpus").get("couchConnection");
        couchConnection.pouchname =  couchConnection.pouchname+"-activity_feed";
      }
      
      this.changePouch(couchConnection, function(){
        self.pouch(function(err, db) {
          var couchurl = couchConnection.protocol+couchConnection.domain;
          if(couchConnection.port != null){
            couchurl = couchurl+":"+couchConnection.port;
          }
          couchurl = couchurl +"/"+ couchConnection.pouchname;
          
          db.replicate.to(couchurl, { continuous: false }, function(err, response) {
            Utils.debug("Replicate to " + couchurl);
            Utils.debug(response);
            Utils.debug(err);
            if(err){
              if(typeof failurecallback == "function"){
                failurecallback();
              }else{
                alert('ActivityFeed replicate to error' + JSON.stringify(err));
                Utils.debug('ActivityFeed replicate to error' + JSON.stringify(err));
              }
            }else{
              Utils.debug("ActivityFeed replicate to success", response);
              
              window.app.get("authentication").get("userPrivate").get(
              "activities").unshift(new Activity({
                verb : "synced",
                directobject : "their activity feed",
                indirectobject : "to their team server",
                context : "via Offline App",
                user : window.app.get("authentication").get("userPublic")
              }));

              if(typeof successcallback == "function"){
                successcallback();
              }else{
                Utils.debug("ActivityFeed replicate to success");
              }
            }
          });
        });
      });
    },
    replicateFromActivityFeed : function(couchConnection, successcallback, failurecallback) {
      alert("TODO impement the replicate from activity feed");
    }
  });

  return ActivityFeed;
});