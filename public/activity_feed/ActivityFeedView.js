define( [
    "use!backbone", 
    "use!handlebars",
    "activity_feed/ActivityFeed"
], function(Backbone, Handlebars, ActivityFeed) {
    var ActivityFeedView = Backbone.View.extend(
    /** @lends ActivityFeedView.prototype */
    {
        /**
         * @class The layout of the activity feed. This view is used in web widgets, it is also embeddable in the dashboard.
         *
         * @extends Backbone.View
         * @constructs
         */
        initialize : function() {
        },

        model : ActivityFeed,
        classname : "activity_feed",
        
    });

    return ActivityFeedView;
}); 