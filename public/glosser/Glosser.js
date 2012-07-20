var Glosser = Glosser || {};
Glosser.currentCorpusName = "";
Glosser.downloadPrecedenceRules = function(corpusname, callback){
  $.ajax({
    type : 'GET',
    url : "https://ilanguage.iriscouch.com/" + corpusname
        + "/_design/get_precedence_rules_from_morphemes/_view/precedence_rules?group=true",
    success : function(rules) {
      // Parse the rules from JSON into an object
      rules = JSON.parse(rules);
    
      // Reduce the rules such that rules which are found in multiple source
      // words are only used/included once.
      var reducedRules = _.chain(rules.rows).groupBy(function(rule) {
        return rule.key.x + "-" + rule.key.y;
      }).value();
      
      // Save the reduced precedence rules in localStorage
      localStorage.setItem(corpusname+"PrecendenceRules", JSON.stringify(reducedRules));
      Glosser.currentCorpusName = corpusname;
      if(typeof callback == "function"){
        callback();
      }
    },
    error : function(e) {
      console.log("error getting precedence rules:", e);
    },
    dataType : ""
  });
}
/**
 * Takes in an utterance line and, based on our current set of precendence
 * rules, guesses what the morpheme line would be. The algorithm is
 * very conservative.
 * 
 * @param {String} unparsedUtterance The raw utterance line.
 *
 * @return {String} The guessed morphemes line. 
 */
