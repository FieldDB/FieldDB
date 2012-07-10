define( [
    "backbone"
], function(
    Backbone
) {
  var DatumTag = Backbone.Model.extend(
  /** @lends DatumTag.prototype */
  {
    /**
     * @class The DatumTag allows the user to label data with grammatical tags
     *        i.e. passive, causative. This is useful for searches.
     * 
     * @description The initialize function brings up a field in which the user
     *              can enter tags.
     * @constructs
     */
    initialize : function() {
    },
    
    defaults : {
      tag : "defaultTag"
    },
    
    // Internal models: used by the parse function
    model : {
      // There are no nested models
    }
  });

  return DatumTag;
});
