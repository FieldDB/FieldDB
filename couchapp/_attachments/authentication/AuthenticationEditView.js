define([
    "backbone", 
    "handlebars",
    "authentication/Authentication", 
    "user/User", 
    "user/UserReadView",
    "libs/OPrime"
], function(
    Backbone, 
    Handlebars, 
    Authentication, 
    User, 
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
      OPrime.debug("AUTH EDIT init: " + this.el);
      
    //   Create a Small  UserReadView of the user's public info which will appear on the user drop down.
      this.userView = new UserReadView({
         model: this.model.get("userPublic")
      });
      this.userView.format = "link";
      this.userView.setElement($("#user-quickview"));
      
      // Any time the Authentication model changes, re-render
      this.model.bind('change:state', this.render, this);
      this.model.get("userPublic").bind('change', this.render, this);
      
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
      OPrime.debug("AUTH EDIT render: " + this.el);
      if (this.model == undefined) {
        OPrime.debug("Auth model was undefined, come back later.");
        return this;
      }

      if(this.model.get("userPublic") != undefined){
        this.model.set( "gravatar", this.model.get("userPublic").get("gravatar") );
        this.model.set( "username", this.model.get("userPublic").get("username") );
      }
      // Display the AuthenticationEditView
      this.setElement($("#authentication-embedded"));
      $(this.el).html(this.template(this.model.toJSON()));

      if (this.model.get("state") == "renderLoggedIn") {
        $("#logout").show();
        $("#login_form").hide();
        if(this.model.get("userPublic") != undefined){
          OPrime.debug("\t rendering AuthenticationEditView's UserView");
          this.userView.setElement($("#user-quickview"));
          this.userView.render();
        }else{
          $("#user-quickview").html('<i class="icons icon-user icon-white">');
        }
        //localization
        $(this.el).find(".locale_Log_Out").html(Locale.get("locale_Log_Out"));

        
      } else {
        $("#logout").hide();
        $("#login_form").show();
        if(this.model.get("userPublic") != undefined){
          OPrime.debug("\t rendering AuthenticationEditView's UserView");
          this.userView.setElement($("#user-quickview"));
          this.userView.render();
        }else{
          $("#user-quickview").html('<i class="icons icon-user icon-white">');
        }
        //localization
        $(this.el).find(".locale_Close_and_login_as_LingLlama").html(Locale.get("locale_Close_and_login_as_LingLlama"));
        $(this.el).find(".locale_Close_and_login_as_LingLlama_Tooltip").attr("title", Locale.get("locale_Close_and_login_as_LingLlama_Tooltip"));
        
        $(this.el).find(".locale_Log_In").html(Locale.get("locale_Log_In"));
        $(this.el).find(".locale_Create_a_new_user").html(Locale.get("locale_Create_a_new_user"));
        $(this.el).find(".locale_New_User").text(Locale.get("locale_New_User"));
        $(this.el).find(".locale_Confirm_Password").text(Locale.get("locale_Confirm_Password"));
        $(this.el).find(".locale_Sign_in_with_password").text(Locale.get("locale_Sign_in_with_password"));

        var mostLikelyAuthUrl = "LingSync.org";
        if (window.location.origin.indexOf("prosody.linguistics.mcgill") >= 0) {
          mostLikelyAuthUrl = "McGill ProsodyLab";
        } else if (window.location.origin.indexOf("jlbnogfhkigoniojfngfcglhphldldgi") >= 0) {
          mostLikelyAuthUrl = "McGill ProsodyLab";
        } else if (window.location.origin.indexOf("authdev.fieldlinguist.com") >= 0) {
          mostLikelyAuthUrl = "LingSync Testing";
        } else if (window.location.origin.indexOf("eeipnabdeimobhlkfaiohienhibfcfpa") >= 0) {
          mostLikelyAuthUrl = "LingSync Testing";
        } else if (window.location.origin.indexOf("localhost:8128") >= 0) {
        } else if (window.location.origin.indexOf("localhost") >= 0) {
          mostLikelyAuthUrl = "Localhost";
        }
        $(".welcomeauthurl").val(mostLikelyAuthUrl);
        
      }

      //localization
      $(this.el).find(".locale_Private_Profile").html(Locale.get("locale_Private_Profile"));
      $(this.el).find(".locale_An_offline_online_fieldlinguistics_database").html(Locale.get("locale_An_offline_online_fieldlinguistics_database"));

      return this;
    },
    
    /**
     * Logout removes the stringified user and the username from local storage,
     * and then authenticates public into the app.
     */
    logout : function() {
      this.model.logout();

    },
    
    /**
     * Login tries to get the username and password from the user interface, and
     * calls the view's authenticate function.
     */
    login : function() {
      OPrime.debug("LOGIN");
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
            var appids = self.model.get("userPrivate").get("mostRecentIds");
            window.app.loadBackboneObjectsByIdAndSetAsCurrentDashboard(appids);
          }
        }
        if(typeof corpusloginfailcallback == "function"){
          corpusloginfailcallback();
        }else{
          OPrime.debug('no corpusloginfailcallback was defined');

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
          self.model.savePublicUserForOffline();
        }
        var couchConnection = self.model.get("userPrivate").get("corpuses")[0]; //TODO make this be the last corpus they edited so that we re-load their dashboard, or let them chooe which corpus they want.
        window.app.get("corpus").logUserIntoTheirCorpusServer(couchConnection, username, password, function(){
          if(typeof corpusloginsuccesscallback == "function"){
            OPrime.debug('Calling corpusloginsuccesscallback');
            corpusloginsuccesscallback();
          }else{
            OPrime.debug('no corpusloginsuccesscallback was defined');
          }
          //Replicate user's corpus down to pouch
          window.app.get("corpus").replicateFromCorpus(couchConnection, function(){
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
                OPrime.debug("Calling loadBackboneObjectsByIdAndSetAsCurrentDashboard in AuthenticationEditView");
                if(window.app.loadBackboneObjectsByIdAndSetAsCurrentDashboard){
                  window.app.loadBackboneObjectsByIdAndSetAsCurrentDashboard(appids);
                }else{
                  console.log("Trying to fetch the corpus and redirect you to the corpus dashboard.");
                  window.app.router.showCorpusDashboard(couchConnection.pouchName, app.get("corpus").id);
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
      if( this.model.get("userPrivate").get("username") == "lingllama" || this.model.get("userPrivate").get("username") == "public" ){
        $("#quick-authenticate-modal").modal("show");
        var preKnownPassword = "none";
        if(this.model.get("userPrivate").get("username") == "lingllama"){
          preKnownPassword = "phoneme";
        }
        $("#quick-authenticate-password").val(preKnownPassword);
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
          window.hub.unsubscribe("quickAuthenticationClose", null, this); //TODO why was this off, this si probably why we were getting lots of authentications
        }, self);
      }else{
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
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      $(".register-new-user").attr("disabled", "disabled");

      OPrime.debug("Attempting to register a new user: " );
      var dataToPost = {};
      $(".registerusername").val( $(".registerusername").val().trim().toLowerCase().replace(/[^0-9a-z]/g,"") );
      dataToPost.email = $(".registeruseremail").val().trim();
      dataToPost.username = $(".registerusername").val().trim().toLowerCase().replace(/[^0-9a-z]/g,"");
      dataToPost.password = $(".registerpassword").val().trim();
      dataToPost.authUrl = OPrime.authUrl;
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
      dataToPost.gravatar = "user/user_gravatar.png";
     
      if (dataToPost.username != ""
        && (dataToPost.password == $(".to-confirm-password").val().trim())
        && dataToPost.email != "") {
        OPrime.debug("User has entered an email and the passwords match. ");
        
        $(".welcome-screen-alerts").html("<p><strong>Please wait:</strong> Contacting the server to prepare your first corpus/database for you...</p> <progress max='100'> <strong>Progress: working...</strong>" );
        $(".welcome-screen-alerts").addClass("alert-success");
        $(".welcome-screen-alerts").show();
        $(".welcome-screen-alerts").removeClass("alert-error");
        $(".register-new-user").addClass("disabled");
        $(".register-new-user").attr("disabed","disabled");
        
        /*
         * Contact the server and register the new user
         */
        $.ajax({
          type : 'POST',
          url : dataToPost.authUrl + "/register",
          data : dataToPost,
          success : function(serverResults) {
            if (serverResults.userFriendlyErrors != null) {
              $(".welcome-screen-alerts").html(serverResults.userFriendlyErrors.join("<br/>")+" "+OPrime.contactUs );
              $(".welcome-screen-alerts").show();
            } else if (serverResults.user) {

              localStorage.removeItem("username");
              localStorage.removeItem("mostRecentDashboard");
              localStorage.removeItem("mostRecentCouchConnection");
              localStorage.removeItem("encryptedUser","confidential:VTJGc2RHVmtYMStBTDBmMVN3NVVxRldWdWVXcXBBODJuMmxicThPN0hUSmlRYkFCclRwSXFxYVNtV2o5WFdnYkhOR2JlTVEyRjZoSnRobG4rczArdWVmbXl1K1JMaDZCY1NpVGZGTTRubm02azhGZVlhQWxwMkZGZzFVeEhONVZ2UDFicHkwU1l1azVEc0VNOHRpWEZhL0wwdThiNmd2OVhyNUVMU1UxdERPZmpLc0MxR29CUjBxejQ1QTU1c0s0QmdoempIS052YlJlYTRWVVNiTC9SeGNXeFU4eGN6NUp1Z3FQVjlJOTBPeS83ckNBNlZCdVdGYWhYU0ZzYXJhMm14NVN1dE82Yjk1enpaaitTci9CV0pKZWNXbklTNkRyRVlmYmczcGRXemVlcFMwUGRKY0NMRmhGNHp3aEpTNjBxRHU5Si9KUzNTR2dadEJaYWkyd0p2NExpdG9kOXB4YkNIYXQvR21hMTg3QnZFbkhqZmZMazQvZURySkwvTGxkRUUwTGZsdzg2VWduNnZpS3ZFOElWT1RPaXZIbFUzTEdqOFJWYTZrd2dPM3J2ci9EY2dKb24vUkxwUXBrVkZVdUlEektLeXN0WG0rSFQvSEtoZFVQQVdNdTNEWXdUcDI3SUM1NVMyNW5tQ3ZaM1FTeUxiOFk2SWQ5Q0x2dFk4d0ZQRTZVRjdqNnpEem1IRHN2QVBjU0xuQ2k3RGJPWG9BUTFqeFRpald0WW1pSkJ6WXIwNHFFb0xIMk5pN2hjaThiemFCN0Vva0t1b0Vpbm9wbGxGazBseTlkNUtEWE1ma1JncFFYWGNEaUxrQmR3YnhneThaSjlRT0Fqc0kzQXRPQndRUUJMNkVmbTZRUWg5OGFDZWRMVmxFWXQwV2VKSmhCSEJqMDlqcE9qcnkzNUVPMktTU2EwK0lTU0drN1pYd1RWci9vbGlBZHZ4TzNaWGFsWjZMMTNaUWJreU5PWVlXVlU5akJOeTNlYmFaY0NiUTdSL2tNNjFzMVZ2VjJBQmF0NFNKeXJKZkIrbTFSSC9lOE1zU3ppWng0aVZGMzhzOWZWQVV5ZFpUZUpabVM4NVEzNWlDWHpKbkVmcFJLOHFEWGdueFdxTHZtemxkZERXOVNoLzBkdjlneFNKZ05IY08xbU1aUFp0RzErMEVuNUtqbDlLZFovZGhPTGtibmVTdktTRXFZcDhvZnRNbFIzdVlxMXFoQVQ2bjNPQ3FoRmQ4Q3R4YUxTajhNaHBMeFVseEdCNjZvNkNUN2JOMk1ZbGZNV0RycG9Tak9XMUVZZGovN0lrREdVdEZsVDF4SWtIcmVYNlJsNWRQSzVLdTQrbUdGSHI4RkNDZGVINlF1M1FyTGNKR3dJY0tSTW9xYStaRndYU2gvTW1RQ1oyc3VTdVVzSkJIcmg3TFRzei9uY2pGZXZJSmdqb3hZczY3bkxMZmM4QkVrc3R5ZnNkYlJWZlRkeG9ZVitaTC9DeDFFdXlPU1pKSjZBTG9iVytlaEhxMVNFSVRHUEFhMk5RdEN6NlNrYlR6QmJtSCt5bjkzMGlwSDRUSUF1M0l3ME0xRVhrUDVCWVU5bjF0VWxXaUxBdllUVUV6OHBVenpiTUpmOGNtVTB1NWlCOFFZb1hmTW5UL2wwbk1JUm1KT1A1S3BOME9RSEZORWNmb0hmY3dScEl6ZlNVeEUvcXFTV1N3cHhqRXh5aHVEZWllcXBhNlVBbGM3RitTS1pHc21VeTRmUFA5UjMxNy92UEhHakgrWStnMEVIUmN3NUdiY1lRT3ZTMkNSdzl6bXNZL2NQUlFEbzQ4Q2hHL2VzTEhTTzJ1aTkzcURSNHI0aEw4OXRCYXE2REJiaWJSZ1dvWUs0aFdpVG50TGtZd1Z1MGExQkVDZkpsMEZWR0xpemJIalMvek5VSDdtVWh1QWhjZzc3OU0yZGNrTWhaTmZsMC9STWRqcE9aYUpESlMwbkdhTjRNZFZuY3BDZ202TWQ3c0xVcDhWUWlucGEvWGlxbXpVMG9qekpYczRxVTJ5Z0R1a1IrdnZBenAvaDhFeTUzM0NpY2paamdIS0s4a0IrU0NZQ1BaSENOSWhoMVhFVE9Od2tUbzIrVitGL0JtRGVLQWd6TWJta08xKzJ5eG9tYTJqL2E1YWgreUx1VXFNMTlJVWVINUg2cjZmL0QwZmN5RUsrRGZ0NzRhUGFUU01FYitxRFBEc1NDNVZCZ0JoRTJSa2loM3dHQVUwVTEyNU83NTVaekpMOUM3eFRyOUt5SWxjT1VrMzREamwvNkRzWmw5NzZLc1ZOV0tlaHpJSVVNVzBSSVgxTjJ4aXRoTVJVVkpodlU3OUlzT2UvWWlMZER5OFFRcHRpc214dS95ZGRlQyt2Z1BFMFdWb2xKVmprbU1HT0RMNC9YbEZkZFpncG9tMWowRkpqZnRPUHpJbElvSkwvYUVHR0puK3E2em1SZGlwcjk3Tkp3RkxUNmFUN3V4UjdMWmk2cVZxQjFmZkN3VTJVRWVVQWFJZUovQTlYZjgzTnptK1Yxb1BTSDZFSXVXZzFzVm42UEtyL3JlM2Vscks5YitpU08yeWdOTkxsb2plK0EvMlRmc0J3dmFxMThuaTFKeTh6RXVlL2E1a1krOStnSkdOQThsR3BLRUVXbEF1UFFlWDVobUR3MXNsMTJXMUtmYWc1UFRNOGFyQy9LL0FjVzltQUlFTXFpWVl6WmZJM25jUzI0MFByQ1BFRDFFQW9IMDdjbUZQQ1VycW5MRmxKZjl6blJIUmU2NmpHVjQ0SGNOcnZhSGZxMVRRQytaY056ckFxblN1ZC9wWVNDNHhLeGVoeWF4M2xDdzNsbzR0LzhlNHZVZWxwVFpjcUtOaDdXL0p0YlpwNkJrV2JmQldjc21ETEozcC9qM3ZDaG1rcXV0eWxxd0VCS3U1YnluamlrRDlFZEd3SDVwbURRQmsrQ0xoLzhXY0NveE9sT3dMV2EvTUY0VVdnQTlmOHdCUjV1T2VVMUcrUzFjSzBqKzRDbTltc2ZzbnNrZGlCQUVqdjIxbTQ5YituUEZVRkkyYURqUHdFL0Y4RmtTbFRJc1ZuK2hQVmVlMVFPVzFxU0tzZDdHUU1pNWtzSU5nNEp2ZnloMjVZaEwzdmR5VkpJTjhWdXRmQWV4aUhEZUMvbW5qcjh6Z3hkMS9Tb3FCZTluTWJTUUxCQXVlM0hZbXBSNWdBWllFcUdENmRIK0dtUURzQzJCSjVwakZEd1V0MG05ZU5KR0VTdERLZmxZUDJrTE1ReEc5a2FmVmt1SUk4bEMvZVhZNEpYWnR3Q0o4L1hKUVJ6SStQOXJHclpDYWU4Qk9qbDdwcVhkazBISnhVUUFtRkhFc0w1S0NNdWpiT0JEL1FKK25QMldYNXJib2YydWY3MUNNZ2ZaT3FFalFkSmZZblNveDlWQnFJTXFsOVh4R0lHL0RqcEttYXpmV2hneFMwb09DakRPTldKZnRYTk5FUDN5MWJaY0dhdnl0OFVnaklBa3pLRVJjNGhkaUY2ZktoRjhyN1Nhc2JyS3J6OWxHU25FWEhMTEUvcnFyVkIvS2JQLzRTRVRyR0RuZXJUZkJXeVVmd25PTzJjaFNLNmkrQmxReDgrcm5naVdlUFBzZ2ZPQlpHUDFFMWZGSjlZb3JVbnl5YnM4WHBZZDhhaXhLWTRCZndiQ2l5Mk55MXpwSDNDNE1HL0dsZWlIYi81TW9vSERkeVlTa0g4YmxHSm0zeC9mNi9VcEVJQ05LZGRVaEtkenR5Uy9YRG9jT2pUVlNnMGFadm5rMFoybU5VOSswTHVDWENNTkRyZzUvUjZWdlV6U2VhRWtPMjRQVnZiRHFIRXRTUVV0dUNqdDZDMlVaV3NkYnIySTNaVW16Y1cxeTFDQWUzS2lMT2xTU1c1dE9sc2ZLZ3FDMGxnN2VXZmZWeGdvMHlZMU5GbFhSQ3pWazVNT2tIYldSVzUrSDZxUWFaMERvWXVySHZlaVZETGNvNTl2Y3JJbFlvcDlQV0wyaE1ENEhiWGdaTzhMYzU5aUEvTzR0aUZMQm5sUXN0MjNLOWM3cUJHUG5hNVdjcU5zMTJWcHI4bXhrUDRJSzNXL1AwZEtVM2VpSnFTbG9DUUZTS0JFR3JTUGdnVm9QOEdSRVU1cXJlcnVkZzZFbTZYTlgzN1pnYWZoa2J2WWd2TmFtbDdScEpBQ3V6aDc4Q25sZGVya0pQWHJoRXFZbG9LOStpZUF5N05uemMwaU5oSVNZdGhuU2g2WDNXUllXS3BEaWdvbzRtME5zYUgraE51MExBWmZ2QjZNcVpTY2RxMkx0YnozdkdrbHZMSW9wcjlCTzRDNXRkZHFPWUg4VXFub28xdFBMSUNIb3djUG1ydHU3K1ZzL2wwK05NV0hxVWlJL3B2UUV6TVJjMStud3E2cUlZY3lVajc3NFU3VitNMVY1VzFuempYTnlZc0hOVmErRTZGMVJhazd5MkVvYmJhak5POGxVaFBqaEZ4UlhKcWVwd0NHTDM5dkJOUlRnNDl5NldXOWRjNkV5L29vNkdJRk9WWlpLUWdud1R1dktlZ2UyaWpnPQ==");
              localStorage.removeItem("helpShownCount");
              localStorage.removeItem("helpShownTimestamp");
            
              //Destropy cookies, and load the public user
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
               * Redirect the user to their user page, being careful to use their (new) database if they are in a couchapp (not the database they used to register/create this corpus)
               */
              var optionalCouchAppPath = OPrime.guessCorpusUrlBasedOnWindowOrigin(serverResults.user.corpuses[0].pouchname);
              app.get("corpus").logUserIntoTheirCorpusServer(serverResults.user.corpuses[0], dataToPost.username, dataToPost.password, function(){
                window.location.replace(optionalCouchAppPath+"user.html#corpus/new");
              });
            }
          },//end successful registration
          dataType : "",
          error : function(e,f,g){
            OPrime.debug("Error registering user", e,f,g);
            $(".welcome-screen-alerts").html(
                " Something went wrong, that's all we know. Please try again or report this to us if it does it again:  " + OPrime.contactUs);
            $(".welcome-screen-alerts").addClass("alert-error");
            $(".welcome-screen-alerts").removeClass("alert-success");
            $(".welcome-screen-alerts").show();
          }
        });
      } else{
        OPrime.debug("User has not entered good info. ");
          $(".welcome-screen-alerts").html("Your passwords don't seem to match. " + OPrime.contactUs );
          $(".welcome-screen-alerts").show();
          $(".register-new-user").removeClass("disabled");

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
      $.ajax({
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
            localStorage.removeItem("encryptedUser","confidential:VTJGc2RHVmtYMStBTDBmMVN3NVVxRldWdWVXcXBBODJuMmxicThPN0hUSmlRYkFCclRwSXFxYVNtV2o5WFdnYkhOR2JlTVEyRjZoSnRobG4rczArdWVmbXl1K1JMaDZCY1NpVGZGTTRubm02azhGZVlhQWxwMkZGZzFVeEhONVZ2UDFicHkwU1l1azVEc0VNOHRpWEZhL0wwdThiNmd2OVhyNUVMU1UxdERPZmpLc0MxR29CUjBxejQ1QTU1c0s0QmdoempIS052YlJlYTRWVVNiTC9SeGNXeFU4eGN6NUp1Z3FQVjlJOTBPeS83ckNBNlZCdVdGYWhYU0ZzYXJhMm14NVN1dE82Yjk1enpaaitTci9CV0pKZWNXbklTNkRyRVlmYmczcGRXemVlcFMwUGRKY0NMRmhGNHp3aEpTNjBxRHU5Si9KUzNTR2dadEJaYWkyd0p2NExpdG9kOXB4YkNIYXQvR21hMTg3QnZFbkhqZmZMazQvZURySkwvTGxkRUUwTGZsdzg2VWduNnZpS3ZFOElWT1RPaXZIbFUzTEdqOFJWYTZrd2dPM3J2ci9EY2dKb24vUkxwUXBrVkZVdUlEektLeXN0WG0rSFQvSEtoZFVQQVdNdTNEWXdUcDI3SUM1NVMyNW5tQ3ZaM1FTeUxiOFk2SWQ5Q0x2dFk4d0ZQRTZVRjdqNnpEem1IRHN2QVBjU0xuQ2k3RGJPWG9BUTFqeFRpald0WW1pSkJ6WXIwNHFFb0xIMk5pN2hjaThiemFCN0Vva0t1b0Vpbm9wbGxGazBseTlkNUtEWE1ma1JncFFYWGNEaUxrQmR3YnhneThaSjlRT0Fqc0kzQXRPQndRUUJMNkVmbTZRUWg5OGFDZWRMVmxFWXQwV2VKSmhCSEJqMDlqcE9qcnkzNUVPMktTU2EwK0lTU0drN1pYd1RWci9vbGlBZHZ4TzNaWGFsWjZMMTNaUWJreU5PWVlXVlU5akJOeTNlYmFaY0NiUTdSL2tNNjFzMVZ2VjJBQmF0NFNKeXJKZkIrbTFSSC9lOE1zU3ppWng0aVZGMzhzOWZWQVV5ZFpUZUpabVM4NVEzNWlDWHpKbkVmcFJLOHFEWGdueFdxTHZtemxkZERXOVNoLzBkdjlneFNKZ05IY08xbU1aUFp0RzErMEVuNUtqbDlLZFovZGhPTGtibmVTdktTRXFZcDhvZnRNbFIzdVlxMXFoQVQ2bjNPQ3FoRmQ4Q3R4YUxTajhNaHBMeFVseEdCNjZvNkNUN2JOMk1ZbGZNV0RycG9Tak9XMUVZZGovN0lrREdVdEZsVDF4SWtIcmVYNlJsNWRQSzVLdTQrbUdGSHI4RkNDZGVINlF1M1FyTGNKR3dJY0tSTW9xYStaRndYU2gvTW1RQ1oyc3VTdVVzSkJIcmg3TFRzei9uY2pGZXZJSmdqb3hZczY3bkxMZmM4QkVrc3R5ZnNkYlJWZlRkeG9ZVitaTC9DeDFFdXlPU1pKSjZBTG9iVytlaEhxMVNFSVRHUEFhMk5RdEN6NlNrYlR6QmJtSCt5bjkzMGlwSDRUSUF1M0l3ME0xRVhrUDVCWVU5bjF0VWxXaUxBdllUVUV6OHBVenpiTUpmOGNtVTB1NWlCOFFZb1hmTW5UL2wwbk1JUm1KT1A1S3BOME9RSEZORWNmb0hmY3dScEl6ZlNVeEUvcXFTV1N3cHhqRXh5aHVEZWllcXBhNlVBbGM3RitTS1pHc21VeTRmUFA5UjMxNy92UEhHakgrWStnMEVIUmN3NUdiY1lRT3ZTMkNSdzl6bXNZL2NQUlFEbzQ4Q2hHL2VzTEhTTzJ1aTkzcURSNHI0aEw4OXRCYXE2REJiaWJSZ1dvWUs0aFdpVG50TGtZd1Z1MGExQkVDZkpsMEZWR0xpemJIalMvek5VSDdtVWh1QWhjZzc3OU0yZGNrTWhaTmZsMC9STWRqcE9aYUpESlMwbkdhTjRNZFZuY3BDZ202TWQ3c0xVcDhWUWlucGEvWGlxbXpVMG9qekpYczRxVTJ5Z0R1a1IrdnZBenAvaDhFeTUzM0NpY2paamdIS0s4a0IrU0NZQ1BaSENOSWhoMVhFVE9Od2tUbzIrVitGL0JtRGVLQWd6TWJta08xKzJ5eG9tYTJqL2E1YWgreUx1VXFNMTlJVWVINUg2cjZmL0QwZmN5RUsrRGZ0NzRhUGFUU01FYitxRFBEc1NDNVZCZ0JoRTJSa2loM3dHQVUwVTEyNU83NTVaekpMOUM3eFRyOUt5SWxjT1VrMzREamwvNkRzWmw5NzZLc1ZOV0tlaHpJSVVNVzBSSVgxTjJ4aXRoTVJVVkpodlU3OUlzT2UvWWlMZER5OFFRcHRpc214dS95ZGRlQyt2Z1BFMFdWb2xKVmprbU1HT0RMNC9YbEZkZFpncG9tMWowRkpqZnRPUHpJbElvSkwvYUVHR0puK3E2em1SZGlwcjk3Tkp3RkxUNmFUN3V4UjdMWmk2cVZxQjFmZkN3VTJVRWVVQWFJZUovQTlYZjgzTnptK1Yxb1BTSDZFSXVXZzFzVm42UEtyL3JlM2Vscks5YitpU08yeWdOTkxsb2plK0EvMlRmc0J3dmFxMThuaTFKeTh6RXVlL2E1a1krOStnSkdOQThsR3BLRUVXbEF1UFFlWDVobUR3MXNsMTJXMUtmYWc1UFRNOGFyQy9LL0FjVzltQUlFTXFpWVl6WmZJM25jUzI0MFByQ1BFRDFFQW9IMDdjbUZQQ1VycW5MRmxKZjl6blJIUmU2NmpHVjQ0SGNOcnZhSGZxMVRRQytaY056ckFxblN1ZC9wWVNDNHhLeGVoeWF4M2xDdzNsbzR0LzhlNHZVZWxwVFpjcUtOaDdXL0p0YlpwNkJrV2JmQldjc21ETEozcC9qM3ZDaG1rcXV0eWxxd0VCS3U1YnluamlrRDlFZEd3SDVwbURRQmsrQ0xoLzhXY0NveE9sT3dMV2EvTUY0VVdnQTlmOHdCUjV1T2VVMUcrUzFjSzBqKzRDbTltc2ZzbnNrZGlCQUVqdjIxbTQ5YituUEZVRkkyYURqUHdFL0Y4RmtTbFRJc1ZuK2hQVmVlMVFPVzFxU0tzZDdHUU1pNWtzSU5nNEp2ZnloMjVZaEwzdmR5VkpJTjhWdXRmQWV4aUhEZUMvbW5qcjh6Z3hkMS9Tb3FCZTluTWJTUUxCQXVlM0hZbXBSNWdBWllFcUdENmRIK0dtUURzQzJCSjVwakZEd1V0MG05ZU5KR0VTdERLZmxZUDJrTE1ReEc5a2FmVmt1SUk4bEMvZVhZNEpYWnR3Q0o4L1hKUVJ6SStQOXJHclpDYWU4Qk9qbDdwcVhkazBISnhVUUFtRkhFc0w1S0NNdWpiT0JEL1FKK25QMldYNXJib2YydWY3MUNNZ2ZaT3FFalFkSmZZblNveDlWQnFJTXFsOVh4R0lHL0RqcEttYXpmV2hneFMwb09DakRPTldKZnRYTk5FUDN5MWJaY0dhdnl0OFVnaklBa3pLRVJjNGhkaUY2ZktoRjhyN1Nhc2JyS3J6OWxHU25FWEhMTEUvcnFyVkIvS2JQLzRTRVRyR0RuZXJUZkJXeVVmd25PTzJjaFNLNmkrQmxReDgrcm5naVdlUFBzZ2ZPQlpHUDFFMWZGSjlZb3JVbnl5YnM4WHBZZDhhaXhLWTRCZndiQ2l5Mk55MXpwSDNDNE1HL0dsZWlIYi81TW9vSERkeVlTa0g4YmxHSm0zeC9mNi9VcEVJQ05LZGRVaEtkenR5Uy9YRG9jT2pUVlNnMGFadm5rMFoybU5VOSswTHVDWENNTkRyZzUvUjZWdlV6U2VhRWtPMjRQVnZiRHFIRXRTUVV0dUNqdDZDMlVaV3NkYnIySTNaVW16Y1cxeTFDQWUzS2lMT2xTU1c1dE9sc2ZLZ3FDMGxnN2VXZmZWeGdvMHlZMU5GbFhSQ3pWazVNT2tIYldSVzUrSDZxUWFaMERvWXVySHZlaVZETGNvNTl2Y3JJbFlvcDlQV0wyaE1ENEhiWGdaTzhMYzU5aUEvTzR0aUZMQm5sUXN0MjNLOWM3cUJHUG5hNVdjcU5zMTJWcHI4bXhrUDRJSzNXL1AwZEtVM2VpSnFTbG9DUUZTS0JFR3JTUGdnVm9QOEdSRVU1cXJlcnVkZzZFbTZYTlgzN1pnYWZoa2J2WWd2TmFtbDdScEpBQ3V6aDc4Q25sZGVya0pQWHJoRXFZbG9LOStpZUF5N05uemMwaU5oSVNZdGhuU2g2WDNXUllXS3BEaWdvbzRtME5zYUgraE51MExBWmZ2QjZNcVpTY2RxMkx0YnozdkdrbHZMSW9wcjlCTzRDNXRkZHFPWUg4VXFub28xdFBMSUNIb3djUG1ydHU3K1ZzL2wwK05NV0hxVWlJL3B2UUV6TVJjMStud3E2cUlZY3lVajc3NFU3VitNMVY1VzFuempYTnlZc0hOVmErRTZGMVJhazd5MkVvYmJhak5POGxVaFBqaEZ4UlhKcWVwd0NHTDM5dkJOUlRnNDl5NldXOWRjNkV5L29vNkdJRk9WWlpLUWdud1R1dktlZ2UyaWpnPQ==");
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
            var optionalCouchAppPath = OPrime.guessCorpusUrlBasedOnWindowOrigin(serverResults.user.mostRecentIds.couchConnection.pouchname);
            
            var previouscorpusinfo = "";
            if(serverResults.user.mostRecentIds && serverResults.user.mostRecentIds.couchConnection && serverResults.user.mostRecentIds.couchConnection.pouchname && serverResults.user.mostRecentIds.couchConnection.corpusid){
              previouscorpusinfo = "#corpus/" + serverResults.user.mostRecentIds.couchConnection.pouchname+"/"+ serverResults.user.mostRecentIds.couchConnection.corpusid;
            }
            app.get("corpus").logUserIntoTheirCorpusServer(serverResults.user.mostRecentIds.couchConnection, dataToPost.username, dataToPost.password, function(){
              if(previouscorpusinfo){
                window.location.replace(optionalCouchAppPath+"corpus.html");
              }else{
                window.location.replace(optionalCouchAppPath+"user.html");
              }
            });
          }
        },//end successful registration
        dataType : "",
        error : function(e,f,g){
          OPrime.debug("Error syncing user", e,f,g);
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