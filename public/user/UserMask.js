define([ 
    "use!backbone",
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
    // If the corpusname changes, change the pouch as well so that this object goes with its corpus's local pouchdb
     // this.bind("change:corpusname", function() {
       // this.pouch = Backbone.sync.pouch(Utils.androidApp() ? Utils.touchUrl
           // + this.get("corpusname") : Utils.pouchUrl
           // + this.get("corpusname"));
     // }, this);
     
     this.pouch = Backbone.sync.pouch(Utils.androidApp() ? Utils.touchUrl : Utils.pouchUrl);

      try {
        if (this.get("corpusname") == undefined) {
          this.set("corpusname", app.get("corpus").get("corpusname"));
        }
      } catch(e) {
        Utils.debug("Corpusname was undefined on this corpus, the user mask will not have a valid corpusname until it is set.");
      }
    },
  });

  return UserMask;
});