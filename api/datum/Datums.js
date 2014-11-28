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
         this.model = Datum;
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
       url : "/datums",//&decending=true
       // The messages should be ordered by date
//       comparator : function(doc){
//         return doc.get("timestamp");
//       },

       internalModels : Datum,

       model: Datum,

       fetchDatums : function(suces, fail){
         this.fetch({
           error : function(model, xhr, options) {
             if (OPrime.debugMode) OPrime.debug("There was an error loading your datums.");
             console.log(model,xhr,options);
             OPrime.bug("There was an error loading your datums.");
             if(typeof fail == "function"){
               fail();
             }
           },
           success : function(model, response, options) {
             console.log("Datums fetched ", model,response,options);
             if (response.length == 0) {
               OPrime.bug("You have no datums");
             }
             if(typeof suces == "function"){
               suces();
             }
           }
         });
       }
    });

    return Datums;
});
