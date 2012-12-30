define([
    "backbone",
    "datum/Datum"
], function(
    Backbone, 
    Datum
) {
    var Datums = Backbone.Collection.extend(
    /** @lends Datums.prototype */
    {
       /**
        * @class A collection of Datums.
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
         view : "datums",
         changes : false,
         filter : Backbone.couch_connector.config.ddoc_name + "/datums"
       },
       // The couchdb-connector is capable of mapping the url scheme
       // proposed by the authors of Backbone to documents in your database,
       // so that you don't have to change existing apps when you switch the sync-strategy
       url : "/datums",
       // The messages should be ordered by date
       comparator : function(doc){
         return doc.get("_id");
       },
       
       internalModels : Datum,

       model: Datum
    });
    
    return Datums;
});