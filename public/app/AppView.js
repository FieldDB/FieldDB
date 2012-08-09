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
    "corpus/CorpusMask", 
    "corpus/CorpusEditView",
    "corpus/CorpusReadView",
    "data_list/DataList",
    "data_list/DataListReadView",
    "data_list/DataListEditView",
    "datum/Datum",
    "datum/Datums",
    "datum/DatumContainerEditView",
    "datum/DatumContainerReadView",
    "datum/DatumReadView",
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
    "app/PaginatedUpdatingCollectionView",
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
    CorpusMask,
    CorpusEditView,
    CorpusReadView,
    DataList,
    DataListReadView,
    DataListEditView,
    Datum,
    Datums,
    DatumContainerEditView,
    DatumContainerReadView,
    DatumReadView,
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
    PaginatedUpdatingCollectionView,
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
      Utils.debug("APPVIEW init: " + this.el);

      this.setUpAndAssociateViewsAndModelsWithCurrentUser();
      this.setUpAndAssociateViewsAndModelsWithCurrentSession();
      this.setUpAndAssociateViewsAndModelsWithCurrentDataList();
      this.setUpAndAssociateViewsAndModelsWithCurrentCorpus();

      // Create and initialize a Terminal
      this.term = new Terminal('terminal');
      this.term.initFS(false, 1024 * 1024);
      
      // Set up a timeout event every 10sec
      _.bindAll(this, "saveScreen");
      window.setInterval(this.saveScreen, 10000);     
    },
    setUpAndAssociateViewsAndModelsWithCurrentCorpus : function(callback){
      // Create three corpus views
      if(this.currentCorpusEditView){
        this.currentCorpusEditView.destroy_view();
      }
      this.currentCorpusEditView = new CorpusEditView({
        model : this.model.get("corpus")
      });
      this.currentCorpusEditView.format = "leftSide";
     
      if(this.currentCorpusReadView){
        this.currentCorpusReadView.destroy_view();
      }
      this.currentCorpusReadView = new CorpusReadView({
        model : this.model.get("corpus")
      });
      this.currentCorpusReadView.format = "leftSide";
      
      this.setUpAndAssociatePublicViewsAndModelsWithCurrentCorpusMask( new CorpusMask(this.model.get("corpus").get("publicSelf")) );

      //Only create a new corpusmodalview if it wasnt already created TODO this might have sideeffects
      if(! this.corpusNewModalView){
        Utils.debug("Creating an empty new corpus for the new Corpus modal.");
        this.corpusNewModalView = new CorpusEditView({
          model : new Corpus()
        });
        this.corpusNewModalView.format = "modal";
      }
      
      
      //TODO not sure if we should do this here
      // Create an ImportEditView

      if(this.importView){
        this.importView.destroy_view();
      }
      this.importView = new ImportEditView({
        model : new Import()
      });
      
      //TODO not sure if we should do this here
      // Create an ExportReadView
      this.exportView = new ExportReadView({
        model : new Export()
      });
      
      /*
       *  Create search views
       */
      if(this.searchEditView){
        this.searchEditView.destroy_view();
      }
      this.searchEditView = new SearchEditView({
        model : this.model.get("search")
      });
      this.searchEditView.format = "centreWell";

      
      // Create the embedded and fullscreen DatumContainerEditView
      var datumsToBePassedAround = new Datums();
      this.datumsEditView = new DatumContainerEditView({
        model : datumsToBePassedAround
      });
      this.datumsReadView = new DatumContainerReadView({
        model : datumsToBePassedAround
      });
      
      if(typeof callback == "function"){
        callback();
      }
    },
    setUpAndAssociatePublicViewsAndModelsWithCurrentCorpusMask : function(model, callback){
      this.publicCorpusReadEmbeddedView = new CorpusReadView({
        model : model
      });
      this.publicCorpusReadEmbeddedView.format = "public";
    },
    setUpAndAssociateViewsAndModelsWithCurrentSession : function(callback){
      /*
       * Set up three session views
       */ 
      if(this.currentSessionEditView){
        this.currentSessionEditView.destroy_view();
      }
      this.currentSessionEditView = new SessionEditView({
        model : this.model.get("currentSession")
      });
      this.currentSessionEditView.format = "leftSide";
      
      if(this.currentSessionReadView){
        this.currentSessionReadView.destroy_view();
      }
      this.currentSessionReadView = new SessionReadView({
        model : this.model.get("currentSession")
      });
      this.currentSessionReadView.format = "leftSide";
      
      //Only make a new session modal if it was not already created
      if(! this.sessionNewModalView){
        Utils.debug("Creating an empty new session for the new Session modal.");
        this.sessionNewModalView = new SessionEditView({
          model : new Session({
            corpusname : window.app.get("corpus").get("corpusname"),
            sessionFields : window.app.get("currentSession").get("sessionFields").clone()
          })
        });
        this.sessionNewModalView.format = "modal";
      }
      if(typeof callback == "function"){
        callback();
      }
    },
    setUpAndAssociateViewsAndModelsWithCurrentUser : function(callback){
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
      
      this.setUpAndAssociatePublicViewsAndModelsWithCurrentUserMask(this.model.get("authentication").get("userPublic") );
      
      this.modalEditUserView = new UserEditView({
        model : this.model.get("authentication").get("userPrivate")
      });
      this.modalEditUserView.format = "modal";
      
      this.modalReadUserView = new UserReadView({
        model : this.model.get("authentication").get("userPrivate")
      });
      this.modalReadUserView.format = "modal";
      

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
      
      if(typeof callback == "function"){
        callback();
      }
    },
    setUpAndAssociatePublicViewsAndModelsWithCurrentUserMask : function(model, callback){
      this.publicReadUserView = new UserReadView({
        model : model
      });
      this.publicReadUserView.format = "public";
    },
    /*
     * Set up the six data list views, kills all collection in the currentPaginatedDataListDatumsView
     */
    setUpAndAssociateViewsAndModelsWithCurrentDataList : function(callback){

      if( this.currentPaginatedDataListDatumsView ){
//        if( this.currentPaginatedDataListDatumsView.filledBasedOnModels ){
//          alert("The current paginated datum collection was filled iwth models. some info might be lost by doing this overwrite.")
//        }
//        
//        if( this.currentPaginatedDataListDatumsView.collection.length > this.model.get("currentDataList").get("datumIds").length){
//          alert("The currentPaginatedDataListDatumsView already has more datum than the current datalist.");
//        }
        //TODO might need to do more scrubbing
        //Convenience function for removing the view from the DOM.
        this.currentPaginatedDataListDatumsView.remove();//this seems okay, its not removing the ul we need for the next render
//        while (appView.currentPaginatedDataListDatumsView.collection.length > 0) {
//          appView.currentPaginatedDataListDatumsView.collection.pop();
//        }
        this.currentPaginatedDataListDatumsView.collection.reset(); //could also use backbone's reset which will empty the collection, or fill it with a new group.

      }
      
      /*
       * This holds the ordered datums of the current data list, and is the important place to keep the
       * datum, it's ids will be saved into the currentdatalist when the currentdatalist is saved
       */
      this.currentPaginatedDataListDatumsView = new PaginatedUpdatingCollectionView({
        collection           : new Datums(),
        childViewConstructor : DatumReadView,
        childViewTagName     : "li",
        childViewFormat      : "latex"
      });  
      
      /*
       * fill collection with datum, this will render them at the same time.
       */
      this.currentPaginatedDataListDatumsView.fillWithIds(this.model.get("currentDataList").get("datumIds"), Datum);
      
      
      if(this.currentEditDataListView){
        this.currentEditDataListView.destroy_view();
      }
      this.currentEditDataListView = new DataListEditView({
        model : this.model.get("currentDataList"),
      }); 
      this.currentEditDataListView.format = "leftSide";
      
      
      if(this.currentReadDataListView){
        this.currentReadDataListView.destroy_view();
      }
      this.currentReadDataListView = new DataListReadView({
        model :  this.model.get("currentDataList"),
      });  
      this.currentReadDataListView.format = "leftSide";
      
      
      if(typeof callback == "function"){
        callback();
      }
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
        window.app.saveAndInterConnectInApp();
      },
      "click .sync-everything" : "replicateDatabases",
      /*
       * These functions come from the top search template, it is
       * renderd by seacheditview whenever a search is renderd, but its
       * events cannot be handled there but are easily global events
       * that can be controlled by teh appview. which is also
       * responsible for many functions on the navbar
       */
      "click .btn-advanced-search" : function(e){
        window.app.router.showEmbeddedSearch();
      },
      "click .icon-search" : function(e){
        if(e){
          e.stopPropagation();
        }
        this.searchEditView.searchTop();
      },
      "keyup #search_box" : function(e) {
//        if(e){
//          e.stopPropagation();
//        }
        var code = e.keyCode || e.which;
        
        // code == 13 is the enter key
        if (code == 13) {
          this.searchEditView.searchTop();
        }
//        return false;
      }
    },
    
    /**
     * The Handlebars template rendered as the AppView.
     */
    template : Handlebars.templates.app,
    
    /**
     * Renders the AppView and all of its child Views.
     */
    render : function() {
      Utils.debug("APPVIEW render: " + this.el);
      if (this.model != undefined) {
        // Display the AppView
        this.setElement($("#app_view"));
        $(this.el).html(this.template(this.model.toJSON()));

        //The authView is the dropdown in the top right corner which holds all the user menus
        this.authView.render();
        this.userPreferenceView.render();
        this.hotkeyEditView.render();//.showModal();
        this.renderReadonlyUserViews();

        this.renderReadonlyDashboardViews();
        this.activityFeedView.render();
        this.insertUnicodesView.render();
        
        //This forces the top search to render.
        this.searchEditView.format = "centreWell";
        this.searchEditView.render();
        
        this.importView.render();
        this.exportView.render();
//        // Display the Corpus Views
//        this.corpusNewModalView.render();
//        this.currentCorpusEditView.render();
//        this.currentCorpusReadView.render();
//        this.currentCorpusEditView.render();
//        this.currentCorpusReadView.render();
//        this.publicCorpusReadEmbeddedView.render();
//        this.currentCorpusEditView.render();
//        this.currentCorpusReadView.render();
//        
//        // Display the ExportView
//        
//        // Display the User Views
//        this.fullScreenEditUserView.render();
//        this.publicReadUserView.render();
//        this.modalEditUserView.render();
//        this.modalReadUserView.render();
//        
//        // Display the Datum Container Views
//        this.renderReadonlyDatumsViews("centreWell");
//        this.renderEditableDatumsViews("centreWell");
//        
//        // Display the Search Views
//        this.searchTopView.render();
//        this.searchFullscreenView.render();
//        this.searchEmbeddedView.render();
//        
//        // Display the AuthView
//        
//        // Display the Session Views
//        this.currentSessionEditView.render();
//        this.currentSessionReadView.render();
//        this.currentSessionEditView.render();
//        this.currentSessionReadView.render();
//        this.currentSessionEditView.render();
//        this.currentSessionReadView.render();
//        this.sessionNewModalView.render();
//        
//        // Display the UserPreferenceEditView
//        
//        //Display ActivityFeedView
//        this.activityFeedView.render();
//        
//        this.insertUnicodesView.render();
//        
//        // Display HotKeysView
//
//        // Display Data List Views 
//        this.currentEditDataListView.render();
//        this.currentReadDataListView.render();
         
        // Display the ImportEditView
      } else {
        Alert("\tApp model is not defined, refresh your browser."+ Utils.contactUs);
      }
      
      this.setTotalPouchDocs();
      this.setTotalBackboneDocs();
      
      //localization
      $(this.el).find(".locale_Show_Dashboard").attr("title", chrome.i18n.getMessage("locale_Show_Dashboard"));
      $(this.el).find(".locale_Need_save").text(chrome.i18n.getMessage("locale_Need_save"));
      $(this.el).find(".locale_Recent_Changes").text(chrome.i18n.getMessage("locale_Recent_Changes"));
      $(this.el).find(".locale_Save_on_this_Computer").attr("title", chrome.i18n.getMessage("locale_Save_on_this_Computer"));
      $(this.el).find(".locale_Need_sync").text(chrome.i18n.getMessage("locale_Need_sync"));
      $(this.el).find(".locale_Differences_with_the_central_server").text(chrome.i18n.getMessage("locale_Differences_with_the_central_server"));
      $(this.el).find(".locale_Sync_and_Share").attr("title", chrome.i18n.getMessage("locale_Sync_and_Share"));
      $(this.el).find(".locale_View_Public_Profile_Tooltip").attr("title", chrome.i18n.getMessage("locale_View_Public_Profile_Tooltip"));
      $(this.el).find(".locale_Warning").text(chrome.i18n.getMessage("locale_Warning"));
      $(this.el).find(".locale_This_is_a_beta_version").html(chrome.i18n.getMessage("locale_This_is_a_beta_version"));
      $(this.el).find(".locale_to_beta_testers").html(chrome.i18n.getMessage("locale_to_beta_testers"));
      $(this.el).find(".locale_We_need_to_make_sure_its_you").html(chrome.i18n.getMessage("locale_We_need_to_make_sure_its_you"));
      $(this.el).find(".locale_Password").html(chrome.i18n.getMessage("locale_Password"));
      $(this.el).find(".locale_Yep_its_me").text(chrome.i18n.getMessage("locale_Yep_its_me"));
      
      return this;
    },
    /**
     * This should be the primary function to show the dashboard with updated views.
     */
    renderReadonlyDashboardViews : function() {
      this.renderReadonlyCorpusViews("leftSide");
      this.currentSessionReadView.render();
      this.renderReadonlyDataListViews("leftSide");
      this.renderEditableDatumsViews("centreWell");
    },
    
    // Display the Corpus Views
    renderEditableCorpusViews : function(format) {
      this.currentCorpusEditView.format = format;
      this.currentCorpusEditView.render();
    },
    renderReadonlyCorpusViews : function(format) {
      this.currentCorpusReadView.format = format;
      this.currentCorpusReadView.render();
    },
      
    // Display Session Views
    renderEditableSessionViews : function(format) {
      this.currentSessionEditView.format = format;
      this.currentSessionEditView.render();
    },
    renderReadonlySessionViews : function(format) {
      this.currentSessionReadView.format = format;
      this.currentSessionReadView.render();
    },
    
    // Display Datums View
    renderEditableDatumsViews : function(format) {
      this.datumsEditView.format = format;
      this.datumsEditView.render();
    },
    renderReadonlyDatumsViews : function(format) {
      this.datumsReadView.format = format;
      this.datumsReadView.render();
    },
    
    // Display DataList Views
    renderEditableDataListViews : function(format) {
      this.currentEditDataListView.format = format;
      this.currentEditDataListView.render();
    },
    renderReadonlyDataListViews : function(format) {
      this.currentReadDataListView.format = format;
      this.currentReadDataListView.render();
    },

   
    
    // Display User Views
    renderEditableUserViews : function(userid) {
      this.fullScreenEditUserView.render();
      this.modalEditUserView.render();
    },
    renderReadonlyUserViews : function(userid) {
      this.publicReadUserView.render();
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
      this.model.saveAndInterConnectInApp(function(){
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
      this.datumsEditView.saveScreen();
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
      if(!id){
        alert("This is a bug: something is trying ot save an undefined item.");
        return;
      }
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
      if(message.indexOf("Automatically saving visible datum entries every 10 seconds") != -1 ){
        this.toastSavingDatumsCount++;
        if(this.toastSavingDatumsCount == 5){
          message = message+"<p>&nbsp;</p><p>The app will continue to save your visible datum enties every 10 seconds, but it will no longer show these messages.</p>";
        }if(this.toastSavingDatumsCount > 5){
          return;
        }
      }
      if(message.indexOf("Sucessfully saved") != -1){
        return; //dont show the mesages like "Sucessfully saved ..."
      }
      if(!alertType){
        alertType = "";
      }
      if(!heading){
        heading = chrome.i18n.getMessage("locale_Warning");
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
