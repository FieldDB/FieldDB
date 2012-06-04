define([ "use!backbone", "user/User" ], function(Backbone, User) {
  var Authentication = Backbone.Model.extend(
  /** @lends Authentication.prototype */
  {
    /**
     * @class The Authentication Model handles login and logout and
     *        authentication locally or remotely. *
     * @property {User} user The user is a User object (User, Bot or Informant)
     *           which is logged in and viewing the app with that user's
     *           perspective. To check whether some data is
     *           public/viewable/editable the app.user should be used to verify
     *           the permissions. If no user is logged in a special user
     *           "public" is logged in and used to calculate permissions.
     * 
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
      this.bind('error', function(model, error) {
        console.log("Error in Authentication  : " + error);
      });
      this.on('all', function(e) {
        Utils.debug("Authentication, " + this.get('username') + " event: "
            + JSON.stringify(e));
      });

    },

    defaults : {
      user : User,
      username : localStorage.getItem("username")
    },
    staleAuthentication: false
    ,
    /**
     * Contacts local or remote server to verify the username and password
     * provided in the user object. Upon success, calls the callback with the
     * user.
     * 
     * @param user A user object to verify against the authentication database
     * @param callback A callback to call upon sucess.
     */
    authenticate : function(user, callback) {
      // TODO actually check to see if its truely a user, locally or on server
      var success = true;
      
      if(success){
        callback(user);
      }else{
        callback(null);
      }
    }

  });

  return Authentication;
});
