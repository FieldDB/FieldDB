/* globals window, localStorage, d3, document, FieldDB */
"use strict";

var Bindings;
try {
  // var ObservableDOM = require("frb/dom"); // add support for content editable
  // console.log("content editable is defined", ObservableDOM);
  // var Bindings = require("frb/bindings");
  Bindings = FieldDB.Bindings;
} catch (e) {
  Bindings = {
    defineBindings: function(component, bindings) {
      if (false) {
        console.log("Binding should be injected as FieldDB.Bindings to have two-way binding in a user interface", component, bindings);
      }
    }
  };
  console.warn("Warning two-way editable binding in the lexicon won't work because the bindings weren't injected.");
}

var Collection = require("../Collection").Collection;
var CORS = require("../CORS").CORS;
var Q = require("q");
var LexiconNode = require("./LexiconNode").LexiconNode;
var Contexts = require("./Contexts").Contexts;
var mapReduceFactory = require("./../map_reduce/MapReduce").MapReduceFactory;

// Load n grams map reduce which is used in both couchdb and in the codebase
var lexiconNodesMapReduceString = require("../../map_reduce_lexicon/views/lexiconNodes/map").lexiconNodes;
var LEXICON_NODES_MAP_REDUCE = mapReduceFactory({
  filename: "lexiconNodes",
  mapString: lexiconNodesMapReduceString
});

// Load n grams map reduce which is used in both couchdb and in the codebase
var morphemesPrecedenceMapReduceString = require("../../map_reduce_lexicon/views/morphemesPrecedenceContext/map").morphemesPrecedenceContext;
var LEXICON_PRECEDENCE_CONTEXT_MAP_REDUCE = mapReduceFactory({
  filename: "morphemesPrecedenceContext",
  mapString: morphemesPrecedenceMapReduceString
});
/**
 * @class Lexicon is directed graph (triple store) between morphemes and
 *        their allomorphs and glosses. It allows the search to index
 *        the corpus to find datum, it is also used by the default glosser to guess glosses based on what the user inputs on line 1 (utterance/orthography).
 *
 * @description  Lexicon is directed graph (triple store) between morphemes and
 *        their allomorphs and glosses. It allows the search to index
 *        the corpus to find datum, it is also used by the default glosser to guess glosses based on what the user inputs on line 1 (utterance/orthography).
 *
 * @name Lexicon
 * @extends Collection
 *
 * @constructs
 *
 */

var Lexicon = function(json) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "Lexicon";
  }
  json = json || [];

  /* Treat the json in a fielddb way so they dont get added to the Collection directly */
  if (json && (Object.prototype.toString.call(json) === "[object Array]" || json.rows)) {
    if ((json.rows && json.rows[0] && json.rows[0].key && json.rows[0].key.relation) ||
      (json[0] &&
        (json[0].relation || (json[0].key && json[0].key.relation))
      )) {
      if (json.rows) {
        json.entryRelations = json.rows;
      } else {
        json = {
          entryRelations: json
        };
      }
      this.debug("constructing a lexicon from a set of connected nodes " + json.entryRelations.length);
    } else {
      // The array passed in is the actional nodes
      json = {
        collection: json
      };
      this.debug("constructing a lexicon from a set of nodes " + json.collection.length);
    }
  } else {
    json.collection = json.collection || json.wordFrequencies || [];
    if (json.orthography && (!json.collection || json.collection.length === 0) && typeof Lexicon.bootstrapLexicon === "function") {
      this.warn("constructing a lexicon from an orthography");
      Lexicon.bootstrapLexicon(json);
    }
  }

  if (json && json.corpus) {
    this._corpus = json.corpus;
  }

  this.debug("constructing a lexicon from json ");
  this.id = "lexicon";
  Collection.apply(this, [json]);
  if (this.entryRelations) {
    this.debug("constructing a graph from lexicon's relations", json);
    this.updateConnectedGraph();
  }
};

Lexicon.morphemeBoundaryRegEX = /[-=]/g;

