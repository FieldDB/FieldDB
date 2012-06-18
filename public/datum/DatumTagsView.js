define( [
    "use!backbone", 
    "use!handlebars", 
    "text!datum/datum_tags.handlebars",
    "datum/DatumTags"
], function(Backbone,
    Handlebars, 
    datum_tagsTemplate, 
    DatumTags ) {
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