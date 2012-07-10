define([
    "backbone"
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
    
    // Internal models: used by the parse function
    model : {
      // There are no nested models
    },
  });

  return UserPreference;
});
