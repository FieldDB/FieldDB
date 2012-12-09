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
            $(this.el).find(".locale_Keyboard_Shortcuts").html(Locale["locale_Keyboard_Shortcuts"].message);
            $(this.el).find(".locale_Actions").html(Locale["locale_Actions"].message);
            $(this.el).find(".locale_Navigation").html(Locale["locale_Navigation"].message);
            $(this.el).find(".locale_Datum_Status_Checked").html(Locale["locale_Datum_Status_Checked"].message);
            $(this.el).find(".locale_Next_Datum").html(Locale["locale_Next_Datum"].message);
            $(this.el).find(".locale_New_Datum").html(Locale["locale_New_Datum"].message);
            $(this.el).find(".locale_Previous_Datum").html(Locale["locale_Previous_Datum"].message);
            $(this.el).find(".locale_New_Session").html(Locale["locale_New_Session"].message);
            $(this.el).find(".locale_Search").html(Locale["locale_Search"].message);
            $(this.el).find(".locale_Close").html(Locale["locale_Close"].message);
            $(this.el).find(".locale_Save").html(Locale["locale_Save"].message);
//
//            $(document).bind('keydown', 'ctrl+j', function() {
//                alert('You found the hotkey!');
//            });
      
            
            return this;
        }, 
        
        
        
        
    });
    
  

    return HotKeyEditView;
}); 
