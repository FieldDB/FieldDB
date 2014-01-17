define([ 
     "backbone",
     "handlebars", 
     "datum/DatumField",
     "OPrime"
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
      "blur .datum_field_input" : "onblur",
      "keyup .datum_field_input" : "resizeInputFieldToFit",
      // "focus .datum_field_input" : "onfocus",
      "click .help-conventions" : "toggleHelpConvention"
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
    
    previousJsonRendered : null,
    /**
     * Renders the DatumFieldEditView.
     */
    render : function() {
      if (OPrime.debugMode) OPrime.debug("DATUM FIELD EDIT VIEW render");

      var jsonToRender = this.model.toJSON();

      jsonToRender.locale_Encrypt_if_confidential = Locale.get("locale_Encrypt_if_confidential");
      jsonToRender.locale_Help_Text = Locale.get("locale_Help_Text");
      jsonToRender.locale_Help_Text_Placeholder = Locale.get("locale_Help_Text_Placeholder");

      if (this.format == "corpus") {
        if(this.previousJsonRendered && this.previousJsonRendered.mask == jsonToRender.mask){
          return this;
        }
        this.previousJsonRendered = jsonToRender;
        $(this.el).html(this.templateSettings(jsonToRender));
        $(this.el).find(".choose-field").val(this.model.get("label"));
        
      } else if (this.format == "datum" || this.format == "search") {
        if(this.format == "search"){
          delete jsonToRender.readonly;
        }
        jsonToRender.helpText = true;
        jsonToRender.alternates = JSON.stringify(this.model.get("alternates"));
        if(this.previousJsonRendered && this.previousJsonRendered.mask == jsonToRender.mask){
          return this;
        }
        this.previousJsonRendered = jsonToRender;
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
        var fieldself = this.el;
        window.setTimeout(function(){
          // fieldself.resizeInputFieldToFit();
          var inputField = $(fieldself).find(".datum_field_input")[0];
          if(inputField){
            var sh = inputField.scrollHeight;
            if(sh > 20){
              inputField.style.height =  sh + "px";
            }
          }

        },500);
      } else if (this.format == "session") {
        jsonToRender.helpText = true;
        if(this.previousJsonRendered && this.previousJsonRendered.mask == jsonToRender.mask){
          return this;
        }
        this.previousJsonRendered = jsonToRender;
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
         
    onfocus: function(){
      this.model.starttime = Date.now();
      // this.resizeInputFieldToFit();
    },

    onblur: function(){
      var changedText = this.updateFieldValue();
      if(this.model.starttime){
        var stoptime = Date.now();
        this.model.timeSpent = this.model.timeSpent || 0;
        if(changedText != null){
          this.model.timeSpent += stoptime - this.model.starttime;
          OPrime.debug("Spent total miliseconds on \""+this.model.get("label")+ "\" : "+this.model.timeSpent);
        }
        this.model.starttime = null;
      }
    },
    /**
     * Change the model's value if it has changed.
     */
    updateFieldValue : function() {
      var visibleValue = this.$el.find(".datum_field_input").val();
      visibleValue = visibleValue.trim() || "";
      if (visibleValue != this.model.get("mask") ){
        this.model.set("mask", visibleValue);
        return visibleValue;
      }
      return null;
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
      var inputFieldToResize;
      var explictlyCalled = false;

      if (e) {
        inputFieldToResize = e.target;
      } else {
        inputFieldToResize = $(this.el).find(".datum_field_input")[0];
        // explictlyCalled = true;
      }
      if (!inputFieldToResize) {
        return;
      }
      var newValue = $(inputFieldToResize).val()  || "";
      var oldValue = this.model.get("mask")  || "";
      var lengthDiffernce = newValue.length - oldValue.length
      if (explictlyCalled || ( Math.abs(lengthDiffernce) < 10 )) {
        var sh = inputFieldToResize.scrollHeight;
        if(sh > 20){
          inputFieldToResize.style.height =  sh + "px";
        }
      }
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

  return DatumFieldEditView;
});
