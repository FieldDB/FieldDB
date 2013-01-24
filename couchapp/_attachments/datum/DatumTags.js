define([
    "backbone",
    "datum/DatumTag"
], function(
    Backbone, 
    DatumTag
) {
  var DatumTags = Backbone.Collection.extend(
  /** @lends Datums.prototype */
  {
    /**
     * @class A collection of Datum tags
     *
     * @extends Backbone.Collection
     * @constructs
     */
    initialize: function() {
    },
    internalModels : DatumTag,

    model: DatumTag
  });
  
  return DatumTags;
});