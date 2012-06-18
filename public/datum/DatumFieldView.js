define([ "use!backbone",
         "use!handlebars", 
         "text!datum/datum_field.handlebars",
         "datum/DatumField"
  ], function(Backbone, 
              Handlebars,
              datum_fieldTemplate,
              DatumField) {
  var DatumFieldView = Backbone.View.extend(
  /** @lends DatumFieldView.prototype */
  {
    /**
     * @class This is the view of the Datum Field Model.
     *
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
    },

    model : DatumField,

    classname : "datum_field",

    template : Handlebars.compile(datum_fieldTemplate),

    render : function() {
      this.setElement($(".datum_fields"));
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    }
  });

  return DatumFieldView;
});