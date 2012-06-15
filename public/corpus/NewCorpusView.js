define([ 
    "use!backbone", 
    "use!handlebars", 
    "text!corpus/new_corpus.handlebars",
    "corpus/Corpus",
    "data_list/DataList",
    "data_list/DataListView",
    "preference/Preference",
    "preference/PreferenceView",
    "datum/Session",
    "datum/SessionView",
    "lexicon/LexiconView",
    "glosser/GlosserView",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars, 
    new_corpusTemplate, 
    Corpus,
    DataList,
    DataListView,
    Preference,
    PreferenceView,
    Session,
    SessionView,
    LexiconView,
    GlosserView
) {
  var NewCorpusView = Backbone.View.extend(
  /** @lends CorpusView.prototype */
  {
    /**
     * @class This is the corpus view. To the user it looks like a
     *        Navigation panel on the main dashboard screen, which
     *        displays a menu of things the User can do (ex. open a new
     *        session, browse all entries, etc.).
     * 
     * @property {Import} importer The importer is an Importer object
     *           which attaches itself to the document page on Chrome
     *           Extensions and non-mobile browsers to listen to drag
     *           and drop events and attempt to import the contents of
     *           the dragged and dropped files. On android the app will
     *           have to import data via the menus.
     * 
     * @description Starts the Corpus and initializes all its children.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("CORPUS init: " + this.el);
      
      // Create a PreferenceView
      this.preferenceView = new PreferenceView({
        model : new Preference()
      });
      
      // Create a SessionView
      this.sessionView = new SessionView({
        model : new Session()
      });
      
      this.model.bind('change', this.render, this);
    },

    /**
     * The underlying model of the CorpusView is a Corpus.
     */    
    model : Corpus,
    
    /**
     * The preferenceView is a child of the CorpusView.
     */
    preferenceView : PreferenceView,

    /**
     * The sessionView is a child of the CorpusView.
     */
    sessionView : SessionView,

    // TODO Should LexiconView really be here?
    lexicon : LexiconView,

    // TODO Should LexiconView really be here?
    glosser : GlosserView,
    
    /**
     * Events that the CorpusView is listening to and their handlers.
     */
    events : {
      "change" : "render",
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
     * The Handlebars template rendered as the CorpusView.
     */
    template : Handlebars.compile(new_corpusTemplate),

    /**
     * Renders the CorpusView and all of its child Views.
     */
    render : function() {
      Utils.debug("CORPUS render: " + this.el);
      if (this.model != undefined) {
        // Display the CorpusView
        this.setElement($("#new-corpus"));
        $(this.el).html(this.template(this.model.toJSON()));
        
        // Display the PreferenceView
        this.preferenceView.render();
        
        // Display the SessionView
        this.sessionView.render();
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
        "name" : "Sample Quechua Corpus",
        "description" : "This is a corpus which will let you explore the app and see how it works. "
            + "\nIt contains some data from one of our trips to Cusco, Peru."
      });
      
      this.sessionView.loadSample(this.model);
    }
  });

  return NewCorpusView;
});