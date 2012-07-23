define([ 
     "backbone",
     "handlebars", 
     "datum/DatumField"
  ], function(
      Backbone, 
      Handlebars,
      DatumField
) {
  var DatumFieldEditView = Backbone.View.extend(
  /** @lends DatumFieldEditView.prototype */
  {
    /**
     * @class This is the view of the Datum Field Model. The Datum Field is a
     *        drop down field that has the most frequent ones first, and at the
     *        bottom an option to create a new one.
     * 
     * @property {String} format Valid values are "corpus", "datum", and
     * "session".
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("DATUM FIELD init");
    },
    
    /**
     * The underlying model of the DatumFieldEditView is a DatumField.
     */
    model : DatumField,
    
    /**
     * Events that the DatumFieldEditView is listening to and their handlers.
     */
    events : {
      "blur .choose-field" : "updateFieldLabel",
      "click .encrypted" : "updateEncrypted",
      "blur .help-text" : "updateHelp",
      "blur .datum_field_input" : "updateFieldValue",
      "click .icon-question-sign" : "showHelpConvention",
      "hover .icon-question-sign" : "hideHelpConvention"  
    },

    /**
     * The Handlebars template rendered as the DatumFieldSettingsEditView.
     */
    templateSettings : Handlebars.templates.datum_field_settings_edit_embedded,
    
    /**
     * The Handlebars template rendered as the DatumFieldValueEditView.
     */
    templateValue : Handlebars.templates.datum_field_value_edit_embedded,
    
    /**
     * Renders the DatumFieldEditView.
     */
    render : function() {
      Utils.debug("DATUM FIELD EDIT render");
     
      if (this.format == "corpus") {
        $(this.el).html(this.templateSettings(this.model.toJSON()));
        
        // Select the correct values from the model
        this.$el.children(".choose-field").val(this.model.get("label"));
      } else if (this.format == "datum") {
        var jsonToRender = this.model.toJSON();
        jsonToRender.helpText = true;
        $(this.el).html(this.templateValue(jsonToRender));
      } else if (this.format == "session") {
        var jsonToRender = this.model.toJSON();
        jsonToRender.helpText = false;
        $(this.el).html(this.templateValue(jsonToRender));
      }
      
      
      return this;
    },
    
    /**
     * Change the model's state.
     */
    updateFieldLabel : function() {
      Utils.debug("Updated label to " + this.$el.children(".choose-field").val());
      this.model.set("label", this.$el.children(".choose-field").val());
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
    updateFieldValue : function() {
      this.model.set("value", this.$el.children(".datum_field_input").val());
    }, 
    
    /**
     * Show help convention in popover  
     */
    showHelpConvention : function() {
    	this.$el.children(".help-conventions").popover("show");
    },
    
    /**
     * Don't show help convention in popover if only hover 
     */
    hideHelpConvention : function() {
        this.$el.children(".help-conventions").popover("hide");
    }    
   
  });

  return DatumFieldEditView;
});