// TODO Make this a read-only version. Right now, this is just a copy of the Editable version
define([ 
     "use!backbone",
     "use!handlebars", 
     "text!datum/datum_field_value_read_embedded.handlebars",
     "datum/DatumField"
  ], function(
      Backbone, 
      Handlebars,
      datumFieldTemplate,
      DatumField
) {
  var DatumFieldValueReadView = Backbone.View.extend(
  /** @lends DatumFieldValueReadView.prototype */
  {
    /**
     * @class This is the view of the Datum Field Model. The Datum Field is a
     *        textarea preceeded by a label.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("DATUM FIELD init");
    },
    
    /**
     * The underlying model of the DatumFieldValueReadView is a DatumField.
     */
    model : DatumField,
    
    /**
     * Events that the DatumFieldValueReadView is listening to and their handlers.
     */
    events : {
      "blur .datum_field_input" : "updateField",
    },

    /**
     * The Handlebars template rendered as the DatumFieldValueReadView.
     */
    template : Handlebars.compile(datumFieldTemplate),
    
    /**
     * Renders the DatumFieldValueReadView.
     */
    render : function() {
      Utils.debug("DATUM FIELD render");
      
      $(this.el).html(this.template(this.model.toJSON()));
      
      return this;
    },
    
    /**
     * Change the model's state.
     */
    updateField : function() {
      this.model.set("value", this.$el.children(".datum_field_input").val());
    }
  });

  return DatumFieldValueReadView;
});