define("datum_tag/DatumTagView", [
    "use!backbone", 
    "use!handlebars", 
    "datum_tag/DatumTag",
    "text!datum_tag/datum_tag.handlebars"
], function(Backbone, Handlebars, DatumTag, datum_tagTemplate) {
    var DatumTagView = Backbone.View.extend(
    /** @lends DatumTagView.prototype */
    {
        /**
         * @class Datum Tags
         *
         * @extends Backbone.View
         * @constructs
         */
        initialize : function() {
        },

        //model : DatumTag,

        classname : "datum_tag",

        template: Handlebars.compile(datum_tagTemplate),
        	
        render : function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }
    });

    return DatumTagView;
}); 