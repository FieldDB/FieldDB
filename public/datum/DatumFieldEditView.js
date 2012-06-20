define([ 
         "use!backbone",
         "use!handlebars", 
         "text!datum/datum_edit_field.handlebars",
         "datum/DatumField"
  ], function(
      Backbone, 
      Handlebars,
      datum_fieldTemplate,
      DatumField
) {
  var DatumFieldView = Backbone.View.extend(
  /** @lends DatumFieldView.prototype */
  {
    /**
     * @class This is the view of the Datum Field Model. The Datum Field is a
     *        drop down field that has the most frequent ones first, and at the
     *        bottom an option to create a new one.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("DATUM FIELD init");
    
      // If the model changes, re-render
      this.model.bind('change', this.render, this);
    },
    
    /**
     * The underlying model of the DatumFieldView is a DatumField.
     */
    model : DatumField,
    
    /**
     * Events that the DatumStateEditView is listening to and their handlers.
     */
    events : {
      "blur .datum_field_input" : "updateField",
    },

    /**
     * The Handlebars template rendered as the DatumFieldView.
     */
    template : Handlebars.compile(datum_fieldTemplate),
    /**
     * Renders the DatumFieldView.
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
      Utils.debug("Updated field to " + this.$el.children(".datum_field_input").val());
      this.model.set("label", this.$el.children(".datum_field_input").val());
    },
    
  });

  return DatumFieldView;
});