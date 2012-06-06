define([
    "use!backbone", 
    "use!handlebars", 
    "preference/Preference",
    "text!preference/preference.handlebars",
    "hotkey/HotKeyConfigView",
    "libs/Utils"
], function(
  Backbone, 
  Handlebars, 
  Preference, 
  preferenceTemplate, 
  HotKeyConfigView
) {
  var PreferenceView = Backbone.View.extend(
  /** @lends PreferenceView.prototype */
  {
    // TODO comment this class
    /**
     * @class PreferenceView
     *
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
    },

    /**
     * The underlying model of the PreferenceView is a Preference.
     */
    model : Preference,
    
    /**
     * Events that the PreferenceView is listening to and their handlers.
     */
    events:{
      "click .skin": "randomSkin"
    },
 
    /**
     * The Handlebars template rendered as the PreferenceView.
     */
    template: Handlebars.compile(preferenceTemplate),

    render : function() {
      Utils.debug("PREFERENCE render: " + this.el);
      if (this.model != undefined) {
        // Display the PreferenceView
        this.setElement($("#preference"));
        $(this.el).html(this.template(this.model.toJSON()));
      }
      
      return this;
    },	
    
    // TODO Comment and implement this function
    randomSkin : function(){
      console.log("Change me!!");
      return true;
    } 
  });
  
  return PreferenceView;
}); 