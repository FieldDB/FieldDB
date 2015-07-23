try {
  var ObservableDOM = require("frb/dom"); // add support for content editable
} catch (e) {
  console.warn("Warning contentEditable won't work because : \n", e.stack, "\n\n");
}

var Bindings = require("frb/bindings");
var SortedSet = require("collections/sorted-set");
var UniqueSet = require("collections/set");
var CORS = require("../CORS");
var Q = require("q");

var escapeRegexCharacters = function(regex) {
  return regex.replace(/([()[{*+.$^\\|?])/g, '\\$1');
};


/**
 * @class Lexicon is directed graph (triple store) between morphemes and
 *        their allomorphs and glosses. It allows the search to index
 *        the corpus to find datum, it is also used by the default glosser to guess glosses based on what the user inputs on line 1 (utterance/orthography).
 *
 * @description  Lexicon is directed graph (triple store) between morphemes and
 *        their allomorphs and glosses. It allows the search to index
 *        the corpus to find datum, it is also used by the default glosser to guess glosses based on what the user inputs on line 1 (utterance/orthography).
 *
 *
 * @extends SortedSet
 *
 * @constructs
 *
 */

var Lexicon = function(values, equals, compare, getDefault) {
  // console.log("\tConstructing Lexicon... ");
  // SortedSet.apply(this, [values, equals, compare, getDefault]);
  SortedSet.apply(this, Array.prototype.slice.call(arguments, 1));
  // if (!compare) {
  //   this.contentCompare = this.__proto__.fieldsCompare;
  // }
  // if (!equals) {
  //   this.contentEquals = this.__proto__.fieldsEqual;
  // }
};

Lexicon.prototype = Object.create(SortedSet.prototype, /** @lends Lexicon.prototype */ {
  constructor: {
    value: Lexicon
  },
  sortBy: {
    value: "morphemes"
  },

  getLexicalEntries: {
    value: function(lexicalEntryToMatch) {
      var deffered = Q.defer(),
        matches = [],
        self = this;

      if (!lexicalEntryToMatch) {
        deffered.resolve(matches);
      } else {
        this.filter(function(value, key, object, depth) {
          console.log(key + " of " + self.length);
          if (typeof lexicalEntryToMatch.equals === "function") {
            if (lexicalEntryToMatch.equals(value)) {
              matches.push(value);
              console.log("lexicalEntryToMatch equals ", value);
            }
          } else {
            var howWellDoesThisMatch = 0;
            lexicalEntryToMatch = lexicalEntryToMatch.trim();
            for (var attr in value) {
              if (value.hasOwnProperty(attr) && value[attr] === lexicalEntryToMatch) {
                howWellDoesThisMatch = howWellDoesThisMatch + 1;
              }
            }
            if (howWellDoesThisMatch > 0) {
              matches.push(value);
              console.log("lexicalEntryToMatch matches well enough ", value);
            } else {
              console.log("lexicalEntryToMatch doesnt match ", value);
            }
          }
          if (key === self.length - 1) {
            deffered.resolve(matches);
          }
        }, this);
      }
      return deffered.promise;
    }
  },

  bindToView: {
    value: function() {
      var lexicalEntriesElement,
        binding,
        bindings = [],
        listElement,
        entryvalue,
        entrykey,
        iterate,
        entryIndex,
        listItemView,
        fieldLabelElement,
        fieldDTElement,
        fieldDDElement,
        fieldElement,
        fieldList,
        headword,
        saveButton,
        contexts,
        field,
        classList;

      var self = this;
      lexicalEntriesElement = this.lexicalEntriesElement;
      if (!lexicalEntriesElement) {
        return;
      }
      if (!self.localDOM) {
        return;
      }
      listElement = self.localDOM.createElement("ul");
      lexicalEntriesElement.appendChild(listElement);

      this.forEach(function(entry) {
        var discussion,
          field;

        if (entry && entry.morphemes === "@") {
          return;
        }
        var cleanAndSaveIfChanged = function(e) {
          var result = e.target.parentElement.__data__.clean().then(function(proposedChanges) {
            if (proposedChanges.length > 0) {
              var changesAsStrings = [];
              proposedChanges.map(function(change) {
                changesAsStrings.push(change.before + " -> " + change.after);
              });
              var saveEditToAllData = window.confirm("Would you like to clean this lexical entry? (This will change all examples you see here to have this new information.)\n\n" + changesAsStrings.join("\n"));
              if (saveEditToAllData) {
                e.target.parentElement.__data__.save().then(function(result) {
                  console.log("Saving success...", result);
                }).fail(function(reason) {
                  console.log("Saving failed...", reason);
                });
              }
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
          window.currentlySelectedNode = e.target;
          console.log(window.currentlySelectedNode.__data__);
        };

        listItemView = self.localDOM.createElement("li");
        listItemView.__data__ = entry;
        listItemView.style.opacity = listItemView.__data__.confidence;
        listItemView.classList.add("lexical-entry");
        listItemView.classList.add("scrollable");
        if (listItemView.__data__.morphemes) {
          listItemView.id = listItemView.__data__.morphemes;
        }
        // console.log("\tCreating Node view for " + listItemView.id);

        headword = self.localDOM.createElement("span");
        headword.contentEditable = 'true';
        headword.classList.add("headword");
        headword.setAttribute("title", "CLick to edit the headword of your lexical entry");
        listItemView.__data__.headword = listItemView.__data__.headword || listItemView.__data__.morphemes ? listItemView.__data__.morphemes : listItemView.__data__.gloss;

        saveButton = self.localDOM.createElement("button");
        saveButton.classList.add("btn");
        saveButton.setAttribute("title", "Click here to save");
        saveButton.innerHTML = "Save ";
        saveButton.onclick = cleanAndSaveIfChanged;

        contexts = self.localDOM.createElement("span");
        contexts.classList.add("utteranceContext");

        discussion = self.localDOM.createElement("span");
        discussion.contentEditable = 'true';
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

        for (field in listItemView.__data__) {
          if (listItemView.__data__.hasOwnProperty(field)) {
            if (field === "discussion" || field === "headword") {
              continue;
            }
            try {
              headword.classList.add(field + ":" + listItemView.__data__[field]);
              discussion.classList.add(field + ":" + listItemView.__data__[field]);

              fieldDTElement = self.localDOM.createElement("dt");
              fieldLabelElement = self.localDOM.createElement("span");
              fieldLabelElement.innerHTML = field;
              fieldLabelElement.classList.add("fieldlabel");
              fieldLabelElement.classList.add(field);
              fieldLabelElement.classList.add(listItemView.__data__[field]);
              fieldDTElement.appendChild(fieldLabelElement);
              fieldList.appendChild(fieldDTElement);

              fieldDDElement = self.localDOM.createElement("dd");
              fieldElement = self.localDOM.createElement("span");
              fieldElement.contentEditable = 'true';
              fieldElement.classList.add("fieldvalue");
              fieldElement.classList.add(field);
              fieldElement.classList.add(listItemView.__data__[field]);
              component.fieldViews[field] = fieldElement;
              fieldDDElement.appendChild(fieldElement);
              fieldList.appendChild(fieldDDElement);

              var viewPath = "fieldViews." + field + ".value";
              var dataPath = "listItemView.__data__." + field;
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

            } catch (e) {
              console.warn(e);
            }
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
            // "<-": "' '+listItemView.__data__.utteranceContext.join(',')+listItemView.__data__.utteranceContext?listItemView.__data__.utteranceContext.length : '0'"
            "<-": "listItemView.__data__.utteranceContext.join(' ; ')"
          },
          "listItemView.title": {
            "<-": "'Example: '+listItemView.__data__.utteranceContext.join(' Example: ')"
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

    }
  },

  toJSON: {
    value: function() {
      return JSON.stringify(this.toObject(), null, 2);
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
      var morphemeGroup = datum.morphemes.split(/ +/);
      var matchingfunction = function(node) {
        if (node.morphemes === morphemeToFind) {
          // console.log(node);
          matchingNodes.push(node);
        }
      };
      for (var group in morphemeGroup) {
        var morphemes = morphemeGroup[group].split("-");
        var glosses = [];
        for (var m in morphemes) {
          if (!morphemes.hasOwnProperty(m)) {
            continue;
          }
          matchingNodes = [];
          morphemeToFind = morphemes[m];
          this.filter(matchingfunction);

          var gloss = "?"; // If there's no matching gloss, use question marks
          if (matchingNodes && matchingNodes.length > 0) {
            // Take the first gloss for this morpheme
            // console.log("Glosses which match: " + morphemes[m], matchingNodes);
            try {
              gloss = matchingNodes[0].gloss;
            } catch (e) {
              // console.log(matchingNodes);
            }
          }
          glosses.push(gloss);
        }

        glossGroups.push(glosses.join("-"));
      }
      datum.glossAlternates = datum.glossAlternates ? datum.glossAlternates.concat(glossGroups) : glossGroups;
      datum.gloss = glossGroups.join(" ");
      // Replace the gloss line with the guessed glosses
      return datum;
    }
  },

  /**
   * Takes as a parameters an array of this.precedenceRelations which came from CouchDB precedence rule query.
   * Example Rule: {"key":{"x":"@","relation":"preceeds","y":"aqtu","context":"aqtu-nay-wa-n"},"value":2}
   */
  generatePrecedenceForceDirectedRulesJsonForD3: {
    value: function(dontConnectWordBoundaries) {
      /*
       * Cycle through the precedence rules, convert them into graph edges with the morpheme index in the morpheme array as the source/target values
       */
      var morphemeLinks = [];
      var morphemes = {};


      /*
       * Create the JSON required by D3
       */
      var precedenceGraph = {
        links: morphemeLinks,
        nodes: morphemes
      };
      this.precedenceGraph = precedenceGraph;

      return precedenceGraph;
    }
  }

  /**
   * Overwrite/build the lexicon from the corpus server if it is there, saves
   * the results to local storage so they can be reused offline.
   *
   * @param dbname
   * @param callback
   */
  buildLexiconFromCouch: {
    value: function(dbname, callback) {
      var self = this;
      var couchConnection = app.get("corpus").get("couchConnection");
      var couchurl = OPrime.getCouchUrl(couchConnection);

      OPrime.makeCORSRequest({
        type: 'GET',
        url: couchurl + "/_design/pages/_view/lexicon_create_tuples?group=true",
        success: function(results) {
          if (!self.get("lexiconNodes")) {
            self.set("lexiconNodes", new LexiconNodes());
          }
          localStorage.setItem(dbname + "lexiconResults", JSON.stringify(results));
          var lexiconTriples = results.rows;
          for (triple in lexiconTriples) {
            self.get("lexiconNodes").add(new LexiconNode({
              morpheme: lexiconTriples[triple].key.morpheme,
              allomorphs: [lexiconTriples[triple].key.morpheme],
              gloss: lexiconTriples[triple].key.gloss,
              value: lexiconTriples[triple].value
            }));
          }
          if (typeof callback == "function") {
            callback();
          }
        }, // end successful response
        dataType: ""
      });
    }
  },
  /**
   * Overwrite/build the lexicon from local storage if it is there.
   *
   * @param dbname
   * @param callback
   */
  buildLexiconFromLocalStorage: {
    value: function(dbname, callback) {
      var results = localStorage.getItem(dbname + "lexiconResults");
      if (!results) {
        return;
      }
      if (!this.get("lexiconNodes")) {
        this.set("lexiconNodes", new LexiconNodes());
      }
      var lexiconTriples = JSON.parse(results).rows;
      for (triple in lexiconTriples) {
        this.get("lexiconNodes").add(new LexiconNode({
          morpheme: lexiconTriples[triple].key.morpheme,
          allomorphs: [lexiconTriples[triple].key.morpheme],
          gloss: lexiconTriples[triple].key.gloss,
          value: lexiconTriples[triple].value
        }));
      }
      if (typeof callback == "function") {
        callback();
      }
    }
  }
});

/**
 * Constructs a lexicon given an input of precedenceRules or an orthography
 *  
 * @param {[type]} options [description]
 */
var LexiconFactory = function(options) {
  // var lex = new Lexicon(null, Lexicon.prototype.fieldsEqual, Lexicon.prototype.fieldsCompare);
  var lex = new Lexicon();
  lex.precedenceRelations = new UniqueSet();
  lex.references = new UniqueSet();
  if (options.precedenceRelations && options.precedenceRelations.length > 0) {
    for (var i in options.precedenceRelations) {
      if (!options.precedenceRelations[i] || !options.precedenceRelations[i].key || !options.precedenceRelations[i].key.previous || !options.precedenceRelations[i].key.subsequent) {
        console.warn("Skipping malformed lexical node", options.precedenceRelations[i]);
        continue;
      }
      try {
        //Add source target and value to the link
        delete options.precedenceRelations[i].key.previous.utterance;
        delete options.precedenceRelations[i].key.subsequent.utterance;
        options.precedenceRelations[i].key.utteranceContext = options.precedenceRelations[i].key.context.utterance;
        options.precedenceRelations[i].key.datumid = options.precedenceRelations[i].id;

        // Put the previous and subsequent morphemes into the morpheme nodes
        // lex.add(options.precedenceRelations[i].key.context.utterance, new LexiconNode({
        //   fields: options.precedenceRelations[i].key.previous
        // }));
        options.precedenceRelations[i].key.previous.datumids = [options.precedenceRelations[i].key.context.id];
        options.precedenceRelations[i].key.previous.utteranceContext = [options.precedenceRelations[i].key.context.utterance];
        options.precedenceRelations[i].key.previous.url = options.url;
        lex.add(new LexiconNode(options.precedenceRelations[i].key.previous));

        // lex.add(options.precedenceRelations[i].key.context.utterance, new LexiconNode({
        //   fields: options.precedenceRelations[i].key.previous
        // }));
        options.precedenceRelations[i].key.subsequent.datumids = [options.precedenceRelations[i].key.context.id];
        options.precedenceRelations[i].key.subsequent.utteranceContext = [options.precedenceRelations[i].key.context.utterance];
        options.precedenceRelations[i].key.subsequent.url = options.url;
        lex.add(new LexiconNode(options.precedenceRelations[i].key.subsequent));
        lex.references.add(options.precedenceRelations[i].key.context.id);

        //To avoid loops
        if (options.precedenceRelations[i].key.subsequent.morphemes.indexOf("@") === -1) {
          lex.precedenceRelations.add(options.precedenceRelations[i].key);
        }

      } catch (e) {
        console.warn(" caught an error while building a lexical node ", e.stack);
      }

    }
  }
  if (options.orthography || options.wordFrequencies) {
    if (options.nonContentWordsArray) {
      options.userSpecifiedNonContentWords = true;
      if (Object.prototype.toString.call(options.nonContentWordsArray) === '[object Array]' && options.nonContentWordsArray.length === 0) {
        options.userSpecifiedNonContentWords = false;
        // console.log("User sent an empty array of non content words, attempting to automatically detect them");
      }
      // else if (options.nonContentWordsArray.trim && !options.nonContentWordsArray.trim()) {
      //   options.userSpecifiedNonContentWords = false;
      // }
    }
    if (options.orthography && (!options.wordFrequencies || options.wordFrequencies.length === 0) && typeof Lexicon.bootstrapLexicon === "function") {
      Lexicon.bootstrapLexicon(options);
    }
    options.wordFrequencies = options.wordFrequencies || [];

    for (var wordIndex in options.wordFrequencies) {
      if (!options.wordFrequencies.hasOwnProperty(wordIndex)) {
        continue;
      }
      var word = options.wordFrequencies[wordIndex];
      if (typeof word === "string") {
        word = {
          orthography: word
        };
      }
      /* accept Datum as words */
      if (!word && word) {
        word = word;
      }
      if (!word) {
        word = {};
      }
      if (word.orthography && !word.orthography) {
        word.orthography = word.orthography;
        delete word.orthography;
      }
      word.count = word.count || 0;
      word.categories = word.categories || [];
      word.datumids = word.datumids || word.docids || [];
      if (options._id) {
        word.datumids.push(options._id);
      }
      if (options.url) {
        word.url = options.url;
      }
      if (lex.length > Lexicon.maxLexiconSize) {
        console.warn("Ignoring lexical entry (lexicon has reached max size " + Lexicon.maxLexiconSize + ") ", word);
        continue;
      }
      lex.add(new LexiconNode(word));
    }
  }

  for (var property in options) {
    if (options.hasOwnProperty(property)) {
      lex[property] = options[property];
    }
  }
  return lex;
};

Lexicon.LexiconNode = LexiconNode;
Lexicon.LexiconFactory = LexiconFactory;
Lexicon.maxLexiconSize = 1000;

try {
  global.Lexicon = Lexicon;
} catch (e) {
  console.log(e);
}
exports.Lexicon = Lexicon;
