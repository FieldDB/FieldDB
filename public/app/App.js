define([
    "use!backbone", 
    "authentication/Authentication", 
    "corpus/Corpus",
    "datum/DatumFields",
    "search/Search",
    "datum/Session",
    "app/AppRouter",
    "confidentiality_encryption/Confidential",
    "libs/Utils"
], function(
    Backbone, 
    Authentication, 
    Corpus,
    DatumFields,
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
      
      /*
       * Load the most recent corpus
       */
      if (typeof this.get("corpus") == "function") {
        if(localStorage.getItem("corpusid")){
          //TODO user the corpusid from local storage
        }
        Utils.debug("\tUsing corpus from existing app.");
        this.set("corpus", new Corpus({
          "_id": "822AFBA3-CE50-40F5-B983-315277DD9661",
          "title": "Quechua Corpus",
          "titleAsUrl": "Quechua_Corpus",
          "description": "This is a corpus which will let you explore the app and see how it works. \nIt contains some data from one of our trips to Cusco, Peru.",
       }));
        this.get("corpus").id = "822AFBA3-CE50-40F5-B983-315277DD9661";
      }
      /*
       * Load the most recent session
       */
      if (typeof this.get("currentSession") == "function") {
        if (localStorage.getItem("sessionid")) {
          // TODO use the sessionid from local storage
        }
        Utils.debug("\tUsing session from existing app.");
        this.set("currentSession", new Session({
//          "_id": "822AFBA3-CE50-40F5-B983-315277DD9661",
          "sessionFields" : new DatumFields([ {
            label : "user",
            value : "sapir"
          }, {
            label : "consultants",
            value : "Tillohash and Gladys"
          }, {
            label : "language",
            value : "Quechua"
          }, {
            label : "dialect",
            value : "Cusco"
          }, {
            label : "dateElicited",
            value : new Date()
          }, {
            label : "dateSEntered",
            value : new Date()
          }, {
            label : "goal",
            value : "Working on which verbs combine with -naya"
          } ])
        }));
//        this.get("currentSession").id = "822AFBA3-CE50-40F5-B983-315277DD9661";

      }
      
      
    },
    
    defaults : {
      corpus : Corpus,
      sessionid : localStorage.getItem("sessionid"),
      currentSession : Session
    },
    
    router : AppRouter
  });

  return App;
});
