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
      userPrivate : User,
      userPublic : User,
      username : localStorage.getItem("username"),
      state : "loggedOut"
    },
    
    model : {
      user : User
    },
    
    parse : function(response) {
      if (response.ok === undefined) {
        for (var key in this.model) {
          var embeddedClass = this.model[key];
          var embeddedData = response[key];
          response[key] = new embeddedClass(embeddedData, {parse:true});
        }
      }
      
      return response;
    },

    staleAuthentication: true,
    
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
            self.set("state", "loggedIn");
            self.staleAuthentication = false;

            self.set("userPrivate", data.user); //TODO might have to parse here
            //Over write the public copy with any (new) username/gravatar info
            self.get("userPublic").id = self.get("userPrivate").get("id");//TODO check this
            if (data.user.publicSelf == null){
              //if the user hasnt already specified their public self, then put in a username and gravatar,however they can add more details like their affiliation, name, research interests etc.
              data.user.publicSelf = {};
              data.user.publicSelf.username = self.get("userPrivate").get("username");
              data.user.publicSelf.gravatar = self.get("userPrivate").get("gravatar");
            }
            self.get("userPublic").set(data.user.publicSelf);
            self.get("userPublic").save();
          }
        }
      });     
    },
    /**
     * This function uses the quick authentication view to get the user's
     * password and authenticate them. The authenticate process brings
     * down the user from the server without any extra work in this function. 
     * 
     * @param callback
     */
    syncUserWithServer : function(callback){
      if(this.staleAuthentication){
        var self = this;
        window.appView.authView.showQuickAuthenticateView( function(){
          //This happens after the user has been authenticated. 
          self.staleAuthentication = false;
          if(typeof callback == "function"){
            callback();
          }
        });
      }else{
        //the user has authenticated recently, or there are no changes in their details.
        if(typeof callback == "function"){
          callback();
        }
      }
    }
    
  });

  return Authentication;
});
