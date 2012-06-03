define([ "use!backbone","use!handlebars", "text!corpus/corpus.handlebars", "corpus/Corpus" ],
    function(Backbone, Handlebars, corpusTemplate, Corpus) {
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
          this.bind('change', this.render, this);
          this.render();
        },
       model: Corpus,
       template : Handlebars.compile(corpusTemplate),
       el : '#corpus',

       render: function(){
         $(this.el).html(this.template(this.model.toJSON()));
         console.log("rendering corpus: " +this.model.get("name"));
         return this;
       }
      

      });
      
      return CorpusView;
    });