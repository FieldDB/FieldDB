define( [
    "use!backbone", 
    "use!handlebars", 
    "text!data_list/data_lists.handlebars",
    "data_list/DataList",
    "data_list/DataLists",
], function(Backbone,
            Handlebars, 
            data_listsTemplate, 
            DataList,
            DataLists) {
    var DataListsView = Backbone.View.extend(
  /** @lends DataListsView.prototype */
  {
    /**
     * @class DataLists
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
    },

    model : DataList,

    classname : "data_lists",

    template : Handlebars.compile(data_listsTemplate),

    render : function() {
      
      this._rendered = true;
      Utils.debug("DataListsView render: ");
      
      this.setElement(".dataLists_list");
      var jsonToRender = {title: "Available DataLists"};
      $(this.el).html(this.template(jsonToRender));    
      return this;
   
    }
  });

  return DataListsView;
});