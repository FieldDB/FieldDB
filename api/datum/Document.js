var FieldDBObject = require("./../FieldDBObject").FieldDBObject;

var Document = function Document(options) {
  // if(!this._fieldDBtype){
  // 	this._fieldDBtype = "Document";
  // }
  this.debug("In Document ", options);
  FieldDBObject.apply(this, arguments);
};

Document.fieldDBtype = "Document";
Document.prototype = Object.create(FieldDBObject.prototype, /** @lends Document.prototype */ {
  constructor: {
    value: Document
  },

  fieldDBtype: {
    get: function() {
      this.debug("getting fieldDBtype");
      if (!this._fieldDBtype) {
        // this._fieldDBtype = this.guessType(this);
      }
      return this._fieldDBtype || "";
    },
    set: function(value) {
      this.debug("setting fieldDBtype");
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
      this.debug("Guessing type " + doc._id);
      var guessedType = doc.jsonType || doc.collection || "FieldDBObject";
      if (doc.api && doc.api.length > 0) {
        this.debug("using api" + doc.api);
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
