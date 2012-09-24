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
      console.log(arrayOfCorpora);
      this.reset();
      var self = this;
      for(c in arrayOfCorpora){
        var couchConnection = arrayOfCorpora[c];
        var couchurl = couchConnection.protocol + couchConnection.domain;
        if (couchConnection.port != null) {
          couchurl = couchurl + ":" + couchConnection.port;
        }
        couchurl = couchurl +"/"+ couchConnection.pouchname+"/corpus";
        
        $.ajax({
          type : 'GET',
          url : couchurl ,
          success : function(data) {
            console.log("Got data back from the server about this corpus: ", data);
            var corpus = new CorpusMask(JSON.parse(data));
            self.unshift(corpus);
          },
          error : function(data){
            console.log("Got error back from the server about this corpus: ", data);
            var corpus = new CorpusMask({title: "Unable to fetch title from server, please click the sync button to get the latest details."});
            self.unshift(corpus);
          }
        });
      }
    },
    constructCollectionFromArrayLocally : function(arrayOfCorpora){
      //TODO look in the pouchdb's instead
    }
  });

  return Corpuses;
});