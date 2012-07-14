define([ 
    "backbone", 
    "handlebars", 
    "corpus/Corpus",
    "comment/Comment",
    "comment/Comments",
    "comment/CommentEditView",
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
    CommentEditView,
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
    SessionView,
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
      Utils.debug("CORPUS init: " + this.el);
  
      this.changeViewsOfInternalModels();
      this.model.bind('change', this.changeViewsOfInternalModels, this);

    },
    
    events : {
      "click .icon-resize-small" : 'resizeSmall',
      "click .icon-resize-full" : "resizeFullscreen",
      
      //Add button inserts new Comment
      "click .add-comment" : 'insertNewComment',
      
      "click .new_datum_read" : "newDatum",
      "click .icon-edit": "showEditable",
      
      //corpus menu buttons
      "click .new_datum_edit" : "newDatum",
      "click .data-list-embedded" : "newDataList",
      "click .new_session" : "newSession",
      "click .new_corpus" : "newCorpus",
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
    templateFullscreen : Handlebars.templates.corpus_read_fullscreen,
    
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
      Utils.debug("CORPUS render: " + this.el);
      if (this.model == undefined) {
        Utils.debug("\tCorpus model was undefined.");
        return this;
      }
      if (this.format == "leftSide") {
          // Display the CorpusReadView
          this.setElement($("#corpus-quickview"));
          $(this.el).html(this.templateSummary(this.model.toJSON()));
      } else if (this.format == "link") {
        // Display the CorpusGlimpseView, dont set the element
        $(this.el).html(this.templateLink(this.model.toJSON()));
        
      } else if (this.format == "fullscreen"){
        this.setElement($("#corpus-fullscreen")); 
        $(this.el).html(this.templateFullscreen(this.model.toJSON()));
        

        // Display the CommentEditView
        this.commentEditView.el = this.$('.comments');
        this.commentEditView.render();

        
        // Display the UpdatingCollectionView
        //        this.dataListsView.render();
     
        // Display the DatumFieldsView
        this.datumFieldsView.el = this.$('.datum_field_settings');
        this.datumFieldsView.render();
        
        // Display the DatumStatesView
        this.datumStatesView.el = this.$('.datum_state_settings');
        this.datumStatesView.render();

        // Display the DataListsView
        this.dataListsView.el = this.$('.datalists'); 
        this.dataListsView.render();
         
        // Display the SessionsView
        this.sessionsView.el = this.$('.sessions'); 
        this.sessionsView.render();
        
        // Display the PermissionsView
        this.permissionsView.el = this.$('.permissions');
        this.permissionsView.render();

        // Display the SessionsView
        // this.sessionsView.render(); 
        
        

      } else if (this.format == "centreWell"){
        this.setElement($("#corpus-embedded"));
        $(this.el).html(this.templateCentreWell(this.model.toJSON()));
        
        // Display the UpdatingCollectionView
        //        this.dataListsView.render();

        // Display the CommentEditView
        this.commentEditView.el = this.$('.comments');
        this.commentEditView.render();
        
        // Display the DatumFieldsView
        this.datumFieldsView.el = this.$('.datum_field_settings');
        this.datumFieldsView.render();

        // Display the DatumStatesView
        this.datumStatesView.el = this.$('.datum_state_settings');
        this.datumStatesView.render();

        // Display the DataListsView
        this.dataListsView.el = this.$('.datalists'); 
        this.dataListsView.render();
         
        // Display the SessionsView
        this.sessionsView.el = this.$('.sessions'); 
        this.sessionsView.render();
        
        // Display the PermissionsView
        this.permissionsView.el = this.$('.permissions');
        this.permissionsView.render();


      }
      

      return this;
    },
    changeViewsOfInternalModels : function(){
      //Create a CommentEditView     
      this.commentEditView = new UpdatingCollectionView({
        collection           : this.model.get("comments"),
        childViewConstructor : CommentEditView,
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
      
      //Create a Permissions View
      this.permissionsView = new UpdatingCollectionView({
        collection : this.model.get("permissions"),
        childViewConstructor : PermissionReadView,
        childViewTagName     : 'li',
      });
      
      //Create a Sessions List 
       this.sessionsView = new UpdatingCollectionView({
         collection : this.model.get("sessions"),
         childViewConstructor : SessionView,
         childViewTagName     : 'li',
         childViewFormat      : "link"  
       });
      
    },
    //Functions assoicate with the corpus menu
    newDatum : function() {
      appView.datumsView.newDatum();
      app.router.showDashboard();
    },
    
    newDataList : function() {
      app.router.showMiddleDataList();
    },
    
    newSession : function() {
      app.router.showEmbeddedSession();
      app.router.showEditableSession();
     
    },
    
    newCorpus : function(){
      app.router.showEmbeddedCorpus();
      app.router.showEditableCorpus();
     
    },
    
    //TODO this function needs to mean "save" ie insert new comment in the db, not add an empty comment on the screen. 
//  this a confusion of the pattern in the datumfilds view where exsting fields are in the  updating collection (just 
//  like extisting comments are in the updating collection) and there is a blank one in the 
//  corpus_edit_embedded corpus_edit_fullscreen handlebars

  //This the function called by the add button, it adds a new comment state both to the collection and the model
  insertNewComment : function() {
    var m = new Comment({
  //      "label" : this.$el.children(".comment_input").val(),
   });
    this.model.get("comments").add(m);
  },
    
    
     resizeSmall : function(){
      window.app.router.showEmbeddedCorpus();
    },
    
    resizeFullscreen : function(){
      window.app.router.showFullscreenCorpus();
    } ,
       
    newDatum : function(e) {
      appView.datumsView.newDatum();
      app.router.showDashboard();
    },
    //This is bound to the little pencil function
    showEditable :function(){
      window.app.router.showEditableCorpus();
    }
  });

  return CorpusReadView;
});