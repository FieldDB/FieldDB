define("preference/Preference", [ 
    "use!backbone",
    "hotkey/HotKeyConfigView"
], function(Backbone, HotKeyConfigView) {
  var Preference = Backbone.Model.extend(
      /** @lends Preference.prototype */
      {
        /**
         * @class Hold preferences for users like the skin of the app
         * 
         * @extends Backbone.Model
         * @constructs
         */
        
        initialize : function() {
        },
        defaults : {
        
        }
      });

  return Preference;
});
