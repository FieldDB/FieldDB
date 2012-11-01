define( [
    "backbone", 
    "handlebars", 
    "datum/DatumState",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars, 
    DatumState
) {
  var DatumStateEditView = Backbone.View.extend(
  /** @lends DatumStateEditView.prototype */
  {
    /**
     * @class The DatumStateEditView is where user's can edit the datum
     *        states, They can choose the colour and label from the Detailed
     *        Corpus View.
     * 
     * @property {String} format The format of the View. Valid values are "corpus".
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("DATUM STATE EDIT VIEW init");
      
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
     * The Handlebars template rendered as the DatumStateSettingsEditView.
     */
    templateSettings : Handlebars.templates.datum_state_settings_edit_embedded,
      
    /**
     * Renders the DatumStateEditView.
     */
    render : function() {
      Utils.debug("DATUM STATE EDIT VIEW render");
      
      if (this.format == "corpus") {
        // Display the DatumStateSettingsEditView
        $(this.el).html(this.templateSettings(this.model.toJSON()));
        
        // Select the correct value from the color dropdown
        this.$el.children(".color_chooser").val(this.model.get("color"));
        
        //localization
        $(this.el).find(".locale_Green").html(Locale["locale_Green"].message);
        $(this.el).find(".locale_Orange").html(Locale["locale_Orange"].message);
        $(this.el).find(".locale_Red").html(Locale["locale_Red"].message);
        $(this.el).find(".locale_Teal").html(Locale["locale_Teal"].message);
        $(this.el).find(".locale_Black").html(Locale["locale_Black"].message);
        $(this.el).find(".locale_Default").html(Locale["locale_Default"].message);
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

  return DatumStateEditView;
}); 
