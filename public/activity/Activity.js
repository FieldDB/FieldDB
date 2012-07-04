define([ 
    "use!backbone",
    "user/User" 
], function(
    Backbone, 
    User
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
    },
    
    defaults : {
      user : User,
      verbs : [ "added", "modified", "commented", "checked", "tagged", "uploaded" ],
      verb : "added",
      directobject : "an entry",
      indirectobject : "with Consultant-SJ",
      context : "via Android/ Offline Chrome App"  
    },
    
    model : {
      user : User
    },
    
    parse : function(response) {
      for (var key in this.model) {
        var embeddedClass = this.model[key];
        var embeddedData = response[key];
        response[key] = new embeddedClass(embeddedData, {parse:true});
      }
      
      return response;
    },
    
    pouch : Backbone.sync.pouch(Utils.androidApp() ? Utils.activityFeedTouchUrl
        : Utils.activityFeedPouchUrl),
        
  });

  return Activity;
});
