define( [
    "use!backbone", 
    "use!handlebars", 
    "datum/DatumState",
    "text!datum/datum_state_settings.handlebars",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars, 
    DatumState, 
    datum_stateTemplate
) {
  var DatumStateEditView = Backbone.View.extend(
  /** @lends DatumStateEditView.prototype */
  {
    /**
     * @class TODO Describe the DatumStateEditView.
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
     * The underlying model of the DatumStateEditView is a DatumState.
     */
    model : DatumState,
    
    /**
     * Events that the DatumStateEditView is listening to and their handlers.
     */
    events : {
      "blur .datum_state_input" : "updateState",
      "change .color_chooser" : "updateColor"
    },

    /**
     * The Handlebars template rendered as the DatumStateEditView.
     */
    template: Handlebars.compile(datum_stateTemplate),
      
    /**
     * Renders the DatumStateEditView.
     */
    render : function() {
      Utils.debug("DATUM STATE EDIT render");
      
      // Display the DatumStateEditView
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

  return DatumStateEditView;
}); 