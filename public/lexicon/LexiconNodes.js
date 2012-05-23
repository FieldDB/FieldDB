define("lexicon/LexiconNodes", 
    ["use!backbone",
     "lexicon/LexiconNode"],
    function(Backbone, LexiconNode) {
  
  var LexiconNodes = Backbone.Collection.extend(
      
    /** @lends LexiconNodes.prototype */ 
        
    {
      /**
       * @class Lexicon Nodes is a collection of lexicon nodes is key value pair with an index of related datum. 
       * 
       * @description
       * 
       * @extends Backbone.Model
       * 
       * @constructs
       * 
       */
    model: LexiconNode,
    comparator: function(node) {
        return node.get("key");
     }

   

  
  }); 
  
  return LexiconNodes; 
  
}); 
