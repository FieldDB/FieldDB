define( [ 
    "use!backbone",
    "hotkey/HotKeyConfigView"
], function(Backbone, HotKeyConfigView) {
  var UserPreference = Backbone.Model.extend(
      /** @lends UserPreference.prototype */
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
          skin: ""//TODO, make this a random skin, and load the background image from here somehow...
        }
      });

  return UserPreference;
});
