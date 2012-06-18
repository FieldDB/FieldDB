define([ 
    "use!backbone", 
    "use!handlebars",
    "text!corpus/corpus_details.handlebars",
    "corpus/Corpus",
    "data_list/DataLists",
    "data_list/DataListsView",
    "datum/DatumStates",
    "datum/DatumStatesView",
    "permission/Permissions",
    "permission/PermissionsView",
    "datum/Sessions",
    "datum/SessionsView",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars,
    corpusDetailsTemplate,
    Corpus,
    DataLists,
    DataListsView,
    DatumStates,
    DatumStatesView,
    Permissions,
    PermissionsView,
    Sessions,
    SessionsView
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
      
      // Create a DatumStatesView
      this.datumStatesView = new DatumStatesView({
        collection : this.model.get("datumStates")
      });
      
      this.sessionsView = new SessionsView({
        collection : this.model.get("sessions")
      });
      
      this.dataListsView = new DataListsView({
        collection : this.model.get("dataLists")
      });
      
      
      this.permissionsView = new PermissionsView({
        collection : this.model.get("permissions")
      });
      
      
      // If the model changes, re-render
      this.model.bind('change', this.render, this);
    },

    /**
     * The underlying model of the CorpusView is a Corpus.
     */    
    model : Corpus,
    
    /**
     * The datumStatesView is a child of the CorpusView.
     */
    datumStatesView : DatumStatesView,
    
    /**
     * The SessionsView is a child of the CorpusView.
     */
    sessionsView : SessionsView,
    /**
     * The DataListsView is a child of the CorpusView.
     */
    dataListsView : DataListsView,
    /**
    * The PermissionssView is a child of the CorpusView.
    */
   permissionsView : PermissionsView,
   
    
    
    
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
        
        // Display the DatumStatesView
        this.datumStatesView.render();
        
        // Display the SessionsView
        this.sessionsView.render();
        
        // Display the DataListsView
        this.dataListsView.render();
        
        // Display the PermissionsView
        this.permissionsView.render();
        
      } else {
        Utils.debug("\tCorpus model was undefined.");
      }
      
      return this;
    }
  });

  return CorpusView;
});