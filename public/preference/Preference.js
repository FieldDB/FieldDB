define("preference/Preference", [ 
    "use!backbone",
    "user/User",
    "hotkey/HotKeyConfigView"
], function(Backbone, User, HotKeyConfigView) {
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
          user : User
        }
      });

  return Preference;
});
