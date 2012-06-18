define(
		["use!backbone"],
		function(Backbone){
	var Team = Backbone.Collection.extend(
			
			/** @lends Team.prototype */ 
			{
				/**
				 * @class A Team is a collection of users. A team can have many users, and many corpora. 
				 * It has a name but can not login.  
				 * 
				 * 
				 * @property {String} teamname This is team's name    
				 *  
				 *  
				 * @description The initialize function probably checks to see if a team exists and 
				 * creates a new one if there is one. 
				 * 
				 * @extends User.Collection
				 * @constructs
				 */
				
				
				initialize : function() {
					// this.bind('error', function(model, error) {
		              // // TODO Handle validation errors
		              // });
					
				}, 
				
				// This is a list of attributes and their default values. 
				defaults : {
				
					teamname: "", 
					
					
				},
				
				/** Describe the validation here. 
				 * 
				 * @param {Object} 
				 * 			attributes the set of attributes to validate 
				 * 
				 * @returns {String} The validation error if there is one. Otherwise 
				 * 			doesn't return anything. 
				 */
				
				validate : function(attributes) {
					
				} 
			});
	
	return Team; 
	
});
