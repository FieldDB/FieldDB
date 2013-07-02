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
      if (OPrime.debugMode) OPrime.debug("DATUM FIELD EDIT VIEW init");
      
      this.model.bind('change:mask', function(){
        this.render();
      }, this);
      this.model.bind('change:alternates', function(){
        this.render();
      }, this);
      
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
      // issue #797
      "click .remove-datum-field" : "removeDatumField",
      "click .shouldBeEncrypted" : "updateEncrypted",
      "blur .help-text" : "updateHelp",
      "blur .datum_field_input" : "updateFieldValue",
      "keyup .datum_field_input" : "resizeInputFieldToFit",
      "click .icon-question-sign" : "showHelpConvention",
      "hover .icon-question-sign" : "hideHelpConvention"  
    },
    
    /*
     * TODO Only Admin users can trash datum fields?
     * 
     */
    removeDatumField : function(e){
      if(e){
        e.preventDefault();
      }
      var r = confirm("Are you sure you want to remove this DatumField? (It won't be listed in the Advanced Search anymore, but any Datum which have it will keep it).");
      if (r == true) {
        this.model.destroy();
      }
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
      if (OPrime.debugMode) OPrime.debug("DATUM FIELD EDIT VIEW render");
     
      if (this.format == "corpus") {
        $(this.el).html(this.templateSettings(this.model.toJSON()));
        //localization
        $(this.el).find(".locale_Encrypt_if_confidential").html(Locale.get("locale_Encrypt_if_confidential"));
        $(this.el).find(".locale_Help_Text").html(Locale.get("locale_Help_Text"));
        $(this.el).find(".locale_Help_Text_Placeholder").attr("placeholder", Locale.get("locale_Help_Text_Placeholder"));
        
        // Select the correct values from the model TODO is this dead code?
        $(this.el).find(".choose-field").val(this.model.get("label"));
      } else if (this.format == "datum") {
        var jsonToRender = this.model.toJSON();
        jsonToRender.helpText = true;
        jsonToRender.alternates = JSON.stringify(this.model.get("alternates"));
        $(this.el).html(this.templateValue(jsonToRender));
        
        //Add the label class to this element so that it can be found for other purposes like hiding rare fields
        $(this.el).addClass(this.model.get("label"));
        
        //Add listener for drag and drop unicode
        $(this.el).find(".datum_field_input").each(function(){
          this.addEventListener('drop', window.appView.dragUnicodeToField);
          this.addEventListener('dragover', window.appView.handleDragOver);
          this.addEventListener('dragleave', function(){
            $(this).removeClass("over");
            return;
          });
//          $(this).autosize();
        });
        
//        This replaces the jquery autosize library which makes the datum text areas fit their size.http://www.impressivewebs.com/textarea-auto-resize/ (see comments) https://github.com/jackmoore/autosize/blob/master/demo.html
        var fieldself = this;
        window.setTimeout(function(){
          fieldself.resizeInputFieldToFit();
        },200);
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
      if (OPrime.debugMode) OPrime.debug("Updated label to " + this.$el.find(".choose-field").val());
      this.model.set("label", this.$el.find(".choose-field").val());
    },
    
    // TODO Add description
    updateEncrypted : function() {
      var checked = this.$el.find(".shouldBeEncrypted").is(':checked');
      if (checked ) {
        checked = "checked";
      } else {
        checked = "";
      }
      if (OPrime.debugMode) OPrime.debug("Updated shouldBeEncrypted to " + checked);
      this.model.set("shouldBeEncrypted", checked);
    },
    
    // TODO Add description
    updateHelp : function() {
      var help = this.$el.find(".help-text").val();
      if (OPrime.debugMode) OPrime.debug("Updated help to " + help);
      this.model.set("help",help);
    },
         
    /**
     * Change the model's state.
     */
    updateFieldValue : function() {
      this.model.set("mask", this.$el.find(".datum_field_input").val());
    }, 
    
    /**
     * This is a function which can take in an event or be called directly, it
     * will take the scrollheight of the current datum field input area, and
     * then expand the textarea to be that height, using 50 px as the size of
     * one em.
     * 
     * @param e
     *          the event (optional) otherwise it looks for the
     *          datum_field_input
     */
    resizeInputFieldToFit : function(e) {
      var it;
      if (e) {
        it = e.target;
      } else {
        it = $(this.el).find(".datum_field_input")[0];
      }
      var sh = it.scrollHeight;
      if(sh > 20){
        it.style.height =  sh + "px";
      }
    },
    
    /**
     * Show help convention in popover  
     */
    showHelpConvention : function() {
    	this.$el.find(".help-conventions").popover("show");
    },
    
    /**
     * Don't show help convention in popover if only hover 
     */
    hideHelpConvention : function() {
        this.$el.find(".help-conventions").popover("hide");
    }    
   
  });

  return DatumFieldEditView;
});