Lexicon.prototype = Object.create(Collection.prototype, /** @lends Lexicon.prototype */ {
  constructor: {
    value: Lexicon
  },

  primaryKey: {
    value: "headword"
  },

  INTERNAL_MODELS: {
    value: {
      item: LexiconNode
    }
  },
  /**
   *  Lexicon find will be faster but insert will be slower
   *
   * @type {Object}
   */
  sorted: {
    value: true
  },

  id: {
    get: function() {
      this._id = "lexicon";
      return this._id;
    },
    set: function(value) {
      if (value === this._id) {
        return;
      }
      if (value !== "lexicon") {
        this.warn("Lexicon id cannot be set, it is \"lexicon\" by default." + value);
      }
      value = "lexicon";
      this._id = value;
    }
  },

  capitalizeFirstCharacterOfPrimaryKeys: {
    value: false
  },

  /**
   *  Cleans a value to become a primary key on an object (replaces punctuation with underscore)
   *  (replaces the default Collection.sanitizeStringForPrimaryKey method which scrubs unicode from the primary keys)
   *
   * @param  String value the potential primary key to be cleaned
   * @return String       the value cleaned and safe as a primary key
   */
  sanitizeStringForPrimaryKey: {
    value: function(value) {
      this.debug("sanitizeStringForPrimaryKey");
      if (!value) {
        return null;
      }
      if (typeof value.replace !== "function") {
        value = value + "";
      }
      // this means ? unsure and . fusional will no distinguish between lexical entries
      value = value.replace(/[-""+=?./\[\]{}() ]/g, "");
      return value;
    }
  },

  // getLexicalEntries: {
  //   value: function(lexicalEntryToMatch) {
  //     var deferred = Q.defer(),
  //       matches = [],
  //       self = this;

  //     if (!lexicalEntryToMatch) {
  //       deferred.resolve(matches);
  //     } else {
  //       // this.filter(function(value, key, object, depth) {
  //       this.filter(function(value, key) {
  //         this.debug(key + " of " + self.length);
  //         if (typeof lexicalEntryToMatch.uniqueEntriesOnHeadword === "function") {
  //           if (lexicalEntryToMatch.uniqueEntriesOnHeadword(value)) {
  //             matches.push(value);
  //             this.debug("lexicalEntryToMatch equals ", value);
  //           }
  //         } else {
  //           var howWellDoesThisMatch = 0;
  //           lexicalEntryToMatch = lexicalEntryToMatch.trim();
  //           for (var attr in value) {
  //             if (value.hasOwnProperty(attr) && value[attr] === lexicalEntryToMatch) {
  //               howWellDoesThisMatch = howWellDoesThisMatch + 1;
  //             }
  //           }
  //           if (howWellDoesThisMatch > 0) {
  //             matches.push(value);
  //             this.debug("lexicalEntryToMatch matches well enough ", value);
  //           } else {
  //             this.debug("lexicalEntryToMatch doesnt match ", value);
  //           }
  //         }
  //         if (key === self.length - 1) {
  //           deferred.resolve(matches);
  //         }
  //       }, this);
  //     }
  //     return deferred.promise;
  //   }
  // },

  bindToView: {
    value: function() {
      return this.render(arguments);
    }
  },

  render: {
    value: function(options) {
      var lexicalEntriesElement,
        // binding,
        // bindings = [],
        listElement,
        entryvalue,
        // entrykey,
        // iterate,
        // entryIndex,
        listItemView,
        fieldLabelElement,
        fieldDTElement,
        fieldDDElement,
        fieldElement,
        fieldList,
        headword,
        saveButton,
        contexts,
        igtFields;
      // field,
      // classList;

      options = options || {};
      lexicalEntriesElement = options.lexicalEntriesElement || options.element || this.lexicalEntriesElement;
      if (!lexicalEntriesElement || typeof lexicalEntriesElement.appendChild !== "function") {
        this.warn("Lexicon will be unable to render a visual representation of its lexical entries. If you intended to render it, you should provide an element where it should be rendered.", lexicalEntriesElement);
        return this;
      }

      this.localDOM = options.localDOM || this.localDOM;
      if (!this.localDOM) {
        try {
          this.localDOM = document;
        } catch (e) {
          // this.warn("Lexicon will be unable to render a hover on the connected graph. If you intended to render it, you should provide an localDOM to the lexicon.");
          this.warn("Lexicon will be unable to render the lexical entries. If you intended to render it, you should provide an localDOM to the lexicon.");
          return this;
        }
      }

      var self = this;
      igtFields = options.igtFields;
      if (!igtFields) {
        if (this.corpus && this.corpus.datumFields && this.corpus.datumFields.length) {
          igtFields = [];
          this.corpus.datumFields.map(function(field) {
            if (field && field.type && field.type === "IGT") {
              igtFields.push(field.id);
            }
          });
        } else {
          igtFields = Lexicon.LexiconNode.prototype.expandedIGTFields;
        }
      }

      listElement = self.localDOM.createElement("ul");
      lexicalEntriesElement.appendChild(listElement);

      self.status = "Rendering " + this.collection.length + " entries.";
      this.collection.map(function(entry) {
        var discussion,
          field;

        if (entry && entry.morphemes === "@") {
          return;
        }
        if (entry && entry.morphemes === "_#") {
          return;
        }
        if (entry && entry.morphemes === "#_") {
          return;
        }
        self.status += "\nBinding " + entry.id;
        var cleanAndSaveIfChanged = function(e) {
          e.target.parentElement.__data__.clean().then(function(proposedChanges) {
            if (!proposedChanges || !proposedChanges.length) {
              console.warn("there were no proposed changes.");
              return;
            }
            var changesAsStrings = [];
            proposedChanges.map(function(change) {
              changesAsStrings.push(change.before + " -> " + change.after);
            });
            var saveEditToAllData = self.confirm("Would you like to clean this lexical entry? (This will change all examples you see here to have this new information.)\n\n" + changesAsStrings.join("\n"));
            if (saveEditToAllData) {
              e.target.parentElement.__data__.save().then(function(result) {
                self.debug("Saving success...", result);
                self.popup("Saved " + changesAsStrings.join(" "));
              }, function(reason) {
                self.warn("Saving failed...", reason);
                self.bug("Save failed. " + reason.userFriendlyErrors.join(" "));
              }).fail(function(reason) {
                self.warn("Saving failed...", reason);
                self.bug("Save failed. Please notify the app's developers " + e.target.parentElement.__data__.datumids.join(" "));
              });
            }
          });

        };
        var toggleEditMode = function(e) {
          /* If the user clicks on edit, they can investigate its data in the console */
          if (!e || !e.target || !e.target.__data__) {
            return;
          }
          /* Create the json View if its not there, otherwise toggle its hidden */
          if (!e.target.jsonView) {
            e.target.jsonView = self.localDOM.createElement("textarea");
            e.target.appendChild(e.target.jsonView);
            e.target.jsonView.classList.add("lexiconJSON");
            discussion.hidden = !discussion.hidden;
          } else {
            cleanAndSaveIfChanged(e);
            discussion.hidden = !discussion.hidden;
            e.target.jsonView.hidden = discussion.hidden;
          }
          /* If jsonView is becomming hidden, save its values to the data, otherwise, fill it with the current data */
          if (e.target.jsonView.hidden) {
            var newIgt;
            try {
              newIgt = JSON.parse(e.target.jsonView.innerHTML);
              for (var field in newIgt) {
                if (newIgt.hasOwnProperty(field)) {
                  // e.target.__data__[field] = newIgt[field];
                }
              }
            } catch (except) {
              console.warn("Invalid JSON " + e.target.jsonView.innerHTML, except);
            }
          } else {
            e.target.jsonView.innerHTML = JSON.stringify(e.target.__data__, null, 2);
          }
          try {
            window.currentlySelectedNode = e.target;
            console.log("window.currentlySelectedNode", window.currentlySelectedNode.__data__);
          } catch (e) {
            console.warn("Unable to make current node investigatable on the console.");
          }
        };

        var fakeClassList = {
          add: function() {}
        };

        listItemView = self.localDOM.createElement("li");
        if (!listItemView.classList) {
          listItemView.classList = fakeClassList;
        }
        listItemView.__data__ = entry;
        listItemView.style.opacity = listItemView.__data__.confidence;
        listItemView.classList.add("lexical-entry");
        listItemView.classList.add("scrollable");
        if (listItemView.__data__.morphemes) {
          listItemView.id = listItemView.__data__.morphemes;
        }
        // console.log("\tCreating Node view for " + listItemView.id);

        headword = self.localDOM.createElement("span");
        if (!headword.classList) {
          headword.classList = fakeClassList;
        }
        headword.contentEditable = "true";
        headword.classList.add("headword");
        headword.setAttribute("title", "CLick to edit the headword of your lexical entry");

        saveButton = self.localDOM.createElement("button");
        if (!saveButton.classList) {
          saveButton.classList = fakeClassList;
        }
        saveButton.classList.add("btn");
        saveButton.setAttribute("title", "Click here to save");
        saveButton.innerHTML = "Save ";
        saveButton.onclick = cleanAndSaveIfChanged;

        contexts = self.localDOM.createElement("span");
        if (!contexts.classList) {
          contexts.classList = fakeClassList;
        }
        contexts.classList.add("utteranceContext");

        discussion = self.localDOM.createElement("span");
        if (!discussion.classList) {
          discussion.classList = fakeClassList;
        }
        discussion.contentEditable = "true";
        discussion.classList.add("discussion");
        discussion.hidden = true;
        listItemView.__data__.discussion = listItemView.__data__.discussion || "Lorem ipsum dolor sit amet, consectetur adipisicing elit, ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
        listItemView.ondblclick = toggleEditMode;

        fieldList = self.localDOM.createElement("dl");

        var component = {
          listItemView: listItemView,
          saveButtonView: saveButton,
          headwordView: headword,
          contextsView: contexts,
          discussionView: discussion,
          fieldListView: fieldList,
          fieldViews: {},
          data: entryvalue
        };

        var bindFieldToView = function(lexicalEntry, attribute) {
          if (!lexicalEntry[attribute] || typeof lexicalEntry[attribute] === "object") {
            return;
          }
          headword.classList.add(attribute + ":" + encodeURI(lexicalEntry[attribute]));
          discussion.classList.add(attribute + ":" + encodeURI(lexicalEntry[attribute]));

          fieldDTElement = self.localDOM.createElement("dt");
          fieldLabelElement = self.localDOM.createElement("span");
          if (!fieldLabelElement.classList) {
            fieldLabelElement.classList = fakeClassList;
          }
          fieldLabelElement.innerHTML = attribute;
          fieldLabelElement.classList.add("fieldlabel");
          fieldLabelElement.classList.add(attribute);
          fieldLabelElement.classList.add(encodeURI(lexicalEntry[attribute]));
          fieldDTElement.appendChild(fieldLabelElement);
          fieldList.appendChild(fieldDTElement);

          fieldDDElement = self.localDOM.createElement("dd");
          fieldElement = self.localDOM.createElement("span");
          if (!fieldElement.classList) {
            fieldElement.classList = fakeClassList;
          }
          fieldElement.contentEditable = "true";
          fieldElement.classList.add("fieldvalue");
          fieldElement.classList.add(attribute);
          fieldElement.classList.add(encodeURI(lexicalEntry[attribute]));
          component.fieldViews[attribute] = fieldElement;
          fieldDDElement.appendChild(fieldElement);
          fieldList.appendChild(fieldDDElement);

          var viewPath = "fieldViews." + attribute + ".value";
          var dataPath = "listItemView.__data__." + attribute;
          var bindSet = {};
          bindSet[viewPath] = {
            "<-": dataPath
          };
          var bindTwoWay = {};
          bindTwoWay[dataPath] = {
            "<->": viewPath
          };
          Bindings.defineBindings(component, bindSet);
          Bindings.defineBindings(component, bindTwoWay);
        };

        // Show the user the fields they want first
        igtFields.map(function(fieldname) {
          try {
            bindFieldToView(listItemView.__data__, fieldname);
          } catch (e) {
            console.warn(e.stack);
          }
        });

        for (field in listItemView.__data__) {
          if (!listItemView.__data__.hasOwnProperty(field) || !listItemView.__data__.hasOwnProperty(field)) {
            continue;
          }

          if (field.indexOf("_") === 0) {
            field = field.replace("_", "");
          }
          if (["discussion", "headword", "version", "fieldDBtype"].indexOf(field) > -1) {
            // these get special displays.
            continue;
          }
          if (igtFields.indexOf(field) > -1) {
            // these get special displays.
            continue;
          }
          if (typeof listItemView.__data__[field] === "object" || typeof listItemView.__data__[field] === "function") {
            // this isn't a string to show to the user.
            continue;
          }

          try {
            bindFieldToView(listItemView.__data__, field);
          } catch (e) {
            console.warn(e.stack);
          }
        }

        Bindings.defineBindings(component, {
          "headwordView.value": {
            "<-": "listItemView.__data__.headword"
          },
          "saveButtonView.innerHTML": {
            "<-": "'Save '+listItemView.__data__.headword"
          },
          // "saveButtonView.classList.has('btn-danger')": {
          //   "<-": "listItemView.__data__.unsaved"
          // },
          "discussionView.value": {
            "<-": "listItemView.__data__.discussion"
          },
          "contextsView.innerHTML": {
            // "<-": "' '+listItemView.__data__.contexts.preview+listItemView.__data__.contexts.preview?listItemView.__data__.contexts.preview.length : '0'"
            "<-": "listItemView.__data__.contexts.preview"
          },
          "listItemView.title": {
            "<-": "'Example: '+listItemView.__data__.contexts.preview"
          },
          "listItemView.hidden": {
            "<-": "listItemView.__data__.confidence < self.localDOM.getElementById('lexiconConfidenceThreshold').value / 10"
          }
        });

        Bindings.defineBindings(component, {
          "listItemView.__data__.headword": {
            "<->": "headwordView.value"
          },
          "listItemView.__data__.discussion": {
            "<->": "discussionView.value"
          }
        });

        listItemView.appendChild(headword);
        listItemView.appendChild(discussion);
        listItemView.appendChild(fieldList);
        listItemView.appendChild(contexts);
        listItemView.appendChild(saveButton);
        listElement.appendChild(listItemView);

      });

      return this;
    }
  },

  entryRelations: {
    get: function() {
      return this._entryRelations;
    },
    set: function(value) {
      if (!value) {
        return;
      }
      if (value && value.rows) {
        value = value.rows;
      }

      var previousMorph;
      var morphemeIndex;
      var ngram;
      var morphemes;
      var relation;
      var count;
      var context;

      this.glossMightBeMissingFromMorphemesNGram = false;
      var shouldSkipWordBounariesUnlessSpecified = !this.corpus || !this.corpus.prefs || !this.corpus.prefs.showGlosserAsMorphemicTemplate;
      if (Object.prototype.toString.call(value) === "[object Array]") {
        this._entryRelations = this._entryRelations || [];
        var uniqueNGrams = {};
        var foundNgram = false;
        for (var rowIndex = 0; rowIndex < value.length; rowIndex++) {
          if (!value.hasOwnProperty(rowIndex) || !value[rowIndex]) {
            this.debug("skipping ", value[rowIndex]);
            continue;
          }
          morphemes = value[rowIndex].key || value[rowIndex];
          if (typeof morphemes === "object") {
            this.debug("not upgrading entity relations");
            continue;
          }
          // Convert into a string and slit on boundaries
          morphemes = (morphemes + "").split(Lexicon.morphemeBoundaryRegEX);
          count = 1;
          context = "";
          if (typeof value[rowIndex].value === "number") {
            count = value[rowIndex].value;
          } else {
            context = value[rowIndex].value;
            count = 0;
          }

          // Loop through bigrams in the ngrams
          previousMorph = morphemes[0];
          for (morphemeIndex = 1; morphemeIndex < morphemes.length; morphemeIndex++) {
            this.debug(" working on " + previousMorph + "-" + morphemes[morphemeIndex]);
            if (shouldSkipWordBounariesUnlessSpecified && (previousMorph === "@" || morphemes[morphemeIndex] === "@")) {
              this.debug("Skipping word boundary since it makes the relations significantly smaller, and it wasnt specifically requested in the corpus preferences showGlosserAsMorphemicTemplate: " + morphemes);
              previousMorph = morphemes[morphemeIndex];
              continue;
            }
            // Look to see if relation was already found
            relation = uniqueNGrams[previousMorph + "-" + morphemes[morphemeIndex]];
            if (relation) {
              if (count) {
                relation.count += count;
              }
              if (context) {
                relation.source.contexts.add(context);
                relation.target.contexts.add(context);
              }
              this.debug(" already found " + relation.count, relation.contexts);
            } else {
              this.debug("  new ");
              relation = {
                source: {
                  morphemes: previousMorph,
                },
                target: {
                  morphemes: morphemes[morphemeIndex],
                },
                relation: "precedes"
              };
              if (count) {
                relation.count = count;
              }
              if (context) {
                relation.source.contexts = new Lexicon.Contexts([context]);
                relation.target.contexts = new Lexicon.Contexts([context]);
              }
              /* make the @ more like what a linguist recognizes for word boundaries */
              if (relation.source.morphemes === "@") {
                relation.source.morphemes = "#_";
              }
              if (relation.target.morphemes === "@") {
                relation.target.morphemes = "_#";
              }
              uniqueNGrams[previousMorph + "-" + morphemes[morphemeIndex]] = relation;
              this._entryRelations.push(relation);
              foundNgram = true;
            }
            previousMorph = morphemes[morphemeIndex];
          }
        }
        // If no ngrams were found, then this is probably an array of entry relations already
        if (!foundNgram) {
          this._entryRelations = value;
        } else {
          this.glossMightBeMissingFromMorphemesNGram = true;
        }
        this.debug("uniqueNGrams", uniqueNGrams);
      } else {
        this.debug(" Converting object of ngrams in to relations", value);
        this._entryRelations = this._entryRelations || [];
        this.glossMightBeMissingFromMorphemesNGram = true;

        for (ngram in value) {
          if (!value.hasOwnProperty(ngram) || !ngram || ngram === "length") {
            continue;
          }
          morphemes = ngram.split(Lexicon.morphemeBoundaryRegEX);
          previousMorph = morphemes[0];
          for (morphemeIndex = 1; morphemeIndex < morphemes.length; morphemeIndex++) {
            this.debug(" working on " + previousMorph + "-" + morphemes[morphemeIndex]);
            if (shouldSkipWordBounariesUnlessSpecified && (previousMorph === "@" || morphemes[morphemeIndex] === "@")) {
              this.debug("Skipping word boundary since it makes the relations significantly smaller, and it wasnt specifically requested in the corpus preferences showGlosserAsMorphemicTemplate: " + morphemes);
              previousMorph = morphemes[morphemeIndex];
              continue;
            }
            relation = {
              source: {
                morphemes: previousMorph,
              },
              target: {
                morphemes: morphemes[morphemeIndex],
              },
              relation: "precedes"
            };
            previousMorph = morphemes[morphemeIndex];
            if (typeof value[ngram] === "number") {
              relation.count = value[ngram];
            } else if (Object.prototype.toString.call(value[ngram]) === "[object Array]") {
              relation.source.contexts = value[ngram];
              relation.target.contexts = value[ngram];
            } else {
              relation.source.contexts = value[ngram];
              relation.target.contexts = value[ngram];
            }
            /* make the @ more like what a linguist recognizes for word boundaries */
            if (relation.source.morphemes === "@") {
              relation.source.morphemes = "#_";
            }
            if (relation.target.morphemes === "@") {
              relation.target.morphemes = "_#";
            }
            this._entryRelations.push(relation);
          }
        }
      }
    }
  },

  precedenceRelations: {
    get: function() {
      return this.entryRelations;
    },
    set: function(value) {
      this.entryRelations = value;
    }
  },

  guessFirstGloss: {
    value: function(datum) {

      if (!datum.morphemes) {
        console.warn("There was no morphemes line to guess the gloss from...");
        return datum;
      }
      var glossGroups = [];
      var matchingNodes = [];
      var morphemeToFind = "";
      var morphemeGroup = datum.morphemes.trim().split(/\s+/);
      for (var group in morphemeGroup) {
        var morphemes = morphemeGroup[group].split(Lexicon.morphemeBoundaryRegEX);
        var glosses = [];
        for (var m in morphemes) {
          if (!morphemes.hasOwnProperty(m)) {
            continue;
          }
          matchingNodes = [];
          var gloss = "?"; // If there's no matching gloss, use question marks
          morphemeToFind = morphemes[m];
          if (!morphemeToFind) {
            glosses.push(gloss);
            continue;
          }
          this.debug("looking for " + morphemeToFind);
          matchingNodes = this.find("morphemes", morphemeToFind);
          if (matchingNodes && matchingNodes.length > 0) {
            // Take the first gloss for this morpheme
            // this.debug("Glosses which match: " + morphemes[m], matchingNodes);
            try {
              gloss = matchingNodes[0].gloss || "?";
            } catch (e) {
              // this.debug(matchingNodes);
            }
          }

          this.debug("found  " + gloss);
          glosses.push(gloss);
        }

        glossGroups.push(glosses.join("-"));
      }
      datum.gloss = glossGroups.join(" ");
      datum.alternateGlossLines = datum.alternateGlossLines ? datum.alternateGlossLines.concat(glossGroups.join(" ")) : [datum.gloss];
      // Replace the gloss line with the guessed glosses
      return datum;
    }
  },

  guessContextSensitiveGlosses: {
    value: function(datum) {
      if (!datum.morphemes) {
        console.warn("There was no morphemes line to guess the gloss from...");
        return datum;
      }
      var glossGroups = [];
      var matchingNodes = [];
      var morphemeToFind = "";
      var morphemeGroup = datum.morphemes.trim().split(/\s+/);
      for (var groupIndex in morphemeGroup) {
        if (groupIndex > 0 && groupIndex < morphemeGroup) {
          glossGroups.push([" "]);
        }
        var morphemes = morphemeGroup[groupIndex].split(Lexicon.morphemeBoundaryRegEX);
        for (var m = 0; m < morphemes.length; m++) {
          if (m > 0 && m < morphemes.length) {
            glossGroups.push(["-"]);
          }
          morphemeToFind = morphemes[m];
          if (!morphemeToFind) {
            glossGroups.push(["?"]);
            continue;
          }
          this.debug("looking for " + morphemeToFind);
          matchingNodes = this.find("morphemes", morphemeToFind);
          if (matchingNodes && matchingNodes.length > 0 && matchingNodes[0].gloss) {
            glossGroups.push(matchingNodes);
          } else {
            glossGroups.push(["?"]);
          }
        }
      }
      // this.debug(glossGroups);
      datum.alternateGlossLines = datum.alternateGlossLines || [];

      datum.gloss = glossGroups.map(function(position) {
        if (position && position.length) {
          var gloss = position[0];
          if (typeof gloss !== "string") {
            gloss = position[0].gloss;
          }
          return gloss;
        }
      }).join("");
      datum.alternateGlossLines.unshift(datum.gloss);
      // Replace the gloss line with the guessed glosses
      return datum;
    }
  },

  maxLexiconSize: {
    get: function() {
      if (this._maxLexiconSize) {
        return this._maxLexiconSize;
      }

      if (this.corpus && this.corpus.prefs && this.corpus.prefs.maxLexiconSize) {
        return this.corpus.prefs.maxLexiconSize;
      }

      return Lexicon.maxLexiconSize;
    },
    set: function(value) {
      if (this.corpus && this.corpus.prefs) {
        this.corpus.prefs.maxLexiconSize = value;
      } else {
        this._maxLexiconSize = value;
      }
    }
  },

  set: {
    value: function(searchingFor, originalValue, optionalKeyToIdentifyItem, optionalInverted) {
      if (originalValue && originalValue.key) {
        originalValue = Lexicon.convertMapReduceRowIntoLexicalEntry(originalValue);
      }
      if (!originalValue) {
        return;
      }
      if (this.length > this.maxLexiconSize) {
        this.debug("Lexicon is too big, ignoring...", originalValue);
        return;
      }

      // this.debugMode = true;
      if (originalValue && typeof originalValue !== "string" && typeof Lexicon.LexiconNode.mergeContextsIntoContexts === "function") {
        this.debug("\n adding   ", originalValue, "\n");
        Lexicon.LexiconNode.mergeContextsIntoContexts(originalValue);
        this.debug("done combining contexts", originalValue.contexts);
      }
      if (!(originalValue instanceof Lexicon.LexiconNode)) {
        this.debug("converting into node", originalValue);
        // originalValue.debugMode = true;
        originalValue = new Lexicon.LexiconNode(originalValue);
        this.debug(" converted into node headword", originalValue.headword);
      }
      this.debug("looking for  " + originalValue.headword + " in ", this.collection.length);

      var matches;
      // expects gloss to be ? if it should have been available but was not, otherwise it assumes we are working with precedence relations.
      if (originalValue.gloss && !this.glossMightBeMissingFromMorphemesNGram) {
        matches = this.find(originalValue);
      } else {
        // find nodes where the gloss is ? or empty: doesnt work.
        // matches = this.find("headword", originalValue.morphemes+ "|");
        // matches = this.find({"morphemes", originalValue.morphemes, gloss: "?"});

        // find any node which has morphemes and any gloss // this combine nodes which shouldnt be combined.
        matches = this.find("morphemes", originalValue.morphemes);
        if (matches.length > 1) {
          this.debug("found " + matches.length + " lexical entries which has these morphemes: " + originalValue.morphemes);
          var bestmatch = -1;
          for (var entryIndex = matches.length - 1; entryIndex >= 0; entryIndex--) {
            if (matches[entryIndex].id === originalValue.morphemes + "|") {
              bestmatch = entryIndex;
              break;
            }
          }
          if (bestmatch > -1) {
            matches = [matches[bestmatch]];
            this.debug("using the one that also has an unspecified gloss.");
          } else {
            this.warn("found " + matches.length + " lexical entries which has these morphemes: " + originalValue.morphemes + ". But using none of them because they all have glosses and this node came from a morpheme segmetnation with no gloss so we cant know which entry it refers to: " + matches.map(function(entry) {
              return entry.id;
            }));
            matches = [];
          }
        } else {
          // This could have sideffects where lexicons which are being built will merge words with no gloss into words with a gloss.
          this.debug("found " + matches.length + " lexical entries which has these morphemes: " + originalValue.morphemes);
        }
      }
      this.debug("matching lexical entries ", matches);
      var value;
      if (matches && matches.length) {
        value = matches[0];
        // Average the confidences together
        if (value.confidence && originalValue.confidence) {
          value.confidence = originalValue.confidence = (parseFloat(value.confidence, 10) + parseFloat(originalValue.confidence, 10)) / 2;
        }
        // Add counts
        if (value.count && originalValue.count) {
          value.count = originalValue.count = parseFloat(value.count, 10) + parseFloat(originalValue.count, 10);
        }
        // Make id match if it was incomplete in the incoming item
        if (value.gloss && !originalValue.gloss) {
          originalValue.gloss = value.gloss;
        }
        value.merge("self", originalValue, "overwrite");
      } else {
        value = Collection.prototype.set.apply(this, [searchingFor, originalValue, optionalKeyToIdentifyItem, optionalInverted]);
        if (value) {
          this.debug(" finished setting lexical entry " + value.id);
        } else {
          this.warn("Entry wasnt added", originalValue);
        }
      }

      return value;
    }
  },

  /**
   *  Adds a node to the lexicon, if an equivalent node (as defined by the equals function)
   *  is found, it merges the new one into the existing one.
   *
   * @param  {Object} value A node or array of nodes
   * @return {Object}       The node or array of nodes which were added
   */
  addOrMergeDeprecated: {
    value: function(value) {
      if (!value) {
        return value;
      }
      if (value && Object.prototype.toString.call(value) === "[object Array]") {
        for (var itemIndex = 0; itemIndex < value.length; itemIndex++) {
          value[itemIndex] = this.addOrMergeDeprecated(value[itemIndex]);
        }
        return value;
      }

      this.debug("running addOrMergeDeprecated", value.headword);
      var existingInLexicon = this.find(value);
      if (existingInLexicon && existingInLexicon.length) {
        existingInLexicon = existingInLexicon[0];
        this.debug("Merging a simlar entry into the existing entry in the lexicon " + existingInLexicon.headword + " " + value.headword);
        existingInLexicon.merge("self", value);
        value = existingInLexicon;
      } else {
        if (!(value instanceof Lexicon.LexiconNode)) {
          value = new Lexicon.LexiconNode(value);
        }
        value = this.add(value);
        this.debug("Added value " + value.headword);
      }

      return value;
    }
  },

  /**
   * Takes as a parameters an array of this.entryRelations which came from CouchDB precedence rule query.
   * Example Rule: {"key":{"x":"@","relation":"precedes","y":"aqtu","context":"aqtu-nay-wa-n"},"value":2}
   */
  generatePrecedenceForceDirectedRulesJsonForD3: {
    value: function() {
      return this.updateConnectedGraph(arguments);
    }
  },

  updateConnectedGraph: {
    value: function(prefs) {
      if (!this.entryRelations || !this.entryRelations.length) {
        this.warn("Cannot visualize relations between lexical entities if the lexicon doesn't know about any entryRelations");
        return;
      }

      var self = this;
      if (!prefs && this.corpus && this.corpus.prefs) {
        prefs = this.corpus.prefs;
      }
      if (!prefs) {
        prefs = {};
      }
      /*
       * Create the JSON required by D3
       */
      this.connectedGraph = this.connectedGraph || {
        length: 0,
        nodes: {},
        links: []
      };

      this.availableLexicalRelations = this.availableLexicalRelations = [{
        icon: "<i class=\"fa fa-arrow-right\"></i>",
        name: "Precedes",
        maker: ": Show x-> y",
        ticked: true
      }, {
        icon: "<i class=\"fa fa-arrow-left\"></i>",
        name: "Follows",
        maker: ": Show x <- y",
        ticked: false
      }, {
        icon: "<i class=\"fa fa-volume-up\"></i>",
        name: "Phonology",
        maker: ": Show phonological priming",
        ticked: false
      }, {
        icon: "<i class=\"fa fa-globe\"></i>",
        name: "Semantics",
        maker: ": Show semantic priming",
        ticked: false
      }, {
        icon: "<i class=\"fa fa-share\"></i>",
        name: "Syntax",
        maker: ": Show morpho-syntactic priming",
        ticked: false
      }, {
        icon: "<i class=\"fa fa-refresh\"></i>",
        name: "All ",
        maker: ": Show all relations in the lexicon",
        ticked: false
      }];

      /*
       * Cycle through the precedence rules, convert them into graph edges with the morpheme index in the morpheme array as the source/target values
       */
      this.entryRelations.map(function(entryRelation) {
        if (!entryRelation) {
          return;
        }
        try {
          var connectionEdge = entryRelation.key || entryRelation;
          connectionEdge.count = entryRelation.value ? entryRelation.value : (entryRelation.key ? entryRelation.key.count : null);
          self.debug("Adding ", connectionEdge, " to connected graph");

          var source = connectionEdge.source || connectionEdge.from || connectionEdge.previous || connectionEdge.x;
          var target = connectionEdge.target || connectionEdge.to || connectionEdge.subsequent || connectionEdge.y;

          var datumid = entryRelation.id || "";
          if (!datumid) {
            self.debug("Cant figure out the URL(s) of where this node might have come from");
          }

          // Ensuring notes are objects
          if (!(source instanceof Lexicon.LexiconNode)) {
            self.debug("\nCreating lexical entry from only orthography " + source);
            source = new Lexicon.LexiconNode(source);
            self.debug("Converted source into a lexicon node", source.headword);
          }

          if (!(target instanceof Lexicon.LexiconNode)) {
            self.debug("\nCreating lexical entry from only orthography " + target);
            target = new Lexicon.LexiconNode(target);
            self.debug("Converted target into a lexicon node", target.headword);
          }

          // Upgrade v1 edges
          if (connectionEdge.context && typeof connectionEdge.context === "string") {
            self.debug("Upgrading v1 precedence relation to node and edges");
            var context = {
              URL: datumid,
              morphemes: connectionEdge.context
            };
            if (connectionEdge.count) {
              context.count = connectionEdge.count;
            } else {
              self.debug("Don't know how often this context appears", entryRelation.value);
            }
            source.contexts = [context];
            target.contexts = [context];
          } else {
            self.debug("This is not a v1 relation", entryRelation);
            if (connectionEdge.count) {
              self.debug("setting frequencyCount using edge count", connectionEdge.count);
              source.count += connectionEdge.count;
              target.count += connectionEdge.count;
            }
          }

          if (!source || !target) {
            self.warn("Missing either a `source` or `target` ", source, target);
            return;
          }

          /* skip word boundaries unless otherwise specified */
          if (source.morphemes === "@" ||
            source.morphemes === "_#" ||
            source.morphemes === "#_" ||
            target.morphemes === "@" ||
            target.morphemes === "_#" ||
            target.morphemes === "#_") {
            if (!prefs.showGlosserAsMorphemicTemplate) {
              self.debug("Skipping a connection involving a word boundary ", connectionEdge);
              return;
            }
          }
          /* make the @ more like what a linguist recognizes for word boundaries */
          if (source.morphemes === "@") {
            source.morphemes = "#_";
          }
          if (target.morphemes === "@") {
            target.morphemes = "_#";
          }

          if (!source.morphemes || !target.morphemes) {
            self.warn("Missing morphemes on the nodes, this relation cant be added to the graph ", source, target);
            return;
          }

          // use bigrams unless otherwise specified
          if ((!prefs.maxDistanceForContext && connectionEdge.distance > 1) ||
            (prefs.maxDistanceForContext & connectionEdge.distance > prefs.maxDistanceForContext)) {
            self.debug("Skipping distantly related nodes " + connectionEdge.distance);
            return;
          }
          // visualize only precedes connectionEdges unless otherwise specified
          if ((!prefs.showRelations && connectionEdge.relation !== "precedes") ||
            (prefs.showRelations && prefs.showRelations.indexOf(connectionEdge.relation) === -1)) {
            self.debug("Skipping nodes which arent related by precedence " + connectionEdge.relation);
            return;
          }

          if (!self.isWithinConfidenceRange(source, prefs.confidenceRange) ||
            !self.isWithinConfidenceRange(target, prefs.confidenceRange)) {
            self.warn("Skipping nodes which arent confident enough ", connectionEdge.confidence);
            return;
          }

          // If the utterance contains the whole word, ie the context, not just the utterance of this morpheme we dont really want it
          // delete source.utterance;
          // delete target.utterance;
          // delete source.orthography;
          // delete target.orthography;
          //

          // connectionEdge.contexts = context.utterance;
          // connectionEdge.datumid = context.id;

          // // Put the previous and subsequent morphemes into the morpheme nodes
          // // this.add(context.utterance, new Lexicon.LexiconNode({
          // //   fields: source
          // // }));
          // source.datumids = [context.id];
          // source.contexts = [context.utterance];
          // if (context.url) {
          //   source.url = context.url;
          // }

          // // this.add(context.utterance, new Lexicon.LexiconNode({
          // //   fields: source
          // // }));
          // target.datumids = [context.id];
          // target.contexts = [context.utterance];
          // if (context.url) {
          //   target.url = context.url;
          // }
          // this.references.add(context.id);

          // //To avoid loops
          // if (target.morphemes.indexOf("@") === -1) {
          //   this.entryRelations.add(entryRelations[i].key);
          // }

          // TODO what if a similar node is here, we should merge them.
          source = self.add(source);
          target = self.add(target);

          if (!source || !target) {
            self.debug("Skipping relation beause one fo the two nodes was excluded from the graph (probably lexicon is too big)");
            return;
          }

          // Add the source node to the list of nodes, if it is not already there
          if (!self.connectedGraph.nodes[source.headword]) {
            self.connectedGraph.length++;
            self.connectedGraph.nodes[source.headword] = source;
          } else {
            if (self.connectedGraph.nodes[source.headword] !== source) {
              self.warn(source.morphemes + " was already defined. merging with this node " + source.headword);
              self.connectedGraph.nodes[source.headword].merge("self", source, "overwrite");
            }
          }
          source = self.connectedGraph.nodes[source.headword];

          // Add the target node to the list of nodes, if it is not already there
          if (!self.connectedGraph.nodes[target.headword]) {
            self.connectedGraph.length++;
            self.connectedGraph.nodes[target.headword] = target;
          } else {
            if (self.connectedGraph.nodes[target.headword] !== target) {
              self.warn(target.morphemes + " was already defined. merging with this node");
              self.connectedGraph.nodes[target.headword].merge("self", target, "overwrite");
            }
          }
          target = self.connectedGraph.nodes[target.headword];

          // Use the language of connected graphs
          connectionEdge.source = source;
          connectionEdge.target = target;

          // Dont keep other names for the two nodes
          delete connectionEdge.previous;
          delete connectionEdge.subsequent;
          delete connectionEdge.from;
          delete connectionEdge.to;

          self.connectedGraph[connectionEdge.relation] = self.connectedGraph[connectionEdge.relation] || [];
          self.connectedGraph[connectionEdge.relation].push(connectionEdge);
          self.connectedGraph.links.push(connectionEdge);
        } catch (exception) {
          self.warn("Skipping relation because of an error " + exception, exception.stack, entryRelation);
        }
      });

      this.updateAvailableLexicalRelations();

      return this.connectedGraph;
    }
  },

  /**
   * Add any new reltions to the list that the user can choose from
   * @return {Array} updated list of available lexical relations
   */
  updateAvailableLexicalRelations: {
    value: function() {
      if (!this.connectedGraph) {
        this.warn("unable to update availableLexicalRelations, connectedGraph is not defined.");
        return;
      }

      this.availableLexicalRelations = this.availableLexicalRelations || [];
      var attrib;
      var self = this;
      var relationsIndex = {};

      this.availableLexicalRelations.map(function(availableRelation) {
        relationsIndex[availableRelation.name.toLowerCase()] = availableRelation;
      });

      for (attrib in this.connectedGraph) {
        if (!this.connectedGraph.hasOwnProperty(attrib) || !this.connectedGraph[attrib] || !this.connectedGraph[attrib].length) {
          continue;
        }
        if (["nodes"].indexOf(attrib) > -1) {
          continue;
        }
        if (relationsIndex[attrib] || (attrib === "links" && relationsIndex["all"])) {
          relationsIndex[attrib].count = self.connectedGraph[attrib].length;
        } else {
          this.availableLexicalRelations.push({
            icon: "<i class=\"fa fa-link\"></i>",
            name: attrib,
            maker: ": Other",
            ticked: false,
            count: this.connectedGraph[attrib].length
          });
        }
      }
      return this.availableLexicalRelations;
    }
  },

  dbname: {
    get: function() {
      if (this._dbname) {
        return this._dbname;
      }
      if (this.corpus && this.corpus.dbname) {
        return this.corpus.dbname;
      }
    },
    set: function(value) {
      this._dbname = value;
    }
  },

  /**
   * Overwrite/build the lexicon from the corpus server if it is there, saves
   * the results to local storage so they can be reused offline.
   *
   * OLD url /_design/deprecated/_view/lexicon_create_tuples?group=true
   *
   * New url _design/lexicon/_view/morphemesPrecedenceContext?group=true&limit=400
   *
   * @param options
   * @param callback
   */
  fetch: {
    value: function(options) {
      var deferred = Q.defer(),
        self = this;

      if (this.fetching && this.whenReady) {
        this.warn("Fetching is in process, don't need to fetch right now...");
        return this.whenReady;
      }

      options = options || {};

      var url = "";
      if (options.url) {
        url = options.url;
      }

      if (!url || url === "default") {
        if (!this.dbname && !options.dbname) {
          throw "Glosser's webservice can't be guessed, there is no current corpus so the URL must be defined.";
        }
        if (this.corpus.prefs && this.corpus.prefs.lexiconURL) {
          url = this.corpus.prefs.lexiconURL;
        } else {
          url = this.corpus.url + "/_design/lexicon/_view/" + LEXICON_NODES_MAP_REDUCE.filename + "?group=true&limit=" + this.maxLexiconSize;
        }
      }

      this.fetching = true;
      this.whenReady = deferred.promise;

      Lexicon.CORS.makeCORSRequest({
          type: "GET",
          url: url
        })
        .then(function(results) {
            self.fetching = false;
            if (!results || !results.rows || !results.rows.length) {
              deferred.reject({
                details: results,
                userFriendlyErrors: ["The result from the server was not a standard response. Please report this."]
              });
              return;
            }
            self.add(results.rows);
            deferred.resolve(self.collection);
          },
          function(reason) {
            self.fetching = false;
            deferred.reject(reason);
          })
        .fail(function(error) {
          self.fetching = false;
          console.error(error.stack, self);
          deferred.reject(error);
        });

      return deferred.promise;
    }
  },

  fetchConnectedGraph: {
    value: function(options) {
      this.debug("not doing anything for fetchConnectedGraph ", options);
    }
  },

  buildLexiconFromCouch: {
    value: function(dbname, callback) {
      this.warn("DEPRECATED buildLexiconFromCouch use fetch instead. not using " + dbname, callback);
    }
  },
  /**
   * Overwrite/build the lexicon from local storage if it is there.
   *
   * @param dbname
   * @param callback
   */
  buildLexiconFromLocalStorage: {
    value: {
      value: function(dbname, callback) {
        var results = localStorage.getItem(dbname + "lexiconResults");
        if (!results) {
          return;
        }
        this.generatePrecedenceForceDirectedRulesJsonForD3(results);
        if (typeof callback === "function") {
          callback();
        }
      }
    }
  },

  isWithinConfidenceRange: {
    value: function(morpheme, confidenceRange) {
      if (!confidenceRange) {
        return true;
      }
      return morpheme.confidence <= confidenceRange.max && morpheme.confidence >= confidenceRange.min;
    }
  },

  /*
   * Some sample D3 from the force-html.html example
   * http://bl.ocks.org/mbostock/1153292
   * http://alignedleft.com/tutorials/d3/binding-data
   *
   * @param  {Object} rulesGraph [description]
   * @param  {Object} divElement [description]
   * @param  {Object} dbname  [description]
   * @return {Object}            [description]
   */
  visualizeAsForceDirectedGraph: {
    value: function(options) {
      var self = this;
      options = options || {};
      var divElement = options.divElement || options.connectionsElement || options.element;
      var prefs = options.prefs;

      if (!prefs && this.corpus && this.corpus.prefs) {
        prefs = this.corpus.prefs;
      }
      if (!prefs) {
        prefs = {};
      }
      if (!prefs.showRelations) {
        prefs.showRelations = ["precedes"];
      }
      if (!this.connectedGraph || (!this.connectedGraph.links || !this.connectedGraph.links.length) || !this.connectedGraph.nodes) {
        this.warn("Updating the connected graph, it wasnt ready yet. ", this.connectedGraph);
        this.updateConnectedGraph(prefs);

        if (!this.connectedGraph || !this.connectedGraph.nodes) {
          return this;
        }
        // Include only relations which the preferences request
        this.connectedGraph.links = [];
        prefs.showRelations.map(function(relation) {
          if (!relation || !self.connectedGraph[relation] || !self.connectedGraph[relation].length) {
            return this;
          }
          self.connectedGraph.links = self.connectedGraph.links.concat(self.connectedGraph[relation]);
        });
      } else {
        this.warn("Not updating the connected graph, it was already generated.");
      }

      this.debug("Displaying a connected graph of " + this.connectedGraph.links.length + " links");

      if (self.connectedGraph.links.length === 0) {
        return this;
      }

      if (!this.d3) {
        try {
          this.d3 = d3;
        } catch (e) {
          this.warn("Lexicon will be unable to render a visual representation of itself. If you intended to render it, you should add d3 as a dependancy to your app.", this.d3);
          return this;
        }
      }

      if (!divElement) {
        this.warn("Lexicon will be unable to render a visual representation of itself. If you intended to render it, you should provide an divElement where it should be rendered.", divElement);
        return this;
      }
      this.debug("Using divElement", divElement);

      var width = options.width || divElement.clientWidth || 200,
        height = options.height || 350;

      if (prefs.clear) {
        if (this.connectedGraph.svg && this.connectedGraph.svg[0] && this.connectedGraph.svg[0][0] && this.connectedGraph.svg[0][0].innerHTML) {
          this.connectedGraph.svg[0][0].innerHTML = "";
        }
      } else {
        if (divElement.children && divElement.children.length && this.connectedGraph.svg && this.connectedGraph.svg[0] && this.connectedGraph.svg[0][0] && this.connectedGraph.svg[0][0].innerHTML) {
          this.debug("Not re-rendering the lexicon connected graph.");
          return self;
        }
      }

      var tooltip;
      if (!self.localDOM) {
        try {
          self.localDOM = document;
        } catch (e) {
          // self.warn("Lexicon will be unable to render a hover on the connected graph. If you intended to render it, you should provide an localDOM to the self.");
          self.warn("Lexicon will be unable to render the connected graph. If you intended to render it, you should provide an localDOM to the self.");
          return self;
        }
      }
      tooltip = self.localDOM.createElement("div");
      self.localDOM.body.appendChild(tooltip);
      tooltip = this.d3.select(tooltip)
        .style("position", "absolute")
        .style("z-index", "10")
        .style("visibility", "hidden")
        .html("");

      var linkArc = function(d) {
        var dx = d.source.x - d.target.x,
          dy = d.source.y - d.target.y,
          dr = Math.sqrt(dx * dx + dy * dy); //uncomment to curve the lines
        // dr = 0;
        return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
      };

      var transform = function(d) {
        if (d.morphemes === "_#") {
          d.x = width - 20;
          d.y = height / 2;
        }
        if (d.morphemes === "#_") {
          d.x = 20;
          d.y = height / 2;
        }
        return "translate(" + d.x + "," + d.y + ")";
      };

      /*
       Short morphemes will be blue, long will be red
       */
      var color = this.d3.scale.linear()
        .range(["darkblue", "darkred"]) // or use hex values
        .domain([1, 8]);

      // var lineColor = this.d3.scale.linear()
      //   .range(["#FFFFF", "#FFFF00"]) // or use hex values
      //   .domain([1, 8]);

      // var x = this.d3.scale.linear()
      //   .range([0, width]);

      // var y = this.d3.scale.linear()
      //   .range([0, height - 40]);

      var colorByMorphemeLength = function(lexicalEntry) {
        if (lexicalEntry.morphemes === "#_") {
          return "#00000";
        }
        if (lexicalEntry.morphemes === "_#") {
          return "#fffff";
        }
        if (!lexicalEntry.morphemes) {
          self.warn("this morpheme is empty ", lexicalEntry);
          return "#ffffff";
        }
        return color(lexicalEntry.morphemes.length);
        // return color(d.confidence * 10);
      };

      var force = this.d3.layout.force()
        .nodes(this.d3.values(self.connectedGraph.nodes)) // can be an object
        .links(self.connectedGraph.links)
        .size([width, height])
        // .linkStrength(0.5)
        .linkDistance(30)
        .friction(0.5)
        .charge(-120);

      // force.nodes().map(function(node){
      //   node.x = width/2;
      //   node.y = height/2;
      // });

      this.connectedGraph.svg = self.localDOM.createElement("svg");
      if (typeof divElement.appendChild !== "function") {
        self.warn("You have provided a defective divElement, it is unable to append divElements to itself. Appending to the body of the document instead.", divElement);
        // return self;
        self.localDOM.body.appendChild(self.connectedGraph.svg);
      } else {
        divElement.appendChild(self.connectedGraph.svg);
      }
      this.connectedGraph.svg = this.d3.select(self.connectedGraph.svg);
      try {
        this.connectedGraph.svg = this.d3.select(divElement).append("svg");
      } catch (e) {
        //couldnt use the dom, the svg wont work really well.
      }

      self.connectedGraph.svg.attr("width", width)
        .attr("height", height);

      self.connectedGraph.svg.append("defs").selectAll("marker")
        .data(force.links())
        // .data(["suit", "licensing", "resolved"])
        .enter()
        .append("marker")
        .attr("id", function(d) {
          return d;
        })
        .style("opacity", function() {
          // return color(d.morphemes.length);
          return 0.5;
        })
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -1.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5");

      // var titletext = "Click to search morphemes in your corpus";

      // //A label for the current year.
      // var title = self.connectedGraph.svg.append("text")
      //   .attr("class", "vis-title")
      //   .attr("dy", "1em")
      //   .attr("dx", "1em")
      //   .style("fill", "#cccccc")
      //   //    .attr("transform", "translate(" + x(1) + "," + y(1) + ")scale(-1,-1)")
      //   .text(titletext);

      //this.d3.json("./libs/rules.json", function(json) {

      // var path = self.connectedGraph.svg.append("g").selectAll("path")
      //   .data(force.links())
      //   .enter().append("line")
      //   .attr("class", "link")
      //   .style("stroke", function(d) {
      //     return lineColor(d.value);
      //   })
      //   .style("stroke-width", function(d) {
      //     return d.value;
      //   });

      var path = self.connectedGraph.svg.append("g").selectAll("path")
        .data(force.links())
        .enter().append("path")
        .attr("class", function(d) {
          var distance = d.distance || 1;
          return "link " + d.relation + " distance" + distance;
        })
        .attr("marker-end", function(d) {
          return "url(#" + d.relation + ")";
        });

      // var circle = self.connectedGraph.svg.append("g").selectAll("circle")
      //   .data(force.nodes())
      //   .enter().append("circle")
      //   .attr("class", "node")
      //   .attr("r", 5)
      //   .attr("data-details", function(d) {
      //     return d;
      //   })
      //   .style("fill", colorByMorphemeLength)
      //   .style("opacity", function(d) {
      //     // return color(d.morphemes.length);
      //     return d.confidence ? d.confidence / 2 : 1;
      //   })
      //   .on("mouseover", function(object) {
      //     var findNode;
      //     if (self.localDOM) {
      //       findNode = self.localDOM.getElementById(object.id);
      //     }
      //     if (findNode) {
      //       findNode = findNode.innerHTML + "<p>" + findNode.getAttribute("title") + "<p>";
      //     } else {
      //       findNode = "Morpheme: " + object.morphemes + "<br/> Gloss: " + object.gloss + "<br/> Confidence: " + object.confidence;
      //     }
      //     if (tooltip) {
      //       return;
      //     }
      //     return tooltip
      //       .style("visibility", "visible")
      //       .html("<div class='node_details_tooltip self'>" + findNode + "</div>");
      //   })
      //   .on("mousemove", function() {
      //     /*global  event */
      //     if (tooltip) {
      //       return;
      //     }
      //     return tooltip.style("top", (event.pageY - 10) + "px")
      //       .style("left", (event.pageX + 10) + "px");
      //   })
      //   .on("mouseout", function() {
      //     if (tooltip) {
      //       return;
      //     }
      //     return tooltip
      //       .style("visibility", "hidden");
      //   })
      //   .on("click", function(d) {
      //     /* show the morpheme as a search result so the user can use the viz to explore the corpus*/
      //     if (self.application && self.application.router) {
      //       // self.application.router.showEmbeddedSearch(dbname, "morphemes:"+d.morphemes);
      //       var url = "corpus/" + self.corpus.dbname + "/search/" + "morphemes:" + d.morphemes;
      //       // window.location.replace(url);
      //       self.application.router.navigate(url, {
      //         trigger: true
      //       });

      //     }
      //   })
      //   .call(force.drag);

      var circle = self.connectedGraph.svg.append("g").selectAll("circle")
        .data(force.nodes())
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", 5)
        .style("fill", colorByMorphemeLength)
        .style("opacity", function(d) {
          // return color(d.morphemes.length);
          return d.confidence ? d.confidence / 2 : 1;
        })
        .on("mouseover", function(object) {
          var findNode;
          if (self.localDOM) {
            findNode = self.localDOM.getElementById(object.id);
          }
          if (findNode) {
            findNode = findNode.innerHTML + "<p>" + findNode.getAttribute("title") + "<p>";
          } else {
            findNode = "Morpheme: " + object.morphemes + "<br/> Gloss: " + object.gloss + "<br/> Confidence: " + object.confidence;
          }
          if (tooltip) {
            return;
          }
          return tooltip
            .style("visibility", "visible")
            .html("<div class='node_details_tooltip self'>" + findNode + "</div>");
        })
        .on("mousemove", function() {
          /*global  event */
          if (tooltip) {
            return;
          }
          return tooltip.style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function() {
          if (tooltip) {
            return;
          }
          return tooltip
            .style("visibility", "hidden");
        })
        .on("click", function(d) {
          /* show the morpheme as a search result so the user can use the viz to explore the corpus*/
          if (self.application && self.application.router) {
            // self.application.router.showEmbeddedSearch(dbname, "morphemes:"+d.morphemes);
            var url = self.application.basePathname + self.application.currentCorpusDashboard + "/lexicon/" + d.headword;
            // window.location.replace(url);
            self.application.router.navigate(url, {
              trigger: true
            });

          }
        })
        .call(force.drag);
      // circle.append("title")
      //   .text(function(d) {
      //     return d.morphemes;
      //   });

      var text = self.connectedGraph.svg.append("g").selectAll("text")
        .data(force.nodes())
        .enter().append("text")
        .attr("x", 8)
        .attr("y", ".31em")
        .style("opacity", function(d) {
          // return color(d.morphemes.length);
          return d.confidence ? d.confidence / 2 : 1;
        })
        .style("color", colorByMorphemeLength)
        .text(function(d) {
          return d.morphemes;
        });

      // force.on("tick", function() {
      //   link.attr("x1", function(d) {
      //       return d.source.x;
      //     })
      //     .attr("y1", function(d) {
      //       return d.source.y;
      //     })
      //     .attr("x2", function(d) {
      //       return d.target.x;
      //     })
      //     .attr("y2", function(d) {
      //       return d.target.y;
      //     });

      //   node.attr("cx", function(d) {
      //       return d.x;
      //     })
      //     .attr("cy", function(d) {
      //       return d.y;
      //     });
      // });

      // Use elliptical arc path segments to doubly-encode directionality.
      var tick = function() {
        path.attr("d", linkArc);
        circle.attr("transform", transform);
        text.attr("transform", transform);
      };

      // var tickNear = function() {
      //   path.attr("d", linkArc);

      //   circle.attr("cx", function(d) {
      //       if (d.morphemes === "_#") {
      //         d.x = width - 20;
      //         d.y = height / 2;
      //       }
      //       if (d.morphemes === "#_") {
      //         d.x = 42;
      //         d.y = height / 2;
      //       }
      //       return d.x;
      //     })
      //     .attr("cy", function(d) {
      //       if (d.morphemes === "_#") {
      //         d.x = width - 20;
      //         d.y = height / 2;
      //       }
      //       if (d.morphemes === "#_") {
      //         d.x = 42;
      //         d.y = height / 2;
      //       }
      //       return d.y;
      //     });

      //   text.attr("transform", transform);
      // };

      try {
        force
          .on("tick", tick)
          .start();
      } catch (e) {
        if (e.message === "TypeError: Cannot read property 'weight' of undefined") {
          self.bug("Something is wrong with one of the links in the lexicon, it doesn't have a source or target. ", e.stack);
        } else {
          self.warn("\nThe lexicon was able to start the connected graph. Something was wrong. ", e.stack);
        }

      }

      return this;
    }
  }

});

Lexicon.convertMapReduceRowIntoLexicalEntry = function(row) {
  if (!row) {
    return;
  }
  var node = row.key || row;
  if (typeof node === "string") {
    console.warn(" Lexical node skipped ", node);
    return;
  }
  if (node.error) {
    console.warn(" Lexical node indicates an error/inconsitancy in the corpus data ", node);
    return;
  }

  if (node.morphemes === "@") {
    console.warn(" skipping word boundary ", node);
    return;
  }

  node.count = row.value || row.count;

  return node;
};

/**
 * [lexicon_nodes_mapReduce description]
 * @type {Function}
 */
Lexicon.lexicon_nodes_mapReduce = LEXICON_NODES_MAP_REDUCE;

/**
 * [lexicon_nodes_mapReduce description]
 * @type {Function}
 */
Lexicon.lexicon_precedence_context_mapReduce = LEXICON_PRECEDENCE_CONTEXT_MAP_REDUCE;

/**
 * Constructs a lexicon given an input of precedenceRules or an orthography
 *
 * @param {Object} options [description]
 */
var LexiconFactory = function(options) {
  var lex = new Lexicon(options);
  console.warn(" LexiconFactory is deprecated");
  return lex;
};

Lexicon.CORS = CORS;
Lexicon.bootstrapLexicon = Lexicon.lexicon_nodes_mapReduce;
Lexicon.LexiconNode = LexiconNode;
Lexicon.Contexts = Contexts;
Lexicon.LexiconFactory = LexiconFactory;
Lexicon.maxLexiconSize = 400;

exports.Lexicon = Lexicon;
