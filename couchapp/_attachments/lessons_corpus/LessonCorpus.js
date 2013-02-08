define( [ 
    "backbone", 
    "corpus/Corpus" 
], function(
    Backbone,
    Corpus
) {
  var LessonCorpus = Corpus.extend(
  /** @lends LessonCorpus.prototype */
  {
    /**
     * @class A lesson corpus is a type of corpus. 
     * 
     * @extends Backbone.Model
     * 
     * @constructs
     * 
     */
    initialize : function(attributes) {
      Corpus.__super__.initialize.call(this, attributes);

    },
    
    internalModels : {
      // There are all the models of a corpus, plus some more
    },
    saveAndInterConnectInApp : function(callback){
      
      if(typeof callback == "function"){
        callback();
      }
    }
  });

  return LessonCorpus;
}); 



