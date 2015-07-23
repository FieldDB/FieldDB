"use strict";

var Q = require("q");
var FieldDBObject = require("../FieldDBObject").FieldDBObject;
var CORS = require("../CORS").CORS;
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
    value: function(dbname, glosserURL, callback) {
      if (!glosserURL || glosserURL === "default") {
        if (!this.corpus) {
          throw "Glosser cant be guessed, there is no app so the URL must be defined.";
        }
        glosserURL = this.corpus.url + "/_design/pages/_view/precedence_rules?group=true";
      }
      var self = this;
      var deffered = Q.defer();
      CORS.makeCORSRequest({
        type: "GET",
        url: glosserURL,
        success: function(rules) {
          // Dont need to store the actual rules, they are too big
          // try {
          //   localStorage.setItem(dbname + "precendenceRules", JSON.stringify(rules.rows));
          // } catch (e) {
          //   //remove other corpora's rules to make space for the most recent...
          //   for (var x in localStorage) {
          //     if(!localStorage.hasOwnProperty(x)){
          //       continue;
          //     }
          //     if (x.indexOf("precendenceRules") > -1) {
          //       localStorage.removeItem(x);
          //     }
          //   }
          //   localStorage.setItem(dbname + "precendenceRules", JSON.stringify(rules.rows));
          // }

          // Reduce the rules such that rules which are found in multiple source
          // words are only used/included once.
          var reducedRules = _.chain(rules.rows).groupBy(function(rule) {
            if (rule.key.distance === 1) {
              // upgrade to fancier context sensitive rules
              if (rule.key.previous && rule.key.previous.morphemes) {
                rule.key.x = rule.key.previous.morphemes;
              }
              if (rule.key.subsequent && rule.key.subsequent.morphemes) {
                rule.key.y = rule.key.subsequent.morphemes;
              }
            }
            return rule.key.x + "-" + rule.key.y;
          }).value();

          // Save the reduced precedence rules in localStorage
          try {
            localStorage.setItem(dbname + "reducedRules", JSON.stringify(reducedRules));
          } catch (error) {
            //remove other corpora's rules to make space for the most recent...
            for (var x in localStorage) {
              if (x.indexOf("reducedRules") > -1) {
                localStorage.removeItem(x);
              }
            }
            try {
              localStorage.setItem(dbname + "reducedRules", JSON.stringify(reducedRules));
            } catch (error2) {
              self.warn("Your lexicon is huge!", error2);
            }
          }

          self.reducedRules = reducedRules;

          self.currentCorpusName = dbname;
          if (typeof callback === "function") {
            callback(rules.rows);
          }
          deffered.resolve(rules.rows);
        },
        error: function(e) {
          self.warn("Error getting precedence rules:", e);
          self.bug("Error getting precedence rules:");
          deffered.reject(e);
        },
        dataType: ""
      });

      return deffered.promise;
    }
  },

  /**
   * Takes in an utterance line and, based on our current set of precendence
   * rules, guesses what the morpheme line would be. The algorithm is
   * very conservative.
   *
   * @param {String} unparsedUtterance The raw utterance line.
   *
   * @return {String} The guessed morphemes line.
   */
  morphemefinder: {
    value: function(unparsedUtterance, dbname, justCopyDontGuessIGT) {
      if (!unparsedUtterance) {
        return "";
      }

      if (justCopyDontGuessIGT) {
        return unparsedUtterance;
      }

      if (!dbname) {
        if (!this.application || !this.application.get("corpus")) {
          throw "Glosser can't be guessed, there is no app so the URL must be defined.";
        }
        dbname = this.application.get("corpus").get("couchConnection").dbname;
      }

      var potentialParse = "";
      // Get the precedence rules from localStorage
      var rules = this.reducedRules || localStorage.getItem(dbname + "reducedRules");

      var parsedWords = [];
      if (rules) {
        // Parse the rules from JSON into an object
        rules = JSON.parse(rules);

        // Divide the utterance line into words
        var unparsedWords = unparsedUtterance.trim().split(/ +/);

        for (var word in unparsedWords) {
          // Add the start/end-of-word character to the word
          unparsedWords[word] = "@" + unparsedWords[word] + "@";

          // Find the rules which match in local precedence
          var matchedRules = [];
          for (var r in rules) {
            if (unparsedWords[word].indexOf(r.replace(/-/, "")) >= 0) {
              matchedRules.push({
                r: rules[r]
              });
            }
          }

          // Attempt to find the longest template which the matching rules can
          // generate from start to end
          var prefixtemplate = [];
          prefixtemplate.push("@");
          for (var i = 0; i < 10; i++) {
            if (prefixtemplate[i] === undefined) {
              break;
            }
            for (var j in matchedRules) {
              if (prefixtemplate.length > 2 && prefixtemplate[prefixtemplate.length - 1] === "@") {
                continue; //we found the end already
              }
              if (prefixtemplate[i] === matchedRules[j].r[0].key.x) {
                if (prefixtemplate[i + 1]) { // ambiguity (two potential following
                  // morphemes)
                  prefixtemplate.pop();
                  break;
                } else {
                  prefixtemplate[i + 1] = matchedRules[j].r[0].key.y;
                }
              }
            }
          }
          // If prefix template matches the whole word (ie we have seen it before, return the prefix template exactly)
          if (prefixtemplate.length > 2 && prefixtemplate[0] === "@" && prefixtemplate[prefixtemplate.length - 1] === "@") {
            prefixtemplate.pop(); //remove final @
            prefixtemplate.shift(); //remove intitial @
            parsedWords.push(prefixtemplate.join("-"));
          } else {
            // If the prefix template hit ambiguity in the middle, try from the suffix
            // in until it hits ambiguity
            var suffixtemplate = [];
            if (prefixtemplate[prefixtemplate.length - 1] !== "@" || prefixtemplate.length === 1) {
              // Suffix:
              suffixtemplate.push("@");
              for (var ii = 0; ii < 10; ii++) {
                if (suffixtemplate[ii] === undefined) {
                  break;
                }
                for (var jj in matchedRules) {
                  if (suffixtemplate[ii] === matchedRules[jj].r[0].key.y) {
                    if (suffixtemplate[ii + 1]) { // ambiguity (two potential
                      // following morphemes)
                      suffixtemplate.pop();
                      break;
                    } else {
                      suffixtemplate[ii + 1] = matchedRules[jj].r[0].key.x;
                    }
                  }
                }
              }
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

            // Use the regular expression to find a guessed morphemes line
            potentialParse = unparsedWords[word]
              .replace(regex, "$1-$2-$3-$4-$5-$6-$7-$8-$9") // Use backreferences to parse into morphemes
              .replace(/\$[0-9]/g, "") // Remove any backreferences that weren't used
              .replace(/@/g, "") // Remove the start/end-of-line symbol
              .replace(/--+/g, "-") // Ensure that there is only ever one "-" in a row
              .replace(/^-/, "") // Remove "-" at the start of the word
              .replace(/-$/, ""); // Remove "-" at the end of the word
            if (this.debugMode) {
              this.debug("Potential parse of " + unparsedWords[word].replace(/@/g, "") + " is " + potentialParse);
            }

            parsedWords.push(potentialParse);
          }

        }
      }

      return parsedWords.join(" ");
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
   * Takes as a parameters an array of rules which came from CouchDB precedence rule query.
   * Example Rule: {"key":{"x":"@","relation":"preceeds","y":"aqtu","context":"aqtu-nay-wa-n"},"value":2}
   */
  generateForceDirectedRulesJsonForD3: {
    value: function(rules, dbname) {
      if (!dbname) {
        dbname = this.currentCorpusName;
      }
      if (!rules) {
        rules = this.reducedRules;
        if (!rules) {
          localStorage.getItem(dbname + "precendenceRules");
          if (rules) {
            rules = JSON.parse(rules);
          }
        }
      }
      if (!rules) {
        return;
      }
      /*
       * Cycle through the precedence rules, convert them into graph edges with the morpheme index in the morpheme array as the source/target values
       */
      var morphemeLinks = [];
      var morphemes = [];
      for (var i in rules) {
        /* make the @ more like what a linguist recognizes for word boundaries */
        if (rules[i].key.x === "@") {
          rules[i].key.x = "#_";
        }
        if (rules[i].key.y === "@") {
          rules[i].key.y = "_#";
        }
        var xpos = morphemes.indexOf(rules[i].key.x);
        if (xpos < 0) {
          morphemes.push(rules[i].key.x);
          xpos = morphemes.length - 1;
        }
        var ypos = morphemes.indexOf(rules[i].key.y);
        if (ypos < 0) {
          morphemes.push(rules[i].key.y);
          ypos = morphemes.length - 1;
        }
        //To avoid loops?
        if (rules[i].key.y.indexOf("@") === -1) {
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
      var rulesGraph = {};
      rulesGraph.links = morphemeLinks;
      rulesGraph.nodes = morphemenodes;
      this.rulesGraph = rulesGraph;

      return rulesGraph;
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
   * @param  {[type]} rulesGraph [description]
   * @param  {[type]} element [description]
   * @param  {[type]} dbname  [description]
   * @return {[type]}            [description]
   */
  visualizePrecedenceRelationsAsForceDirectedGraph: {
    value: function(element) {
      var self = this;

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
