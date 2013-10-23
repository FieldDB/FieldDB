define([
    "backbone",
    "data_list/DataList"
], function(
    Backbone, 
    DataList
) {
    var DataLists = Backbone.Collection.extend(
    /** @lends DataLists.prototype */
    {
       /**
        * @class A collection of DataLists
        *
        * @extends Backbone.Collection
        * @constructs
        */
       initialize: function() {
       },
       /**
        * backbone-couchdb adaptor set up
        */
       db : {
         view : "datalists",
         changes : false,
         filter : Backbone.couch_connector.config.ddoc_name + "/datalists"
       },
       // The couchdb-connector is capable of mapping the url scheme
       // proposed by the authors of Backbone to documents in your database,
       // so that you don't have to change existing apps when you switch the sync-strategy
       url : "/datalists",
       // The messages should be ordered by date
       comparator : function(doc){
         return doc.get("timestamp");
       },
       
       internalModels : DataList,
       model : DataList,
       
       fetchDatalists : function(suces, fail){
         this.fetch({
           error : function(model, xhr, options) {
             if (OPrime.debugMode) OPrime.debug("There was an error loading your sessions.");
             OPrime.debug(model,xhr,options);
             OPrime.bug("There was an error loading your sessions.");
             if(typeof fail == "function"){
               fail();
             }
           },
           success : function(model, response, options) {
             OPrime.debug("Datalists fetched ",model,response,options);
             if (response.length == 0) {
               OPrime.debug("You have no datalists, TODO creating a new one...");
               if(window.location.href.indexOf("corpus.html") > -1){
                 window.location.replace("user.html");
               }
             }
             if(typeof suces == "function"){
               suces();
             }
           }
         });
         
       }
       
    });
    
    return DataLists;
});
