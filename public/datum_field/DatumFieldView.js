define("datum_field/DatumFieldView", [
    "use!backbone", 
    "use!handlebars", 
    "datum_field/DatumField",
    "text!datum_field/datum_field.handlebars"
], function(Backbone, Handlebars, DatumField, datum_fieldTemplate) {
    var DatumFieldView = Backbone.View.extend(
    /** @lends DatumFieldView.prototype */
    {
        /**
         * @class Datum Field
         *
         * @extends Backbone.View
         * @constructs
         */
        initialize : function() {
        },

       // model : DatumField,

        classname : "datum_field",

        template: Handlebars.compile(datum_fieldTemplate),
        	
        render : function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }
    });

    return DatumFieldView;
}); 