define([
    "backbone",
    "image/Image"
], function(
    Backbone,
    Image
) {
  var Images = Backbone.Collection.extend(
  /** @lends Images.prototype */
  {
    /**
     * @class A collection of Image contexts
     *
     * @extends Backbone.Collection
     * @constructs
     */
    initialize: function() {
    },
    internalModels : Image,

    model: Image
  });
  
  return Images;
});