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
      this.set("maxInMemoryCollectionSize", 20);

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
      //work around for the activity feeds recursively saving themselves.
      if(this.lastSavedTimeStamp && Date.now() - this.lastSavedTimeStamp < 30000){
        return;
      }
      this.lastSavedTimeStamp = Date.now();
      Utils.debug("Calling saveAndInterConnectInApp for "+this.get("couchConnection").pouchname);
      if(!successcallback){
        successcallback = function(){
          if(window.appView){
            window.appView.toastUser("Save all activities","alert-success","Saved!");
          }
        };
      }
      Utils.debug("successcallback",successcallback);
      Utils.debug("failurecallback",failurecallback);
      
      var self = this;
      window.hub.unsubscribe("savedActivityToPouch", null, self);
      window.hub.unsubscribe("saveActivityFailedToPouch", null, self);
      
      self.savedcount = 0;
      self.truelysaved = 0;
      self.savedindex = [];
      self.savefailedcount = 0;
      self.savefailedindex = [];
      self.nextsaveactivity  = 0;
      
      //workaround to remove the pointer to all the superfluous and recursive collection in each activity. 
      for(var j = 0; j< self.get("activities").models.length; j++){
        if(self.get("activities").models[j].collection){
          delete self.get("activities").models[j].collection;
        }
      }
      
      window.hub.subscribe("savedActivityToPouch", function(arg){
        self.savedindex[arg.d] = true;
        self.savedcount++;
        if( arg.d <= 0 ){
          /*
           * If we are at the final index in the activity feed
           */
          Utils.debug("Activity feed saved.");
          
          if(typeof successcallback == "function"){
            successcallback();
          }
          var alertcolor = "alert-success";
          if(self.savefailedcount > 0){
            var alertcolor = "alert-warning";
          }
          if(window.appView){
            window.appView.toastUser("Save activity feed completed, "+self.savefailedcount+" failures, "+self.truelysaved+" new." ,alertcolor,"Activities saved:");
          }

          window.hub.unsubscribe("savedActivityToPouch", null, self);
          window.hub.unsubscribe("saveActivityFailedToPouch", null, self);
          
        }else{
          /*
           * Save another activity when the previous succeeds
           */
          var next = parseInt(arg.d) - 1;
          self.saveAnActivityAndLoop(next);
          Utils.debug("Save succeeded: "+arg.d+" Calling saveAnActivityAndLoop for "+self.get("couchConnection").pouchname);

        }
      }, self);
      
      window.hub.subscribe("saveActivityFailedToPouch",function(arg){
        self.savefailedindex[arg.d] = false; 
        self.savefailedcount++;
        if(window.appView){
//          window.appView.toastUser("Save activity failed "+arg.d+" : "+arg.message,"alert-warning","Failures:");
        }
        
        self.alerted++;
        if(self.alerted<100){
          //alert(d);
          alert("Bug! the "+self.get("couchConnection").pouchname+" activity feed seems to be recursing. Attempting ot stop it.");
          window.hub.unsubscribe("savedActivityToPouch", null, self);
          window.hub.unsubscribe("saveActivityFailedToPouch", null, self);
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
          if(window.appView){
            window.appView.toastUser("Save activity feed completed, "+self.savefailedcount+" failures, "+self.truelysaved+" new." ,null,"Activities saved:");
          }

          window.hub.unsubscribe("savedActivityToPouch", null, self);
          window.hub.unsubscribe("saveActivityFailedToPouch", null, self);
          
        }else{
          /*
           * Save another activity when the previous fails
           */
          var next = parseInt(arg.d) - 1;
          self.saveAnActivityAndLoop(next);
          Utils.debug("Save failed: "+arg.d+"  Calling saveAnActivityAndLoop for "+self.get("couchConnection").pouchname);

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
        Utils.debug("thatactivity "+d,thatactivity);
      }else{
//        alert("Bug in activity save, please report this! Activity number: "+d);
//        Utils.debug("these are the activity models", this.get("activities").models);
        Utils.debug("this is the model taht is missing: ", this.get("activities").models[d]);
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
      if(thatactivity.collection){
        Utils.debug("This activity has a collection. removing it.");
        delete thatactivity.collection;
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
      if(!couchConnection){
        Utils.debug("Can't change activity feed's couch connection");
        return;
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
    addActivity : function(model){
      var name = "undefined couchconnection";
      try{
        name = this.get("couchConnection").pouchname;
      }catch(e){
        console.warn("couchConnection was undefined on the activity feed. this is a problem");
      }
      var currentlength =  this.get("activities").length;
      Utils.debug(name+ " checking activity feed size = "+ currentlength);
      //Utils.debug(name+ " this is the activity that was added = ", model);

      if(currentlength> this.get("maxInMemoryCollectionSize")){  
        Utils.debug("The Activities collection has grown to the maximum of "+this.get("maxInMemoryCollectionSize")+", removing some items ot make space and reduce memory consumption.");
        var modelToRemove = this.get("activities").pop(); //because activities are added by unshift
        modelToRemove.saveAndInterConnectInApp();
      }
      if(model.collection){
        Utils.debug("This activity has a collection. removing it.");
//        delete model.collection;
      }
      this.get("activities").unshift(model);
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
      var couchConnection = null;
      if(couchConnection == null || couchConnection == undefined){
        couchConnection = self.get("couchConnection");
      }
      //if the couchConnection is still not set, then try to set it using the corpus's connection and adding activity feed to it.
      if(!couchConnection){
        couchConnection = JSON.parse(JSON.stringify(window.app.get("corpus").get("couchConnection")));
        couchConnection.pouchname =  couchConnection.pouchname+"-activity_feed";
      }
      
      try{
        this.changePouch(couchConnection, function(){
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
                
                
                /*
                 * Its possible that the pouch has no by date view, create it and then try loading the activity feed again.
                 */
                window.appView.toastUser("Initializing the sort by date search functions for the first time in this activity feed.","alert-success","Activity Feed:");
                
                if(!window.validCouchViews){
                  window.validCouchViews = window.app.get("corpus").validCouchViews();
                }
                var view = "get_ids/by_date";
                var viewparts = view.split("/");
                if(viewparts.length != 2){
                  console.log("Warning "+view+ " is not a valid view name.");
                  return;
                }
                var activityfeedself = self;
                activityfeedself.changePouch(null, function() {
                  activityfeedself.pouch(function(err, db) {
                    var modelwithhardcodedid = {
                        "_id": "_design/"+viewparts[0],
                        "language": "javascript",
                        "views": {
//                          "by_id" : {
//                                "map": "function (doc) {if (doc.dateModified) {emit(doc.dateModified, doc);}}"
//                            }
                        }
                     };
                    modelwithhardcodedid.views[viewparts[1]] = {map : window.validCouchViews[view].map.toString()};
                    if(window.validCouchViews[view].reduce){
                      modelwithhardcodedid.views[viewparts[1]].reduce =  window.validCouchViews[view].reduce.toString();
                    }

                    console.log("This is what the doc will look like: ", modelwithhardcodedid);
                    db.put(modelwithhardcodedid, function(err, response) {
                      Utils.debug(response);
                      if(err){
                        Utils.debug("The "+view+" view couldn't be created.");
                      }else{
                        
                        Utils.debug("The "+view+" view was created.");
                        activityfeedself.getAllIdsByDate(callback);
                        
                        
                      }
                    });
                  });
                });
                
                
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
                  window.app.get("currentUserActivityFeed").addActivity(new Activity({
                    verb : "uploaded",
                    verbicon : "icon-arrow-up",
                    directobject : "your activity feed (docs read: "+response.docs_read+", docs written: "+response.docs_written+")",
                    indirectobject : "to your activity feed server",
                    context : "via Offline App",
                    teamOrPersonal : "personal"
                  }));
                }
                else{
                  window.app.get("currentCorpusTeamActivityFeed").addActivity(new Activity({
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
                window.app.get("currentUserActivityFeed").addActivity(new Activity({
                  verb : "downloaded",
                  verbicon : "icon-arrow-down",
                  directobject : "your activity feed (docs read: "+response.docs_read+", docs written: "+response.docs_written+")",
                  indirectobject : "from your activity feed server",
                  context : "via Offline App",
                  teamOrPersonal : "personal"
                }));
              }
              else{
                window.app.get("currentCorpusTeamActivityFeed").addActivity(new Activity({
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