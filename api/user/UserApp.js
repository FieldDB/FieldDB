define([
    "backbone",
    "authentication/Authentication",
    "corpus/Corpus",
    "user/UserAppView",
    "user/UserRouter",
    "confidentiality_encryption/Confidential",
    "user/User",
    "user/UserMask",
    "text!locales/en/messages.json",
    "OPrime"
], function(
    Backbone,
    Authentication,
    Corpus,
    UserAppView,
    UserRouter,
    Confidential,
    User,
    UserMask,
    LocaleData

) {
  var UserApp = Backbone.Model.extend(
  /** @lends UserApp.prototype */
  {
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
    initialize : function() {
      if (OPrime.debugMode) OPrime.debug("USERAPP INIT");

      if(this.get("filledWithDefaults")){
        this.fillWithDefaults();
        this.unset("filledWithDefaults");
      }
    },
    fillWithDefaults : function(){
      // If there's no authentication, create a new one
      if (!this.get("authentication")) {
        this.set("authentication", new Authentication({filledWithDefaults: true}));
      }

      /*
       * Start the pub sub hub
       */
      window.hub = {};
      OPrime.makePublisher(window.hub);

      /*
       * Check for user's cookie and the dashboard so we can load it
       */
      var username = OPrime.getCookie("username");
      if (username == null && username == "") {
        // new user, take them to the index which can handle new users.
        window.location.replace('index.html');
      }
      window.Locale = {};
      window.Locale.get = function(message) {
        return window.Locale.data[message].message;
      };
      if (LocaleData) {
        window.Locale.data = JSON.parse(LocaleData);
      } else {
        console.log("Locales did not load.");
        window.Locale.get = function(message) {
          return "";
        };
      }

      window.app = this;
      var appself = this;
      if (OPrime.debugMode) OPrime.debug("Loading user");
      var u = localStorage.getItem("encryptedUser");
      if(!u){
        window.location.replace("index.html");
        return;
      }
      appself.get("authentication").loadEncryptedUser(u, function(success, errors){
        if(success == null){
//        alert("Bug: We couldn't log you in."+errors.join("\n") + " " + OPrime.contactUs);
//        OPrime.setCookie("username","");
//        OPrime.setCookie("token","");
//        localStorage.removeItem("encryptedUser");
//        window.location.replace('index.html');
          return;
        }else{
          window.appView = new UserAppView({model: appself});
          window.appView.render();
          appself.router = new UserRouter();
          Backbone.history.start();
        }
      });
    },

    addActivity : function(jsonActivity) {
      if (OPrime.debugMode) OPrime.debug("There is no activity feed in the user app, not saving this activity.", jsonActivity);
//    if (backBoneActivity.get("teamOrPersonal") == "team") {
//    window.app.get("currentCorpusTeamActivityFeed").addActivity(backBoneActivity);
//    } else {
//    window.app.get("currentUserActivityFeed").addActivity(backBoneActivity);
//    }
    },

    save : function(callback){
      if(typeof callback == "function"){
        callback();
      }
    },

    render: function(){
      $("#user-fullscreen").html("list of corpora goes here");
      return this;
    },
    router : UserRouter,
  });
  return UserApp;
});
