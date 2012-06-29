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
      user : User,
      userid : localStorage.getItem("userid"),
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
      // TODO actually check to see if its truly a user, locally or on server
      var success = true;
      
      if (success) {
        callback(user);
      } else {
        callback(null);
      }
    }
  });

  return Authentication;
});
