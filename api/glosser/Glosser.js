"use strict";

var Q = require("q");
var FieldDBObject = require("../FieldDBObject").FieldDBObject;
var CORS = require("../CORS").CORS;
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
  try {
    this.d3 = options.d3 || Glosser.d3 || window.d3 || {};
  } catch (e) {
    this.warn("Glosser will be unable to render a visual representation of itself. If you intended to render it, you should add d3 as a dependancy to your app.");
  }
  this.debug("Constructing Glosser length: ", options);
  FieldDBObject.apply(this, arguments);
};

Glosser.prototype = Object.create(FieldDBObject.prototype, /** @lends Glosser.prototype */ {
  constructor: {
    value: Glosser
  },

  downloadPrecedenceRules: {
    value: function(pouchname, glosserURL, callback) {
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
          //   localStorage.setItem(pouchname + "precendenceRules", JSON.stringify(rules.rows));
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
          //   localStorage.setItem(pouchname + "precendenceRules", JSON.stringify(rules.rows));
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
            localStorage.setItem(pouchname + "reducedRules", JSON.stringify(reducedRules));
          } catch (error) {
            //remove other corpora's rules to make space for the most recent...
            for (var x in localStorage) {
              if (x.indexOf("reducedRules") > -1) {
                localStorage.removeItem(x);
              }
            }
            try {
              localStorage.setItem(pouchname + "reducedRules", JSON.stringify(reducedRules));
            } catch (error2) {
              console.warn("Your lexicon is huge!", error2);
            }
          }

          self.reducedRules = reducedRules;

          self.currentCorpusName = pouchname;
          if (typeof callback === "function") {
            callback(rules.rows);
          }
          deffered.resolve(rules.rows);
        },
        error: function(e) {
          console.log("error getting precedence rules:", e);
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
    value: function(unparsedUtterance, pouchname, justCopyDontGuessIGT) {
      if (!unparsedUtterance) {
        return "";
      }

      if (justCopyDontGuessIGT) {
        return unparsedUtterance;
      }

      if (!pouchname) {
        if (!this.application || !this.application.get("corpus")) {
          throw "Glosser can't be guessed, there is no app so the URL must be defined.";
        }
        pouchname = this.application.get("corpus").get("couchConnection").pouchname;
      }

      var potentialParse = "";
      // Get the precedence rules from localStorage
      var rules = this.reducedRules || localStorage.getItem(pouchname + "reducedRules");

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
    value: function(fields, pouchname, justCopyDontGuessIGT) {
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
    value: function(morphemesLine, pouchname, justCopyDontGuessIGT) {
      if (!morphemesLine) {
        return "";
      }

      if (justCopyDontGuessIGT) {
        var justQuestionMarks = morphemesLine.trim().replace(/[^ -]+/g, "?");
        return justQuestionMarks;
      }

      if (!pouchname) {
        if (!this.application || !this.application.get("corpus")) {
          throw "Glosser can't be guessed, there is no app so the URL must be defined.";
        }
        pouchname = this.application.get("corpus").get("couchConnection").pouchname;
      }

      var lexiconNodes = localStorage.getItem(pouchname + "lexiconResults");
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
            console.log("Glosses which match: ", matchingNodes);
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
      fields.morphemes = this.morphemefinder(fields.utterance, fields.pouchname, justCopyDontGuessIGT);
      if (!fields.gloss) {
        fields = this.contextSensitiveGlossFinder(fields, fields.pouchname, justCopyDontGuessIGT);
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
      fields = this.contextSensitiveGlossFinder(fields, fields.pouchname, justCopyDontGuessIGT);
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
          //      console.log(matchingNode);
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
    value: function(rules, pouchname) {
      if (!pouchname) {
        pouchname = this.currentCorpusName;
      }
      if (!rules) {
        rules = this.reducedRules;
        if (!rules) {
          localStorage.getItem(pouchname + "precendenceRules");
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
   * Some sample D3 from the force-html.html example
   * http://bl.ocks.org/mbostock/1153292
   * http://alignedleft.com/tutorials/d3/binding-data
   *
   * @param  {[type]} rulesGraph [description]
   * @param  {[type]} divElement [description]
   * @param  {[type]} pouchname  [description]
   * @return {[type]}            [description]
   */
  visualizePrecedenceRelationsAsForceDirectedGraph: {
    value: function(lexicon, divElement, dontConnectOnWordBoundaries, confidenceRange) {

      var precedenceGraph = {
        links: [],
        nodes: {}
      };
      var self = this;
      if (!this.localDocument) {
        console.warn(" Glosser Visualization requested but the DOM was not provided to the glosser ");
        return;
      }
      var localDocument = this.localDocument;

      lexicon.precedenceGraph = lexicon.precedenceRelations.filter(function(relation) {
        if (!relation.key.previous || !relation.key.subsequent) {
          // console.log("skipping ", relation.key);
          return;
        }
        if (!relation.key.previous.morphemes || !relation.key.subsequent.morphemes) {
          // console.log("skipping ", relation.key);
          return;
        }
        /* skip word boundaries if requested */
        if (relation.key.previous.morphemes === "@" || relation.key.previous.morphemes === "_#" || relation.key.previous.morphemes === "#_" || relation.key.subsequent.morphemes === "@" || relation.key.subsequent.morphemes === "_#" || relation.key.subsequent.morphemes === "#_") {
          if (dontConnectOnWordBoundaries) {
            return;
          }
        }
        /* make the @ more like what a linguist recognizes for  word boundaries */
        if (relation.key.previous.morphemes === "@") {
          relation.key.previous.morphemes = "#_";
        }
        if (relation.key.subsequent.morphemes === "@") {
          relation.key.subsequent.morphemes = "_#";
        }

        // only consider immediate precedence
        if (relation.key.distance > 1) {
          return;
        }
        // only consider -> relations
        if (relation.key.relation !== "precedes") {
          return;
        }
        // only confident morphemes
        confidenceRange = confidenceRange || {
          min: 0,
          max: 1
        };
        if (!self.isWithinConfidenceRange(relation.key.previous, confidenceRange) ||
          !self.isWithinConfidenceRange(relation.key.subsequent, confidenceRange)) {
          return;
        }
        relation.key.source = relation.key.previous;
        relation.key.target = relation.key.subsequent;
        precedenceGraph.links.push(relation.key);
      });
      lexicon.precedenceGraph = precedenceGraph;

      if (!lexicon.precedenceGraph) {
        return;
      }
      if (lexicon.precedenceGraph.links.length === 0) {
        return;
      }

      var width = divElement.clientWidth,
        height = 600;

      // Get the complete node for the links.
      lexicon.precedenceGraph.links.map(function(link) {
        if (!link || !link.source || !link.source.morphemes || !link.target || !link.target.morphemes) {
          return;
        }
        if (!lexicon.precedenceGraph.nodes[link.source.morphemes]) {
          lexicon.precedenceGraph.nodes[link.source.morphemes] = link.source;
        }
        link.source = lexicon.precedenceGraph.nodes[link.source.morphemes];

        if (!lexicon.precedenceGraph.nodes[link.target.morphemes]) {
          lexicon.precedenceGraph.nodes[link.target.morphemes] = link.target;
        }
        link.target = lexicon.precedenceGraph.nodes[link.target.morphemes];
      });
      var tooltip = this.d3.select("body")
        .append("div")
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

      var lineColor = this.d3.scale.linear()
        .range(["#FFFFF", "#FFFF00"]) // or use hex values
        .domain([1, 8]);

      // var force = this.d3.layout.force()
      //   .charge(-120)
      //   .linkStrength(0.2)
      //   .linkDistance(30)
      //   .size([width, height]);

      var force = this.d3.layout.force()
        .nodes(this.d3.values(lexicon.precedenceGraph.nodes))
        .links(lexicon.precedenceGraph.links)
        .size([width, height])
        .linkStrength(0.5)
        .linkDistance(60)
        .charge(-400);

      var svg = this.d3.select(divElement).append("svg")
        .attr("width", width)
        .attr("height", height);

      // Per-type markers, as they don't inherit styles.
      svg.append("defs").selectAll("marker")
        .data(["precedes"])
        // .data(["suit", "licensing", "resolved"])
        .enter()
        .append("marker")
        .attr("id", function(d) {
          return d;
        })
        .style("opacity", function(d) {
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

      var path = svg.append("g").selectAll("path")
        .data(force.links())
        .enter().append("path")
        .attr("class", function(d) {
          return "link " + d.relation + " distance" + d.distance;
        })
        .attr("marker-end", function(d) {
          return "url(#" + d.relation + ")";
        });

      var circle = svg.append("g").selectAll("circle")
        .data(force.nodes())
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", 5)
        .style("fill", function(d) {
          if (d.morphemes === "#_") {
            return "#00000";
          }
          if (d.morphemes === "_#") {
            return "#ffffff";
          }
          return color(d.morphemes.length);
          // return color(d.confidence * 10);
        })
        .style("opacity", function(d) {
          // return color(d.morphemes.length);
          return d.confidence ? d.confidence / 2 : 1;
        })
        .on("mouseover", function(object) {
          var findNode = localDocument.getElementById(object.morphemes);
          if (findNode) {
            findNode = findNode.innerHTML + "<p>" + findNode.getAttribute("title") + "<p>";
          } else {
            findNode = "Morpheme: " + object.morphemes + "<br/> Gloss: " + object.gloss + "<br/> Confidence: " + object.confidence;
          }
          return tooltip
            .style("visibility", "visible")
            .html("<div class='node_details_tooltip lexicon'>" + findNode + "</div>");
        })
        .on("mousemove", function(object) {
          /*global  event */
          return tooltip.style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function(object) {
          return tooltip
            .style("visibility", "hidden");
        })
        .on("click", function(d) {
          /* show the morpheme as a search result so the user can use the viz to explore the corpus*/
          if (this.application && this.application.router) {
            // this.application.router.showEmbeddedSearch(pouchname, "morphemes:"+d.morphemes);
            var url = "corpus/" + lexicon.pouchname + "/search/" + "morphemes:" + d.morphemes;
            // window.location.replace(url);
            this.application.router.navigate(url, {
              trigger: true
            });

          }
        })
        .call(force.drag);

      var text = svg.append("g").selectAll("text")
        .data(force.nodes())
        .enter().append("text")
        .attr("x", 8)
        .attr("y", ".31em")
        .style("opacity", function(d) {
          // return color(d.morphemes.length);
          return d.confidence ? d.confidence / 2 : 1;
        })
        .style("color", function(d) {
          if (d.morphemes === "#_") {
            return "#00000";
          }
          if (d.morphemes === "_#") {
            return "#ffffff";
          }
          return color(d.morphemes.length);
          // return color(d.confidence * 10);
        })
        .text(function(d) {
          return d.morphemes;
        });


      // Use elliptical arc path segments to doubly-encode directionality.
      var tick = function() {
        path.attr("d", linkArc);
        circle.attr("transform", transform);
        text.attr("transform", transform);
      };

      force
        .on("tick", tick)
        .start();


    }
  },

  isWithinConfidenceRange: {
    value: function(morpheme, confidenceRange) {
      return morpheme.confidence <= confidenceRange.max && morpheme.confidence >= confidenceRange.min;
    }
  }

});


exports.Glosser = Glosser;
