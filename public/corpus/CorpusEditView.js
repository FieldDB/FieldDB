define([ 
    "backbone", 
    "handlebars",
    "corpus/Corpus",
    "comment/Comment",
    "comment/Comments",
    "comment/CommentEditView",
    "data_list/DataLists",
    "data_list/DataListReadView",
    "datum/DatumField",
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
    DatumField,
    DatumFieldEditView,
    DatumState,
    DatumStates,
    DatumStateEditView,
    Permission,
    Permissions,
    PermissionEditView,
    Session,
    Sessions,
    SessionView,
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
     * "fullscreen" and "leftSide"
     * 
     * @description Starts the Corpus and initializes all its children.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("CORPUS DETAILS init: " + this.el);
      this.changeViewsOfInternalModels();
     
      
      // If the model changes, re-render
      this.model.bind('change', this.showEditable, this);
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
      "click .add-comment" : 'insertNewComment',
    	
      //Add button inserts new Datum State
      "click .add_datum_state" : 'insertNewDatumState',
      
      //Add button inserts new Datum Field
      "click .add_datum_field" : 'insertNewDatumField',
      "click .icon-resize-small" : 'resizeSmall',
      "click .icon-resize-full" : "resizeFullscreen",
      
      //corpus menu buttons
      "click .new_datum_edit" : "newDatum",
      "click .data-list-embedded" : "newDataList",
      "click .new_session" : "newSession",
      "click .new_corpus" : "newCorpus",
      
      //text areas in the edit view
      "blur .corpus-title-input" : "updateTitle",
      "blur .corpus-description-input" : "updateDescription",
        
      "click .save-corpus" : "updatePouch",
      "blur .save-corpus-blur" : "updatePouch"
    },

    /**
     * The Handlebars template rendered as the CorpusFullscreenView.
     */
    templateFullscreen : Handlebars.templates.corpus_edit_fullscreen,
    
    /**
     * The Handlebars template rendered as the CorpusWellView.
     */
    templateCentreWell : Handlebars.templates.corpus_edit_embedded,
    
    /**
     * The Handlebars template rendered as the Summary
     */
    templateSummary : Handlebars.templates.corpus_summary_edit_embedded,
    
    /**
     * Renders the CorpusReadFullScreenView and all of its child Views.
     */
    render : function() {
      if (this.format == "centreWell") {
        Utils.debug("CORPUS READ FULLSCREEN render: " + this.el);
        if (this.model != undefined) {
          // Display the CorpusReadFullScreenView
          this.setElement($("#corpus-embedded"));
          $(this.el).html(this.templateCentreWell(this.model.toJSON()));
          
          // Display the CommentEditView
          this.commentEditView.el = this.$('.comments');
          this.commentEditView.render();
          
          // Display the DataListsView
         this.dataListsView.el = this.$('.datalists'); 
         this.dataListsView.render();
          
         // Display the SessionsView
         this.sessionsView.el = this.$('.sessions'); 
         this.sessionsView.render();
         
         // Display the PermissionsView
         this.permissionsView.el = this.$('.permissions');
         this.permissionsView.render();
         
          // Display the DatumFieldsView
          this.datumFieldsView.el = this.$('.datum_field_settings');
          this.datumFieldsView.render();
          
          // Display the DatumStatesView
          this.datumStatesView.el = this.$('.datum_state_settings');
          this.datumStatesView.render();
   
        } else {
          Utils.debug("\tCorpus model was undefined.");
        }
      } else if (this.format == "fullscreen") {
        this.setElement($("#corpus-fullscreen"));
        $(this.el).html(this.templateFullscreen(this.model.toJSON()));

        // Display the CommentEditView
        this.commentEditView.el = this.$('.comments');
        this.commentEditView.render();
        
        // Display the DataListsView
        this.dataListsView.el = this.$('.datalists-updating-collection'); 
        this.dataListsView.render();
        
        // Display the SessionsView
        this.sessionsView.el = this.$('.sessions-updating-collection'); //TODO do not use such ambiguous class names, compare this with datum_field_settings below.  there is a highlyily hood that the sesson module will be using the same class name and will overwrite your renders.
        this.sessionsView.render();
        
        // Display the PermissionsView
        this.permissionsView.el = this.$('.permissions-updating-collection');
        this.permissionsView.render();


        // Display the DatumFieldsView
        this.datumFieldsView.el = this.$('.datum_field_settings');
        this.datumFieldsView.render();

        // Display the DatumStatesView
        this.datumStatesView.el = this.$('.datum_state_settings');
        this.datumStatesView.render();

      } else if (this.format == "leftSide"){
        this.setElement($("#corpus-quickview"));
        $(this.el).html(this.templateSummary(this.model.toJSON()));
      }else {
        throw("You have not specified a format that the CorpusEditView can understand.");
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
        childViewConstructor : PermissionEditView,
        childViewTagName     : 'li',
      });
      
      //Create a Sessions List 
       this.sessionsView = new UpdatingCollectionView({
         collection : this.model.get("sessions"),
         childViewConstructor : SessionView,
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
          
      // Create a DatumStatesView    
      this.datumStatesView = new UpdatingCollectionView({
        collection           : this.model.get("datumStates"),
        childViewConstructor : DatumStateEditView,
        childViewTagName     : 'li',
        childViewFormat      : "corpus"
      });
      
    },
    
    updateTitle: function(){
      this.model.set("title",this.$el.find(".corpus-title-input").val());
    },
    
    updateDescription: function(){
      this.model.set("description",this.$el.find(".corpus-description-input").val());
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
      $("#session-modal").modal("show");
      //Save the current session just in case
      window.app.get("currentSession").save();
      //Clone it and send its clone to the session modal so that the users can modify the fields and then change their mind, wthout affecting the current session.
      window.appView.sessionModalView.model = window.app.get("currentSession").clone();
      //Give it a null id so that pouch will save it as a new model.
      //WARNING this might not be a good idea, if you find strange side effects in sessions in the future, it might be due to this way of creating (duplicating) a session.
      window.appView.sessionModalView.model.id = undefined;
      window.appView.sessionModalView.model.rev = undefined;
      window.appView.sessionModalView.model.set("_id", undefined);
      window.appView.sessionModalView.model.set("_rev", undefined);
      window.appView.sessionModalView.render();
    },
    
    newCorpus : function(){
      app.router.showEmbeddedCorpus();
      app.router.showEditableCorpus();
     
    },
    
    

     //Insert functions associate the values chosen with a new
    // model in the collection, adding it to the collection, which in turn
    // triggers a view thats added to
    // the ul
    
    //TODO this function needs to mean "save" ie insert new comment in the db, not add an empty comment on the screen. 
//    this a confusion of the pattern in the datumfilds view where exsting fields are in the  updating collection (just 
//    like extisting comments are in the updating collection) and there is a blank one in the 
//    corpus_edit_embedded corpus_edit_fullscreen handlebars

    //This the function called by the add button, it adds a new comment state both to the collection and the model
    insertNewComment : function() {
      var m = new Comment({
//        "label" : this.$el.children(".comment_input").val(),
     });
      this.model.get("comments").add(m);
    },
    
    // This the function called by the add button, it adds a new datum field both to the 
    // collection and the model
    insertNewDatumField : function() {
      // Remember if the encryption check box was checked
      var checked = this.$el.find(".add_encrypted").is(':checked') ? "checked" : "";
      
      // Create the new DatumField based on what the user entered
      var m = new DatumField({
        "label" : this.$el.find(".choose_add_field").val().toLowerCase().replace(/ /g,"_"),
        "encrypted" : checked,
        "help" : this.$el.find(".add_help").val()
      });

      // Add the new DatumField to the Corpus' list for datumFields
      this.model.get("datumFields").add(m);
      
      // Reset the line with the add button
      this.$el.find(".choose_add_field").val("");//.children("option:eq(0)").attr("selected", true);
      this.$el.find(".add_help").val("");
    },
    
    //This the function called by the add button, it adds a new datum state both to the collection and the model
    insertNewDatumState : function() {
      var m = new DatumField({
        "state" : this.$el.find(".add_input").val(),
        "color" : this.$el.find(".add_color_chooser").val()
      });
      this.model.get("datumStates").add(m);
    },
    resizeSmall : function(){
      window.app.router.showEmbeddedCorpus();
    },
    resizeFullscreen : function(){
      window.app.router.showFullscreenCorpus();
    },
    //This is the function that is  bound to the book button
    showReadonly : function(){
      window.app.router.showReadonlyCorpus();
    },
    //This is the function that is bound to changes
    showEditable :function(){
      //If the model has changed, then change the views of the internal models because they are no longer connected with this corpus's models
      this.changeViewsOfInternalModels();
      window.appView.renderEditableCorpusViews();
    },
    updatePouch : function() {
      Utils.debug("Saving the Corpus");
      var self = this;
      this.model.changeCorpus(this.model.get("corpusname"),function(){
        self.model.save();
      });
    },  
  });

  return CorpusEditView;
});