define([ "use!backbone", 
         "use!handlebars",
    "text!user/user.handlebars",
    "user/Users",
    "user/UserView" 
    ], function( Backbone, 
        Handlebars, 
        userTemplate, 
        Users, 
        UserView) {
  var UsersView = Backbone.View.extend(
  /** @lends UsersView.prototype */
  {
    /**
     * @class This is the view for users
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      
      this.on('all', function(e) {
        this.render();
      });
      this.model.bind('change', this.render);

    },
    events : {
     
    },
    model : Users,
    userView : UserView,
    userTemplate : Handlebars.compile(userTemplate),
    el : '#users',
    render : function() {
      
      return this;
    }
    
  });

  return UsersView;
});