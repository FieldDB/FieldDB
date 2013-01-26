define([
    "backbone"
], function(
    Backbone
) {
  var Image = Backbone.Model.extend(
  /** @lends Image.prototype   */
  {
    /**
     * @class The Image class specifies meta data about a visual context of a
     *        datum, usually in an photo format but could be other images.
     * 
     * @extends Backbone.Model
     * @constructs
     */
    intialize : function() {
    },
  
    defaults : {
    },
    
    // Internal models: used by the parse function
    internalModels : {
    }
  });

  return Image;
});