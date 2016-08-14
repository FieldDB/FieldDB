/* globals OPrime, window, FieldDB, $, Locale */
define([
  "backbone",
  "libs/compiled_handlebars",
  "authentication/Authentication",
  "corpus/Corpus",
  "confidentiality_encryption/Confidential",
  "user/User",
  "user/UserMask",
  "user/UserReadView",
  "OPrime"
], function(
  Backbone,
  Handlebars,
  Authentication,
  Corpus,
  Confidential,
  User,
  UserMask,
  UserReadView
) {
  var AuthenticationEditView = Backbone.View.extend( /** @lends AuthenticationEditView.prototype */ {
    /**
     * @class This is the login logout surface.
     *
     * @description Starts the Authentication and initializes all its children.
     * This is where the dropdown menu for user related stuff is housed.
     *
     * @extends Backbone.View
     * @constructs
     */
    initialize: function() {
      if (OPrime.debugMode) OPrime.debug("AUTH EDIT init: " + this.el);

      //   Create a Small  UserReadView of the user's public info which will appear on the user drop down.
      this.userView = new UserReadView({
        model: this.model.get("userPublic")
      });
      this.userView.format = "link";
      this.userView.setElement($("#user-quickview"));

      // Any time the Authentication model changes, re-render
      this.model.bind("change:state", this.render, this);
      this.model.get("userPublic").bind("change", this.render, this);

      //save the version of the app into this view so we can use it when we create a user.
      var self = this;
      OPrime.getVersion(function(ver) {
        self.appVersion = ver;
        self.model.get("userPrivate").set("currentAppVersion", ver);
      });

    },

    /**
     * The underlying model of the AuthenticationEditView is an Authentication
     */
    model: Authentication,

    /**
     * The userView is a child of the AuthenticationEditView.
     */
    userView: UserReadView,

    /**
     * Events that the AuthenticationEditView is listening to and their handlers.
     */
    events: {
      "click .logout": "logout",
      "click .show-login-modal": function(e) {
        if (e) {
          e.stopPropagation();
          e.preventDefault();
        }
        $("#login_modal").modal("show");
      },

      "keyup .registerusername": function(e) {
        var code = e.keyCode || e.which;
        // code === 13 is the enter key
        if ((code === 13 || code === 9) && (this.$el.find(".registerusername").val().trim() !== "YourNewUserNameGoesHere")) {
          this.$el.find(".potentialUsername").html($(".registerusername").val().trim());
          this.$el.find(".confirm-password").show();
          this.$el.find(".registerpassword").focus();
          $(".register-new-user").removeAttr("disabled");
        }
      },
      "click .new-user-button": function(e) {
        if (e) {
          e.stopPropagation();
          e.preventDefault();
        }
        if (this.$el.find(".registerusername").val().trim() !== "YourNewUserNameGoesHere") {
          this.$el.find(".potentialUsername").html($(".registerusername").val().trim());
          this.$el.find(".confirm-password").show();
          this.$el.find(".registerpassword").focus();
        }
      },
      "click .register-new-user": "registerNewUser",
      "click .register-twitter": function() {
        window.location.href = OPrime.authUrl + "/auth/twitter";
      },
      "click .register-facebook": function() {
        window.location.href = OPrime.authUrl + "/auth/facebook";
      },
      "click .sync-lingllama-data": function(e) {
        if (e) {
          e.stopPropagation();
          e.preventDefault();
        }
        if (OPrime.debugMode) OPrime.debug("hiding user welcome, syncing lingllama");
        this.loginUserAndRedirectToCorpusDashboard("lingllama", "phoneme", OPrime.authUrl);
      },
    },

    /**
     * The Handlebars template rendered as the AuthenticationEditView.
     */
    template: Handlebars.templates.authentication_edit_embedded,
    userTemplate: Handlebars.templates.user_read_link,

    /**
     * Renders the AuthenticationEditView and all of its child Views.
     */
    render: function() {
      if (OPrime.debugMode) OPrime.debug("AUTH EDIT render: " + this.el);
      if (this.model === undefined) {
        if (OPrime.debugMode) OPrime.debug("Auth model was undefined, come back later.");
        return this;
      }

      if (this.model.get("userPublic") !== undefined) {
        this.model.set("gravatar", this.model.get("userPublic").getGravatar());
        this.model.set("username", this.model.get("userPublic").get("username"));
      }

      var jsonToRender = this.model.toJSON();
      //localization
      jsonToRender.locale_An_offline_online_fieldlinguistics_database = Locale.get("locale_An_offline_online_fieldlinguistics_database");
      jsonToRender.locale_Close_and_login_as_LingLlama = Locale.get("locale_Close_and_login_as_LingLlama");
      jsonToRender.locale_Close_and_login_as_LingLlama_Tooltip = Locale.get("locale_Close_and_login_as_LingLlama_Tooltip");
      jsonToRender.locale_Password = Locale.get("locale_Password");
      jsonToRender.locale_Confirm_Password = Locale.get("locale_Confirm_Password");
      jsonToRender.locale_Corpus_Settings = Locale.get("locale_Corpus_Settings");
      jsonToRender.locale_Create_a_new_user = Locale.get("locale_Create_a_new_user");
      jsonToRender.locale_Keyboard_Shortcuts = Locale.get("locale_Keyboard_Shortcuts");
      jsonToRender.locale_Log_In = Locale.get("locale_Log_In");
      jsonToRender.locale_Log_Out = Locale.get("locale_Log_Out");
      jsonToRender.locale_New_User = Locale.get("locale_New_User");
      jsonToRender.locale_Private_Profile = Locale.get("locale_Private_Profile");
      jsonToRender.locale_Sign_in_with_password = Locale.get("locale_Sign_in_with_password");
      jsonToRender.locale_Terminal_Power_Users = Locale.get("locale_Terminal_Power_Users");
      jsonToRender.locale_User_Settings = Locale.get("locale_User_Settings");

      // Display the AuthenticationEditView
      this.setElement($("#authentication-embedded"));
      $(this.el).html(this.template(jsonToRender));

      if (this.model.get("state") === "renderLoggedIn") {
        $("#logout").show();
        $("#login_form").hide();
        $("#login_register_button").hide();

        if (this.model.get("userPublic") !== undefined) {
          if (OPrime.debugMode) OPrime.debug("\t rendering AuthenticationEditView's UserView");
          this.userView.setElement($("#user-quickview"));
          this.userView.render();
        } else {
          $("#user-quickview").html("<i class=\"icons icon-user icon-white\">");
        }

      } else {
        $("#logout").hide();
        $("#login_form").show();
        $("#login_register_button").show();
        $("#loggedin_customize_on_auth_dropdown").hide();

        if (this.model.get("userPublic") !== undefined) {
          if (OPrime.debugMode) OPrime.debug("\t rendering AuthenticationEditView's UserView");
          this.userView.setElement($("#user-quickview"));
          this.userView.render();
        } else {
          $("#user-quickview").html("<i class=\"icons icon-user icon-white\">");
        }

        var mostLikelyAuthUrl = FieldDB.Connection.defaultConnection().userFriendlyServerName;
        $(".welcomeauthurl").val(mostLikelyAuthUrl);

      }

      return this;
    },

    /**
     * Logout backs up the user to the central server and then
     * removes the stringified user and the username from local
     * storage, and then authenticates public into the app.
     */
    logout: function(e) {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
      var authself = this.model;
      $(".reason_why_we_need_to_make_sure_its_you").html("You should back up your preferences before you log out. ");
      this.loggingOut = true;
      window.app.backUpUser(function() {
        authself.logout();
      }, function() {
        authself.logout();
      });
    },

    /**
     * Notes: LingLlama's user comes from his time after his PhD and before his
     * foray into the industry. This is when he started getting some results for
     * "phoneme" around 1910. For a similar use of historical users see Morgan
     * Blamey and Tucker the Technician at blamestella.com
     * https://twitter.com/#!/tucker1927
     */
    loadSample: function() {
      //  alert("loading sample");

    },

    /**
     * Authenticate accepts a username and password, creates a simple user, and
     * passes that user to the authentication module for real authentication
     * against a server or local database. The Authenticate function also sends a
     * callback which will render views once the authentication server has
     * responded. If the authentication result is null, it can flash an error to
     * the user and then logs in as public.
     *
     * @param username {String} The username to authenticate.
     * @param password {String} The password to authenticate.
     */
    authenticate: function(username, password, authUrl, successCallback, failCallback, corpusLoginSuccessCallback, corpusloginfailCallback) {
      if (!successCallback && corpusLoginSuccessCallback) {
        successCallback = corpusLoginSuccessCallback;
      }
      if (!failCallback && corpusloginfailCallback) {
        failCallback = corpusloginfailCallback;
      }

      // Temporarily keep the given's credentials
      var tempuser = new User({
        username: username,
        password: password,
        authUrl: FieldDB.Connection.defaultConnection(authUrl).authUrl
      });
      var self = this;

      this.model.authenticate(tempuser, function(success) {
        if (success === null) {
          //          alert("Authentication failed. Authenticating as public."); //TODO cant use this anymore as a hook
          //          self.authenticateAsPublic();
          return;
        }

        if (self.loggingOut) {
          if (typeof successCallback === "function") {
            successCallback();
          }
          return;
        }

        if (username === "public") {
          self.model.savePublicUserForOfflineUse();
        }
        var connection;
        if (self.model.get("userPrivate").get("mostRecentIds") && self.model.get("userPrivate").get("mostRecentIds").connection) {
          connection = self.model.get("userPrivate").get("mostRecentIds").connection;
        }
        if (!connection) {
          connection = self.model.get("userPrivate").get("corpora")[0];
        }
        if (!connection) {
          connection = FieldDB.Connection.defaultConnection();
        }
        // Dont set to most recent, it might not be the most recent.
        // if (self.model.get("userPrivate").get("mostRecentIds") && self.model.get("userPrivate").get("mostRecentIds").connection) {
        //   connection = self.model.get("userPrivate").get("mostRecentIds").connection;
        // }

        //Replicate user's corpus down to pouch
        window.app.replicateOnlyFromCorpus(connection, function() {
          if (self.model.get("userPrivate").get("mostRecentIds") === undefined) {
            //do nothing because they have no recent ids
            alert("Bug: User does not have most recent ids, Cant show your most recent dashbaord.");
            window.location.href = "#render/true";
            return;
          }

          /*
           *  Load their last corpus, session, datalist etc,
           *  only if it is not the ones already most recently loaded.
           */
          var appids = self.model.get("userPrivate").get("mostRecentIds") || {};
          var visibleids = {};
          if (window.app.get("corpus")) {
            visibleids.corpusid = window.app.get("corpus").id;
          } else {
            visibleids.corpusid = "";
          }
          if (window.app.get("currentSession")) {
            visibleids.sessionid = window.app.get("currentSession").id;
          } else {
            visibleids.sessionid = "";
          }
          if (window.app.get("currentDataList")) {
            visibleids.datalistid = window.app.get("currentDataList").id;
          } else {
            visibleids.datalistid = "";
          }
          if ((appids.sessionid !== visibleids.sessionid || appids.corpusid !== visibleids.corpusid || appids.datalistid !== visibleids.datalistid)) {
            if (OPrime.debugMode) OPrime.debug("Calling loadBackboneObjectsByIdAndSetAsCurrentDashboard in AuthenticationEditView");
            if (window.app.loadBackboneObjectsByIdAndSetAsCurrentDashboard) {
              window.app.loadBackboneObjectsByIdAndSetAsCurrentDashboard(appids);
            } else {
              if (OPrime.debugMode) OPrime.debug("Trying to fetch the corpus and redirect you to the corpus dashboard.");
              window.app.router.showCorpusDashboard(connection.dbname, appids.corpusid);
            }
          }
        });

        var renderLoggedInStateDependingOnPublicUserOrNot = "renderLoggedIn";
        if (self.model.get("userPrivate").get("username") === "public") {
          renderLoggedInStateDependingOnPublicUserOrNot = "renderLoggedOut";
        }
        // Save the authenticated user in our Models
        self.model.set({
          gravatar: self.model.get("userPrivate").get("gravatar"),
          username: self.model.get("userPrivate").get("username"),
          state: renderLoggedInStateDependingOnPublicUserOrNot
        });
        if (typeof successCallback === "function") {
          successCallback();
        }
      }, failCallback);
    },

    /**
     * ShowQuickAuthentication view popups up a password entry view.
     * This is used to unlock confidential datum, or to unlock dangerous settings
     * like removing a corpus. It is also used if the user hasn't confirmed their
     * identity in a while.
     */
    showQuickAuthenticateView: function(authsuccesscallback, authFailureCallback, corpusLoginSuccessCallback, corpusloginfailCallback) {
      if (window.askingUserToConfirmIdentity) {
        return;
      }
      window.askingUserToConfirmIdentity = true;

      var self = this;
      var authUrl = window.app.get("authentication").get("userPrivate").get("authUrl");
      var username = window.app.get("authentication").get("userPrivate").get("username");
      var subscription = function(password) {
        if (password === "cancel") {
          if (typeof authFailureCallback === "function") {
            authFailureCallback();
          }
          return;
        }
        window.appView.authView.authenticate(username, password, FieldDB.Connection.defaultConnection(authUrl).authUrl, authsuccesscallback, authFailureCallback, corpusLoginSuccessCallback, corpusloginfailCallback);
        window.hub.unsubscribe("quickAuthenticationClose", subscription, self);
        setTimeout(function() {
          window.askingUserToConfirmIdentity = false;
        }, 2000);
      };

      if (username === "public") {
        / * Dont show the quick auth, just authenticate */
        window.appView.authView.authenticate("public", "none", FieldDB.Connection.defaultConnection(authUrl).authUrl, authsuccesscallback, authFailureCallback, corpusLoginSuccessCallback, corpusloginfailCallback);
        setTimeout(function() {
          window.askingUserToConfirmIdentity = false;
        }, 2000);
        return;
      }

      if (username === "lingllama") {
        /* Show the quick auth but fill in the password, to simulate a user */
        $("#quick-authenticate-password").val("phoneme");
        $("#quick-authenticate-modal").modal("show");
        window.hub.subscribe("quickAuthenticationClose", subscription, self);
        return;
      }

      $("#quick-authenticate-modal").modal("show");
      window.hub.subscribe("quickAuthenticationClose", subscription, self);
    },

    registerNewUser: function(e) {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }

      $(".register-new-user").attr("disabled", "disabled");

      var authedself = this;
      var dataToPost = {
        username: $(".registerusername").val().trim(),
        password: $(".registerpassword").val().trim(),
        confirmPassword: $(".to-confirm-password").val().trim(),
        email: $(".registeruseremail").val().trim()
      };

      var renderProgress = function() {
        $(".welcome-screen-alerts").html("<p><strong>Please wait:</strong> Contacting the server to prepare your first corpus/database for you...</p> <progress max='100'> <strong>Progress: working...</strong>");
        $(".welcome-screen-alerts").addClass("alert-success");
        $(".welcome-screen-alerts").show();
        $(".welcome-screen-alerts").removeClass("alert-error");
        $(".register-new-user").addClass("disabled");
        $(".register-new-user").attr("disabed", "disabled");
        window.app.showSpinner();
        window.app.router.hideEverything();
        $(".spinner-status").html("Contacting the server...");
      };

      var renderError = function(reason) {
        var message = " Something went wrong, that's all we know. Please try again or report this to us if it does it again:  " + OPrime.contactUs;
        if (reason.userFriendlyErrors) {
          message = reason.userFriendlyErrors.join("<br/>");
        }
        if (OPrime.debugMode) OPrime.debug("Error registering user", reason);

        // put validated username in the form
        if (reason.details && reason.detailsreason.details.username) {
          $(".registerusername").val(reason.details.username);
        }

        $(".welcome-screen-alerts").html(message);
        $(".welcome-screen-alerts").addClass("alert-error");
        $(".welcome-screen-alerts").removeClass("alert-success");
        $(".welcome-screen-alerts").show();
        $(".register-new-user").removeClass("disabled");
        $(".register-new-user").removeAttr("disabled");
        authedself.registering = false;
        window.app.stopSpinner();
        $(".spinner-status").html("");
      };

      var renderStatus = function(status) {
        $(".spinner-status").html(status);
      };

      var successCallback = function(corpus) {
        window.setTimeout(function() {
          OPrime.redirect("user.html#/corpus/" + corpus.dbname + "/" + corpus.id);
        }, 1000);
      };

      if (OPrime.debugMode) OPrime.debug("sending ", dataToPost);
      this.model.register(dataToPost, successCallback, renderError, renderProgress, renderStatus);
    },

    /**
     * This function manages all the data flow from the auth server and
     * corpus server to get the app to load in the right order so that
     * all the models and views are loaded, and tied together
     *
     * @param username
     * @param password
     */
    loginUserAndRedirectToCorpusDashboard: function(username, password, authUrl) {
      if (OPrime.debugMode) OPrime.debug("hiding user login, syncing users data");
      var dataToPost = {
        username: username,
        password: password
      };
      var appConnection = FieldDB.Connection.defaultConnection(authUrl);
      dataToPost.authUrl = appConnection.authUrl;

      $(".welcome-screen-alerts").html("<p><strong>Please wait:</strong> Contacting the server...</p> <progress max='100'> <strong>Progress: working...</strong>");
      $(".welcome-screen-alerts").addClass("alert-success");
      $(".welcome-screen-alerts").removeClass("alert-error");
      $(".welcome-screen-alerts").show();

      /*
       * Login as a different user
       */
      this.model.fielddbModel = this.model.fielddbModel || new FieldDB.Authentication();
      delete this.model.fielddbModel.user;

      this.model.fielddbModel.login(dataToPost).then(function(fielddbUser) {
        // Set the app serverLabel to the server the user logged into
        localStorage.setItem("serverLabel", appConnection.serverLabel);

        $(".welcome-screen-alerts").html("Attempting to sync your data to this device...</p> <progress max='100'> <strong>Progress: working...</strong>");
        $(".welcome-screen-alerts").show();

        var auth = new Authentication({
          filledWithDefaults: true
        });
        /*
         * Redirect the user to their user page, being careful to use their most recent database if they are in a couchapp (not the database they used to login to this corpus)
         */
        if (!fielddbUser.mostRecentIds || !fielddbUser.mostRecentIds.connection && fielddbUser.corpora && fielddbUser.corpora.length) {
          fielddbUser.mostRecentIds = {
            connection: fielddbUser.corpora._collection[0]
          };
        }
        if (!fielddbUser.mostRecentIds || !fielddbUser.mostRecentIds.connection) {
          alert("I don't know which corpus to log you into. You could try reloading this page or contacting us");
          return OPrime.redirect("user.html");
        }
        auth.set("userPrivate", new User(fielddbUser.toJSON()));
        OPrime.setCookie("username", fielddbUser.username, 365);
        OPrime.setCookie("token", fielddbUser.hash, 365);
        auth.get("confidential").set("secretkey", fielddbUser.hash);
        var u = auth.get("confidential").encrypt(JSON.stringify(auth.get("userPrivate").toJSON()));
        localStorage.setItem(username, u);

        OPrime.redirect("corpus.html");
      }, function(reason) {
        var message = " Something went wrong, that's all we know. Please try again or report this to us if it does it again:  " + OPrime.contactUs;
        if (reason.userFriendlyErrors) {
          message = reason.userFriendlyErrors.join("<br/>");
        }

        if (OPrime.debugMode) OPrime.debug("Error syncing user", reason);
        $(".welcome-screen-alerts").html(message);
        $(".welcome-screen-alerts").addClass("alert-error");
        $(".welcome-screen-alerts").removeClass("alert-success");
        $(".welcome-screen-alerts").show();
      });

    }
  });

  return AuthenticationEditView;
});
