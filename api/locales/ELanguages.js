var Collection = require("./../Collection").Collection;
var FieldDBObject = require("./../FieldDBObject").FieldDBObject;

/**
 * @class Collection of Datum validation states

 * @name  ELanguages
 * @description The ELanguages is a minimal customization of the Collection
 * to add a primary key of iso.
 *
 * @extends Collection
 * @constructs
 */
var ELanguages = function ELanguages(options) {
  this.debug("Constructing ELanguages ", options);
  Collection.apply(this, arguments);
};

ELanguages.prototype = Object.create(Collection.prototype, /** @lends ELanguages.prototype */ {
  constructor: {
    value: ELanguages
  },

  primaryKey: {
    value: "iso"
  },

  INTERNAL_MODELS: {
    value: {
      item: FieldDBObject
    }
  },

  sanitizeStringForPrimaryKey: {
    value: function(value) {
      return value;
    }
  }

});
exports.ELanguages = ELanguages;