Glosser.morphemefinder = function(unparsedUtterance) {
  var potentialParse = '';
  
  // Get the precedence rules from localStorage
  var rules = localStorage.getItem(Glosser.currentCorpusName+"precendenceRules");
  
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
            r : rules[r]
          })
        }
      }

      // Attempt to find the longest template which the matching rules can
      // generate from start to end
      var prefixtemplate = [];
      prefixtemplate.push("@");
      for (var i = 0; i < 10; i++) {
        if (prefixtemplate[i] == undefined) {
          break;
        }
        for (var j in matchedRules) {
          if (prefixtemplate[i] == matchedRules[j].r[0].key.x) {
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

      // If the prefix template hit ambiguity in the middle, try from the suffix
      // in until it hits ambiguity
      var suffixtemplate = [];
      if (prefixtemplate[prefixtemplate.length - 1] != "@" || prefixtemplate.length == 1) {
        // Suffix:
        suffixtemplate.push("@")
        for (var i = 0; i < 10; i++) {
          if (suffixtemplate[i] == undefined) {
            break;
          }
          for (var j in matchedRules) {
            if (suffixtemplate[i] == matchedRules[j].r[0].key.y) {
              if (suffixtemplate[i + 1]) { // ambiguity (two potential
                                            // following morphemes)
                suffixtemplate.pop();
                break;
              } else {
                suffixtemplate[i + 1] = matchedRules[j].r[0].key.x;
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
      template = prefixtemplate.concat(suffixtemplate.reverse())
      for (var slot in template) {
        template[slot] = "(" + template[slot] + ")";
      }
      var regex = new RegExp(template.join("(.*)"), "");
    
      // Use the regular expression to find a guessed morphemes line
      potentialParse = unparsedWords[word]
          .replace(regex, "$1-$2-$3-$4-$5-$6-$7-$8-$9") // Use backreferences to parse into morphemes
          .replace(/\$[0-9]/g, "")// Remove any backreferences that weren't used
          .replace(/@/g, "")      // Remove the start/end-of-line symbol
          .replace(/--+/g, "-")   // Ensure that there is only ever one "-" in a row
          .replace(/^-/, "")      // Remove "-" at the start of the word
          .replace(/-$/, "");     // Remove "-" at the end of the word
      Utils.debug("Potential parse of " + unparsedWords[word].replace(/@/g, "")
          + " is " + potentialParse);
          
      parsedWords.push(potentialParse);
    }
  }
  
  return parsedWords.join(" ");
}
Glosser.toastedUserToSync = false;
Glosser.toastedUserToImport = 0;
Glosser.glossFinder = function(morphemesLine){
  //Guess a gloss
  var morphemeGroup = morphemesLine.split(/ +/);
  var glossGroups = [];
  if(! window.app.get("corpus")){
    return "";
  }
  if(! window.app.get("corpus").lexicon.get("lexiconNodes")){
    var corpusSize = app.get("corpus").get("dataLists").models[app.get("corpus").get("dataLists").models.length-1].get("datumIds").length;
    if(corpusSize > 30 && !Glosser.toastedUserToSync){
      Glosser.toastedUserToSync = true;
      window.appView.toastUser("You probably have enough data to train an autoglosser for your corpus.\n\nIf you sync your data with the team server then editing the morphemes will automatically run the auto glosser.","alert-success","Sync to train your auto-glosser:");
    }else{
      Glosser.toastedUserToImport ++;
      if(Glosser.toastedUserToImport % 10 == 1 && corpusSize < 30){
        window.appView.toastUser("You have roughly "+corpusSize+" datum saved in your pouch, if you have around 30 datum, then you have enough data to train an autoglosser for your corpus.","alert-info","");
      }
    }
    return "";
  }
  var lexiconNodes = window.app.get("corpus").lexicon.get("lexiconNodes");
  for (var group in morphemeGroup) {
    var morphemes = morphemeGroup[group].split("-");
    var glosses = [];
    for (var m in morphemes) {
      // Take the first gloss for this morpheme
      var matchingNode = _.max(lexiconNodes.where({morpheme: morphemes[m]}), function(node) { return node.get("value"); });
//      console.log(matchingNode);
      var gloss = "?";   // If there's no matching gloss, use question marks
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
/**
 * Takes as a parameters an array of rules which came from CouchDB precedence rule query.
 * Example Rule: {"key":{"x":"@","relation":"preceeds","y":"aqtu","context":"aqtu-nay-wa-n"},"value":2}
 */
Glosser.generateForceDirectedRulesJsonForD3 = function(rules) {

  /*
   * Cycle through the precedence rules, convert them into graph edges with the morpheme index in the morpheme array as the source/target values
   */
  morphemeLinks = [];
  morphemes = [];
  for ( var i in rules) {
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
    if (rules[i].key.y != "@") {
      morphemeLinks.push({
        source : xpos,
        target : ypos,
        value : 1 //TODO use the context counting to get a weight measure
      });
    }
  }
  
  /*
   * Build the morphemes into nodes and color them by their morpheme length, could be a good measure of outliers
   */
  var morphemenodes = [];
  for (m in morphemes) {
    morphemenodes.push({
      name : morphemes[m],
      group : morphemes[m].length
    });
  }
  
  /*
   * Create the JSON required by D3
   */
  var rulesGraph = {};
  rulesGraph.links = morphemeLinks;
  rulesGraph.nodes = morphemenodes;
  
  return rulesGraph;
}

/*
 * Some sample D3 from the force-html.html example
 * 
 */
Glosser.visualizeMorphemesAsForceDirectedGraph = function(){
  
  var width = 960,
      height = 500,
      radius = 6,
      fill = d3.scale.category20();

  var force = d3.layout.force()
      .charge(-120)
      .linkDistance(30)
      .size([width, height]);

  var vis = d3.select("body").append("div")
      .style("width", width + "px")
      .style("height", height + "px");
      
  var tooltip = null;

  d3.json("rules.json", function(json) {
    var link = vis.selectAll("div.link")
        .data(json.links)
      .enter().append("div")
        .attr("class", "link");

    var node = vis.selectAll("div.node")
        .data(json.nodes)
      .enter().append("div")
        .attr("class", "node")
        .style("background", function(d) { return fill(d.group); })
        .style("border-color", function(d) { return d3.rgb(fill(d.group)).darker(); })
      .on("mouseover", function(d) {
        tooltip = d3.select("body")
          .append("div")
          .style("position", "absolute")
          .style("z-index", "10")
          .style("visibility", "visible")
          .text(d.name)
        })
      .on("mouseout", function() {
          tooltip.style("visibility", "hidden");
        })
      .call(force.drag);

    force
        .nodes(json.nodes)
        .links(json.links)
        .on("tick", tick)
        .start();

    function tick() {
      node.style("left", function(d) { return (d.x = Math.max(radius, Math.min(width - radius, d.x))) + "px"; })
          .style("top", function(d) { return (d.y = Math.max(radius, Math.min(height - radius, d.y))) + "px"; });

      link.style("left", function(d) { return d.source.x + "px"; })
          .style("top", function(d) { return d.source.y + "px"; })
          .style("width", length)
          .style("-webkit-transform", transform)
          .style("-moz-transform", transform)
          .style("-ms-transform", transform)
          .style("-o-transform", transform)
          .style("transform", transform);
    }

    function transform(d) {
      return "rotate(" + Math.atan2(d.target.y - d.source.y, d.target.x - d.source.x) * 180 / Math.PI + "deg)";
    }

    function length(d) {
      var dx = d.target.x - d.source.x,
          dy = d.target.y - d.source.y;
      return Math.sqrt(dx * dx + dy * dy) + "px";
    }
  });
  
  
}