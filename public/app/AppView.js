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
    "corpus/CorpusView",
    "corpus/NewCorpusView",
    "data_list/DataList",
    "data_list/DataListView",
    "data_list/NewDataListView",
    "datum/Datum",
    "datum/DatumView", 
    "datum_pref/DatumPref",
    "datum_pref/DatumPrefView",
    "hotkey/HotKey",
    "hotkey/HotKeyConfigView",
    "import/Import",
    "import/ImportView",
    "preference/Preference",
    "preference/PreferenceView",
    "search/Search",
    "search/SearchView",
    "search/AdvancedSearchView",
    "session/Session",
    "session/SessionEditView",
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
    CorpusView,
    NewCorpusView,
    DataList,
    DataListView,
    NewDataListView,
    Datum,
    DatumView,
    DatumPref,
    DatumPrefView,
    HotKey,
    HotKeyConfigView,
    Import,
    ImportView,
    Preference,
    PreferenceView,
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
      
      // Create a UserProfileView
      this.fullScreenUserView = new UserProfileView({
        model : new User()
      });
      
      // Create a DataListView   
      this.dataListView = new DataListView({
        model : new DataList({
          title : "MyTitle",
          dateCreated : "June 5, 2012",
          description : "MyDescription",
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
      
      this.preferenceView = new PreferenceView({
        model : new Preference()
      });
               
      // Create an AuthenticationView
      this.authView = new AuthenticationView({
        model : new Authentication()
      });
      
      // Create an DatumPrefView
      this.datumPrefView = new DatumPrefView({
        model : new Authentication()
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
      

      
//    Create an ImportView
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
     * The userPreferenceView is a child of the AppView.
     */  
    preferenceView : PreferenceView,
    
    datumPrefView : DatumPrefView,
    
    activityFeedView : ActivityFeedView,
    
    hotkeyConfigView : HotKeyConfigView,

    newDataListView : NewDataListView,
    

    newCorpusView : NewCorpusView,
    

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
        
        // Display the PreferenceView
        this.preferenceView.render();
        
        this.datumPrefView.render();
        
        this.activityFeedView.render();
        
        this.hotkeyConfigView.render();

        this.newDataListView.render();

        this.newCorpusView.render();
         

        this.importView.render();
        

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
