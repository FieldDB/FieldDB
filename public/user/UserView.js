define("user/UserView", [
    "use!backbone", 
    "use!handlebars", 
    "text!user/user.handlebars",
    "user/User",
    "user/UserProfileView"
], function(Backbone, Handlebars, userTemplate, User, UserProfileView) {
    var UserView = Backbone.View.extend(
    /** @lends UserView.prototype */
    {
        /**
         * @class The layout of a single User. This view is used in the activity feeds, it is also embedable in the UserProfileView.
         *
         * @extends Backbone.View
         * @constructs
         */
        initialize : function() {
        },

        model : User,
        classname : "user",
        template: Handlebars.compile(userTemplate),
        render : function() {
        	$(this.el).html(this.template(this.model.toJSON()));
            return this;
        } 
        
        
    });

    return UserView;
}); 