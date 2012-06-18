define("datum/DatumTagsView", [
    "use!backbone", 
    "use!handlebars", 
    "datum/DatumTags",
    "text!datum/datum_tags.handlebars"
], function(Backbone, Handlebars, DatumTags, datum_tagsTemplate) {
    var DatumTagsView = Backbone.View.extend(
    /** @lends DatumTagsView.prototype */
    {
        /**
         * @class Datum Tags
         *
         * @extends Backbone.View
         * @constructs
         */
        initialize : function() {
        },

        model : DatumTags,

        classname : "datum_tags",

        template: Handlebars.compile(datum_tagsTemplate),
        	
        render : function() {
            this.setElement($("#datum_tags"));
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }
    });

    return DatumTagsView;
}); 