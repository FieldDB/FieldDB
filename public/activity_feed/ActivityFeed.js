define( [ "use!backbone"
                        , "activity_feed/ActivityFeedItem"

], function(Backbone, ActivityFeedItem) {
	var ActivityFeed = Backbone.Collection.extend(
	/** @lends ActivityFeed.prototype */
	{
		/**
		 * @class A collection of Activities.
		 *
		 * @extends Backbone.Collection
		 * @constructs
		 */
		initialize : function() {
		},

		model : ActivityFeedItem
	});

	return ActivityFeed;
});