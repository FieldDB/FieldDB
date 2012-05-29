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

        model : User,
        classname : "user_profile",
        user: window.user,
        template: Handlebars.compile(user_profileTemplate),
        usertemplate: Handlebars.compile(userTemplate),
        render : function() {
        	if (window.user == null){
        		return;
        	}
        	var u = new User();
        	console.log(u);
        	Handlebars.registerPartial("user", this.usertemplate(u.toJSON()) );
        	$(this.el).html(this.template(u.toJSON()));
            return this;
        }
    });

    return UserProfileView;
}); 