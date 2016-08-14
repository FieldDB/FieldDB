/* globals FieldDB, OPrime, window, console */
define(
  ["backbone",
    "libs/compiled_handlebars",
    "app/AppView",
    "user/UserApp",
    "user/UserRouter",
    "authentication/Authentication",
    "authentication/AuthenticationEditView",
    "corpus/Corpus",
    "corpus/CorpusMask",
    "hotkey/HotKey",
    "hotkey/HotKeyEditView",
    "user/UserPreference",
    "user/UserPreferenceEditView",
    "user/User",
    "user/UserEditView",
    "user/UserReadView",
    "OPrime"
  ],
  function(
    Backbone,
    Handlebars,
    AppView,
    UserApp,
    UserRouter,
    Authentication,
    AuthenticationEditView,
    Corpus,
    CorpusMask,
    HotKey,
    HotKeyEditView,
    UserPreference,
    UserPreferenceEditView,
    User,
    UserEditView,
    UserReadView
  ) {
    var UserAppView = AppView.extend( /** @lends UserAppView.prototype */ {
      /**
       * @class The main layout of the users dashboard, it shows the nav
       *        bar, authentication menu and the user's profile where they
       *        can select which corpus they want to open.
       *
       * @description Starts the application and initializes all its
       *              children.
       *
       * @extends AppView
       * @constructs
       */
      initialize: function() {
        if (OPrime.debugMode) OPrime.debug("APPVIEW init: " + this.el);

        FieldDB.FieldDBObject.confirm = function(message, optionalLocale) {
          var deferred = FieldDB.Q.defer();
          console.warn(message);
          FieldDB.Q.nextTick(function() {
            // always reject until these merges make sense.
            deferred.reject({
              message: message,
              optionalLocale: optionalLocale,
              response: null
            });
          });
          return deferred.promise;
        };

        this.userAppView = true;

        this.setUpAndAssociateViewsAndModelsWithCurrentUser();
      },

      /*
       * This function assures that whatever views on the dashboard that
       * are coming from the user, are reassociated. it is currently after
       * the user is synced from the server. (which happens when the user
       * authenticates so that if they were logged into another computer
       * the can get their updated preferences.
       */
      associateCurrentUsersInternalModelsWithTheirViews: function(callback) {
        this.userPreferenceView.model = this.authView.model.get(
          "userPrivate").get("prefs");
        this.userPreferenceView.model.bind("change:skin",
          this.userPreferenceView.renderSkin, this.userPreferenceView);

        this.hotkeyEditView.model = this.authView.model
          .get("userPrivate").get("hotkeys");
        // TODO the hotkeys are probably not associate dbut because they
        // are not finished, they cant be checked yet

        if (typeof callback === "function") {
          callback();
        }
      },
      setUpAndAssociateViewsAndModelsWithCurrentUser: function(callback) {
        // Create an AuthenticationEditView
        this.authView = new AuthenticationEditView({
          model: this.model.get("authentication")
        });

        /*
         * Set up the five user views
         */
        this.fullScreenEditUserView = new UserEditView({
          model: this.model.get("authentication").get("userPrivate")
        });
        this.fullScreenEditUserView.format = "fullscreen";

        this.fullScreenReadUserView = new UserReadView({
          model: this.model.get("authentication").get("userPrivate")
        });
        this.fullScreenReadUserView.format = "fullscreen";

        this.modalEditUserView = new UserEditView({
          model: this.model.get("authentication").get("userPrivate")
        });
        this.modalEditUserView.format = "modal";

        this.modalReadUserView = new UserReadView({
          model: this.model.get("authentication").get("userPrivate")
        });
        this.modalReadUserView.format = "modal";

        // Create a UserPreferenceEditView
        this.userPreferenceView = new UserPreferenceEditView({
          model: this.authView.model.get("userPrivate").get("prefs")
        });

        // Create a HotKeyEditView
        this.hotkeyEditView = new HotKeyEditView({
          model: this.authView.model.get("userPrivate").get("hotkeys")
        });

        if (typeof callback === "function") {
          callback();
        }
      },

      /**
       * The underlying model of the UserAppView is an App.
       */
      model: UserApp,

      /**
       * The Handlebars template rendered as the UserAppView.
       */
      template: Handlebars.templates.user_app,

      /**
       * Renders the UserAppView and all of its child Views.
       */
      renderPostHoook: function() {
        $(".corpus-settings").addClass("hidden");
        $(".power-users-link").addClass("hidden");

        return this;
      },

      // Display User Views
      renderEditableUserViews: function() {
        this.fullScreenEditUserView.render();
        this.modalEditUserView.render();
      },
      renderReadonlyUserViews: function() {
        this.fullScreenReadUserView.render();
        this.modalReadUserView.render();
      },
      addSavedDoc: function() {
        //Do nothing
      },
      toastUser: function() {
        //Do nothing
      }
    });

    return UserAppView;
  });
