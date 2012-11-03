define([
    "backbone", 
    "handlebars", 
    "activity/Activity",
    "activity/ActivityFeed",
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
    "text!_locales/en/messages.json",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars, 
    Activity,
    ActivityFeed,
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
      Utils.debug("USER welcome init: " );
      this.model = new User();
      this.model.set("username","yourusernamegoeshere");
      if(LocaleData){
          window.Locale = JSON.parse(LocaleData);
        }else{
          window.Locale = {};
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
        window.location.href = Utils.authUrl+"/auth/twitter";
      },
      "click .register-facebook" : function() {
        window.location.href = Utils.authUrl+"/auth/facebook";
      },

      "click .sync-lingllama-data" : function() {
        console.log("hiding user welcome, syncing lingllama");
        this.syncUser("lingllama","phoneme", Utils.authUrl);

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
      Utils.debug("USER render: " );

      if (this.model != undefined) {
        this.model.set("username", this.model.get("username").toLowerCase().replace(/[^0-9a-z]/g,""));
        // Display the UserWelcomeView
        this.setElement($("#user-welcome-modal"));
        $(this.el).html(this.template(this.model.toJSON()));
        $(".registerusername").focus();
        $(this.el).find(".locale_Close_and_login_as_LingLlama").html(Locale["locale_Close_and_login_as_LingLlama"].message);
        $(this.el).find(".locale_Close_and_login_as_LingLlama_Tooltip").attr("title", Locale["locale_Close_and_login_as_LingLlama_Tooltip"].message);
        $(this.el).find(".locale_Log_In").html(Locale["locale_Log_In"].message);
        $(this.el).find(".locale_Username").html(Locale["locale_Username"].message);
        $(this.el).find(".locale_Password").html(Locale["locale_Password"].message);
        $(this.el).find(".locale_Sync_my_data_to_this_computer").html(Locale["locale_Sync_my_data_to_this_computer"].message);
//        $(this.el).find(".locale_Welcome_to_FieldDB").html(Locale["locale_Welcome_to_FieldDB"].message);
        $(this.el).find(".locale_An_offline_online_fieldlinguistics_database").html(Locale["locale_An_offline_online_fieldlinguistics_database"].message);
//        $(this.el).find(".locale_Welcome_Beta_Testers").html(Locale["locale_Welcome_Beta_Testers"].message);
        $(this.el).find(".locale_Create_a_new_user").html(Locale["locale_Create_a_new_user"].message);
//        $(this.el).find(".locale_What_is_your_username_going_to_be").html(Locale["locale_What_is_your_username_going_to_be"].message);
        $(this.el).find(".locale_New_User").text(Locale["locale_New_User"].message);
        $(this.el).find(".locale_Confirm_Password").text(Locale["locale_Confirm_Password"].message);
        $(this.el).find(".locale_Sign_in_with_password").text(Locale["locale_Sign_in_with_password"].message);
//        $(this.el).find(".locale_Warning").text(Locale["locale_Warning"].message);
//        $(this.el).find(".locale_Instructions_to_show_on_dashboard").html(Locale["locale_Instructions_to_show_on_dashboard"].message);

        //save the version of the app into this view so we can use it when we create a user.
        var self = this;
        Utils.getVersion(function (ver) { 
          self.appVersion = ver;
          $(self.el).find(".welcome_version_number").html("v"+ver);
        });
        $(this.el).find(".welcomeauthurl").val(Utils.authUrl);
        
      } else {
        Utils.debug("\User model was undefined");
      }

      return this;
    },
    
    registerNewUser : function() {
      $(".register-new-user").addClass("disabled");

      Utils.debug("Attempting to register a new user: " );
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
      dataToPost.authUrl = Utils.authUrl;
      dataToPost.appVersionWhenCreated = this.appVersion;
      //Send a pouchname to create
      var corpusConnection = Utils.defaultCouchConnection();
      corpusConnection.pouchname = "firstcorpus";
      dataToPost.corpuses = [corpusConnection];
      var activityConnection = Utils.defaultCouchConnection();
      activityConnection.pouchname = dataToPost.username+"-activity_feed";
      dataToPost.activityCouchConnection = activityConnection;
      dataToPost.gravatar = "./../user/user_gravatar.png";
     
      if (dataToPost.username != ""
        && (dataToPost.password == $(".to-confirm-password").val().trim())
        && dataToPost.email != "") {
        Utils.debug("User has entered an email and the passwords match. ");
        var a = new App();
        window.app = a;
        a.createAppBackboneObjects($(".registerusername").val().trim()+"-firstcorpus");//this is the convention the server is currently using to create first corpora
        
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
          url : Utils.authUrl + "/register",
          data : dataToPost,
          success : function(data) {
            if (data.errors != null) {
              $(".welcome-screen-alerts").html(data.errors.join("<br/>")+" "+Utils.contactUs );
              $(".welcome-screen-alerts").show();
            } else if (data.user) {
              

              /*
               * Create a new user, and put them into the authView, create a corpus, session and datalist for them then
               * dismiss modal
               */ 
              
//                a.createAppBackboneObjects(data.user.couchConnection.pouchname, function(){
                // Faking a login behavior, copy pasted from authentication auth function
                var auth  = a.get("authentication");
                auth.saveServerResponseToUser(data, function(){
                  var c = a.get("corpus");
                  c.set({
                    "title" : data.user.username + "'s Corpus",
                    "dataLists" : new DataLists(),
                    "sessions" : new Sessions(),
                    "team" : auth.get("userPublic"),
                    "couchConnection" : data.user.corpuses[0],
                    "pouchname" : data.user.corpuses[0].pouchname
                  });
                  //get the right corpus into the activity feed early, now that the user auth exists, this will work
                  a.set("currentCorpusTeamActivityFeed", new ActivityFeed());
                  var activityCouchConnection = JSON.parse(JSON.stringify(data.user.corpuses[0]));
                  activityCouchConnection.pouchname =  data.user.corpuses[0].pouchname+"-activity_feed";
                  a.get("currentCorpusTeamActivityFeed").changePouch(activityCouchConnection);
                  
                  a.set("currentUserActivityFeed", new ActivityFeed());
                  a.get("currentUserActivityFeed").changePouch(data.user.activityCouchConnection);
                
                  //This should trigger a redirect to the users page, which loads the corpus, and redirects to the corpus page.
                  c.saveAndInterConnectInApp();
                  
                  
//                  var s = a.get("currentSession");
//                  s.get("sessionFields").where({label: "user"})[0].set("mask", auth.get("userPrivate").get("username") );
//                  s.get("sessionFields").where({label: "consultants"})[0].set("mask", "XY");
//                  s.get("sessionFields").where({label: "goal"})[0].set("mask", "Change this session goal to the goal of your first elicitiation session.");
//                  s.get("sessionFields").where({label: "dateSEntered"})[0].set("mask", new Date());
//                  s.get("sessionFields").where({label: "dateElicited"})[0].set("mask", "Change this to a day for example: A few months ago, probably on a Monday night.");
//                  s.set("pouchname", data.user.corpuses[0].pouchname);
//                  s.changePouch(data.user.corpuses[0].pouchname);
//                  
//                  c.get("sessions").add(s);
//                  
//                  var dl = a.get("currentDataList");
//                  dl.set({
//                    "title" : "All Data",
//                    "dateCreated" : (new Date()).toDateString(),
//                    "description" : "This list contains all data in this corpus. " +
//                    "Any new datum you create is added here. " +
//                    "Data lists can be used to create handouts, prepare for sessions with consultants, " +
//                    "export to LaTeX, or share with collaborators. You can create a new data list by searching.",
//                    "pouchname" : data.user.corpuses[0].pouchname
//                  });
//                  dl.changePouch(data.user.corpuses[0].pouchname);
//                  c.get("dataLists").add(dl);
//                  
//                  c.changePouch(data.user.corpuses[0]);
//                  a.saveAndInterConnectInApp(function(){
////                    alert("save app succeeded");
//                    //Put this corpus's id into the couchconnection in the user so that we can fetch the private view of the corpus directly
//                    auth.get("userPrivate").get("corpuses")[0].corpusid = c.id;
//                    auth.saveAndInterConnectInApp(function(){
//                      localStorage.setItem("mostRecentCouchConnection",JSON.stringify(data.user.corpuses[0]));
//                      document.location.href='user.html#corpus/'+data.user.corpuses[0].pouchname+"/"+c.id; //TODO test this
//                    });
//                  }
//                  ,function(){
//                    alert("Bug! save app failed.");
//                  }
//                  );
                  // c.save(); //this is saving to add the corpus to the user's array of corpuses later on
//                  window.startApp(a, function(){
////                     auth.get("userPrivate").addCurrentCorpusToUser();
//                    window.setTimeout(function(){
//                      /*
//                       * Use the corpus just created to log the user into that corpus's couch server
//                       */
//                      var couchConnection = data.user.corpuses[0];
//                      $('#user-welcome-modal').modal("hide");//users might have unreliable pouches if they do things this early, but on web version they wont get successful callbacks from couch. TODO if and when we get CORS on iriscouch, move this back to after replicate corpus.
//                      c.logUserIntoTheirCorpusServer(couchConnection, dataToPost.username, dataToPost.password, function() {
//                        Utils.debug("Successfully authenticated user with their corpus server.");
//                        //Bring down the views so the user can search locally without pushing to a server.
//                        c.replicateFromCorpus(couchConnection, function(){
////                        appView.datumsEditView.newDatum();
////                          appView.datumsEditView.render();
//                        });
//                        //save the users' first dashboard so at least they will have it if they close the app.
//                        window.setTimeout(function(){
//                          window.app.get("authentication").get("userPublic").saveAndInterConnectInApp(function(){
//                            window.app.saveAndInterConnectInApp(function(){
//                              //replicate from both activity feeds to be sure that they have the search views
//                              window.appView.activityFeedCorpusTeamView.model.replicateFromActivityFeed(null, function(){
//                                window.appView.activityFeedUserView.model.replicateFromActivityFeed(null);
//                              });
//                            });
//                          });
//                        },10000);
//                        
//                      });
//                    }, 30000);//ask couch after 30 seconds (give it time to make the new user's design docs)
//                    Utils.debug("Loadded app for a new user.");
//                  });
                });
//                });
            }
          },//end successful registration
          dataType : ""
        });
      } else{
        Utils.debug("User has not entered good info. ");
          $(".welcome-screen-alerts").html("Your passwords don't seem to match. " + Utils.contactUs );
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
      a = new App();
      window.app = a;

      $(".welcome-screen-alerts").html("<p><strong>Please wait:</strong> Contacting the server...</p> <progress max='100'> <strong>Progress: working...</strong>" );
      $(".welcome-screen-alerts").addClass("alert-success");
      $(".welcome-screen-alerts").show();
      $(".welcome-screen-alerts").removeClass("alert-error");
      
      var auth = a.get("authentication");
      auth.authenticate(u, function(success, errors){
        if(success == null){
          $(".welcome-screen-alerts").html(
              errors.join("<br/>") + " " + Utils.contactUs);
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
            window.app.get("corpus").logUserIntoTheirCorpusServer(couchConnection, username, password, function(){
              //Replicate user's corpus down to pouch
              window.app.get("corpus").replicateFromCorpus(couchConnection, function(){
                //Must replicate before redirecting to dashboard, otherwise the pouch and corpus will be empty
                document.location.href='corpus.html';
              });
            }, function(errormessage){
              $(".welcome-screen-alerts").html(
                  errormessage+" " + Utils.contactUs);
              $(".welcome-screen-alerts").show();
              $(".welcome-screen-alerts").addClass("alert-error");
            });
          });
        }
      }, function(message){
        $(".welcome-screen-alerts").html(
            message+" Something went wrong, thats all we know. Please try again or report this to us if it does it again:  " + Utils.contactUs);
//      alert("Something went wrong, either we were unable to contact the server, or something is wrong with your login info.");
        $(".welcome-screen-alerts").show();
        $(".welcome-screen-alerts").addClass("alert-error");
//        $('#user-welcome-modal').modal("show");
      });
    }
  });

  return UserWelcomeView;
}); 