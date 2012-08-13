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
      Utils.debug("DATUM FIELD EDIT VIEW init");
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
      "click .shouldBeEncrypted" : "updateEncrypted",
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
      Utils.debug("DATUM FIELD EDIT VIEW render");
     
      if (this.format == "corpus") {
        $(this.el).html(this.templateSettings(this.model.toJSON()));
        //localization
        //$(".locale_Encrypt_if_confidential").html(chrome.i18n.getMessage("locale_Encrypt_if_confidential"));
        //$(".locale_Help_Text").html(chrome.i18n.getMessage("locale_Help_Text"));
        //$(".locale_locale_Help_Text").attr("placeholder", chrome.i18n.getMessage("locale_locale_Help_Text"));
        
        // Select the correct values from the model
        this.$el.children(".choose-field").val(this.model.get("label"));
      } else if (this.format == "datum") {
        var jsonToRender = this.model.toJSON();
        jsonToRender.helpText = true;
        $(this.el).html(this.templateValue(jsonToRender));
        var fieldself = this;
        window.setTimeout(function(){
          $(fieldself.el).find(".datum_field_input").autosize();//This comes from the jquery autosize library which makes the datum text areas fit their size. https://github.com/jackmoore/autosize/blob/master/demo.html
        },500);
        
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
      var checked = this.$el.children(".shouldBeEncrypted").is(':checked');
      if (checked ) {
        checked = "checked";
      } else {
        checked = "";
      }
      Utils.debug("Updated shouldBeEncrypted to " + checked);
      this.model.set("shouldBeEncrypted", checked);
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
      this.model.set("mask", this.$el.children(".datum_field_input").val());
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