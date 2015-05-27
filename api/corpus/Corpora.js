var Collection = require("./../Collection").Collection;
var Connection = require("./Connection").Connection;

/**
 * @class Connection
 * @name  Connection
 * @description The Corpora is a minimal customization of the Collection
 * to add an internal model of a corpus Connection.
 *
 * Collection of Corpuses in the form of Connection which are the conneciton part of CorpusMasks
 *
 * @extends Collection
 * @constructs
 */
var Corpora = function Corpora(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "Corpora";
  }
  this.debug("Constructing Corpora ", options);
  Collection.apply(this, arguments);
};

Corpora.prototype = Object.create(Collection.prototype, /** @lends Corpora.prototype */ {
  constructor: {
    value: Corpora
  },

  primaryKey: {
    get: function() {
      return this._primaryKey || "dbname";
    },
    set: function(value) {
      this._primaryKey = value;
    }
  },

  INTERNAL_MODELS: {
    value: {
      item: Connection
    }
  },

  findCorpusConnectionFromTitleAsUrl: {
    value: function(titleOrCorpusIdentifier, optionalOwnersUsername) {
      var potentialMatches = this.find(titleOrCorpusIdentifier);
      if (potentialMatches.length > 0) {
        this.debug("Found a corpus connection using the dbname: " + titleOrCorpusIdentifier, potentialMatches);
        return potentialMatches[0];
      }
      potentialMatches = this.find(optionalOwnersUsername + "-" + titleOrCorpusIdentifier);
      if (potentialMatches.length > 0) {
        this.debug("Found a corpus connection using the owner's username: " + optionalOwnersUsername + " and the dbname: " + titleOrCorpusIdentifier, potentialMatches);
        return potentialMatches[0];
      }
      potentialMatches = this.find("title", titleOrCorpusIdentifier, "fuzzy");
      if (potentialMatches.length > 0) {
        this.debug("Found a corpus connection using the title: " + titleOrCorpusIdentifier, potentialMatches);
        return potentialMatches[0];
      }
      potentialMatches = this.find("titleAsUrl", titleOrCorpusIdentifier, "fuzzy");
      if (potentialMatches.length > 0) {
        this.debug("Found a corpus connection using the titleAsUrl: " + titleOrCorpusIdentifier, potentialMatches);
        return potentialMatches[0];
      }
    }
  },

  sanitizeStringForPrimaryKey: {
    value: function(value) {
      return value;
    }
  }

});
exports.Corpora = Corpora;
exports.Connections = Corpora;
