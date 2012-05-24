define("data_list/DataListView", [
    "use!backbone", 
    "use!handlebars", 
    "datum/Datum",
   
], function(Backbone, Handlebars, Datum) {
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

        
        render : function() {
        	
        }
    });

    return DataListView;
}); 
