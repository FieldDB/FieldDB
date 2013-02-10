define([ 
    "backbone", 
    "handlebars",
    "corpus/Corpus",
    "comment/Comment",
    "comment/Comments",
    "comment/CommentReadView",
    "data_list/DataList",
    "data_list/DataLists",
    "data_list/DataListReadView",
    "datum/DatumField",
    "datum/DatumFields",
    "datum/DatumFieldEditView",
    "datum/DatumState",
    "datum/DatumStates",
    "datum/DatumStateEditView",
    "permission/Permission",
    "permission/Permissions",
    "permission/PermissionEditView",
    "datum/Session",
    "datum/Sessions",
    "datum/SessionReadView",
    "app/UpdatingCollectionView",
    "libs/OPrime"
], function(
    Backbone, 
    Handlebars,
    Corpus,
    Comment,
    Comments,
    CommentReadView,
    DataList,
    DataLists,
    DataListReadView,
    DatumField,
    DatumFields,
    DatumFieldEditView,
    DatumState,
    DatumStates,
    DatumStateEditView,
    Permission,
    Permissions,
    PermissionEditView,
    Session,
    Sessions,
    SessionReadView,
    UpdatingCollectionView
) {
  var CorpusEditView = Backbone.View.extend(
  /** @lends CorpusReadFullScreenView.prototype */
  {
    /**
     * @class This is the corpus view. To the user it looks like a
     *        Navigation panel on the main dashboard screen, which
     *        displays a menu of things the User can do (ex. open a new
     *        session, browse all entries, etc.).
     * 
     * @property {String} format Must be set when the CorpusEditView is
     * initialized. Valid values are "centreWell" and
     * "fullscreen" and "leftSide" and "modal"
     * 
     * @description Starts the Corpus and initializes all its children.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      if (OPrime.debugMode) OPrime.debug("CORPUS EDIT init: " );
      this.changeViewsOfInternalModels();
     
      // If the model's title changes, chances are its a new corpus, re-render its internal models.
      this.model.bind('change:pouchname', function(){
        this.changeViewsOfInternalModels();
        this.render();
      }, this);
      
      //TODO test this
//      this.model.bind('error', function(e){
//        window.appView.toastUser(e); //The e is the model itself, not sure how to get the erros out. At the moment they are only produced by validating public vs  private
//
//      });
      //TOOD if the sessions and data lists arent up-to-date, turn these on
//      this.model.bind('change:sessions', function(){
//        if (OPrime.debugMode) OPrime.debug("Corpus edit view sessions changed. changeViewsOfInternalModels and rendering...");
//        this.changeViewsOfInternalModels();
//        this.render();
//      }, this);
//      this.model.bind('change:dataLists', function(){
//        this.render();
//      }, this);
    },

    /**
     * The underlying model of the CorpusReadFullScreenView is a Corpus.
     */    
    model : Corpus,
   
    /**
     * Events that the CorpusReadFullScreenView is listening to and their handlers.
     */
    events : {
      "click .icon-book": "showReadonly",
      //Add button inserts new Comment
      "click .add-comment-corpus" : function(e) {
          if(e){
            e.stopPropagation();
            e.preventDefault();
          }
          var commentstring = this.$el.find(".comment-new-text").val();
          
          this.model.insertNewComment(commentstring);
          this.$el.find(".comment-new-text").val("");
          
      },
      "click .reload-corpus-team-permissions" :function(e){
        if(e){
          e.preventDefault();
        }
        var corpusviewself = this;
        this.model.loadPermissions(function(){
          corpusviewself.permissionsView = new UpdatingCollectionView({
            collection : corpusviewself.model.permissions,
            childViewConstructor : PermissionEditView,
            childViewTagName     : 'li',
            childViewClass       : "breadcrumb row span12"
          });
          
          corpusviewself.permissionsView.el = corpusviewself.$('.permissions-updating-collection');
          corpusviewself.permissionsView.render();
        });
        

      },
      
      //Add button inserts new Datum State
      "click .add-datum-state" : 'insertNewDatumState',
      
      //Add button inserts new Datum Field
      "click .add-datum-field" : 'insertNewDatumField',
      "click .icon-resize-small" : 'resizeSmall',
      "click .resize-full" : "resizeFullscreen",
      
      //Add button inserts new Conversation Field
      "click .add-conversation-field" : 'insertNewConversationDatumField',
      
      //corpus menu buttons
      "click .new-datum" : "newDatum",
      "click .new-data-list" : "newDataList",
      "click .new-session" : "newSession",
      "click .new-corpus" : "newCorpus",

      //text areas in the edit view
      "blur .corpus-title-input" : "updateTitle",
      "blur .corpus-description-input" : "updateDescription",
      "blur .public-or-private" : "updatePublicOrPrivate",
      "click .save-corpus" : "updatePouch",
      
    },

    /**
     * The Handlebars template rendered as the CorpusFullscreenView.
     */
    templateFullscreen : Handlebars.templates.corpus_edit_embedded,
    
    /**
     * The Handlebars template rendered as the CorpusWellView.
     */
    templateCentreWell : Handlebars.templates.corpus_edit_embedded,
    
    /**
     * The Handlebars template rendered as the Summary
     */
    templateSummary : Handlebars.templates.corpus_summary_edit_embedded,
       
    templateNewCorpus : Handlebars.templates.corpus_edit_new_modal,
    /**
     * Renders the CorpusReadFullScreenView and all of its child Views.
     */
    render : function() {
      if (this.model == undefined) {
        if (OPrime.debugMode) OPrime.debug("\tCorpus model was undefined.");
        return this;
      }

      // Build the lexicon
      this.model.buildLexiconFromTeamServer(this.model.get("pouchname"));
      
      if (OPrime.debugMode) OPrime.debug("CORPUS EDIT render: ");
      if( this.format != "modal"){
        window.appView.currentCorpusEditView.destroy_view();
        window.appView.currentCorpusReadView.destroy_view();
      }
      var couchurl = OPrime.getCouchUrl(this.model.get("couchConnection"));
      
      var jsonToRender = this.model.toJSON();
      jsonToRender.exportAllDatumURL = couchurl + "/_design/pages/_view/datums";
      try{
        jsonToRender.username = this.model.get("team").get("username");
      }catch(e){
        if (OPrime.debugMode) OPrime.debug("Problem getting the usrname of the corpus' team");
      }
      if (this.format == "centreWell") {
        if (OPrime.debugMode) OPrime.debug("CORPUS Edit center render: " );
          // Display the CorpusReadFullScreenView
          this.setElement($("#corpus-embedded"));
          $(this.el).html(this.templateCentreWell(jsonToRender));

          // Display the CommentReadView
          this.commentReadView.el = this.$('.comments');
          this.commentReadView.render();
          
          // Display the DataListsView
         this.dataListsView.el = this.$('.datalists-updating-collection'); 
         this.dataListsView.render();
          
         // Display the SessionsView
         this.sessionsView.el = this.$('.sessions-updating-collection'); 
         this.sessionsView.render();
         
         // Display the PermissionsView
//         this.permissionsView.el = this.$('.permissions-updating-collection');
//         this.permissionsView.render();
         
          // Display the DatumFieldsView
          this.datumFieldsView.el = this.$('.datum_field_settings');
          this.datumFieldsView.render();

          // Display the ConversationFieldsView
          this.conversationFieldsView.el = this.$('.conversation_field_settings');
          this.conversationFieldsView.render();
          
          // Display the DatumStatesView
          this.datumStatesView.el = this.$('.datum_state_settings');
          this.datumStatesView.render();
          
        //Localize for all embedded view
          $(this.el).find(".locale_Show_in_Dashboard").attr("title", Locale.get("locale_Show_in_Dashboard"));
          $(this.el).find(".locale_Sessions_associated").html(Locale.get("locale_Sessions_associated"));
          $(this.el).find(".locale_elicitation_sessions_explanation").html(Locale.get("locale_elicitation_sessions_explanation"));
          $(this.el).find(".locale_Datalists_associated").html(Locale.get("locale_Datalists_associated"));
          $(this.el).find(".locale_datalists_explanation").html(Locale.get("locale_datalists_explanation"));
          $(this.el).find(".locale_Permissions_associated").html(Locale.get("locale_Permissions_associated"));
          $(this.el).find(".locale_permissions_explanation").html(Locale.get("locale_permissions_explanation"));
          $(this.el).find(".locale_Datum_field_settings").html(Locale.get("locale_Datum_field_settings"));
          $(this.el).find(".locale_datum_fields_explanation").html(Locale.get("locale_datum_fields_explanation"));
          $(this.el).find(".locale_Conversation_field_settings").html(Locale.get("locale_Conversation_field_settings"));
          $(this.el).find(".locale_conversation_fields_explanation").html(Locale.get("locale_conversation_fields_explanation"));
          $(this.el).find(".locale_Datum_state_settings").html(Locale.get("locale_Datum_state_settings"));
          $(this.el).find(".locale_datum_states_explanation").html(Locale.get("locale_datum_states_explanation"));
          $(this.el).find(".locale_Add").html(Locale.get("locale_Add"));

          
          
          //Localize for only Edit view.
          $(this.el).find(".locale_Public_or_Private").html(Locale.get("locale_Public_or_Private"));
          $(this.el).find(".locale_Encrypt_if_confidential").html(Locale.get("locale_Encrypt_if_confidential"));
          $(this.el).find(".locale_Help_Text").html(Locale.get("locale_Help_Text"));
          $(this.el).find(".locale_Add_New_Datum_Field_Tooltip").attr("title", Locale.get("locale_Add_New_Datum_Field_Tooltip"));
          $(this.el).find(".locale_Add_New_Conversation_Field_Tooltip").attr("title", Locale.get("locale_Add_New_Conversation_Field_Tooltip"));
          $(this.el).find(".locale_Add_Placeholder").attr("placeholder", Locale.get("locale_Add_Placeholder"));
          $(this.el).find(".locale_Green").html(Locale.get("locale_Green"));
          $(this.el).find(".locale_Orange").html(Locale.get("locale_Orange"));
          $(this.el).find(".locale_Red").html(Locale.get("locale_Red"));
          $(this.el).find(".locale_Blue").html(Locale.get("locale_Blue"));
          $(this.el).find(".locale_Teal").html(Locale.get("locale_Teal"));
          $(this.el).find(".locale_Black").html(Locale.get("locale_Black"));
          $(this.el).find(".locale_Default").html(Locale.get("locale_Default"));
          $(this.el).find(".locale_Add_New_Datum_State_Tooltip").attr("title", Locale.get("locale_Add_New_Datum_State_Tooltip"));
          $(this.el).find(".locale_Save").html(Locale.get("locale_Save"));

      } else if (this.format == "fullscreen") {
        if (OPrime.debugMode) OPrime.debug("CORPUS EDIT FULLSCREEN render: " );

        this.setElement($("#corpus-fullscreen"));
        $(this.el).html(this.templateFullscreen(jsonToRender));

        // Display the CommentReadView
        this.commentReadView.el = this.$('.comments');
        this.commentReadView.render();
        
        // Display the DataListsView
        this.dataListsView.el = this.$('.datalists-updating-collection'); 
        this.dataListsView.render();
        
        // Display the SessionsView
        this.sessionsView.el = this.$('.sessions-updating-collection'); 
        this.sessionsView.render();
        
        // Display the PermissionsView
//        this.permissionsView.el = this.$('.permissions-updating-collection');
//        this.permissionsView.render();

        // Display the DatumFieldsView
        this.datumFieldsView.el = this.$('.datum_field_settings');
        this.datumFieldsView.render();

        // Display the ConversationFieldsView
        this.conversationFieldsView.el = this.$('.conversation_field_settings');
        this.conversationFieldsView.render();
        
        // Display the DatumStatesView
        this.datumStatesView.el = this.$('.datum_state_settings');
        this.datumStatesView.render();

      //Localize for all fullscreen view 
        $(this.el).find(".locale_Show_in_Dashboard").attr("title", Locale.get("locale_Show_in_Dashboard"));
        $(this.el).find(".locale_Sessions_associated").html(Locale.get("locale_Sessions_associated"));
        $(this.el).find(".locale_elicitation_sessions_explanation").html(Locale.get("locale_elicitation_sessions_explanation"));
        $(this.el).find(".locale_Datalists_associated").html(Locale.get("locale_Datalists_associated"));
        $(this.el).find(".locale_datalists_explanation").html(Locale.get("locale_datalists_explanation"));
        $(this.el).find(".locale_Permissions_associated").html(Locale.get("locale_Permissions_associated"));
        $(this.el).find(".locale_permissions_explanation").html(Locale.get("locale_permissions_explanation"));
        $(this.el).find(".locale_Datum_field_settings").html(Locale.get("locale_Datum_field_settings"));
        $(this.el).find(".locale_datum_fields_explanation").html(Locale.get("locale_datum_fields_explanation"));
        $(this.el).find(".locale_Conversation_field_settings").html(Locale.get("locale_Conversation_field_settings"));
        $(this.el).find(".locale_conversation_fields_explanation").html(Locale.get("locale_conversation_fields_explanation"));
        $(this.el).find(".locale_Datum_state_settings").html(Locale.get("locale_Datum_state_settings"));
        $(this.el).find(".locale_datum_states_explanation").html(Locale.get("locale_datum_states_explanation"));
        $(this.el).find(".locale_Add").html(Locale.get("locale_Add"));

        //Localize for only Edit view.
        $(this.el).find(".locale_Public_or_Private").html(Locale.get("locale_Public_or_Private"));
        $(this.el).find(".locale_Encrypt_if_confidential").html(Locale.get("locale_Encrypt_if_confidential"));
        $(this.el).find(".locale_Help_Text").html(Locale.get("locale_Help_Text"));
        $(this.el).find(".locale_Help_Text_Placeholder").attr("placeholder", Locale.get("locale_Help_Text_Placeholder"));
        $(this.el).find(".locale_Add_New_Datum_Field_Tooltip").attr("title", Locale.get("locale_Add_New_Datum_Field_Tooltip"));
        $(this.el).find(".locale_Add_New_Conversation_Field_Tooltip").attr("title", Locale.get("locale_Add_New_Conversation_Field_Tooltip"));
        $(this.el).find(".locale_Add_Placeholder").attr("placeholder", Locale.get("locale_Add_Placeholder"));
        $(this.el).find(".locale_Green").html(Locale.get("locale_Green"));
        $(this.el).find(".locale_Orange").html(Locale.get("locale_Orange"));
        $(this.el).find(".locale_Red").html(Locale.get("locale_Red"));
        $(this.el).find(".locale_Blue").html(Locale.get("locale_Blue"));
        $(this.el).find(".locale_Teal").html(Locale.get("locale_Teal"));
        $(this.el).find(".locale_Black").html(Locale.get("locale_Black"));
        $(this.el).find(".locale_Default").html(Locale.get("locale_Default"));
        $(this.el).find(".locale_Add_New_Datum_State_Tooltip").attr("title", Locale.get("locale_Add_New_Datum_State_Tooltip"));
        $(this.el).find(".locale_Save").html(Locale.get("locale_Save"));

      } else if (this.format == "leftSide"){
        if (OPrime.debugMode) OPrime.debug("CORPUS EDIT LEFTSIDE render: " );
        this.setElement($("#corpus-quickview"));
        $(this.el).html(this.templateSummary(jsonToRender));
      
        //Localize left side edit view
        $(this.el).find(".locale_Show_corpus_settings").attr("title", Locale.get("locale_Show_corpus_settings"));
      
      }else if (this.format == "modal"){
        if (OPrime.debugMode) OPrime.debug("CORPUS EDIT MODAL render: " );
        this.setElement($("#new-corpus-modal"));
        $(this.el).html(this.templateNewCorpus(jsonToRender));
        
      }else {
        throw("You have not specified a format that the CorpusEditView can understand.");
      }
      if (this.format != "modal"){
        //Localize corpus menu for all corpus views, except new corpus modal
        $(this.el).find(".locale_New_menu").html(Locale.get("locale_New_menu"));
        $(this.el).find(".locale_New_Datum").html("<i class='icon-list'></i> "+Locale.get("locale_New_Datum"));
        $(this.el).find(".locale_New_Conversation").html("<i class='icon-gift'></i>New! "+Locale.get("locale_New_Conversation"));
        $(this.el).find(".locale_New_Data_List").html("<i class='icon-pushpin'></i> "+ Locale.get("locale_New_Data_List"));
        $(this.el).find(".locale_New_Session").html("<i class='icon-calendar'></i> "+Locale.get("locale_New_Session"));
        $(this.el).find(".locale_New_Corpus").html("<i class='icon-cloud'></i> "+Locale.get("locale_New_Corpus") );
        $(this.el).find(".locale_Data_menu").html(Locale.get("locale_Data_menu"));
        $(this.el).find(".locale_Import_Data").html(Locale.get("locale_Import_Data"));
        $(this.el).find(".locale_Export_Data").html(Locale.get("locale_Export_Data"));
        $(this.el).find(".locale_All_Data").html(Locale.get("locale_All_Data"));
        $(this.el).find(".locale_Show_Readonly").attr("title", Locale.get("locale_Show_Readonly"));
      }else{
        //Localize the new corpus menu
        $(this.el).find(".locale_New_Corpus").html(Locale.get("locale_New_Corpus"));
        $(this.el).find(".locale_New_Corpus_Instructions").html(Locale.get("locale_New_Corpus_Instructions"));
        $(this.el).find(".locale_Warning").html(Locale.get("locale_Warning"));
        $(this.el).find(".locale_New_Corpus_Warning").html(Locale.get("locale_New_Corpus_Warning"));
        $(this.el).find(".locale_Public_or_Private").html(Locale.get("locale_Public_or_Private"));
        $(this.el).find(".locale_Cancel").html(Locale.get("locale_Cancel"));
        $(this.el).find(".locale_Save").html(Locale.get("locale_Save"));
      }
      //Localize the title and description labels
      $(this.el).find(".locale_Title").html(Locale.get("locale_Title"));
      $(this.el).find(".locale_Description").html(Locale.get("locale_Description"));
      
      return this;
    },
    /**
     * 
     * http://stackoverflow.com/questions/6569704/destroy-or-remove-a-view-in-backbone-js
     */
    destroy_view: function() {
      if (OPrime.debugMode) OPrime.debug("DESTROYING CORPUS EDIT VIEW "+ this.format);
      //COMPLETELY UNBIND THE VIEW
      this.undelegateEvents();

      $(this.el).removeData().unbind(); 

      //Remove view from DOM
//    this.remove();  
//    Backbone.View.prototype.remove.call(this);
    },
    changeViewsOfInternalModels : function(){
      //Create a CommentReadView     
      this.commentReadView = new UpdatingCollectionView({
        collection           : this.model.get("comments"),
        childViewConstructor : CommentReadView,
        childViewTagName     : 'li'
      });
      
      if(!this.model.datalists){
        this.model.datalists = new DataLists();
      }
      // Create a DataList List
      this.dataListsView = new UpdatingCollectionView({
        collection : this.model.datalists,
        childViewConstructor : DataListReadView,
        childViewTagName     : 'li',
        childViewFormat      : "link"
      });
      
//    this.model.loadPermissions(); //Dont load automatically, its a server call
      //Create a Permissions View
//      this.permissionsView = new UpdatingCollectionView({
//        collection : this.model.permissions,
//        childViewConstructor : PermissionEditView,
//        childViewTagName     : 'li',
//        childViewClass       : "breadcrumb row span12"
//      });
      
      if(!this.model.sessions){
        this.model.sessions = new Sessions();
      }
      //Create a Sessions List 
       this.sessionsView = new UpdatingCollectionView({
         collection : this.model.sessions,
         childViewConstructor : SessionReadView,
         childViewTagName     : 'li',
         childViewFormat      : "link"  
       });
      

      //Create a DatumFieldsView     
      this.datumFieldsView = new UpdatingCollectionView({
        collection           : this.model.get("datumFields"),
        childViewConstructor : DatumFieldEditView,
        childViewTagName     : 'li',
        childViewFormat      : "corpus",
        childViewClass       : "breadcrumb"
      });

      //Create a ConversationFieldsView     
      this.conversationFieldsView = new UpdatingCollectionView({
        collection           : this.model.get("conversationFields"),
        childViewConstructor : DatumFieldEditView,
        childViewTagName     : 'li',
        childViewFormat      : "corpus",
        childViewClass       : "breadcrumb"
      });

      // Create a DatumStatesView    
      this.datumStatesView = new UpdatingCollectionView({
        collection           : this.model.get("datumStates"),
        childViewConstructor : DatumStateEditView,
        childViewTagName     : 'li',
        childViewFormat      : "corpus"
      });
            
    },
    
    updateTitle: function(){
      var newTitle = this.$el.find(".corpus-title-input").val();
      if(newTitle == ""){
        alert("Please enter a title for your corpus."); //TODO make this more user friendly later
        return;
      }
      this.model.set("title", newTitle);
      if(this.model.id){
        window.appView.addUnsavedDoc(this.model.id);
      }else{
        var newPouchName = this.model.get("team").get("username") +"-"+ newTitle.trim().toLowerCase().replace(/[!@#$^&%*()+=-\[\]\/{}|:<>?,."'`; ]/g,"_");

        var pouches = _.pluck(window.app.get("authentication").get("userPrivate").get("corpuses"), "pouchname");
        if(pouches.indexOf(newPouchName) != -1){
          alert("You have to choose a new title for your corpus, this one is already taken."); //TODO make this more user friendly later
          this.$el.find(".corpus-title-input").val("");
          return;
        }
        
        this.model.get("couchConnection").pouchname = newPouchName;
        this.model.set("pouchname", newPouchName);
        this.model.get("publicSelf").set("pouchname", newPouchName);
        this.model.get("team").set("pouchname", newPouchName);
        this.$el.find(".new-corpus-pouchname").html(newPouchName);
      }

    },
    
    updateDescription: function(){
      this.model.set("description",this.$el.find(".corpus-description-input").val());
      if(this.model.id){
        window.appView.addUnsavedDoc(this.model.id);
      }
    },
    updatePublicOrPrivate : function(){
      this.model.set("publicCorpus",this.$el.find(".public-or-private").val());
      if(this.model.id){
        window.appView.addUnsavedDoc(this.model.id);
      }
    },
   
    //Functions assoicate with the corpus menu
    newDatum : function(e) {
      if(e){
//        e.stopPropagation();// cant use stopPropagation, it leaves the dropdown menu open.
        e.preventDefault(); //this stops the link from moving the page to the top
        /* This permits this button to be inside a dropdown in the navbar... yet adds complexity the app*/
        if($(e.target).parent().parent().hasClass("dropdown-menu")){
          $(e.target).parent().parent().hide();
        }
      }
//      app.router.showEmbeddedDatum(this.get("pouchname"), "new");
      appView.datumsEditView.newDatum();
      if (OPrime.debugMode) OPrime.debug("CLICK NEW DATUM EDIT CORPUS VIEW.");
    },
    newConversation : function(e) {
        if(e){
//          e.stopPropagation();// cant use stopPropagation, it leaves the dropdown menu open.
          e.preventDefault(); //this stops the link from moving the page to the top
          /* This permits this button to be inside a dropdown in the navbar... yet adds complexity the app*/
          if($(e.target).parent().parent().hasClass("dropdown-menu")){
            $(e.target).parent().parent().hide();
          }
        }
//        app.router.showEmbeddedDatum(this.get("pouchname"), "new");
//        appView.datumsEditView.newDatum(); //no longer applicable, need to make new Conversations
        if (OPrime.debugMode) OPrime.debug("STOPGAP FOR MAKING CONVERSATIONS.");
      },

    newDataList : function(e) {
      if(e){
//      e.stopPropagation();// cant use stopPropagation, it leaves the dropdown menu open.
        e.preventDefault(); //this stops the link from moving the page to the top
        /* This permits this button to be inside a dropdown in the navbar... yet adds complexity the app*/
        if($(e.target).parent().parent().hasClass("dropdown-menu")){
          $(e.target).parent().parent().hide();
        }
      }
      //take the user to the search so they can create a data list using the search feature.
      window.appView.toastUser("Below is the Advanced Search, this is the easiest way to make a new Data List.","alert-info","How to make a new Data List:");
      app.router.showEmbeddedSearch();
    },
    
    newSession : function(e) {
      if(e){
//      e.stopPropagation();// cant use stopPropagation, it leaves the dropdown menu open.
        e.preventDefault(); //this stops the link from moving the page to the top
        /* This permits this button to be inside a dropdown in the navbar... yet adds complexity the app*/
        if($(e.target).parent().parent().hasClass("dropdown-menu")){
          $(e.target).parent().parent().hide();
        }
      }
      this.model.newSession();
    },
    
    newCorpus : function(e){
      if(e){
//      e.stopPropagation();// cant use stopPropagation, it leaves the dropdown menu open.
        e.preventDefault(); //this stops the link from moving the page to the top
        /* This permits this button to be inside a dropdown in the navbar... yet adds complexity the app*/
        if($(e.target).parent().parent().hasClass("dropdown-menu")){
          $(e.target).parent().parent().hide();
        }
      }
      this.model.newCorpus();
    },

    
    // This the function called by the add button, it adds a new datum field both to the 
    // collection and the model
    insertNewDatumField : function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      //don't add blank fields
      if(this.$el.find(".choose_add_field").val().toLowerCase().replace(/ /g,"_") == ""){
        return;
      }
      // Remember if the encryption check box was checked
      var checked = this.$el.find(".add_shouldBeEncrypted").is(':checked') ? "checked" : "";
      
      // Create the new DatumField based on what the user entered
      var m = new DatumField({
        "label" : this.$el.find(".choose_add_field").val().toLowerCase().replace(/ /g,"_"),
        "shouldBeEncrypted" : checked,
        "help" : this.$el.find(".add_help").val()
      });

      // Add the new DatumField to the Corpus' list for datumFields
      this.model.get("datumFields").add(m);
      
      // Reset the line with the add button
      this.$el.find(".choose_add_field").val("");//.children("option:eq(0)").attr("selected", true);
      this.$el.find(".add_help").val("");
      window.appView.addUnsavedDoc(this.model.id);

    },
 
    insertNewConversationDatumField : function(e) {
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        //don't add blank fields
        if(this.$el.find(".choose_add_conversation_field").val().toLowerCase().replace(/ /g,"_") == ""){
          return;
        }
        // Remember if the encryption check box was checked
        var checked = this.$el.find(".add_conversationShouldBeEncrypted").is(':checked') ? "checked" : "";
        
        // Create the new DatumField based on what the user entered
        var m = new DatumField({
          "label" : this.$el.find(".choose_add_conversation_field").val().toLowerCase().replace(/ /g,"_"),
          "shouldBeEncrypted" : checked,
          "help" : this.$el.find(".add_conversation_help").val()
        });

        // Add the new DatumField to the Corpus' list for datumFields
        this.model.get("conversationFields").add(m);
        
        // Reset the line with the add button
        this.$el.find(".choose_add_conversation_field").val("");//.children("option:eq(0)").attr("selected", true);
        this.$el.find(".add_conversation_help").val("");
        window.appView.addUnsavedDoc(this.model.id);

      },
    
    //This the function called by the add button, it adds a new datum state both to the collection and the model
    insertNewDatumState : function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      var m = new DatumField({
        "state" : this.$el.find(".add_input").val(),
        "color" : this.$el.find(".add_color_chooser").val()
      });
      this.model.get("datumStates").add(m);
      window.appView.addUnsavedDoc(this.model.id);

    },
  //This the function called by the add button, it adds a new datum state both to the collection and the model
    insertNewPermission : function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      //TODO perform a server call to do this, and display the the results/errors
      var p = this.model.permissions.where({role: this.$el.find(".choose-add-permission-role").val()})[0];
      if(p){
        p.get("usernames").push(this.$el.find(".choose-add-permission-username").val());
      }

    },
    resizeSmall : function(e){
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      window.location.href = "#render/true";
    },
    resizeFullscreen : function(e){
      if (OPrime.debugMode) OPrime.debug("CORPUS EDIT starts to render fullscreen. " );
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      this.format = "fullscreen";
      this.render();
      window.app.router.showFullscreenCorpus();
    },
    //This is the function that is  bound to the book button
    showReadonly : function(e){
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      window.appView.currentCorpusReadView.format = this.format;
      window.appView.currentCorpusReadView.render();
    },
    
    /**
     * saves the current corpus to pouch, if the corpus id doesnt match the
     * corpus in the app, It attempts to save it to to its pouch, and create new
     * session and data lists, and then save them to pouch. The new session and
     * datalist are set to the current ones, but the views are not reloaded yet,
     * then the corpus and session and data lists are saved via the
     * app.saveAndInterConnectInApp function. after that the app
     * needs to be reloaded entirely (page refresh), or we can attempt to attach
     * the views to these new models.
     */
    updatePouch : function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();

      }
      var self = this;
      if(this.format == "modal"){
        $("#new-corpus-modal").modal("hide");
      }
      this.model.saveAndInterConnectInApp(function(){
        if(this.format == "modal"){
//          $("#new-corpus-modal").modal("hide");
          window.appView.toastUser("The permissions and fields of datum, session, and conversation were copied from the previous corpus, please check your corpus settings to be sure they are what you want for this corpus.");
          alert("TODO check if new corpus succeeds, will set as current also.");
        }
        window.appView.currentCorpusReadView.format = self.format;
        window.appView.currentCorpusReadView.render();
        
      },function(){
        if(this.format == "modal"){
//          $("#new-corpus-modal").modal("hide");
          alert("There was a problem somewhere loading and saving the new corpus.");
          window.appView.toastUser("The permissions and fields of datum, session, and conversation were copied from the previous corpus, please check your corpus settings to be sure they are what you want for this corpus.");
        }
        window.appView.currentCorpusReadView.format = self.format;
        window.appView.currentCorpusReadView.render();
      });
    }
  });

  return CorpusEditView;
});