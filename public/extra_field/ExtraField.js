define("extra_field/ExtraField", [ 
    "use!backbone" 
], function(Backbone) {
  var ExtraField = Backbone.Model.extend(
      /** @lends Preference.prototype */
      {
        /**
         * @class Hold preferences for users like the skin of the app
         * 
         * @extends Backbone.Model
         * @constructs
         */
        initialize : function() {
        }
      });

  return ExtraField;
});
