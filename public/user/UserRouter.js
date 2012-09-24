define([ 
    "backbone",
    "corpus/Corpus",
    "user/User",
    "libs/Utils"
], function(
    Backbone,
    Corpus,
    User
) {
  var UserRouter = Backbone.Router.extend(
  /** @lends UserRouter.prototype */
  {
    /**
     * @class Routes URLs to handle the user dashboard. Mostly just
     *        shows the user a list of their corpora so they can switch
     *        between corpora.
     * 
     * @extends Backbone.Router
     * @constructs
     */
    initialize : function() {
    },

    routes : {
      "corpus/:pouchname"               : "showCorpusDashboard", 
      ""                                : "showFullscreenUser"
    },
    
    /**
     * Displays the dashboard view of the user loaded in authentication
     * 
     * @param {String}
     *          pouchname (Optional) The name of the corpus to display.
     */
    showFullscreenUser : function() {
      Utils.debug("In showFullscreenUser: " );
    },
    
    /**
     * Loads the requested corpus, and redirects the user to the corpus dashboard 
     * 
     * @param {String}
     *          pouchname The name of the corpus this datum is from.
     */
    showCorpusDashboard : function() {
      Utils.debug("In showFullscreenCorpus: " );
    }
  });

  return UserRouter;
});
