define([
    "use!backbone"
], function(
    Backbone
) {
  var UserPreference = Backbone.Model.extend(
  /** @lends UserPreference.prototype */
  {
    /**
     * @class Hold preferences for users like the skin of the app
     * 
     * @property {int} skin This is user's preferred skin.
     *
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
    },
    
    defaults : {
      skin : ""//TODO, make this a random skin, and load the background image from here somehow...
    },
    
    /**
     * Modifies this UserPreference so that its properties match those
     * in the given object.
     * 
     * @param {Object} obj Contains the UserPreference properties.
     */
    restructure : function(obj) {
      console.log("*** Before UserPreference restructure: " + JSON.stringify(obj));
      console.log(this);
      
      for (key in obj) {
        this.set(key, obj[key]);
      }
      
      console.log("*** After UserPreference restructure");
      console.log(this);
    }
  });

  return UserPreference;
});
