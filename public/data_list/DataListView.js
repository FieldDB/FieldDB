define("data_list/DataListView", [
    "use!backbone", 
    "use!handlebars",
    "datum/Datum",
    "data_list/DataList",
    "text!data_list/data_list.handlebars"
], function(Backbone, Handlebars, Datum, DataList, data_listTemplate) {
    var DataListView = Backbone.View.extend(
    /** @lends DatumView.prototype */
    {
        /**
         * @class A list of datum that are returned as a search result.  It will have check-boxes on the side and a datum menu on the bottom.   
         *
         * @extends Backbone.View
         * @constructs
         */
        initialize : function() {
        },

        model : DataList,
        classname : "dataList",
        template: Handlebars.compile(data_listTemplate),
        render : function() {
        	$(this.el).html(this.template(this.model.toJSON()));
            return this;
        } 
        
    });

    return DataListView;
}); 
