define([
    "backbone", 
    "handlebars", 
    "app/App",
    "authentication/Authentication",
    "corpus/Corpus",
    "data_list/DataList",
    "data_list/DataLists",
    "datum/Datum",
    "datum/DatumFields",
    "datum/Session",
    "datum/Sessions",
    "user/User",
    "text!locales/en/messages.json",
    "libs/OPrime"
], function(
    Backbone, 
    Handlebars, 
    App,
    Authentication,
    Corpus,
    DataList,
    DataLists,
    Datum,
    DatumFields,
    Session,
    Sessions,
    User,
    LocaleData
) {
  var UserWelcomeView = Backbone.View.extend(
  /** @lends UserWelcomeView.prototype */
  {
    /**
     * @class The UserWelcomeView invites the user to login using their existing
     *        name to sync their data, or to login as the sample user, lingllama
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      if (OPrime.debugMode) OPrime.debug("USER welcome init: " );
      this.model = new User();
      this.model.set("username","yourusernamegoeshere");
      
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
      
      this.model.bind("change", this.render, this);
    },


    /**
     * The underlying model of the UserWelcomeView is a User.
     */
    model : User,
    
    /**
     * Events that the UserWelcomeView is listening to and their handlers.
     */
    events : {
      "click .registerusername" : function(e){
        e.target.select();
      },
      
      "keyup .registerusername" : function(e) {
        var code = e.keyCode || e.which;
        
        // code == 13 is the enter key
        if ((code == 13) && (this.$el.find(".registerusername").val().trim() != "YourNewUserNameGoesHere")) {
          this.model.set("username", $(".registerusername").val().trim());
          $(".confirm-password").show();
          $(".registerpassword").focus();
        }
      },
      "click .new-user-button" : function() {
        this.model.set("username", $(".registerusername").val().trim());
        $(".confirm-password").show();
        $(".registerpassword").focus();
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

      "click .sync-lingllama-data" : function() {
        console.log("hiding user welcome, syncing lingllama");
        this.syncUser("lingllama","phoneme", OPrime.authUrl);

//        //This is the old logic which can still be used to load lingllama without contacting a server. DO NOT DELETE
//        a = new App();
//        a.createAppBackboneObjects("lingllama-firstcorpus",function() {
//          $('#user-welcome-modal').modal("hide");
//          window.startApp(a, function() {
//            window.appView.loadSample();
//          });
//        });
      },

      "click .sync-my-data" : function() {
        this.syncUser($(".welcomeusername").val().trim(),$(".welcomepassword").val().trim(), $(".welcomeauthurl").val().trim());
      },
      "click .welcomeusername" : function(e) {
        return false;
      },
      "click .welcomepassword" : function(e) {
        return false;
      },
      "click .welcomeauthurl" : function(e) {
        return false;
      },
      "keyup .welcomepassword" : function(e) {
        var code = e.keyCode || e.which;
        
        // code == 13 is the enter key
        if (code == 13) {
          this.syncUser($(".welcomeusername").val().trim(), $(".welcomepassword").val().trim(), $(".welcomeauthurl").val().trim());
        }
      }
    },

    /**
     * The Handlebars template rendered as the UserWelcomeView
     */
    template : Handlebars.templates.user_welcome_modal,


    /**
     * Renders the UserWelcomeView and its partial.
     */
    render : function() {
      if (OPrime.debugMode) OPrime.debug("USER render: " );

      if (this.model != undefined) {
        this.model.set("username", this.model.get("username").toLowerCase().replace(/[^0-9a-z]/g,""));
        // Display the UserWelcomeView
        this.setElement($("#user-welcome-modal"));
        $(this.el).html(this.template(this.model.toJSON()));
        $(".registerusername").focus();
        $(this.el).find(".locale_Close_and_login_as_LingLlama").html(Locale.get("locale_Close_and_login_as_LingLlama"));
        $(this.el).find(".locale_Close_and_login_as_LingLlama_Tooltip").attr("title", Locale.get("locale_Close_and_login_as_LingLlama_Tooltip"));
        $(this.el).find(".locale_Log_In").html(Locale.get("locale_Log_In"));
        $(this.el).find(".locale_Username").html(Locale.get("locale_Username"));
        $(this.el).find(".locale_Password").html(Locale.get("locale_Password"));
        $(this.el).find(".locale_Sync_my_data_to_this_computer").html(Locale.get("locale_Sync_my_data_to_this_computer"));
//        $(this.el).find(".locale_Welcome_to_FieldDB").html(Locale.get("locale_Welcome_to_FieldDB"));
        $(this.el).find(".locale_An_offline_online_fieldlinguistics_database").html(Locale.get("locale_An_offline_online_fieldlinguistics_database"));
//        $(this.el).find(".locale_Welcome_Beta_Testers").html(Locale.get("locale_Welcome_Beta_Testers"));
        $(this.el).find(".locale_Create_a_new_user").html(Locale.get("locale_Create_a_new_user"));
//        $(this.el).find(".locale_What_is_your_username_going_to_be").html(Locale.get("locale_What_is_your_username_going_to_be"));
        $(this.el).find(".locale_New_User").text(Locale.get("locale_New_User"));
        $(this.el).find(".locale_Confirm_Password").text(Locale.get("locale_Confirm_Password"));
        $(this.el).find(".locale_Sign_in_with_password").text(Locale.get("locale_Sign_in_with_password"));
//        $(this.el).find(".locale_Warning").text(Locale.get("locale_Warning"));
//        $(this.el).find(".locale_Instructions_to_show_on_dashboard").html(Locale.get("locale_Instructions_to_show_on_dashboard"));

//        /*
//         * Workaround for Bootstrap dropdowns not being clickable in android.
//         */
//        $('body').on('touchstart.dropdown', '.dropdown-menu', function (e) { 
//          e.stopPropagation(); 
//        });
//        $(document).on('click','.dropdown-menu a',function(){
//          document.location = $(this).attr('href');
//        });

        
        //save the version of the app into this view so we can use it when we create a user.
        var self = this;
        OPrime.getVersion(function (ver) { 
          self.appVersion = ver;
          $(self.el).find(".welcome_version_number").html("v"+ver);
        });
        $(this.el).find(".welcomeauthurl").val(OPrime.authUrl);
        
      } else {
        if (OPrime.debugMode) OPrime.debug("\User model was undefined");
      }

      return this;
    },
    
    registerNewUser : function() {
      $(".register-new-user").addClass("disabled");

      if (OPrime.debugMode) OPrime.debug("Attempting to register a new user: " );
      /*
       * Set defaults for new user registration here,
       * WARNING: mongoose auth wont keep any attributes that are empty {} or [] 
       * 
       * appView.authView.model.get("userPrivate").set("gravatar","./../user/tilohash_gravatar.png")
       * {"username":"bob3","password":"","email":"","gravatar":"./../user/tilohash_gravatar.png","researchInterest":"","affiliation":"","description":"","subtitle":"","corpuses":[{"pouchname":"bob3-firstcorpus","port":"443","domain":"ilanguage.iriscouch.com","protocol":"https://"}],"dataLists":[],"prefs":{"skin":"images/skins/stone_figurines.jpg","numVisibleDatum":3},"mostRecentIds":{"corpusid":"2DD73120-F4E5-4A9C-97F7-8F064C5CD6A8","sessionid":"40490877-F8B3-4390-901D-E5838535B01C","datalistid":"AD0B8232-C362-4B0E-80B2-4C3FBBE97421"},"firstname":"","lastname":"","teams":[],"sessionHistory":[],"activityHistory":[],"permissions":{},"hotkeys":{"firstKey":"","secondKey":"","description":""},"id":"4ffb3c6470fbe6d209000005","hash":"$2a$10$9XybfL5OeR4BFJtrifu9H.3MPjJQQnl9uTbXeBdajrjCyABExQId.","salt":"$2a$10$9XybfL5OeR4BFJtrifu9H.","login":"bob3","google":{},"github":{"plan":{}},"twit":{},"fb":{"name":{}},"_id":"4ffb3c6470fbe6d209000005"}
       */
      var dataToPost = {};
      $(".registerusername").val( $(".registerusername").val().trim().toLowerCase().replace(/[^0-9a-z]/g,"") );
//      dataToPost.login = $(".registerusername").val().trim().toLowerCase().replace(/[^0-9a-z]/g,"");
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
        if (OPrime.debugMode) OPrime.debug("User has entered an email and the passwords match. ");
        var a = new App({
          filledWithDefaults : true,
          loadTheAppForTheFirstTime : true
        });
        window.app = a;
        a.createAppBackboneObjects($(".registerusername").val().trim()+"-firstcorpus", function(){
          a.get("corpus").fillWithDefaults();
        });//this is the convention the server is currently using to create first corpora

        $(".welcome-screen-alerts").html("<p><strong>Please wait:</strong> Contacting the server to prepare your first corpus/database for you...</p> <progress max='100'> <strong>Progress: working...</strong>" );
        $(".welcome-screen-alerts").addClass("alert-success");
        $(".welcome-screen-alerts").show();
        $(".welcome-screen-alerts").removeClass("alert-error");
        $(".register-new-user").addClass("disabled");
        $(".register-new-user").attr("disabed","disabled");
        /*
         * Contact the server and register the new user
         */
        OPrime.makeCORSRequest({
          type : 'POST',
          url : OPrime.authUrl + "/register",
          data : dataToPost,
          success : function(serverResults) {
            if (serverResults.userFriendlyErrors != null) {
              $(".welcome-screen-alerts").html(serverResults.userFriendlyErrors.join("<br/>")+" "+OPrime.contactUs );
              $(".welcome-screen-alerts").show();
            } else if (serverResults.user) {
              
              
              /*
               * Create a new user, and put them into the authView, create a corpus, session and datalist for them then
               * dismiss modal
               */ 
              
                // Faking a login behavior, copy pasted from authentication auth function
                var auth  = a.get("authentication");
                auth.saveServerResponseToUser(serverResults, function(){
                  
                  /*TOOD how to use jquery couch ot replicate the pages from public to the user, however this might require special login?
                   * http://bradley-holt.com/2011/07/couchdb-jquery-plugin-reference/
                   */
//                  $.couch.replicate("public", "serverResults.user.corpuses[0].pouchname", {
//                    success: function(data) {
//                      console.log(data);
                      
                      var c = a.get("corpus");
                      c.set({
                        "title" : serverResults.user.username + "'s Corpus",
                        "description": "This is your first Corpus, you can use it to play with the app... When you want to make a real corpus, click New : Corpus",
                        "team" : auth.get("userPublic"),
                        "couchConnection" : serverResults.user.corpuses[0],
                        "pouchname" : serverResults.user.corpuses[0].pouchname
                      });
                      
                      c.logUserIntoTheirCorpusServer(null, dataToPost.username, dataToPost.password, function(){
                        //This should trigger a redirect to the users page, which loads the corpus, and redirects to the corpus page.
                        c.saveAndInterConnectInApp();
                      });
                      
                      
//                    },
//                    error: function(status) {
//                      console.log(status);
//                    }
//                  }, {
//                    create_target: false
//                  });

                  
                });
//                });
            }
          },//end successful registration
          dataType : ""
        });
      } else{
        if (OPrime.debugMode) OPrime.debug("User has not entered good info. ");
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
    syncUser : function(username,password, authUrl){
      console.log("hiding user welcome, syncing users data");
      var u = new User({username:username, password: password, authUrl: authUrl });
      a = new App({
        filledWithDefaults : true,
        loadTheAppForTheFirstTime : true
      });
      window.app = a;

      $(".welcome-screen-alerts").html("<p><strong>Please wait:</strong> Contacting the server...</p> <progress max='100'> <strong>Progress: working...</strong>" );
      $(".welcome-screen-alerts").addClass("alert-success");
      $(".welcome-screen-alerts").show();
      $(".welcome-screen-alerts").removeClass("alert-error");
      
      var auth = a.get("authentication");
      auth.authenticate(u, function(success, errors){
        if(success == null){
          $(".welcome-screen-alerts").html(
              errors.join("<br/>") + " " + OPrime.contactUs);
//        alert("Something went wrong, we were unable to contact the server, or something is wrong with your login info.");
          $(".welcome-screen-alerts").show();
          $(".welcome-screen-alerts").addClass("alert-error");
//          $('#user-welcome-modal').modal("show");
        }else{
          $(".welcome-screen-alerts").html("Attempting to sync your data to this tablet/laptop...</p> <progress max='100'> <strong>Progress: working...</strong>" );
          $(".welcome-screen-alerts").addClass("alert-success");
          $(".welcome-screen-alerts").removeClass("alert-error");
          $(".welcome-screen-alerts").show();
          //TODO let them choose their corpus
          a.createAppBackboneObjects(auth.get("userPrivate").get("corpuses")[0].pouchname, function(){
            var couchConnection = auth.get("userPrivate").get("corpuses")[0];
            window.app.logUserIntoTheirCorpusServer(couchConnection, username, password, function(){
              //Replicate user's corpus down to pouch
              window.app.replicateOnlyFromCorpus(couchConnection, function(){
                //Must replicate before redirecting to dashboard, otherwise the pouch and corpus will be empty
                document.location.href='corpus.html';
              });
            }, function(errormessage){
              $(".welcome-screen-alerts").html(
                  errormessage+" " + OPrime.contactUs);
              $(".welcome-screen-alerts").show();
              $(".welcome-screen-alerts").addClass("alert-error");
            });
          });
        }
      }, function(message){
        $(".welcome-screen-alerts").html(
            message+" Something went wrong, thats all we know. Please try again or report this to us if it does it again:  " + OPrime.contactUs);
//      alert("Something went wrong, either we were unable to contact the server, or something is wrong with your login info.");
        $(".welcome-screen-alerts").show();
        $(".welcome-screen-alerts").addClass("alert-error");
//        $('#user-welcome-modal').modal("show");
      });
    }
  });

  return UserWelcomeView;
}); 