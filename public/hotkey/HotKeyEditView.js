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
            $(".Keyboard_Shortcuts").html(chrome.i18n.getMessage("Keyboard_Shortcuts"));
            $(".Actions").html(chrome.i18n.getMessage("Actions"));
            $(".Navigation").html(chrome.i18n.getMessage("Navigation"));
            $(".Favorite").html(chrome.i18n.getMessage("Favorite"));
            $(".New_Datum").html(chrome.i18n.getMessage("New_Datum"));
            $(".Next_Datum").html(chrome.i18n.getMessage("Next_Datum"));
            $(".Previous_Datum").html(chrome.i18n.getMessage("Previous_Datum"));
            $(".New_Session").html(chrome.i18n.getMessage("New_Session"));
            $(".Search").html(chrome.i18n.getMessage("Search"));
            $(".Close").html(chrome.i18n.getMessage("Close"));
            $("#Save").html(chrome.i18n.getMessage("Save"));






//
//            $(document).bind('keydown', 'ctrl+j', function() {
//                alert('You found the hotkey!');
//            });
      
            
            return this;
        }, 
        
        
        
        
    });
    
  

    return HotKeyEditView;
}); 
