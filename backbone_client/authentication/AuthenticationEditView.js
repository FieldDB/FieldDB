define([
    "backbone",
    "handlebars",
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
  var AuthenticationEditView = Backbone.View.extend(
  /** @lends AuthenticationEditView.prototype */
  {
    /**
     * @class This is the login logout surface.
     *
     * @description Starts the Authentication and initializes all its children.
     * This is where the dropdown menu for user related stuff is housed.
     *
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      if (OPrime.debugMode) OPrime.debug("AUTH EDIT init: " + this.el);

    //   Create a Small  UserReadView of the user's public info which will appear on the user drop down.
      this.userView = new UserReadView({
         model: this.model.get("userPublic")
      });
      this.userView.format = "link";
      this.userView.setElement($("#user-quickview"));

      // Any time the Authentication model changes, re-render
      this.model.bind('change:state', this.render, this);
      this.model.get("userPublic").bind('change', this.render, this);

      //save the version of the app into this view so we can use it when we create a user.
      var self = this;
      OPrime.getVersion(function (ver) {
        self.appVersion = ver;
        self.model.get("userPrivate").set("currentAppVersion",ver);
      });

    },

    /**
     * The underlying model of the AuthenticationEditView is an Authentication
     */
    model : Authentication,

    /**
     * The userView is a child of the AuthenticationEditView.
     */
    userView : UserReadView,

    /**
     * Events that the AuthenticationEditView is listening to and their handlers.
     */
    events : {
      "click .logout" : "logout",
      "click .show-login-modal": function(e){
//        if(e){
//          e.stopPropagation();
//          e.preventDefault();
//        }
        $("#login_modal").show("modal");
      },

      "keyup .registerusername" : function(e) {
        var code = e.keyCode || e.which;
        // code == 13 is the enter key
        if ((code == 13) && (this.$el.find(".registerusername").val().trim() != "YourNewUserNameGoesHere")) {
          this.$el.find(".potentialUsername").html( $(".registerusername").val().trim());
          this.$el.find(".confirm-password").show();
          this.$el.find(".registerpassword").focus();
        }
      },
      "click .new-user-button" : function(e) {
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        if (this.$el.find(".registerusername").val().trim() != "YourNewUserNameGoesHere") {
          this.$el.find(".potentialUsername").html( $(".registerusername").val().trim());
          this.$el.find(".confirm-password").show();
          this.$el.find(".registerpassword").focus();
        }
      },
      "click .register-new-user" : "registerNewUser",
      "keyup .registeruseremail" : function(e) {
        var code = e.keyCode || e.which;

        // code == 13 is the enter key
        if (code == 13) {
          this.registerNewUser();
        }
      },
      "click .register-twitter" : function() {
        window.location.href = OPrime.authUrl+"/auth/twitter";
      },
      "click .register-facebook" : function() {
        window.location.href = OPrime.authUrl+"/auth/facebook";
      },
      "click .sync-lingllama-data" : function(e) {
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        console.log("hiding user welcome, syncing lingllama");
        this.syncUser("lingllama","phoneme", OPrime.authUrl);
      },
      "click .registerusername" : function(e) {
        e.target.select();
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        return false;
      },
      "click .registerpassword" : function(e) {
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        return false;
      },
      "click .to-confirm-password" : function(e) {
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        return false;
      },
      "click .registeruseremail" : function(e) {
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        return false;
      }
    },

    /**
     * The Handlebars template rendered as the AuthenticationEditView.
     */
    template : Handlebars.templates.authentication_edit_embedded,
    userTemplate : Handlebars.templates.user_read_link,

    /**
     * Renders the AuthenticationEditView and all of its child Views.
     */
    render : function() {
      if (OPrime.debugMode) OPrime.debug("AUTH EDIT render: " + this.el);
      if (this.model == undefined) {
        if (OPrime.debugMode) OPrime.debug("Auth model was undefined, come back later.");
        return this;
      }

      if(this.model.get("userPublic") != undefined){
        this.model.set( "gravatar", this.model.get("userPublic").getGravatar() );
        this.model.set( "username", this.model.get("userPublic").get("username") );
      }

      var jsonToRender = this.model.toJSON();
      //localization
      jsonToRender.locale_An_offline_online_fieldlinguistics_database = Locale.get("locale_An_offline_online_fieldlinguistics_database");
      jsonToRender.locale_Close_and_login_as_LingLlama = Locale.get("locale_Close_and_login_as_LingLlama");
      jsonToRender.locale_Close_and_login_as_LingLlama_Tooltip = Locale.get("locale_Close_and_login_as_LingLlama_Tooltip");
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

      if (this.model.get("state") == "renderLoggedIn") {
        $("#logout").show();
        $("#login_form").hide();
        $("#login_register_button").hide();

        if(this.model.get("userPublic") != undefined){
          if (OPrime.debugMode) OPrime.debug("\t rendering AuthenticationEditView's UserView");
          this.userView.setElement($("#user-quickview"));
          this.userView.render();
        }else{
          $("#user-quickview").html('<i class="icons icon-user icon-white">');
        }

      } else {
        $("#logout").hide();
        $("#login_form").show();
        $("#login_register_button").show();
        $("#loggedin_customize_on_auth_dropdown").hide();

        if(this.model.get("userPublic") != undefined){
          if (OPrime.debugMode) OPrime.debug("\t rendering AuthenticationEditView's UserView");
          this.userView.setElement($("#user-quickview"));
          this.userView.render();
        }else{
          $("#user-quickview").html('<i class="icons icon-user icon-white">');
        }

        var mostLikelyAuthUrl = OPrime.getMostLikelyUserFriendlyAuthServerName();
        $(".welcomeauthurl").val(mostLikelyAuthUrl);

      }

      return this;
    },


    /**
     * Logout backs up the user to the central server and then
     * removes the stringified user and the username from local
     * storage, and then authenticates public into the app.
     */
    logout : function() {
      var authself = this.model;
      $(".reason_why_we_need_to_make_sure_its_you").html("You should back up your preferences before you log out. ");
      window.app.backUpUser(function(){
        authself.logout();
      });
    },

    /**
     * Login tries to get the username and password from the user interface, and
     * calls the view's authenticate function.
     */
    login : function() {
      if (OPrime.debugMode) OPrime.debug("LOGIN");
      this.authenticate(document.getElementById("username").value,
          document.getElementById("password").value,
          document.getElementById("authUrl").value
      );
    },

    /**
     * Notes: LingLlama's user comes from his time after his PhD and before his
     * foray into the industry. This is when he started getting some results for
     * "phoneme" around 1910. For a similar use of historical users see Morgan
     * Blamey and Tucker the Technician at blamestella.com
     * https://twitter.com/#!/tucker1927
     */
    loadSample : function(appidsIn) {
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
    authenticate : function(username, password, authUrl, sucescallback, failcallback, corpusloginsuccesscallback, corpusloginfailcallback) {

      // Temporarily keep the given's credentials
      var tempuser = new User({
        username : username,
        password : password,
        authUrl : authUrl
      });

      var whattodoifcouchloginerrors = function(){
      //If the user has an untitled corpus, there is a high chance that their dashboard didn't load because they cant sync with couch but they do have their first local ones, attempt to look it up in their user, and laod it.
        if(app.get("corpus").get("title").indexOf("Untitled Corpus") >= 0){
          if(self.model.get("userPrivate").get("mostRecentIds") == undefined){
            //do nothing because they have no recent ids
            alert("Bug: User does not have most recent ids, Cant show your most recent dashbaord.");
            window.location.href = "#render/true";
          }else{
            /*
             *  Load their last corpus, session, datalist etc
             */
//            var appids = self.model.get("userPrivate").get("mostRecentIds");
//            window.app.loadBackboneObjectsByIdAndSetAsCurrentDashboard(appids);
          }
        }
        if(typeof corpusloginfailcallback == "function"){
          corpusloginfailcallback();
        }else{
          if (OPrime.debugMode) OPrime.debug('no corpusloginfailcallback was defined');

        }
      };

      var self = this;
      this.model.authenticate(tempuser, function(success) {
        if (success == null) {
//          alert("Authentication failed. Authenticating as public."); //TODO cant use this anymore as a hook
//          self.authenticateAsPublic();
          return;
        }
        if(username == "public"){
          self.model.savePublicUserForOfflineUse();
        }
        var couchConnection = self.model.get("userPrivate").get("corpuses")[0]; //TODO make this be the last corpus they edited so that we re-load their dashboard, or let them chooe which corpus they want.
        window.app.logUserIntoTheirCorpusServer(couchConnection, username, password, function(){
          if(typeof corpusloginsuccesscallback == "function"){
            if (OPrime.debugMode) OPrime.debug('Calling corpusloginsuccesscallback');
            corpusloginsuccesscallback();
          }else{
            if (OPrime.debugMode) OPrime.debug('no corpusloginsuccesscallback was defined');
          }
          //Replicate user's corpus down to pouch
          window.app.replicateOnlyFromCorpus(couchConnection, function(){
            if(self.model.get("userPrivate").get("mostRecentIds") == undefined){
              //do nothing because they have no recent ids
              alert("Bug: User does not have most recent ids, Cant show your most recent dashbaord.");
              window.location.href = "#render/true";
            }else{
              /*
               *  Load their last corpus, session, datalist etc,
               *  only if it is not the ones already most recently loaded.
               */
              var appids = self.model.get("userPrivate").get("mostRecentIds");
              var visibleids = {};
              if(app.get("corpus")){
                visibleids.corpusid = app.get("corpus").id;
              }else{
                visibleids.corpusid = "";
              }
              if(app.get("currentSession"))  {
                visibleids.sessionid = app.get("currentSession").id;
              }else{
                visibleids.sessionid = "";
              }
              if(app.get("currentDataList")){
                visibleids.datalistid = app.get("currentDataList").id;
              }else{
                visibleids.datalistid = "";
              }
              if( ( appids.sessionid != visibleids.sessionid ||  appids.corpusid != visibleids.corpusid || appids.datalistid != visibleids.datalistid) ){
                if (OPrime.debugMode) OPrime.debug("Calling loadBackboneObjectsByIdAndSetAsCurrentDashboard in AuthenticationEditView");
                if(window.app.loadBackboneObjectsByIdAndSetAsCurrentDashboard){
                  window.app.loadBackboneObjectsByIdAndSetAsCurrentDashboard(appids);
                }else{
                  console.log("Trying to fetch the corpus and redirect you to the corpus dashboard.");
                  window.app.router.showCorpusDashboard(couchConnection.pouchame, app.get("corpus").id);
                }
              }
            }
          });
        }, whattodoifcouchloginerrors);


        var renderLoggedInStateDependingOnPublicUserOrNot = "renderLoggedIn";
        if(self.model.get("userPrivate").get("username") == "public"){
          renderLoggedInStateDependingOnPublicUserOrNot = "renderLoggedOut";
        }
        // Save the authenticated user in our Models
        self.model.set({
          gravatar : self.model.get("userPrivate").get("gravatar"),
          username : self.model.get("userPrivate").get("username"),
          state : renderLoggedInStateDependingOnPublicUserOrNot
        });
        if(typeof sucescallback == "function"){
          sucescallback();
        }
      }, failcallback);
    },

    /**
     * ShowQuickAuthentication view popups up a password entry view.
     * This is used to unlock confidential datum, or to unlock dangerous settings
     * like removing a corpus. It is also used if the user hasn't confirmed their
     * identity in a while.
     */
    showQuickAuthenticateView : function(authsuccesscallback, authfailurecallback, corpusloginsuccesscallback, corpusloginfailcallback) {
      var self = this;
      window.hub.unsubscribe("quickAuthenticationClose", null, this);
      if( this.model.get("userPrivate").get("username") == "lingllama" ){
        / * Show the quick auth but fill in the password, to simulate a user */
        $("#quick-authenticate-modal").modal("show");
        var preKnownPassword = "phoneme";
        $("#quick-authenticate-password").val(preKnownPassword);
        window.hub.subscribe("quickAuthenticationClose",function(){
          window.appView.authView.authenticate("lingllama"
              , "phoneme"
              , window.app.get("authentication").get("userPrivate").get("authUrl")
              , authsuccesscallback
              , authfailurecallback
              , corpusloginsuccesscallback
              , corpusloginfailcallback );
          $("#quick-authenticate-modal").modal("hide");
          $("#quick-authenticate-password").val("");
          window.hub.unsubscribe("quickAuthenticationClose", null, this); //TODO why was this off, this si probably why we were getting lots of authentications
        }, self);
      }else if (this.model.get("userPrivate").get("username") == "public"){
        / * Dont show the quick auth, just authenticate */
        window.appView.authView.authenticate("public"
            , "none"
            , window.app.get("authentication").get("userPrivate").get("authUrl")
            , authsuccesscallback
            , authfailurecallback
            , corpusloginsuccesscallback
            , corpusloginfailcallback );
      }else {
        $("#quick-authenticate-modal").modal("show");
        window.hub.subscribe("quickAuthenticationClose",function(){
          window.appView.authView.authenticate(window.app.get("authentication").get("userPrivate").get("username")
              , $("#quick-authenticate-password").val()
              , window.app.get("authentication").get("userPrivate").get("authUrl")
              , authsuccesscallback
              , authfailurecallback
              , corpusloginsuccesscallback
              , corpusloginfailcallback );
          $("#quick-authenticate-modal").modal("hide");
          $("#quick-authenticate-password").val("");
          window.hub.unsubscribe("quickAuthenticationClose", null, this);//TODO why was this off, this si probably why we were getting lots of authentications
        }, self);
      }
    },

    registerNewUser : function(e) {
      $(".register-new-user").attr("disabled", "disabled");
      if(this.registering){
        return;
      }
      this.registering = true;
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      var authedself = this;
      if (OPrime.debugMode) OPrime.debug("Attempting to register a new user: " );
      var dataToPost = {};
      $(".registerusername").val( $(".registerusername").val().trim().toLowerCase().replace(/[^0-9a-z]/g,"") );
      dataToPost.email = $(".registeruseremail").val().trim();
      dataToPost.username = $(".registerusername").val().trim().toLowerCase().replace(/[^0-9a-z]/g,"");
      dataToPost.password = $(".registerpassword").val().trim();
      dataToPost.authUrl = OPrime.authUrl;
      dataToPost.serverCode = OPrime.getMostLikelyUserFriendlyAuthServerName().toLowerCase();
      dataToPost.appVersionWhenCreated = this.appVersion;
      //Send a pouchname to create
      var corpusConnection = OPrime.defaultCouchConnection();
      corpusConnection.pouchname = "firstcorpus";
      dataToPost.corpuses = [corpusConnection];
      dataToPost.mostRecentIds = {};
      dataToPost.mostRecentIds.couchConnection = JSON.parse(JSON.stringify(corpusConnection));
      dataToPost.mostRecentIds.couchConnection.pouchname = dataToPost.username+"-"+dataToPost.mostRecentIds.couchConnection.pouchname;
      var activityConnection = OPrime.defaultCouchConnection();
      activityConnection.pouchname = dataToPost.username+"-activity_feed";
      dataToPost.activityCouchConnection = activityConnection;
      // dataToPost.gravatar = "user/user_gravatar.png";
      var u = new UserMask();
      dataToPost.gravatar = u.getGravatar(dataToPost.email);
      if (dataToPost.username != ""
        && (dataToPost.password == $(".to-confirm-password").val().trim())
        && dataToPost.email != "") {
        if (OPrime.debugMode) OPrime.debug("User has entered an email and the passwords match. ");

        $(".welcome-screen-alerts").html("<p><strong>Please wait:</strong> Contacting the server to prepare your first corpus/database for you...</p> <progress max='100'> <strong>Progress: working...</strong>" );
        $(".welcome-screen-alerts").addClass("alert-success");
        $(".welcome-screen-alerts").show();
        $(".welcome-screen-alerts").removeClass("alert-error");
        $(".register-new-user").addClass("disabled");
        $(".register-new-user").attr("disabed","disabled");
        window.app.showSpinner();
        window.app.router.hideEverything();
        $(".spinner-status").html("Contacting the server...");
        /*
         * Contact the server and register the new user
         */
        OPrime.makeCORSRequest({
          type : 'POST',
          url : dataToPost.authUrl + "/register",
          data : dataToPost,
          success : function(serverResults) {
            var userFriendlyErrors = serverResults.userFriendlyErrors || "";
            if (userFriendlyErrors) {
              $(".welcome-screen-alerts").html(userFriendlyErrors.join("<br/>")+" "+OPrime.contactUs );
              $(".welcome-screen-alerts").show();
            } else if (serverResults.user) {

              localStorage.removeItem("username");
              localStorage.removeItem("mostRecentDashboard");
              localStorage.removeItem("mostRecentCouchConnection");
              localStorage.removeItem("encryptedUser");

              //Destropy cookies, and load the public user
              OPrime.setCookie("username", undefined, -365);
              OPrime.setCookie("token", undefined, -365);

//              var auth  = new Authentication({filledWithDefaults: true});
              var auth = new Authentication({
                "confidential" : new Confidential({
                  secretkey : serverResults.user.hash
                }),
                "userPrivate" : new User(serverResults.user)
              });

              OPrime.setCookie("username", serverResults.user.username, 365);
              OPrime.setCookie("token", serverResults.user.hash, 365);
              var u = auth.get("confidential").encrypt(JSON.stringify(auth.get("userPrivate").toJSON()));
              localStorage.setItem("encryptedUser", u);
              $(".spinner-status").html("Building your database for you...");

              /*
               * Redirect the user to their user page, being careful to use their (new) database if they are in a couchapp (not the database they used to register/create this corpus)
               */
              var potentialpouchname = serverResults.user.corpuses[0].pouchname;
              var optionalCouchAppPath = OPrime.guessCorpusUrlBasedOnWindowOrigin(potentialpouchname);

              var couchConnection =OPrime.defaultCouchConnection();
              couchConnection.pouchname =potentialpouchname;
              var nextCorpusUrl = OPrime.getCouchUrl(couchConnection) + "/_design/pages/_view/private_corpuses";

              window.app.logUserIntoTheirCorpusServer(serverResults.user.corpuses[0], dataToPost.username, dataToPost.password, function(){
                OPrime.checkToSeeIfCouchAppIsReady(nextCorpusUrl, function(){

                  if(OPrime.isBackboneCouchDBApp()){
                    try{
                      Backbone.couch_connector.config.db_name = potentialpouchname;
                    }catch(e){
                      OPrime.bug("Couldn't set the database name off of the pouchame when creating a new corpus for you, please report this.");
                    }
                  }else{
                    alert("TODO test what happens when not in a backbone couchdb app and registering a new user.");
                  }
                  var newCorpusToBeSaved = new Corpus({
                    "filledWithDefaults" : true,
                    "title" : serverResults.user.username + "'s Corpus",
                    "description": "This is your first Corpus, you can use it to play with the app... When you want to make a real corpus, click New : Corpus",
                    "team" : new UserMask({username: dataToPost.username}),
                    "couchConnection" : couchConnection,
                    "pouchname" : couchConnection.pouchname,
                    "dateOfLastDatumModifiedToCheckForOldSession" : JSON.stringify(new Date())
                  });

                  newCorpusToBeSaved.prepareANewPouch(couchConnection, function(){
//                    alert("Saving new corpus in register.");
                    $(".spinner-status").html("Saving a corpus in your new database ...");

                    window.functionToSaveNewCorpus = function(){
                      newCorpusToBeSaved.save(null, {
                        success : function(model, response) {
                          model.get("publicSelf").set("corpusid", model.id);
                          auth.get("userPrivate").set("mostRecentIds", {});
                          auth.get("userPrivate").get("mostRecentIds").corpusid = model.id;
                          model.get("couchConnection").corpusid = model.id;
                          auth.get("userPrivate").get("mostRecentIds").couchConnection = model.get("couchConnection");
                          auth.get("userPrivate").get("corpuses")[0] = model.get("couchConnection");
                          var u = auth.get("confidential").encrypt(JSON.stringify(auth.get("userPrivate").toJSON()));
                          localStorage.setItem("encryptedUser", u);

                          var sucessorfailcallbackforcorpusmask = function(){
                            $(".spinner-status").html("New Corpus saved in your user profile. Taking you to your new corpus when it is ready...");
                            window.setTimeout(function(){
                              window.location.replace(optionalCouchAppPath+ "user.html#/corpus/"+potentialpouchname+"/"+model.id);
                            },1000);
                          };
                          model.get("publicSelf").saveAndInterConnectInApp(sucessorfailcallbackforcorpusmask, sucessorfailcallbackforcorpusmask);

                        },error : function(e,f,g) {
//                          alert('New Corpus save error ' + f.reason +". Click OK to re-attempt to save your new corpus in 10 seconds...");
                          $(".spinner-status").html("New Corpus save error " + f.reason +". The app will re-attempt to save your new corpus in 10 seconds...");
                          window.corpusToBeSaved = newCorpusToBeSaved;
                          window.setTimeout(window.functionToSaveNewCorpus, 10000);
                        }
                      });
                    };
                    window.functionToSaveNewCorpus();
                  });
                });
              });

            }
          },//end successful registration
          dataType : "",
          error : function(e,f,g){
            if (OPrime.debugMode) OPrime.debug("Error registering user", e,f,g);
            $(".welcome-screen-alerts").html(
                " Something went wrong, that's all we know. Please try again or report this to us if it does it again:  " + OPrime.contactUs);
            $(".welcome-screen-alerts").addClass("alert-error");
            $(".welcome-screen-alerts").removeClass("alert-success");
            $(".welcome-screen-alerts").show();
            $(".register-new-user").removeClass("disabled");
            $(".register-new-user").removeAttr("disabled");
            authedself.registering = false;

          }
        });
      } else{
        if (OPrime.debugMode) OPrime.debug("User has not entered good info. ");
          $(".welcome-screen-alerts").html("Your passwords don't seem to match. " + OPrime.contactUs );
          $(".welcome-screen-alerts").show();
          $(".register-new-user").removeClass("disabled");
          $(".register-new-user").removeAttr("disabled");

      }
    },
    /**
     * This function manages all the data flow from the auth server and
     * corpus server to get the app to load in the right order so that
     * all the models and views are loaded, and tied together
     *
     * @param username
     * @param password
     */
    syncUser : function(username, password, authUrl){
      console.log("hiding user login, syncing users data");
      var dataToPost = {username: username, password: password};

      $(".welcome-screen-alerts").html("<p><strong>Please wait:</strong> Contacting the server...</p> <progress max='100'> <strong>Progress: working...</strong>" );
      $(".welcome-screen-alerts").addClass("alert-success");
      $(".welcome-screen-alerts").removeClass("alert-error");
      $(".welcome-screen-alerts").show();

      /*
       * Contact the server and register the new user
       */
      OPrime.makeCORSRequest({
        type : 'POST',
        url : authUrl + "/login",
        data : dataToPost,
        success : function(serverResults) {
          if (serverResults.userFriendlyErrors != null) {
            $(".welcome-screen-alerts").html(serverResults.userFriendlyErrors.join("<br/>")+" "+OPrime.contactUs );
            $(".welcome-screen-alerts").removeClass("alert-success");
            $(".welcome-screen-alerts").addClass("alert-error");
            $(".welcome-screen-alerts").show();

          } else if (serverResults.user) {
            $(".welcome-screen-alerts").html("Attempting to sync your data to this device...</p> <progress max='100'> <strong>Progress: working...</strong>" );
            $(".welcome-screen-alerts").show();

            localStorage.removeItem("username");
            localStorage.removeItem("mostRecentDashboard");
            localStorage.removeItem("mostRecentCouchConnection");
            localStorage.removeItem("encryptedUser");
            localStorage.removeItem("helpShownCount");
            localStorage.removeItem("helpShownTimestamp");

            //Destroy cookies, and load the public user
            OPrime.setCookie("username", undefined, -365);
            OPrime.setCookie("token", undefined, -365);

            var auth  = new Authentication({filledWithDefaults: true});
            auth.set("userPrivate", new User(serverResults.user));
            OPrime.setCookie("username", serverResults.user.username, 365);
            OPrime.setCookie("token", serverResults.user.hash, 365);
            auth.get("confidential").set("secretkey", serverResults.user.hash);
            var u = auth.get("confidential").encrypt(JSON.stringify(auth.get("userPrivate").toJSON()));
            localStorage.setItem("encryptedUser", u);

            /*
             * Redirect the user to their user page, being careful to use their most recent database if they are in a couchapp (not the database they used to login to this corpus)
             */
            var potentialpouch = serverResults.user.username+"-firstcorpus";
            if(serverResults.user && serverResults.user.mostRecentIds && serverResults.user.mostRecentIds.couchConnection){
              potentialpouch = serverResults.user.mostRecentIds.couchConnection.pouchname;
            }
            if (!serverResults.user.mostRecentIds || !serverResults.user.mostRecentIds.couchConnection) {
              serverResults.user.mostRecentIds = {
                couchConnection: serverResults.user.corpuses[0]
              };
            }
            var optionalCouchAppPath = OPrime.guessCorpusUrlBasedOnWindowOrigin(potentialpouch);
            window.app.logUserIntoTheirCorpusServer(serverResults.user.mostRecentIds.couchConnection, dataToPost.username, dataToPost.password, function(){
                window.location.replace(optionalCouchAppPath+"corpus.html");
            });
          }
        },//end successful login
        dataType : "",
        error : function(e,f,g){
          if (OPrime.debugMode) OPrime.debug("Error syncing user", e,f,g);
          $(".welcome-screen-alerts").html(
              " Something went wrong, that's all we know. Please try again or report this to us if it does it again:  " + OPrime.contactUs);
          $(".welcome-screen-alerts").addClass("alert-error");
          $(".welcome-screen-alerts").removeClass("alert-success");
          $(".welcome-screen-alerts").show();
        }
      });

    }
  });

  return AuthenticationEditView;
});
