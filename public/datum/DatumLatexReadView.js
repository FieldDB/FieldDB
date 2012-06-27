define([ 
    "use!backbone", 
    "use!handlebars", 
    "datum/Datum"
], function(
    Backbone, 
    Handlebars,
    Datum
) {
  var DatumLatexReadView = Backbone.View.extend(
  /** @lends DatumLatexReadView.prototype */
  {
    /**
     * @class DatumLatex is an item returned as a search result in the data
     *        list. It has four core fields (topline, morpheme segmentation,
     *        gloss, translation). Morphemes are aligned with corresponding
     *        gloss as in Latex, but this is not a true Latex format (just
     *        looking like Latex).
     * 
     * DatumLatexReadView is based off of the MovieView in the Paginated Collection
     * <a
     * href="https://github.com/cesine/backbone.paginator/blob/master/examples/netflix-infinite-paging-requirejs/views/MovieView.js">
     * https://github.com/cesine/backbone.paginator/blob/master/examples/netflix-infinite-paging-requirejs/views/MovieView.js</a>
     * 
     * @description Starts the DatumLatexReadView.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("DLATEX init: " + this.el);

      this.model.bind('change', this.render, this);
      this.model.bind('destroy', this.remove, this);
    },

    /**
     * The underlying model of the DatumLatexReadView is a Datum.
     */
    model : Datum,
    
    tagName : 'li',

    /**
     * Renders the DatumLatexReadView.r
     */
    render : function() {
      Utils.debug("DLATEX render: " + this.el);

      translation: this.model.get("datumFields").where({label: "translation"})[0].get("value"),      
      utterance= this.model.get("datumFields").where({label: "utterance"})[0].get("value");
      gloss = this.model.get("datumFields").where({label: "gloss"})[0].get("value");
      translation= this.model.get("datumFields").where({label: "translation"})[0].get("value"),

      utteranceArray = utterance.split(' ');
      glossArray = gloss.split(' ');
      
      glossCouplet = [];
      var i= 0;
      for( i; i<utteranceArray.length; i++){
        glossCouplet = utteranceArray[i] +"<br>"+ glossArray[i];
        this.$el.append('<span class ="glossCouplet">'+ glossCouplet + '</span>');
      };
      this.$el.append('<br>'+translation);

      return this;
    }
  });

  return DatumLatexReadView;
});