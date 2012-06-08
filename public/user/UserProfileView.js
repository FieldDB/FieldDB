define([
    "use!backbone", 
    "use!handlebars", 
    "text!user/user.handlebars",
    "text!user/user_profile.handlebars",
    "user/User",
    "user/UserView",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars, 
    userTemplate, 
    user_profileTemplate, 
    User, 
    UserView
) {
  var UserProfileView = Backbone.View.extend(
  /** @lends UserProfileView.prototype */
  {
    /**
     * @class Host of a UserView. This view is used in the activity feeds, it is also 
     * embedable in the UserProfileView.
     *
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("USER init: " + this.el);
      
      this.model.bind("change", this.render, this);
    },

    /**
     * The underlying model of the UserProfileView is a User.
     */
    model : User,
    
    /**
     * The Handlebars template rendered as the UserProfileView 
     */
    template: Handlebars.compile(user_profileTemplate),
    
    /**
     * The Handlebars template of the user header, which is used as a partial.
     */
    usertemplate: Handlebars.compile(userTemplate),
    
    /**
     * Renders the UserProfileView and its partial.
     */
    render : function() {
      Utils.debug("USER render: " + this.el);
      
      if (this.model != undefined) {
        // Register the partial
      	Handlebars.registerPartial("user", this.usertemplate(this.model.toJSON()));
      	
      	// Display the UserProfileView
      	this.setElement($("#user-profile-view")); 
      	$(this.el).html(this.template(this.model.toJSON()));
    	} else {
    	  Utils.debug("\tUser model was undefined");
    	}

      return this;
    }
  });

  return UserProfileView;
}); 