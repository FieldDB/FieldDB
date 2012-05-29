define("activity_feed/ActivityFeedItemView", [
    "use!backbone", 
    "use!handlebars", 
    "text!activity_feed/activityFeedItem.handlebars",
    "user/User",
    "user/UserProfileView",
    "text!user/user.handlebars",
    "activity_feed/ActivityFeedItem"
], function(Backbone, Handlebars, activityFeedItemTemplate, User, UserProfileView, userTemplate, ActivityFeedItem) {
    var ActivityFeedItemView = Backbone.View.extend(
    /** @lends ActivityFeedItemView.prototype */
    {
        /**
         * @class The layout of a single ActivityFeedItem. This view is used in the activity feeds.
         *
         * @extends Backbone.View
         * @constructs
         */
        initialize : function() {
        	this.user = window.user;
        },

        model : ActivityFeedItem,
        classname : "activity_feed_item",
        user: window.user,
        usertemplate: Handlebars.compile(userTemplate),
        template: Handlebars.compile(activityFeedItemTemplate),
        render : function() {
        	if (window.user == null){
        		return;
        	}
        	Handlebars.registerPartial("user", this.usertemplate(this.user.toJSON()) );
        	$(this.el).html(this.template(this.model.toJSON()));
            return this;
        },
        
    });

    return ActivityFeedItemView;
}); 