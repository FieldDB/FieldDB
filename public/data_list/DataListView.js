define("data_list/DataListView", [
    "use!backbone", 
    "use!handlebars",
    "datum/Datum",
    "data_list/DataList",
    "text!data_list/data_list.handlebars",
    "text!data_list_title/data_list_title.handlebars",
    "data_list_title/DataListTitle",
    "data_list_title/DataListTitleView",
    "datum_menu/DatumMenu",
    "datum_menu/DatumMenuView",

 //   "search/Search"
], function(Backbone, Handlebars, Datum, DataList, data_listTemplate, data_list_titleTemplate, DataListTitle, DataListTitleView, DatumMenu,DatumMenuView) {
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
        classname : "data_list",
        template: Handlebars.compile(data_listTemplate),
        
        menuview: DatumMenuView,

       
        render : function() {
//        	Handlebars.registerPartial("datum_menu", this.menuview.template(this.menuview.model.toJSON()) );
        	
        	
        	$(this.el).html(this.template(this.model.toJSON()));
            return this;
        } 
        
    });

    return DataListView;
}); 
