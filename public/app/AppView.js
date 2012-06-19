define([ 
    "use!backbone", 
    "use!handlebars",
    "app/App", 
    "text!app/app.handlebars", 
    "app/AppRouter",
    "activity/ActivityFeed",
    "activity/ActivityFeedView",
    "authentication/Authentication",
    "authentication/AuthenticationView",
    "corpus/Corpus", 
    "corpus/CorpusFullscreenView",
    "corpus/CorpusView",
    "corpus/NewCorpusView",
    "data_list/DataList",
    "data_list/DataListView",
    "data_list/NewDataListView",
    "datum/Datum",
    "datum/DatumView", 
    "hotkey/HotKey",
    "hotkey/HotKeyConfigView",
    "import/Import",
    "import/ImportView",
    "user/UserPreference",
    "user/UserPreferenceView",
    "search/Search",
    "search/SearchView",
    "search/AdvancedSearchView",
    "datum/Session",
    "datum/SessionEditView",
    "user/User",
    "user/UserProfileView",
    "hotkey/HotKey",
    "hotkey/HotKeyConfigView",
    "export/Export",
    "export/ExportView",
    "user/UserProfileView",   
    "libs/Utils"
], function(
    Backbone, 
    Handlebars,
    App, 
    appTemplate,
    AppRouter, 
    ActivityFeed,
    ActivityFeedView,
    Authentication,
    AuthenticationView,
    Corpus, 
    CorpusFullscreenView,
    CorpusView,
    NewCorpusView,
    DataList,
    DataListView,
    NewDataListView,
    Datum,
    DatumView,
    HotKey,
    HotKeyConfigView,
    Import,
    ImportView,
    UserPreference,
    UserPreferenceView,
    Search,
    SearchView,
    AdvancedSearchView,
    Session,
    SessionEditView,
    User,
    UserProfileView,
    HotKey,
    HotKeyConfigView,
    Export,
    ExportView,
    UserProfileView
) {
  var AppView = Backbone.View.extend(
  /** @lends AppView.prototype */
  {
    /**
     * @class The main layout of the program controls and loads the app. It
     *        allows the user to configure the dashboard by loading their
     *        handlebars. It contains the views of all the core models
     *        referenced in the app model and it will have partial handlebar of
     *        the navigation menu.
     * 
     * @description Starts the application and initializes all its children.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("APP init: " + this.el);
      
      // Create a CorpusView for the Corpus in the App
      this.corpusView = new CorpusView({
        model : this.model.get("corpus")
      });
      
      // Create a DatumView
      this.fullScreenDatumView = new DatumView({
        model : new Datum()
      });
      
      this.sessionEditView = new SessionEditView({
        model : new Session()
      });
      
      var userToBePassedAround = new User();
   // Create an AuthenticationView
      this.authView = new AuthenticationView({
        model : new Authentication({user: userToBePassedAround})
      });
      
      // Create a UserProfileView
      this.fullScreenUserView = new UserProfileView({
        model : userToBePassedAround
      });
      
      // Create a DataListView   
      this.dataListView = new DataListView({
        model : new DataList({
          
          datumIds : [
            "574e79f1c0c02df02b116ac71a0008f0",
            "574e79f1c0c02df02b116ac71a000b3a"
          ]
        })
      });
      
      // Create a SearchView
      this.searchView = new SearchView({
        model : new Search()
      });
      this.advancedSearchView = new AdvancedSearchView({
        model : new Search()
      });
      
      this.userPreferenceView = new UserPreferenceView({
        model : userToBePassedAround.get("prefs")
      });
      
      // Create an ActivityFeedView
      this.activityFeedView = new ActivityFeedView({
        model : new ActivityFeed()
      }); 
      
      // Create an newDataListView
      this.newDataListView = new NewDataListView({
        model : new DataList()
      });  
      
      // Create a HotKeyConfigView
      this.hotkeyConfigView = new HotKeyConfigView({
        model : new HotKey()
      });  
      
      
      // Create an ExportView
      this.exportView = new ExportView({
        model : new Export()
      }); 

      // Create a NewCorpusView
      this.newCorpusView = new NewCorpusView({
        model : new Corpus()
      });

      // Create a CorpusEditView
      this.fullscreenCorpusView = new CorpusFullscreenView({
        model : this.model.get("corpus")
      });
      
      // Create an ImportView
      this.importView = new ImportView({
        model : new Import()
      });

      // Set up a timeout event every 10sec
      _.bindAll(this, "saveScreen");
      window.setInterval(this.saveScreen, 10000);     
    },
    
    /**
     * The underlying model of the AppView is an App.
     */
    model : App,
    
    /**
     * The corpusView is a child of the AppView.
     */
    corpusView : CorpusView,
    
    exportView : ExportView,
    
    /**
     * The fullScreenDatumView is a child of the AppView.
     */
    fullScreenDatumView : DatumView,
    
    /**
     * The fullScreenUserView is a child of the AppView.
     */
    fullScreenUserView : UserProfileView,
    
    /**
     * The dataListView is a child of the AppView.
     */
    dataListView : DataListView,
    
    /**
     * The searchView is a child of the AppView.
     */
    searchView : SearchView,
    
    /**
     * The advancedSearchView is a child of the AppView.
     */
    advancedSearchView : AdvancedSearchView,
  
    /**
     * The authView is a child of the AppView.
     */  
    authView : AuthenticationView,
    /**
     * The sessionEditView is a child of the AppView.
     */  
    sessionEditView : SessionEditView,
    
    /**
     * The userUserPreferenceView is a child of the AppView.
     */  
    userPreferenceView : UserPreferenceView,
    
    /**
     * The activityFeedView is a child of the AppView.
     */
    activityFeedView : ActivityFeedView,
    
    /**
     * The hotkeyConfigView is a child of the AppView.
     */
    hotkeyConfigView : HotKeyConfigView,

    /**
     * The newDataListView is a child of the AppView.
     */
    newDataListView : NewDataListView,
    
    /**
     * The newCorpusView is a child of the AppView.
     */
    newCorpusView : NewCorpusView,
    
    /**
     * The fullscreenCorpusView is a child of the AppView.
     */
    fullscreenCorpusView : CorpusFullscreenView,

    /**
     * The importView is a child of the AppView.
     */
    importView : ImportView,

    /**
     * Events that the AppView is listening to and their handlers.
     */
    events : {
      "click .icon-refresh" : "replicateDatabases"
    },
    
    /**
     * The Handlebars template rendered as the AppView.
     */
    template : Handlebars.compile(appTemplate),
    
    /**
     * Renders the AppView and all of its child Views.
     */
    render : function() {
      Utils.debug("APP render: " + this.el);
      if (this.model != undefined) {
        // Display the AppView
        this.setElement($("#app_view"));
        $(this.el).html(this.template(this.model.toJSON()));
        
        // Display the CorpusView
        this.corpusView.render();
        
        this.exportView.render();
        
        // Display the DatumView
        this.fullScreenDatumView.render();
        
        // Display the UserProfileView
        this.fullScreenUserView.render();
        
        // Display the DataListView
        this.dataListView.render();
                
        // Display the SearchView
        this.searchView.render();
        
        this.advancedSearchView.render();
        
        // Display the AuthView
        this.authView.render();
        
        // Display the SessionEditView
        this.sessionEditView.render();
        
        // Display the UserPreferenceView
        this.userPreferenceView.render();
        
        //Display ActivityFeedView
        this.activityFeedView.render();
        
        //Display HotKeysView
        this.hotkeyConfigView.render();//.showModal();

        //Display NewDataListView
        this.newDataListView.render();
        
        //Display NewCorpusView
        this.newCorpusView.render();
         
        //Display ImportView
        this.importView.render();
        
        // Dispaly the CorpusFullscreenView
        this.fullscreenCorpusView.render();
      } else {
        Utils.debug("\tApp model is not defined");
      }
      
      return this;
    },
    
    /**
     * This function triggers a sample app to load so that new users can play
     * around and get a feel for the app by seeing the data in context.
     */
    loadSample : function() {
      // Sample Corpus data
      
      this.model.get("corpus").set({
        "title" : "Quechua Corpus",
        "titleAsUrl": "Quechua_Corpus",
        "description" : "This is a corpus which will let you explore the app and see how it works. "
            + "\nIt contains some data from one of our trips to Cusco, Peru."
      });
      
      //Notes, i moved loadsample "higher" in the sense that it is geting called in auth view so that the user can be conneced throughout the app.
      this.corpusView.loadSample();
      
      this.authView.loadSample();
      
      this.searchView.loadSample();
    },
    
    /**
     * Synchronize the server and local databases.
     */
    replicateDatabases : function() {
      this.fullScreenDatumView.model.pouch(function(err, db) {
        db.replicate.to(Utils.couchUrl, { continuous: false }, function(err, resp) {
          Utils.debug("Replicate to");
          Utils.debug(resp);
          Utils.debug(err);
        });
        db.replicate.from(Utils.couchUrl, { continuous: false }, function(err, resp) {
          Utils.debug("Replicate from");
          Utils.debug(resp);
          Utils.debug(err);
        });
      });
    },
    
    saveScreen : function() {
      // Save the FullScreenDatum page, if necessary
      this.fullScreenDatumView.saveScreen();
    }
  });

  return AppView;
});
