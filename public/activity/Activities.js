define([ "use!backbone", "activity/Activity" ], function(Backbone, Actvity) {
  var Activities = Backbone.Collection.extend(
  /** @lends Activities.prototype */
  {
    /**
     * @class The Activity Collection is used by the activity feed to keep track
     *        of activities. It is also in every user generic to keep track of
     *        their activities. It is primarily housed on an external server. It
     *        allows users to go back in time and see track their team's
     *        actions.
     * 
     * @extends Backbone.Collection
     * @constructs
     */
    initialize : function() {

    },

    model : Activity


  });

  return Activities;
});
