define([
    "use!backbone",
    "user/Consultant"],
function(
    Backbone, 
    Consultant
) {  
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
    initialize : function() {
    },
    
    model: Consultant,
  }); 
  
  return Consultants;
}); 
