// TODO Make this a read-only version. Right now, this is just a copy of the Editable version

define( [
    "use!backbone", 
    "use!handlebars", 
    "text!datum/datum_state_settings_read_embedded.handlebars",
    "datum/DatumState",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars, 
    datumStateSettingsTemplate,
    DatumState
) {
  var DatumStateReadView = Backbone.View.extend(
  /** @lends DatumStateReadView.prototype */
  {
    /**
     * @class The DatumStateReadView is where user's can see the datum
     *        states.
     * 
     * @property {String} format The format of the View. Valid values are "corpus".
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("DATUM STATE EDIT init");
      
      // Default format is "corpus" since it will be used in an UpdatingCollectionView.
      this.format = "corpus";
      
      // If the model changes, re-render
      this.model.bind('change', this.render, this);
    },
    
    /**
     * The underlying model of the DatumStateReadView is a DatumState.
     */
    model : DatumState,
    
    /**
     * Events that the DatumStateReadView is listening to and their handlers.
     */
    events : {
      "blur .datum_state_input" : "updateState",
      "change .color_chooser" : "updateColor"
    },

    /**
     * The Handlebars template rendered as the DatumStateSettingsReadView.
     */
    templateSettings : Handlebars.templates.datum_state_settings_read_embedded,
      
    /**
     * Renders the DatumStateReadView.
     */
    render : function() {
      Utils.debug("DATUM STATE EDIT render");
      
      if (this.format == "corpus") {
        // Display the DatumStateSettingsReadView
        $(this.el).html(this.templateSettings(this.model.toJSON()));
        
        // Select the correct value from the color dropdown
        this.$el.children(".color_chooser").val(this.model.get("color"));
      }
      
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

  return DatumStateReadView;
}); 
