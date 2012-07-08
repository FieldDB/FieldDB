define([ 
     "libs/backbone",
     "libs/handlebars.runtime", 
     "datum/DatumField"
  ], function(
      Backbone, 
      Handlebars,
      DatumField
) {
  var DatumFieldReadView = Backbone.View.extend(
  /** @lends DatumFieldReadView.prototype */
  {
    /**
     * @class This is the view of the Datum Field Model. The Datum Field is a
     *        drop down field that has the most frequent ones first, and at the
     *        bottom an option to create a new one.
     * 
     * @property {String} format Valid values are "corpus" and "datum".
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
     * The underlying model of the DatumFieldReadView is a DatumField.
     */
    model : DatumField,
    
    /**
     * Events that the DatumFieldReadView is listening to and their handlers.
     */
    events : {
      "blur .choose-field" : "updateField",
      "click .encrypted" : "updateEncrypted",
      "blur .help-text" : "updateHelp",
      "blur .datum_field_input" : "updateField",
    },

    /**
     * The Handlebars template rendered as the DatumFieldSettingsReadView.
     */
    templateSettings : Handlebars.templates.datum_field_settings_read_embedded,
    
    /**
     * The Handlebars template rendered as the DatumFieldValueReadView.
     */
    templateValue : Handlebars.templates.datum_field_value_read_embedded,
    
    /**
     * Renders the DatumFieldReadView.
     */
    render : function() {
      Utils.debug("DATUM FIELD READ render");
     
      if (this.format == "corpus") {
        $(this.el).html(this.templateSettings(this.model.toJSON()));
        
        // Select the correct values from the model
        this.$el.children(".choose-field").val(this.model.get("label"));
      } else if (this.format == "datum") {
        $(this.el).html(this.templateValue(this.model.toJSON()));
      }
      
      return this;
    },
    
    /**
     * Change the model's state.
     */
    updateField : function() {
      Utils.debug("Updated label to " + this.$el.children(".datum_field_input").val());
      this.model.set("label", this.$el.children(".datum_field_input").val());
    },
    
    // TODO Add description
    updateEncrypted : function() {
      var checked = this.$el.children(".encrypted").is(':checked');
      if (checked ) {
        checked = "checked";
      } else {
        checked = "";
      }
      Utils.debug("Updated encrypted to " + checked);
      this.model.set("encrypted", checked);
    },
    
    // TODO Add description
    updateHelp : function() {
      var help = this.$el.children(".help-text").val();
      Utils.debug("Updated help to " + help);
      this.model.set("help",help);
    },
         
    /**
     * Change the model's state.
     */
    updateField : function() {
      this.model.set("value", this.$el.children(".datum_field_input").val());
    }   
  });

  return DatumFieldReadView;
});