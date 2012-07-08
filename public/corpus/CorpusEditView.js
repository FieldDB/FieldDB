define([ 
    "libs/backbone", 
    "libs/handlebars.runtime",
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
    "permission/Permissions",
    "permission/PermissionsView",
    "datum/Sessions",
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
    Permissions,
    PermissionsView,
    Sessions,
    UpdatingCollectionView
) {
  var CorpusReadFullscreenView = Backbone.View.extend(
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
      
      //Create a Permissions View
      this.permissionsView = new PermissionsView({
        collection : this.model.get("permissions")
      });
      
      //Create a Sessions List 
      // this.sessionsView = new SessionsView({
        // collection : this.model.get("sessions")
      // });
      
      // If the model changes, re-render
      this.model.bind('change', this.render, this);
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

//              "click .new_session" : "newSession",
//              "click .show_data_lists" : "showDataLists",
//              "click .show_corpus_details" : "showCorpusDetails",
//              "click .show_sessions" : "showSessions",
//              "click .show_permissions" : "showPermissions",
//              "click .show_corpora" : "showCorpora",
//              "click .import" : "newImport",
//              "click .export" : "showExport"
      
      //Add button inserts new Comment
      "click .add_comment" : 'insertNewComment',
    	
      //Add button inserts new Datum State
      "click .add_datum_state" : 'insertNewDatumState',
      
      //Add button inserts new Datum Field
      "click .add_datum_field" : 'insertNewDatumField',
      "click .icon-resize-small" : 'resizeSmall',
      "click .icon-resize-full" : "resizeFullscreen",
      
      "click .new_datum" : "newDatum"
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
          
          // Display the UpdatingCollectionView
  //        this.dataListsView.render();
          
          // Display the DatumFieldsView
          this.datumFieldsView.el = this.$('.datum_field_settings');
          this.datumFieldsView.render();
          
          // Display the DatumStatesView
          this.datumStatesView.el = this.$('.datum_state_settings');
          this.datumStatesView.render();
          
          // Display the PermissionsView
          this.permissionsView.render();
          
          // Display the SessionsView
          // this.sessionsView.render();
          
        } else {
          Utils.debug("\tCorpus model was undefined.");
        }
      } else if (this.format == "fullscreen") {
        this.setElement($("#corpus-fullscreen"));
        $(this.el).html(this.templateFullscreen(this.model.toJSON()));

        // Display the CommentEditView
        this.commentEditView.el = this.$('.comments');
        this.commentEditView.render();

        // Display the UpdatingCollectionView
        // this.dataListsView.render();

        // Display the DatumFieldsView
        this.datumFieldsView.el = this.$('.datum_field_settings');
        this.datumFieldsView.render();

        // Display the DatumStatesView
        this.datumStatesView.el = this.$('.datum_state_settings');
        this.datumStatesView.render();

        // Display the PermissionsView
        this.permissionsView.render();

        // Display the SessionsView
        // this.sessionsView.render();
      } else if (this.format == "leftSide"){
        this.setElement($("#corpus-quickview"));
        $(this.el).html(this.templateSummary(this.model.toJSON()));
      }
        
      return this;
    },
    
    newDatum : function() {
      appView.datumsView.newDatum();
      app.router.showDashboard();
    },

     //Insert functions associate the values chosen with a new
    // model in the collection, adding it to the collection, which in turn
    // triggers a view thats added to
    // the ul
    
  //This the function called by the add button, it adds a new comment state both to the collection and the model
    insertNewComment : function() {
    	console.log("I'm a new comment!");
      var m = new Comment({
//        "label" : this.$el.children(".comment_input").val(),

      });
      this.model.get("comments").add(m);
    },
    
    // This the function called by the add button, it adds a new datum field both to the 
    // collection and the model
    insertNewDatumField : function() {
      // Remember if the encryption check box was checked
      var checked = this.$el.children(".add_encrypted").is(':checked') ? "checked" : "";
      
      // Create the new DatumField based on what the user entered
      var m = new DatumField({
        "label" : this.$el.children(".choose_add_field").val(),
        "encrypted" : checked,
        "help" : this.$el.children(".add_help").val()
      });

      // Add the new DatumField to the Corpus' list for datumFields
      this.model.get("datumFields").add(m);
      
      // Reset the line with the add button
      this.$el.children(".choose_add_field").children("option:eq(0)").attr("selected", true);
      this.$el.children(".add_help").val("");
    },
    
    //This the function called by the add button, it adds a new datum state both to the collection and the model
    insertNewDatumState : function() {
      var m = new DatumField({
        "state" : this.$el.children(".add_input").val(),
        "color" : this.$el.children(".add_color_chooser").val()
      });
      this.model.get("datumStates").add(m);
    },
    resizeSmall : function(){
      window.app.router.showEmbeddedCorpus();
    },
    resizeFullscreen : function(){
      window.app.router.showFullscreenCorpus();
    },
    showEditable :function(){
      window.app.router.showEditableCorpus();
    },
    showReadonly : function(){
      window.app.router.showReadonlyCorpus();
    }
  });

  return CorpusReadFullscreenView;
});