define([
    "use!backbone", 
    "authentication/Authentication", 
    "corpus/Corpus",
    "search/Search",
    "datum/Session",
    "app/AppRouter",
    "confidentiality_encryption/Confidential",
    "libs/Utils"
], function(
    Backbone, 
    Authentication, 
    Corpus,
    Search,
    Session,
    AppRouter,
    Confidential
) {
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
     * 
     * @property {Session} currentSession The session that is currently open.
     * 
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
      this.bind('error', function(model, error) {
        Utils.debug("Error in App: " + error);
      });
      
      //TODO pull corpus id out of local storage or make new
      // If read in a stringified corpus, turn it into a corpus, then call fetch  
      if (this.get("corpus").description != null) {
        Utils.debug("\tUsing corpus from existing app.");
        this.set("corpus", new Corpus(this.get("corpus")));
      } else {
        this.set("corpus", new Corpus());
        this.get("corpus").set("confidential", new Confidential());
        Utils.debug("\tUsing new corpus.");
      }
      //TODO pull session out of local storage, or make new
    },
    
    defaults : {
      corpus : Corpus,
      username : localStorage.getItem("username"),
      sessionid : localStorage.getItem("sessionid"),
      currentSession : new Session()//TODO this seems dangerous, why create a new session rather than just putting a predicate/classname here?
    },
    
    router : AppRouter
  });

  return App;
});
