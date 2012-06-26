define( [
    "use!backbone", 
    "use!handlebars", 
    "text!corpus/corpus_read_link.handlebars",
    "corpus/Corpus"
], function(
    Backbone, 
    Handlebars, 
    corpusReadLinkTemplate,
    Corpus
) {
  var CorpusReadLinkView = Backbone.View.extend(
  /** @lends CorpusReadLinkView.prototype */
  {
    /**
     * @class The corpus read link view is a quick view of the corpus to be used
     *        in Corpus collections and elsewhere as appropriate.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("CORPUS READ LINK init");
      
      // If the model changes, re-render
      this.model.bind('change', this.render, this);
    },
    
    /**
     * The underlying model of the CorpusReadLinkView is a Corpus.
     */
    model : Corpus,
    
    /**
     * The Handlebars template rendered as the CorpusReadLinkView.
     */
    template: Handlebars.compile(corpusReadLinkTemplate),
      
    /**
     * Renders the CorpusGlimpseView.
     */
    render : function() {
      Utils.debug("CORPUS READ LINK render");
      
      // Display the CorpusGlimpseView
      $(this.el).html(this.template(this.model.toJSON()));
      
      return this;
    }
   
  });

  return CorpusReadLinkView;
}); 
