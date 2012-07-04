define([
    "use!backbone", 
    "use!handlebars",
    "text!authentication/authentication_edit_embedded.handlebars",
    "text!user/user_read_link.handlebars",
    "authentication/Authentication", 
    "user/User", 
    "user/UserReadView",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars, 
    authTemplate, 
    userTemplate,
    Authentication, 
    User, 
    UserReadView
) {
  var AuthenticationEditView = Backbone.View.extend(
  /** @lends AuthenticationEditView.prototype */
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
      
    //   Create a UserReadView
      this.userView = new UserReadView({
         model: this.model.get("user")
      });
      this.userView.format = "link";
      this.userView.setElement($("#user-quickview"));
      
      // Any time the Authentication model changes, re-render
      this.model.bind('change', this.render, this);
      this.model.get("user").bind('change', this.render, this);
    },

    /**
     * The underlying model of the AuthenticationEditView is an Authentication
     */    
    model : Authentication,

    /**
     * The userView is a child of the AuthenticationEditView.
     */
    userView : UserReadView,
    
    /**
     * Events that the AuthenticationEditView is listening to and their handlers.
     */
    events : {
      "click .logout" : "logout",
      "click .login" : "login"
    },
    
    /**
     * The Handlebars template rendered as the AuthenticationEditView.
     */
    template : Handlebars.compile(authTemplate),
    userTemplate : Handlebars.compile(userTemplate),
    
    /**
     * Renders the AuthenticationEditView and all of its child Views.
     */
    render : function() {
      Utils.debug("AUTH render: " + this.el);
      if(this.model.get("user") != undefined){
        this.model.set( "gravatar", this.model.get("user").get("gravatar") );
      }
      if (this.model != undefined) {
        // Display the AuthenticationEditView
        this.setElement($("#authentication-embedded"));
        $(this.el).html(this.template(this.model.toJSON()));
        
        if (this.model.get("state") == "loggedIn") {
          $("#logout").show();
          $("#login").hide();
          $("#login_form").hide();
          if(this.model.get("user") != undefined){
            this.userView.setElement($("#user-quickview"));
            this.userView.render();
          }else{
            $("#user-quickview").html('<i class="icons icon-user icon-white">');
          }
        } else {
          $("#logout").hide();
          $("#login").show();
          $("#login_form").show();
          if(this.model.get("user") != undefined){
            this.userView.setElement($("#user-quickview"));
            this.userView.render();
          }else{
            $("#user-quickview").html('<i class="icons icon-user icon-white">');
          }
          this.$el.children(".user").html("");
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
     * Load sample calls the UserReadView's function to load a sample user, at this
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
        window.appView.loadSample();
        return;
      }
      
      // Temporarily keep the given's credentials
      var tempuser = new User({
        username : username,
        password : password
      });

      var self = this;
      this.model.authenticate(tempuser, function(userfromserver) {
        if (userfromserver == null) {
          alert("Authentication failed. Authenticating as public.");
          self.authenticateAsPublic();
          return;
        }
        
        // Save the authenticated user in our Models
        self.model.set({
          gravatar : userfromserver.get("gravatar"),
          username : userfromserver.get("username"),
          state : "loggedIn"
        });
        var appids = userfromserver.get("mostRecentIds");
        appids.userid = null;
        window.app.loadBackboneObjectsById(appids);

        // Save the authenticated user in localStorage
//        localStorage.setItem("username", u.get("username"));
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
//      localStorage.setItem("username", u.get("username"));
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
      var username = localStorage.getItem("username");
      if (username) {
        //TODO this needs testing
        // Save the previous user in our Models
        this.model.get("user").set("id",username);
        this.model.get("user").fetch();
        this.model.set("username", username);
        
        if (this.model.staleAuthentication) {
          showQuickAuthenticateView();
        }
        
        this.model.set("state", "loggedIn");
      } else {
        Utils.debug("No previous user.");
        $('#user-welcome-modal').modal("show");
        this.model.set("state", "loggedOut");

//        this.authenticateAsPublic(); //TODO this will be used in production
        this.authenticate("sapir");
      }
    },
    
    /**
     * TODO the ShowQuickAuthentication view popups up a password entry view.
     * This is used to unlock confidential datum, or to unlock dangerous settings
     * like removing a corpus. It is also used if the user hasn't confirmed their
     * identitiy in a while.
     */
    showQuickAuthenticateView : function() {
      alert("Authenticating quickly, with just password.");
    }
  });

  return AuthenticationEditView;
});