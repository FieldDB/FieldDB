define("team/Team",
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
  
    