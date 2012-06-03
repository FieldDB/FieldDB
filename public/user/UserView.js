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
          this.on('all', function(e) {
            this.render();
          });
          this.model.bind('change', this.render);
          this.render();
        },

        model : User,
        classname : "user",
        template: Handlebars.compile(userTemplate),
        render : function() {
          if(this.model != undefined){
            $(this.el).html(this.template(this.model.toJSON()));
            console.log("\trendering user: " + this.model.get("username"));
          }else{
            console.log("\tUser model was undefined.");
          }
        	
            return this;
        },
        loadSample: function(){
          this.model.attributes=
          {"username" : "sapir",
          "password" : "wharf",
          "firstname" : "Ed",
          "lastname" : "Sapir"};
        }
        
        
    });

    return UserView;
}); 