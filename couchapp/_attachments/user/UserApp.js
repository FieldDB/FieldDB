define([
    "backbone", 
    "authentication/Authentication", 
    "corpus/Corpus",
    "user/UserRouter",
    "confidentiality_encryption/Confidential",
    "user/User",
    "user/UserMask",
    "text!locales/en/messages.json",
    "libs/OPrime"
], function(
    Backbone, 
    Authentication, 
    Corpus,
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
      this.bind('error', function(model, error) {
        OPrime.debug("Error in App: " + error);
      });
      
      // If there's no authentication, create a new one
      if (!this.get("authentication")) {
        this.set("authentication", new Authentication());
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
      
    },
    addActivity : function(backBoneActivity) {
      OPrime.debug("There is no activity feed in the user app, not saving this activity.", backBoneActivity);
//      if (backBoneActivity.get("teamOrPersonal") == "team") {
//        window.app.get("currentCorpusTeamActivityFeed").addActivity(backBoneActivity);
//      } else {
//        window.app.get("currentUserActivityFeed").addActivity(backBoneActivity);
//      }
    },
    render: function(){
      $("#user-fullscreen").html("list of corpora goes here");
      return this;
    },
    router : UserRouter,
  });
  return UserApp;
});
