var Collection = require('./../Collection').Collection;
var DatumTag = require('./DatumTag').DatumTag;

/**
 * @class Collection of Datum validation states

 * @name  DatumTags
 * @description The DatumTags is a minimal customization of the Collection
 * to add an internal model of DatumTag.
 *
 * @extends Collection
 * @constructs
 */
var DatumTags = function DatumTags(options) {
  console.log("Constructing DatumTags length: ", options);
  Collection.apply(this, arguments);
};

DatumTags.prototype = Object.create(Collection.prototype, /** @lends DatumTags.prototype */ {
  constructor: {
    value: DatumTags
  },

  /**
   *  The primary key < v2 was 'label' but we changed to use 'id' so that
   *  'label' could be used only for a human friendly (and customizable)
   *  label while the id must remain unchanged for glossing and other automation.
   * @type {Object}
   */
  primaryKey: {
    value: 'tag'
  },

  INTERNAL_MODELS: {
    value: {
      item: DatumTag
    }
  }

});
exports.DatumTags = DatumTags;
