define("data_list/DataListView", [
    "use!backbone", 
    "use!handlebars",
    "datum/Datum",
    "data_list/DataList",
    "text!data_list/data_list.handlebars",
    "datum_menu/DatumMenu",
    "datum_menu/DatumMenuView"
], function(Backbone, Handlebars, Datum, DataList, data_listTemplate,DatumMenu, DatumMenuView) {
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
        //	var datumMenu = new DatumMenu();
//            this.menuview = new DatumMenuView({model: new DatumMenu()});

        },

        model : DataList,
        classname : "dataList",
        template: Handlebars.compile(data_listTemplate),
        
        menuview: DatumMenuView,

        render : function() {
          
        	Handlebars.registerPartial("datum_menu", this.menuview.template(this.menuview.model.toJSON()) );
        	$(this.el).html(this.template(this.model.toJSON()));
            return this;
        } 
        
    });

    return DataListView;
}); 
