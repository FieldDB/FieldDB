define(
    ["backbone",
     "user/User"],
    function(Backbone, User) {
  
  var Users = Backbone.Collection.extend(
      
    /** @lends Users.prototype */ 
        
    {
      /**
       * @class 

       * @description
       * 
       * @extends Backbone.Model
       * 
       * @constructs
       * 
       */
    model: User,
    add : function(model, options) {
     
      }

   

  
  }); 
  
  return Users; 
  
}); 
