var DocumentCollection = require("./DocumentCollection").DocumentCollection;
var Datum = require("./Datum").Datum;

/**
 * @class DocumentCollection of Datum validation states

 * @name  Datums
 * @description The Datums is a minimal customization of the DocumentCollection
 * to add an internal model of Datum.
 *
 * @extends DocumentCollection
 * @constructs
 */
var Datums = function Datums(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "Datums";
  }
  this.debug("Constructing Datums ", options);
  DocumentCollection.apply(this, arguments);
};

Datums.prototype = Object.create(DocumentCollection.prototype, /** @lends Datums.prototype */ {
  constructor: {
    value: Datums
  },

  INTERNAL_MODELS: {
    value: {
      item: Datum
    }
  },

  sanitizeStringForPrimaryKey: {
    value: function(value) {
      return value;
    }
  }

});

exports.Datums = Datums;
