define([ 
         "backbone", 
         "corpus/CorpusMask"
], function(
         Backbone,
         CorpusMask) {
  var Corpuses = Backbone.Collection.extend(
  /** @lends Corpuses.prototype */
  {
    /**
     * @class Collection of Corpuses in the form of CorpusMasks (normally
     *        referred to as Corpora, but using Backbone conventions a regular
     *        plural means a collection.)
     * 
     * @description Nothing happens in the initialization.
     * 
     * @extends Backbone.Collection
     * @constructs
     */
    initialize : function() {
    },
    model : CorpusMask,
    constructCollectionFromArray : function(arrayOfCorpora){
      this.constructCollectionFromArrayOnServer(arrayOfCorpora);
    },
    constructCollectionFromArrayOnServer : function(arrayOfCorpora){
      Utils.debug(arrayOfCorpora);
      this.reset();
      var self = this;
      for(c in arrayOfCorpora){
        var couchConnection = arrayOfCorpora[c];
        var couchurl = couchConnection.protocol + couchConnection.domain;
        if (couchConnection.port != null) {
          couchurl = couchurl + ":" + couchConnection.port;
        }
        couchurl = couchurl +couchConnection.path +"/"+ couchConnection.pouchname+"/corpus";
        
        var corpuse = new CorpusMask({
          title : "",
          pouchname : couchConnection.pouchname
        });
        corpuse.corpusid = couchConnection.corpusid;
        self.unshift(corpuse);
        

        /*
         * if we want to fetch the corpus's title from the server: (if
         * the corpus is private, it will just say private corpus which
         * we expect to be the normal case, therefore not usefull to
         * show it.
         */
//        $.ajax({
//          type : 'GET',
//          url : couchurl ,
//          success : function(data) {
//            Utils.debug("Got data back from the server about this corpus: ", data);
//            var corpus = new CorpusMask(JSON.parse(data));
//            corpus.corpusid = arrayOfCorpora[thisc].corpusid;
//            self.unshift(corpus);
//          },
//          error : function(data){
//            Utils.debug("Got error back from the server about this corpus: ", data);
//            var corpuse = new CorpusMask({
//                  title : "We need to make sure you're you before showing you the latest details (click the sync button).",
//                  pouchname : arrayOfCorpora[thisc].pouchname
//                });
//            corpuse.corpusid = arrayOfCorpora[thisc].corpusid;
//            self.unshift(corpuse);
//          }
//        });
      }
    },
    constructCollectionFromArrayLocally : function(arrayOfCorpora){
      //TODO look in the pouchdb's instead
    }
  });

  return Corpuses;
});