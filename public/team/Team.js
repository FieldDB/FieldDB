define("team/Team",
<<<<<<< HEAD
    [ "use!backbone"

      ], 
      function(Backbone) {
  var Comments = Backbone.Collection.extend(

      /** @lends Team.prototype  */

      {
        /**
         * @class Team is a set of users working on a certain project/sharing a corpus. It has a team name, but can not login as a team.
         * 		  Team member's activities show up in activity feed widget.  
         * 
         * @extends Comment.Collection
         * @constructs
         * 
         */  
        initialize: function() {
          this.bind('error', function(model, error) {
            // TODO Handle validation errors
          });

          model: User; 
        }
      });


  return Team;
});
  
=======
		["use!backbone"],
		function(Backbone){
	var Team = Backbone.Collection.extend(
			
			/** @lends Team.prototype */ 
			{
				/**
				 * @class A Team is a collection of users associated with a project/corpus. 
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

>>>>>>> e92371bbeb027b0a8bc2f9282edaf5a0b623db3f
    