define([ "use!backbone", "app/AppRouter",
    "authentication/Authentication", "corpus/Corpus", "search/Search"

], function(Backbone, AppRouter, Authentication, Corpus, Search) {
  var App = Backbone.Model.extend(
  /** @lends App.prototype */
  {
    /**
     * @class The App handles the reinitialization and loading of the app
     *        depending on which platform (Android, Chrome, web) the app is
     *        running, who is logged in etc.
     * 
     * The App should be serializable to save state to local storage for the
     * next run.
     * 
     * @property {Authentication} auth The auth member variable is an
     *           Authentication object permits access to the login and
     *           logout functions, and the database of users depending on
     *           whether the app is online or not.
     * 
     * @property {Corpus} corpus The corpus is a Corpus object which will
     *           permit access to the datum, and the data lists. The corpus
     *           feeds the search object with indexes and fields for
     *           advanced search, the corpus has datalists, has teams with
     *           permissions, has a confidentiality_encryption key, it's
     *           datum have sessions, its datalists have export.
     * 
     * @property {Search} search The search is the primary surface where the
     *           global search features will attach.
     * @property
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
      this.bind('error', function(model, error) {
        console.log("Error in App: " + error);
      });

      // Start the Router
      Backbone.history.start();
    },
    defaults : {
      corpus : new Corpus("corpus"),

    },

    auth : new Authentication("authentication"),
    router : new AppRouter(),
    search : new Search("global_search")
  });

  return App;
});
