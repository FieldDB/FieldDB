define(
    ["backbone",
     "user/UserMask"],
    function(Backbone, UserMask) {
  
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
    model: UserMask,
    add : function(model, options) {
     
      }

   

  
  }); 
  
  return Users; 
  
}); 
