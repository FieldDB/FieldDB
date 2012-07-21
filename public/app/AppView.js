define([ 
    "backbone", 
    "handlebars",
    "app/App", 
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
    "datum/Datums",
    "datum/DatumContainerEditView",
    "datum/DatumContainerReadView",
    "datum/DatumFields", 
    "export/Export",
    "export/ExportReadView",
    "hotkey/HotKey",
    "hotkey/HotKeyEditView",
    "import/Import",
    "import/ImportEditView",
    "insert_unicode/InsertUnicode",
    "insert_unicode/InsertUnicodes",
    "insert_unicode/InsertUnicodesView",
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
    "terminal",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars,
    App, 
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
    Datums,
    DatumContainerEditView,
    DatumContainerReadView,
    DatumFields,
    Export,
    ExportReadView,
    HotKey,
    HotKeyEditView,
    Import,
    ImportEditView,
    InsertUnicode,
    InsertUnicodes,
    InsertUnicodesView,
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
    Terminal
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
     
      
      // Create seven corpus views
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
      
      this.corpusNewModalView = new CorpusEditView({
        model : this.model.get("corpus")
      });
      this.corpusNewModalView.format = "modal";
      
      /*
       * Set up four session views
       */ 
      this.sessionEditLeftSideView = new SessionEditView({
        model : this.model.get("currentSession")
      });
      this.sessionEditLeftSideView.format = "leftSide";
      this.sessionReadLeftSideView = new SessionReadView({
        model : this.model.get("currentSession")
      });
      this.sessionReadLeftSideView.format = "leftSide";
      this.sessionEditEmbeddedView = new SessionEditView({
        model : this.model.get("currentSession")
      });
      this.sessionEditEmbeddedView.format = "embedded";
      this.sessionReadEmbeddedView = new SessionReadView({
        model : this.model.get("currentSession")
      });
      this.sessionReadEmbeddedView.format = "embedded";
      this.sessionEditFullscreenView = new SessionEditView({
        model : this.model.get("currentSession")
      });
      this.sessionEditFullscreenView.format = "fullscreen";
      this.sessionReadFullscreenView = new SessionReadView({
        model : this.model.get("currentSession")
      });
      this.sessionReadFullscreenView.format = "fullscreen";
      this.sessionModalView = new SessionEditView({
        model : this.model.get("currentSession")
      });
      this.sessionModalView.format = "modal";
      
      // Create an AuthenticationEditView
      this.authView = new AuthenticationEditView({
        model : this.model.get("authentication")
      });
      
      /* 
       * Set up the five user views
       */
      this.fullScreenEditUserView = new UserEditView({
        model : this.model.get("authentication").get("userPrivate")
      });
      this.fullScreenEditUserView.format = "fullscreen";
      
      this.fullScreenReadUserView = new UserReadView({
        model : this.model.get("authentication").get("userPrivate")
      });
      this.fullScreenReadUserView.format = "fullscreen";

      this.modalEditUserView = new UserEditView({
        model : this.model.get("authentication").get("userPrivate")
      });
      this.modalEditUserView.format = "modal";
      
      this.modalReadUserView = new UserReadView({
        model : this.model.get("authentication").get("userPrivate")
      });
      this.modalReadUserView.format = "modal";

      
      // Create the embedded and fullscreen DatumContainerEditView
      var datumsToBePassedAround = new Datums();
      this.datumsView = new DatumContainerEditView({
        model : datumsToBePassedAround
      });
      this.datumsReadView = new DatumContainerReadView({
        model : datumsToBePassedAround
      });
      
      /*
       * Set up the six data list views
       */
      var dataListToBePassedAround = this.model.get("currentDataList") || new DataList();
      var datumsCollectionToBePassedAround = new Datums();
      
      this.dataListEditMiddleView = new DataListEditView({
        model : dataListToBePassedAround,
        datumCollection : datumsCollectionToBePassedAround 
      }); 
      this.dataListEditMiddleView.format = "centreWell";
      
      this.dataListReadMiddleView = new DataListEditView({
        model : dataListToBePassedAround,
        datumCollection : datumsCollectionToBePassedAround 
      }); 
      this.dataListReadMiddleView.format = "centreWell";
      
      this.dataListEditLeftSideView = new DataListEditView({
        model : dataListToBePassedAround,
        datumCollection : datumsCollectionToBePassedAround 
      }); 
      this.dataListEditLeftSideView.format = "leftSide";
   
      this.dataListEditFullscreenView = new DataListEditView({
        model : this.dataListEditLeftSideView.model,
        datumCollection : datumsCollectionToBePassedAround 
      });  
      this.dataListEditFullscreenView.format = "fullscreen";

      this.dataListReadLeftSideView = new DataListReadView({
        model :  this.dataListEditLeftSideView.model,
        datumCollection : datumsCollectionToBePassedAround 
      });  
      this.dataListReadLeftSideView.format = "leftSide";
   
      this.dataListReadFullscreenView = new DataListReadView({
        model :  this.dataListEditLeftSideView.model,
        datumCollection : datumsCollectionToBePassedAround 
      });  
      this.dataListReadFullscreenView.format = "fullscreen";
      
      /*
       *  Create search views
       */
      this.searchTopView = new SearchEditView({
        model : new Search()
      });
      this.searchTopView.format = "top";
      
      var searchToBePassedAround = new Search();
      this.searchFullscreenView = new SearchEditView({
        model : searchToBePassedAround
      });
      this.searchFullscreenView.format = "fullscreen";
      
      this.searchEmbeddedView = new SearchEditView({
        model : searchToBePassedAround
      });
      this.searchEmbeddedView.format = "centreWell";
      
      // Create a UserPreferenceEditView
      this.userPreferenceView = new UserPreferenceEditView({
        model : this.authView.model.get("userPrivate").get("prefs")
      });
      
      // Create an ActivityFeedView
      this.activityFeedView = new ActivityFeedView({
        model : new ActivityFeed()
      }); 
      this.activityFeedView.format = "rightSide";
      
      // Create an InsertUnicodesView
      this.insertUnicodesView = new InsertUnicodesView({
        model : this.authView.model.get("userPrivate").get("prefs").get("unicodes")
      });
      this.insertUnicodesView.format = "rightSide"; 

      // Create a HotKeyEditView
      this.hotkeyEditView = new HotKeyEditView({
        model : this.authView.model.get("userPrivate").get("hotkeys")
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
      "click .icon-sitemap" : "replicateDatabases",
      "click #quick-authentication-okay-btn" : function(e){
        window.hub.publish("quickAuthenticationClose","no message");
      },
      "click .icon-home" : function() {
//        this.model.router.showDashboard();
        window.location.href = "#";
        app.router.showDashboard(); //the above line wasnt working
      },
      "click .save-dashboard": function(){
        window.app.storeCurrentDashboardIdsToLocalStorage();
      },
      "click .sync-everything" : "replicateDatabases"
    },
    
    /**
     * The Handlebars template rendered as the AppView.
     */
    template : Handlebars.templates.app,
    
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
        this.corpusNewModalView.render();
        
        // Display the ExportView
        this.exportView.render();
        
        // Display the User Views
        this.fullScreenEditUserView.render();
        this.fullScreenReadUserView.render();
        this.modalEditUserView.render();
        this.modalReadUserView.render();
        
        // Display the Datum Container Views
        this.renderReadonlyDatumsViews("centreWell");
        this.renderEditableDatumsViews("centreWell");
        
        // Display the Search Views
        this.searchTopView.render();
        this.searchFullscreenView.render();
        this.searchEmbeddedView.render();
        
        // Display the AuthView
        this.authView.render();
        
        // Display the Session Views
        this.sessionEditLeftSideView.render();
        this.sessionReadLeftSideView.render();
        this.sessionEditEmbeddedView.render();
        this.sessionReadEmbeddedView.render();
        this.sessionEditFullscreenView.render();
        this.sessionReadFullscreenView.render();
        this.sessionModalView.render();
        
        // Display the UserPreferenceEditView
        this.userPreferenceView.render();
        
        //Display ActivityFeedView
        this.activityFeedView.render();
        
        this.insertUnicodesView.render();
        
        // Display HotKeysView
        this.hotkeyEditView.render();//.showModal();

        // Display Data List Views 
        this.dataListEditMiddleView.render();
        this.dataListEditLeftSideView.render();
        this.dataListEditFullscreenView.render();
        this.dataListReadLeftSideView.render();
        this.dataListReadFullscreenView.render();
        this.dataListReadMiddleView.render();

         
        // Display the ImportEditView
        this.importView.render();
      } else {
        Alert("\tApp model is not defined, refresh your browser."+ Utils.contactUs);
      }
      
      this.setTotalPouchDocs();
      this.setTotalBackboneDocs();
      
      return this;
    },
    
    // Display the Corpus Views
    renderEditableCorpusViews : function(corpusid) {
      this.corpusEditLeftSideView.render();
      this.corpusEditEmbeddedView.render();
      this.corpusEditFullscreenView.render();
      this.corpusNewModalView.render();
    },
    renderReadonlyCorpusViews : function(corpusid) {
      this.corpusReadLeftSideView.render();
      this.corpusReadEmbeddedView.render();
      this.corpusReadFullscreenView.render();
    },
      
    // Display Session Views
    renderEditableSessionViews : function(sessionid) {
      this.sessionEditLeftSideView.render();
      this.sessionEditEmbeddedView.render();
      this.sessionEditFullscreenView.render();
      this.sessionModalView.render();
    },
    renderReadonlySessionViews : function(sessionid) {
      this.sessionReadLeftSideView.render();
      this.sessionReadEmbeddedView.render();
      this.sessionReadFullscreenView.render();
    },
    
    // Display DataList Views
    renderEditableDataListViews : function(datalistid) {
      this.dataListEditLeftSideView.render();
      this.dataListEditFullscreenView.render();
    },
    renderReadonlyDataListViews : function(datalistid) {
      this.dataListReadLeftSideView.render();
      this.dataListReadFullscreenView.render();
    },
    renderFirstPageReadonlyDataListViews : function() {
      this.dataListEditLeftSideView.renderFirstPage();
      this.renderReadonlyDataListViews();
    },
    
    // Display Datums View
    renderEditableDatumsViews : function(format) {
      this.datumsView.format = format;
      this.datumsView.render();
    },
    renderReadonlyDatumsViews : function(format) {
      this.datumsReadView.format = format;
      this.datumsReadView.render();
    },
    
    // Display DataList Views
    renderEditableUserViews : function(userid) {
      this.fullScreenEditUserView.render();
      this.modalEditUserView.render();
    },
    renderReadonlyUserViews : function(userid) {
      this.fullScreenReadUserView.render();
      this.modalReadUserView.render();
    },
    
    /**
     * This function triggers a sample app to load so that new users can play
     * around and get a feel for the app by seeing the data in context.
     */
    loadSample : function() {
//      var ids= {};
//      ids.corpusid = "4C1A0D9F-D548-491D-AEE5-19028ED85F2B";
//      ids.sessionid = "1423B167-D728-4315-80DE-A10D28D8C4AE";
//      ids.datalistid = "1C1F1187-329F-4473-BBC9-3B15D01D6A11";
//      
//      //all the replication etc happens in authView
//      this.authView.loadSample(ids);
//      
//      this.searchTopView.loadSample();
    },
    
    /**
     * Save current state, synchronize the server and local databases.
     * 
     * If the corpus connection is currently the default, it attempts to replicate from  to the users' last corpus instead.
     */
    replicateDatabases : function(callback) {
      var self = this;
      this.model.storeCurrentDashboardIdsToLocalStorage(function(){
        //syncUserWithServer will prompt for password, then run the corpus replication.
        self.model.get("authentication").syncUserWithServer(function(){
          var corpusConnection = self.model.get("corpus").get("couchConnection");
          if(self.model.get("authentication").get("userPrivate").get("corpuses").corpusname != "default" 
            && app.get("corpus").get("couchConnection").corpusname == "default"){
            corpusConnection = self.model.get("authentication").get("userPrivate").get("corpuses")[0];
          }
          self.model.get("corpus").replicateCorpus(corpusConnection, callback);
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
        //TODO when activity feed becomes useful, ie a team feed, then replicate from as well.
//        db.replicate.from(Utils.activityFeedCouchUrl, { continuous: false }, function(err, resp) {
//          Utils.debug("Replicate from");
//          Utils.debug(resp);
//          Utils.debug(err);
//        });
      });
    },
    
    saveScreen : function() {
      // Save the Datum pages, if necessary
      this.datumsView.saveScreen();
    },
    /**
     * http://www.html5rocks.com/en/tutorials/dnd/basics/
     * 
     * @param e event
     */
    dragUnicodeToField : function(e) {
      Utils.debug("Recieved a drop event ");
      // this / e.target is current target element.
      if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from redirecting.
      }
      if (e.preventDefault) {
        e.preventDefault(); 
      }
      
      //if it's a unicode dragging event
      if(window.appView.insertUnicodesView.dragSrcEl != null){
        // Don't do anything if dropping the same object we're dragging.
        if (window.appView.insertUnicodesView.dragSrcEl != this) {
          // add the innerhtml to the target's values
          //if you want to flip the innerHTML of the draggee to the dragger
          //window.appView.importView.dragSrcEl.innerHTML = e.target.value;
          e.target.value = e.target.value + window.appView.insertUnicodesView.dragSrcEl.innerHTML;//e.dataTransfer.getData('text/html');
          //say that the unicode drag event has been handled
          window.appView.insertUnicodesView.dragSrcEl = null;
        }
        return false;
      }
    },
    /*
     * prevent default drag over events on droppable elements in general so that we can drop.
     */
    handleDragOver : function(e) {
      if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
      }
      e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
      return false;
    },
    
    /**
     * Helper functions to modify the status bars for unsaved and unsynced info
     */
    totalUnsaved: [],
    totalUnsynced: [],
    totalPouchDocs: [],//TODO find out how to do this?
    totalBackboneDocs: [],
    addUnsavedDoc : function(id){
      if(this.totalUnsaved.indexOf(id) == -1){
        this.totalUnsaved.push(id);
      }
      $(".unsaved-changes").val(this.totalUnsaved.length);
      this.addUnsyncedDoc(id);
      this.addBackboneDoc(id);
    },
    addSavedDoc : function(id){
      var pos = this.totalUnsaved.indexOf(id);
      if(pos > -1){
        this.totalUnsaved.splice(pos, 1);
      }
      $(".unsaved-changes").val(this.totalUnsaved.length);
      this.addUnsyncedDoc(id);
      this.addBackboneDoc(id);
    },
    addUnsyncedDoc : function(id){
      if(this.totalUnsynced.indexOf(id) == -1){
        this.totalUnsynced.push(id);
      }
      $(".unsynced-changes").val(this.totalUnsynced.length);
      this.addPouchDoc(id);
    },
    allSyncedDoc : function(){
      for(i in this.totalUnsynced){
        this.addPouchDoc(this.totalUnsynced[i]);
        this.addBackboneDoc(this.totalUnsynced[i]);
      }
      this.totalUnsynced = [];
      $(".unsynced-changes").val(this.totalUnsynced.length);
    },
    addPouchDoc : function(id){
      if(this.totalPouchDocs.indexOf(id) == -1){
        this.totalPouchDocs.push(id);
      }
      this.setTotalPouchDocs();      
    },
    addBackboneDoc : function(id){
      if(this.totalBackboneDocs.indexOf(id) == -1){
        this.totalBackboneDocs.push(id);
      }
      this.setTotalBackboneDocs();      
    },
    setTotalPouchDocs: function(){
      $(".unsynced-changes").attr("max", this.totalPouchDocs.length);
      $(".unsynced-changes").val(this.totalUnsynced.length);
    },
    setTotalBackboneDocs: function(){
      $(".unsaved-changes").attr("max", this.totalBackboneDocs.length);
      $(".unsaved-changes").val(this.totalUnsaved.length);

    },
    toastSavingDatumsCount : 0,
    toastUser : function(message, alertType, heading){
      if(message == "Automatically saving visible datum entries every 10 seconds."){
        this.toastSavingDatumsCount++;
        if(this.toastSavingDatumsCount == 5){
          message = message+"<p>&nbsp;</p><p>The app will continue to save your visible datum enties every 10 seconds, but it will no longer show these messages.</p>";
        }if(this.toastSavingDatumsCount > 5){
          return;
        }
      }
      if(!alertType){
        alertType = "";
      }
      if(!heading){
        heading = "Warning!";
      }
      $('#toast-user-area').append("<div class='alert "+alertType+" alert-block'>"
          +"<a class='close' data-dismiss='alert' href='#'>×</a>"
          +"<strong class='alert-heading'>"+heading+"</strong> "
          + message
        +"</div>")
    }
    
    
  });

  return AppView;
});
