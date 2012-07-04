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
     * @property {int} numVisibleDatum The number of Datum visible at the time on
     * the Datum*View's.
     *
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
    },
    
    defaults : {
      skin : "",
      numVisibleDatum : 3
    },
    
    model : {
      // There are no nested models
    },
    
    parse : function(response) {
      for (var key in this.model) {
        var embeddedClass = this.model[key];
        var embeddedData = response[key];
        response[key] = new embeddedClass(embeddedData, {parse:true});
      }
      
      return response;
    },
    
    /**
     * Modifies this UserPreference so that its properties match those
     * in the given object.
     * 
     * @param {Object} obj Contains the UserPreference properties.
     */
    restructure : function(obj) {
      for (key in obj) {
        this.set(key, obj[key]);
      }
    }
  });

  return UserPreference;
});
