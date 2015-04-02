var FieldDBObject = require("./../FieldDBObject").FieldDBObject;

/**
 * @class UnicodeSymbol allows a user to use IPA symbols, characters other than Roman alphabets, etc..
 *    Users can add new symbols. Added symbols are saved and stored, and will show up next time the user
 *    opens UnicodeSymbol box.
 *
 * @name  UnicodeSymbol
 * @extends FieldDBObject
 * @constructs
 */
var UnicodeSymbol = function UnicodeSymbol(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "UnicodeSymbol";
  }
  this.debug("Constructing UnicodeSymbol length: ", options);
  FieldDBObject.apply(this, arguments);
};

UnicodeSymbol.prototype = Object.create(FieldDBObject.prototype, /** @lends UnicodeSymbol.prototype */ {
  constructor: {
    value: UnicodeSymbol
  },

  defaults: {
    value: {
      symbol: "",
      tipa: "",
      useCount: 0
    }
  },
  symbol: {
    get: function() {
      return this._symbol;
    },
    set: function(value) {
      if (value === this._symbol) {
        return;
      }
      if (!value) {
        delete this._symbol;
        return;
      }
      if (typeof value.trim === "function") {
        value = value.trim();
      }
      this._symbol = value.trim();
    }
  },

  toJSON: {
    value: function(includeEvenEmptyAttributes, removeEmptyAttributes) {
      this.debug("Customizing toJSON ", includeEvenEmptyAttributes, removeEmptyAttributes);
      var json = FieldDBObject.prototype.toJSON.apply(this, arguments);

      delete json.dateCreated;
      delete json.dateModified;
      delete json.version;

      this.debug(json);
      return json;
    }
  }

});
exports.UnicodeSymbol = UnicodeSymbol;
