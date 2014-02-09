define([
    "backbone"
], function(
    Backbone
) {  
  var LexiconNode = Backbone.Model.extend(   
  /** @lends LexiconNode.prototype */ 
  {
    /**
     * @class Lexicon Node is key value pair with an index of related datum. It allows the search to index
     *        the corpus to find datum, it is also used by the default glosser to guess glosses based on what the user inputs on line 1 (utterance/orthography).
     * 
     * @description Lexicon Node is key value pair with an index of related datum. It allows the search to index
     *        the corpus to find datum, it is also used by the default glosser to guess glosses based on what the user inputs on line 1 (utterance/orthography).
     * 
     * 
     * @extends Backbone.Model
     * 
     * @constructs
     * 
     */
    initialize : function() {
    },
    
    defaults: {
      morpheme: "",
      allomorphs: [],
      gloss: "",
      value: 0,
      data: []  
    },
    
    // Internal models: used by the parse function
    internalModels : {
      // There are no nested models
    }
  }); 
  
  return LexiconNode; 
  
}); 
