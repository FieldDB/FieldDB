define([ "use!backbone", "use!handlebars", "text!corpus/corpus.handlebars",
    "corpus/Corpus" ], function(Backbone, Handlebars, corpusTemplate, Corpus) {
  var CorpusView = Backbone.View.extend(
  /** @lends CorpusView.prototype */
  {
    /**
     * @class This is the corpus view. TBA 
     * 
     * @extends Backbone.View
     * @constructs
     */

    initialize : function() {
//      if(this.model != undefined){
//        this.model.bind("change", this.render);
//      }
      this.on('all', function(e) {
        this.render();
      });
      this.render();
    },
    events : {
      "click" : "render",
      "change" : "render"
    },
    model : Corpus,
    template : Handlebars.compile(corpusTemplate),
    el : '#corpus',

    render : function() {
      $(this.el).html(this.template(this.model.toJSON()));
      console.log("\trendering corpus: " + this.model.get("name"));
      return this;
    }

  });

  return CorpusView;
});