define( [
    "use!backbone", 
    "use!handlebars", 
    "text!datum/datum_state_settings_edit_embedded.handlebars",
    "datum/DatumState"
], function(
    Backbone, 
    Handlebars, 
    datum_stateTemplate,
    DatumState
) {
  var DatumStateSettingsEditView = Backbone.View.extend(
      /** @lends DatumStateSettingsEditView.prototype */
      {
        /**
         * @class The DatumStateSettingsEditView is where user's can edit the datum
         *        states, They can choose the colour and label from the Detailed
         *        Corpus View.
         * 
         * @extends Backbone.View
         * @constructs
         */
    initialize : function() {
      Utils.debug("DATUM STATE EDIT init");
      
      // If the model changes, re-render
      this.model.bind('change', this.render, this);
    },
    
    /**
     * The underlying model of the DatumStateSettingsEditView is a DatumState.
     */
    model : DatumState,
    
    /**
     * Events that the DatumStateSettingsEditView is listening to and their handlers.
     */
    events : {
      "blur .datum_state_input" : "updateState",
      "change .color_chooser" : "updateColor"
    },

    /**
     * The Handlebars template rendered as the DatumStateSettingsEditView.
     */
    template: Handlebars.compile(datum_stateTemplate),
      
    /**
     * Renders the DatumStateSettingsEditView.
     */
    render : function() {
      Utils.debug("DATUM STATE EDIT render");
      
      // Display the DatumStateSettingsEditView
      $(this.el).html(this.template(this.model.toJSON()));
      
      // Select the correct value from the color dropdown
      this.$el.children(".color_chooser").val(this.model.get("color"));
      
      return this;
    },
    
    /**
     * Change the model's state.
     */
    updateState : function() {
      Utils.debug("Updated state to " + this.$el.children(".datum_state_input").val());
      this.model.set("state", this.$el.children(".datum_state_input").val());
    },
    
    /**
     * Change the model's color.
     */
    updateColor : function() {
      Utils.debug("Updated color to " + this.$el.children(".color_chooser").val());
      this.model.set("color", this.$el.children(".color_chooser").val());
    }
  });

  return DatumStateSettingsEditView;
}); 
