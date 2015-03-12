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

    /**
     * backbone-couchdb adaptor set up
     */
    db : {
      view : "corpora",
      changes : false,
      // If you don't know what filters are in CouchDB, then read it up here:
      // <a href="http://guide.couchdb.org/draft/notifications.html#filters">http://guide.couchdb.org/draft/notifications.html#filters</a>
      // Look up how the filter works in `chat_example/filters/private_messages.js`.
      // IMPORTANT: see `filters/messages.js` to see how to retrieve remove events
      filter : Backbone.couch_connector.config.ddoc_name + "/corpora"
    },
    // The couchdb-connector is capable of mapping the url scheme
    // proposed by the authors of Backbone to documents in your database,
    // so that you don't have to change existing apps when you switch the sync-strategy
    url : "/corpora",
    // The messages should be ordered by date
    comparator : function(doc){
      return doc.get("timestamp");
    },


    internalModels : CorpusMask,
    model : CorpusMask,
    constructCollectionFromArray : function(arrayOfCorpora){
      this.constructCollectionFromArrayOnServer(arrayOfCorpora);
    },
    constructCollectionFromArrayOnServer : function(arrayOfCorpora){
      if (OPrime.debugMode) OPrime.debug(arrayOfCorpora);
      this.reset();
      var self = this;
      for(c in arrayOfCorpora){
        var couchConnection = arrayOfCorpora[c];

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
//        var couchurl = OPrime.getCouchUrl(couchConnection) +"/corpus";
//        $.ajax({
//          type : 'GET',
//          url : couchurl ,
//          success : function(data) {
//            if (OPrime.debugMode) OPrime.debug("Got data back from the server about this corpus: ", data);
//            var corpus = new CorpusMask(JSON.parse(data));
//            corpus.corpusid = arrayOfCorpora[thisc].corpusid;
//            self.unshift(corpus);
//          },
//          error : function(data){
//            if (OPrime.debugMode) OPrime.debug("Got error back from the server about this corpus: ", data);
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
