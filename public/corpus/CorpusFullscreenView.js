define([ 
    "use!backbone", 
    "use!handlebars",
    "text!corpus/corpus_details.handlebars",
    "corpus/Corpus",
    "datum/DatumStates",
    "datum/DatumStatesView",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars,
    corpusDetailsTemplate,
    Corpus,
    DatumStates,
    DatumStatesView
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
        collection : new DatumStates()
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
     * Events that the CorpusView is listening to and their handlers.
     */
    events : {
      "change" : "render",
      "blur .color_chooser" : "alertit",
      "blur .datum_state_input" : "alertit"
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
      } else {
        Utils.debug("\tCorpus model was undefined.");
      }
      
      return this;
    },
    
    /**
     * Initialize the sample Corpus.
     */
    loadSample : function() {
      // Sample Corpus data
      this.model.set({
        "name" : "Quechua Corpus",
        "nameAsUrl": "Quechua_Corpus",
        "description" : "This is a corpus which will let you explore the app and see how it works. "
            + "\nIt contains some data from one of our trips to Cusco, Peru."
      });
    },
    
    alertit: function(){
      alert("clicked in corpus view");
    }
  });

  return CorpusView;
});