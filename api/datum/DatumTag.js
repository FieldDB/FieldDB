var FieldDBObject = require('./../FieldDBObject').FieldDBObject;

/**
 * @class The DatumTag allows the user to label data with grammatical tags
 *        i.e. passive, causative. This is useful for searches.
 *
 * @name  DatumTag
 * @description The initialize function brings up a field in which the user
 *              can enter tags.@class FieldDBObject of Datum validation states
 * @extends FieldDBObject
 * @constructs
 */
var DatumTag = function DatumTag(options) {
  this.debug"Constructing DatumTag length: ", options);
  FieldDBObject.apply(this, arguments);
};

DatumTag.prototype = Object.create(FieldDBObject.prototype, /** @lends DatumTag.prototype */ {
  constructor: {
    value: DatumTag
  }

});
exports.DatumTag = DatumTag;
