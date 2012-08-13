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
      "change .color_chooser" : "updateColor",
      "click .shouldBeSearchable" : "updateSearchable" 
    },

    /**
     * The Handlebars template rendered as the DatumStateSettingsEditView.
     */
    templateSettings : Handlebars.templates.datum_state_settings_edit_embedded,
      
    /**
     * Renders the DatumStateEditView.
     */
    render : function() {
      Utils.debug("DATUM STATE EDIT render");
      
      if (this.format == "corpus") {
        // Display the DatumStateSettingsEditView
        $(this.el).html(this.templateSettings(this.model.toJSON()));
        
        // Select the correct value from the color dropdown
        this.$el.children(".color_chooser").val(this.model.get("color"));
      }
      
      //localization
      this.$el.find(".locale_Searchable").html(chrome.i18n.getMessage("locale_Searchable"));
      $(".locale_Green").html(chrome.i18n.getMessage("locale_Green"));
      $(".locale_Orange").html(chrome.i18n.getMessage("locale_Orange"));
      $(".locale_Red").html(chrome.i18n.getMessage("locale_Red"));
      $(".locale_Blue").html(chrome.i18n.getMessage("locale_Blue"));
      $(".locale_Teal").html(chrome.i18n.getMessage("locale_Teal"));
      $(".locale_Black").html(chrome.i18n.getMessage("locale_Black"));
      $(".locale_Default").html(chrome.i18n.getMessage("locale_Default"));
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
    },
    
    updateSearchable : function() {
      var checked = this.$el.children(".shouldBeSearchable").is(':checked');
      if (checked ) {
        checked = "checked";
      } else {
        checked = "";
      }
      Utils.debug("Updated showInSearchResults to " + checked);
      this.model.set("showInSearchResults", checked);
    //TODO I modeled this after shouldBeEncrypted, but this function doesn't 
   //actualy affect the actual search results, just the property 'showInSearchResults' in the model.  

    }
  });

  return DatumStateEditView;
}); 
