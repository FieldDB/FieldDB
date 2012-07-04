define([
    "use!backbone", 
    "user/User",
    "libs/Utils" 
], function(
    Backbone, 
    User
) {
  var Authentication = Backbone.Model.extend(
  /** @lends Authentication.prototype */
  {
    /**
     * @class The Authentication Model handles login and logout and
     *        authentication locally or remotely. *
     * 
     * @property {User} user The user is a User object (User, Bot or Consultant)
     *           which is logged in and viewing the app with that user's
     *           perspective. To check whether some data is
     *           public/viewable/editable the app.user should be used to verify
     *           the permissions. If no user is logged in a special user
     *           "public" is logged in and used to calculate permissions.
     * @property {Boolean} staleAuthentication TODO Describe staleAuthentication.
     * @property {String} state The current state of the Authentication is either
     *           "loggedIn" or "loggedOut".
     * 
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
      this.bind('error', function(model, error) {
        Utils.debug("Error in Authentication  : " + error);
      });
      
      
    },

    defaults : {
      user: new User(), //Deprecated
      userPrivate : User,
      userPublic : User,
      username : localStorage.getItem("username"),
      state : "loggedOut"
    },

    staleAuthentication: false,
    
    /**
     * Contacts local or remote server to verify the username and password
     * provided in the user object. Upon success, calls the callback with the
     * user.
     * 
     * @param user A user object to verify against the authentication database
     * @param callback A callback to call upon sucess.
     */
    authenticate : function(user, callback) {
      var dataToPost = {};
      dataToPost.login = user.get("username");
      dataToPost.password = user.get("password");
      var self= this;
      $.ajax({
        type : 'POST',
        url : Utils.authUrl + "/login",
        data : dataToPost,
        success : function(data) {
          if(data.errors != null){
            $(".alert-error").html(data.errors.join("<br/>")+" "+Utils.contactUs );
            $(".alert-error").show();
            if(typeof callback == "function"){
              callback(null); //tell caller that the user failed to authenticate
            }
          }else if ( data.user != null ){
            self.get("user").id = data.user._id; //This id is created by mongoose-auth when the user first signs up, and is used to link user across mongodb and couchdb
            self.get("user").fetch({
              success : function() {
                this.set("userPublic", this.get("userPrivate")); //TODO make a smaller copy, not a full copy.
                
                if(typeof callback == "function"){
                  callback(self.get("user")); //let the caller have the user, now the usr profile will also be availible
                }
              },
              error : function() {
                Utils.debug("There was an error fetching the users' data. Either this is a first install, and the sync is comming up next, or they are offline. You can try clicking the sync button, or create new data and hit sync when you go back online.");
                if(typeof callback == "function"){
                  callback(self.get("user")); //let the caller have the user, even though their data didnt come down from couch so their profile wont be availible but they can make new data.
                }
              }
            });
            
            
          }
        }
      });
     
    },
    /**
     * This function uses the quick athentication view to get the user's
     * password and authenticate them. The authenticate process brings
     * down the user from the server without any extra work in this function. 
     * 
     * @param callback
     */
    pullUserFromServer : function(callback){
      window.appView.authView.showQuickAuthenticateView( function(){
        //This happens after the user has been authenticated. 
        if(typeof callback == "function"){
          callback();
        }
      });

    }, 
    pushUserToServer : function(callback){
      alert("TODO Pushing user details and preferences to server");
      
      //TODO contact server and send user details
      
      if(typeof callback == "function"){
        callback();
      }
    }
  });

  return Authentication;
});
