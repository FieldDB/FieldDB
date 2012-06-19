define([
    "use!backbone", 
    "use!handlebars", 
    "corpus/Corpus",
    "corpus/Corpuses",
    "corpus/CorpusGlimpseView",
    "text!corpus/corpuses.handlebars",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars,
    Corpus,
    Corpuses,
    CorpusGlimpseView,
    corpusesTemplate
) {
  var CorpusesView = Backbone.View.extend(
  /** @lends CorpusesView.prototype */
  {
    /**
     * @class CorpusesView is for rendering a Corpuses collection. This is used
     *        on the User's page if they want to browse corpus, and in the
     *        Search settings so they can search
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("CorpusesView init: " + this.el);
      // Bind the functions 'add' and 'remove' to the view. 
      _(this).bindAll('add', 'remove');
   
      // Add each Corpus to the view
      this.collection.each(this.add);
   
      // Bind this view to the add and remove events of the collection
      this.collection.bind('add', this.add);
      this.collection.bind('remove', this.remove);
    },
    
    /**
     * The CorpusGlimpseViews array holds all of the children of the
     * CorpusesView.
     */
    CorpusGlimpseViews : [],
    
    /**
     * The Handlebars template rendered as the CorpusesView.
     */
    template : Handlebars.compile(corpusesTemplate),

    /**
     * Renders the CorpusesView and all of its child Views.
     */
    render : function() {
      this._rendered = true;
      Utils.debug("CorpusesView render: ");
      
      this.setElement(".corpora");
      var jsonToRender = {title: "Corpora"};
      $(this.el).html(this.template(jsonToRender));
      
      // Render each Corpus View and append them.
      _(this.CorpusGlimpseViews).each(function(dv) {
        $('.glimpse_corpora').append(dv.render().el);
        dv.delegateEvents();
      });

      return this;
    },
    
    add : function(d) {
      // We create an updating CorpusGlimpseView for each Corpus that is added.
      var dv = new CorpusGlimpseView({
        tagName : 'li',
        className : 'corpus_li',
        model : d
      });
   
      // And add it to the collection so that it's easy to reuse.
      this.CorpusGlimpseViews.push(dv);
   
      // If the view has been rendered, then
      // we immediately append the rendered Corpus.
      if (this._rendered) {
        $('.glimpse_corpora').append(dv.render().el);
      }
    },
    
    remove : function(model) {
      var viewToRemove = _(this.CorpusGlimpseViews).select(function(cv) { return cv.model === model; })[0];
      this.CorpusGlimpseViews = _(this.CorpusGlimpseViews).without(viewToRemove);
   
      if (this._rendered) {
        $(viewToRemove.el).remove();
      }
    }
  });

  return CorpusesView;
});