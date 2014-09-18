var FieldDBObject = require('./../FieldDBObject').FieldDBObject;

var Document = function Document(options) {
  this.debug("In Document ", options);
  FieldDBObject.apply(this, arguments);
};

Document.type = "Document";
Document.prototype = Object.create(FieldDBObject.prototype, /** @lends Document.prototype */ {
  constructor: {
    value: Document
  },

  type: {
    get: function() {
      // console.log("getting type");
      if (!this._type) {
        // this._type = this.guessType(this);
      }
      return this._type || "";
    },
    set: function(value) {
      // console.log("setting type");
      if (value !== this._type) {
        this.warn("Overriding type " + this._type + " to the incoming " + value);
        this._type = value;
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
      if (guessedType === "Datalist") {
        guessedType = "DataList";
      }
      if (guessedType === "FieldDBObject") {
        if (doc.datumFields && doc.session) {
          guessedType = "Datum";
        } else if (doc.datumFields && doc.sessionFields) {
          guessedType = "Corpus";
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
