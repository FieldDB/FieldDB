define( [
    "use!backbone", 
    "use!handlebars", 
    "text!corpus/corpus_glimpse.handlebars",
    "corpus/Corpus"
], function(
    Backbone, 
    Handlebars, 
    corpusTemplate,
    Corpus
) {
  var CorpusGlimpseView = Backbone.View.extend(
  /** @lends CorpusGlimpseView.prototype */
  {
    /**
     * @class The corpus glimpse view is a quick view of the corpus to be used
     *        in Corpus collections and elsewhere as appropriate.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("CORPUS GLIMPSE init");
      
      // If the model changes, re-render
      this.model.bind('change', this.render, this);
    },
    
    /**
     * The underlying model of the CorpusGlimpseView is a Corpus.
     */
    model : Corpus,
    
    /**
     * The Handlebars template rendered as the CorpusGlimpseView.
     */
    template: Handlebars.compile(corpusTemplate),
      
    /**
     * Renders the CorpusGlimpseView.
     */
    render : function() {
      Utils.debug("CORPUS GLIMPSE render");
      
      // Display the CorpusGlimpseView
      $(this.el).html(this.template(this.model.toJSON()));
      
      return this;
    }
   
  });

  return CorpusGlimpseView;
}); 
