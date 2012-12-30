define([
    "backbone",
    "datum/Session"
], function(
    Backbone, 
    Session
) {
    var Sessions = Backbone.Collection.extend(
    /** @lends Sessions.prototype */
    {
       /**
        * @class A collection of Sessions Probably will be used in the fullscreen corpus view.
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
         view : "sessions",
         changes : false,
         filter : Backbone.couch_connector.config.ddoc_name + "/sessions"
       },
       // The couchdb-connector is capable of mapping the url scheme
       // proposed by the authors of Backbone to documents in your database,
       // so that you don't have to change existing apps when you switch the sync-strategy
       url : "/sessions",
       // The messages should be ordered by date
       comparator : function(doc){
         return doc.get("_id");
       },
       
       internalModels : Session,

       model: Session
    });
    
    return Sessions;
});