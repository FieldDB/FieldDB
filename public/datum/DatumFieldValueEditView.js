define([ 
         "use!backbone",
         "use!handlebars", 
         "text!datum/datum_field_value_edit_embedded.handlebars",
         "datum/DatumField"
  ], function(
      Backbone, 
      Handlebars,
      datumFieldTemplate,
      DatumField
) {
  var DatumFieldValueEditView = Backbone.View.extend(
  /** @lends DatumFieldValueEditView.prototype */
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
     * The underlying model of the DatumFieldValueEditView is a DatumField.
     */
    model : DatumField,
    
    /**
     * Events that the DatumStateEditView is listening to and their handlers.
     */
    events : {
      "blur .datum_field_input" : "updateField",
    },

    /**
     * The Handlebars template rendered as the DatumFieldValueEditView.
     */
    template : Handlebars.compile(datumFieldTemplate),
    
    /**
     * Renders the DatumFieldValueEditView.
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

  return DatumFieldValueEditView;
});