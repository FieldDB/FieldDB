try {
  var ObservableDOM = require("frb/dom"); // add support for content editable
} catch (e) {
  console.warn("Warning contentEditable won't work because : \n", e, "\n\n");
}

var Bindings = require("frb/bindings");
var SortedSet = require("collections/sorted-set");
var UniqueSet = require("collections/set");
var CORS = require("../CORS");
var Q = require("q");
var LexiconNode = require("./LexiconNode").LexiconNode;

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
  if (!this.fieldDBtype) {
    this.fieldDBtype = "Lexicon";
  }

  // console.log("\tConstructing Lexicon... ");
  // SortedSet.apply(this, [values, equals, compare, getDefault]);
  SortedSet.apply(this, Array.prototype.slice.call(arguments, 1));
  // if (!compare) {
  //   this.contentCompare = this.__proto__.fieldsCompare;
  // }
  // if (!equals) {
  //   this.contentEquals = this.__proto__.fieldsEqual;
  // }
  // 
  if (values && Object.prototype.toString.call(values) === "[object Array]") {
    if (values[0].relation || values[0].key) {
      console.log("constructing a lexicon from a set of connected nodes", values);
      this.precedenceRelations = values;
    } else {
      console.log("constructing a lexicon from nodes", values);
      var self = this;
      values.map(function(node) {
        self.add(new LexiconNode(node));
      });
    }
  } else if (values) {
    console.log("constructing a lexicon from an object", values);
    for (var property in values) {
      if (values.hasOwnProperty(property)) {
        this[property] = values[property];
      }
    }
  }
};

