var Collection = require("./../Collection").Collection;
var CorpusConnection = require("./CorpusConnection").CorpusConnection;

/**
 * @class CorpusConnections
 * @name  CorpusConnections
 * @description The CorpusConnections is a minimal customization of the Collection
 * to add an internal model of CorpusConnection.
 *
 * Collection of Corpuses in the form of CorpusMasks
 *
 * @extends Collection
 * @constructs
 */
var CorpusConnections = function CorpusConnections(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "CorpusConnections";
  }
  this.debug("Constructing CorpusConnections ", options);
  Collection.apply(this, arguments);
};

CorpusConnections.prototype = Object.create(Collection.prototype, /** @lends CorpusConnections.prototype */ {
  constructor: {
    value: CorpusConnections
  },

  primaryKey: {
    value: "dbname"
  },

  INTERNAL_MODELS: {
    value: {
      item: CorpusConnection
    }
  },

  insertNewCorpusConnectionFromObject: {
    value: function(commentObject) {
      commentObject.timestamp = Date.now();
      this.add(new CorpusConnection(commentObject));
    }
  },

  sanitizeStringForPrimaryKey: {
    value: function(value) {
      return value;
    }
  }


});
exports.CorpusConnections = CorpusConnections;
