var Glosser = Glosser || {};

Glosser.morphemefinder = function(unparsedword, corpusname, callback) {
  unparsedword = "@" + unparsedword + "@";
  var potentialParsePromise = '';
  $.ajax({
    type : 'GET',
    url : "https://ilanguage.iriscouch.com/" + corpusname
        + "/_design/get_precedence_rules_from_morphemes/_view/precedence_rules?group=true",
    success : function(rules) {
      // console.log(rules);
      rules = JSON.parse(rules);

      /*
       * Reduce the rules such that rules which are found in multiple source
       * words are only used/included once.
       */
      var reducedRules = _.chain(rules.rows).groupBy(function(rule) {
        return rule.key.x + "-" + rule.key.y;
      }).value();

      /*
       * Find the rules which match in local precedence in the unparsedword
       */
      var matchedRules = [];
      for ( var r in reducedRules) {
        if (unparsedword.indexOf(r.replace(/-/, "")) >= 0) {
          matchedRules.push({
            r : reducedRules[r]
          })
        }
      }

      /*
       * Attempt to find the longest template which the matching rules can
       * generate from start to end
       */
      var prefixtemplate = [];
      prefixtemplate.push("@");
      for ( var i = 0; i < 10; i++) {
        console.log(prefixtemplate[i]);
        if (prefixtemplate[i] == undefined)
          break;
        for ( var j in matchedRules) {
          if (prefixtemplate[i] == matchedRules[j].r[0].key.x) {
            console.log(matchedRules[j].r[0].key.x);
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

      /*
       * If the prefix template hit ambiguity in the middle, try from the suffix
       * in until it hits ambiguity
       */
      var suffixtemplate = [];
      if (prefixtemplate[prefixtemplate.length - 1] != "@"
          || prefixtemplate.length == 1) {
        // Suffix:
        suffixtemplate.push("@")
        for ( var i = 0; i < 10; i++) {
          console.log(suffixtemplate[i]);
          if (suffixtemplate[i] == undefined)
            break;
          for ( var j in matchedRules) {
            if (suffixtemplate[i] == matchedRules[j].r[0].key.y) {
              console.log(matchedRules[j].r[0].key.y);
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
      /*
       * Combine prefix and suffix templates into one regular expression which
       * can be tested against the word to find a potential parse
       */
      var template = [];
      template = prefixtemplate.concat(suffixtemplate.reverse())
      for ( var slot in template) {
        template[slot] = "(" + template[slot] + ")";
      }
      var regex = new RegExp(template.join("(.*)"), "");
      console.log(unparsedword.replace(regex, "$1-$2-$3-$4-$5-$6-$7-$8-$9"));
      potentialParsePromise = unparsedword.replace(regex,
          "$1-$2-$3-$4-$5-$6-$7-$8-$9").replace(/\$[0-9]/g, "").replace(/@/g,
          "").replace(/--+/g, "-").replace(/^-/, "").replace(/-$/, "")
      /* "hall-pa-nay-wan" */
      console.log("Potential parse of " + unparsedword.replace(/@/g, "")
          + " is " + potentialParsePromise);
      if (typeof callback == "function") {
        callback(potentialParsePromise);
      }

    },// end successful login\
    error : function(data) {
      console.log(data);
    },
    dataType : ""
  });

  return potentialParsePromise;
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