Lexicon.prototype = Object.create(SortedSet.prototype, /** @lends Lexicon.prototype */ {
  constructor: {
    value: Lexicon
  },

  debug: {
    value: function() {
      try {
        return FieldDB.FieldDBObject.prototype.debug.apply(this, arguments);
      } catch (e) {
        // console.log("Not showing developer ", arguments);
      }
    }
  },
  bug: {
    value: function() {
      try {
        return FieldDB.FieldDBObject.prototype.bug.apply(this, arguments);
      } catch (e) {
        console.warn("Not telling user about a bug ", arguments);
      }
    }
  },
  popup: {
    value: function() {
      try {
        return FieldDB.FieldDBObject.popup.apply(this, arguments);
      } catch (e) {
        console.warn("Not telling user about a popup ", arguments);
      }
    }
  },
  confirm: {
    value: function() {
      try {
        return FieldDB.FieldDBObject.prototype.confirm.apply(this, arguments);
      } catch (e) {
        console.warn("Not asking user about ", arguments);
      }
    }
  },
  warn: {
    value: function(message) {

      try {
        return FieldDB.FieldDBObject.prototype.warn.apply(this, arguments);
      } catch (e) {
        if (this.warnMessage) {
          this.warnMessage += ";;; ";
        } else {
          this.warnMessage = "";
        }
        this.warnMessage = this.warnMessage + message;
        console.warn("Not warning user about ", arguments);
      }
    }
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
      return this.render(arguments);
    }
  },

  render: {
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
              var saveEditToAllData = self.confirm("Would you like to clean this lexical entry? (This will change all examples you see here to have this new information.)\n\n" + changesAsStrings.join("\n"));
              if (saveEditToAllData) {
                e.target.parentElement.__data__.save().then(function(result) {
                  console.log("Saving success...", result);
                  self.popup("Saved " + changesAsStrings.join(" "));
                }, function(reason) {
                  console.log("Saving failed...", reason);
                  self.bug("Save failed. " + reason.userFriendlyErrors.join(" "));
                }).fail(function(reason) {
                  console.log("Saving failed...", reason);
                  self.bug("Save failed. Please notify the app's developers " + e.target.parentElement.__data__.datumids.join(" "));
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
            console.log(window.currentlySelectedNode.__data__);
          } catch (e) {
            console.warn("Unable to make current node investigatable on the console.");
          }
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
        headword.contentEditable = "true";
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
              fieldElement.contentEditable = "true";
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

  entryRelations: {
    get: function() {
      return this._entryRelations;
    },
    set: function(value) {
      if (value.rows) {
        value = value.rows;
      }
      this._entryRelations = value;
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
   * Takes as a parameters an array of this.entryRelations which came from CouchDB precedence rule query.
   * Example Rule: {"key":{"x":"@","relation":"preceeds","y":"aqtu","context":"aqtu-nay-wa-n"},"value":2}
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
        nodes: {}
      };

      /*
       * Cycle through the precedence rules, convert them into graph edges with the morpheme index in the morpheme array as the source/target values
       */
      this.entryRelations.map(function(entryRelation) {
        if (!entryRelation) {
          return;
        }
        var connectionEdge = entryRelation.key || entryRelation;
        var from = connectionEdge.from || connectionEdge.source || connectionEdge.previous;
        var to = connectionEdge.to || connectionEdge.target || connectionEdge.subsequent;

        connectionEdge.frequencyCount = connectionEdge.value || entryRelation.key ? entryRelation.key.count : null;
        self.debug("Adding ", connectionEdge, " to connected graph");

        if (!from || !to) {
          self.warn("Missing either a `from` or `to` ", connectionEdge);
          return;
        }
        if (!from.morphemes || !to.morphemes) {
          self.warn("Missing morphemes on the nodes ", connectionEdge);
          return;
        }
        /* skip word boundaries unless otherwise specified */
        if (from.morphemes === "@" ||
          from.morphemes === "_#" ||
          from.morphemes === "#_" ||
          to.morphemes === "@" ||
          to.morphemes === "_#" ||
          to.morphemes === "#_") {
          if (!prefs.showGlosserAsMorphemicTemplate) {
            self.debug("Skipping a connection involving a word boundary ", connectionEdge);
            return;
          }
        }
        /* make the @ more like what a linguist recognizes for word boundaries */
        if (from.morphemes === "@") {
          from.morphemes = "#_";
        }
        if (to.morphemes === "@") {
          to.morphemes = "_#";
        }

        // use bigrams unless otherwise specified
        if ((!prefs.maxDistanceForContext && connectionEdge.distance > 1) ||
          (prefs.maxDistanceForContext & connectionEdge.distance > prefs.maxDistanceForContext)) {
          self.warn("Skipping distantly related nodes ", connectionEdge);
          return;
        }
        // visualize only preceeds connectionEdges unless otherwise specified
        if ((!prefs.showRelations && connectionEdge.relation !== "preceeds") ||
          (prefs.showRelations && prefs.showRelations.indexOf(connectionEdge.relation) === -1)) {
          self.warn("Skipping nodes which arent related by precedence ", connectionEdge);
          return;
        }

        if (!self.isWithinConfidenceRange(from, prefs.confidenceRange) ||
          !self.isWithinConfidenceRange(to, prefs.confidenceRange)) {
          self.warn("Skipping nodes which arent confident enough ", connectionEdge);
          return;
        }

        // Add the from node to the list of nodes, if it is not already there
        var headword = from.headword || from.morphemes;
        if (!self.connectedGraph.nodes[headword]) {
          self.connectedGraph.nodes[headword] = from;
        } else {
          self.warn(headword + " was already defined. either overwrite with this, or use it for this connection edge");
        }
        from = self.connectedGraph.nodes[headword];

        // Add the to node to the list of nodes, if it is not already there
        headword = to.headword || to.morphemes;
        if (!self.connectedGraph.nodes[headword]) {
          self.connectedGraph.nodes[headword] = to;
        }
        to = self.connectedGraph.nodes[headword];

        // Use the language of connected graphs
        connectionEdge.from = from;
        connectionEdge.to = to;

        // Dont keep other names for the two nodes
        delete connectionEdge.previous;
        delete connectionEdge.subsequent;
        delete connectionEdge.source;
        delete connectionEdge.target;

        self.connectedGraph[connectionEdge.relation] = self.connectedGraph[connectionEdge.relation] || [];
        self.connectedGraph[connectionEdge.relation].push(connectionEdge);
      });

      return this.connectedGraph;
    }
  },

  /**
   * Overwrite/build the lexicon from the corpus server if it is there, saves
   * the results to local storage so they can be reused offline.
   *
   * @param dbname
   * @param callback
   */
  buildLexiconFromCouch: {
    value: {
      value: function(dbname, callback) {
        var self = this;

        CORS.makeCORSRequest({
          type: "GET",
          url: this.corpus.url + "/_design/pages/_view/lexicon_create_tuples?group=true",
          success: function(results) {
            self.generatePrecedenceForceDirectedRulesJsonForD3(results.rows);
            if (typeof callback === "function") {
              callback();
            }
          }, // end successful response
          dataType: ""
        });
      }
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
   * @param  {[type]} rulesGraph [description]
   * @param  {[type]} element [description]
   * @param  {[type]} dbname  [description]
   * @return {[type]}            [description]
   */
  visualizeAsForceDirectedGraph: {
    value: function(element, prefs) {
      var self = this;
      if (!prefs && this.corpus && this.corpus.prefs) {
        prefs = this.corpus.prefs;
      }
      if (!prefs) {
        prefs = {};
      }
      if (!prefs.showRelations) {
        prefs.showRelations = ["preceeds"];
      }
      if (!this.connectedGraph || !this.connectedGraph.links.length || !this.connectedGraph.nodes) {
        this.updateConnectedGraph(prefs);

        if (!this.connectedGraph || !this.connectedGraph.nodes) {
          return this;
        }

        // Include all relations which the preferences request
        this.connectedGraph.links = [];
        prefs.showRelations.map(function(relation) {
          if (!relation || !self.connectedGraph[relation] || !self.connectedGraph[relation].length) {
            return this;
          }
          self.connectedGraph.links = self.connectedGraph.links.concat(self.connectedGraph[relation]);
        });
      }
      this.debug("Displaying a connected graph of " + this.connectedGraph.links.length + " links");

      if (self.connectedGraph.links.length === 0) {
        return this;
      }

      var width = element.clientWidth,
        height = 600;

      if (!this.d3) {
        try {
          this.d3 = d3;
        } catch (e) {
          this.warn("Lexicon will be unable to render a visual representation of itself. If you intended to render it, you should add d3 as a dependancy to your app.", this.d3);
          return this;
        }
      }

      if (!element) {
        this.warn("Lexicon will be unable to render a visual representation of itself. If you intended to render it, you should provide an element where it should be rendered.", element);
        return this;
      }
      this.debug("Using element", element);

      var tooltip;
      if (!this.localDOM) {
        try {
          this.localDOM = document;
        } catch (e) {
          // this.warn("Lexicon will be unable to render a hover on the connected graph. If you intended to render it, you should provide an localDOM to the lexicon.");
          this.warn("Lexicon will be unable to render the connected graph. If you intended to render it, you should provide an localDOM to the lexicon.");
          return this;
        }
      }
      tooltip = this.localDOM.createElement("div");
      this.localDOM.body.appendChild(tooltip);
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

      var lineColor = this.d3.scale.linear()
        .range(["#FFFFF", "#FFFF00"]) // or use hex values
        .domain([1, 8]);

      // var force = this.d3.layout.force()
      //   .charge(-120)
      //   .linkStrength(0.2)
      //   .linkDistance(30)
      //   .size([width, height]);

      var force = this.d3.layout.force()
        .nodes(this.d3.values(self.connectedGraph.nodes))
        .links(self.connectedGraph.links)
        .size([width, height])
        .linkStrength(0.5)
        .linkDistance(60)
        .charge(-400);


      var svg = this.localDOM.createElement("svg");
      if (typeof element.appendChild !== "function") {
        this.warn("You have provided a defective element, it is unable to append elements to itself. Appending to the body of the document instead.", element);
        // return this;
        this.localDOM.body.appendChild(svg);
      } else {
        element.appendChild(svg);
      }
      svg = this.d3.select(svg);

      svg.attr("width", width)
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
          var findNode;
          if (self.localDOM) {
            findNode = self.localDOM.getElementById(object.morphemes);
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
            .html("<div class='node_details_tooltip lexicon'>" + findNode + "</div>");
        })
        .on("mousemove", function(object) {
          /*global  event */
          if (tooltip) {
            return;
          }
          return tooltip.style("top", (event.pageY - 10) + "px")
            .style("left", (event.pageX + 10) + "px");
        })
        .on("mouseout", function(object) {
          if (tooltip) {
            return;
          }
          return tooltip
            .style("visibility", "hidden");
        })
        .on("click", function(d) {
          /* show the morpheme as a search result so the user can use the viz to explore the corpus*/
          if (this.application && this.application.router) {
            // this.application.router.showEmbeddedSearch(dbname, "morphemes:"+d.morphemes);
            var url = "corpus/" + self.corpus.dbname + "/search/" + "morphemes:" + d.morphemes;
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

      try {
        force
          .on("tick", tick)
          .start();
      } catch (e) {
        this.warn("The lexicon was able to start the connected graph. If you are in a Node.js environment, this is normal.\n", e.stack);
      }

      return this;
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
  lex.entryRelations = new UniqueSet();
  lex.references = new UniqueSet();
  if (options.entryRelations && options.entryRelations.length > 0) {
    for (var i in options.entryRelations) {
      if (!options.entryRelations[i] || !options.entryRelations[i].key || !options.entryRelations[i].key.previous || !options.entryRelations[i].key.subsequent) {
        console.warn("Skipping malformed lexical node", options.entryRelations[i]);
        continue;
      }
      try {
        //Add source target and value to the link
        delete options.entryRelations[i].key.previous.utterance;
        delete options.entryRelations[i].key.subsequent.utterance;
        options.entryRelations[i].key.utteranceContext = options.entryRelations[i].key.context.utterance;
        options.entryRelations[i].key.datumid = options.entryRelations[i].id;

        // Put the previous and subsequent morphemes into the morpheme nodes
        // lex.add(options.entryRelations[i].key.context.utterance, new LexiconNode({
        //   fields: options.entryRelations[i].key.previous
        // }));
        options.entryRelations[i].key.previous.datumids = [options.entryRelations[i].key.context.id];
        options.entryRelations[i].key.previous.utteranceContext = [options.entryRelations[i].key.context.utterance];
        options.entryRelations[i].key.previous.url = options.url;
        lex.add(new LexiconNode(options.entryRelations[i].key.previous));

        // lex.add(options.entryRelations[i].key.context.utterance, new LexiconNode({
        //   fields: options.entryRelations[i].key.previous
        // }));
        options.entryRelations[i].key.subsequent.datumids = [options.entryRelations[i].key.context.id];
        options.entryRelations[i].key.subsequent.utteranceContext = [options.entryRelations[i].key.context.utterance];
        options.entryRelations[i].key.subsequent.url = options.url;
        lex.add(new LexiconNode(options.entryRelations[i].key.subsequent));
        lex.references.add(options.entryRelations[i].key.context.id);

        //To avoid loops
        if (options.entryRelations[i].key.subsequent.morphemes.indexOf("@") === -1) {
          lex.entryRelations.add(options.entryRelations[i].key);
        }

      } catch (e) {
        console.warn(" caught an error while building a lexical node ", e.stack);
      }

    }
  }
  if (options.orthography || options.wordFrequencies) {
    if (options.nonContentWordsArray) {
      options.userSpecifiedNonContentWords = true;
      if (Object.prototype.toString.call(options.nonContentWordsArray) === "[object Array]" && options.nonContentWordsArray.length === 0) {
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

exports.Lexicon = Lexicon;
