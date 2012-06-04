define("datum/DatumLatexView", [
    "use!backbone", 
    "use!handlebars", 
    "datum/Datum",
    "text!datum/datum_latex.handlebars"
], function(Backbone, Handlebars, Datum, datum_latexTemplate) {
    var SearchView = Backbone.View.extend(
    /** @lends DatumLatexView.prototype */
    {
        /**
         * @class DatumLatex is an item returned as a search result in the data list. 
         *        It has four core fields (topline, morpheme segmentation, gloss,
        *         translation). Morphemes are aligned with corresponding gloss 
        *         as in Latex, but this is not a true Latex format (just looking like 
        *         Latex). 
         *
         * @extends Backbone.View
         * @constructs
         */
        initialize : function() {
        },

       // model : Datum,

        classname : "datum",

        template: Handlebars.compile(datum_latexTemplate),
        	
        render : function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }
    });

    return DatumLatexView;
}); 