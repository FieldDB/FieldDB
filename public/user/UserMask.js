define([ 
    "backbone",
    "libs/Utils"
], function(
    Backbone
) {
  var UserMask = Backbone.Model.extend(
  /** @lends UserMask.prototype */
  {
    /**
     * @class A mask of a user which can be saved along with the corpus. It is
     *        generally just a username and gravatar but could be more depending
     *        on what the user allows to be public.
     * 
     * 
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
      Utils.debug("UserMask init", this.toJSON());
      try {
        if (this.get("pouchname") == undefined) {
          if(window.app)
          this.set("pouchname", window.app.get("corpus").get("pouchname"));
          //this.changePouch(window.app.get("corpus").get("pouchname"));
        }
      } catch(e) {
        Utils.debug("Corpusname was undefined on this corpus, the user mask will not have a valid pouchname until it is set."+e);
      }
    },
    
    changePouch : function(pouchname) {
      this.pouch = Backbone.sync.pouch(Utils.androidApp() ? Utils.touchUrl + pouchname : Utils.pouchUrl + pouchname);
    },
    saveAndInterConnectInApp : function(callback){
      
      if(typeof callback == "function"){
        callback();
      }
    }
  });

  return UserMask;
});