define([
    "use!backbone"
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
     * @description
     * 
     * @extends Backbone.Model
     * 
     * @constructs
     * 
     */
    initialize : function() {
    },
    
    defaults: {
      key: "",
      value: "",
      data: []  
    },
    
    model : {
      // There are no nested models
    },
    
    parse : function(response) {
      if (response.ok === undefined) {
        for (var key in this.model) {
          var embeddedClass = this.model[key];
          var embeddedData = response[key];
          response[key] = new embeddedClass(embeddedData, {parse:true});
        }
      }
      
      return response;
    }
  }); 
  
  return LexiconNode; 
  
}); 
