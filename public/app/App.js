define([ "use!backbone", "authentication/Authentication", "corpus/Corpus",
    "search/Search"

], function(Backbone, Authentication, Corpus, Search) {
  var App = Backbone.Model.extend(
  /** @lends App.prototype */
  {
    /**
     * 
     * @class The App handles the reinitialization and loading of the app
     *        depending on which platform (Android, Chrome, web) the app is
     *        running, who is logged in etc.
     * 
     * The App should be serializable to save state to local storage for the
     * next run.
     * 
     * @property {Authentication} auth The auth member variable is an
     *           Authentication object permits access to the login and logout
     *           functions, and the database of users depending on whether the
     *           app is online or not.
     * 
     * @property {Corpus} corpus The corpus is a Corpus object which will permit
     *           access to the datum, and the data lists. The corpus feeds the
     *           search object with indexes and fields for advanced search, the
     *           corpus has datalists, has teams with permissions, has a
     *           confidentiality_encryption key, it's datum have sessions, its
     *           datalists have export.
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
      // If read in a stringified corpus, turn it into a corpus
      if (this.get("corpus").description != null) {
        console.log("\tUsing corpus from existing app.");
        this.set("corpus", new Corpus(this.get("corpus")));
      } else {
        this.set("corpus", new Corpus());
        console.log("\tUsing new corpus.");
      }
      this.auth = new Authentication();
      this.search = new Search();

    },
    defaults : {
      corpus : Corpus,
      username : localStorage.getItem("username"),
      sessionid : localStorage.getItem("sessionid")
    },
    auth : Authentication,
    search : Search,
    /**
     * This function triggers a sample app to load so that new users can play
     * around and get a feel for the app by seeing the data in context.
     */
    loadSample : function() {
      this.get("corpus").loadSample();

      this.auth.loadSample();
      this.search.loadSample();
    }
  });

  return App;
});
