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
            $(this.el).find(".locale_Keyboard_Shortcuts").html(chrome.i18n.getMessage("locale_Keyboard_Shortcuts"));
            $(this.el).find(".locale_Actions").html(chrome.i18n.getMessage("locale_Actions"));
            $(this.el).find(".locale_Navigation").html(chrome.i18n.getMessage("locale_Navigation"));
            $(this.el).find(".locale_Datum_Status_Checked").html(chrome.i18n.getMessage("locale_Datum_Status_Checked"));
            $(this.el).find(".locale_Next_Datum").html(chrome.i18n.getMessage("locale_Next_Datum"));
            $(this.el).find(".locale_New_Datum").html(chrome.i18n.getMessage("locale_New_Datum"));
            $(this.el).find(".locale_Previous_Datum").html(chrome.i18n.getMessage("locale_Previous_Datum"));
            $(this.el).find(".locale_New_Session").html(chrome.i18n.getMessage("locale_New_Session"));
            $(this.el).find(".locale_Search").html(chrome.i18n.getMessage("locale_Search"));
            $(this.el).find(".locale_Close").html(chrome.i18n.getMessage("locale_Close"));
            $(this.el).find(".locale_Save").html(chrome.i18n.getMessage("locale_Save"));
//
//            $(document).bind('keydown', 'ctrl+j', function() {
//                alert('You found the hotkey!');
//            });
      
            
            return this;
        }, 
        
        
        
        
    });
    
  

    return HotKeyEditView;
}); 
