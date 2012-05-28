define("lexicon/LexiconNode", 
    ["use!backbone"],
    function(Backbone) {
  
  var LexiconNode = Backbone.Model.extend(
      
    /** @lends LexiconNode.prototype */ 
        
    {
      /**
       * @class Lexicon Node is key value pair with an index of related datum. It allows the search to index
       *        the corpus to find datum, it is also used by the default glosser to guess glosses based on what the user inputs on line 1 (utterance/orthography).
       * 
       * @description
       * 
       * @extends Backbone.Model
       * 
       * @constructs
       * 
       */
    defaults: {
      key: "",
      value: "",
      data: []
      
    },
    

  
  }); 
  
  return LexiconNode; 
  
}); 
