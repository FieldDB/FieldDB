define([
    "backbone", 
    "handlebars", 
    "hotkey/HotKey"
], function(Backbone, Handlebars, HotKey) {
    var HotKeyEditView = Backbone.View.extend(
    /** @lends HotKeyEditView.prototype */
    {
        /**
         * @class HotKeyEditView
         *
         * @extends Backbone.View
         * @constructs
         */
        initialize : function() {
        },

        model : HotKey,

        classname : "hot_key_edit",

        template: Handlebars.templates.hot_key_edit_modal,
    
        render : function() {
           
            var jsonToRender = this.model.toJSON();
            jsonToRender.locale_Actions = Locale.get("locale_Actions"); 
            jsonToRender.locale_Close = Locale.get("locale_Close");
            jsonToRender.locale_Datum_Status_Checked = Locale.get("locale_Datum_Status_Checked"); 
            jsonToRender.locale_Keyboard_Shortcuts = Locale.get("locale_Keyboard_Shortcuts");
            jsonToRender.locale_Navigation = Locale.get("locale_Navigation");
            jsonToRender.locale_New_Datum = Locale.get("locale_New_Datum"); 
            jsonToRender.locale_New_Session = Locale.get("locale_New_Session");
            jsonToRender.locale_Next_Datum = Locale.get("locale_Next_Datum");
            jsonToRender.locale_Previous_Datum = Locale.get("locale_Previous_Datum");
            jsonToRender.locale_Save = Locale.get("locale_Save");
            jsonToRender.locale_Search = Locale.get("locale_Search");

            // Display the HotKeyEditView
            this.setElement($("#hotkey-settings-modal")); 
            $(this.el).html(this.template(jsonToRender));
            
//
//            $(document).bind('keydown', 'ctrl+j', function() {
//                alert('You found the hotkey!');
//            });
      
            
            return this;
        }
        
    });
    
    return HotKeyEditView;
}); 
