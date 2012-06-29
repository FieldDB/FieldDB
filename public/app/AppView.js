define([ 
    "use!backbone", 
    "use!handlebars",
    "app/App", 
    "text!app/app.handlebars", 
    "app/AppRouter",
    "activity/ActivityFeed",
    "activity/ActivityFeedView",
    "authentication/Authentication",
    "authentication/AuthenticationEditView",
    "corpus/Corpus", 
    "corpus/CorpusEditView",
    "corpus/CorpusReadView",
    "data_list/DataList",
    "data_list/DataListReadView",
    "data_list/DataListEditView",
    "datum/Datum",
    "datum/DatumEditView",
    "datum/DatumFields", 
    "export/Export",
    "export/ExportReadView",
    "hotkey/HotKey",
    "hotkey/HotKeyEditView",
    "import/Import",
    "import/ImportEditView",
    "user/UserPreference",
    "user/UserPreferenceEditView",
    "search/Search",
    "search/SearchEditView",
    "datum/Session",
    "datum/SessionEditView",
    "datum/SessionReadView",
    "user/User",
    "user/UserEditView",
    "user/UserReadView",
    "user/UserWelcomeView",
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
    AuthenticationEditView,
    Corpus, 
    CorpusEditView,
    CorpusReadView,
    DataList,
    DataListReadView,
    DataListEditView,
    Datum,
    DatumEditView,
    DatumFields,
    Export,
    ExportReadView,
    HotKey,
    HotKeyEditView,
    Import,
    ImportEditView,
    UserPreference,
    UserPreferenceEditView,
    Search,
    SearchEditView,
    Session,
    SessionEditView,
    SessionReadView,
    User,
    UserEditView,
    UserReadView,
    UserWelcomeView
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

      var userToBePassedAround = new User();
     
      
      // Create five corpus views
      this.corpusReadLeftSideView = new CorpusReadView({
        model : this.model.get("corpus")
      });
      this.corpusReadLeftSideView.format = "leftSide";

      this.corpusEditEmbeddedView = new CorpusEditView({
        model : this.model.get("corpus")
      });
      this.corpusEditEmbeddedView.format = "centreWell";
      
      this.corpusReadEmbeddedView = new CorpusReadView({
        model : this.model.get("corpus")
      });
      this.corpusReadEmbeddedView.format = "centreWell";
      
      this.corpusEditFullscreenView = new CorpusEditView({
        model : this.model.get("corpus")
      });
      this.corpusEditFullscreenView.format = "fullscreen";
      
      this.corpusReadFullscreenView = new CorpusReadView({
        model : this.model.get("corpus")
      });
      this.corpusReadFullscreenView.format = "fullscreen";
      
      
      // Create a DatumView, cloning the default datum fields from the corpus 
      // in case they changed 
      this.fullScreenDatumView = new DatumEditView({
        model : new Datum({
          datumFields : this.model.get("corpus").get("datumFields").clone(),
          datumStates : this.model.get("corpus").get("datumStates").clone()
        })
      });
      
      var sessionToBePassedAround = this.model.get("currentSession");
      sessionToBePassedAround.set("sessionFields", this.model.get("corpus").get("sessionFields").clone());
      
      /*
       * Set up two session views
       */ 
      this.sessionEditView = new SessionEditView({
        model : sessionToBePassedAround
      });
      
      this.sessionSummaryView = new SessionReadView({
        model : sessionToBePassedAround
      });
      this.sessionSummaryView.format = "leftSide";
      
      
      // Create an AuthenticationEditView
      this.authView = new AuthenticationEditView({
        model : new Authentication({user: userToBePassedAround})
      });
      
      /* 
       * Set up the five user views
       */
      this.fullScreenEditUserView = new UserEditView({
        model : this.authView.model.get("user")
      });
      this.fullScreenEditUserView.format = "fullscreen";
      
      this.fullScreenReadUserView = new UserReadView({
        model : this.authView.model.get("user")
      });
      this.fullScreenReadUserView.format = "fullscreen";

      this.modalEditUserView = new UserEditView({
        model : this.authView.model.get("user")
      });
      this.modalEditUserView.format = "modal";
      
      this.modalReadUserView = new UserReadView({
        model : this.authView.model.get("user")
      });
      this.modalReadUserView.format = "modal";

      // Create a UserWelcomeView modal
      this.welcomeUserView = new UserWelcomeView({
        model : this.authView.model.get("user")
      });
      
      /*
       * Set up the four data list views
       */
      var dataListToBePassedAround = new DataList();
      
      this.dataListEditLeftSideView = new DataListEditView({
        model : dataListToBePassedAround
      }); 
      this.dataListEditLeftSideView.loadSample();
      this.dataListEditLeftSideView.format = "leftSide";
   
      this.dataListEditFullscreenView = new DataListEditView({
        model : this.dataListEditLeftSideView.model
      });  
      this.dataListEditFullscreenView.format = "fullscreen";

      this.dataListReadLeftSideView = new DataListReadView({
        model :  this.dataListEditLeftSideView.model
      });  
      this.dataListReadLeftSideView.format = "leftSide";
   
      this.dataListReadFullscreenView = new DataListReadView({
        model :  this.dataListEditLeftSideView.model
      });  
      this.dataListReadFullscreenView.format = "fullscreen";
      
      /*
       *  Create search views
       */
      this.searchView = new SearchEditView({
        model : new Search()
      });
      this.searchView.format = "top";
      
      this.advancedSearchView = new SearchEditView({
        model : new Search()
      });
      this.advancedSearchView.format = "fullscreen";
      
      // Create a UserPreferenceEditView
      this.userPreferenceView = new UserPreferenceEditView({
        model : this.authView.model.get("user").get("prefs")
      });
      
      // Create an ActivityFeedView
      this.activityFeedView = new ActivityFeedView({
        model : new ActivityFeed()
      }); 

      // Create a HotKeyEditView
      this.hotkeyEditView = new HotKeyEditView({
        model : this.authView.model.get("user").get("hotkeys")
      });   
      
      // Create an ExportREadView
      this.exportView = new ExportReadView({
        model : new Export()
      });

     
      
      // Create an ImportEditView
      this.importView = new ImportEditView({
        model : new Import()
      });

      // Create and initialize a Terminal
      this.term = new Terminal('terminal');
      this.term.initFS(false, 1024 * 1024);
      
      
      // Set up a timeout event every 10sec
      _.bindAll(this, "saveScreen");
      window.setInterval(this.saveScreen, 10000);     
    },
    
    /**
     * The underlying model of the AppView is an App.
     */
    model : App,

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
        
        // Display the Corpus Views
        this.corpusReadLeftSideView.render();
        this.corpusEditEmbeddedView.render();
        this.corpusReadEmbeddedView.render();
        this.corpusEditFullscreenView.render();
        this.corpusReadFullscreenView.render();
        
        this.exportView.render();
        
        // Display the DatumEditView
        this.fullScreenDatumView.render();
        
        // Display the User Views
        this.fullScreenEditUserView.render();
        this.fullScreenReadUserView.render();
        this.modalEditUserView.render();
        this.modalReadUserView.render();
        
        // Display the UserWelcomeView
        this.welcomeUserView.render();
        
        // Display the Search Views
        this.searchView.render();
        this.advancedSearchView.render();
        
        // Display the AuthView
        this.authView.render();
        
        // Display the SessionEditView
        this.sessionEditView.render();
        
        // Display the SessionSummaryReadView
        this.sessionSummaryView.render();
        
        // Display the UserPreferenceEditView
        this.userPreferenceView.render();
        
        //Display ActivityFeedView
        this.activityFeedView.render();
        
        // Display HotKeysView
        this.hotkeyEditView.render();//.showModal();

        // Display Data List Views 
        this.dataListEditLeftSideView.render();
        this.dataListEditFullscreenView.render();
        this.dataListReadLeftSideView.render();
        this.dataListReadFullscreenView.render();
         
        // Display the ImportEditView
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
      //these old methods were over writing the model with new data, effectively deleting old models which will be a terrible thing ot do in prodution
//      // Sample Corpus data
//      this.model.get("corpus").set({
//        "title" : "Quechua Corpus",
//        "titleAsUrl": "Quechua_Corpus",
//        "description" : "This is a corpus which will let you explore the app and see how it works. "
//            + "\nIt contains some data from one of our trips to Cusco, Peru."
//      });
//
//      // Sample Session data
//      this.model.get("currentSession").set("sessionFields", new DatumFields([
//        {label: "user", value: ""},
//        {label: "consultants", value: "John Doe and Mary Stewart"},
//        {label: "language", value: ""},
//        {label: "dialect", value: ""},
//        {label: "dateElicited", value: new Date()},
//        {label: "dateSEntered", value: new Date()},
//        {label: "goal", value: "To Win!"}
//      ]));
//        
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
    replicateDatabasesWithCallback : function(callback) {
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
          callback();
        });
      });
    },
    /**
     * Synchronize the activity feed server and local databases.
     * TODO change this line in case it is called on the wrong model
     *  this.activityFeedView.model.pouch(
     */
    replicateActivityFeedDatabase : function() {
      this.activityFeedView.model.pouch(function(err, db) {
        db.replicate.to(Utils.activityFeedCouchUrl, { continuous: false }, function(err, resp) {
          Utils.debug("Replicate to");
          Utils.debug(resp);
          Utils.debug(err);
        });
        db.replicate.from(Utils.activityFeedCouchUrl, { continuous: false }, function(err, resp) {
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
