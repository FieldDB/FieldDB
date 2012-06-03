define([ "use!backbone", "use!handlebars",
    "text!authentication/authentication.handlebars",
    "authentication/Authentication", "user/User", "user/UserView" ], function(
    Backbone, Handlebars, authTemplate, Authentication, User, UserView) {
  var AuthenticationView = Backbone.View.extend(
  /** @lends AuthenticationView.prototype */
  {
    /**
     * @class This is the login logout surface.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      this.userView = new UserView({model: new User()});
      this.authenticatePreviousUser();
      this.on('all', function(e) {
        this.render();
      });
      this.model.bind('change', this.render);

    },
    events : {
      "click .logout" : "logout",
      "click .login" : "login"
    },
    model : Authentication,
    userView : UserView,
    template : Handlebars.compile(authTemplate),
    el : '#authentication',
    render : function() {
      if (this.model != undefined) {
        Handlebars.registerPartial("user", this.userView
            .template(this.userView.model.toJSON()));
        $(this.el).html(this.template(this.model.toJSON()));
        console.log("\trendering login: " + this.model.get("username"));
      } else {
        console.log("\tAuthentication model was undefined.");
      }
      return this;
    },
    /**
     * Logout removes the stringified user and the username from local storage,
     * and then authenticates public into the app.
     */
    logout : function() {
      localStorage.removeItem("user");
      localStorage.removeItem("username");
      this.authenticateAsPublic();
    },
    /**
     * Login tries to get the username and password from the user interface, and
     * calls the view's authenticate function.
     */
    login : function() {
      this.authenticate(document.getElementById("username").value, document
          .getElementById("password").value);
    },
    /**
     * Load sample calls the UserView's function to load a sample user, at this
     * time the sample user is Edward Sapir, a well-known early fieldlinguist.
     * He is simply loaded as a user, without calling any user authentication
     * functions.
     */
    loadSample : function() {
      this.userView.loadSample();
      this.model.set("user", this.userView.model);
      this.model.set("username", this.userView.model.get("username"));

      this.render();
      $("#logout").show();
      $("#login").hide();
    },
    /**
     * Authenticate accepts a username and password, creates a simple user, and
     * passes that user to the authentication module for real authentication
     * against a server or local database. The Authenticate function also sends a
     * callback which will render views once the authentication server has
     * responded. If the authentication result is null, it can flash an error to
     * the user and then logs in as public.
     * 
     * @param username
     * @param password
     */
    authenticate : function(username, password) {
      if (username == "public") {
        this.authenticateAsPublic();
        return;
      }
      if (username == "sapir"){
        this.loadSample();
        return;
      }
      var tempuser = new User();
      tempuser.set("username", username);
      tempuser.set("password", password);

      var self = this;
      this.model.authenticate(tempuser, function(u) {
        if (u == null) {
          console.log("Authentication failed. Authenticating as public.");
          self.authenticateAsPublic();
          return;
        }
        self.userView.model = u;
        self.model.set("user", u);
        self.model.set("username", u.get("username"));

        localStorage.setItem("username", u.get("username"));
        localStorage.setItem("user", JSON
            .stringify(u.toJSON()));
        self.render();
        $("#logout").show();
        $("#login").hide();
      });
      

    },
    /**
     * Authenticate as Public simply sends "public" to the authenticate method,
     * which contacts the server most likleyt o do things like recent activity
     * of the "public" user etc.
     */
    authenticateAsPublic : function() {
      this.userView.loadPublic();
      u = this.userView.model;
      this.model.set("user", u);
      this.model.set("username", u.get("username"));
      
      localStorage.setItem("username", u.get("username"));
      localStorage.setItem("user", JSON
          .stringify(u.toJSON()));
      this.render();
      $("#logout").hide();
      $("#login").show();
   
    },
    /**
     * AuthenticatePreviousUser is intended to be called on page load, it looks
     * for a stringified user in the localstorage, and loads them with no
     * authentication. If the authentication is stale, it will do a quick
     * password authentication view to let user know they haven't been active in
     * a while.
     * 
     */
    authenticatePreviousUser : function() {
      if (localStorage.getItem("user")) {
        var u = JSON.parse(localStorage.getItem("user"));
        u = new User(u);
        this.userView.model = u;
        this.model.set("user", u);
        this.model.set("username", u.username);
        if (this.model.staleAuthentication) {
          showQuickAuthenticateView();
        }
        this.render();
        $("#logout").show();
        $("#login").hide();
      } else {
        console.log("No previous user.");
        this.authenticateAsPublic();
      }
     
    },
    /**
     * TODO the ShowQuickAuthentication view popups up a password entry view.
     * This is used to unlock confidential datum, or to unlock dangerous settings
     * like removing a corpus. It is also used if the user hasn't confirmed their
     * identitiy in a while.
     */
    showQuickAuthenticateView : function() {

    }

  });

  return AuthenticationView;
});