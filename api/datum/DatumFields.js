var Collection = require('./../Collection').Collection;
var DatumField = require('./../datum/DatumField').DatumField;

/**
 * @class Collection of Datum Field
 *
 * @description The DatumFields is a minimal customization of the Collection
 * to add an internal model of DatumField.
 *
 * @extends Collection
 * @constructs
 */
var DatumFields = function DatumFields(options) {
  console.log("Constructing DatumFields length: ", options.length);
  Collection.apply(this, arguments);
};

DatumFields.prototype = Object.create(Collection.prototype, /** @lends DatumFields.prototype */ {
  constructor: {
    value: DatumFields
  },

  /**
   *  The primary key < v2 was 'label' but we changed to use 'id' so that
   *  'label' could be used only for a human friendly (and customizable)
   *  label while the id must remain unchanged for glossing and other automation.
   * @type {Object}
   */
  primaryKey: {
    value: 'id'
  },

  INTERNAL_MODELS: {
    value: {
      item: DatumField
    }
  }

});
exports.DatumFields = DatumFields;
