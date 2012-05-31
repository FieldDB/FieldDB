define("datum_search_box/DataSearchBoxView", [
    "use!backbone", 
    "use!handlebars", 
    "data_search_box/DataSearchBox",
    "text!data_search-box/data_search_box.handlebars"
], function(Backbone, Handlebars, DataSearchBox, data_search_boxTemplate) {
    var DataSearchBoxView = Backbone.View.extend(
    /** @lends DatumFieldView.prototype */
    {
        /**
         * @class Data Search Box
         *
         * @extends Backbone.View
         * @constructs
         */
        initialize : function() {
        },

       // model : DataSearchBox,

        classname : "data_search_box",

        template: Handlebars.compile(data_search_boxTemplate),
        	
        render : function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }
    });

    return DataSearchBoxView;
}); 