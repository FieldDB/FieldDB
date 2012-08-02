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
//            $(this.el).html(this.template(this.model.toJSON()));
            
         // Display the HotKeyEditView
            this.setElement($("#hotkey-settings-modal")); 
            $(this.el).html(this.template(this.model.toJSON()));
           
            //localization
            //$(".locale_Keyboard_Shortcuts").html(chrome.i18n.getMessage("locale_Keyboard_Shortcuts"));
            //$(".locale_Actions").html(chrome.i18n.getMessage("locale_Actions"));
            //$(".locale_Navigation").html(chrome.i18n.getMessage("locale_Navigation"));
            //$(".locale_Favorite").html(chrome.i18n.getMessage("locale_Favorite"));
            //$(".locale_New_Datum").html(chrome.i18n.getMessage("locale_New_Datum"));
            //$(".locale_Next_Datum").html(chrome.i18n.getMessage("locale_Next_Datum"));
            //$(".locale_Previous_Datum").html(chrome.i18n.getMessage("locale_Previous_Datum"));
            //$(".locale_New_Session").html(chrome.i18n.getMessage("locale_New_Session"));
            //$(".locale_Search").html(chrome.i18n.getMessage("locale_Search"));
            //$(".locale_Close").html(chrome.i18n.getMessage("locale_Close"));
            //$(".locale_Save").html(chrome.i18n.getMessage("locale_Save"));
//
//            $(document).bind('keydown', 'ctrl+j', function() {
//                alert('You found the hotkey!');
//            });
      
            
            return this;
        }, 
        
        
        
        
    });
    
  

    return HotKeyEditView;
}); 
