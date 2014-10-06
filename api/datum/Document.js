var FieldDBObject = require("./../FieldDBObject").FieldDBObject;

var Document = function Document(options) {
  this.debug("In Document ", options);
  FieldDBObject.apply(this, arguments);
  // this._fieldDBtype = "Document";
};

Document.fieldDBtype = "Document";
Document.prototype = Object.create(FieldDBObject.prototype, /** @lends Document.prototype */ {
  constructor: {
    value: Document
  },

  fieldDBtype: {
    get: function() {
      // console.log("getting fieldDBtype");
      if (!this._fieldDBtype) {
        // this._fieldDBtype = this.guessType(this);
      }
      return this._fieldDBtype || "";
    },
    set: function(value) {
      // console.log("setting fieldDBtype");
      if (value !== this._fieldDBtype) {
        this.warn("Overriding fieldDBtype " + this._fieldDBtype + " to the incoming " + value);
        this._fieldDBtype = value;
      }
    }
  },

  guessType: {
    value: function(doc) {
      if (!doc || JSON.stringify(doc) === {}) {
        return "FieldDBObject";
      }
      // console.log("Guessing type " + doc._id);
      var guessedType = doc.jsonType || doc.collection || "FieldDBObject";
      if (doc.api && doc.api.length > 0) {
        // console.log("using api" + doc.api);
        guessedType = doc.api[0].toUpperCase() + doc.api.substring(1, doc.api.length);
      }
      guessedType = guessedType.replace(/s$/, "");
      guessedType = guessedType[0].toUpperCase() + guessedType.substring(1, guessedType.length);
      if (guessedType === "Datalist") {
        guessedType = "DataList";
      }
      if (guessedType === "FieldDBObject") {
        if (doc.datumFields && doc.session) {
          guessedType = "Datum";
        } else if (doc.datumFields && doc.sessionFields) {
          guessedType = "Corpus";
        } else if (doc.collections === "sessions" && doc.sessionFields) {
          guessedType = "Session";
        } else if (doc.text && doc.username && doc.timestamp && doc.gravatar) {
          guessedType = "Comment";
        }
      }

      this.warn("Guessed type " + doc._id + " is a " + guessedType);
      return guessedType;
    },

  }

});

exports.Document = Document;
