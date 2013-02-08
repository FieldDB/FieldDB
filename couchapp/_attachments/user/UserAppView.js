define(
    [ "backbone", 
      "handlebars", 
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
        "libs/OPrime" ],
    function(
        Backbone, 
        Handlebars, 
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
        UserReadView) {
      var UserAppView = Backbone.View
          .extend(
          /** @lends UserAppView.prototype */
          {
            /**
             * @class The main layout of the users dashboard, it shows the nav
             *        bar, authentication menu and the user's profile where they
             *        can select which corpus they want to open.
             * 
             * @description Starts the application and initializes all its
             *              children.
             * 
             * @extends Backbone.View
             * @constructs
             */
            initialize : function() {
              if (OPrime.debugMode) OPrime.debug("APPVIEW init: " + this.el);

              this.setUpAndAssociateViewsAndModelsWithCurrentUser();
            },

            /*
             * This function assures that whatever views on the dashboard that
             * are coming from the user, are reassociated. it is currently after
             * the user is synced from the server. (which happens when the user
             * authenticates so that if they were logged into another computer
             * the can get their updated preferences.
             */
            associateCurrentUsersInternalModelsWithTheirViews : function(
                callback) {
              this.userPreferenceView.model = this.authView.model.get(
                  "userPrivate").get("prefs");
              this.userPreferenceView.model.bind("change:skin",
                  this.userPreferenceView.renderSkin, this.userPreferenceView);


              this.hotkeyEditView.model = this.authView.model
                  .get("userPrivate").get("hotkeys");
              // TODO the hotkeys are probably not associate dbut because they
              // are not finished, they cant be checked yet

              if (typeof callback == "function") {
                callback();
              }
            },
            setUpAndAssociateViewsAndModelsWithCurrentUser : function(callback) {
              // Create an AuthenticationEditView
              this.authView = new AuthenticationEditView({
                model : this.model.get("authentication")
              });

              /*
               * Set up the five user views
               */
              this.fullScreenEditUserView = new UserEditView({
                model : this.model.get("authentication").get("userPrivate")
              });
              this.fullScreenEditUserView.format = "fullscreen";

              this.fullScreenReadUserView = new UserReadView({
                model : this.model.get("authentication").get("userPrivate")
              });
              this.fullScreenReadUserView.format = "fullscreen";
              
             
              this.modalEditUserView = new UserEditView({
                model : this.model.get("authentication").get("userPrivate")
              });
              this.modalEditUserView.format = "modal";

              this.modalReadUserView = new UserReadView({
                model : this.model.get("authentication").get("userPrivate")
              });
              this.modalReadUserView.format = "modal";

              // Create a UserPreferenceEditView
              this.userPreferenceView = new UserPreferenceEditView({
                model : this.authView.model.get("userPrivate").get("prefs")
              });

              // Create a HotKeyEditView
              this.hotkeyEditView = new HotKeyEditView({
                model : this.authView.model.get("userPrivate").get("hotkeys")
              });

              if (typeof callback == "function") {
                callback();
              }
            },

            /**
             * The underlying model of the UserAppView is an App.
             */
            model : UserApp,

            /**
             * Events that the UserAppView is listening to and their handlers.
             */
            events : {
              "click #quick-authentication-okay-btn" : function(e) {
                window.hub.publish("quickAuthenticationClose", "no message");
              },
              "click .icon-home" : function(e) {
                if(e){
                  e.stopPropagation();
                  e.preventDefault();
                }   
                window.location.href = "#render/true";
              },
              "click .save-dashboard" : function() {
                window.app.saveAndInterConnectInApp();
              },
              "click .sync-everything" : "replicateDatabases",
            /*
             * These functions come from the top search template, it is renderd
             * by seacheditview whenever a search is renderd, but its events
             * cannot be handled there but are easily global events that can be
             * controlled by teh appview. which is also responsible for many
             * functions on the navbar
             */

            },

            /**
             * The Handlebars template rendered as the UserAppView.
             */
            template : Handlebars.templates.user_app,

            /**
             * Renders the UserAppView and all of its child Views.
             */
            render : function() {
              if (OPrime.debugMode) OPrime.debug("APPVIEW render: " + this.el);
              if (this.model != undefined) {

                // Display the UserAppView
                this.setElement($("#app_view"));
                $(this.el).html(this.template(this.model.toJSON()));
              
              //The authView is the dropdown in the top right corner which holds all the user menus
                this.authView.render();
                this.userPreferenceView.render();
                this.hotkeyEditView.render();//.showModal();
                this.renderReadonlyUserViews();

              //put the version into the terminal, and into the user menu
                OPrime.getVersion(function (ver) { 
                  $(".fielddb-version").html(ver);
                });
                $(".corpus-settings").addClass("hidden");
                $(".power-users-link").addClass("hidden");
                
                $(this.el).find(".locale_We_need_to_make_sure_its_you").html(Locale.get("locale_We_need_to_make_sure_its_you"));
                $(this.el).find(".locale_Password").html(Locale.get("locale_Password"));
                $(this.el).find(".locale_Yep_its_me").text(Locale.get("locale_Yep_its_me"));
                
              }
              return this;
            },

            /**
             * Save current state, synchronize the server and local databases.
             * 
             * If the corpus connection is currently the default, it attempts to
             * replicate from to the users' last corpus instead.
             */
            replicateDatabases : function(callback) {
              var self = this;
              this.model
                  .saveAndInterConnectInApp(function() {
                    // syncUserWithServer will prompt for password, then run the
                    // corpus replication.
                    self.model
                        .get("authentication")
                        .syncUserWithServer(
                            function() {
                              var corpusConnection = self.model.get("corpus")
                                  .get("couchConnection");
                              if (self.model.get("authentication").get(
                                  "userPrivate").get("corpuses").pouchname != "default"
                                  && app.get("corpus").get("couchConnection").pouchname == "default") {
                                corpusConnection = self.model.get(
                                    "authentication").get("userPrivate").get(
                                    "corpuses")[0];
                              }
                              self.model.replicateCorpus(
                                  corpusConnection, callback);
                            });
                  });
            }
            , // Display User Views
            renderEditableUserViews : function(userid) {
              this.fullScreenEditUserView.render();
              this.modalEditUserView.render();
            },
            renderReadonlyUserViews : function(userid) {
              this.fullScreenReadUserView.render();
              this.modalReadUserView.render();
            },
            addSavedDoc : function(){
              //Do nothing
            },
            toastUser : function(){
              //Do nothing
            }
          });

      return UserAppView;
    });
