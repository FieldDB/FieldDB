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
//      this.set("activities", window.app.get("currentCorpusTeamActivityFeed").get("activities"));
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
     
    /**
     * not tested
     */
    saveAndInterConnectInApp : function(successcallback, failurecallback){
      this.get("activities").each( function(a){
        a.saveAndInterConnectInApp();
      });
      if(typeof successcallback == "function"){
        successcallback();
      }
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
        alert("this is not a well formed activity feed couch connection"+JSON.stringify(couchConnection));
        Utils.debug("this is not a well formed activity feed couch connection"+JSON.stringify(couchConnection));
      }
      if (this.pouch == undefined) {
        Utils.debug("Defining the activity feed's pouch.",couchConnection );
        this.pouch = Backbone.sync
        .pouch(Utils.androidApp() ? Utils.touchUrl
            + couchConnection.pouchname : Utils.pouchUrl
            + couchConnection.pouchname);
      }else{
        Utils.debug("The activity feed's pouch was defined.",couchConnection );
      }

      if (typeof callback == "function") {
        callback();
      }
    },  
    /**
     * This function looks through pouch, and populates the activity feed. It accepts a maxNumberToPopulate so that we don't have too many objects in memory unncessarily. The structure of the rows objects is defined by the map reduce function in the couchdb.
     * right now, it contains the objects of the activities so it can be quite heavy as well. 
     * 
     * @param rows
     * @param self
     * @param maxNumberToPopulate
     */
    populate : function(rows, self, maxNumberToPopulate){
      self.get("activities").reset();
      if(!maxNumberToPopulate){
        maxNumberToPopulate = 30;
      }
      var populatedCount = 0;
      for(row in rows){
        var a = new Activity((new Activity()).parse(rows[row].value));
        self.get("activities").unshift(a);
        Utils.debug("In the Activity feed populate: Adding activity to feed ", a);
        populatedCount++;
        if(populatedCount > maxNumberToPopulate){
          return;
        }
      }
    },
    /**
     * Gets all the ActivityId in the current ActivityFeed sorted by their date.
     * 
     * @param {Function} callback A function that expects a single parameter. That
     * parameter is the result of calling "get_ids/by_date". So it is an array
     * of objects. Each object has a 'key' and a 'value' attribute. The 'key'
     * attribute contains the Datum's dateModified and the 'value' attribute contains
     * the Datum itself.
     */
    getAllIdsByDate : function(callback) {
      alert("in the activity feed getAllIdsByDate");
      var self = this;
      
      try{
        this.changePouch(null, function(){
          Utils.debug("Changing pouch in activity feed was sucessfull.");
          self.pouch(function(err, db) {
            db.query("get_ids/by_date", {reduce: false}, function(err, response) {
              if ((!err) && (typeof callback == "function"))  {
                Utils.debug("Callback with: ", response.rows);
                Utils.debug("Activity feed search: "+self.get("couchConnection").pouchname,response.rows);
                callback(response.rows, self);
              }else{
                Utils.debug("There was an error querying the database.",err);
                Utils.debug("There was an error querying the database, this is the response.",response);
              }
            });
          });
        });
        
      }catch(e){
        alert("Couldnt show the most recent activity "+JSON.stringify(e));
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
      self.saveAndInterConnectInApp(function(){
        if(couchConnection == null || couchConnection == undefined){
          couchConnection = self.get("couchConnection");
        }
        //if the couchConnection is still not set, then try to set it using the corpus's connection and adding activity feed to it.
        if(!couchConnection){
          couchConnection = JSON.parse(JSON.stringify(window.app.get("corpus").get("couchConnection")));
          couchConnection.pouchname =  couchConnection.pouchname+"-activity_feed";
        }
        
        self.changePouch(couchConnection, function(){
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
                
                var numberofdashes = couchConnection.pouchname.split("-");
                if(numberofdashes.length == 2){
                  window.app.get("currentUserActivityFeed").get("activities").unshift(new Activity({
                    verb : "synced",
                    verbicon : "icon-sitemap",
                    directobject : "your activity feed (docs read: "+response.docs_read+", docs written: "+response.docs_written+")",
                    indirectobject : "to your activity feed server",
                    context : "via Offline App",
                    teamOrPersonal : "personal"
                  }));
                }
                else{
                  window.app.get("currentCorpusTeamActivityFeed").get("activities").unshift(new Activity({
                    verb : "synced",
                    verbicon : "icon-sitemap",
                    directobject : "their activity feed (docs read: "+response.docs_read+", docs written: "+response.docs_written+")",
                    indirectobject : "to the team activity feed server",
                    context : "via Offline App",
                    teamOrPersonal : "team"
                  }));
                }
                
                if(typeof successcallback == "function"){
                  successcallback();
                }else{
                  Utils.debug("ActivityFeed replicate to success");
                }
              }
            });
          });
        });
      });
    },
    /**
     * Synchronize from server to local database.
     */
    replicateFromActivityFeed : function(couchConnection, successcallback, failurecallback) {
      var self = this;
      
      if(couchConnection == null || couchConnection == undefined){
        couchConnection = self.get("couchConnection");
      }
      this.changePouch(couchConnection, function(){
        self.pouch(function(err, db) {
          var couchurl = couchConnection.protocol+couchConnection.domain;
          if(couchConnection.port != null){
            couchurl = couchurl+":"+couchConnection.port;
          }
          couchurl = couchurl +"/"+ couchConnection.pouchname;
          
          
          //We can leave the to and from replication async, and make two callbacks. 
          db.replicate.from(couchurl, { continuous: false }, function(err, response) {
            Utils.debug("Replicate from " + couchurl);
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
              Utils.debug("ActivityFeed replicate from success", response);

              var numberofdashes = couchConnection.pouchname.split("-");
              if(numberofdashes.length == 2){
                window.app.get("currentUserActivityFeed").get("activities").unshift(new Activity({
                  verb : "synced",
                  verbicon : "icon-sitemap",
                  directobject : "your activity feed (docs read: "+response.docs_read+", docs written: "+response.docs_written+")",
                  indirectobject : "from your activity feed server",
                  context : "via Offline App",
                  teamOrPersonal : "personal"
                }));
              }
              else{
                window.app.get("currentCorpusTeamActivityFeed").get("activities").unshift(new Activity({
                  verb : "synced",
                  verbicon : "icon-sitemap",
                  directobject : "their activity feed (docs read: "+response.docs_read+", docs written: "+response.docs_written+")",
                  indirectobject : "from the team activity feed server",
                  context : "via Offline App",
                  teamOrPersonal : "team"
                }));
              }
              
              self.getAllIdsByDate(self.populate);
              window.hub.unsubscribe("ajaxError", null, self); 

            }
          });
        });
        
      });
    }
  });

  return ActivityFeed;
});