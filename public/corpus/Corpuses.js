define([ 
         "backbone", 
         "corpus/Corpus"
], function(
         Backbone,
         Corpus) {
  var Corpuses = Backbone.Collection.extend(
  /** @lends Corpuses.prototype */
  {
    /**
     * @class Collection of Corpuses (normally refered to as Corpora)
     * 
     * @description The initialize function 
     * 
     * @extends Backbone.Collection
     * @constructs
     */
    initialize : function() {
    },
    model : Corpus

  });

  return Corpuses;
});