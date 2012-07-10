define([
    "backbone", 
    "user/User",
    "user/UserMask",
    "libs/Utils" 
], function(
    Backbone, 
    User,
    UserMask
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
      username : localStorage.getItem("username"),
      state : "loggedOut"
    },
    
    model : {
      userPrivate : User,
      userPublic : UserMask
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
      if(this.get("userPrivate") != undefined){
        //if the same user is re-authenticating, include their details to sync to the server.
        if(user.get("username") == this.get("userPrivate").get("username")){
          dataToPost.syncDetails = "true";
          dataToPost.syncUserDetails = JSON.stringify(this.get("userPrivate").toJSON());
        }
      }
      var self= this;
      $.ajax({
        type : 'POST',
        url : Utils.authUrl + "/login",
        data : dataToPost,
        success : function(data) {
          if (data.errors != null) {
            $(".alert-error").html(
                data.errors.join("<br/>") + " " + Utils.contactUs);
            $(".alert-error").show();
            if (typeof callback == "function") {
              callback(null, data.errors); // tell caller that the user failed to
              // authenticate
            }
          } else if (data.user != null) {
            self.saveServerResponseToUser(data, callback);
          }
        },//end successful login
        dataType : ""
      });     
    },
    /**
     * This function parses the server response and injects it into the authentication's user public and user private
     * 
     */
    saveServerResponseToUser : function(data, callback){
      this.set("state", "loggedIn");
      this.staleAuthentication = false;

      if (this.get("userPrivate") == undefined) {
        this.set("userPrivate", new User());
      }
      if (this.get("userPublic") == undefined) {
        this.set("userPublic", new UserMask());
      }
      var u = this.get("userPrivate");
      u.set("id",data.user._id); //set the backbone id to be the same as the mongodb id
      u.set(u.parse(data.user)); //might take internal elements that are supposed to be a backbone model, and override them
      // Over write the public copy with any (new) username/gravatar
      // info
      this.get("userPublic").set("id", this.get("userPrivate").get("id") );
      if (data.user.publicSelf == null) {
        // if the user hasnt already specified their public self, then
        // put in a username and gravatar,however they can add more
        // details like their affiliation, name, research interests
        // etc.
        data.user.publicSelf = {};
        data.user.publicSelf.username = this.get("userPrivate").get(
        "username");
        data.user.publicSelf.gravatar = this.get("userPrivate").get(
        "gravatar");
      }
      this.get("userPublic").set(data.user.publicSelf);
//    self.get("userPublic").changeCorpus(data.user.corpuses[0].corpusname);
      // self.get("userPublic").save(); //TODO save this when there is
      // no problem with pouch
//      Utils.debug(data.user);
      if (typeof callback == "function") {
        callback("true"); //tell caller that the user succeeded to authenticate
      }
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
