define([ 
    "backbone",
    "user/UserMask" 
], function(
    Backbone, 
    UserMask
) {
  var Activity = Backbone.Model.extend(
  /** @lends Activity.prototype */
  {
    /**
     * @class The Activity is a record of the user's activity during one
     *        session, i.e. it might say "Edward Sapir added 30 datums in Na
     *        Dene Corpus" This is so that users can see their history and teams
     *        can view teammate's contributions.
     * 
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
      if(!this.get("user")) {
        this.set("user", window.app.get("authentication").get("userPublic"));
      }
      if(!this.get("timestamp")){
        this.set("timestamp",JSON.stringify(new Date()) );
      }
      this.pouch = Backbone.sync.pouch(Utils.androidApp() ? Utils.activityFeedTouchUrl
          : Utils.activityFeedPouchUrl);
      
      if(this.isNew()){
        this.save();
      }
    },
    
    defaults : {
      verbs : [ "added", "modified", "commented", "checked", "tagged", "uploaded" ],
      verb : "added",
      directobject : "an entry",
      indirectobject : "with Consultant-SJ",
      context : "via Android/ Offline Chrome App" ,
//      timestamp: timestamp
    },
    
    // Internal models: used by the parse function
    model : {
      user : UserMask
    },
    changeCorpus : function(couchConnection, callback) {
      alert("The change corpus doesnt work yet for activity feeds")
    },
    saveAndInterConnectInApp : function(callback){
      
      if(typeof callback == "function"){
        callback();
      }
    },
    //TODO getting error  has no method 'pouch' when this is specified in the initialize
//    pouch : Backbone.sync.pouch(Utils.androidApp() ? Utils.activityFeedTouchUrl
//        : Utils.activityFeedPouchUrl),
        
  });

  return Activity;
});
