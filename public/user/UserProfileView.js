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
        usertemplate: Handlebars.compile(userTemplate),
        user: window.user,
        template: Handlebars.compile(user_profileTemplate),
        render : function() {

        	Handlebars.registerPartial("user", this.usertemplate(this.model.toJSON()) );
        	$(this.el).html(this.template(this.model.toJSON()));

        	if (window.user == null){
        		return;
        	}
        	var u = new User();
        	console.log(u);

            return this;
        }
    });

    return UserProfileView;
}); 