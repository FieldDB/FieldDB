define([
    "backbone", 
    "handlebars",
    "authentication/Authentication", 
    "user/User", 
    "user/UserReadView",
    "libs/Utils"
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
      Utils.debug("AUTH EDIT init: " + this.el);
      
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
      "click .login" : "login",
      "click #login_form" : function(e) {
        e.stopPropagation();
      },
      "click .corpus-settings" : function() {
        window.appView.toastUser("Taking you to the corpus settings screen which is where all the corpus/database details can be found.","alert-info","How to find the corpus settings:");
        window.appView.currentCorpusReadView.format = "fullscreen";
        window.appView.currentCorpusReadView.render();
        app.router.showFullscreenCorpus();
      },
      //
      "keyup #quick-authenticate-password" : function(e) {
        var code = e.keyCode || e.which;
        Utils.debug("This should fire when the user pushes enter but it doesnt. TODO might have to just use jquery in the render, insted of backbone which might limit it to the element...");
        // code == 13 is the enter key
        if ((code == 13) && ($("#quick-authenticate-password").val() != "")) {
          $("#quick-authentication-okay-btn").click();
        }
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
      Utils.debug("AUTH EDIT render: " + this.el);
      if (this.model == undefined) {
        Utils.debug("Auth model was undefined, come back later.");
        return this;
      }

      if(this.model.get("userPublic") != undefined){
        this.model.set( "gravatar", this.model.get("userPublic").get("gravatar") );
        this.model.set( "username", this.model.get("userPublic").get("username") );
      }
      // Display the AuthenticationEditView
      this.setElement($("#authentication-embedded"));
      $(this.el).html(this.template(this.model.toJSON()));

      if (this.model.get("state") == "loggedIn") {
        $("#logout").show();
        $("#login").hide();
        $("#login_form").hide();
        if(this.model.get("userPublic") != undefined){
          Utils.debug("\t rendering AuthenticationEditView's UserView");
          this.userView.setElement($("#user-quickview"));
          this.userView.render();
        }else{
          $("#user-quickview").html('<i class="icons icon-user icon-white">');
        }
      } else {
        $("#logout").hide();
        $("#login").show();
        $("#login_form").show();
        if(this.model.get("userPublic") != undefined){
          Utils.debug("\t rendering AuthenticationEditView's UserView");
          this.userView.setElement($("#user-quickview"));
          this.userView.render();
        }else{
          $("#user-quickview").html('<i class="icons icon-user icon-white">');
        }
        this.$el.children(".user").html("");
      }

      //localization
      $(this.el).find(".locale_Username").html(chrome.i18n.getMessage("locale_Username"));
      $(this.el).find(".locale_Password").html(chrome.i18n.getMessage("locale_Password"));
      $(this.el).find(".locale_Log_Out").html(chrome.i18n.getMessage("locale_Log_Out"));
      $(this.el).find(".locale_Log_In").html(chrome.i18n.getMessage("locale_Log_In"));
      $(this.el).find(".locale_Private_Profile").html(chrome.i18n.getMessage("locale_Private_Profile"));
      $(this.el).find(".locale_User_Settings").html(chrome.i18n.getMessage("locale_User_Settings"));
      $(this.el).find(".locale_Keyboard_Shortcuts").html(chrome.i18n.getMessage("locale_Keyboard_Shortcuts"));
      $(this.el).find(".locale_Corpus_Settings").html(chrome.i18n.getMessage("locale_Corpus_Settings"));
      $(this.el).find(".locale_Terminal_Power_Users").html(chrome.i18n.getMessage("locale_Terminal_Power_Users"));
      
      document.getElementById("authUrl").value = Utils.authUrl;

      
      return this;
    },
    
    /**
     * Logout removes the stringified user and the username from local storage,
     * and then authenticates public into the app.
     */
    logout : function() {
      localStorage.removeItem("username");
      localStorage.removeItem("mostRecentDashboard");
      localStorage.removeItem("mostRecentCouchConnection");
      
//      this.authenticateAsPublic();
      //Destropy cookies, and reload the page, it will put the user at the login page.
      Utils.setCookie("username", undefined, -365);
      Utils.setCookie("token", undefined, -365);
      window.location.replace("/index.html")

    },
    
    /**
     * Login tries to get the username and password from the user interface, and
     * calls the view's authenticate function.
     */
    login : function() {
      Utils.debug("LOGIN");
      this.authenticate(document.getElementById("username").value, 
          document.getElementById("password").value,
          document.getElementById("authUrl").value
      );
    },
    
    /**
     * Notes: Sapir's user comes from his time after his PhD and before his
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
            window.app.router.showDashboard();
          }else{
            /*
             *  Load their last corpus, session, datalist etc
             */
            var appids = self.model.get("userPrivate").get("mostRecentIds");
            window.app.loadBackboneObjectsByIdAndSetAsCurrentDashboard(couchConnection, appids);
          }
        }
        if(typeof corpusloginfailcallback == "function"){
          corpusloginfailcallback();
        }else{
          Utils.debug('no corpusloginfailcallback was defined');

        }
      };
      
      var self = this;
      this.model.authenticate(tempuser, function(success) {
        if (success == null) {
//          alert("Authentication failed. Authenticating as public."); //TODO cant use this anymore as a hook
//          self.authenticateAsPublic();
          return;
        }
        
        var couchConnection = self.model.get("userPrivate").get("corpuses")[0]; //TODO make this be the last corpus they edited so that we re-load their dashboard, or let them chooe which corpus they want.
        window.app.get("corpus").logUserIntoTheirCorpusServer(couchConnection, username, password, function(){
          if(typeof corpusloginsuccesscallback == "function"){
            Utils.debug('Calling corpusloginsuccesscallback');
            corpusloginsuccesscallback();
          }else{
            Utils.debug('no corpusloginsuccesscallback was defined');
          }
          //Replicate user's corpus down to pouch
          window.app.get("corpus").replicateFromCorpus(couchConnection, function(){
            if(self.model.get("userPrivate").get("mostRecentIds") == undefined){
              //do nothing because they have no recent ids
              alert("Bug: User does not have most recent ids, Cant show your most recent dashbaord.");
              window.app.router.showDashboard();
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
                Utils.debug("Calling loadBackboneObjectsByIdAndSetAsCurrentDashboard in AuthenticationEditView");
                if(window.app.loadBackboneObjectsByIdAndSetAsCurrentDashboard){
                  window.app.loadBackboneObjectsByIdAndSetAsCurrentDashboard(couchConnection, appids);
                }else{
                  console.log("Trying to fetch the corpus and redirect you to the corpus dashboard.");
                  window.app.showCorpusDashboard(couchConnection.pouchName, app.get("corpus").id);
                }
              }
            }                    
          });
        }, whattodoifcouchloginerrors);
        
        
        // Save the authenticated user in our Models
        self.model.set({
          gravatar : self.model.get("userPrivate").get("gravatar"),
          username : self.model.get("userPrivate").get("username"),
          state : "loggedIn"
        });
        if(typeof sucescallback == "function"){
          sucescallback();
        }
      }, failcallback);
    },
    
    /**
     * Authenticate as Public simply sends "public" to the authenticate method,
     * which contacts the server most likleyt o do things like recent activity
     * of the "public" user etc.
     */
    authenticateAsPublic : function() {
      // Load the public user

      this.userView.loadPublic();
      u = this.userView.model;
      
      // Save the public user in our Models
      this.model.set({
        user : u,
        username : u.get("username"),
        state : "logggedOut"
      });
      
      // Save the public user in localStorage
//      localStorage.setItem("username", u.get("username"));
    },
    
    /**
     * AuthenticatePreviousUser is intended to be called on page load, it looks
     * for a stringified user in the localstorage, and loads them with no
     * authentication. If the authentication is stale, it will do a quick
     * password authentication view to let user know they haven't been active in
     * a while.
     * 
     * @deprecated
     */
    authenticatePreviousUser : function() {
      return; //TODO this function needs to be removed
      
//      
//      var userid = localStorage.getItem("userid");
//      if (userid) {
//        //TODO this needs testing
//        // Save the  user in our Models
//        this.model.get("userPublic").id = userid;
//        this.model.get("userPublic").fetch();
//        this.model.syncUserWithServer();
//        
//      } else {
//        this.model.set("state", "loggedOut");
//        this.authenticateAsPublic(); //TODO this will be used in production
//      }
    },
    
    /**
     * ShowQuickAuthentication view popups up a password entry view.
     * This is used to unlock confidential datum, or to unlock dangerous settings
     * like removing a corpus. It is also used if the user hasn't confirmed their
     * identity in a while.
     */
    showQuickAuthenticateView : function(authsuccesscallback, authfailurecallback, corpusloginsuccesscallback, corpusloginfailcallback) {
      var self = this;
      if( this.model.get("userPrivate").get("username") == "sapir" ){
        $("#quick-authenticate-modal").modal("show");
        $("#quick-authenticate-password").val("phoneme")
        window.hub.subscribe("quickAuthenticationClose",function(){
          //TODO show a modal instead of alert
//          alert("Authenticating quickly, with just password, (if the user is not sapir, if its sapir, just authenticating him with his password)... At the moment I will use the pasword 'test' ");
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
          //TODO show a modal instead of alert
//          alert("Authenticating quickly, with just password, (if the user is not sapir, if its sapir, just authenticating him with his password)... At the moment I will use the pasword 'test' ");
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
    }
  });

  return AuthenticationEditView;
});