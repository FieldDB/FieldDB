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
        Utils.debug(this.get('username') + " event: " + JSON.stringify(e));
      });
      this.authenticatePreviousUser();
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
      $("#logout").hide();
      $("#login").show();
      this.set("username","");
      this.set("user", new User());
      localStorage.removeItem("user");
    },
    login : function() {
      this.set("user", new User({
        "username" : document.getElementById("username").value,
        "password" : document.getElementById("password").value
      }));
      this.set("username",document.getElementById("username").value);
      localStorage.setItem("user", JSON.stringify(this.get("user").toJSON()));
      $("#logout").show();
      $("#login").hide();
    },
    
    authenticatePreviousUser : function() {
      if (localStorage.getItem("user")) {
        var u = JSON.parse(localStorage.getItem("user"));
        this.set("user", new User(u));
        this.set("username",u.username);
        $("#logout").show();
        $("#login").hide();
      }

    }

  });

  return Authentication;
});
