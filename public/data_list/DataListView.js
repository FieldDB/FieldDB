define("data_list/DataListView", [
    "use!backbone", 
    "use!handlebars",
    "datum/Datum",
    "data_list/DataList",
    "text!data_list/data_list.handlebars",
//    "text!data_list_title/data_list_title.handlebars",
//    "data_list_title/DataListTitle",
//    "data_list_title/DataListTitleView",
    "datum_menu/DatumMenu",
    "datum_menu/DatumMenuView",
 //   "search/Search",
 //   "search/SearchView"
 //   added "search/Search"
], function(Backbone, Handlebars, Datum, DataList, data_listTemplate, data_list_titleTemplate, DataListTitle, 
		DataListTitleView, DatumMenu, DatumMenuView, Search, SearchView) {

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

  //      	this.searchview = new Search({model: this.model.get("search")});
       //     this.listview = new DataList({model: this.model.get("dataList")});
    //        this.titleview = new DataListTitleView({model: this.model.get("dataListTitle")});
//            this.menuview = new DatumMenuView({model: this.model.get("datumMenu")});

        },

        model : DataList,
        classname : "dataList",
        template: Handlebars.compile(data_listTemplate),
        

        
      //  searchsview: null,  
       //listview: null,
 //       titleview: null,

        //added searchview
   //    searchview: SearchView, 
        
        menuview: DatumMenuView,
        
       
        render : function() {
        	Handlebars.registerPartial("datum_menu", this.menuview.template(this.menuview.model.toJSON()) );
        	
        	
        	$(this.el).html(this.template(this.model.toJSON()));
            return this;
        }, 
        
    });

    return DataListView;
}); 
