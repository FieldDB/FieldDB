define([ 
        "use!backbone" 
        ], function(Backbone) {
  var Preference = Backbone.Model.extend(
      /** @lends Preference.prototype */
      {
        /**
         * @class Hold preferences for users like the skin of teh app
         * 
         * @extends Backbone.Model
         * @constructs
         */
        initialize : function() {
        }
      });

  return Preference;
});
