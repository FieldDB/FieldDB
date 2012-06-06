define([ 
    "use!backbone", 
    "use!handlebars", 
    "text!corpus/corpus.handlebars",
    "corpus/Corpus",
    "data_list/DataList",
    "data_list/DataListView",
    "preference/Preference",
    "preference/PreferenceView",
    "lexicon/LexiconView",
    "glosser/GlosserView",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars, 
    corpusTemplate, 
    Corpus,
    DataList,
    DataListView,
    Preference,
    PreferenceView,
    LexiconView,
    GlosserView
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
      })
    },

    /**
     * The underlying model of the CorpusView is a Corpus.
     */    
    model : Corpus,
    
    /**
     * The preferenceView is a child of the CorpusView.
     */
    preferenceView : PreferenceView,

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
      // "click .sync" : "replicateDatabase"
    },

    /**
     * The Handlebars template rendered as the CorpusView.
     */
    template : Handlebars.compile(corpusTemplate),

    /**
     * Renders the CorpusView and all of its child Views.
     */
    render : function() {
      Utils.debug("CORPUS render: " + this.el);
      if (this.model != undefined) {
        // Display the CorpusView
        this.setElement($("#corpus"));
        $(this.el).html(this.template(this.model.toJSON()));
        
        // Display the PreferenceView
        this.preferenceView.render();
      } else {
        Utils.debug("\tCorpus model was undefined.");
      }
      
      return this;
    },
    
    /**
     * 
     */
    // TODO Describe the loadSample function.
    loadSample : function() {
      // Sample Corpus data
      this.model.set("name", "Sample Quechua Corpus");
      this.model
          .set(
              "description",
              "This is a corpus which will let you explore the app and see how it works. "
                  + "\nIt contains some data from one of our trips to Cusco, Peru.");
      
      // Sample Session data
      this.sessionView = new SessionView({
        model : new Session({
          user : "sapir",
          informant : "Tillohash",
          corpus : this.model,
          language : "Cusco Quechua",
          goal : "Working on naya"
        })
      });
      
      // Sample Authentication data
      this.authView.loadSample();
      
      // Same Search data
      // this.searchView.loadSample();
    },

    /**
     * Replicates the PouchDB associated with app.datumList to the IrisCouch CouchDB.
     */
    replicateDatabase : function() {
      app.datumList.pouch(function(err, db) {
        db.replicate.to(Utils.couchUrl, { continuous: false }, function(err, resp) {
          Utils.debug("Replicate to");
          Utils.debug(resp);
          Utils.debug(err);
        });
        db.replicate.from(Utils.couchUrl, { continuous: false }, function(err, resp) {
          Utils.debug("Replicate from");
          Utils.debug(resp);
          Utils.debug(err);
        });
      });
    }
  });

  return CorpusView;
});