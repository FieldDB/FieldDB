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
         return doc.get("_id");
       },
       
       internalModels : DataList,
       model : DataList
    });
    
    return DataLists;
});
