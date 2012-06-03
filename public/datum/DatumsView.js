define( [
    "use!backbone", 
    "use!handlebars", 
    "datum/Datums",
    "text!/datum/datum_latex.handlebars"
], function(Backbone, Handlebars, Datums, datum_latexTemplate) {
    var DatumsView = Backbone.View.extend(
    /** @lends DatumsView.prototype */
    {
        /**
         * @class 
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

    return DatumsView;
}); 