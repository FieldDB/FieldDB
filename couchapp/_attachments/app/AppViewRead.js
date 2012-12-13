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
    "corpus/CorpusReadView",
    "corpus/CorpusLinkView",
    "data_list/DataList",
    "data_list/DataListReadView",
    "datum/Datum",
    "datum/Datums",
    "datum/DatumContainerReadView",
    "datum/DatumReadView",
    "datum/DatumFields", 
    "export/Export",
    "export/ExportReadView",
    "insert_unicode/InsertUnicode",
    "insert_unicode/InsertUnicodes",
    "insert_unicode/InsertUnicodesView",
    "user/UserPreference",
    "user/UserPreferenceEditView",
    "app/PaginatedUpdatingCollectionView",
    "search/Search",
    "search/SearchEditView",
    "datum/Session",
    "datum/SessionReadView",
    "user/User",
    "user/UserReadView",
    "terminal",
    "libs/OPrime"
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
    CorpusReadView,
    CorpusLinkView,
    DataList,
    DataListReadView,
    Datum,
    Datums,
    DatumContainerReadView,
    DatumReadView,
    DatumFields,
    Export,
    ExportReadView,
    InsertUnicode,
    InsertUnicodes,
    InsertUnicodesView,
    UserPreference,
    UserPreferenceEditView,
    PaginatedUpdatingCollectionView,
    Search,
    SearchEditView,
    Session,
    SessionReadView,
    User,
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
      OPrime.debug("APPVIEW init: " + this.el);

      this.setUpAndAssociateViewsAndModelsWithCurrentUser();
      this.setUpAndAssociateViewsAndModelsWithCurrentSession();
      this.setUpAndAssociateViewsAndModelsWithCurrentDataList();
      this.setUpAndAssociateViewsAndModelsWithCurrentCorpus();

      // Create and initialize a Terminal
      this.term = new Terminal('terminal');
      
      // Initialize the file system of the terminal
      this.term.initFS(false, 1024 * 1024);
      
    },
    setUpAndAssociateViewsAndModelsWithCurrentCorpus : function(callback){
     
      if(this.currentCorpusReadView){
        this.currentCorpusReadView.destroy_view();
      }
      this.currentCorpusReadView = new CorpusReadView({
        model : this.model.get("corpus")
      });
      this.currentCorpusReadView.format = "leftSide";
      
      this.setUpAndAssociatePublicViewsAndModelsWithCurrentCorpusMask( new CorpusMask(this.model.get("corpus").get("publicSelf")) );

      // Create the corpus team activity view
      OPrime.debug("Setting up the team activity feed.");
      if(!this.model.get("currentCorpusTeamActivityFeed")){
        this.model.set("currentCorpusTeamActivityFeed", new ActivityFeed());//TODO not setting the Activities, not setting the Activities, means that it will be empty. ideally this shoudl be a new collection, fetched from the corpus team server via ajax
      }
      try{
        //If the activity feed's pouch is not the same as this corpus, create a new activity feed, and set it up with this corpus' activity feed
        if(this.model.get("currentCorpusTeamActivityFeed").get("couchConnection").pouchname.indexOf(this.model.get("corpus").get("couchConnection").pouchname == -1)){
          this.model.set("currentCorpusTeamActivityFeed", new ActivityFeed()); //TODO not setting the Activities, means that it will be empty. ideally this shoudl be a new collection, fetched from the corpus team server via ajax
          
          var activityCouchConnection = JSON.parse(JSON.stringify(this.model.get("corpus").get("couchConnection")));
          activityCouchConnection.pouchname =  this.model.get("corpus").get("couchConnection").pouchname+"-activity_feed";
          this.model.get("currentCorpusTeamActivityFeed").changePouch(activityCouchConnection);
        }
      }catch(e){
//        alert("something wasnt set in the currentCorpusTeamActivityFeed or corpus, so cant make sure that their pouches are connected. overwriting the currentCorpusTeamActivityFeed's pouch to be sure it is conencted to the corpus");
        OPrime.debug("something wasnt set in the currentCorpusTeamActivityFeed or corpus, so cant make sure that their pouches are connected. overwriting the currentCorpusTeamActivityFeed's pouch to be sure it is conencted to the corpus",e);
        this.model.set("currentCorpusTeamActivityFeed", new ActivityFeed()); //TODO not setting the Activities, not setting the Activities, means that it will be empty. ideally this shoudl be a new collection, fetched from the corpus team server via ajax
        
        var activityCouchConnection = JSON.parse(JSON.stringify(this.model.get("corpus").get("couchConnection")));
        activityCouchConnection.pouchname =  this.model.get("corpus").get("couchConnection").pouchname+"-activity_feed";
        this.model.get("currentCorpusTeamActivityFeed").changePouch(activityCouchConnection);
      }
      if(this.activityFeedCorpusTeamView){
        this.activityFeedCorpusTeamView.destroy_view();
      }
      this.activityFeedCorpusTeamView = new ActivityFeedView({
        model : this.model.get("currentCorpusTeamActivityFeed")
      }); 
      this.activityFeedCorpusTeamView.format = "rightSideCorpusTeam";
      
      
      
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
      this.datumsReadView = new DatumContainerReadView({
        model : datumsToBePassedAround
      });
      
      if(typeof callback == "function"){
        callback();
      }
    },
    setUpAndAssociatePublicViewsAndModelsWithCurrentCorpusMask : function(model, callback){
      this.publicCorpusReadEmbeddedView = new CorpusLinkView({
        model : model
      });
//      this.publicCorpusReadEmbeddedView.format = "public";
    },
    setUpAndAssociateViewsAndModelsWithCurrentSession : function(callback){
      /*
       * Set up three session views
       */ 
      if(this.currentSessionReadView){
        this.currentSessionReadView.destroy_view();
      }
      this.currentSessionReadView = new SessionReadView({
        model : this.model.get("currentSession")
      });
      this.currentSessionReadView.format = "leftSide";
      
      if(typeof callback == "function"){
        callback();
      }
    },
    /*
     * This function assures that whatever views on the dashboard that are coming from the user, are reassociated. it is currently after the user is synced from the server. 
     * (which happens when the user authenticates so that if they were logged into another computer the can get their updated preferences.
     */
    associateCurrentUsersInternalModelsWithTheirViews : function(callback){
      this.userPreferenceView.model = this.authView.model.get("userPrivate").get("prefs");
      this.userPreferenceView.model.bind("change:skin", this.userPreferenceView.renderSkin, this.userPreferenceView);
      
      this.insertUnicodesView.model = this.authView.model.get("userPrivate").get("prefs").get("unicodes");
      this.insertUnicodesView.changeViewsOfInternalModels();
      this.insertUnicodesView.render();
      
      //TODO the hotkeys are probably not associated but because they are not finished, they can't be checked yet
      
      this.modalReadUserView.changeViewsOfInternalModels();
      this.modalReadUserView.render();
      
      this.publicReadUserView.changeViewsOfInternalModels();
      this.publicReadUserView.render();
      
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
       * Set up the four user views
       */
      this.setUpAndAssociatePublicViewsAndModelsWithCurrentUserMask(this.model.get("authentication").get("userPublic") );
      
      
      this.modalReadUserView = new UserReadView({
        model : this.model.get("authentication").get("userPrivate")
      });
      this.modalReadUserView.format = "modal";
      this.modalReadUserView.changeViewsOfInternalModels();
      

      // Create a UserPreferenceEditView
      this.userPreferenceView = new UserPreferenceEditView({
        model : this.authView.model.get("userPrivate").get("prefs")
      });
      
      // Create a UserActivityView 
      OPrime.debug("Setting up the user activity feed.");
      if(!this.model.get("currentUserActivityFeed")){
        this.model.set("currentUserActivityFeed", new ActivityFeed());
        this.model.get("currentUserActivityFeed").changePouch(window.app.get("authentication").get("userPrivate").get("activityCouchConnection"));
      }
      if(this.activityFeedUserView){
        this.activityFeedUserView.destroy_view(); 
      }
      this.activityFeedUserView = new ActivityFeedView({
        model : this.model.get("currentUserActivityFeed")
      }); 
      this.activityFeedUserView.format = "rightSideUser";
      
      
      // Create an InsertUnicodesView
      this.insertUnicodesView = new InsertUnicodesView({
        model : this.authView.model.get("userPrivate").get("prefs").get("unicodes")
      });
      this.insertUnicodesView.format = "rightSide"; 

      
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
        this.currentPaginatedDataListDatumsView.remove();//this seems okay, its not removing the ul we need for the next render
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
        childViewFormat      : "latex",
        childViewClass       : "row span12"
      });  
      
      /*
       * fill collection with datum, this will render them at the same time.
       */
      this.currentPaginatedDataListDatumsView.fillWithIds(this.model.get("currentDataList").get("datumIds"), Datum);
      
      
      
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
      "click #quick-authentication-okay-btn" : function(e){
        window.hub.publish("quickAuthenticationClose","no message");
      },
      "click .icon-home" : function(e) {
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
//        this.model.router.showDashboard();
        window.location.href = "#render/true";
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
          e.preventDefault();
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
      OPrime.debug("APPVIEW render: " + this.el);
      if (this.model != undefined) {
        
        OPrime.debug("Destroying the appview, so we dont get double events. This is risky...");
        this.currentCorpusReadView.destroy_view();
        this.currentSessionReadView.destroy_view();
        this.currentReadDataListView.destroy_view();
        this.currentPaginatedDataListDatumsView.destroy_view();
        
        this.searchEditView.destroy_view();
        
        this.activityFeedUserView.destroy_view();
        this.activityFeedCorpusTeamView.destroy_view();
        
        this.destroy_view();
        OPrime.debug("Done Destroying the appview, so we dont get double events.");

        // Display the AppView
        this.setElement($("#app_view"));
        $(this.el).html(this.template(this.model.toJSON()));

        //The authView is the dropdown in the top right corner which holds all the user menus
//        this.authView.render();
//        this.userPreferenceView.render();
//        this.hotkeyEditView.render();//.showModal();
//        this.renderReadonlyUserViews();

        this.renderReadonlyDashboardViews();
        this.activityFeedUserView.render();
        this.activityFeedCorpusTeamView.render();
        this.insertUnicodesView.render();
        
        //This forces the top search to render.
        this.searchEditView.format = "centreWell";
        this.searchEditView.render();
        
        //put the version into the terminal, and into the user menu
        OPrime.getVersion(function (ver) { 
          window.appView.term.VERSION_ = ver;
          $(".fielddb-version").html(ver);
        });
//        this.importView.render(); //render at last minute using router
        this.exportView.render();//render at last minute using router
        
        
         
      } else {
        alert("\tApp model is not defined, this is a very big bug. Refresh your browser, and let us know about this "+ OPrime.contactUs);
      }
      
      this.setTotalPouchDocs();
      this.setTotalBackboneDocs();
      
      //localization
      $(this.el).find(".locale_Show_Dashboard").attr("title", Locale.get("locale_Show_Dashboard"));
      $(this.el).find(".locale_Need_save").text(Locale.get("locale_Need_save"));
      $(this.el).find(".locale_Recent_Changes").text(Locale.get("locale_Recent_Changes"));
      $(this.el).find(".locale_Save_on_this_Computer").attr("title", Locale.get("locale_Save_on_this_Computer"));
      $(this.el).find(".locale_Need_sync").text(Locale.get("locale_Need_sync"));
      $(this.el).find(".locale_Differences_with_the_central_server").text(Locale.get("locale_Differences_with_the_central_server"));
      $(this.el).find(".locale_Sync_and_Share").attr("title", Locale.get("locale_Sync_and_Share"));
      $(this.el).find(".locale_View_Public_Profile_Tooltip").attr("title", Locale.get("locale_View_Public_Profile_Tooltip"));
//      $(this.el).find(".locale_Warning").text(Locale.get("locale_Warning"));
      $(this.el).find(".locale_Instructions_to_show_on_dashboard").html(Locale.get("locale_Instructions_to_show_on_dashboard"));
      $(this.el).find(".locale_to_beta_testers").html(Locale.get("locale_to_beta_testers"));
      $(this.el).find(".locale_We_need_to_make_sure_its_you").html(Locale.get("locale_We_need_to_make_sure_its_you"));
      $(this.el).find(".locale_Password").html(Locale.get("locale_Password"));
      $(this.el).find(".locale_Yep_its_me").text(Locale.get("locale_Yep_its_me"));
      
      $(this.el).find(".locale_User_Settings").html(Locale.get("locale_User_Settings"));
      $(this.el).find(".locale_Keyboard_Shortcuts").html(Locale.get("locale_Keyboard_Shortcuts"));
      $(this.el).find(".locale_Corpus_Settings").html(Locale.get("locale_Corpus_Settings"));
      $(this.el).find(".locale_Terminal_Power_Users").html(Locale.get("locale_Terminal_Power_Users"));
      
      return this;
    },
    /**
     * This should be the primary function to show the dashboard with updated views.
     */
    renderReadonlyDashboardViews : function() {
      this.renderReadonlyCorpusViews("leftSide");
      this.renderReadonlySessionViews("leftSide");
      this.renderReadonlyDataListViews("leftSide");
      this.renderEditableDatumsViews("centreWell");
    },
    
    // Display the Corpus Views
    renderEditableCorpusViews : function(format) {
    },
    renderReadonlyCorpusViews : function(format) {
      this.currentCorpusReadView.format = format;
      this.currentCorpusReadView.render();
    },
      
    // Display Session Views
    renderEditableSessionViews : function(format) {
    },
    renderReadonlySessionViews : function(format) {
      this.currentSessionReadView.format = format;
      this.currentSessionReadView.render();
    },
    
    // Display Datums View
    renderEditableDatumsViews : function(format) {
    },
    renderReadonlyDatumsViews : function(format) {
      this.datumsReadView.format = format;
      this.datumsReadView.render();
    },
    
    // Display DataList Views
    renderEditableDataListViews : function(format) {
    },
    renderReadonlyDataListViews : function(format) {
      this.currentReadDataListView.format = format;
      this.currentReadDataListView.render();
    },

   
    
    // Display User Views
    renderEditableUserViews : function(userid) {
    },
    renderReadonlyUserViews : function(userid) {
      this.publicReadUserView.render();
      this.modalReadUserView.render();
    },
    renderActivityFeedViews : function() {
      this.activityFeedUserView.render();
      this.activityFeedCorpusTeamView.render();
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
          if(self.model.get("authentication").get("userPrivate").get("corpuses").pouchname != "default" 
            && app.get("corpus").get("couchConnection").pouchname == "default"){
            corpusConnection = self.model.get("authentication").get("userPrivate").get("corpuses")[0];
          }
          self.model.get("corpus").replicateFromCorpus(corpusConnection, callback);
        });
      });
    },
    
    /**
     * http://www.html5rocks.com/en/tutorials/dnd/basics/
     * 
     * @param e event
     */
    dragUnicodeToField : function(e) {
      OPrime.debug("Recieved a drop unicode event ");
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
          $(this).removeClass("over");
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
      this.className = 'over';
      e.dataTransfer.dropEffect = 'copy';  // See the section on the DataTransfer object.
      
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
//        this.toastSavingDatumsCount++;
//        if(this.toastSavingDatumsCount == 5){
//          message = message+"<p>&nbsp;</p><p>The app will continue to save your visible datum enties every 10 seconds, but it will no longer show these messages.</p>";
//        }if(this.toastSavingDatumsCount > 5){
//          return;
//        }
        //dont show these messages anymore, the app is stable and we have timestamps
        return;
      }
      if(message.indexOf("Sucessfully saved") != -1){
        return; //dont show the mesages like "Sucessfully saved ..."
      }
      if(!alertType){
        alertType = "";
      }
      if(!heading){
        heading = Locale.get("locale_Warning");
      }
      $('#toast-user-area').append("<div class='alert "+alertType+" alert-block'>"
          +"<a class='close' data-dismiss='alert' href='#'>×</a>"
          +"<strong class='alert-heading'>"+heading+"</strong> "
          + message
        +"</div>");
    },
    /**
     * 
     * http://stackoverflow.com/questions/6569704/destroy-or-remove-a-view-in-backbone-js
     */
    destroy_view: function() {
      OPrime.debug("DESTROYING APP VIEW ");
      
      //COMPLETELY UNBIND THE VIEW
      this.undelegateEvents();

      $(this.el).removeData().unbind(); 

      //Remove view from DOM
//    this.remove();  
//    Backbone.View.prototype.remove.call(this);
    }
    
  });

  return AppView;
});
