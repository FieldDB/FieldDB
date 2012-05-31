define("data_list_title/DataListTitleView", [
    "use!backbone", 
    "use!handlebars", 
    "data_list_title/DataListTitle",
    "text!data_list_title/data_list_title.handlebars"
], function(Backbone, Handlebars, DataListTitle, data_list_titleTemplate) {
    var DataSearchBoxView = Backbone.View.extend(
    /** @lends DatumFieldView.prototype */
    {
        /**
         * @class Data List Title
         *
         * @extends Backbone.View
         * @constructs
         */
        initialize : function() {
        },

       // model : DataListTitle,

        classname : "data_list_title",

        template: Handlebars.compile(data_list_titleTemplate),
        	
        render : function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }
    });

    return DataListTitleView;
}); 