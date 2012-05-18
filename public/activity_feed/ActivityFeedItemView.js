define("activity_feed/ActivityFeedItemView", [
    "use!backbone", 
    "use!handlebars", 
    "text!activity_feed/activityFeedItem.handlebars",
    "user/User",
    "activity_feed/ActivityFeedItem"
], function(Backbone, Handlebars, activityFeedItemTemplate, User, ActivityFeedItem) {
    var ActivityFeedItemView = Backbone.View.extend(
    /** @lends UserView.prototype */
    {
        /**
         * @class The layout of a single ActivityFeedItem. This view is used in the activity feeds.
         *
         * @extends Backbone.View
         * @constructs
         */
        initialize : function() {
        },

        model : ActivityFeedItem,
        classname : "activity_feed_item",
        template: Handlebars.compile(activityFeedItemTemplate),
        render : function() {
        	$(this.el).html(this.template(this.model.toJSON()));
            return this;
        }
    });

    return ActivityFeedItemView;
}); 