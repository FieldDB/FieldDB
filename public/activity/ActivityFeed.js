define([ "use!backbone", "activity/Activity"

], function(Backbone, Activity) {
  var ActivityFeed = Backbone.Model.extend(
  /** @lends ActivityFeed.prototype */
  {
    /**
     * @class A model of the Activity Feed. The activity feed is a container for
     *        the Activities collection. It is the primary way to view an
     *        Activities Collection. see <a href =
     *        "http://ui-patterns.com/patterns/ActivityStream">"http://ui-patterns.com/patterns/ActivityStream"</a>
     * 
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
    }

  });

  return ActivityFeed;
});