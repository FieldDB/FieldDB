// TODO Make this a read-only version. Right now, this is just a copy of the Editable version

define( [
    "use!backbone", 
    "use!handlebars", 
    "text!datum/datum_state_settings_read_embedded.handlebars",
    "datum/DatumState"
], function(
    Backbone, 
    Handlebars, 
    datum_stateTemplate,
    DatumState
) {
  var DatumStateSettingsReadView = Backbone.View.extend(
      /** @lends DatumStateSettingsReadView.prototype */
      {
        /**
         * @class The DatumStateSettingsReadView is where user's can edit the datum
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
     * The underlying model of the DatumStateSettingsReadView is a DatumState.
     */
    model : DatumState,
    
    /**
     * Events that the DatumStateSettingsReadView is listening to and their handlers.
     */
    events : {
      "blur .datum_state_input" : "updateState",
      "change .color_chooser" : "updateColor"
    },

    /**
     * The Handlebars template rendered as the DatumStateSettingsReadView.
     */
    template: Handlebars.compile(datum_stateTemplate),
      
    /**
     * Renders the DatumStateSettingsReadView.
     */
    render : function() {
      Utils.debug("DATUM STATE EDIT render");
      
      // Display the DatumStateSettingsReadView
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

  return DatumStateSettingsReadView;
}); 
