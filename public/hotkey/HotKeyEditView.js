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
            $(".Keyboard_Shortcuts").append(chrome.i18n.getMessage("Keyboard_Shortcuts"));
            $(".Actions").append(chrome.i18n.getMessage("Actions"));
            $(".Navigation").append(chrome.i18n.getMessage("Navigation"));
            $(".Favorite").append(chrome.i18n.getMessage("Favorite"));
//            $(".New_Datum").append(chrome.i18n.getMessage("New_Datum"));
            $(".Next_Datum").append(chrome.i18n.getMessage("Next_Datum"));
            $(".Previous_Datum").append(chrome.i18n.getMessage("Previous_Datum"));
            $(".New_Session").append(chrome.i18n.getMessage("New_Session"));
            $(".Search").append(chrome.i18n.getMessage("Search"));






//
//            $(document).bind('keydown', 'ctrl+j', function() {
//                alert('You found the hotkey!');
//            });
      
            
            return this;
        }, 
        
        
        
        
    });
    
  

    return HotKeyEditView;
}); 
