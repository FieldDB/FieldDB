define([
    "use!backbone", 
    "use!handlebars", 
    "datum/Datum",
    "text!datum/datum.handlebars"
], function(Backbone, Handlebars, Datum, datumTemplate) {
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

        template: Handlebars.compile(datumTemplate),

        render : function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }
    });

    return DatumView;
}); 