define([ 
    "backbone", 
    "handlebars", 
    "corpus/CorpusMask",
    "OPrime"
], function(
    Backbone, 
    Handlebars, 
    CorpusMask
) {
  var CorpusLinkView = Backbone.View.extend(
  /** @lends CorpusLinkView.prototype */
  {
    /**
     * @class This is the corpus linkview. It contains only as CorpusMask and is a much reduced version of the CorpusReadView
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      if (OPrime.debugMode) OPrime.debug("CORPUS LINK init: " );
   
      // If the model's title changes, chances are its a new corpus, re-render its internal models.
      this.model.bind('change:title', function(){
        this.render();
      }, this);
      
    },
    events : {
    },
    
    /**
     * The underlying model of the CorpusLinkView is a Corpus.
     */    
    model : CorpusMask,

    /**
     * The Handlebars template rendered as the CorpusLinkLinkView.
     */
    templateLink: Handlebars.templates.corpus_read_link,
    
    /**
     * Renders the CorpusLinkView and all of its child Views.
     */
    render : function() {
      if (OPrime.debugMode) OPrime.debug("CORPUS LINK render: ");

      if (this.model == undefined) {
        if (OPrime.debugMode) OPrime.debug("\tCorpusMask model was undefined.");
        return this;
      }
      var jsonToRender = this.model.toJSON();
      jsonToRender.corpusid = this.model.corpusid;
//      try{
//        jsonToRender.username = this.model.get("team").get("username");
//      }catch(e){
//        if (OPrime.debugMode) OPrime.debug("Problem getting the username of the corpus' team");
//      }

      $(this.el).html(this.templateLink(jsonToRender));

      return this;
    }
  });

  return CorpusLinkView;
});