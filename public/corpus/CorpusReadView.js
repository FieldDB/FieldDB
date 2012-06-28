define([ 
    "use!backbone", 
    "use!handlebars", 
    "text!corpus/corpus_read_embedded.handlebars",
    "text!corpus/corpus_read_link.handlebars",
    "text!corpus/corpus_summary_read_embedded.handlebars",
    "corpus/Corpus",
    "lexicon/LexiconView",
    "glosser/GlosserView",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars, 
    corpusReadEmbeddedTemplate,
    corpusReadLinkTemplate,
    corpusReadSummaryTemplate,
    Corpus,
    LexiconView,
    GlosserView
) {
  var CorpusReadView = Backbone.View.extend(
  /** @lends CorpusReadView.prototype */
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
    events : {
      "click .icon-resize-small" : 'resizeSmall',
      "click .icon-resize-full" : "resizeFullscreen"
    },
    /**
     * The underlying model of the CorpusReadView is a Corpus.
     */    
    model : Corpus,


    // TODO Should LexiconView really be here?
    lexicon : LexiconView,

    // TODO Should LexiconView really be here?
    glosser : GlosserView,

    /**
     * The Handlebars template rendered as the CorpusReadView.
     */
    template : Handlebars.compile(corpusReadEmbeddedTemplate),
    
    /**
     * The Handlebars template rendered as the CorpusReadLinkView.
     */
    templateLink: Handlebars.compile(corpusReadLinkTemplate),
    
    /**
     * The Handlebars template rendered as the CorpusSummaryReadView.
     */
    templateSummary : Handlebars.compile(corpusReadSummaryTemplate),

    /**
     * Renders the CorpusReadView and all of its child Views.
     */
    render : function() {
      Utils.debug("CORPUS render: " + this.el);
      
      if (this.format == "leftWell") {
        if (this.model != undefined) {
          // Display the CorpusReadView
          this.setElement($("#corpus-quickview"));
          $(this.el).html(this.templateSummary(this.model.toJSON()));
  
        } else {
          Utils.debug("\tCorpus model was undefined.");
        }
      } else if (this.format == "link") {
        // Display the CorpusGlimpseView
        $(this.el).html(this.templateLink(this.model.toJSON()));
      }

      return this;
    },
    resizeSmall : function(){
      window.app.router.showEmbeddedCorpus();
    },
    resizeFullscreen : function(){
      window.app.router.showFullscreenCorpus();
    }
  });

  return CorpusReadView;
});