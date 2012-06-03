define([ "use!backbone", "user/User" ], function(Backbone, User) {
  var Authentication = Backbone.Model.extend(
  /** @lends Authentication.prototype */
  {
    /**
     * @class The Authentication Model handles login and logout and authentication locally or remotely. 
     *  * @property {User} user The user is a User object (User, Bot or
     *           Informant) which is logged in and viewing the app with that
     *           user's perspective. To check whether some data is
     *           public/viewable/editable the app.user should be used to
     *           verify the permissions. If no user is logged in a special
     *           user "public" is logged in and used to calculate
     *           permissions.
     * 
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
      this.bind('error', function(model, error) {
        console.log("Error in Authentication  : " + error);
      });
      this.on('all', function(e) {
        Utils.debug("Authentication, "+ this.get('username') + " event: " + JSON.stringify(e));
      });
      
    },

    defaults : {
      user : User,
      username: localStorage.getItem("username")
    },
    authenticate: function(username){
      this.set("user",new User());
      this.set("username",username);
    },
    logout : function() {
      this.set("username","");
      this.set("user", new User());
      localStorage.removeItem("user");
    },
    login : function(usrname, pass) {
      console.log("Trying to login as: "+usrname);
      this.get("user").set("username",usrname);
      this.get("user").set("password",pass);
      
      this.set("username",usrname);
      localStorage.setItem("username",usrname);
//      localStorage.setItem("user", JSON.stringify(this.get("user").toJSON()));
      
    }
    
    
  });

  return Authentication;
});
