define([
    "underscore",
    "backbone",
    "bootstrap",
    "libs/backbone_couchdb/backbone-couchdb",
    "handlebars",
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
    _,
    Backbone,
    bootstrap,
    backbonecouch,
    Handlebars,
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
        window.location.replace('corpus.html');
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
        window.location.replace("corpus.html");
        return;
      }
      appself.get("authentication").loadEncryptedUser(u, function(success, errors){
        if(success == null){
//        alert("Bug: We couldn't log you in."+errors.join("\n") + " " + OPrime.contactUs);
//        OPrime.setCookie("username","");
//        OPrime.setCookie("token","");
//        localStorage.removeItem("encryptedUser");
//        window.location.replace('corpus.html');
          return;
        }else{
          window.appView = new UserAppView({model: appself});
          window.appView.render();
          appself.router = new UserRouter();
          Backbone.history.start();
        }
      });
    },
    showSpinner : function(){
        $('#dashboard_loading_spinner').html("<img class='spinner-image' src='images/loader.gif'/><p class='spinner-status'>Loading dashboard...</p>");
        $('.spinner-image').css({
          'width' : function() {
            return ($(document).width() * .1 ) + 'px';
          },
          'height' : function() {
            return ($(document).width() * .1 ) + 'px';
          },
          'padding-top': '10em'
        });
    },
    stopSpinner : function(){
      $('#dashboard_loading_spinner').html("");
    },
    getCouchUrl : function(couchConnection, couchdbcommand) {
      if(!couchConnection){
        couchConnection = this.get("couchConnection");
        if (OPrime.debugMode) OPrime.debug("Using the apps ccouchConnection", couchConnection);
      }else{
        if (OPrime.debugMode) OPrime.debug("Using the couchConnection passed in,",couchConnection,this.get("couchConnection"));
      }
      if(!couchConnection){
        OPrime.bug("The couch url cannot be guessed. It must be provided by the App. Please report this bug.");
      }
      return OPrime.getCouchUrl(couchConnection, couchdbcommand);
    },
    /*
     * This will be the only time the app should open the pouch.
     */
    changePouch : function(couchConnection, callback) {
      if (!couchConnection || couchConnection == undefined) {
        console.log("App.changePouch couchConnection must be supplied.");
        return;
      } else {
        console.log("App.changePouch setting couchConnection: ", couchConnection);
        this.set("couchConnection", couchConnection);
      }
//      alert("TODO set/validate that the the backone couchdb connection is the same as what user is asking for here");
      $.couch.urlPrefix = OPrime.getCouchUrl(window.app.get("couchConnection"),"");

      if(OPrime.isChromeApp()){
        Backbone.couch_connector.config.base_url = this.getCouchUrl(couchConnection,"");
        Backbone.couch_connector.config.db_name = couchConnection.pouchname;
      }else{
        /* If the user is not in a chrome extension, the user MUST be on a url that corresponds with their corpus */
        try{
          var pieces = window.location.pathname.replace(/^\//,"").split("/");
          var pouchName = pieces[0];
          //Handle McGill server which runs out of a virtual directory
          if(pouchName == "corpus"){
            pouchName = pieces[1];
          }
          Backbone.couch_connector.config.db_name = pouchName;
        }catch(e){
          OPrime.bug("Couldn't set the databse name off of the url, please report this.");
        }
      }

      if(typeof callback == "function"){
        callback();
      }
      return;

      alert("TODO set/validate that the the pouch connection");
      if (this.pouch == undefined) {
        // this.pouch = Backbone.sync.pouch("https://localhost:6984/"
        // + couchConnection.pouchname);
        this.pouch = Backbone.sync
        .pouch(OPrime.isAndroidApp() ? OPrime.touchUrl
            + couchConnection.pouchname : OPrime.pouchUrl
            + couchConnection.pouchname);
      }
      if (typeof callback == "function") {
        callback();
      }
    },
    /*
     * This will be the only time the app should open the pouch.
     */
    changePouchDeprecated : function(couchConnection, callback) {
      if (!couchConnection || couchConnection == undefined) {
        console.log("App.changePouch couchConnection must be supplied.");
        return;
      } else {
        console.log("App.changePouch setting couchConnection: ", couchConnection);
        this.set("couchConnection", couchConnection);
      }

      if(OPrime.isBackboneCouchDBApp()){
        if(typeof callback == "function"){
          callback();
        }
        return;
      }

      if (this.pouch == undefined) {
        // this.pouch = Backbone.sync.pouch("https://localhost:6984/"
        // + couchConnection.pouchname);
        this.pouch = Backbone.sync
        .pouch(OPrime.isAndroidApp() ? OPrime.touchUrl
            + couchConnection.pouchname : OPrime.pouchUrl
            + couchConnection.pouchname);
      }
      if (typeof callback == "function") {
        callback();
      }
    },
    addActivity : function(jsonActivity) {
      if (OPrime.debugMode) OPrime.debug("There is no activity feed in the user app, not saving this activity.", jsonActivity);
//    if (backBoneActivity.get("teamOrPersonal") == "team") {
//    window.app.get("currentCorpusTeamActivityFeed").addActivity(backBoneActivity);
//    } else {
//    window.app.get("currentUserActivityFeed").addActivity(backBoneActivity);
//    }
    },
    backUpUser : function(callback){
      var self = this;
      /* don't back up the public user, its not necessary the server doesn't modifications anyway. */
      if(self.get("authentication").get("userPrivate").get("username") == "public" || self.get("authentication").get("userPrivate").get("username") == "lingllama"){
        if(typeof callback == "function"){
          callback();
        }
      }
      //syncUserWithServer will prompt for password, then run the corpus replication.
      self.get("authentication").syncUserWithServer(function(){
        if(typeof callback == "function"){
          callback();
        }
      });
    },
    /**
     * Log the user into their corpus server automatically using cookies and post so that they can replicate later.
     * "http://localhost:5984/_session";
     *
     * References:
     * http://guide.couchdb.org/draft/security.html
     *
     * @param username this can come from a username field in a login, or from the User model.
     * @param password this comes either from the UserWelcomeView when the user logs in, or in the quick authentication view.
     * @param callback A function to call upon success, it receives the data back from the post request.
     */
    logUserIntoTheirCorpusServer : function(couchConnection, username,
        password, succescallback, failurecallback) {
      if (couchConnection == null || couchConnection == undefined) {
        couchConnection = this.get("couchConnection");
      }
      if (couchConnection == null || couchConnection == undefined) {
        alert("Bug: I couldnt log you into your couch database.");
      }

      /* if on android, turn on replication and don't get a session token */
      if(OPrime.isTouchDBApp()){
        Android.setCredentialsAndReplicate(couchConnection.pouchname,
            username, password, couchConnection.domain);
        OPrime
        .debug("Not getting a session token from the users corpus server " +
        "since this is touchdb on android which has no idea of tokens.");
        if (typeof succescallback == "function") {
          succescallback();
        }
        return;
      }

      var couchurl = this.getCouchUrl(couchConnection, "/_session");
      var corpusloginparams = {};
      corpusloginparams.name = username;
      corpusloginparams.password = password;
      if (OPrime.debugMode) OPrime.debug("Contacting your corpus server ", couchConnection, couchurl);

      var appself = this;
      $.couch.login({
        name: username,
        password: password,
        success : function(serverResults) {
          if (window.appView) {
            window.appView
            .toastUser(
                "I logged you into your team server automatically, your syncs will be successful.",
                "alert-info", "Online Mode:");
          }
          // appself.get("authentication").get("userPrivate").updateListOfCorpora(serverResults.roles);


          /* if in chrome extension, or offline, turn on replication */
          if(OPrime.isChromeApp()){
            //TODO turn on pouch and start replicating and then redirect user to their user page(?)
//            appself.replicateContinuouslyWithCouch();
          }

          if (typeof succescallback == "function") {
            succescallback(serverResults);
          }
        },
        error : function(serverResults) {
          window
          .setTimeout(
              function() {
                //try one more time 5 seconds later
                $.couch.login({
                  name: username,
                  password: password,
                  success : function(serverResults) {
                    if (window.appView) {
                      window.appView
                      .toastUser(
                          "I logged you into your team server automatically, your syncs will be successful.",
                          "alert-info", "Online Mode:");
                    }
                    /* if in chrome extension, or offline, turn on replication */
                    if(OPrime.isChromeApp()){
                      //TODO turn on pouch and start replicating and then redirect user to their user page(?)
//                      appself.replicateContinuouslyWithCouch();
                    }

                    if (typeof succescallback == "function") {
                      succescallback(serverResults);
                    }
                  },
                  error : function(serverResults) {
                    if (window.appView) {
                      window.appView
                      .toastUser(
                          "I couldn't log you into your corpus. What does this mean? "
                          + "This means you can't upload data to train an auto-glosser or visualize your morphemes. "
                          + "You also can't share your data with team members. If your computer is online and you are"
                          + " using the Chrome Store app, then this probably the side effect of a bug that we might not know about... please report it to us :) "
                          + OPrime.contactUs
                          + " If you're offline you can ignore this warning, and sync later when you're online. ",
                          "alert-danger",
                      "Offline Mode:");
                    }
                    if (typeof failurecallback == "function") {
                      failurecallback("I couldn't log you into your corpus.");
                    }
                    if (OPrime.debugMode) OPrime.debug(serverResults);
                    window.app.get("authentication").set(
                        "staleAuthentication", true);
                  }
                });
              }, 5000);
        }
      });
    },
    /* TODO decide if we want this here once the pouch is ready */
    //replicateOnlyFromCorpus
    /**
     * Pull down corpus to offline pouch, if its there.
     */
    replicateOnlyFromCorpus : function(couchConnection, successcallback, failurecallback) {
      var self = this;

      if(!self.pouch){
        if (OPrime.debugMode) OPrime.debug("Not replicating, no pouch ready.");
        if(typeof successcallback == "function"){
          successcallback();
        }
        return;
      }

      self.pouch(function(err, db) {
        var couchurl = self.getCouchUrl();
        if (err) {
          if (OPrime.debugMode) OPrime.debug("Opening db error", err);
          if (typeof failurecallback == "function") {
            failurecallback();
          } else {
            alert('Opening DB error' + JSON.stringify(err));
            if (OPrime.debugMode) OPrime.debug('Opening DB error'
                + JSON.stringify(err));
          }
        } else {
          db.replicate.from(couchurl, { continuous: false }, function(err, response) {
            if (OPrime.debugMode) OPrime.debug("Replicate from " + couchurl,response, err);
            if(err){
              if(typeof failurecallback == "function"){
                failurecallback();
              }else{
                alert('Corpus replicate from error' + JSON.stringify(err));
                if (OPrime.debugMode) OPrime.debug('Corpus replicate from error' + JSON.stringify(err));
              }
            }else{
              if (OPrime.debugMode) OPrime.debug("Corpus replicate from success", response);
              if(typeof successcallback == "function"){
                successcallback();
              }
            }
          });
        }
      });
    },
    /**
     * Log the user into their corpus server automatically using cookies and post so that they can replicate later.
     * "http://localhost:5984/_session";
     *
     * References:
     * http://guide.couchdb.org/draft/security.html
     *
     * @param username this can come from a username field in a login, or from the User model.
     * @param password this comes either from the UserWelcomeView when the user logs in, or in the quick authentication view.
     * @param callback A function to call upon success, it receives the data back from the post request.
     */
    logUserIntoTheirCorpusServerDeprecated : function(couchConnection, username, password, succescallback, failurecallback) {
      if(couchConnection == null || couchConnection == undefined){
        couchConnection = this.get("couchConnection");
      }

      /* if on android, turn on replication and dont get a session token */
      if(OPrime.isTouchDBApp()){
        Android.setCredentialsAndReplicate(couchConnection.pouchname,
            username, password, couchConnection.domain);
        OPrime
        .debug("Not getting a session token from the users corpus server " +
            "since this is touchdb on android which has no rights on iriscouch, and also has no tokens.");
        if (typeof succescallback == "function") {
          succescallback();
        }
        return;
      }

      var couchurl = OPrime.getCouchUrl(couchConnection, "/_session");

      var corpusloginparams = {};
      corpusloginparams.name = username;
      corpusloginparams.password = password;

      $.couch.login({
        name: username,
        password: password,
        success : function(serverResults) {
          if(window.appView){
            window.appView.toastUser("I logged you into your team server automatically, your syncs will be successful.", "alert-info","Online Mode:");
          }

          /* if in chrome extension, or offline, turn on replication */
          if(OPrime.isChromeApp()){
            //TODO turn on pouch and start replicating and then redirect user to their user page(?)
          }

          if (typeof succescallback == "function") {
            succescallback(serverResults);
          }
        },
        error : function(serverResults){
          window.setTimeout(function(){
            //try one more time 5 seconds later
            $.couch.login({
              name: username,
              password: password,
              success : function(serverResults) {
                if(window.appView){
                  window.appView.toastUser("I logged you into your team server automatically, your syncs will be successful.", "alert-info","Online Mode:");
                }
                if (typeof succescallback == "function") {
                  succescallback(serverResults);
                }
              },
              error : function(serverResults){
                if(window.appView){
                  window.appView.toastUser("I couldn't log you into your corpus. What does this mean? " +
                      "This means you can't upload data to train an auto-glosser or visualize your morphemes. " +
                      "You also can't share your data with team members. If your computer is online and you are" +
                      " using the Chrome Store app, then this probably the side effect of a bug that we might not know about... please report it to us :) " +OPrime.contactUs+
                      " If you're offline you can ignore this warning, and sync later when you're online. ","alert-danger","Offline Mode:");
                }
                if (typeof failurecallback == "function") {
                  failurecallback("I couldn't log you into your corpus.");
                }
                if (OPrime.debugMode) OPrime.debug(serverResults);
                window.app.get("authentication").set("staleAuthentication", true);
              }
            });
          }, 5000);
        }
      });
    },
    saveAndInterConnectInApp : function(callback){
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
