var DatumView = Backbone.View.extend(
/** @lends DatumView.prototype */
{
   /**
    * @class The layout of a single Datum.
    *
    * @extends Backbone.View
    * @constructs
    */
   initialize: function() {
   },
   
   model: Datum,
   
   classname: "datum",
   
   render: function() {
      var template = Handlebars.compile($("#datum-template").html());
      
      $(this.el).html(template(this.model.toJSON()));
      return this;
   }
});
