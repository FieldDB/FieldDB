define(
    ["backbone",
     "user/UserMask"],
    function(Backbone, UserMask) {
  
  var Users = Backbone.Collection.extend(
      
    /** @lends Users.prototype */ 
        
    {
      /**
       * @class A collection of user masks (used mostly for permissions groups)

       * @description
       * 
       * @extends Backbone.Model
       * 
       * @constructs
       * 
       */
      
      /**
       * backbone-couchdb adaptor set up
       */
      db : {
        view : "users",
        changes : false,
        filter : Backbone.couch_connector.config.ddoc_name + "/users"
      },
      // The couchdb-connector is capable of mapping the url scheme
      // proposed by the authors of Backbone to documents in your database,
      // so that you don't have to change existing apps when you switch the sync-strategy
      url : "/users",
      // The messages should be ordered by date
      comparator : function(doc){
        return doc.get("_id");
      },
      
      internalModels: UserMask,
      model: UserMask
  
  }); 
  
  return Users; 
  
}); 
