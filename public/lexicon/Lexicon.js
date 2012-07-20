define([
    "backbone",
		"lexicon/LexiconNode",
		"lexicon/LexiconNodes"
], function(
    Backbone, 
    LexiconNode, 
    LexiconNodes
) {	
	var Lexicon = Backbone.Model.extend(	
	/** @lends Lexicon.prototype */
	{
		/**
		 * @class Lexicon is directed graph (triple store) between morphemes and
		 *        their allomorphs and glosses. It allows the search to index
		 *        the corpus to find datum, it is also used by the default glosser to guess glosses based on what the user inputs on line 1 (utterance/orthography).
		 * 
		 * @description
		 * 
		 * @extends Backbone.Model
		 * 
		 * @constructs
		 * 
		 */
		initialize : function(){
		},
		
		// Internal models: used by the parse function
    model : {
      lexiconNodes : LexiconNodes
    },
    buildLexiconFromCouch : function(corpusname, callback){
      var self = this;
      $.ajax({
        type : 'GET',
        url : "https://ilanguage.iriscouch.com/"+corpusname+"/_design/lexicon/_view/create_triples?group=true",
        success : function(results) {
          var lexiconTriples = JSON.parse(results).rows;
          for(triple in lexiconTriples){
            if (! self.get("lexiconNodes")){
              self.set("lexiconNodes", new LexiconNodes());
            }
            self.get("lexiconNodes").add(new LexiconNode({morpheme: lexiconTriples[triple].key.morpheme , allomorphs: [lexiconTriples[triple].key.morpheme], gloss: lexiconTriples[triple].key.gloss, value: lexiconTriples[triple].value}));
          }
          if (typeof callback == "function"){
            callback();
          }
        },// end successful response
        dataType : ""
      });
    }
    
	}); 
	
	return Lexicon;
}); 
