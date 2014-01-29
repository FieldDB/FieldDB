define([ 
     "backbone",
     "handlebars", 
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
     * @property {String} format Valid values are "corpus", "datum", and "session".
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      if (OPrime.debugMode) OPrime.debug("DATUM FIELD READ init");
    
      // If the model changes, re-render
      this.model.bind('change', this.render, this);
    },
    
    /**
     * The underlying model of the DatumFieldReadView is a DatumField.
     */
    model : DatumField,

    events : {
      "click .help-conventions" : "toggleHelpConvention"
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
      if (OPrime.debugMode) OPrime.debug("DATUM FIELD READ VIEW render");

      var jsonToRender = this.model.toJSON();
      jsonToRender.locale_Encrypt_if_confidential = Locale.get("locale_Encrypt_if_confidential");

      
      if (this.format == "corpus") {
        $(this.el).html(this.templateSettings(jsonToRender));
        
        // Select the correct values from the model
        this.$el.children(".choose-field").val(this.model.get("label"));
      
      } else if (this.format == "datum") {
        jsonToRender.helpText = true;
        $(this.el).html(this.templateValue(jsonToRender));
      } else if (this.format == "session") {
        jsonToRender.helpText = true;
        $(this.el).html(this.templateValue(jsonToRender));
      }
    
      return this;
    },
    
    /**
     * Toggle help convention in popover  
     */
    toggleHelpConvention : function(e) {
      if(e){
        // e.preventDefault();
        e.stopPropagation();
      }
      if (this.showingHelp) {
        this.$el.find(".help-conventions").popover("hide");
        this.showingHelp = false;
      } else {
        this.$el.find(".help-conventions").popover("show");
        this.showingHelp = true;
      }
      return false;
    }
    
  });

  return DatumFieldReadView;
});