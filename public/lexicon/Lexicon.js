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
    /**
     * Overwrite/build the lexicon from the corpus server if it is there, saves
     * the results to local storage so they can be reused offline.
     * 
     * @param corpusname
     * @param callback
     */
    buildLexiconFromCouch : function(corpusname, callback){
      var self = this;
      $.ajax({
        type : 'GET',
        url : "https://ilanguage.iriscouch.com/"+corpusname+"/_design/lexicon/_view/create_triples?group=true",
        success : function(results) {
          if (! self.get("lexiconNodes")){
            self.set("lexiconNodes", new LexiconNodes());
          }
          localStorage.setItem(corpusname+"lexiconResults", results);
          var lexiconTriples = JSON.parse(results).rows;
          for (triple in lexiconTriples) {
            self.get("lexiconNodes").add(new LexiconNode({
              morpheme : lexiconTriples[triple].key.morpheme,
              allomorphs : [ lexiconTriples[triple].key.morpheme ],
              gloss : lexiconTriples[triple].key.gloss,
              value : lexiconTriples[triple].value
            }));
          }
          if (typeof callback == "function"){
            callback();
          }
        },// end successful response
        dataType : ""
      });
    },
    /**
     * Overwrite/build the lexicon from local storage if it is there.
     * 
     * @param corpusname
     * @param callback
     */
    buildLexiconFromLocalStorage  : function(corpusname, callback){
      var results = localStorage.getItem(corpusname+"lexiconResults");
      if(!results){
        return;
      }
      if (! this.get("lexiconNodes")){
        this.set("lexiconNodes", new LexiconNodes());
      }
      var lexiconTriples = JSON.parse(results).rows;
      for(triple in lexiconTriples){
        this.get("lexiconNodes").add(new LexiconNode({morpheme: lexiconTriples[triple].key.morpheme , allomorphs: [lexiconTriples[triple].key.morpheme], gloss: lexiconTriples[triple].key.gloss, value: lexiconTriples[triple].value}));
      }
      if (typeof callback == "function"){
        callback();
      }
    }
    
	}); 
	
	return Lexicon;
}); 
