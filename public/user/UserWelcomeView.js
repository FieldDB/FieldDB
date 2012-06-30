define([
    "use!backbone", 
    "use!handlebars", 
    "text!user/user_welcome_modal.handlebars",
    "user/User",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars, 
    user_welcomeTemplate, 
    User
) {
  var UserWelcomeView = Backbone.View.extend(
  /** @lends UserWelcomeView.prototype */
  {
    /**
     * @class The UserWelcomeView invites the user to login using their existing
     *        name to sync their data, or to login as the sample user, sapir
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("USER welcome init: " + this.el);
      this.model = new User();
      this.model.set("username","YourNewUserNameGoesHere");
      this.model.bind("change", this.render, this);
      this.url = "https://localhost:3001";
    },

    /**
     * The underlying model of the UserWelcomeView is a User.
     */
    model : User,
    
    /**
     * Events that the UserWelcomeView is listening to and their handlers.
     */
    events : {
      "blur .username" : function(){
        this.model.set("username",$(".username").val());
      },
      "click .new-user-button" : function(){
        $(".confirm-password").show();
      },
      "click .register-new-user" : function(){
        Utils.debug("Attempting to register a new user: " + this.el);
        var dataToPost = {};
        dataToPost.email = $(".email").val();
        dataToPost.username = $(".username").val();
        dataToPost.password = $(".password").val();
        

        if (dataToPost.username != ""
          && (dataToPost.password == $(".to-confirm-password").val())
          && dataToPost.email != "") {
          Utils
          .debug("User has entered an email and the passwords match. ");

          /*
           * Contact the server and register the new user
           */
          $.ajax({
            type : 'POST',
            url : this.url + "/register",
            data : dataToPost,
            success : function() {
              alert("success");
            },
            dataType : ""
          });
        } else{
          Utils
          .debug("User has not entered good info. ");
          alert("Sorry, something is wrong with your password or email. ");
        }
      },
      "click .register-twitter" : function(){
        
      },
      "click .register-facebook" : function(){
        
      },
      
      "click .sync_sapir_data" : function() {
        console.log("hiding user welcome, syncing sapir");
        window.loadApp(null, function(){
          window.appView.replicateDatabasesWithCallback(function(){
            window.appView.authView.loadSample();
          });
        });
        $('#user-welcome-modal').modal("hide");
        
      },
      "click .sync_my_data" : function(){
        console.log("hiding user welcome, syncing users data");
        window.loadApp(null, function(){
          window.appView.replicateDatabasesWithCallback(function(){
            window.appView.authView.authenticate($("#welcomeusername"));
          });
        });
        
        $('#user-welcome-modal').modal("hide");
        
      }
    },


    /**
     * The Handlebars template rendered as the UserWelcomeView
     */
    template : Handlebars.compile(user_welcomeTemplate),


    /**
     * Renders the UserWelcomeView and its partial.
     */
    render : function() {
      Utils.debug("USER render: " + this.el);

      if (this.model != undefined) {
       
        // Display the UserWelcomeView
        this.setElement($("#user-welcome-modal"));
        $(this.el).html(this.template(this.model.toJSON()));
        $(".username").focus();
      } else {
        Utils.debug("\User model was undefined");
      }

      return this;
    }
  });

  return UserWelcomeView;
}); 