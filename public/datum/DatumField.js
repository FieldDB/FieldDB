define([ "use!backbone" ], function(Backbone) {
  var DatumField = Backbone.Model.extend(
  /** @lends Preference.prototype */
  {
    /**
     * @class The datum fields are the additional fields added by user
     * 
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
    },

    defaults : {
      size : "",
      label : "",
      value : "",
      mask : "",
      encrypted : false,
      help : ""
    }
  });

  return DatumField;
});
