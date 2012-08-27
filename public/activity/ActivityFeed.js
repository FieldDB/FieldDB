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
    savedcount : 0,
    truelysaved : 0,
    savedindex : [],
    savefailedcount : 0,
    savefailedindex : [],
    nextsaveactivity : 0,
    
    saveAndInterConnectInApp : function(successcallback, failurecallback){
      Utils.debug("Calling saveAndInterConnectInApp for "+this.get("couchConnection").pouchname);
      if(!successcallback){
        successcallback = function(){
          window.appView.toastUser("Save all activities","alert-success","Saved!");
        };
      }
      console.log("successcallback",successcallback);
      console.log("failurecallback",failurecallback);
      
      var self = this;
      window.hub.unsubscribe("savedActivityToPouch", null, self);
      window.hub.unsubscribe("saveActivityFailedToPouch", null, self);
      
      self.savedcount = 0;
      self.truelysaved = 0;
      self.savedindex = [];
      self.savefailedcount = 0;
      self.savefailedindex = [];
      self.nextsaveactivity  = 0;
      
      
      window.hub.subscribe("savedActivityToPouch", function(arg){
        this.savedindex[arg.d] = true;
        this.savedcount++;
        if( arg.d <= 0 ){
          /*
           * If we are at the final index in the activity feed
           */
          Utils.debug("Activity feed saved.");
          
          if(typeof successcallback == "function"){
            successcallback();
          }
          var alertcolor = "alert-success";
          if(this.savefailedcount > 0){
            var alertcolor = "alert-warning";
          }
          window.appView.toastUser("Save activity feed completed, "+this.savefailedcount+" failures, "+this.truelysaved+" new." ,alertcolor,"Activities saved:");

          window.hub.unsubscribe("savedActivityToPouch", null, this);
          window.hub.unsubscribe("saveActivityFailedToPouch", null, this);
          
        }else{
          /*
           * Save another activity when the previous succeeds
           */
          var next = parseInt(arg.d) - 1;
          this.saveAnActivityAndLoop(next);
          Utils.debug("Save succeeded: "+arg.d+" Calling saveAnActivityAndLoop for "+this.get("couchConnection").pouchname);

        }
      }, self);
      
      window.hub.subscribe("saveActivityFailedToPouch",function(arg){
        this.savefailedindex[arg.d] = false; 
        this.savefailedcount++;
//        window.appView.toastUser("Save activity failed "+arg.d+" : "+arg.message,"alert-warning","Failures:");
        
        this.alerted++;
        if(this.alerted<100){
          //alert(d);
          alert("Bug! the app seems to be looping. Attempting ot stop it.");
          window.hub.unsubscribe("savedActivityToPouch", null, this);
          window.hub.unsubscribe("saveActivityFailedToPouch", null, this);
         //TODO there is a problem, workaround is to call the success callback anyway.
          if(typeof successcallback == "function"){
            successcallback();
          }
        }
        if( arg.d <= 0 ){
          /*
           * If we are at the final index in the activity feed
           */            
          Utils.debug("Activity feed saved.");
          if(typeof successcallback == "function"){
            successcallback();
          }
          window.appView.toastUser("Save activity feed completed, "+this.savefailedcount+" failures, "+this.truelysaved+" new." ,null,"Activities saved:");

          window.hub.unsubscribe("savedActivityToPouch", null, this);
          window.hub.unsubscribe("saveActivityFailedToPouch", null, this);
          
        }else{
          /*
           * Save another activity when the previous fails
           */
          var next = parseInt(arg.d) - 1;
          this.saveAnActivityAndLoop(next);
          Utils.debug("Save failed: "+arg.d+"  Calling saveAnActivityAndLoop for "+this.get("couchConnection").pouchname);

        }
        
      }, self);
      
      /*
       * Begin the activity saving loop with the last activity 
       */
      if(self.get("activities").length > 0){
        self.saveAnActivityAndLoop(self.get("activities").length - 1);
      }else{
        Utils.debug("Activity feed didnt need to be saved.");
        if(typeof successcallback == "function"){
          successcallback();
        }
      }
      
    },
    alerted : 0,
    saveAnActivityAndLoop : function(d){
      
      
      var thatactivity = this.get("activities").models[d];
      if(thatactivity){
        console.log("thatactivity "+d,thatactivity);
      }else{
//        alert("Bug in activity save, please report this! Activity number: "+d);
//        console.log("these are the activity models", this.get("activities").models);
        console.log("this is the model taht is missing: ", this.get("activities").models[d]);
        thatactivity = this.get("activities").models[d];
        if(thatactivity){
          //can keep going
        }else{
          hub.publish("saveActivityFailedToPouch",{d: d, message: " activity undefined" });
          return;
        }
      } 
          
      if(thatactivity.isNew()){
        this.truelysaved++;
      }
      thatactivity.saveAndInterConnectInApp(function(){
        hub.publish("savedActivityToPouch",{d: d, message: " activity "+thatactivity.id});
      },function(){
        //The e error should be from the error callback
        if(!e){
          e = {};
        }
        hub.publish("saveActivityFailedToPouch",{d: d, message: " activity "+ JSON.stringify(e) });
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
        Utils.debug("The activity feed "+couchConnection.pouchname+" pouch was defined.",couchConnection );
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
     
      //can't use reset, the length isn't right or someting. this should remove the items.
      self.get("activities").each(function(model){
        self.get("activities").remove(model);
        Utils.debug("Removing activity to repopulate the collection ", model);
      });
      
      if(!maxNumberToPopulate){
        maxNumberToPopulate = 200;
      }
      var populatedCount = 0;
      for(var row = rows.length - 1; row >=0; row--){
        var a = new Activity((new Activity()).parse(rows[row].value));
        self.get("activities").add(a);
        Utils.debug("In the Activity feed populate: Adding activity to feed ");
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
     * attribute contains the activity's dateModified and the 'value' attribute contains
     * the activity itself.
     */
    getAllIdsByDate : function(callback) {
      Utils.debug("In the activity feed getAllIdsByDate "+this.get("couchConnection").pouchname);
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
    replicateActivityFeed : function(couchConnection, replicatesuccesscallback, replicatefailurecallback) {
      var self = this;
      this.replicateToActivityFeed(couchConnection, function(){
        
        //if to was successful, call the from.
        self.replicateFromActivityFeed(couchConnection, replicatesuccesscallback, replicatefailurecallback );
        
      },function(){
        alert("Replicate to activity feed failure");
        if(typeof replicatefailurecallback == "function"){
          replicatefailurecallback();
        }
      });
    },
    replicateToActivityFeed : function(couchConnection, successcallback, failurecallback) {
      var self = this;
      Utils.debug("Calling replicateToActivityFeed for "+this.get("couchConnection").pouchname);

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
            Utils.debug("This is the url using to replicate to: "+couchurl);
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
                    verb : "uploaded",
                    verbicon : "icon-arrow-up",
                    directobject : "your activity feed (docs read: "+response.docs_read+", docs written: "+response.docs_written+")",
                    indirectobject : "to your activity feed server",
                    context : "via Offline App",
                    teamOrPersonal : "personal"
                  }));
                }
                else{
                  window.app.get("currentCorpusTeamActivityFeed").get("activities").unshift(new Activity({
                    verb : "uploaded",
                    verbicon : "icon-arrow-up",
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
      },failurecallback
      );
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
                  verb : "downloaded",
                  verbicon : "icon-arrow-down",
                  directobject : "your activity feed (docs read: "+response.docs_read+", docs written: "+response.docs_written+")",
                  indirectobject : "from your activity feed server",
                  context : "via Offline App",
                  teamOrPersonal : "personal"
                }));
              }
              else{
                window.app.get("currentCorpusTeamActivityFeed").get("activities").unshift(new Activity({
                  verb : "downloaded",
                  verbicon : "icon-arrow-down",
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