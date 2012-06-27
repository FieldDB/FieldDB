define([ 
    "use!backbone", 
    "use!handlebars", 
    "text!corpus/corpus_read_embedded.handlebars",
    "corpus/Corpus",
    "lexicon/LexiconView",
    "glosser/GlosserView",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars, 
    corpusReadEmbeddedTemplate,
    Corpus,
    LexiconView,
    GlosserView
) {
  var CorpusReadEmbeddedView = Backbone.View.extend(
  /** @lends CorpusReadEmbeddedView.prototype */
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
      Utils.debug("CORPUS init: " + this.el);
      

      // If the model changes, re-render 
      this.model.bind('change', this.render, this);
    },

    /**
     * The underlying model of the CorpusReadEmbeddedView is a Corpus.
     */    
    model : Corpus,


    // TODO Should LexiconView really be here?
    lexicon : LexiconView,

    // TODO Should LexiconView really be here?
    glosser : GlosserView,

    /**
     * The Handlebars template rendered as the CorpusReadEmbeddedView.
     */
    template : Handlebars.compile(corpusReadEmbeddedTemplate),

    /**
     * Renders the CorpusReadEmbeddedView and all of its child Views.
     */
    render : function() {
      Utils.debug("CORPUS render: " + this.el);
      if (this.model != undefined) {
        // Display the CorpusReadEmbeddedView
        this.setElement($("#corpus-read-embedded"));
        $(this.el).html(this.template(this.model.toJSON()));

      } else {
        Utils.debug("\tCorpus model was undefined.");
      }
      

     return this;
    },
    
  

  });

  return CorpusReadEmbeddedView;
});