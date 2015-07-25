"use strict";

var Q = require("q");
var FieldDBObject = require("../FieldDBObject").FieldDBObject;
// var CORS = require("../CORS").CORS;
var CORS = require("../CORSNode").CORS;
var Lexicon = require("../lexicon/Lexicon").Lexicon;
var _ = require("underscore");


/**
 * @class The Glosser is able to guess morpheme segmentation and/or glosses from an orthography/transcription.
 * The default Glosser (this one) uses a lexicon which is generated off of existing data in the corpus to do this.
 *
 * The Glosser can display a visual representation of itself if D3 is provided to it as options
 * or D3 is loaded in the context of the app.
 * 
 * @name  Glosser
 * @extends FieldDBObject
 * @constructs
 */
var Glosser = function Glosser(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "Glosser";
  }
  options = options || {};

  this.debug("Constructing Glosser length: ", options);
  FieldDBObject.apply(this, arguments);
};

Glosser.prototype = Object.create(FieldDBObject.prototype, /** @lends Glosser.prototype */ {
  constructor: {
    value: Glosser
  },

  // Internal models: used by the parse function
  INTERNAL_MODELS: {
    value: {
      lexicon: Lexicon,
    }
  },

  lexicon: {
    get: function() {
      this.debug("getting lexicon");
      return this._lexicon;
    },
    set: function(value) {
      this.ensureSetViaAppropriateType("lexicon", value);
    }
  },

  downloadPrecedenceRules: {
    value: function(glosserURL) {
      if (!glosserURL || glosserURL === "default") {
        if (!this.corpus) {
          throw "Glosser can't be guessed, there is no app so the URL must be defined.";
        }
        if (this.corpus.prefs && this.corpus.prefs.glosserURL) {
          glosserURL = this.corpus.prefs.glosserURL;
        } else {
          glosserURL = this.corpus.url + "/_design/pages/_view/morpheme_n_grams?group=true";
        }
      }
      var self = this;
      var deffered = Q.defer();
      var dbname;
      if (this.corpus && this.corpus.dbname) {
        dbname = this.corpus.dbname;
      }

      CORS.makeCORSRequest({
        type: "GET",
        url: glosserURL
      }).then(function(reducedCouchDBresult) {
          // Reduce the reducedCouchDBresult such that reducedCouchDBresult which are found in multiple source
          // words are only used/included once.
          self.morphemeSegmentationKnowledgeBase = reducedCouchDBresult;

          // Save the reduced precedence self.morphemeSegmentationKnowledgeBase in localStorage
          if (dbname) {
            try {
              localStorage.setItem(dbname + "morphemeSegmentationKnowledgeBase", JSON.stringify(self.morphemeSegmentationKnowledgeBase));
            } catch (error) {
              if (error.message === "localStorage is not defined") {
                console.warn("cannot save precedence self.morphemeSegmentationKnowledgeBase for offline use");
              } else {
                //remove other corpora's self.morphemeSegmentationKnowledgeBase to make space for the most recent...
                for (var x in localStorage) {
                  if (x.indexOf("self.morphemeSegmentationKnowledgeBase") > -1) {
                    localStorage.removeItem(x);
                  }
                }
                try {
                  localStorage.setItem(dbname + "self.morphemeSegmentationKnowledgeBase", JSON.stringify(self.morphemeSegmentationKnowledgeBase));
                } catch (error2) {
                  self.warn("Your lexicon is huge!", error2);
                }
              }
            }
          }
          deffered.resolve(self.morphemeSegmentationKnowledgeBase);
        },
        function(e) {
          self.warn("Error getting precedence self.morphemeSegmentationKnowledgeBase:", e);
          self.bug("Error getting precedence self.morphemeSegmentationKnowledgeBase:");
          deffered.reject(e);
        }).fail(function(exception) {
        self.warn("Error getting precedence self.morphemeSegmentationKnowledgeBase:", exception.stack);
        self.bug("Error getting precedence self.morphemeSegmentationKnowledgeBase:");
        deffered.reject(exception);
      });

      return deffered.promise;
    }
  },

  morphemeSegmentationKnowledgeBase: {
    get: function() {
      if (!this._morphemeSegmentationKnowledgeBase && (!this.lastMorphemePrecedenceRelationsLookupTimestamp && Date.now() - this.lastMorphemePrecedenceRelationsLookupTimestamp > 30000) && this.corpus && this.corpus.dbname) {
        try {
          var value = localStorage.getItme(this.corpus.dbname + "morphemeSegmentationKnowledgeBase");
          if (value) {
            value = JSON.parse(value);
          }
          if (value) {
            this.morphemeSegmentationKnowledgeBase = value;
          }
          this.lastMorphemePrecedenceRelationsLookupTimestamp = Date.now();
        } catch (exception) {
          console.warn("Glosser's morpheme segmentation knowledge cannot be persisted across page loads for offline use.", exception);
          this.lastMorphemePrecedenceRelationsLookupTimestamp = Infinity;
        }
      }
      return this._morphemeSegmentationKnowledgeBase;
    },
    set: function(value) {
      if (value && value.rows && typeof value.rows.filter === "function") {
        value = value.rows;
      }
      if (value && typeof value.filter === "function") {
        // Reduce the rules such that rules which are found in multiple source
        // words are only used/included once.
        var uniqueRules = {};
        var size = 0;
        value = value.map(function(row) {
          if (row.key.indexOf("@-@") === -1) {
            // If all ready reduced, use the count as the value
            if (typeof row.value === "number") {
              uniqueRules[row.key] = row.value;
              size++;
            } else {
              // If not ready reduced, add the value into an array which will serve as the count
              if (!uniqueRules[row.key]) {
                uniqueRules[row.key] = uniqueRules[row.key] || [];
                size++;
              }
              uniqueRules[row.key].push(row.value);
            }
          }
        });
        uniqueRules.length = size;
        value = uniqueRules;
      }
      this._morphemeSegmentationKnowledgeBase = value;
    }
  },

  /**
   * Takes in an utterance line and, based on our current set of precendence
   * self.morphemeSegmentationKnowledgeBase, guesses what the morpheme line would be. The algorithm is
   * very conservative.
   *
   * @param {String} unparsedUtterance The raw utterance line.
   *
   * @return {String} The guessed morphemes line.
   */
  morphemefinder: {
    value: function(unparsedUtterance, justCopyDontGuessIGT) {
      if (!unparsedUtterance) {
        return "";
      }
      if (justCopyDontGuessIGT) {
        return unparsedUtterance;
      }

      var potentialParse = "";

      var parsedWords = [];
      if (!this.morphemeSegmentationKnowledgeBase || !this.morphemeSegmentationKnowledgeBase.length) {
        return unparsedUtterance;
      }
      // Divide the utterance line into words
      var parseInProgress = {
        utteranceWithExplictWordBoundaries: "@" + unparsedUtterance.trim().split(/ +/).join("@") + "@",
        matchingRules: []
      };
      this.findRelevantSegmentations(parseInProgress);

      this.debug(" Found matchingRules " + unparsedUtterance + " which yields " + parseInProgress.utteranceWithExplictWordBoundaries, parseInProgress.matchingRules);
      if (this.conservative === false) {
        console.warn(" Continuing to look harder for segmentation. Currently " + unparsedUtterance + " directly matches " + parseInProgress.utteranceWithExplictWordBoundaries);
      } else {
        this.debug(" Not looking harder for segmentation. Currently " + unparsedUtterance + " directly matches " + parseInProgress.utteranceWithExplictWordBoundaries);
        return parseInProgress.utteranceWithExplictWordBoundaries.replace(/-?@-?/g, " ").trim();
      }

      this.findaAllPossibleSegmentations(parseInProgress);
    }
  },

  /** 
   * Find the this.morphemeSegmentationKnowledgeBase which match in local precedence
   * @param  {[type]} utteranceWithExplictWordBoundaries [description]
   * @return {[type]}                                    [description]
   */
  findRelevantSegmentations: {
    value: function(options) {
      if (!options.utteranceWithExplictWordBoundaries) {
        return options;
      }
      this.debug("Looking for matching rules " + options.utteranceWithExplictWordBoundaries);

      if (!options.matchingRules) {
        options.matchingRules = [];
      }
      var originalUtteranceWithWordBoundaries = options.utteranceWithExplictWordBoundaries + "";
      for (var segmentation in this.morphemeSegmentationKnowledgeBase) {
        if (!this.morphemeSegmentationKnowledgeBase.hasOwnProperty(segmentation) || segmentation === "length") {
          continue;
        }
        if (originalUtteranceWithWordBoundaries.indexOf(segmentation.replace(/[-=]/g, "")) >= 0) {
          this.debug("   matching rule " + originalUtteranceWithWordBoundaries + " <-" + segmentation);
          // If this has enough context then consider it a correct segmentation
          if (segmentation.split(/[-=]/).length > 2) {
            options.utteranceWithExplictWordBoundaries = options.utteranceWithExplictWordBoundaries.replace(segmentation.replace(/[-=]/g, ""), segmentation);
          }

          this.debug("      now " + options.utteranceWithExplictWordBoundaries);
          options.matchingRules.push({
            segmentation: segmentation,
            contexts: this.morphemeSegmentationKnowledgeBase[segmentation],
            morphemes: segmentation.split(/[-=]/g)
          });
        } else {
          this.debug("   not matching rule " + originalUtteranceWithWordBoundaries + " |- " + segmentation);
        }
      }
      return options;
    }
  },

  findaAllPossibleSegmentations: {
    value: function(options) {

      // Attempt to find the longest template which the matching this.morphemeSegmentationKnowledgeBase can
      // generate from start to end
      options.potentialParses = options.potentialParses || [];
      options.usedRules = options.usedRules || [];
      if (options.potentialParses.indexOf(options.utteranceWithExplictWordBoundaries) === -1) {
        options.potentialParses.push(options.utteranceWithExplictWordBoundaries);
      }
      if (!options.matchingRules || !options.matchingRules.length) {
        this.findRelevantSegmentations(options);
        if (options.potentialParses.indexOf(options.utteranceWithExplictWordBoundaries) === -1) {
          options.potentialParses.push(options.utteranceWithExplictWordBoundaries);
        }
      }
      if (!options.potentialParsesByWord) {
        options.potentialParsesByWord = {};
        options.utteranceWithExplictWordBoundaries.split(/-?@-?/).map(function(word) {
          if (word) {
            options.potentialParsesByWord[word.replace(/[-=]/g, "")] = {
              fullParses: [word],
              prefixTemplates: [],
              suffixTemplates: []
            };
          }
        });
      }

      var match,
        matchIndex;

      for (var word in options.potentialParsesByWord) {

        this.debug("\nFinding prefixtemplate " + word);
        var prefixtemplate = ["@"];

        // up to 10 morphemes long
        for (var i = 0; i < 10; i++) {
          if (prefixtemplate[i] === undefined) {
            break;
          }
          // Look at each rule
          for (matchIndex = 0; matchIndex < options.matchingRules.length; matchIndex++) {
            match = options.matchingRules[matchIndex];
            if (prefixtemplate.length > 2 && prefixtemplate[prefixtemplate.length - 1] === "@") {
              continue; //we found the end already
            }

            // this morpheme matches, and the following morpheme can be found somewhere later in the word
            if (prefixtemplate[i] === match.morphemes[0] && (match.morphemes[1] === "@" || word.indexOf(match.morphemes[1]) > -1)) {
              if (prefixtemplate[i + 1]) { // ambiguity (two potential following morphemes)
                this.debug("Ambiguity point for prefixes " + word + " " + prefixtemplate[i + 1], options.potentialParsesByWord[word]);
                options.potentialParsesByWord[word].prefixTemplates.push(prefixtemplate.pop());
                break;
              } else {
                prefixtemplate[i + 1] = match.morphemes[1];
                this.debug("   prefixtemplate " + prefixtemplate.join("-"));
              }
            }
          }
        }

        // If prefix template matches the whole word (ie we have seen it before, return the prefix template exactly)
        if (prefixtemplate.length > 2 && prefixtemplate[0] === "@" && prefixtemplate[prefixtemplate.length - 1] === "@") {
          this.debug("Prefix matches entire word. " + prefixtemplate.join("-"));
          prefixtemplate.pop(); //remove final @
          prefixtemplate.shift(); //remove intitial @
          options.potentialParsesByWord[word].fullParses.push(prefixtemplate.join("-"));
          prefixtemplate = options.potentialParsesByWord[word].prefixTemplates.pop() || ["@"];
          this.debug("Considering another parse " + prefixtemplate.join("-"));
        } else {
          prefixtemplate = options.potentialParsesByWord[word].prefixTemplates.pop() || ["@"];
          this.debug("Considering another parse " + prefixtemplate.join("-"));
        }

        // If the prefix template hit ambiguity in the middle, try from the suffix
        // in until it hits ambiguity
        var suffixtemplate = [];
        if (prefixtemplate[prefixtemplate.length - 1] !== "@" || prefixtemplate.length === 1) {
          // Suffix:
          suffixtemplate.push("@");
          this.debug("   suffixtemplate " + suffixtemplate.join("-"));

          for (var ii = 0; ii < 10; ii++) {
            if (suffixtemplate[ii] === undefined) {
              break;
            }
            for (matchIndex = 0; matchIndex < options.matchingRules.length; matchIndex++) {
              match = options.matchingRules[matchIndex];

              // this morpheme matches, and the following morpheme can be found somewhere later in the word
              if (suffixtemplate[ii] === match.morphemes[1] && (match.morphemes[0] === "@" || word.indexOf(match.morphemes[0]) > -1)) {
                if (suffixtemplate[ii + 1]) { // ambiguity (two potential
                  // following morphemes)
                  this.debug("Ambiguity point for suffixes " + word + " " + suffixtemplate[ii + 1], options.potentialParsesByWord[word]);
                  options.potentialParsesByWord[word].suffixTemplates.push(suffixtemplate.pop());
                  break;
                } else {
                  suffixtemplate[ii + 1] = match.morphemes[0];
                  this.debug("   suffixtemplate " + suffixtemplate.join("-"));

                }
              }
            }
          }
        } else {
          this.debug("what is this condition");
        }

        // Combine prefix and suffix templates into one regular expression which
        // can be tested against the word to find a potential parse.
        // Regular expressions will look something like
        //    (@)(.*)(hall)(.*)(o)(.*)(wa)(.*)(n)(.*)(@)
        var template = [];
        template = prefixtemplate.concat(suffixtemplate.reverse());
        for (var slot in template) {
          template[slot] = "(" + template[slot] + ")";
        }
        var regex = new RegExp(template.join("(.*)"), "");

        this.debug("Considering regex ", regex);
        // Use the regular expression to find a guessed morphemes line
        var potentialParse = word
          .replace(regex, "$1-$2-$3-$4-$5-$6-$7-$8-$9") // Use backreferences to parse into morphemes
          .replace(/\$[0-9]/g, "") // Remove any backreferences that weren't used
          .replace(/@/g, "") // Remove the start/end-of-line symbol
          .replace(/--+/g, "-") // Ensure that there is only ever one "-" in a row
          .replace(/^-/, "") // Remove "-" at the start of the word
          .replace(/-$/, ""); // Remove "-" at the end of the word
        this.debug("Potential parse of " + word.replace(/@/g, "") + " is " + potentialParse);

        if (options.potentialParsesByWord[word].fullParses.indexOf(potentialParse) === -1) {
          options.potentialParsesByWord[word].fullParses.push(potentialParse);
        }

      }

      /*
        x1 y1 z1
        x1 y1 z2
        x1 y2 z1
        x1 y2 z2
       */
      options.potentialParses = [];
      var self = this;
      // Create options for the user
      var copy = JSON.parse(JSON.stringify(options.potentialParsesByWord));
      var fullParse = [];
      for (var word in copy) {
        this.debug(word);
        fullParse.push(word);
        for (var parseIndex = copy[word].fullParses.length - 1; parseIndex >= 0; parseIndex--) {
          var parse = copy[word].fullParses[parseIndex]
          self.debug("  " + parse);
          fullParse.push(parse);
          options.potentialParses.push(fullParse.join(" "));
          copy[word].fullParses.pop();
          fullParse.pop();
        };
        fullParse.pop();
      }



      // options.potentialParses.push(fullParse);

      // options.potentialParses.push(parsedWords.join(" "));

      return options;
    }
  },

  contextSensitiveGlossFinder: {
    value: function(fields, dbname, justCopyDontGuessIGT) {
      var morphemesLine = fields.morphemes;
      if (!morphemesLine) {
        return "";
      }

      if (justCopyDontGuessIGT || !this.lexicon) {
        var justQuestionMarks = morphemesLine.trim().replace(/[^ =-]+/g, "?");
        fields.gloss = justQuestionMarks;
      } else {
        fields = this.lexicon.guessContextSensitiveGlosses(fields);
      }

      return fields;
    }
  },

  simplisticGlossFinder: {
    value: function(morphemesLine, dbname, justCopyDontGuessIGT) {
      if (!morphemesLine) {
        return "";
      }

      if (justCopyDontGuessIGT) {
        var justQuestionMarks = morphemesLine.trim().replace(/[^ -]+/g, "?");
        return justQuestionMarks;
      }

      if (!dbname) {
        if (!this.application || !this.application.get("corpus")) {
          throw "Glosser can't be guessed, there is no app so the URL must be defined.";
        }
        dbname = this.application.get("corpus").get("couchConnection").dbname;
      }

      var lexiconNodes = localStorage.getItem(dbname + "lexiconResults");
      if (!lexiconNodes) {
        return "";
      }

      lexiconNodes = JSON.parse(lexiconNodes);

      var glossGroups = [];
      var morphemeGroup = morphemesLine.split(/ +/);
      for (var group in morphemeGroup) {
        var morphemes = morphemeGroup[group].split("-");
        var glosses = [];
        for (var m in morphemes) {

          var matchingNodes = [];
          var node = lexiconNodes[morphemes[m]];
          if (node) {
            matchingNodes.push(node);
          }
          node = lexiconNodes[morphemes[m].toLowerCase()];
          if (node) {
            matchingNodes.push(node);
          }
          var gloss = "?"; // If there's no matching gloss, use question marks
          if (matchingNodes.length > 0) {
            // Take the first gloss for this morpheme
            this.debug("Glosses which match: ", matchingNodes);
            try {
              gloss = matchingNodes[0][0].gloss;
            } catch (e) {
              this.debug(matchingNodes);
            }
          }
          glosses.push(gloss);

        }

        glossGroups.push(glosses.join("-"));
      }

      // Replace the gloss line with the guessed glosses
      return glossGroups.join(" ");
    }
  },

  guessUtteranceFromMorphemes: {
    value: function(fields, justCopyDontGuessIGT) {
      if (!fields.utterance && fields.morphemes) {
        fields.utterance = fields.morphemes.replace(/[-.]/g, "");
      }
      return fields;
    }
  },

  guessMorphemesFromUtterance: {
    value: function(fields, justCopyDontGuessIGT) {
      if (fields.morphemes) {
        return fields;
      }
      fields.morphemes = this.morphemefinder(fields.utterance, fields.dbname, justCopyDontGuessIGT);
      if (!fields.gloss) {
        fields = this.contextSensitiveGlossFinder(fields, fields.dbname, justCopyDontGuessIGT);
      }
      return fields;
    }
  },
  guessGlossFromMorphemes: {
    value: function(fields, justCopyDontGuessIGT) {
      if (fields.gloss) {
        return fields;
      }
      if (!fields.morphemes) {
        fields.morphemes = fields.utterance;
      }
      fields = this.contextSensitiveGlossFinder(fields, fields.dbname, justCopyDontGuessIGT);
      return fields;
    }
  },

  glossFinder: {
    value: function(morphemesLine) {
      //Guess a gloss
      var morphemeGroup = morphemesLine.split(/ +/);
      var glossGroups = [];
      if (!this.lexicon) {
        return "";
      }
      if (!this.lexicon) {
        var corpusSize = 31; //TODO get corpus size another way. // app.get("corpus").datalists.models[app.get("corpus").datalists.models.length-1].get("datumIds").length;
        if (corpusSize > 30 && !Glosser.toastedUserToSync) {
          Glosser.toastedUserToSync = true;
          this.popup("You probably have enough data to train an autoglosser for your corpus.\n\nIf you sync your data with the team server then editing the morphemes will automatically run the auto glosser.", "alert-success", "Sync to train your auto-glosser:");
        } else {
          Glosser.toastedUserToImport++;
          if (Glosser.toastedUserToImport % 10 === 1 && corpusSize < 30) {
            this.popup("You have roughly " + corpusSize + " datum saved in your pouch, if you have around 30 datum, then you have enough data to train an autoglosser for your corpus.", "alert-info", "AutoGlosser:");
          }
        }
        return "";
      }
      var lexiconNodes = this.lexicon;
      for (var group in morphemeGroup) {
        var morphemes = morphemeGroup[group].split("-");
        var glosses = [];
        for (var m in morphemes) {
          // Take the first gloss for this morpheme
          var matchingNode = _.max(lexiconNodes.where({
            morpheme: morphemes[m]
          }), function(node) {
            return node.get("value");
          });
          //      self.debug(matchingNode);
          var gloss = "?"; // If there"s no matching gloss, use question marks
          if (matchingNode) {
            gloss = matchingNode.get("gloss");
          }
          glosses.push(gloss);
        }

        glossGroups.push(glosses.join("-"));
      }

      // Replace the gloss line with the guessed glosses
      return glossGroups.join(" ");
    }
  },

  /**
   * Takes as a parameters an array of self.morphemeSegmentationKnowledgeBase which came from CouchDB precedence rule query.
   * Example Rule: {"key":{"x":"@","relation":"preceeds","y":"aqtu","context":"aqtu-nay-wa-n"},"value":2}
   */
  morphemeSegmentationKnowledgeBaseGraph: {
    get: function() {
      if (this._morphemeSegmentationKnowledgeBaseGrapho) {
        return this._morphemeSegmentationKnowledgeBaseGraph;
      }
      if (!this.morphemeSegmentationKnowledgeBase) {
        return;
      }
      /*
       * Cycle through the precedence this.morphemeSegmentationKnowledgeBase, convert them into graph edges with the morpheme index in the morpheme array as the source/target values
       */
      var morphemeLinks = [];
      var morphemes = [];
      for (var i in this.morphemeSegmentationKnowledgeBase) {
        /* make the @ more like what a linguist recognizes for word boundaries */
        if (this.morphemeSegmentationKnowledgeBase[i].key.x === "@") {
          this.morphemeSegmentationKnowledgeBase[i].key.x = "#_";
        }
        if (this.morphemeSegmentationKnowledgeBase[i].key.y === "@") {
          this.morphemeSegmentationKnowledgeBase[i].key.y = "_#";
        }
        var xpos = morphemes.indexOf(this.morphemeSegmentationKnowledgeBase[i].key.x);
        if (xpos < 0) {
          morphemes.push(this.morphemeSegmentationKnowledgeBase[i].key.x);
          xpos = morphemes.length - 1;
        }
        var ypos = morphemes.indexOf(this.morphemeSegmentationKnowledgeBase[i].key.y);
        if (ypos < 0) {
          morphemes.push(this.morphemeSegmentationKnowledgeBase[i].key.y);
          ypos = morphemes.length - 1;
        }
        //To avoid loops?
        if (this.morphemeSegmentationKnowledgeBase[i].key.y.indexOf("@") === -1) {
          morphemeLinks.push({
            source: xpos,
            target: ypos,
            value: 1 //TODO use the context counting to get a weight measure
          });
        }
      }

      /*
       * Build the morphemes into nodes and color them by their morpheme length, could be a good measure of outliers
       */
      var morphemenodes = [];
      for (var m in morphemes) {
        morphemenodes.push({
          name: morphemes[m],
          length: morphemes[m].length
        });
      }

      /*
       * Create the JSON required by D3
       */
      this.morphemeSegmentationKnowledgeBaseGraph = {};
      this.morphemeSegmentationKnowledgeBaseGraph.links = morphemeLinks;
      this.morphemeSegmentationKnowledgeBaseGraph.nodes = morphemenodes;

      return this.morphemeSegmentationKnowledgeBaseGraph;
    }
  },

  saveAndInterConnectInApp: {
    value: function(callback) {

      if (typeof callback === "function") {
        callback();
      }
    }
  },

  visualizeMorphemesAsForceDirectedGraph: {
    value: function() {
      this.warn("visualizeMorphemesAsForceDirectedGraph is deprecated use visualizePrecedenceRelationsAsForceDirectedGraph instead");
    }
  },

  /*
   * Show precedes relations in a connected graph
   * 
   * http://bl.ocks.org/mbostock/1153292
   * http://alignedleft.com/tutorials/d3/binding-data
   *
   * @param  {[type]} self.morphemeSegmentationKnowledgeBaseGraph [description]
   * @param  {[type]} element [description]
   * @param  {[type]} dbname  [description]
   * @return {[type]}            [description]
   */
  visualizePrecedenceRelationsAsForceDirectedGraph: {
    value: function(element) {

      if (!this.lexicon || !this.lexicon.length) {
        this.warn("Cannot visualize an empty lexicon.");
        return this;
      }

      var prefs = {
        showRelations: ["preceeds"]
      };
      if (this.corpus && this.corpus.prefs) {
        prefs = this.corpus.prefs;
      }

      this.lexicon.visualizeAsForceDirectedGraph(element, prefs);

      return this;
    }

  },

  render: {
    value: function() {
      return this.visualizePrecedenceRelationsAsForceDirectedGraph(arguments);
    }
  },

  isWithinConfidenceRange: {
    value: function(morpheme, confidenceRange) {
      if (!confidenceRange) {
        return true;
      }
      return morpheme.confidence <= confidenceRange.max && morpheme.confidence >= confidenceRange.min;
    }
  }

});


exports.Glosser = Glosser;
