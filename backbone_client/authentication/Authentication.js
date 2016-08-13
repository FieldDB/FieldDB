define([
  "libs/FieldDBBackboneModel",
  "confidentiality_encryption/Confidential",
  "user/User",
  "user/UserMask",
  "OPrime"
], function(
  FieldDBBackboneModel,
  Confidential,
  User,
  UserMask
) {
  var Authentication = FieldDBBackboneModel.extend( /** @lends Authentication.prototype */ {
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
     *           "renderLoggedIn" (if the user is not the public user) or "renderLoggedOut" (if the user is the public user).
     *
     * @extends Backbone.Model
     * @constructs
     */
    initialize: function() {
      if (OPrime.debugMode) OPrime.debug("AUTHENTICATION INIT");
      this.bind('error', function(model, error) {
        if (OPrime.debugMode) OPrime.debug("Error in Authentication  : " + error);
      });

      if (this.get("filledWithDefaults")) {
        this.fillWithDefaults();
        this.unset("filledWithDefaults");
      }
    },
    fillWithDefaults: function() {
      if (!this.get("confidential")) {
        this.set("confidential", new Confidential({
          filledWithDefaults: true
        }));
        this.get("confidential").decryptedMode = true;
        if (localStorage.getItem("token")) {
          this.get("confidential").set("secretkey", localStorage.getItem("token")); //TODO store the token somewhere safer
        } else {
          //do nothing, wait until you use the token
          //          this.logout();
          //          return;
        }
      }
    },
    defaults: {
      username: localStorage.getItem("username"),
      state: "loggedOut"
    },

    // Internal models: used by the parse function
    internalModels: {
      userPrivate: User,
      userPublic: UserMask,
      confidential: Confidential
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
    authenticate: function(user, successcallback, failcallback) {
      var dataToPost = {};
      dataToPost.username = user.get("username");
      dataToPost.password = user.get("password");
      /* if the user is currently in a chrome app, save which chrome app they used last into their user, so that we can redirect them to it if we ever need to redirect them from the website. */
      if (this.get("userPrivate") != undefined) {
        if (OPrime.isChromeApp()) {
          this.get("userPrivate").set("preferredChromeExtension", window.location.origin);
        }
        //if the same user is re-authenticating, include their details to sync to the server.
        if (user.get("username") == this.get("userPrivate").get("username") && user.get("username") != "public") {
          dataToPost.syncDetails = "true";
          dataToPost.syncUserDetails = JSON.parse(JSON.stringify(this.get("userPrivate").toJSON()));
          delete dataToPost.syncUserDetails._rev;
        }
        //TODO what if they log out, when they have change to their private data that hasnt been pushed to the server, the server will overwrite their details. should we automatically check here, or should we make htem a button when they are authetnticated to test if they ahve lost their prefs etc?
      }
      var self = this;
      var authUrl = FieldDB.Connection.defaultConnection(user.get("authUrl")).authUrl;
      FieldDB.CORS.makeCORSRequest({
        type: 'POST',
        withCredentials: true,
        url: authUrl + "/login",
        data: dataToPost
      }).then(function(serverResults) {
        if (!dataToPost.syncDetails) {
          var encryptedUserString = localStorage.getItem(dataToPost.username);
          var localUser = self.get("confidential").decrypt(encryptedUserString);
          if (localUser.indexOf("confidential:") !== 0) {
            localUser = new FieldDB.User(JSON.parse(localUser));
            console.log("todo merge the user's local prefs", localUser);
            serverResults.user = (new FieldDB.User(serverResults.user).merge("self", localUser, "overwrite")).toJSON();
            // TODO merge with user's local prefs
          }
        }

        self.staleAuthentication = false;
        serverResults.user.corpora = serverResults.user.corpora || serverResults.user.corpuses;
        if (OPrime.isTouchDBApp()) {
          /* if on android, turn on replication. */
          var db = dataToPost.username + "-firstcorpus";
          var dbServer = serverResults.user.corpora[0].domain;
          if (serverResults.user.mostRecentIds && serverResults.user.mostRecentIds.connection && serverResults.user.mostRecentIds.connection.dbname) {
            db = serverResults.user.mostRecentIds.connection.dbname;
            dbServer = serverResults.user.mostRecentIds.connection.domain;
          }
          Android.setCredentialsAndReplicate(db, username, password, dbServer);
        }

        self.saveServerResponseToUser(serverResults, successcallback);
      }, function(e) {
        var message = "There was an error in contacting the authentication server to confirm your identity. " + OPrime.contactUs;
        if (e && e.userFriendlyErrors && typeof e.userFriendlyErrors.join === "function") {
          message = e.userFriendlyErrors.join(" ");
        }
        // window.appView.toastUser(serverResults.userFriendlyErrors.join("<br/>") + " " + OPrime.contactUs, "alert-danger", "Login errors:");
        // if (typeof failcallback == "function") {
        //   failcallback(serverResults.userFriendlyErrors.join("<br/>"));
        // }
        // if (typeof successcallback == "function") {
        //   successcallback(null, serverResults.userFriendlyErrors); // tell caller that the user failed to
        //   // authenticate
        // }

        if (OPrime.debugMode) OPrime.debug("Ajax failed, user might be offline (or server might have crashed before replying).", e);
        if (window.appView) {
          window.appView.toastUser(message, "alert-danger", "Connection errors:");
        }

        if (typeof failcallback == "function") {
          failcallback(message);
        }
      });
    },

    logout: function() {
      localStorage.removeItem("username");
      localStorage.removeItem("token");
      /* keep the user's help count*/
      //      localStorage.removeItem("helpShownCount");
      //      localStorage.removeItem("helpShownTimestamp");

      //Destropy cookies, and load the public user

      this.loadPublicUser();
    },

    register: function(dataToPost, successCallback, errorCallback, renderProgress, renderStatus) {
      if (this.registering) {
        return;
      }

      this.registering = true;
      errorCallback = errorCallback || function(err) {
        console.warn('problem registering user', err);
        throw err;
      };

      renderStatus = renderStatus || function(status) {
        console.log(status);
      };

      if (typeof renderProgress === "function") {
        renderProgress();
      }

      this.fielddbModel = this.fielddbModel || new FieldDB.Authentication();
      this.fielddbModel.register(dataToPost).then(function(user) {
        //Destropy cookies, and load the new user
        localStorage.removeItem("username");
        localStorage.removeItem("token");

        // var auth  = new Authentication({filledWithDefaults: true});
        var auth = new Authentication({
          "confidential": new Confidential({
            secretkey: user.hash
          }),
          "userPrivate": new User(user.toJSON())
        });

        OPrime.setCookie("username", user.username, 365);
        OPrime.setCookie("token", user.hash, 365);
        var u = auth.get("confidential").encrypt(JSON.stringify(user.toJSON()));
        localStorage.setItem(user.username, u);
        renderStatus("Building your database for you...");

        var corpus = new FieldDB.Corpus({
          connection: user.corpora._collection[0]
        });

        return corpus.whenDatabaseIsReady;
      }).then(function(corpus) {
        /*
         * Redirect the user to their user page which will ensure their corpus is valid
         */
        renderStatus("New Corpus saved in your user profile. Taking you to your new corpus when it is ready...");

        if (typeof successCallback === "function") {
          successCallback(corpus);
        }
      }).catch(errorCallback);
    },

    /**
     * This function parses the server response and injects it into the authentication's user public and user private
     *
     */
    saveServerResponseToUser: function(serverResults, callbacksave) {
      if (OPrime.debugMode) OPrime.debug("saveServerResponseToUser");

      var renderLoggedInStateDependingOnPublicUserOrNot = "renderLoggedIn";
      if (serverResults.user.username == "public") {
        renderLoggedInStateDependingOnPublicUserOrNot = "renderLoggedOut";
      }
      this.set("state", renderLoggedInStateDependingOnPublicUserOrNot);

      // Over write the public copy with any (new) username/gravatar
      // info
      if (serverResults.user.userMask == null) {
        // if the user hasnt already specified their public self, then
        // put in a username and gravatar,however they can add more
        // details like their affiliation, name, research interests
        // etc.
        serverResults.user.userMask = {};
        serverResults.user.userMask.username = serverResults.user.username;
        serverResults.user.userMask.gravatar = serverResults.user.gravatar;
        serverResults.user.userMask.authUrl = serverResults.user.authUrl;
        serverResults.user.userMask.id = serverResults.user._id; //this will end up as an attribute
        serverResults.user.userMask._id = serverResults.user._id; //this will end up as an attribute
        //        serverResults.user.userMask.dbname = serverResults.user.corpora[0].dbname;
      }

      if (this.get("userPrivate") == undefined) {
        this.set("userPrivate", new User({
          filledWithDefaults: true
        }));
      }
      var u = this.get("userPrivate");
      u.id = serverResults.user._id; //set the backbone id to be the same as the auth id
      //set the user AFTER setting his/her publicself if it wasn't there already
      /*
       * Handle if the user got access to new corpora
       */
      if (serverResults.user.newCorpusConnections) {
        if (window.appView) {
          window.appView.toastUser("You have have been added to a new corpus team by someone! Click on <a data-toggle='modal' href='#user-modal'> here </a> to see the list of corpora to which you have access.", "alert-success", "Added to corpus!");
        }
        for (var x in serverResults.user.newCorpusConnections) {
          if (_.pluck(serverResults.user.corpora, "dbname").indexOf(serverResults.user.newCorpusConnections[x].dbname) == -1) {
            serverResults.user.corpora.push(serverResults.user.newCorpusConnections[x]);
          }
        }
        delete serverResults.user.newCorpusConnections;
      }

      u.set(u.parse(serverResults.user)); //might take internal elements that are supposed to be a backbone model, and override them

      this.set("userPublic", this.get("userPrivate").get("userMask"));
      this.get("userPublic")._id = serverResults.user._id;
      this.get("userPublic").id = serverResults.user.id;
      this.get("userPublic").set("_id", serverResults.user._id);

      if (window.appView) {
        window.appView.associateCurrentUsersInternalModelsWithTheirViews();
      }

      /* Set up the pouch with the user's most recent connection if it has not already been set up */
      window.app.changePouch(serverResults.user.mostRecentIds.connection);

      this.get("userPublic").saveAndInterConnectInApp();

      OPrime.setCookie("username", serverResults.user.username, 365);
      OPrime.setCookie("token", serverResults.user.hash, 365);
      this.get("confidential").set("secretkey", serverResults.user.hash);
      this.saveAndEncryptUserToLocalStorage();
      if (typeof callbacksave == "function") {
        callbacksave(true); //tell caller that the user succeeded to authenticate
      }
      //    if(window.appView){
      //        if(! this.get("userPublic").id){
      //          this.get("userPublic").saveAndInterConnectInApp();
      //        }else{
      //          window.appView.addBackboneDoc(this.get("userPublic").id);
      //          window.appView.addPouchDoc(this.get("userPublic").id);
      //        }
      //      }
    },
    loadEncryptedUser: function(encryptedUserString, callbackload) {
      if (OPrime.debugMode) OPrime.debug("loadEncryptedUser");

      /*
       * If the encryptedUserString is not set, this triggers a
       * logout which triggers a login of the public user
       */
      if (!encryptedUserString) {
        this.logout();
        return;
      }
      /*
       * If there is currently no token to decrypt this user, log them out.
       */
      if (!localStorage.getItem("token")) {
        this.logout();
        return;
      }
      var userString = this.get("confidential").decrypt(encryptedUserString);
      if (userString.indexOf("confidential:") === 0) {
        this.logout();
        return;
      }
      /* Switch user to the new prod servers if they have the old ones */
      userString = userString.replace(/authdev\.fieldlinguist\.com:3183/g, "authdev\.lingsync\.org");
      userString = userString.replace(/iriscouch\.com/g, "lingsync\.org");
      userString = userString.replace(/pouchname/g, 'dbname');
      // userString = userString.replace(/activitydev\./g, "activity\.");
      // userString = userString.replace(/corpusdev\./g, "corpus\.");

      /*
       * For debugging cors #838: Switch to use the corsproxy
       * corpus service instead of couchdb directly
       */
      //      userString = userString.replace(/https/g,"http").replace(/6984/g,"3186");

      var u = JSON.parse(userString);
      var data = {};
      data.user = u;

      /* Upgrade chrome app user's to v1.38+ */
      data.user.appVersionWhenCreated = data.user.appVersionWhenCreated || "";
      if (data.user.appVersionWhenCreated && OPrime.isChromeApp() && !localStorage.getItem(data.user.username + "lastUpdatedAtVersion") && data.user.username != "public" && data.user.username != "lingllama") {
        var birthday = data.user.appVersionWhenCreated.replace("v", "").split(".");
        var year = birthday[0];
        var week = birthday[1];
        console.log("The app's week this user was created: ", birthday);
        if (year <= 1 && week <= 38) {
          console.log("No longer kicking the user out of the app, some users have to use the Prototype because it can handle more data than the Spreadsheet app.");
          // localStorage.setItem("username_to_update",data.user.username);
          // alert("Hi! Your account was created before version 1.38, taking you to the backup page to ensure that any offline data you have currently is upgraded to v1.38 and up.");
          // OPrime.redirect("backup_pouches.html");
          // return;
        }
      }

      this.saveServerResponseToUser(data, callbackload);
    },

    loadPublicUser: function(callbackload) {
      var mostRecentPublicUser = OPrime.publicUserStaleDetails();
      mostRecentPublicUser = mostRecentPublicUser.replace('pouchname', 'dbname');
      mostRecentPublicUser = JSON.parse(mostRecentPublicUser);
      for (var x in mostRecentPublicUser) {
        localStorage.setItem(x, mostRecentPublicUser[x]);
      }
      // OPrime.redirect("corpus.html");
    },

    savePublicUserForOfflineUse: function() {
      var mostRecentPublicUser = {
        token: "",
        username: ""
      };
      for (var x in mostRecentPublicUser) {
        mostRecentPublicUser[x] = localStorage.getItem(x);
      }
      mostRecentPublicUser[mostRecentPublicUser.username] = localStorage.getItem(mostRecentPublicUser.username);

      localStorage.setItem("mostRecentPublicUser", JSON.stringify(mostRecentPublicUser));
    },

    saveAndEncryptUserToLocalStorage: function(callbacksaved) {
      if (OPrime.debugMode) OPrime.debug("saveAndEncryptUserToLocalStorage");

      /* TODO Switch user to the new dev servers if they have the old ones */
      //      userString = userString.replace(/authdev.fieldlinguist.com:3183/g,"authdev.lingsync.org");
      //      userString = userString.replace(/ifielddevs.iriscouch.com/g,"corpusdev.lingsync.org");

      var u = this.get("confidential").encrypt(JSON.stringify(this.get("userPrivate").toJSON()));
      var username = this.get("userPrivate").get("username");
      localStorage.setItem(username, u);
      if (window.appView) {
        window.appView.addSavedDoc(this.get("userPrivate").id);
        //        window.appView.toastUser("Successfully saved user details.","alert-success","Saved!");
      }
      //Dont save the user public so often.
      //      this.get("userPublic").saveAndInterConnectInApp(callbacksaved);
      if (typeof callbacksaved == "function") {
        callbacksaved();
      }

    },
    saveAndInterConnectInApp: function(successcallback, failurecallback) {
      this.saveAndEncryptUserToLocalStorage(successcallback);
    },
    /**
     * This function uses the quick authentication view to get the user's
     * password and authenticate them. The authenticate process brings down the
     * user from the server, and also gets their sesson token from couchdb
     * before calling the callback.
     *
     * If there is no quick authentication view it takes them either to the user
     * page (in the ChromeApp) or the public user page (in a couchapp) where
     * they dont have to have a corpus token to see the data, and log in
     *
     * @param callback
     *          a success callback which is called once the user has been backed
     *          up to the server, and their couchdb session token is ready to be
     *          used to contact the database.
     * @param corpusdbname
     *          an optional corpus pouch name to redirect the user to if they
     *          end up geting kicked out of the corpus page
     */
    syncUserWithServer: function(callback, corpusdbname, cancelcallback) {
      if (!corpusdbname) {
        corpusdbname = "";
      }

      if (!window.appView) {
        return;
      }

      if (window.location.href.indexOf("corpus.html") > -1) {
        if (OPrime.isChromeApp()) {
          /* take them to the user page, they can log in there */
          return OPrime.redirect("user.html#login/" + corpusdbname);
        }

        /* take them to the public user page, they can log in there */
        if (OPrime.isCouchApp()) {
          return OPrime.redirect("user.html#login/" + corpusdbname);
        }

        return;
      }

      window.appView.authView.showQuickAuthenticateView(callback, cancelcallback, callback, cancelcallback);
    },
    fetchListOfUsersGroupedByPermissions: function(successcallback, failcallback) {
      var dataToPost = {};
      var authUrl = "";
      if (this.get("userPrivate") != undefined) {
        //Send username to limit the requests so only valid users can get a user list
        dataToPost.username = this.get("userPrivate").get("username");
        dataToPost.connection = window.app.get("corpus").get("connection");
        if (!dataToPost.connection.path) {
          dataToPost.connection.path = "";
          window.app.get("corpus").get("connection").path = "";
        }
        authUrl = FieldDB.Connection.defaultConnection(this.get("userPrivate").get("authUrl")).authUrl;
      } else {
        return;
      }
      var self = this;
      FieldDB.CORS.makeCORSRequest({
        type: 'POST',
        withCredentials: true,
        url: authUrl + "/corpusteam",
        data: dataToPost
      }).then(function(serverResults) {
        var userFriendlyErrors = serverResults.userFriendlyErrors || "";
        if (userFriendlyErrors) {
          window.appView.toastUser(userFriendlyErrors.join("<br/>"), "alert-warning", "Error connecting to populate corpus permissions:");
          if (typeof failcallback == "function") {
            failcallback(userFriendlyErrors.join("<br/>"));
          }
        } else if (serverResults.users != null) {
          if (typeof successcallback == "function") {
            serverResults.users.timestamp = Date.now();
            localStorage.setItem(dataToPost.dbname + "Permissions", JSON.stringify(serverResults.users));
            successcallback(serverResults.users);
          }
        }
      }, function(e) {
        if (OPrime.debugMode) OPrime.debug("Ajax failed, user might be offline (or server might have crashed before replying) (or server might have crashed before replying).", e);

        if (typeof failcallback == "function") {
          failcallback("There was an error in contacting the authentication server to get the list of users on your corpus team. Maybe you're offline?");
        }
      });
    },
    addCorpusRoleToUser: function(role, userToAddToCorpus, successcallback, failcallback) {
      var self = this;
      $("#quick-authenticate-modal").modal("show");
      if (this.get("userPrivate").get("username") == "lingllama") {
        $("#quick-authenticate-password").val("phoneme");
      }

      var subscription = function() {
        //prepare data and send it
        var dataToPost = {};
        var authUrl = "";
        if (this.get("userPrivate") != undefined) {
          //Send username to limit the requests so only valid users can get a user list
          dataToPost.username = this.get("userPrivate").get("username");
          dataToPost.password = $("#quick-authenticate-password").val();
          dataToPost.connection = window.app.get("corpus").get("connection");
          if (!dataToPost.connection.path) {
            dataToPost.connection.path = "";
            window.app.get("corpus").get("connection").path = "";
          }
          dataToPost.roles = [role];
          dataToPost.userToAddToRole = userToAddToCorpus.username;

          authUrl = FieldDB.Connection.defaultConnection(this.get("userPrivate").get("authUrl")).authUrl;
        } else {
          // failcallback();
          return;
        }
        FieldDB.CORS.makeCORSRequest({
          type: 'POST',
          withCredentials: true,
          url: authUrl + "/addroletouser",
          data: dataToPost
        }).then(function(serverResults) {
          if (serverResults.userFriendlyErrors != null) {
            if (OPrime.debugMode) OPrime.debug("User " + userToAddToCorpus.username + " not added to the corpus as " + role);
            if (typeof failcallback == "function") {
              failcallback(serverResults.userFriendlyErrors.join("<br/>"));
            }
          } else if (serverResults.roleadded != null) {
            if (OPrime.debugMode) OPrime.debug("User " + userToAddToCorpus.username + " added to the corpus as " + role);
            if (typeof successcallback == "function") {
              successcallback(userToAddToCorpus);
            }
          }
        }, function(e) {
          if (OPrime.debugMode) OPrime.debug("Ajax failed, user might be offline (or server might have crashed before replying).", e);

          if (typeof failcallback == "function") {
            failcallback("There was an error in contacting the authentication server to add " + userToAddToCorpus.username + " on your corpus team. Maybe you're offline?");
          }
        });
        //end send call

        //Close the modal
        $("#quick-authenticate-modal").modal("hide");
        $("#quick-authenticate-password").val("");
        window.hub.unsubscribe("quickAuthenticationClose", subscription, self);
      };
      window.hub.subscribe("quickAuthenticationClose", subscription, self);
    }

  });

  return Authentication;
});
