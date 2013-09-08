define([
    "backbone",
    "user/UserMask"],
function(
    Backbone, 
    UserMask
) {  
  var Consultants = Backbone.Collection.extend(   
  /** @lends Consultants.prototype */ 
  {
    /**
     * @class  Consultants is a collection of user masks so that only public details get saved into items. 

     * @description
     * 
     * @extends Backbone.Model
     * 
     * @constructs
     * 
     */
    initialize : function() {
    },
    
    model: UserMask,
  }); 
  
  return Consultants;
}); 
