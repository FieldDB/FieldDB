define([
    "use!backbone", 
    "use!handlebars", 
    "hotkey/HotKey",
    "text!hotkey/hot_key_config_view.handlebars"
], function(Backbone, Handlebars, HotKey, hot_key_config_viewTemplate) {
    var HotKeyConfigView = Backbone.View.extend(
    /** @lends HotKeyConfigView.prototype */
    {
        /**
         * @class HotKeyConfigView
         *
         * @extends Backbone.View
         * @constructs
         */
        initialize : function() {
        },

        model : HotKey,

        classname : "hot_key_config",

        template: Handlebars.compile(hot_key_config_viewTemplate),
   	
        render : function() {
            $(this.el).html(this.template(this.model.toJSON()));
            return this;
        }
        
        
    });
    
  

    return HotKeyConfigView;
}); 