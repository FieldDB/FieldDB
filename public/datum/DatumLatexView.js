define("datum/DatumLatexView", [
    "use!backbone", 
    "use!handlebars", 
    "datum/Datum",
    "text!datum/datum_latex.handlebars"
], function(Backbone, Handlebars, DatumLatex, datum_latexTemplate) {
    var SearchView = Backbone.View.extend(
    /** @lends DatumLatexView.prototype */
    {
        /**
         * @class Datum
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