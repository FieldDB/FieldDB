define([
    "use!backbone", 
    "use!handlebars", 
    "hotkey/HotKey",
    "text!hotkey/hot_key_edit_modal.handlebars"
], function(Backbone, Handlebars, HotKey, hot_key_edit_modalTemplate) {
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
            this.setElement($("#hotkey-edit-view")); 
            $(this.el).html(this.template(this.model.toJSON()));
           
//
//            $(document).bind('keydown', 'ctrl+j', function() {
//                alert('You found the hotkey!');
//            });
      
            
            return this;
        }, 
        
        
        
        
    });
    
  

    return HotKeyEditView;
}); 
