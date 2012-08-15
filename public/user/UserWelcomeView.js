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
    User
) {
  var UserWelcomeView = Backbone.View.extend(
  /** @lends UserWelcomeView.prototype */
  {
    /**
     * @class The UserWelcomeView invites the user to login using their existing
     *        name to sync their data, or to login as the sample user, sapir
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("USER welcome init: " + this.el);
      this.model = new User();
      this.model.set("username","yourusernamegoeshere");
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
      "click .username" : function(e){
        e.target.select();
      },
      
      "keyup .username" : function(e) {
        var code = e.keyCode || e.which;
        
        // code == 13 is the enter key
        if ((code == 13) && (this.$el.find(".username").val() != "YourNewUserNameGoesHere")) {
          this.model.set("username", $(".username").val());
          $(".confirm-password").show();
          $(".password").focus();
        }
      },
      "click .new-user-button" : function() {
        this.model.set("username", $(".username").val());
        $(".confirm-password").show();
        $(".password").focus();
      },
      "click .register-new-user" : "registerNewUser",
      "keyup .to-confirm-password" : function(e) {
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

      "click .sync-sapir-data" : function() {
        console.log("hiding user welcome, syncing sapir");
        this.syncUser("sapir","phoneme");

//        //This is the old logic which can still be used to load sapir without contacting a server. DO NOT DELETE
//        a = new App();
//        a.createAppBackboneObjects("sapir-firstcorpus",function() {
//          $('#user-welcome-modal').modal("hide");
//          window.startApp(a, function() {
//            window.appView.loadSample();
//          });
//        });
      },

      "click .sync-my-data" : function() {
        this.syncUser($(".welcomeusername").val(),$(".welcomepassword").val());
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
          this.syncUser($(".welcomeusername").val(),$(".welcomepassword").val());
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
      Utils.debug("USER render: " + this.el);

      if (this.model != undefined) {
        this.model.set("username", this.model.get("username").toLowerCase().replace(/[^0-9a-z]/g,""));
        // Display the UserWelcomeView
        this.setElement($("#user-welcome-modal"));
        $(this.el).html(this.template(this.model.toJSON()));
        $(".username").focus();
        $(this.el).find(".locale_Close_and_login_as_Ed_Sapir").html(chrome.i18n.getMessage("locale_Close_and_login_as_Ed_Sapir"));
        $(this.el).find(".locale_Log_In").html(chrome.i18n.getMessage("locale_Log_In"));
        $(this.el).find(".locale_Username").html(chrome.i18n.getMessage("locale_Username"));
        $(this.el).find(".locale_Password").html(chrome.i18n.getMessage("locale_Password"));
        $(this.el).find(".locale_Sync_my_data_to_this_computer").html(chrome.i18n.getMessage("locale_Sync_my_data_to_this_computer"));
        $(this.el).find(".locale_Welcome_to_iField").html(chrome.i18n.getMessage("locale_Welcome_to_iField"));
        $(this.el).find(".locale_An_offline_online_fieldlinguistics_database").html(chrome.i18n.getMessage("locale_An_offline_online_fieldlinguistics_database"));
        $(this.el).find(".locale_Welcome_Beta_Testers").html(chrome.i18n.getMessage("locale_Welcome_Beta_Testers"));
        $(this.el).find(".locale_Create_a_new_user").html(chrome.i18n.getMessage("locale_Create_a_new_user"));
        $(this.el).find(".locale_What_is_your_username_going_to_be").html(chrome.i18n.getMessage("locale_What_is_your_username_going_to_be"));
        $(this.el).find(".locale_New_User").text(chrome.i18n.getMessage("locale_New_User"));
        $(this.el).find(".locale_Confirm_Password").text(chrome.i18n.getMessage("locale_Confirm_Password"));
        $(this.el).find(".locale_Sign_in_with_password").text(chrome.i18n.getMessage("locale_Sign_in_with_password"));
        $(this.el).find(".locale_Warning").text(chrome.i18n.getMessage("locale_Warning"));
        $(this.el).find(".locale_This_is_a_beta_version").html(chrome.i18n.getMessage("locale_This_is_a_beta_version"));


      } else {
        Utils.debug("\User model was undefined");
      }

      return this;
    },
    
    registerNewUser : function() {
      $(".register-new-user").addClass("disabled");

      Utils.debug("Attempting to register a new user: " + this.el);
      /*
       * Set defaults for new user registration here,
       * WARNING: mongoose auth wont keep any attributes that are empty {} or [] 
       * 
       * appView.authView.model.get("userPrivate").set("gravatar","./../user/tilohash_gravatar.png")
       * {"username":"bob3","password":"","email":"","gravatar":"./../user/tilohash_gravatar.png","researchInterest":"","affiliation":"","description":"","subtitle":"","corpuses":[{"pouchname":"bob3-firstcorpus","port":"443","domain":"ilanguage.iriscouch.com","protocol":"https://"}],"dataLists":[],"prefs":{"skin":"images/skins/stone_figurines.jpg","numVisibleDatum":3},"mostRecentIds":{"corpusid":"2DD73120-F4E5-4A9C-97F7-8F064C5CD6A8","sessionid":"40490877-F8B3-4390-901D-E5838535B01C","datalistid":"AD0B8232-C362-4B0E-80B2-4C3FBBE97421"},"firstname":"","lastname":"","teams":[],"sessionHistory":[],"activityHistory":[],"permissions":{},"hotkeys":{"firstKey":"","secondKey":"","description":""},"id":"4ffb3c6470fbe6d209000005","hash":"$2a$10$9XybfL5OeR4BFJtrifu9H.3MPjJQQnl9uTbXeBdajrjCyABExQId.","salt":"$2a$10$9XybfL5OeR4BFJtrifu9H.","login":"bob3","google":{},"github":{"plan":{}},"twit":{},"fb":{"name":{}},"_id":"4ffb3c6470fbe6d209000005"}
       */
      var dataToPost = {};
      $(".username").val( $(".username").val().toLowerCase().replace(/[^0-9a-z]/g,"") );
      dataToPost.login = $(".username").val().toLowerCase().replace(/[^0-9a-z]/g,"");
      dataToPost.email = $(".email").val();
      dataToPost.username = $(".username").val().toLowerCase().replace(/[^0-9a-z]/g,"");
      dataToPost.password = $(".password").val();
      //Send a pouchname to create
      var corpusConnection = Utils.defaultCouchConnection();
      corpusConnection.pouchname = "firstcorpus";
      dataToPost.corpuses = [corpusConnection];
      var activityConnection = Utils.defaultCouchConnection();
      activityConnection.pouchname = dataToPost.username+"-activity_feed";
      dataToPost.activityCouchConnection = activityConnection;
      dataToPost.gravatar = "./../user/user_gravatar.png";
     
      if (dataToPost.username != ""
        && (dataToPost.password == $(".to-confirm-password").val())
        && dataToPost.email != "") {
        Utils.debug("User has entered an email and the passwords match. ");
        var a = new App();
        a.createAppBackboneObjects($(".username").val()+"-firstcorpus");//this is the convention the server is currently using to create first corpora
        
        /*
         * Contact the server and register the new user
         */
        $.ajax({
          type : 'POST',
          url : Utils.authUrl + "/register",
          data : dataToPost,
          success : function(data) {
            if (data.errors != null) {
              $(".alert-error").html(data.errors.join("<br/>")+" "+Utils.contactUs );
              $(".alert-error").show();
            } else if (data.user) {
              $(".alert-error").html("<p><strong>Please wait:</strong> Preparing your first corpus/database for you, this'll just take a minute...</p> <progress max='100'> <strong>Progress: working...</strong>" );
              $(".alert-error").addClass("alert-success");
              $(".alert-error").show();
              $(".alert-error").removeClass("alert-error");
              $(".register-new-user").addClass("disabled");

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
                    "titleAsUrl" : data.user.username + "Corpus",
                    "description" : "This is an untitled corpus, created by default.",
                    "dataLists" : new DataLists(),
                    "sessions" : new Sessions(),
                    "team" : auth.get("userPublic"),
                    "couchConnection" : data.user.corpuses[0],
                    "pouchname" : data.user.corpuses[0].pouchname
                  });
                  //get the right corpus into the activity feed early, now that the user auth exists, this will work
                  a.set("currentCorpusTeamActivityFeed", new ActivityFeed());//TODO not setting the Activites, means that the user's activities will all get saved into this corpus, this is problematic if they have multiple corpuses, maybe can add a filter somehow. ideally this shoudl be a new collection, fetched from the corpus team server via ajax
                  var activityCouchConnection = JSON.parse(JSON.stringify(data.user.corpuses[0]));
                  activityCouchConnection.pouchname =  data.user.corpuses[0].pouchname+"-activity_feed";
                  a.get("currentCorpusTeamActivityFeed").changePouch(activityCouchConnection);
                  
                  a.set("currentUserActivityFeed", new ActivityFeed({
                    "activities" : auth.get("userPrivate").get("activities")
                  }));
                  a.get("currentUserActivityFeed").changePouch(data.user.activityCouchConnection);
                
                  var s = a.get("currentSession");
                  s.get("sessionFields").where({label: "user"})[0].set("mask", auth.get("userPrivate").get("username") );
                  s.get("sessionFields").where({label: "consultants"})[0].set("mask", "AA");
                  s.get("sessionFields").where({label: "goal"})[0].set("mask", "To explore the app and try entering/importing data");
                  s.get("sessionFields").where({label: "dateSEntered"})[0].set("mask", new Date());
                  s.get("sessionFields").where({label: "dateElicited"})[0].set("mask", "A few months ago, probably on a Monday night.");
                  s.set("pouchname", data.user.corpuses[0].pouchname);
                  s.changePouch(data.user.corpuses[0].pouchname);
                  
                  c.get("sessions").add(s);
                  
                  var dl = a.get("currentDataList");
                  dl.set({
                    "title" : "Default Data List",
                    "dateCreated" : (new Date()).toDateString(),
                    "description" : "This is the default data list for this corpus. " +
                      "Any new datum you create is added here. " +
                      "Data lists can be used to create handouts, prepare for sessions with consultants, " +
                      "export to LaTeX, or share with collaborators.",
                    "pouchname" : data.user.corpuses[0].pouchname
                  });
                  dl.changePouch(data.user.corpuses[0].pouchname);
                  c.get("dataLists").add(dl);
                  
                  c.changePouch(data.user.corpuses[0]);
                  // c.save(); //this is saving to add the corpus to the user's array of corpuses later on
                  window.startApp(a, function(){
//                     auth.get("userPrivate").addCurrentCorpusToUser();
                    window.setTimeout(function(){
                      /*
                       * Use the corpus just created to log the user into that corpus's couch server
                       */
                      var couchConnection = data.user.corpuses[0];
                      $('#user-welcome-modal').modal("hide");//users might have unreliable pouches if they do things this early, but on web version they wont get successful callbacks from couch. TODO if and when we get CORS on iriscouch, move this back to after replicate corpus.
                      c.logUserIntoTheirCorpusServer(couchConnection, dataToPost.username, dataToPost.password, function() {
                        Utils.debug("Successfully authenticated user with their corpus server.");
                        //Bring down the views so the user can search locally without pushing to a server.
                        c.replicateFromCorpus(couchConnection, function(){
//                        appView.datumsEditView.newDatum();
//                          appView.datumsEditView.render();
                        });
                        //save the users' first dashboard so at least they will have it if they close the app.
                        window.setTimeout(function(){
                          window.app.get("authentication").get("userPublic").saveAndInterConnectInApp(function(){
                            window.app.saveAndInterConnectInApp();
                          });
                        },10000);
                        
                      });
                    }, 30000);//ask couch after 30 seconds (give it time to make the new user's design docs)
                    Utils.debug("Loadded app for a new user.");
                  });
                });
//                });
            }
          },//end successful registration
          dataType : ""
        });
      } else{
        Utils.debug("User has not entered good info. ");
          $(".alert-error").html("Your passwords don't seem to match. " + Utils.contactUs );
          $(".alert-error").show();
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
    syncUser : function(username,password){
      console.log("hiding user welcome, syncing users data");
      var u = new User({username:username, password: password });
      a = new App();
      var auth = a.get("authentication");
      auth.authenticate(u, function(success, errors){
        if(success == null){
          $(".alert-error").html(
              errors.join("<br/>") + " " + Utils.contactUs);
//          alert("Something went wrong, we were unable to contact the server, or something is wrong with your login info.");
          $(".alert-error").show();
          $('#user-welcome-modal').modal("show");
        }else{
          $(".alert-error").html("Syncing your data to this tablet/laptop." );
          $(".alert-error").addClass("alert-success");
          $(".alert-error").removeClass("alert-error");
          $(".alert-error").show();
          a.createAppBackboneObjects(auth.get("userPrivate").get("corpuses")[0].pouchname, function(){
            $('#user-welcome-modal').modal("hide");
            window.startApp(a, function(){
              var couchConnection = auth.get("userPrivate").get("corpuses")[0]; //TODO make this be the last corpus they edited so that we re-load their dashboard, or let them chooe which corpus they want.
              window.app.get("corpus").logUserIntoTheirCorpusServer(couchConnection, username, password, function(){
                //Replicate user's corpus down to pouch
                window.setTimeout(function(){
                  window.app.get("corpus").replicateFromCorpus(couchConnection, function(){
                    if(auth.get("userPrivate").get("mostRecentIds") == undefined){
                      //do nothing because they have no recent ids
                      alert("Bug: User does not have most recent ids, not showing your most recent dashbaord.");
//                      appView.datumsEditView.newDatum();
//                      appView.datumsEditView.render();
                      window.app.router.showDashboard();

                    }else{
                      /*
                       *  Load their last corpus, session, datalist etc
                       */
                      var appids = auth.get("userPrivate").get("mostRecentIds");
                      window.app.loadBackboneObjectsByIdAndSetAsCurrentDashboard(couchConnection, appids);
                    }                    
                  });
                },3000);
              });
            });
          });
          
        }
      });
    }
  });

  return UserWelcomeView;
}); 