define(
    ["use!backbone",
     "user/Consultant"],
    function(Backbone, Consultant) {
  
  var Consultants = Backbone.Collection.extend(
      
    /** @lends Consultants.prototype */ 
        
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
    model: Consultant,
    add : function(model, options) {
     
      }

   

  
  }); 
  
  return Consultants; 
  
}); 
