var DatumTags = require("./DatumTags").DatumTags;
var DatumState = require("./DatumState").DatumState;

/**
 * @class DatumStates of Datum validation states
 * @name  DatumStates
 * @description The DatumStates is a minimal customization of the DatumTags
 * to add an internal model of DatumState.
 *
 * @extends DatumTags
 * @constructs
 */
var DatumStates = function DatumStates(options) {
  this.debug("Constructing DatumStates length: ", options);
  DatumTags.apply(this, arguments);
  this._fieldDBtype = "DatumStates";
};

DatumStates.prototype = Object.create(DatumTags.prototype, /** @lends DatumStates.prototype */ {
  constructor: {
    value: DatumStates
  },

  /**
   *  The primary key < v2 was "label" but we changed to use "id" so that
   *  "label" could be used only for a human friendly (and customizable)
   *  label while the id must remain unchanged for glossing and other automation.
   * @type {Object}
   */
  primaryKey: {
    value: "validationStatus"
  },

  INTERNAL_MODELS: {
    value: {
      item: DatumState
    }
  }

});
exports.DatumStates = DatumStates;
