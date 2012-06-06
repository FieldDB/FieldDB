define([
    "use!backbone", 
    "use!handlebars", 
    "preference/Preference",
    "text!preference/preference.handlebars",
    "hotkey/HotKeyConfigView"
], function(Backbone, Handlebars, Preference, preferenceTemplate, HotKeyConfigView) {
    var PreferenceView = Backbone.View.extend(
    /** @lends PreferenceView.prototype */
    {
        /**
         * @class PreferenceView
         *
         * @extends Backbone.View
         * @constructs
         */
        initialize : function() {
        },

        model : Preference,
     //make model name: JS/CSS class name
     //   hotkeyview: HotKeyConfigView,

//        classname : "preference",
        
        //el : $(".preference"),
        
        template: Handlebars.compile(preferenceTemplate),
        
        events:{
          "click .skin": "randomSkin"
          
        },
   	
        render : function() {
        	
        	//Handlebars.registerPartial("hot_key_config", this.hotkeyview.template(this.hotkeyview.model.toJSON()) );
        	
            $(this.el).html(this.template(this.model.toJSON()));
            $(this.el).appendTo("#preference");
            return this;
        },	
        
        randomSkin : function(){
          console.log("Change me!!");
          return true;
        }
        
    });
    
  

    return PreferenceView;
}); 