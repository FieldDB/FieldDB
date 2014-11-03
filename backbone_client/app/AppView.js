define([
    "backbone",
    "handlebars",
    "app/App",
    "app/AppRouter",
    "authentication/Authentication",
    "authentication/AuthenticationEditView",
    "comment/Comments",
    "corpus/Corpus",
    "corpus/CorpusMask",
    "corpus/CorpusEditView",
    "corpus/CorpusReadView",
    "corpus/CorpusLinkView",
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
    "app/UpdatingCollectionView",
    "terminal",
    "OPrime"
], function(
    Backbone,
    Handlebars,
    App,
    AppRouter,
    Authentication,
    AuthenticationEditView,
    Comments,
    Corpus,
    CorpusMask,
    CorpusEditView,
    CorpusReadView,
    CorpusLinkView,
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
    UpdatingCollectionView,
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
      if (OPrime.debugMode) OPrime.debug("APPVIEW init: " + this.el);

      this.format = "default";

      this.setUpAndAssociateViewsAndModelsWithCurrentUser();
      this.setUpAndAssociateViewsAndModelsWithCurrentSession();
      this.setUpAndAssociateViewsAndModelsWithCurrentDataList();
      this.setUpAndAssociateViewsAndModelsWithCurrentCorpus();

      // Create and initialize a Terminal
      this.term = new Terminal('terminal');

      // Initialize the file system of the terminal
      this.term.initFS(false, 1024 * 1024);

      window.saveApp = this.backUpUser;
      // Set up a timeout event every 10sec
//      _.bindAll(this, "saveScreen");
//      window.setInterval(this.saveScreen, 10000);
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

      this.setUpAndAssociatePublicViewsAndModelsWithCurrentCorpusMask( this.model.get("corpus").get("publicSelf") );

      //Only create a new corpusmodalview if it wasnt already created TODO this might have sideeffects
      if(! this.corpusNewModalView){
        if (OPrime.debugMode) OPrime.debug("Creating an empty new corpus for the new Corpus modal.");
        this.corpusNewModalView = new CorpusEditView({
          model : new Corpus({filledWithDefaults: true})
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
      datumsToBePassedAround.model = Datum; //TOOD workaround for model being missing
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
        if (OPrime.debugMode) OPrime.debug("Creating an empty new session for the new Session modal.");
        this.sessionNewModalView = new SessionEditView({
          model : new Session({
            comments : new Comments(),
            pouchname : window.app.get("corpus").get("pouchname"),
            sessionFields : window.app.get("currentSession").get("sessionFields").clone()
          })
        });
        this.sessionNewModalView.format = "modal";
      }
      if(typeof callback == "function"){
        callback();
      }
    },
    /*
     * This function assures that whatever views on the dashboard that are coming from the user, are reassociated. it is currently after the user is synced from the server.
     * (which happens when the user authenticates so that if they were logged into another computer the can get their updated preferences.
     */
    associateCurrentUsersInternalModelsWithTheirViews : function(callback){
      this.userPreferenceView.model = this.model.get("authentication").get("userPrivate").get("prefs");
      this.userPreferenceView.model.bind("change:skin", this.userPreferenceView.renderSkin, this.userPreferenceView);

      if(!this.model.get("authentication").get("userPrivate").get("prefs").get("unicodes")){
        this.model.get("authentication").get("userPrivate").get("prefs").set("unicodes", new InsertUnicodes());
        this.model.get("authentication").get("userPrivate").get("prefs").get("unicodes").fill();
      }
      this.insertUnicodesView.model = this.model.get("authentication").get("userPrivate").get("prefs").get("unicodes");
      this.insertUnicodesView.changeViewsOfInternalModels();
      this.insertUnicodesView.render();

      this.hotkeyEditView.model = this.model.get("authentication").get("userPrivate").get("hotkeys");
      //TODO the hotkeys are probably not associated but because they are not finished, they can't be checked yet

      this.modalEditUserView.changeViewsOfInternalModels();
      this.modalReadUserView.changeViewsOfInternalModels();
      this.modalReadUserView.render();

      this.publicEditUserView.changeViewsOfInternalModels();
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

      this.modalEditUserView = new UserEditView({
        model : this.model.get("authentication").get("userPrivate")
      });
      this.modalEditUserView.format = "modal";
      this.modalEditUserView.changeViewsOfInternalModels();

      this.modalReadUserView = new UserReadView({
        model : this.model.get("authentication").get("userPrivate")
      });
      this.modalReadUserView.format = "modal";
      this.modalReadUserView.changeViewsOfInternalModels();


      // Create a UserPreferenceEditView
      this.userPreferenceView = new UserPreferenceEditView({
        model : this.model.get("authentication").get("userPrivate").get("prefs")
      });

      if(!this.model.get("authentication").get("userPrivate").get("prefs").get("unicodes")){
        this.model.get("authentication").get("userPrivate").get("prefs").set("unicodes", new InsertUnicodes());
        this.model.get("authentication").get("userPrivate").get("prefs").get("unicodes").fill();
      }
      // Create an InsertUnicodesView
      this.insertUnicodesView = new InsertUnicodesView({
        model : this.model.get("authentication").get("userPrivate").get("prefs").get("unicodes")
      });
      this.insertUnicodesView.format = "minimized";

      // Create a HotKeyEditView
      this.hotkeyEditView = new HotKeyEditView({
        model : this.model.get("authentication").get("userPrivate").get("hotkeys")
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

      this.publicEditUserView = new UserEditView({
        model : model
      });
      this.publicEditUserView.format = "public";

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
        childViewFormat      : "latex",
        childViewClass       : "row span12"
      });


      this.corpusesReadView = new UpdatingCollectionView({
        collection : this.model.get("corpusesUserHasAccessTo"),
        childViewConstructor : CorpusLinkView,
        childViewTagName : 'li'
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
      this.currentEditDataListView.format = "minimized";


      if(this.currentReadDataListView){
        this.currentReadDataListView.destroy_view();
      }
      this.currentReadDataListView = new DataListReadView({
        model :  this.model.get("currentDataList"),
      });
      this.currentReadDataListView.format = "minimized";


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
        window.location.href = "#render/true";
      },
      "click .corpus-settings" : function() {
        window.appView.toastUser("Taking you to the corpus settings screen which is where all the corpus/database details can be found.","alert-info","How to find the corpus settings:");
        window.appView.currentCorpusReadView.format = "fullscreen";
        window.appView.currentCorpusReadView.render();
        app.router.showFullscreenCorpus();
      },
      "click .clear_all_notifications" :function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        $("#toast-user-area").find(".close").click();
      },
      "click .dont_close_notifications_dropdown_if_user_clicks" : function(e){
        if($(e.target).attr("data-toggle") == "modal"){
          //let it close the dropdown and open the modal
        }else{

          if(e){
            //dont close the dropdown
            e.stopPropagation();
            e.preventDefault();
          }
          if($(e.target).hasClass("close")){
            $(e.target).parent().alert("close");
          }
        }
      },
      "click .dont_close_corpus_dropdown_if_user_clicks" : function(e){
        var route = $(e.target).attr("href");
        if($(e.target).hasClass("btn")){
//          $(e.target).dropdown(); //This doesnt work
          $(e.target).parent().find(".dropdown-menu").show();
          if(e){
            //dont close the dropdown
            e.stopPropagation();
          }
        }else if(route){
          $(e.target).parent().parent().parent().find(".dropdown-menu").hide();
          if(route.indexOf("#") >=0 ){
            window.app.router.navigate(route,{trigger: true});
          } else {
            window.open(route, "_blank");
          }
        }else{
          if(e){
            //dont close the dropdown
            e.stopPropagation();
            e.preventDefault();
          }
          if($(e.target).hasClass("close")){
            $(e.target).parent().alert("close");
          }
        }
      },
      "click .save-dashboard": function(){
        window.app.saveAndInterConnectInApp();
      },
      "click .sync-everything" : "backUpUser",
      /*
       * These functions come from the top search template, it is
       * renderd by seacheditview whenever a search is renderd, but its
       * events cannot be handled there but are easily global events
       * that can be controlled by teh appview. which is also
       * responsible for many functions on the navbar
       */
      "click .trigger-advanced-search" : function(e){
        window.app.router.showEmbeddedSearch();
      },
      "click .trigger-quick-search" : function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        this.searchEditView.searchTop();
      },
      "keyup #quick-authenticate-password" : function(e) {
          var code = e.keyCode || e.which;
          // code == 13 is the enter key
          if ((code == 13) && ($("#quick-authenticate-password").val() != "")) {
            $("#quick-authentication-okay-btn").click();
          }
      },
      "keyup #search_box" : function(e) {
//        if(e){
//          e.stopPropagation();
//        }
        var code = e.keyCode || e.which;

        // code == 13 is the enter key
        if (code == 13) {
          if($("#search_box").val() == ""){
            this.searchEditView.userSetSearchToBlank = true;
          }else{
            this.searchEditView.userSetSearchToBlank = false;
          }
          this.searchEditView.searchTop();
        }
//        return false;
      },
      "click .sync-my-data" : function(e) {
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        var authUrl = $(".welcomeauthurl").val().trim();
        authUrl = OPrime.getAuthUrl(authUrl);
        this.authView.syncUser($(".welcomeusername").val().trim(),$(".welcomepassword").val().trim(), authUrl);
      },
      "keyup .welcomepassword" : function(e) {
        var code = e.keyCode || e.which;
        // code == 13 is the enter key
        if ((code == 13) && ($(".welcomepassword").val() != "")) {
          $(".sync-my-data").click();
        }
      }

    },

    /**
     * The Handlebars template rendered as the AppView.
     */
    template : Handlebars.templates.app_all_the_data,
    layoutJustEntering : Handlebars.templates.app_just_entering,
    layoutAllTheData : Handlebars.templates.app_all_the_data,
    layoutWhatsHappening : Handlebars.templates.app_whats_happening,
    layoutCompareDataLists : Handlebars.templates.app_compare_datalists,
    layoutEverythingAtOnce : Handlebars.templates.app_everything_at_once,

    /**
     * Renders the AppView and all of its child Views.
     */
    render : function() {
      if (OPrime.debugMode) OPrime.debug("APPVIEW render: " + this.el);

      if (this.model == undefined) {
        alert("\tApp model is not defined, this is a very big bug. Refresh your browser, and let us know about this "+ OPrime.contactUs);

        return this;
      }

      var jsonToRender = this.model.toJSON();
      jsonToRender.locale_Corpora = Locale.get("locale_Corpora");
      jsonToRender.locale_Differences_with_the_central_server = Locale.get("locale_Differences_with_the_central_server");
      jsonToRender.locale_Instructions_to_show_on_dashboard = Locale.get("locale_Instructions_to_show_on_dashboard"); // Do we still use this instruction?
      jsonToRender.locale_Log_In = Locale.get("locale_Log_In");
      jsonToRender.locale_Need_save = Locale.get("locale_Need_save");
      jsonToRender.locale_Need_sync = Locale.get("locale_Need_sync");
      jsonToRender.locale_Password = Locale.get("locale_Password");
      jsonToRender.locale_Recent_Changes = Locale.get("locale_Recent_Changes");
      jsonToRender.locale_Save_on_this_Computer = Locale.get("locale_Save_on_this_Computer");
      jsonToRender.locale_Show_Dashboard = Locale.get("locale_Show_Dashboard");
      jsonToRender.locale_Sync_and_Share = Locale.get("locale_Sync_and_Share");
      jsonToRender.locale_Username = Locale.get("locale_Username");
      jsonToRender.locale_View_Public_Profile_Tooltip = Locale.get("locale_View_Public_Profile_Tooltip");
      jsonToRender.locale_We_need_to_make_sure_its_you = Locale.get("locale_We_need_to_make_sure_its_you");
      jsonToRender.locale_Yep_its_me = Locale.get("locale_Yep_its_me");
      jsonToRender.locale_to_beta_testers = Locale.get("locale_to_beta_testers"); // Do we still use this?


      if (OPrime.debugMode) OPrime.debug("Destroying the appview, so we dont get double events. This is risky...");
      this.currentCorpusEditView.destroy_view();
      this.currentCorpusReadView.destroy_view();
      this.currentSessionEditView.destroy_view();
      this.currentSessionReadView.destroy_view();
//        this.datumsEditView.destroy_view();
//        this.datumsReadView.destroy_view();//TODO add all the other child views eventually once they know how to destroy_view
      this.currentEditDataListView.destroy_view();
      this.currentReadDataListView.destroy_view();
      this.currentPaginatedDataListDatumsView.destroy_view();

      this.importView.destroy_view();
      this.searchEditView.destroy_view();


      this.destroy_view();
      if (OPrime.debugMode) OPrime.debug("Done Destroying the appview, so we dont get double events.");

      // Display the AppView
      this.setElement($("#app_view"));

      jsonToRender.theme = "";
      var makeActivityFeedTransparent = app.get("authentication").get("userPrivate").get("prefs").get("transparentDashboard");
      if(makeActivityFeedTransparent != "false"){
        jsonToRender.theme = "_transparent";
      }
      /*
       * show the corpus title, and the current sessions goal so the
       * user knows which corpus and elicitation they are entering
       * data in
       */
      jsonToRender.corpustitle = this.model.get("corpus").get("title");
      if(jsonToRender.corpustitle.length > 20){
        jsonToRender.corpustitle = jsonToRender.corpustitle.substr(0,19) + "...";
      }
      jsonToRender.elicitationgoal = this.model.get("currentSession").getGoal();
      if(jsonToRender.elicitationgoal.length > 20){
        jsonToRender.elicitationgoal = jsonToRender.elicitationgoal.substr(0,19) + "...";
      }
      try{
        jsonToRender.username = this.model.get("authentication").get("userPrivate").get("username");
        jsonToRender.pouchname = this.model.get("couchConnection").pouchname;
      }catch(e){
        if (OPrime.debugMode) OPrime.debug("Problem setting the username or pouchname of the app.");
      }

      /* Render the users prefered dashboard layout */
      this.format = this.model.get("authentication").get("userPrivate").get("prefs").get("preferedDashboardLayout") || "default";
      var username = "";
      try{
        username = window.app.get("authentication").get("userPrivate").get("username") || "";
      }catch(e){
        //do nothing
      }
      if(username == "public"){
        this.format = "layoutEverythingAtOnce"
      }
      if(this.format == "default"){
        $(this.el).html(this.template(jsonToRender));
      }else if(this.format == "layoutJustEntering"){
        $(this.el).html(this.layoutJustEntering(jsonToRender));
      }else if(this.format == "layoutAllTheData"){
        $(this.el).html(this.layoutAllTheData(jsonToRender));
      }else if(this.format == "layoutWhatsHappening"){
        $(this.el).html(this.layoutWhatsHappening(jsonToRender));
      }else if(this.format == "layoutCompareDataLists"){
        $(this.el).html(this.layoutCompareDataLists(jsonToRender));
      }else if(this.format == "layoutEverythingAtOnce"){
        $(this.el).html(this.layoutEverythingAtOnce(jsonToRender));
      }
      if (OPrime.debugMode) OPrime.debug("APPVIEW render: " + this.format);

      //The authView is the dropdown in the top right corner which holds all the user menus
      this.authView.render();
      this.userPreferenceView.render();
      this.hotkeyEditView.render();//.showModal();
      this.renderReadonlyUserViews();

      this.renderReadonlyDashboardViews();
      this.insertUnicodesView.render();

      //This forces the top search to render.
      this.searchEditView.format = "centreWell";
      this.searchEditView.render();

      this.corpusesReadView.el = $(this.el).find('.corpuses');
      this.corpusesReadView.render();
      if(this.model.get("corpusesUserHasAccessTo").length > 20 ){
        $(this.el).find('.corpuses').addClass("scrollable");
      }

      //put the version into the terminal, and into the user menu
      OPrime.getVersion(function (ver) {
        app.set("version", ver);
        window.appView.term.VERSION_ = ver;
        $(".fielddb-version").html(ver);
      });
      this.exportView.render();

      this.setTotalPouchDocs();
      this.setTotalBackboneDocs();

      return this;
    },
    /**
     * This should be the primary function to show the dashboard with updated views.
     */
    renderReadonlyDashboardViews : function() {
      this.renderReadonlyCorpusViews("leftSide");
      this.renderReadonlySessionViews("leftSide");
      this.renderReadonlyDataListViews("minimized");
      this.renderEditableDatumsViews("centreWell");
      this.datumsEditView.showMostRecentDatum();
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
      this.publicEditUserView.render();
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
    backUpUser : function(callback) {
      this.model.backUpUser(callback);
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
      if (OPrime.debugMode) OPrime.debug("Recieved a drop unicode event ");
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
          $(e.target).blur()
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

      $(this).addClass('over');
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
      $('#toast-user-area').prepend("<div class='alert "+alertType+" alert-block fade in'>"
          +"<a class='close' data-dismiss='alert' href='#'>x</a>"
          +"<strong class='alert-heading'>"+heading+"</strong> "
          + message
        +"</div>");

      /* Open the notificaitons area so they can see it */
      $("#notification_dropdown_trigger").dropdown("toggle");
      /* Close it 5 seconds later, if short text, 30 seconds if long text */
      var numberOfMiliSecondsToWait = 5000;
      if(message.length > 500){
        numberOfMiliSecondsToWait = 30000;
      }
      window.setTimeout(function(){
        $("#notification_dropdown_trigger").dropdown("toggle");
      }, numberOfMiliSecondsToWait);

    },
    /**
     *
     * http://stackoverflow.com/questions/6569704/destroy-or-remove-a-view-in-backbone-js
     */
    destroy_view: function() {
      if (OPrime.debugMode) OPrime.debug("DESTROYING APP VIEW ");

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
