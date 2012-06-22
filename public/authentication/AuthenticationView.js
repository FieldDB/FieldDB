define([
    "use!backbone", 
    "use!handlebars",
    "text!authentication/authentication.handlebars",
    "authentication/Authentication", 
    "user/User", 
    "user/UserView",
    "user/UserPreference",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars, 
    authTemplate, 
    Authentication, 
    User, 
    UserView,
    UserPreference
) {
  var AuthenticationView = Backbone.View.extend(
  /** @lends AuthenticationView.prototype */
  {
    /**
     * @class This is the login logout surface.
     * 
     * @description Starts the Authentication and initializes all its children. 
     * This is where the dropdown menu for user related stuff is housed.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("AUTH init: " + this.el);
      
    //   Create a UserView
      this.userView = new UserView({
         model: this.model.get("user")
      });
//      this.userView.loadSample();
      
      // Any time the Authentication model changes, re-render
      this.model.bind('change', this.render, this);
      
      this.authenticatePreviousUser();      
    },

    /**
     * The underlying model of the AuthenticationView is an Authentication
     */    
    model : Authentication,

    /**
     * The userView is a child of the AuthenticationView.
     */
    // TODO Make this a real child, rather than just a partial.
    userView : UserView,
    
    /**
     * Events that the AuthenticationView is listening to and their handlers.
     */
    events : {
      "click .logout" : "logout",
      "click .login" : "login"
    },
    
    /**
     * The Handlebars template rendered as the AuthenticationView.
     */
    template : Handlebars.compile(authTemplate),
    
    /**
     * Renders the AuthenticationView and all of its child Views.
     */
    render : function() {
      Utils.debug("AUTH render: " + this.el);
      if (this.model != undefined) {
        // Display the AuthenticationView
        this.setElement($("#authentication"));
      //  Handlebars.registerPartial("user", this.userView.template(this.userView.model.toJSON()));
        $(this.el).html(this.template(this.model.toJSON()));
        
        if (this.model.get("state") == "loggedIn") {
          $("#logout").show();
          $("#login").hide();
          $("#login_form").hide();
        } else if (this.model.get("state") == "loggedOut") {
          $("#logout").hide();
          $("#login").show();
          $("#login_form").show();
        }
        
        Utils.debug("\trendering login: " + this.model.get("username"));
      } else {
        Utils.debug("\tAuthentication model was undefined.");
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
      Utils.debug("LOGIN");
      this.authenticate(document.getElementById("username").value, 
          document.getElementById("password").value);
    },
    
    /**
     * Load sample calls the UserView's function to load a sample user, at this
     * time the sample user is Edward Sapir, a well-known early fieldlinguist.
     * He is simply loaded as a user, without calling any user authentication
     * functions.
     */
    loadSample : function() {      
      this.userView.loadSample();
      
      this.model.set({
        user : this.userView.model,
        username : this.userView.model.get("username"),
        state : "loggedIn",
        gravatar :  this.userView.model.get("gravatar") 
      });
      
      // TODO @cesine Do you think that the Sapir user and username should be put into
      // localStorage?
    },
    
    /**
     * Authenticate accepts a username and password, creates a simple user, and
     * passes that user to the authentication module for real authentication
     * against a server or local database. The Authenticate function also sends a
     * callback which will render views once the authentication server has
     * responded. If the authentication result is null, it can flash an error to
     * the user and then logs in as public.
     * 
     * @param username {String} The username to authenticate.
     * @param password {String} The password to authenticate.
     */
    authenticate : function(username, password) {
      // Current signed in as the public user - special case authentication
      if (username == "public") {
        this.authenticateAsPublic();
        return;
      }
      
      // Currently signed in as Sapir - no authentication needed
      if (username == "sapir") {
        this.loadSample();
        
        
        return;
      }
      
      // Temporarily keep the given's credentials
      var tempuser = new User({
        username : username,
        password : password
      });

      var self = this;
      this.model.authenticate(tempuser, function(u) {
        if (u == null) {
          Utils.debug("Authentication failed. Authenticating as public.");
          self.authenticateAsPublic();
          return;
        }
        
        // Save the authenticated user in our Models
        self.userView.model = u;
        self.model.set({
          user : u,
          username : u.get("username"),
          state : "loggedIn"
        });

        // Save the authenticated user in localStorage
        localStorage.setItem("username", u.get("username"));
        localStorage.setItem("user", JSON.stringify(u.toJSON()));
      });
    },
    
    /**
     * Authenticate as Public simply sends "public" to the authenticate method,
     * which contacts the server most likleyt o do things like recent activity
     * of the "public" user etc.
     */
    authenticateAsPublic : function() {
      // Load the public user
      this.userView.loadPublic();
      u = this.userView.model;
      
      // Save the public user in our Models
      this.model.set({
        user : u,
        username : u.get("username"),
        state : "logggedOut"
      });
      
      // Save the public user in localStorage
      localStorage.setItem("username", u.get("username"));
      localStorage.setItem("user", JSON.stringify(u.toJSON()));
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
        // Reform the previous user from localStorage
        var uobj = JSON.parse(localStorage.getItem("user"));
        uobj.prefs = new UserPreference(uobj.prefs);
        
        // Save the previous user in our Models
        this.model.get("user").set(uobj);
        this.model.set("username", uobj.username);
        
        if (this.model.staleAuthentication) {
          showQuickAuthenticateView();
        }
        
        this.model.set("state", "loggedIn");
      } else {
        Utils.debug("No previous user.");
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