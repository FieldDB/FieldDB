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
        this.set("user", appView.authView.model.get("userPublic"));
      }
    },
    
    defaults : {
      verbs : [ "added", "modified", "commented", "checked", "tagged", "uploaded" ],
      verb : "added",
      directobject : "an entry",
      indirectobject : "with Consultant-SJ",
      context : "via Android/ Offline Chrome App"  
    },
    
    // Internal models: used by the parse function
    model : {
      user : UserMask
    },
    
//    pouch : Backbone.sync.pouch(Utils.androidApp() ? Utils.activityFeedTouchUrl
//        : Utils.activityFeedPouchUrl),
        
  });

  return Activity;
});
