var morphemefinder = function(unparsedword, corpusname, callback){
  unparsedword = "@"+unparsedword+"@";
  var potentialParsePromise = '';
  $.ajax({
    type : 'GET',
    url : "http://ilanguage.iriscouch.com/"+corpusname+"/_design/play/_view/precedence?group=true",
    success : function(rules) {
      //console.log(rules);
      rules = JSON.parse(rules);
      
      /*
       * Reduce the rules such that rules which are found in multiple source words are only used/included once.
       */
      var reducedRules =
        _.chain(rules.rows)
       .groupBy( function(rule){
                return rule.key.x +"-" + rule.key.y;
                } )
       .value();
      
      
      /*
       * Find the rules which match in local precedence in the unparsedword
       */
      var matchedRules = [];
      for(var r in reducedRules){
        if(unparsedword.indexOf(r.replace(/-/,"")) >= 0){
          matchedRules.push({r: reducedRules[r]})
        }
      }
      
      /*
       * Attempt to find the longest template which the matching rules can generate from start to end
       */
      var prefixtemplate = [];
      prefixtemplate.push("@");
      for (var i = 0; i< 10; i++){
        console.log(prefixtemplate[i]);
        if(prefixtemplate[i] == undefined) break;
        for(var j in matchedRules){
          if(prefixtemplate[i] == matchedRules[j].r[0].key.x ){
            console.log(matchedRules[j].r[0].key.x);
            if( prefixtemplate[i+1]) { //ambiguity (two potential following morphemes)
              prefixtemplate.pop();
              break; 
            }else{
              prefixtemplate[i+1] = matchedRules[j].r[0].key.y;
            }
          }
        }
      }

      /*
       * If the prefix template hit ambiguity in the middle, try from the suffix in until it hits ambiguity
       */
      var suffixtemplate = [];
      if(prefixtemplate[prefixtemplate.length - 1] != "@" || prefixtemplate.length == 1){
        //Suffix:
        suffixtemplate.push("@")
        for (var i = 0; i< 10; i++){
          console.log(suffixtemplate[i]);
          if(suffixtemplate[i] == undefined) break;
          for(var j in matchedRules){
            if(suffixtemplate[i] == matchedRules[j].r[0].key.y ){
              console.log(matchedRules[j].r[0].key.y);
              if( suffixtemplate[i+1]) { //ambiguity (two potential following morphemes)
                suffixtemplate.pop();
                break; 
              }else{
                suffixtemplate[i+1] = matchedRules[j].r[0].key.x;
              }
            }
          }
        }
      }
      /*
       * Combine prefix and suffix templates into one regular expression which can be tested against the word to find a potential parse
       */
      var template = [];
      template = prefixtemplate.concat(suffixtemplate.reverse())
      for(var slot in template){
        template[slot]= "("+template[slot]+")";
      }
      var regex = new RegExp(template.join("(.*)"),"");
      console.log(unparsedword.replace(regex, "$1-$2-$3-$4-$5-$6-$7-$8-$9"));
      potentialParsePromise = unparsedword.replace(regex, "$1-$2-$3-$4-$5-$6-$7-$8-$9").replace(/\$[0-9]/g,"").replace(/@/g,"").replace(/--+/g,"-").replace(/^-/,"").replace(/-$/,"")
      /*"hall-pa-nay-wan"*/
      console.log("Potential parse of "+ unparsedword.replace(/@/g,"") + " is "+potentialParsePromise);
      if(typeof callback == "function"){
        callback(potentialParsePromise);
      }
      
    },//end successful login
    dataType : ""
  });
  
  return potentialParsePromise;
}