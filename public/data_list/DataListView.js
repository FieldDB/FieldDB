define( [ "use!backbone", 
          "use!handlebars",
          "datum/Datum",
          "datum/Datums",
          "data_list/DataList",
          "text!data_list/data_list.handlebars"
], function(
    Backbone, 
    Handlebars, 
    Datum, 
    Datums,
    DataList, 
    data_listTemplate) {

  var DataListView = Backbone.View.extend(
  /** @lends DataList.prototype */
  {
    /**
     * @class A list of datum that are returned as a search result. It will have
     *        check-boxes on the side and a datum menu on the bottom.
     *        
     *        This class is based off of the Infinite paginator by Addy Osmani's AppView
     * 
     * @extends Backbone.View
     * @constructs
     */

    initialize : function() {

//      var tags = this.datums;
//
//      tags.on('add', this.addOne, this);
//      tags.on('reset', this.addAll, this);
//      tags.on('all', this.render, this);
//
//      tags.pager();

    },
    
    el : '#data_list',
    model : DataList,
    datums: Datums,
    classname : "dataList",
    template : Handlebars.compile(data_listTemplate),

   

    addAll : function() {
      this.collection.each(this.addOne);
    },

    addOne : function(item) {
      var view = new views.ResultView({
        model :  Backbone.Model.extend({})
      });
      $('#data_list_content').append(view.render().el);
    },

    render : function() {
      $(this.el).html(this.template(this.model.toJSON()));
      
      return this;
    }
  });

  return DataListView;
});
