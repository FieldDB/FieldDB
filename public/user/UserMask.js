define([ 
    "use!backbone"
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
      
    //if the corpusname changes, change the pouch as well so that this object goes with its corpus's local pouchdb
      this.model.bind("change:corpusname", function() {
        this.pouch = Backbone.sync
        .pouch(Utils.androidApp() ? Utils.touchUrl
            + this.get("corpusname") : Utils.pouchUrl
            + this.get("corpusname"));
      }, this);
      
      try{
        if(this.get("corpusname") == undefined){
          this.set("corpusname", app.get("corpus").couchConnection.corpusname);
        }
      }catch(e){
        Utils.debug("Corpusname was undefined on this corpus, the datalist will not have a valid corpusname until it is set.");
      }
    },
    
    pouch : Backbone.sync.pouch(Utils.androidApp() ? Utils.touchUrl
        : Utils.pouchUrl),
  });

  return UserMask;
});