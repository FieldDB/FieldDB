define([ 
    "backbone", 
    "handlebars", 
    "corpus/Corpus",
    "comment/Comment",
    "comment/Comments",
    "comment/CommentReadView",
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
    "libs/Utils"
], function(
    Backbone, 
    Handlebars, 
    Corpus,
    Comment,
    Comments,
    CommentReadView,
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
      Utils.debug("CORPUS READ init: " );
      this.changeViewsOfInternalModels();
      
   // If the model's title changes, chances are its a new corpus, re-render its internal models.
      this.model.bind('change:title', function(){
        this.changeViewsOfInternalModels();
        this.render();
      }, this);
      
      //TOOD if the sessions and data lists arent up-to-date, turn these on
//      this.model.bind('change:sessions', function(){
//        this.render();
//      }, this);
//      this.model.bind('change:dataLists', function(){
//        this.render();
//      }, this);
    },
    events : {
      "click .icon-resize-small" : 'resizeSmall',
      "click .resize-full" : "resizeFullscreen",
      
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
      Utils.debug("CORPUS READ render: ");
      if(window.appView.currentCorpusEditView){
        window.appView.currentCorpusEditView.destroy_view();
      }
      window.appView.currentCorpusReadView.destroy_view();
      
      if (this.model == undefined) {
        Utils.debug("\tCorpus model was undefined.");
        return this;
      }
      var jsonToRender = this.model.toJSON();
      try{
        jsonToRender.username = this.model.get("team").get("username");
      }catch(e){
        Utils.debug("Problem getting the usrname of the corpus' team");
      }
      if (this.format == "leftSide") {
        Utils.debug("CORPUS READ LEFTSIDE render: " );

          // Display the CorpusReadView
          this.setElement($("#corpus-quickview"));
          $(this.el).html(this.templateSummary(jsonToRender));
          
          $(this.el).find(".locale_Show_corpus_settings").attr("title", chrome.i18n.getMessage("locale_Show_corpus_settings"));

      } else if (this.format == "link") {
        Utils.debug("CORPUS READ LINK render: " );

        // Display the CorpusGlimpseView, dont set the element
        $(this.el).html(this.templateLink(jsonToRender));
        
      } else if (this.format == "fullscreen"){
        Utils.debug("CORPUS READ FULLSCREEN render: " );

        this.setElement($("#corpus-fullscreen")); 
        $(this.el).html(this.templateFullscreen(jsonToRender));
        

        // Display the CommentReadView
        this.commentReadView.el = this.$('.comments');
        this.commentReadView.render();
 
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
        
        // Display the PermissionsView
        this.permissionsView.el = this.$('.permissions-updating-collection');
        this.permissionsView.render();        
        
        try{
          Glosser.visualizeMorphemesAsForceDirectedGraph(null, $(this.el).find(".corpus-precedence-rules-visualization")[0], this.model.get("pouchname"));
        }catch(e){
          window.appView.toastUser("There was a problem loading your corpus visualization.");
        }

        //Localize for all fullscreen view 
        $(this.el).find(".locale_Show_in_Dashboard").attr("title", chrome.i18n.getMessage("locale_Show_in_Dashboard"));
        $(this.el).find(".locale_Sessions_associated").html(chrome.i18n.getMessage("locale_Sessions_associated"));
        $(this.el).find(".locale_elicitation_sessions_explaination").html(chrome.i18n.getMessage("locale_elicitation_sessions_explaination"));
        $(this.el).find(".locale_Datalists_associated").html(chrome.i18n.getMessage("locale_Datalists_associated"));
        $(this.el).find(".locale_datalists_explaination").html(chrome.i18n.getMessage("locale_datalists_explaination"));
        $(this.el).find(".locale_Permissions_associated").html(chrome.i18n.getMessage("locale_Permissions_associated"));
        $(this.el).find(".locale_permissions_explaination").html(chrome.i18n.getMessage("locale_permissions_explaination"));
        $(this.el).find(".locale_Datum_field_settings").html(chrome.i18n.getMessage("locale_Datum_field_settings"));
        $(this.el).find(".locale_datum_fields_explaination").html(chrome.i18n.getMessage("locale_datum_fields_explaination"));
        $(this.el).find(".locale_Datum_state_settings").html(chrome.i18n.getMessage("locale_Datum_state_settings"));
        $(this.el).find(".locale_datum_states_explaination").html(chrome.i18n.getMessage("locale_datum_states_explaination"));
        $(this.el).find(".locale_Add").html(chrome.i18n.getMessage("locale_Add"));

        
      } else if (this.format == "centreWell"){
        Utils.debug("CORPUS READ CENTER render: " );

        this.setElement($("#corpus-embedded"));
        $(this.el).html(this.templateCentreWell(jsonToRender));

        // Display the CommentReadView
        this.commentReadView.el = this.$('.comments');
        this.commentReadView.render();
        
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
        this.permissionsView.el = this.$('.permissions-updating-collection');
        this.permissionsView.render();

        //Localize for all embedded view
        $(this.el).find(".locale_Show_in_Dashboard").attr("title", chrome.i18n.getMessage("locale_Show_in_Dashboard"));
        $(this.el).find(".locale_Sessions_associated").html(chrome.i18n.getMessage("locale_Sessions_associated"));
        $(this.el).find(".locale_elicitation_sessions_explaination").html(chrome.i18n.getMessage("locale_elicitation_sessions_explaination"));
        $(this.el).find(".locale_Datalists_associated").html(chrome.i18n.getMessage("locale_Datalists_associated"));
        $(this.el).find(".locale_datalists_explaination").html(chrome.i18n.getMessage("locale_datalists_explaination"));
        $(this.el).find(".locale_Permissions_associated").html(chrome.i18n.getMessage("locale_Permissions_associated"));
        $(this.el).find(".locale_permissions_explaination").html(chrome.i18n.getMessage("locale_permissions_explaination"));
        $(this.el).find(".locale_Datum_field_settings").html(chrome.i18n.getMessage("locale_Datum_field_settings"));
        $(this.el).find(".locale_datum_fields_explaination").html(chrome.i18n.getMessage("locale_datum_fields_explaination"));
        $(this.el).find(".locale_Datum_state_settings").html(chrome.i18n.getMessage("locale_Datum_state_settings"));
        $(this.el).find(".locale_datum_states_explaination").html(chrome.i18n.getMessage("locale_datum_states_explaination"));
        $(this.el).find(".locale_Add").html(chrome.i18n.getMessage("locale_Add"));

      }
      
      //Localize corpus menu for all corpus views
      $(this.el).find(".locale_New_menu").html(chrome.i18n.getMessage("locale_New_menu"));
      $(this.el).find(".locale_New_Datum").html(chrome.i18n.getMessage("locale_New_Datum"));
      $(this.el).find(".locale_New_Data_List").html(chrome.i18n.getMessage("locale_New_Data_List"));
      $(this.el).find(".locale_New_Session").html(chrome.i18n.getMessage("locale_New_Session"));
      $(this.el).find(".locale_New_Corpus").html(chrome.i18n.getMessage("locale_New_Corpus"));
      $(this.el).find(".locale_Data_menu").html(chrome.i18n.getMessage("locale_Data_menu"));
      $(this.el).find(".locale_Import_Data").html(chrome.i18n.getMessage("locale_Import_Data"));
      $(this.el).find(".locale_Export_Data").html(chrome.i18n.getMessage("locale_Export_Data"));
      
      //Localize corpus read only view
      $(this.el).find(".locale_Edit_corpus").attr("title", chrome.i18n.getMessage("locale_Edit_corpus"));
      
      
      return this;
    },
    /**
     * 
     * http://stackoverflow.com/questions/6569704/destroy-or-remove-a-view-in-backbone-js
     */
    destroy_view: function() {
      Utils.debug("DESTROYING CORPUS READ VIEW "+ this.format);

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
      
      // Create a list of DataLists
      this.dataListsView = new UpdatingCollectionView({
        collection : this.model.get("dataLists"),
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
      
      // Create a DataList List
      this.dataListsView = new UpdatingCollectionView({
        collection : this.model.get("dataLists"),
        childViewConstructor : DataListReadView,
        childViewTagName     : 'li',
        childViewFormat      : "link"
      });

      this.model.loadPermissions();
      //Create a Permissions View
      this.permissionsView = new UpdatingCollectionView({
        collection : this.model.permissions,
        childViewConstructor : PermissionReadView,
        childViewTagName     : 'li',
        childViewClass       : "breadcrumb"
      });
      
      //Create a Sessions List 
       this.sessionsView = new UpdatingCollectionView({
         collection : this.model.get("sessions"),
         childViewConstructor : SessionReadView,
         childViewTagName     : 'li',
         childViewFormat      : "link"  
       });
      
    },
  //Functions assoicate with the corpus menu
    newDatum : function(e) {
      if(e){
//        e.stopPropagation(); //cant use stopPropagation, it leaves the dropdown menu open.
        e.preventDefault(); //this stops the link from moving the page to the top
      } 
      appView.datumsEditView.newDatum();
      app.router.showDashboard();
      Utils.debug("CLICK NEW DATUM READ CORPUS VIEW.");
    },
    
    newDataList : function(e) {
      if(e){
//      e.stopPropagation();// cant use stopPropagation, it leaves the dropdown menu open.
        e.preventDefault(); //this stops the link from moving the page to the top
      }
      //take the user to the search so they can create a data list using the search feature.
      window.appView.toastUser("Below is the Advanced Search, this is the easiest way to make a new Data List.","alert-info","How to make a new Data List:");
      app.router.showEmbeddedSearch();
    },
    
    newSession : function(e) {
      if(e){
//      e.stopPropagation();// cant use stopPropagation, it leaves the dropdown menu open.
        e.preventDefault(); //this stops the link from moving the page to the top
      }
      this.model.newSession();
    },
    
    newCorpus : function(e){
      if(e){
//      e.stopPropagation();// cant use stopPropagation, it leaves the dropdown menu open.
        e.preventDefault(); //this stops the link from moving the page to the top
      }
      this.model.newCorpus();
    },
    
     resizeSmall : function(e){
       if(e){
         e.stopPropagation();
         e.preventDefault();
       }
       window.app.router.showDashboard();
    },
    
    resizeFullscreen : function(e){
      Utils.debug("CORPUS READ starts to render fullscreen. " );
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
    }
  });

  return CorpusReadView;
});