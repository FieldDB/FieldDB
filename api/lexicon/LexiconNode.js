var CORS = require("../CORS");
var Q = require("q");
var BASE_LEXICON_NODE = require("../datum/Datum").Datum;


var escapeRegexCharacters = function(regex) {
  return regex.replace(/([()[{*+.$^\\|?])/g, "\\$1");
};



/**
 * @class Lexicon Node is key value pair with an index of related datum. It allows the search to index
 *        the corpus to find datum, it is also used by the default glosser to guess glosses based on what the user inputs on line 1 (utterance/orthography).
 * 
 * @description Lexicon Node is key value pair with an index of related datum. It allows the search to index
 *        the corpus to find datum, it is also used by the default glosser to guess glosses based on what the user inputs on line 1 (utterance/orthography).
 * 
 * 
 * @extends Datum
 * 
 * @constructs
 * 
 */
var LexiconNode = function(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "LexiconNode";
  }
  options = options || {};

  BASE_LEXICON_NODE.call(this);

  if (typeof this.toJSON === "function") {
    this.fossil = this.toJSON();
  } else {
    this.fossil = {};
    this.expandedIGTFields.map(function(field) {
      if (field && this[field]) {
        this.fossil[field] = this[field];
      }
    });
  }
};

LexiconNode.prototype = Object.create(BASE_LEXICON_NODE.prototype, /** @lends LexiconNode.prototype */ {
  constructor: {
    value: LexiconNode
  },
  equals: {
    value: function(b) {
      var a = this;
      var equal = false;
      var fieldIndex,
        field,
        tmpArray;

      if (!a || !b) {
        equal = false;
        return equal;
      }

      for (fieldIndex in this.expandedIGTFields) {
        field = this.expandedIGTFields[fieldIndex];
        if (a.hasOwnProperty(field)) {
          // console.log(a);
          if (a[field] === b[field]) {
            equal = true;
          }
        }
      }
      // If the nodes are "equal" then make sure they have the same combineFieldsIfEqual
      if (equal) {
        for (fieldIndex in this.combineFieldsIfEqual) {
          field = this.combineFieldsIfEqual[fieldIndex];
          if (a.hasOwnProperty(field)) {
            tmpArray = [];
            a[field] = a[field].concat(b[field]);
            /*jshint loopfunc: true */
            a[field].map(function(item) {
              if (tmpArray.indexOf(item) === -1) {
                tmpArray.push(item);
              }
            });
            a[field] = tmpArray;
            b[field] = tmpArray;
          }
        }
        if (a.confidence && b.confidence) {
          a.confidence = (parseFloat(a.confidence, 10) + parseFloat(b.confidence, 10)) / 2;
          b.confidence = a.confidence;
        }
        if (a.allomorphs || b.allomorphs) {
          var allomorphs = a.allomorphs ? a.allomorphs : "";
          allomorphs = allomorphs + allomorphs ? ", " : "";
          allomorphs = allomorphs + b.allomorphs ? b.allomorphs : "";
          a.allomorphs = allomorphs;
          b.allomorphs = allomorphs;
        }
      }
      return equal;
    }
  },
  expandedIGTFields: {
    value: ["morphemes", "gloss", "allomorphy", "phonetic", "orthography"]
  },
  combineFieldsIfEqual: {
    value: ["datumids", "utteranceContext"]
  },
  sortBy: {
    value: "morphemes",
    writable: true
  },
  compare: {
    value: function(b) {
      var a = this;
      var result = 0;
      if (!b || !b || !b[this.sortBy]) {
        return -1;
      }
      if (!a || !a || !a[this.sortBy]) {
        return 1;
      }
      if ((typeof(a[this.sortBy]) === "number") && (typeof(b[this.sortBy]) === "number")) {
        result = a[this.sortBy] - b[this.sortBy];
      } else if ((typeof(a[this.sortBy]) === "string") && (typeof(b[this.sortBy]) === "string")) {
        if (a[this.sortBy] < b[this.sortBy]) {
          result = -1;
        } else if (a[this.sortBy] > b[this.sortBy]) {
          result = 1;
        } else {
          result = 0;
        }
      } else if (typeof(a[this.sortBy]) === "string") {
        result = 1;
      } else {
        result = -1;
      }
      return result;
    }
  },
  clean: {
    value: function() {
      // console.log("Preparing datum with this lexical entry to be cleaned...");
      var deffered = Q.defer();
      this.cleanedData = [];
      var promises = [];
      var self = this;
      this.proposedChanges = [];

      var successFunction = function(doc) {
        if (BASE_LEXICON_NODE && BASE_LEXICON_NODE.prototype.INTERNAL_MODELS) {
          doc = new BASE_LEXICON_NODE(doc);
        }
        // console.log(doc);
        doc.fields.map(function(datumField) {
          if (self.fossil[datumField.label] !== self[datumField.label] && (new RegExp(escapeRegexCharacters(self.fossil[datumField.label]), "i")).test(datumField.mask)) {
            var change = {
              before: datumField.mask + ""
            };
            // TODO this makes things lower case... because part of the map reduce seems to be doing that...
            datumField.mask = datumField.mask.replace(new RegExp(escapeRegexCharacters(self.fossil[datumField.label]), "ig"), self[datumField.label]);
            datumField.value = datumField.mask;
            change.after = datumField.mask;
            self.proposedChanges.push(change);
            return datumField;
          }
        });
        self.cleanedData.push(doc);
      };
      var failFunction = function(reason) {
        console.log(reason);
        this.bug("There was a problem saving your changes. " + reason.reason);
      };

      for (var idIndex = 0; idIndex < this.datumids.length; idIndex++) {
        // console.log(this.datumids.length[idIndex]);
        promises[idIndex] = CORS.makeCORSRequest({
          method: "GET",
          dataType: "json",
          url: this.url + "/" + this.datumids[idIndex]
        });
        promises[idIndex].then(successFunction).fail(failFunction);
      }
      Q.allSettled(promises).then(function(results) {
        deffered.resolve(self.proposedChanges);
      });
      return deffered.promise;
    }
  },
  save: {
    value: function() {
      var deffered = Q.defer(),
        self = this,
        promises = [];

      console.log("Saving cleaned datum...");
      while (this.cleanedData && this.cleanedData.length > 0) {
        var cleanedDatum = this.cleanedData.pop();
        promises.push(CORS.makeCORSRequest({
          method: "PUT",
          dataType: "json",
          data: cleanedDatum,
          url: this.url + "/" + cleanedDatum._id
        }));
      }
      Q.allSettled(promises).then(function(results) {
        deffered.resolve(results);
        self.unsaved = true;
      });
      return deffered.promise;
    }
  },
  unsaved: {
    configurable: true,
    get: function() {
      if (this._unsaved) {
        return this._unsaved;
      }
      if (this.fossil && !this.equals(this.fossil)) {
        this._unsaved = true;
      }
      return this._unsaved;
    },
    set: function(value) {
      this._unsaved = value;
    }
  }
});

exports.LexiconNode = LexiconNode;
