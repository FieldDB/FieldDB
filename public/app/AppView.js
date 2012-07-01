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
    "datum/DatumContainerEditView",
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
    DatumContainerEditView,
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
    UserReadView
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

//      var userToBePassedAround = new User();
     
      
      // Create five corpus views
      this.corpusEditLeftSideView = new CorpusEditView({
        model : this.model.get("corpus")
      });
      this.corpusEditLeftSideView.format = "leftSide";
      
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
      
      /*
       * Set up two session views
       */ 
      this.sessionEditView = new SessionEditView({
        model : this.model.get("currentSession")
      });
      
      this.sessionSummaryView = new SessionReadView({
        model : this.model.get("currentSession")
      });
      this.sessionSummaryView.format = "leftSide";
      
      // Create an AuthenticationEditView
      this.authView = new AuthenticationEditView({
        model : this.model.get("authentication")
      });
      
      /* 
       * Set up the five user views
       */
      this.fullScreenEditUserView = new UserEditView({
        model : this.model.get("authentication").get("user")
      });
      this.fullScreenEditUserView.format = "fullscreen";
      
      this.fullScreenReadUserView = new UserReadView({
        model : this.model.get("authentication").get("user")
      });
      this.fullScreenReadUserView.format = "fullscreen";

      this.modalEditUserView = new UserEditView({
        model : this.model.get("authentication").get("user")
      });
      this.modalEditUserView.format = "modal";
      
      this.modalReadUserView = new UserReadView({
        model : this.model.get("authentication").get("user")
      });
      this.modalReadUserView.format = "modal";

      
      // Create the embedded and fullscreen DatumContainerEditView
      this.datumsView = new DatumContainerEditView();
      
      /*
       * Set up the four data list views
       */
      var dataListToBePassedAround = this.model.get("currentDataList") || new DataList();
      
      this.dataListEditLeftSideView = new DataListEditView({
        model : dataListToBePassedAround
      }); 
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
        this.corpusEditLeftSideView.render();
        this.corpusReadLeftSideView.render();
        this.corpusEditEmbeddedView.render();
        this.corpusReadEmbeddedView.render();
        this.corpusEditFullscreenView.render();
        this.corpusReadFullscreenView.render();
        
        // Display the ExportView
        this.exportView.render();
        
        // Display the User Views
        this.fullScreenEditUserView.render();
        this.fullScreenReadUserView.render();
        this.modalEditUserView.render();
        this.modalReadUserView.render();
        
        // Display the Datum Container Views
        this.datumsView.format = "centreWell";
        this.datumsView.render();
        
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
    
    renderEditableCorpusViews: function(corpusid){
      // Display the Corpus Views
      this.corpusEditLeftSideView.render();
//      this.corpusReadLeftSideView.render();
      this.corpusEditEmbeddedView.render();
//      this.corpusReadEmbeddedView.render();
      this.corpusEditFullscreenView.render();
//      this.corpusReadFullscreenView.render();
    },
    renderReadonlyCorpusViews: function(corpusid){
      // Display the Corpus Views
//      this.corpusEditLeftSideView.render();
      this.corpusReadLeftSideView.render();
//      this.corpusEditEmbeddedView.render();
      this.corpusReadEmbeddedView.render();
//      this.corpusEditFullscreenView.render();
      this.corpusReadFullscreenView.render();
    },
    
    /**
     * This function triggers a sample app to load so that new users can play
     * around and get a feel for the app by seeing the data in context.
     */
    loadSample : function() {
      // Sample Corpus data
//      this.model.get("corpus").set({
//        "title" : "Quechua Corpus",
//        "titleAsUrl": "Quechua_Corpus",
//        "description" : "This is a corpus which will let you explore the app and see how it works. "
//            + "\nIt contains some data from one of our trips to Cusco, Peru."
//      });
      this.model.get("corpus").id ="822AFBA3-CE50-40F5-B983-315277DD9661";
      this.model.get("corpus").fetch();
      
      // Sample Session data
      this.model.get("currentSession").set("sessionFields", new DatumFields([
        {label: "user", value: ""},
        {label: "consultants", value: "Tillohash and Gladys"},
        {label: "language", value: "Cusco Quechua"},
        {label: "dialect", value: "Upper Cusco"},
        {label: "dateElicited", value: new Date()},
        {label: "dateSEntered", value: new Date()},
        {label: "goal", value: "Explore verbs which can combine with -naya"}
      ]));
      //TODO cant load sesson from database with out restructuring? SESSION render: [object HTMLDivElement] Utils.js:52
      //Uncaught TypeError: Object [object Object],[object Object],[object Object],[object Object],[object Object],[object Object],[object Object] has no method 'where' 
      
//      this.model.get("currentSession").id = "421CCC12-1487-4696-B7E9-AF80BBB9296C";
//      this.model.get("currentSession").fetch();
        
      this.model.get("currentDataList").id = "45444C8F-D707-426D-A422-54CD4041A5A1";
      this.model.get("currentDataList").fetch();
      
//      this.dataListEditLeftSideView.loadSample();

      this.authView.loadSample();
      //cannot laod directly cause wa want to fake that sapir is logged in.
//      this.authView.get("user").id = "5198E356-55AC-4E56-8F5D-CF3266C6457E";
//      this.authView.get("user").fetch();
      
      this.searchView.loadSample();
    },
    
    /**
     * Synchronize the server and local databases.
     */
    replicateDatabases : function() {
      (new Datum()).pouch(function(err, db) {
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
      (new Datum()).pouch(function(err, db) {
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
      (new ActivityFeedView()).pouch(function(err, db) {
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
      // Save the Datum pages, if necessary
      this.datumsView.saveScreen();
    }
    
  });

  return AppView;
});
