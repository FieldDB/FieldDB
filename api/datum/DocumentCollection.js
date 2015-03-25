var Collection = require("./../Collection").Collection;
var FieldDBObject = require("./../FieldDBObject").FieldDBObject;

/**
 * @class Collection of CouchDB docs

 * @name  DocumentCollection
 * @description The DocumentCollection is a minimal customization of the Collection
 * to add an internal model of Document and prevent the primary key from being sanitized
 *
 * @extends Collection
 * @constructs
 */
var DocumentCollection = function DocumentCollection(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "DocumentCollection";
  }
  this.debug("Constructing DocumentCollection ", options);
  Collection.apply(this, arguments);
};

DocumentCollection.prototype = Object.create(Collection.prototype, /** @lends DocumentCollection.prototype */ {
  constructor: {
    value: DocumentCollection
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
exports.DocumentCollection = DocumentCollection;
