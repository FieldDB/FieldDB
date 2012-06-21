define([ 
    "use!backbone", 
    "use!handlebars",
    "text!corpus/corpus_details.handlebars",
    "corpus/Corpus",
    "comment/Comment",
    "comment/Comments",
    "comment/CommentView",
    "data_list/DataLists",
    "data_list/DataListsView",
    "datum/DatumField",
    "datum/DatumFields",
    "datum/DatumFieldEditView",
    "datum/DatumState",
    "datum/DatumStates",
    "datum/DatumStateEditView",
    "permission/Permissions",
    "permission/PermissionsView",
    "datum/Sessions",
    "datum/SessionsView",
    "app/UpdatingCollectionView",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars,
    corpusDetailsTemplate,
    Corpus,
    Comment,
    Comments,
    CommentView,
    DataLists,
    DataListsView,
    DatumField,
    DatumFields,
    DatumFieldEditView,
    DatumState,
    DatumStates,
    DatumStateEditView,
    Permissions,
    PermissionsView,
    Sessions,
    SessionsView,
    UpdatingCollectionView
) {
  var CorpusView = Backbone.View.extend(
  /** @lends CorpusView.prototype */
  {
    /**
     * @class This is the corpus view. To the user it looks like a
     *        Navigation panel on the main dashboard screen, which
     *        displays a menu of things the User can do (ex. open a new
     *        session, browse all entries, etc.).
     * 
     * 
     * @description Starts the Corpus and initializes all its children.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("CORPUS DETAILS init: " + this.el);
      
      //Create a CommentView     
      this.commentView = new UpdatingCollectionView({
        collection           : this.model.get("comments"),
        childViewConstructor : CommentView,
        childViewTagName     : 'li'
      });
      
      //Create a DataList List
      this.dataListsView = new DataListsView({
        collection : this.model.get("dataLists")
      });

      //Create a DatumFieldsView     
      this.datumFieldsView = new UpdatingCollectionView({
        collection           : this.model.get("datumFields"),
        childViewConstructor : DatumFieldEditView,
        childViewTagName     : 'li'
      });
          
      // Create a DatumStatesView    
      this.datumStatesView = new UpdatingCollectionView({
        collection           : this.model.get("datumStates"),
        childViewConstructor : DatumStateEditView,
        childViewTagName     : 'li'
      });
      
      //Create a Permissions View
      this.permissionsView = new PermissionsView({
        collection : this.model.get("permissions")
      });
      
      //Create a Sessions List 
      this.sessionsView = new SessionsView({
        collection : this.model.get("sessions")
      });
      
      // If the model changes, re-render
      this.model.bind('change', this.render, this);
    },

    /**
     * The underlying model of the CorpusView is a Corpus.
     */    
    model : Corpus,
    /**
     * The CommentView is a child of the CorpusView.
     */
    commentView : CommentView,
    /**
     * The DataListsView is a child of the CorpusView.
     */
    dataListsView : DataListsView,
    /**
     * The DatumFieldsView is a child of the CorpusView.
     */
    datumFieldsView : UpdatingCollectionView, 
    /**
     * The datumStatesView is a child of the CorpusView.
     */
    datumStatesView : UpdatingCollectionView,
    /**
     * The PermissionsView is a child of the CorpusView.
     */
    permissionsView : PermissionsView,
    /**
     * The SessionsView is a child of the CorpusView.
     */
    sessionsView : SessionsView,
   
    /**
     * Events that the CorpusView is listening to and their handlers.
     */
    events : {
//              "click .new_datum" : "newDatum",
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
      "click .add_datum_field" : 'insertNewDatumField'
    },

    /**
     * The Handlebars template rendered as the CorpusFullscreenView.
     */
    template : Handlebars.compile(corpusDetailsTemplate),
    
    /**
     * Renders the CorpusView and all of its child Views.
     */
    render : function() {
      Utils.debug("CORPUS DETAILS render: " + this.el);
      if (this.model != undefined) {
        // Display the CorpusView
        this.setElement($("#corpus-details-view"));
        $(this.el).html(this.template(this.model.toJSON()));
        
        // Display the CommentView
        this.commentView.render();
        
        // Display the DataListsView
        this.dataListsView.render();
        
        // Display the DatumFieldsView
        this.datumFieldsView.el = this.$('.datum_fields_settings');
        this.datumFieldsView.render();
        
        // Display the DatumStatesView
        this.datumStatesView.el = this.$('.datum_state_settings');
        this.datumStatesView.render();
        
        // Display the PermissionsView
        this.permissionsView.render();
        
        // Display the SessionsView
        this.sessionsView.render();
        
      } else {
        Utils.debug("\tCorpus model was undefined.");
      }
      
      return this;
    },

     //Insert functions associate the values chosen with a new
    // model in the collection, adding it to the collection, which in turn
    // triggers a view thats added to
    // the ul
    
  //This the function called by the add button, it adds a new comment state both to the collection and the model
    insertNewComment : function() {
      var m = new Comment({
        "state" : this.$el.children(".add_input").val(),
        "color" : this.$el.children(".add_color_chooser").val()
      });
      this.model.get("comment").add(m);
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

      // Add the new DatumField to the Corpus' list fo datumFields
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
    
  });

  return CorpusView;
});