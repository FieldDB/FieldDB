define([
    "backbone", 
    "confidentiality_encryption/Confidential",
    "user/User",
    "user/UserMask",
    "libs/OPrime" 
], function(
    Backbone, 
    Confidential,
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
      OPrime.debug("AUTHENTICATION INIT");
      this.bind('error', function(model, error) {
        OPrime.debug("Error in Authentication  : " + error);
      });
      
      if(this.get("filledWithDefaults")){
        this.fillWithDefaults();
        this.unset("filledWithDefaults");
      }
    },
    fillWithDefaults : function(){
      if(!this.get("confidential")){
        this.set("confidential", new Confidential({filledWithDefaults : true}));
        this.get("confidential").decryptedMode = true;
        if(OPrime.getCookie("token")){
          this.get("confidential").set("secretkey", OPrime.getCookie("token")); //TODO store the token somewhere safer
        }else{
          //do nothing, wait until you use the token
//          this.logout();
//          return;
        }
      }
    },
    defaults : {
      username : localStorage.getItem("username"),
      state : "loggedOut"
    },
    
    // Internal models: used by the parse function
    internalModels : {
      userPrivate : User,
      userPublic : UserMask,
      confidential :  Confidential
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
    authenticate : function(user, successcallback, failcallback) {
      var dataToPost = {};
      dataToPost.username = user.get("username");
      dataToPost.password = user.get("password");
      if(this.get("userPrivate") != undefined){
        //if the same user is re-authenticating, include their details to sync to the server.
        if(user.get("username") == this.get("userPrivate").get("username")){
          dataToPost.syncDetails = "true";
          dataToPost.syncUserDetails = JSON.parse(JSON.stringify(this.get("userPrivate").toJSON()));
          delete dataToPost.syncUserDetails._rev;
        }
        //TODO what if they log out, when they have change to their private data that hasnt been pushed to the server, the server will overwrite their details. should we automatically check here, or should we make htem a button when they are authetnticated to test if they ahve lost their prefs etc?
      }
      var self= this;
      var authUrl = user.get("authUrl");
      $.ajax({
        type : 'POST',
        url : authUrl + "/login",
        data : dataToPost,
        success : function(serverResults) {
          if (serverResults.userFriendlyErrors != null) {
            try{
              window.appView.toastUser(serverResults.userFriendlyErrors.join("<br/>") + " " + OPrime.contactUs, "alert-danger","Login errors:");
            }catch(e){
              OPrime.debug(e);
            }
            if (typeof failcallback == "function") {
              failcallback(serverResults.userFriendlyErrors.join("<br/>"));
            }
            if (typeof successcallback == "function") {
              successcallback(null, serverResults.userFriendlyErrors); // tell caller that the user failed to
              // authenticate
            }
          } else if (serverResults.user != null) {
            self.saveServerResponseToUser(serverResults, successcallback);
          }
        },//end successful login
        error: function(e){
          OPrime.debug("Ajax failed, user might be offline (or server might have crashed before replying).", e);
          if(window.appView){
            window.appView.toastUser("There was an error in contacting the authentication server to confirm your identity. " + OPrime.contactUs, "alert-danger","Connection errors:");
          }

          if (typeof failcallback == "function") {
            failcallback("There was an error in contacting the authentication server to confirm your identity. Maybe you're offline?");
          }
        },
        dataType : ""
      });     
    },
    
    logout : function(){
      localStorage.removeItem("username");
      localStorage.removeItem("mostRecentDashboard");
      localStorage.removeItem("mostRecentCouchConnection");
      localStorage.removeItem("encryptedUser");
      localStorage.removeItem("helpShownCount");
      localStorage.removeItem("helpShownTimestamp");
      
//      this.authenticateAsPublic();
      //Destropy cookies, and reload the page, it will put the user at the login page.
      OPrime.setCookie("username", undefined, -365);
      OPrime.setCookie("token", undefined, -365);
      window.location.replace("index.html");
    },
    /**
     * This function parses the server response and injects it into the authentication's user public and user private
     * 
     */
    saveServerResponseToUser : function(serverResults, callbacksave){
      OPrime.debug("saveServerResponseToUser");

      this.set("state", "loggedIn");
      this.staleAuthentication = false;

      // Over write the public copy with any (new) username/gravatar
      // info
      if (serverResults.user.publicSelf == null) {
        // if the user hasnt already specified their public self, then
        // put in a username and gravatar,however they can add more
        // details like their affiliation, name, research interests
        // etc.
        serverResults.user.publicSelf = {};
        serverResults.user.publicSelf.username = serverResults.user.username;
        serverResults.user.publicSelf.gravatar = serverResults.user.gravatar;
        serverResults.user.publicSelf.authUrl = serverResults.user.authUrl;
        serverResults.user.publicSelf.id = serverResults.user._id; //this will end up as an attribute
        serverResults.user.publicSelf.pouchname = serverResults.user.corpuses[0].pouchname;
      }
      
      if (this.get("userPublic") == undefined) {
        this.set("userPublic", new UserMask(serverResults.user.publicSelf));
      }else{
        this.get("userPublic").set(serverResults.user.publicSelf);
      }
      this.get("userPublic")._id = serverResults.user._id;

      if (this.get("userPrivate") == undefined) {
        this.set("userPrivate", new User({filledWithDefaults: true}));
      }
      var u = this.get("userPrivate");
      u.id = serverResults.user._id; //set the backbone id to be the same as the mongodb id
      //set the user AFTER setting his/her publicself if it wasnt there already
      /*
       * Handle if the user got access to new corpora
       */
      if(serverResults.user.newCorpusConnections){
        if(window.appView){
          window.appView.toastUser("You have have been added to a new corpus team by someone! Click here to see the corpora to which you have access.","alert-success","Added to corpus!");
        }
        for(var x in serverResults.user.newCorpusConnections){
          if(_.pluck(serverResults.user.corpuses,"pouchname").indexOf(serverResults.user.newCorpusConnections[x].pouchname) == -1){
            serverResults.user.corpuses.push(serverResults.user.newCorpusConnections[x]);
          }
        }
        delete serverResults.user.newCorpusConnections;
      }
      
      u.set(u.parse(serverResults.user)); //might take internal elements that are supposed to be a backbone model, and override them
      if(window.appView){
        window.appView.associateCurrentUsersInternalModelsWithTheirViews();
      }
      /* Set up the pouch with the user's most recent couchConnection if it has not already been set up */
      window.app.changePouch(serverResults.user.mostRecentIds.couchConnection);

//    self.get("userPublic").changePouch(data.user.corpuses[0].pouchname);
      // self.get("userPublic").save(); //TODO save this when there is
      // no problem with pouch
//      OPrime.debug(serverResults.user);
      
      if (typeof callbacksave == "function") {
        callbacksave("true"); //tell caller that the user succeeded to authenticate
      }
      OPrime.setCookie("username", serverResults.user.username, 365);
      OPrime.setCookie("token", serverResults.user.hash, 365);
      this.get("confidential").set("secretkey", serverResults.user.hash);
      this.saveAndEncryptUserToLocalStorage();
//      if(window.appView){
//        if(! this.get("userPublic").id){
//          this.get("userPublic").saveAndInterConnectInApp();
//        }else{
//          window.appView.addBackboneDoc(this.get("userPublic").id);
//          window.appView.addPouchDoc(this.get("userPublic").id);
//        }
//      }
    },
    loadEncryptedUser : function(encryptedUserString, callbackload){
      OPrime.debug("loadEncryptedUser");
      
      /*
       * TODO potentially could log the public  user in here.
       */
      if (!encryptedUserString) {
//        this.authenticate(new Backbone.Model({
//          username : "devgina",
//          password : "test",
//          authUrl : OPrime.authUrl
//        }), callbackload);
        this.logout();
        return;
      }
      /*
       * If there is currently no token to decrypt this user, log them out.
       */
      if(!OPrime.getCookie("token")){
        this.logout();
        return;
      }
      
      var u = JSON.parse(this.get("confidential").decrypt(encryptedUserString));
      var data = {};
      data.user = u;
      this.saveServerResponseToUser(data, callbackload);
    },
    saveAndEncryptUserToLocalStorage : function(callbacksaved){
      OPrime.debug("saveAndEncryptUserToLocalStorage");
      var u = this.get("confidential").encrypt(JSON.stringify(this.get("userPrivate").toJSON()));
      localStorage.setItem("encryptedUser", u);
      if(window.appView){
        window.appView.addSavedDoc(this.get("userPrivate").id);
        window.appView.toastUser("Sucessfully saved user details.","alert-success","Saved!");
      }
      if(typeof callbacksaved == "function"){
        callbacksaved();
      }
    },
    saveAndInterConnectInApp : function(successcallback, failurecallback){
//      localStorage.setItem("mostRecentDashboard", JSON.stringify(this.get("userPrivate").get("mostRecentIds")) );
      this.saveAndEncryptUserToLocalStorage(function(){
        if(typeof successcallback == "function"){
          successcallback();
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
    },
    fetchListOfUsersGroupedByPermissions : function(successcallback, failcallback){
      var dataToPost = {};
      var authUrl = "";
      if(this.get("userPrivate") != undefined){
        //Send username to limit the requests so only valid users can get a user list
        dataToPost.username = this.get("userPrivate").get("username");
        dataToPost.couchConnection = window.app.get("corpus").get("couchConnection");
        if(!dataToPost.couchConnection.path){
          dataToPost.couchConnection.path ="";
          window.app.get("corpus").get("couchConnection").path = "";
        }
        authUrl = this.get("userPrivate").get("authUrl");
      }else{
        return;
      }
      var self= this;
      $.ajax({
        type : 'POST',
        url : authUrl + "/corpusteam",
        data : dataToPost,
        success : function(serverResults) {
          if (serverResults.userFriendlyErrors != null) {
            try{
              window.appView.toastUser(serverResults.userFriendlyErrors.join("<br/>") 
                  , "alert-warning","Error connecting to populate corpus permissions:");
            }catch(e){
              OPrime.debug(e);
            }
            if (typeof failcallback == "function") {
              failcallback(serverResults.userFriendlyErrors.join("<br/>"));
            }
          } else if (serverResults.users != null) {
            if (typeof successcallback == "function") {
              serverResults.users.timestamp = Date.now();
              localStorage.setItem(dataToPost.pouchname+"Permissions", JSON.stringify(serverResults.users));
              successcallback(serverResults.users); 
            }
          }
        },//end successful fetch
        error: function(e){
          OPrime.debug("Ajax failed, user might be offline (or server might have crashed before replying) (or server might have crashed before replying).", e);

          if (typeof failcallback == "function") {
            failcallback("There was an error in contacting the authentication server to get the list of users on your corpus team. Maybe you're offline?");
          }
        },
        dataType  : ""
      }); 
    },
    addCorpusRoleToUser : function(role, userToAddToCorpus, successcallback, failcallback){
      var self = this;
      $("#quick-authenticate-modal").modal("show");
      if( this.get("userPrivate").get("username") == "lingllama" ){
        $("#quick-authenticate-password").val("phoneme");
      }
      window.hub.subscribe("quickAuthenticationClose",function(){
       
        //prepare data and send it
        var dataToPost = {};
        var authUrl = "";
        if(this.get("userPrivate") != undefined){
          //Send username to limit the requests so only valid users can get a user list
          dataToPost.username = this.get("userPrivate").get("username");
          dataToPost.password = $("#quick-authenticate-password").val();
          dataToPost.couchConnection = window.app.get("corpus").get("couchConnection");
          if(!dataToPost.couchConnection.path){
            dataToPost.couchConnection.path ="";
            window.app.get("corpus").get("couchConnection").path = "";
          }
          dataToPost.roles = [role];
          dataToPost.userToAddToRole = userToAddToCorpus.username;
          
          authUrl = this.get("userPrivate").get("authUrl");
        }else{
          return;
        }
        $.ajax({
          type : 'POST',
          url : authUrl + "/addroletouser",
          data : dataToPost,
          success : function(serverResults) {
            if (serverResults.userFriendlyErrors != null) {
              OPrime.debug("User "+userToAddToCorpus.username+" not added to the corpus as "+role);
              if (typeof failcallback == "function") {
                failcallback(serverResults.userFriendlyErrors.join("<br/>"));
              }
            } else if (serverResults.roleadded != null) {
              OPrime.debug("User "+userToAddToCorpus.username+" added to the corpus as "+role);
              if (typeof successcallback == "function") {
                successcallback(userToAddToCorpus); 
              }
            }
          },//end successful fetch
          error: function(e){
            OPrime.debug("Ajax failed, user might be offline (or server might have crashed before replying).", e);

            if (typeof failcallback == "function") {
              failcallback("There was an error in contacting the authentication server to add "+userToAddToCorpus.username+" on your corpus team. Maybe you're offline?");
            }
          },
          dataType : ""
        }); 
        //end send call
        
        //Close the modal
        $("#quick-authenticate-modal").modal("hide");
        $("#quick-authenticate-password").val("");
        window.hub.unsubscribe("quickAuthenticationClose", null, this); 
      }, self);
    }
    
  });

  return Authentication;
});
