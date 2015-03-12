define([
    "backbone",
    "handlebars",
    "corpus/Corpus",
    "comment/Comment",
    "comment/Comments",
    "comment/CommentReadView",
    "comment/CommentEditView",
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
    "OPrime"
], function(
    Backbone,
    Handlebars,
    Corpus,
    Comment,
    Comments,
    CommentReadView,
    CommentEditView,
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
      "click .add-comment-button" : function(e) {
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        /* Ask the comment edit view to get it's current text */
        this.commentEditView.updateComment();
        /* Ask the collection to put a copy of the comment into the collection */
        this.model.get("comments").insertNewCommentFromObject(this.commentEditView.model.toJSON());
        /* empty the comment edit view. */
        this.commentEditView.clearCommentForReuse();
        /* save the state of the corpus when the comment is added, and render it*/
        this.updatePouch();
        this.commentReadView.render();
      },
      //Delete button remove a comment
      "click .remove-comment-button" : function(e) {
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        this.model.get("comments").remove(this.commentEditView.model);
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
      "click .add-session-field" : 'insertNewSessionField',
      "click .icon-resize-small" : 'resizeSmall',
      "click .resize-full" : "resizeFullscreen",

      //corpus menu buttons
      "click .new-datum" : "newDatum",
      "click .new-data-list" : "newDataList",
      "click .new-session" : "newSession",
      "click .new-corpus" : "newCorpus",

      //text areas in the edit view
      "blur .corpus-title-input" : "updateTitle",
      "blur .corpus-description-input" : "updateDescription",
      "blur .corpus-copyright-input" : "updateCopyright",
      "blur .corpus-license-title-input" : "updateLicense",
      "blur .corpus-license-humanreadable-input" : "updateLicense",
      "blur .corpus-license-link-input" : "updateLicense",
      "blur .corpus-terms-input" : "updateTermsOfUse",
      "blur .public-or-private" : "updatePublicOrPrivate",
      "blur .glosserURL" : function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        this.model.set("glosserURL", $(e.target).val());
      },

      //help text around text areas
      "click .explain_terms_of_use" : "toggleExplainTermsOfUse",
      "click .explain_license" : "toggleExplainLicense",

      "click .save-corpus" : "updatePouch",
      "click .create-new-corpus": function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        var userinfo ={
          username: window.app.get("authentication").get("userPrivate").get("username"),
          password: $(this.el).find(".new-corpus-password").val()
        }
        if(!userinfo.password || !userinfo.password.trim()){
          $(this.el).find(".alert-danger").removeClass("hide");
          $(this.el).find(".alert-danger").html("You must enter your password to create a new corpus.");
        }else{
          $(this.el).find(".new-corpus-password").val("")
          this.model.createCorpus(userinfo);
          $("#new-corpus-modal").hide();

        }

      },
//      Issue #797
//      Only Admin users can trash corpus
      "click .trash-button" : "putInTrash"

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

      if (OPrime.debugMode) OPrime.debug("CORPUS EDIT render: ");
      if( this.format != "modal"){
        window.appView.currentCorpusEditView.destroy_view();
        window.appView.currentCorpusReadView.destroy_view();
      }

      this.changeViewsOfInternalModels();

      var jsonToRender = this.model.toJSON();
      jsonToRender.glosserURL = jsonToRender.glosserURL || "default";

      var couchurl = OPrime.getCouchUrl(this.model.get("couchConnection"));
      jsonToRender.exportAllDatumURL = couchurl + "/_design/pages/_view/datums";
      jsonToRender.exportWordListURL = couchurl + "/_design/pages/_list/asCSV/word_list?group=true";

      jsonToRender.locale_Show_Readonly = Locale.get("locale_Show_Readonly");
      jsonToRender.locale_License_explanation = Locale.get("locale_License_explanation");
      jsonToRender.locale_Terms_explanation = Locale.get("locale_Terms_explanation");
      jsonToRender.locale_Add = Locale.get("locale_Add");
      jsonToRender.locale_Add_New_Datum_Field_Tooltip = Locale.get("locale_Add_New_Datum_Field_Tooltip");
      jsonToRender.locale_Add_New_Session_Field_Tooltip = Locale.get("locale_Add_New_Session_Field_Tooltip");
      jsonToRender.locale_Add_New_Datum_State_Tooltip = Locale.get("locale_Add_New_Datum_State_Tooltip");
      jsonToRender.locale_Add_Placeholder = Locale.get("locale_Add_Placeholder");
      jsonToRender.locale_All_Data = Locale.get("locale_All_Data");
      jsonToRender.locale_Black = Locale.get("locale_Black");
      jsonToRender.locale_Blue = Locale.get("locale_Blue");
      jsonToRender.locale_Cancel = Locale.get("locale_Cancel");
      jsonToRender.locale_Conversation_field_settings = Locale.get("locale_Conversation_field_settings");
      jsonToRender.locale_Copyright = Locale.get("locale_Copyright");
      jsonToRender.locale_Data_menu = Locale.get("locale_Data_menu");
      jsonToRender.locale_Datalists_associated = Locale.get("locale_Datalists_associated");
      jsonToRender.locale_Datum_field_settings = Locale.get("locale_Datum_field_settings");
      jsonToRender.locale_Session_field_settings = Locale.get("locale_Session_field_settings");
      jsonToRender.locale_Datum_state_settings = Locale.get("locale_Datum_state_settings");
      jsonToRender.locale_Default = Locale.get("locale_Default");
      jsonToRender.locale_Description = Locale.get("locale_Description");
      jsonToRender.locale_Encrypt_if_confidential = Locale.get("locale_Encrypt_if_confidential");
      jsonToRender.locale_Export_Data = Locale.get("locale_Export_Data");
      jsonToRender.locale_Green = Locale.get("locale_Green");
      jsonToRender.locale_Help_Text = Locale.get("locale_Help_Text");
      jsonToRender.locale_Help_Text_Placeholder = Locale.get("locale_Help_Text_Placeholder");
      jsonToRender.locale_Import_Data = Locale.get("locale_Import_Data");
      jsonToRender.locale_License = Locale.get("locale_License");
      jsonToRender.locale_New_Corpus = "<i class='icon-cloud'></i> "+Locale.get("locale_New_Corpus") ;
      jsonToRender.locale_New_Corpus = Locale.get("locale_New_Corpus");
      jsonToRender.locale_New_Corpus_Instructions = Locale.get("locale_New_Corpus_Instructions");
      jsonToRender.locale_New_Corpus_Warning = Locale.get("locale_New_Corpus_Warning");
      jsonToRender.locale_Password = Locale.get("locale_Password");
      jsonToRender.locale_We_need_to_make_sure_its_you = Locale.get("locale_We_need_to_make_sure_its_you");
      jsonToRender.locale_New_Data_List = Locale.get("locale_New_Data_List");
      jsonToRender.locale_New_Datum = Locale.get("locale_New_Datum");
      jsonToRender.locale_New_Session = Locale.get("locale_New_Session");
      jsonToRender.locale_New_menu = Locale.get("locale_New_menu");
      jsonToRender.locale_Orange = Locale.get("locale_Orange");
      jsonToRender.locale_Permissions_associated = Locale.get("locale_Permissions_associated");
      jsonToRender.locale_Public_or_Private = Locale.get("locale_Public_or_Private");
      jsonToRender.locale_Red = Locale.get("locale_Red");
      jsonToRender.locale_Save = Locale.get("locale_Save");
      jsonToRender.locale_Sessions_associated = Locale.get("locale_Sessions_associated");
      jsonToRender.locale_Show_in_Dashboard = Locale.get("locale_Show_in_Dashboard");
      jsonToRender.locale_Teal = Locale.get("locale_Teal");
      jsonToRender.locale_Terms_of_use = Locale.get("locale_Terms_of_use");
      jsonToRender.locale_Title = Locale.get("locale_Title");
      jsonToRender.locale_Warning = Locale.get("locale_Warning");
      jsonToRender.locale_conversation_fields_explanation = Locale.get("locale_conversation_fields_explanation");
      jsonToRender.locale_datalists_explanation = Locale.get("locale_datalists_explanation");
      jsonToRender.locale_datum_fields_explanation = Locale.get("locale_datum_fields_explanation");
      jsonToRender.locale_datum_states_explanation = Locale.get("locale_datum_states_explanation");
      jsonToRender.locale_elicitation_sessions_explanation = Locale.get("locale_elicitation_sessions_explanation");
      jsonToRender.locale_permissions_explanation = Locale.get("locale_permissions_explanation");


      try{
        jsonToRender.username = this.model.get("team").get("username");
      }catch(e){
        if (OPrime.debugMode) OPrime.debug("Problem getting the usrname of the corpus' team");
      }

     if (this.format == "fullscreen" || this.format == "centreWell"){
        if (OPrime.debugMode) OPrime.debug("CORPUS READ FULLSCREEN/EMBEDDED render: " );

        if(this.format == "fullscreen"){
          this.setElement($("#corpus-fullscreen"));
          $(this.el).html(this.templateFullscreen(jsonToRender));
        }else{
          this.setElement($("#corpus-embedded"));
          $(this.el).html(this.templateCentreWell(jsonToRender));
        }

          // Display the CommentReadView
          this.commentReadView.el = $(this.el).find('.comments');
          this.commentReadView.render();

          // Display the CommentEditView
          this.commentEditView.el = $(this.el).find('.new-comment-area');
          this.commentEditView.render();

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

           // Display the SessionFieldsView
          this.sessionFieldsView.el = this.$('.session_field_settings');
          this.sessionFieldsView.render();

          // Display the ConversationFieldsView
          this.conversationFieldsView.el = this.$('.conversation_field_settings');
          this.conversationFieldsView.render();

          // Display the DatumStatesView
          this.datumStatesView.el = this.$('.datum_state_settings');
          this.datumStatesView.render();

          this.updateDescription();

          $(this.el).find(".corpus-terms-wiki-preview").html($.wikiText(jsonToRender.termsOfUse.humanReadable));
          $(this.el).find(".corpus-license-humanreadable-wiki-preview").html($.wikiText(jsonToRender.license.humanReadable));

      } else if (this.format == "leftSide"){
        if (OPrime.debugMode) OPrime.debug("CORPUS EDIT LEFTSIDE render: " );
        this.setElement($("#corpus-quickview"));
        $(this.el).html(this.templateSummary(jsonToRender));

        //Localize left side edit view
        $(this.el).find(".locale_Show_corpus_settings").attr("title", Locale.get("locale_Show_corpus_settings"));

      } else if (this.format == "modal"){
        if (OPrime.debugMode) OPrime.debug("CORPUS EDIT MODAL render: " );
        this.setElement($("#new-corpus-modal"));
        $(this.el).html(this.templateNewCorpus(jsonToRender));

      } else {
        throw("You have not specified a render format that the CorpusEditView can understand.");
      }

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

    /**
     * See definition in the model
     *
     */
    putInTrash : function(e){
      if(e){
        e.preventDefault();
      }
      var r = confirm("Are you sure you want to put this corpus in the trash?");
      if (r == true) {
        this.model.putInTrash();
      }
    },

    changeViewsOfInternalModels : function(){
      //Create a CommentReadView
      this.commentReadView = new UpdatingCollectionView({
        collection           : this.model.get("comments"),
        childViewConstructor : CommentReadView,
        childViewTagName     : 'li'
      });

      this.commentEditView = new CommentEditView({
        model : new Comment(),
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

      //Create a SessionFieldsView
      this.sessionFieldsView = new UpdatingCollectionView({
        collection           : this.model.get("sessionFields"),
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

        var pouches = _.pluck(window.app.get("authentication").get("userPrivate").get("corpora"), "pouchname");
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

    updateDescription: function(e){
      var newDescription = this.$el.find(".corpus-description-input").val();
      var inputFieldToResize;
      if (e) {
        inputFieldToResize = e.target;
      } else {
        inputFieldToResize = $(this.el).find(".corpus-description-input")[0];
      }
      if (!inputFieldToResize) {
        return;
      }
      var sh = inputFieldToResize.scrollHeight;
      if(sh > 20){
        inputFieldToResize.style.height =  sh + "px";
      }
      if(this.model.get("description") != newDescription){
        this.model.set("description", newDescription);
        if(this.model.id){
          window.appView.addUnsavedDoc(this.model.id);
        }
      }
      $(this.el).find(".corpus-description-wiki-preview").html($.wikiText(newDescription));
    },
    updateCopyright: function(){
      this.model.set("copyright", this.$el.find(".corpus-copyright-input").val());
      if(this.model.id){
        window.appView.addUnsavedDoc(this.model.id);
      }
    },
    updateLicense: function(){
      var license = {
        title: this.$el.find(".corpus-license-title-input").val(),
        link: this.$el.find(".corpus-license-link-input").val(),
        humanReadable : this.$el.find(".corpus-license-humanreadable-input").val()
      };
      this.model.set("license", license);
      if(this.model.id){
        window.appView.addUnsavedDoc(this.model.id);
      }
    },
    updateTermsOfUse: function(){
      var terms = {
        humanReadable : this.$el.find(".corpus-terms-input").val()
      };
      this.model.set("termsOfUse", terms);
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

    //toggle Terms of Use explanation in popover
    toggleExplainTermsOfUse : function(e) {
      if(e){
        // e.preventDefault();
        e.stopPropagation();
      }
      if (this.showingHelp) {
        this.$el.find(".explain_terms_of_use").popover("hide");
        this.showingHelp = false;
      } else {
        this.$el.find(".explain_terms_of_use").popover("show");
        this.showingHelp = true;
      }
      return false;
    },

    //toggle License explanation in popover
    toggleExplainLicense : function(e) {
      if(e){
        // e.preventDefault();
        e.stopPropagation();
      }
      if (this.showingHelp) {
        this.$el.find(".explain_license").popover("hide");
        this.showingHelp = false;
      } else {
        this.$el.find(".explain_license").popover("show");
        this.showingHelp = true;
      }
      return false;
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


    // This the function called by the add button, it adds a new session field both to the
    // collection and the model
    insertNewSessionField : function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      //don't add blank fields
      if(this.$el.find(".choose_add_session_field").val().toLowerCase().replace(/ /g,"_") == ""){
        return;
      }
      // Remember if the encryption check box was checked
      var checked = this.$el.find(".add_session_shouldBeEncrypted").is(':checked') ? "checked" : "";

      // Create the new DatumField based on what the user entered
      var m = new DatumField({
        "label" : this.$el.find(".choose_add_session_field").val().toLowerCase().replace(/ /g,"_"),
        "shouldBeEncrypted" : checked,
        "help" : this.$el.find(".add_session_help").val()
      });

      // Add the new SessionField to the Corpus' list for sessionFields
      this.model.get("sessionFields").add(m);

      // Reset the line with the add button
      this.$el.find(".choose_add_session_field").val("");//.children("option:eq(0)").attr("selected", true);
      this.$el.find(".add_session_help").val("");
      window.appView.addUnsavedDoc(this.model.id);

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
        $("#new-corpus-modal").hide();
      }
      this.model.saveAndInterConnectInApp(function(){
        if(this.format == "modal"){
//          $("#new-corpus-modal").hide();
          window.appView.toastUser("The permissions and fields of datum, session, and conversation were copied from the previous corpus, please check your corpus settings to be sure they are what you want for this corpus.");
          alert("TODO check if new corpus succeeds, will set as current also.");
        }
        window.appView.currentCorpusReadView.format = self.format;
        window.appView.currentCorpusReadView.render();

      },function(){
        if(this.format == "modal"){
//          $("#new-corpus-modal").hide();
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
