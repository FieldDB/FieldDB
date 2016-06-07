define([
  "app/App",
  "authentication/Authentication",
  "user/UserAppView",
  "user/UserRouter",
  "OPrime"
], function(
  App,
  Authentication,
  UserAppView,
  UserRouter

) {
  var UserApp = App.extend( /** @lends UserApp.prototype */ {
    /**
     * @class The UserApp handles the loading of the user page (login, welcome etc).
     *
     * @property {Authentication} authentication The auth member variable is an
     *           Authentication object permits access to the login and logout
     *           functions, and the database of users depending on whether the
     *           app is online or not. The authentication is the primary way to access the current user.
     *
     * @extends Backbone.Model
     * @constructs
     */
    fillWithDefaults: function() {
      // If there's no authentication, create a new one
      if (!this.get("authentication")) {
        this.set("authentication", new Authentication({
          filledWithDefaults: true
        }));
      }

      /*
       * Start the pub sub hub
       */
      if (!window.hub || typeof window.hub.subscribe !== "function") {
        window.hub = {};
        OPrime.makePublisher(window.hub);
      }

      /*
       * Check for user's cookie and the dashboard so we can load it
       */
      var username = OPrime.getCookie("username");
      if (username == null && username == "") {
        // new user, take them to the index which can handle new users.
        OPrime.redirect('corpus.html');
      }

      this.prepLocales();

      window.app = this;

      var appself = this;
      if (OPrime.debugMode) OPrime.debug("Loading user");
      var u = localStorage.getItem(username);
      // Support version > 4.6.5
      if (!u) {
        u = localStorage.getItem("encryptedUser");
      }
      if (!u) {
        OPrime.redirect("corpus.html");
        return;
      }
      appself.get("authentication").loadEncryptedUser(u, function(success, errors) {
        if (success == null) {
          //        alert("Bug: We couldn't log you in."+errors.join("\n") + " " + OPrime.contactUs);
          //        OPrime.setCookie("username","");
          //        OPrime.setCookie("token","");
          //        localStorage.removeItem("encryptedUser");
          //        OPrime.redirect('corpus.html');
          return;
        } else {
          window.appView = new UserAppView({
            model: appself
          });
          window.appView.render();
          appself.router = new UserRouter();
          Backbone.history.start();
        }
      });
    },

    /**
     * Smaller than the App version
     */
    addActivity: function(jsonActivity) {
      if (OPrime.debugMode) OPrime.debug("There is no activity feed in the user app, not saving this activity.", jsonActivity);
    },

    /**
     * Smaller than the App version
     */
    backUpUser: function(callback, cancelcallback) {
      var self = this;
      /* don't back up the public user, its not necessary the server doesn't modifications anyway. */
      if (self.get("authentication").get("userPrivate").get("username") == "public" || self.get("authentication").get("userPrivate").get("username") == "lingllama") {
        if (typeof callback == "function") {
          callback();
        }
        return;
      }
      //syncUserWithServer will prompt for password, then run the corpus replication.
      self.get("authentication").syncUserWithServer(function() {
        if (window.appView) {
          window.appView.toastUser("Backed up your user preferences with your authentication server, if you log into another device, your preferences will load.", "alert-info", "Backed-up:");
        }
        if (typeof callback == "function") {
          callback();
        }
      }, null, cancelcallback);
    },

    router: UserRouter,
  });
  return UserApp;
});
