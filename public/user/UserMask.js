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
      try {
        if (this.get("corpusname") == undefined) {
          this.changeCorpus(app.get("corpus").get("corpusname"));
        }
      } catch(e) {
        Utils.debug("Corpusname was undefined on this corpus, the user mask will not have a valid corpusname until it is set.");
      }
    },
    
    changeCorpus : function(corpusname) {
      this.pouch = Backbone.sync.pouch(Utils.androidApp() ? Utils.touchUrl + corpusname : Utils.pouchUrl + corpusname);
    }
  });

  return UserMask;
});