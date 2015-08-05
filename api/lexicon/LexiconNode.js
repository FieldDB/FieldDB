var CORS = require("../CORS");
var Q = require("q");
var BASE_LEXICON_NODE = require("./../datum/LanguageDatum").LanguageDatum;
var DEFAULT_CORPUS = require("./../../api/corpus/corpus.json");

var AudioVideos = require("./../audio_video/AudioVideos").AudioVideos;
var Contexts = require("./../lexicon/Contexts").Contexts;
var Comments = require("./../comment/Comments").Comments;
var DatumFields = require("./../datum/DatumFields").DatumFields;
var DatumStates = require("./../datum/DatumStates").DatumStates;
var DatumTags = require("./../datum/DatumTags").DatumTags;
var Images = require("./../image/Images").Images;
var Session = require("./../datum/Session").Session;

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
 * @extends LanguageDatum
 * 
 * @constructs
 * 
 */
var LexiconNode = function(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "LexiconNode";
  }
  // this.debugMode = true;
  this.debug("Declaring a LexiconNode", options);
  BASE_LEXICON_NODE.apply(this, arguments);

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

  this.debug("constructed " + this.id);
  this.debug("morphemes " + this.morphemes);
  this.debug("contexts ", this.contexts);
};

LexiconNode.prototype = Object.create(BASE_LEXICON_NODE.prototype, /** @lends LexiconNode.prototype */ {
  constructor: {
    value: LexiconNode
  },

  api: {
    value: "lexicalNodes"
  },

  // Internal models: used by the parse function
  INTERNAL_MODELS: {
    value: {
      fields: DatumFields,
      audioVideo: AudioVideos,
      session: Session,
      comments: Comments,
      contexts: Contexts,
      datumStates: DatumStates,
      datumTags: DatumTags,
      images: Images
    }
  },

  /**
   *  Lexical entries/Nodes unique id is composed of their morphemes and gloss.
   *  However, the user can edit the id/headword if there really are more
   *  than one morpheme with the exact same morphemes and gloss combo.
   * @return {[type]} [description]
   */
  id: {
    get: function() {
      return this.headword;
    },
    set: function(value) {
      if (this.headword !== value) {
        this.headword = value;
      }
    }
  },

  headword: {
    get: function() {
      this.debug(" getting headword ", this.fields ? this.fields.length : this);

      // Let users customize the headword
      if (this._id) {
        return this._id;
      }

      var constructHeadwordFromMorphemesAndGloss = "";
      if (this.morphemes) {
        constructHeadwordFromMorphemesAndGloss = this.morphemes;
      }
      constructHeadwordFromMorphemesAndGloss += "|";
      // without this morphemes glossed as ? will be counted as another morpheme, if that morpheme has a gloss
      if (!this.gloss || this.gloss == "?" || this.gloss == "??") {
        // constructHeadwordFromMorphemesAndGloss += "?";
      } else if (this.gloss) {
        constructHeadwordFromMorphemesAndGloss += this.gloss;
      }
      if (constructHeadwordFromMorphemesAndGloss && constructHeadwordFromMorphemesAndGloss !== "|") {
        return constructHeadwordFromMorphemesAndGloss;
      }
    },
    set: function(value) {
      this._id = value;
    }
  },

  count: {
    get: function() {
      if (!this._contexts || !(this._contexts instanceof Contexts) || !this._contexts.length) {
        this.debug(" getting _count of " + this.id + " " + this._count);
        return this._count || 0;
      }

      if (this._contexts && this._contexts instanceof Contexts) {
        this.debug(" getting number of context counts of " + this.id + " " + this._contexts.length);
        return this._contexts.length;
      }
      return 0;
    },
    set: function(value) {
      this.debug(" setting count of " + this.id + " " + value);
      if (this._contexts && this._contexts instanceof Contexts && this._contexts.length) {
        this.debug("Ignoring count " + value + ", this lexical node has contexts we can use instead." + this._contexts.length);
        // this._contexts.length = value;
      } else {
        this._count = value;
      }
    }
  },

  categories: {
    get: function() {
      return this.syntacticCategory.split(/\s+/);
    },
    set: function(value) {
      this.syntacticCategory = value.join(" ");
    }
  },

  datumids: {
    get: function() {
      return this._datumids || [];
    },
    set: function(value) {
      this._datumids = value;
    }
  },

  contexts: {
    get: function() {
      if (!this._contexts) {
        this._contexts = new this.INTERNAL_MODELS["contexts"]();
        this.debug("Initializing contexts of " + this.id);
      }
      return this._contexts;
    },
    set: function(value) {
      // this.debugMode = true;
      this.ensureSetViaAppropriateType("contexts", value);
      // this.debugMode = false;

      this.debug(" set contexts to ", this._contexts);
      // console.log(" setting context ", value);
      // if (!this._contexts || !this._contexts.length) {
      //   this._contexts = value;
      // } else {
      //   var contextIsNew = true;
      //   for (var newContextIndex = 0; newContextIndex < value.length; newContextIndex++) {
      //     var newContext = value[newContextIndex];
      //     this._contexts.map(function(existingContext) {
      //       // If any of the properties in an existing context match, we dont need to add this as a context
      //       for (var attrib in existingContext) {
      //         if (existingContext.hasOwnProperty(attrib) && existingContext[attrib] && existingContext[attrib].length > 2) {
      //           if (existingContext[attrib] === newContext[attrib]) {
      //             console.log("this context already exists", newContext[attrib]);
      //             contextIsNew = false;
      //           }
      //         }
      //       }
      //     });
      //     if (contextIsNew) {
      //       this._contexts.push(newContext);
      //     }
      //   }
      // }
    }
  },

  corpus: {
    get: function() {
      if (this.parent && this.parent.corpus) {
        return this.parent.corpus;
      }
      if (this._corpus) {
        return this._corpus;
      }
    },
    set: function(value) {
      if (this.parent) {
        return;
      }
      this._corpus = value;
    }
  },

  addField: {
    value: function(field) {
      this.debug("Adding a field to lexical node " + this.id, field);
      if (!this.fields) {
        if (!this.corpus || !this.corpus.datumFields || !this.corpus.datumFields.length) {
          this.fields = JSON.parse(JSON.stringify(DEFAULT_CORPUS.datumFields));
        }
      }
      return BASE_LEXICON_NODE.prototype.addField.apply(this, arguments);
    }
  },

  merge: {
    value: function(callOnSelf, anotherObject, optionalOverwriteOrAsk) {
      // this.contexts = LexiconNode.mergeContextsIntoContexts.apply(this, [this]);
      // this.contexts = LexiconNode.mergeContextsIntoContexts.apply(this, [anotherObject]);

      // console.log("this.contexts", this.contexts);
      return BASE_LEXICON_NODE.prototype.merge.apply(this, [callOnSelf, anotherObject, optionalOverwriteOrAsk]);
    }
  },

  uniqueEntriesOnHeadword: {
    value: function(a, b) {
      if (a && !b && this._fieldDBtype === "LexiconNode") {
        a = this;
        b = a;
      }
      // console.log(" checking headword equality ", a.headword, b.headword);

      var equal = true;

      if (!a || !b) {
        equal = false;
        return equal;
      }

      if (a.headword !== b.headword) {
        // console.log(" Head words dont match " + a.headword + " vs " + b.headword)
        equal = false;
        return equal;
      }
      return equal;
    }
  },

  equalDepreated: {
    value: function(b) {
      this.warn(" checking equality ", this.headword, b.headword);

      var a = this;
      var equal = true;
      var fieldIndex,
        field,
        tmpArray;

      if (!a || !b) {
        equal = false;
        return equal;
      }

      if (a.headword !== b.headword) {
        equal = false;
        return equal;
      }

      this.debug(" checking expandedIGTFields", this.expandedIGTFields);
      for (fieldIndex in this.expandedIGTFields) {
        field = this.expandedIGTFields[fieldIndex];
        if (a.hasOwnProperty(field)) {
          this.debug(field);
          if (a[field] !== b[field]) {
            equal = false;
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
    value: "headword",
    writable: true
  },

  compare: {
    value: function(a, b) {
      if (a && !b && this._fieldDBtype === "LexiconNode") {
        a = this;
        b = a;
      }
      var result = 0;
      var sortBy = a.sortBy;

      if (!b || !b || !b[this.sortBy]) {
        return -1;
      }
      if (!a || !a || !a[this.sortBy]) {
        return 1;
      }
      if ((typeof(a[sortBy]) === "number") && (typeof(b[sortBy]) === "number")) {
        result = a[sortBy] - b[sortBy];
      } else if ((typeof(a[sortBy]) === "string") && (typeof(b[sortBy]) === "string")) {
        if (a[sortBy] < b[sortBy]) {
          result = -1;
        } else if (a[sortBy] > b[sortBy]) {
          result = 1;
        } else {
          result = 0; // Same, so cannot be both in the lexicon since they are the same
        }
      } else if (typeof(a[sortBy]) === "string") {
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
        self.warn("There was a problem opening your data.", reason);
        self.bug("There was a problem opening your data. " + reason.userFriendlyErrors);
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
        self.debug(" cleaned promises are finished ", results);
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

      self.debug("Saving cleaned datum...");
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
        results.map(function(result) {
          if (result.state === "fulfilled" && result.value && result.value.ok) {
            self.debug("Your changes have been successfully saved! ", result.value);
          } else {
            self.bug("One of your changes was not saved " + cleanedDatum._id + " " + result.value.userFriendlyErrors.join("\n"));
          }
        });
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

LexiconNode.mergeContextsIntoContexts = function(value) {
  if (!value) {
    return;
  }
  // console.log("mergeContextsIntoContexts: ", value.fieldDBtype);

  var context = {
    URL: ""
  };
  // if (value.id && value.id.length > 3 && (!this.id || value.id !== this.id)) {
  //   context.URL = value.id;
  // }

  var contextWasFound = false;
  if (value.context) {
    if (typeof value.context === "object") {
      context = value.context;
      context.URL = context.URL || "";
      console.log("Context was already an object on this lexical node", context);
    } else {
      context.context = value.context + "";
    }
    // console.log(" Moved context into contexts ", context);
    contextWasFound = true;
    value.context = "";
    delete value.context;
  }

  if (value.utterance) {
    context.utterance = value.utterance + "";
    // console.log(" Moved utterance into contexts ", context);
    contextWasFound = true;
    value.utterance = "";
    delete value.utterance;
    // console.log(" Moved utterance out: ", value.utterance);
  }

  if (value.orthography && value.orthography !== value.morphemes) {
    context.orthography = value.orthography + "";
    // console.log(" Moved orthography into contexts ", value.morphemes);
    contextWasFound = true;
    value.orthography = "";
    delete value.orthography;
  }

  if (!contextWasFound) {
    // console.log("Context was not found, not changed", value.contexts);
    return value.contexts;
  }

  if (!value.contexts) {
    // console.log("Initializing contexts");
    value.contexts = new LexiconNode.prototype.INTERNAL_MODELS["contexts"]([context]);
  } else {
    if (!(value.contexts instanceof LexiconNode.prototype.INTERNAL_MODELS["contexts"])) {
      value.contexts = new LexiconNode.prototype.INTERNAL_MODELS["contexts"]([value.contexts]);
    }
    value.contexts.add(context);
  }
  return value.contexts;
};


exports.LexiconNode = LexiconNode;
