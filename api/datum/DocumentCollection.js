var Collection = require('./../Collection').Collection;
var Document = require('./Document').Document;

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
  this.debug("Constructing DocumentCollection ", options);
  Collection.apply(this, arguments);
};

DocumentCollection.prototype = Object.create(Collection.prototype, /** @lends DocumentCollection.prototype */ {
  constructor: {
    value: DocumentCollection
  },

  primaryKey: {
    value: 'id'
  },

  INTERNAL_MODELS: {
    value: {
      item: Document
    }
  },

  sanitizeStringForPrimaryKey: {
    value: function(value) {
      return value;
    }
  }

});
exports.DocumentCollection = DocumentCollection;
