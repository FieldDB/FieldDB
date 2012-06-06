define([ 
         "use!backbone", 
         "use!handlebars", 
         "datum/Datum",
         "text!datum/datum_latex.handlebars", 
         ], function(
             Backbone, 
             Handlebars,
             Datum, 
             datumTemplate) {
  var DatumLatexView = Backbone.View.extend(
  /** @lends DatumView.prototype */
  {
    /**
     * @class DatumLatex is an item returned as a search result in the data
     *        list. It has four core fields (topline, morpheme segmentation,
     *        gloss, translation). Morphemes are aligned with corresponding
     *        gloss as in Latex, but this is not a true Latex format (just
     *        looking like Latex).
     * 
     * DatumLatexView is based off of the MovieView in the Paginated Collection
     * <a
     * href="https://github.com/cesine/backbone.paginator/blob/master/examples/netflix-infinite-paging-requirejs/views/MovieView.js">https://github.com/cesine/backbone.paginator/blob/master/examples/netflix-infinite-paging-requirejs/views/MovieView.js</a>
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      this.model.bind('change', this.render, this);
      this.model.bind('destroy', this.remove, this);
    },

    model : Datum,
    tagName : 'li',
    template : Handlebars.compile(datumTemplate),

    render : function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    }

  });

  return DatumLatexView;
});