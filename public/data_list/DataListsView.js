define( [
    "use!backbone", 
    "use!handlebars", 
    "text!data_lists/data_lists.handlebars",
    "data_list/DataLists",
], function(Backbone,
            Handlebars, 
            data_listsTemplate, 
            DataLists) {
    var DataListsView = Backbone.View.extend(
  /** @lends DataListsView.prototype */
  {
    /**
     * @class Datum Lists
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
    },

    model : DatumTags,

    classname : "datum_lists",

    template : Handlebars.compile(datum_listsTemplate),

    render : function() {
      this.setElement($("#datum_lists"));
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    }
  });

  return DataListsView;
});