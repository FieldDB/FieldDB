define([
    "use!backbone", 
    "use!handlebars", 
    "datum/Datum"
], function(Backbone, Handlebars, Datum) {
    var DatumView = Backbone.View.extend(
    /** @lends DatumView.prototype */
    {
        /**
         * @class The layout of a single Datum.
         *
         * @extends Backbone.View
         * @constructs
         */
        initialize : function() {
        },

        model : Datum,

        classname : "datum",

        template: Handlebars.compile($("#datum-template").html()),

        render : function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }
    });

    return DatumView;
}); 