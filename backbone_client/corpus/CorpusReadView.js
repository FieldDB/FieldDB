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
    "datum/DatumFieldReadView",
    "datum/DatumStateReadView",
    "lexicon/LexiconView",
    "permission/Permission",
    "permission/Permissions",
    "permission/PermissionReadView",
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
    DatumFieldReadView,
    DatumStateReadView, 
    LexiconView,
    Permission,
    Permissions,
    PermissionReadView,
    Session,
    Sessions,
    SessionReadView,
    UpdatingCollectionView
) {
  var CorpusReadView = Backbone.View.extend(
  /** @lends CorpusReadView.prototype */
  {
    /**
     * @class This is the corpus view. To the user it looks like a
     *        Navigation panel on the main dashboard screen, which
     *        displays a menu of things the User can do (ex. open a new
     *        session, browse all entries, etc.).
     * @property {String} format Must be set when the CorpusEditView is
     * initialized. Valid values are "centreWell" ,
     * "fullscreen", "link" and "leftSide"
     * 
     * @description Starts the Corpus and initializes all its children.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      if (OPrime.debugMode) OPrime.debug("CORPUS READ init: " );
      this.changeViewsOfInternalModels();
      
   // If the model's pouchname changes, chances are its a new corpus, re-render its internal models.
      this.model.bind('change:pouchname', function(){
        this.changeViewsOfInternalModels();
        this.render();
      }, this);
      
      //TOOD if the sessions and data lists arent up-to-date, turn these on
//      this.model.bind('change:sessions', function(){
//        if (OPrime.debugMode) OPrime.debug("Corpus read view sessions changed. changeViewsOfInternalModels and rendering...");
//        this.changeViewsOfInternalModels();
//        this.render();
//      }, this);
//      this.model.bind('change:dataLists', function(){
//            this.changeViewsOfInternalModels();
//      this.render();
//      }, this);
    },
    events : {
      "click .icon-resize-small" : 'resizeSmall',
      "click .resize-full" : "resizeFullscreen",
      
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
        /* save the state of the datum when the comment is added, and render it*/
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
            childViewConstructor : PermissionReadView,
            childViewTagName     : 'li',
            childViewClass       : "breadcrumb row span12"
          });
          
          corpusviewself.permissionsView.el = corpusviewself.$('.permissions-updating-collection');
          corpusviewself.permissionsView.render();
        });
        
      },
      
      //help text around text areas 
      "click .explain-terms-of-use" : "toggleExplainTermsOfUse",
      "click .explain-license" : "toggleExplainLicense",

      "click .icon-edit": "showEditable",
      
      //corpus menu buttons
      "click .new-datum" : "newDatum",
      "click .new-data-list" : "newDataList",
      "click .new-session" : "newSession",
      "click .new-corpus" : "newCorpus",

    },
    
    /**
     * The underlying model of the CorpusReadView is a Corpus.
     */    
    model : Corpus,

    // TODO Should LexiconView really be here?
    lexicon : LexiconView,

    /**
     * The Handlebars template rendered as the CorpusFullscreenView.
     */
    templateFullscreen : Handlebars.templates.corpus_read_embedded,
    
    /**
     * The Handlebars template rendered as the CorpusWellView.
     */
    templateCentreWell : Handlebars.templates.corpus_read_embedded,
    
    /**
     * The Handlebars template rendered as the Summary
     */
    templateSummary : Handlebars.templates.corpus_summary_read_embedded,
    
    /**
     * The Handlebars template rendered as the CorpusReadLinkView.
     */
    templateLink: Handlebars.templates.corpus_read_link,
    
    /**
     * Renders the CorpusReadView and all of its child Views.
     */
    render : function() {
      if (OPrime.debugMode) OPrime.debug("CORPUS READ render: ");
      if(window.appView.currentCorpusEditView){
        window.appView.currentCorpusEditView.destroy_view();
      }
      window.appView.currentCorpusReadView.destroy_view();
      

      // Build the lexicon
      this.model.buildLexiconFromTeamServer(this.model.get("pouchname"));
      
      // Get the corpus' current precedence rules
      this.model.buildMorphologicalAnalyzerFromTeamServer(this.model.get("pouchname"));
     
      if (this.model == undefined) {
        if (OPrime.debugMode) OPrime.debug("\tCorpus model was undefined.");
        return this;
      }
      var couchConnection = this.model.get("couchConnection");
      var couchurl = OPrime.getCouchUrl(couchConnection);

      var jsonToRender = this.model.toJSON();
      jsonToRender.glosserURL = jsonToRender.glosserURL || "default";

      jsonToRender.exportAllDatumURL = couchurl + "/_design/pages/_view/datums";

      try{
        jsonToRender.username = this.model.get("team").get("username");
      }catch(e){
        if (OPrime.debugMode) OPrime.debug("Problem getting the usrname of the corpus' team");
      }
      if (this.format == "leftSide") {
        if (OPrime.debugMode) OPrime.debug("CORPUS READ LEFTSIDE render: " );

          // Display the CorpusReadView
          this.setElement($("#corpus-quickview"));
          if(jsonToRender.description && jsonToRender.description.length > 200){
            jsonToRender.description = jsonToRender.description.substring(0,150)+"...";
          }
          $(this.el).html(this.templateSummary(jsonToRender));
          
          $(this.el).find(".locale_Show_corpus_settings").attr("title", Locale.get("locale_Show_corpus_settings"));

      } else if (this.format == "link") {
        if (OPrime.debugMode) OPrime.debug("CORPUS READ LINK render: " );

        // Display the CorpusGlimpseView, dont set the element
        $(this.el).html(this.templateLink(jsonToRender));
        
      } else if (this.format == "fullscreen"){
        if (OPrime.debugMode) OPrime.debug("CORPUS READ FULLSCREEN render: " );

        this.setElement($("#corpus-fullscreen")); 
        $(this.el).html(this.templateFullscreen(jsonToRender));
        

        // Display the CommentReadView
        this.commentReadView.el = $(this.el).find('.comments');
        this.commentReadView.render();
 
        // Display the CommentEditView
        this.commentEditView.el = $(this.el).find('.new-comment-area'); 
        this.commentEditView.render();
        
        // Display the DatumFieldsView
        this.datumFieldsView.el = this.$('.datum_field_settings');
        this.datumFieldsView.render();
        
        // Display the DatumStatesView
        this.datumStatesView.el = this.$('.datum_state_settings');
        this.datumStatesView.render();

        // Display the DataListsView
        this.dataListsView.el = this.$('.datalists-updating-collection'); 
        this.dataListsView.render();
        
        // Display the SessionsView
        this.sessionsView.el = this.$('.sessions-updating-collection'); //TODO do not use such ambiguous class names, compare this with datum_field_settings below.  there is a highlyily hood that the sesson module will be using the same class name and will overwrite your renders.
        this.sessionsView.render();
        
//        // Display the PermissionsView
//        this.permissionsView.el = this.$('.permissions-updating-collection');
//        this.permissionsView.render();        
        
        try{
          Glosser.visualizeMorphemesAsForceDirectedGraph(null, $(this.el).find(".corpus-precedence-rules-visualization")[0], this.model.get("pouchname"));
        }catch(e){
          window.appView.toastUser("There was a problem loading your corpus visualization.");
        }

        try{
          $(this.el).find(".corpus-description-wiki").html($.wikiText(jsonToRender.description));
          $(this.el).find(".corpus-terms-wiki-preview").html($.wikiText(jsonToRender.termsOfUse.humanReadable));
          $(this.el).find(".corpus-license-humanreadable-wiki-preview").html($.wikiText(jsonToRender.license.humanReadable));
        } catch(e){
          OPrime.debug("Formatting as wiki text didnt work");
        }

      
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
        $(this.el).find(".locale_Datum_state_settings").html(Locale.get("locale_Datum_state_settings"));
        $(this.el).find(".locale_datum_states_explanation").html(Locale.get("locale_datum_states_explanation"));
        $(this.el).find(".locale_Copyright").html(Locale.get("locale_Copyright"));
        $(this.el).find(".locale_License").html(Locale.get("locale_License"));
        $(this.el).find(".locale_Terms_of_use").html(Locale.get("locale_Terms_of_use"));
        $(this.el).find(".explain-terms-of-use").attr("data-content", Locale.get("locale_Terms_explanation"));
        $(this.el).find(".explain-license").attr("data-content", Locale.get("locale_License_explanation"));

      } else if (this.format == "centreWell"){
        if (OPrime.debugMode) OPrime.debug("CORPUS READ CENTER render: " );

        this.setElement($("#corpus-embedded"));
        $(this.el).html(this.templateCentreWell(jsonToRender));

        // Display the CommentReadView
        this.commentReadView.el = $(this.el).find('.comments');
        this.commentReadView.render();
        
        // Display the CommentEditView
        this.commentEditView.el = $(this.el).find('.new-comment-area'); 
        this.commentEditView.render();
        
        // Display the DatumFieldsView
        this.datumFieldsView.el = this.$('.datum_field_settings');
        this.datumFieldsView.render();

        // Display the DatumStatesView
        this.datumStatesView.el = this.$('.datum_state_settings');
        this.datumStatesView.render();

        // Display the DataListsView
        this.dataListsView.el = this.$('.datalists-updating-collection'); 
        this.dataListsView.render();
         
        // Display the SessionsView
        this.sessionsView.el = this.$('.sessions-updating-collection'); 
        this.sessionsView.render();
        
        // Display the PermissionsView
//        this.permissionsView.el = this.$('.permissions-updating-collection');
//        this.permissionsView.render();
  

        try{
          $(this.el).find(".corpus-description-wiki").html($.wikiText(jsonToRender.description));
          $(this.el).find(".corpus-terms-wiki-preview").html($.wikiText(jsonToRender.termsOfUse.humanReadable));
          $(this.el).find(".corpus-license-humanreadable-wiki-preview").html($.wikiText(jsonToRender.license.humanReadable));
        } catch(e){
          OPrime.debug("Formatting as wiki text didnt work");
        }
        
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
        $(this.el).find(".locale_Datum_state_settings").html(Locale.get("locale_Datum_state_settings"));
        $(this.el).find(".locale_datum_states_explanation").html(Locale.get("locale_datum_states_explanation"));

      }
      
      //Localize corpus menu for all corpus views
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
      
      //Localize corpus read only view
      $(this.el).find(".locale_Edit_corpus").attr("title", Locale.get("locale_Edit_corpus"));
      
      
      return this;
    },
    /**
     * 
     * http://stackoverflow.com/questions/6569704/destroy-or-remove-a-view-in-backbone-js
     */
    destroy_view: function() {
      if (OPrime.debugMode) OPrime.debug("DESTROYING CORPUS READ VIEW "+ this.format);

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
      
      this.commentEditView = new CommentEditView({
        model : new Comment(),
      });
      
      // Create a list of DataLists
      this.dataListsView = new UpdatingCollectionView({
        collection : this.model.datalists,
        childViewConstructor : DataListReadView,
        childViewTagName     : 'li',
        childViewFormat      : "link"
      });
      
      //Create a list of DatumFields     
      this.datumFieldsView = new UpdatingCollectionView({
        collection           : this.model.get("datumFields"),
        childViewConstructor : DatumFieldReadView,
        childViewTagName     : 'li',
        childViewFormat      : "corpus",
        childViewClass       : "breadcrumb"
      });
      
      // Create a list of DatumStates    
      this.datumStatesView = new UpdatingCollectionView({
        collection           : this.model.get("datumStates"),
        childViewConstructor : DatumStateReadView,
        childViewTagName     : 'li',
        childViewFormat      : "corpus"
      });

//      this.model.loadPermissions(); //Dont load automatically, its a server call
      //Create a Permissions View
//      this.permissionsView = new UpdatingCollectionView({
//        collection : this.model.permissions,
//        childViewConstructor : PermissionReadView,
//        childViewTagName     : 'li',
//        childViewClass       : "breadcrumb"
//      });
      
      //Create a Sessions List 
       this.sessionsView = new UpdatingCollectionView({
         collection : this.model.sessions,
         childViewConstructor : SessionReadView,
         childViewTagName     : 'li',
         childViewFormat      : "link"  
       });
      
    },

    //toggle Terms of Use explanation in popover 
    toggleExplainTermsOfUse : function(e) {
      if(e){
        // e.preventDefault();
        e.stopPropagation();
      }
      if (this.showingHelp) {
        this.$el.find(".explain-terms-of-use").popover("hide");
        this.showingHelp = false;
      } else {
        this.$el.find(".explain-terms-of-use").popover("show");
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
        this.$el.find(".explain-license").popover("hide");
        this.showingHelp = false;
      } else {
        this.$el.find(".explain-license").popover("show");
        this.showingHelp = true;
      }
      return false;
    },

  //Functions assoicate with the corpus menu
    newDatum : function(e) {
      if(e){
//        e.stopPropagation(); //cant use stopPropagation, it leaves the dropdown menu open.
        e.preventDefault(); //this stops the link from moving the page to the top
        /* This permits this button to be inside a dropdown in the navbar... yet adds complexity the app*/
        if($(e.target).parent().parent().hasClass("dropdown-menu")){
          $(e.target).parent().parent().hide();
        }
      } 
//      app.router.showEmbeddedDatum(this.get("pouchname"), "new");
      appView.datumsEditView.newDatum();
      if (OPrime.debugMode) OPrime.debug("CLICK NEW DATUM READ CORPUS VIEW.");
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
    
     resizeSmall : function(e){
       if(e){
         e.stopPropagation();
         e.preventDefault();
       }
       window.location.href = "#render/true";
    },
    
    resizeFullscreen : function(e){
      if (OPrime.debugMode) OPrime.debug("CORPUS READ starts to render fullscreen. " );
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      this.format = "fullscreen";
      this.render();
      window.app.router.showFullscreenCorpus();
    },
   
    //This is bound to the little pencil function
    showEditable :function(e){
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      if(window.appView.currentCorpusEditView){
        window.appView.currentCorpusEditView.format = this.format;
        window.appView.currentCorpusEditView.render();
      }
    },
    
    /* ReadView is supposed to save no change but we want the comments to
     * be saved. This function saves the change/addition/deletion of the comments. 
     * Changes in other parts of Corpus is taken care of the server according to 
     * users' permissions. */
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
        self.render();
      },function(){
        self.render();
      });
    }
    
    
  });

  return CorpusReadView;
});
