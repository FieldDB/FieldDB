define([ "use!backbone", "use!handlebars", "datum/DatumField",
    "text!datum/datum_field.handlebars" ], function(Backbone, Handlebars,
    DatumField, datum_fieldTemplate) {
  var DatumFieldView = Backbone.View.extend(
  /** @lends DatumFieldView.prototype */
  {
    /**
     * @class Datum Field
     *
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
    },

    // model : DatumField,

    classname : "datum_field",

    template : Handlebars.compile(datum_fieldTemplate),

    render : function() {
      this.setElement($(".data_fields"));
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    }
  });

  return DatumFieldView;
});