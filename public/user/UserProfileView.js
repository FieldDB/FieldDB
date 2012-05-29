define("user/UserProfileView", [
    "use!backbone", 
    "use!handlebars", 
    "text!user/user.handlebars",
    "text!user/user_profile.handlebars",
    "user/User",
    "user/UserView"
], function(Backbone, Handlebars, userTemplate, user_profileTemplate, User, UserView) {
    var UserProfileView = Backbone.View.extend(
    /** @lends UserProfileView.prototype */
    {
        /**
         * @class Host of a UserView. This view is used in the activity feeds, it is also embedable in the UserProfileView.
         *
         * @extends Backbone.View
         * @constructs
         */
        initialize : function() {
        },

        model : UserView,
        classname : "user_profile",
        template: Handlebars.compile(user_profileTemplate),
        render : function() {
        	$(this.el).html(this.template(this.model.toJSON()));
            return this;
        }
    });

    return UserProfileView;
}); 