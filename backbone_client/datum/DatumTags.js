define([
  "libs/FieldDBBackboneCollection",
  "datum/DatumTag"
], function(
  FieldDBBackboneCollection,
  DatumTag
) {
  var DatumTags = FieldDBBackboneCollection.extend( /** @lends Datums.prototype */ {
    /**
     * @class A collection of Datum tags
     *
     * @extends Backbone.Collection
     * @constructs
     */
    initialize: function() {},
    internalModels: DatumTag,

    model: DatumTag
  });

  return DatumTags;
});
