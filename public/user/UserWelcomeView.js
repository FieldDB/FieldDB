define([
    "backbone", 
    "handlebars", 
    "activity/Activity",
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
      this.model.set("username","YourNewUserNameGoesHere");
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
        this.syncUser($("#welcomeusername").val(),$("#welcomepassword").val());
      },
      "click #welcomeusername" : function(e) {
        return false;
      },
      "click #welcomepassword" : function(e) {
        return false;
      },
      "keyup #welcomepassword" : function(e) {
        var code = e.keyCode || e.which;
        
        // code == 13 is the enter key
        if (code == 13) {
          this.syncUser($("#welcomeusername").val(),$("#welcomepassword").val());
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
       
        // Display the UserWelcomeView
        this.setElement($("#user-welcome-modal"));
        $(this.el).html(this.template(this.model.toJSON()));
        $(".username").focus();
      } else {
        Utils.debug("\User model was undefined");
      }

      return this;
    },
    
    registerNewUser : function() {
      Utils.debug("Attempting to register a new user: " + this.el);
      /*
       * Set defaults for new user registration here,
       * WARNING: mongoose auth wont keep any attributes that are empty {} or [] 
       * 
       * appView.authView.model.get("userPrivate").set("gravatar","./../user/tilohash_gravatar.png")
       * {"username":"bob3","password":"","email":"","gravatar":"./../user/tilohash_gravatar.png","researchInterest":"","affiliation":"","description":"","subtitle":"","corpuses":[{"corpusname":"bob3-firstcorpus","port":"443","domain":"ilanguage.iriscouch.com","protocol":"https://"}],"dataLists":[],"prefs":{"skin":"images/skins/stone_figurines.jpg","numVisibleDatum":3},"mostRecentIds":{"corpusid":"2DD73120-F4E5-4A9C-97F7-8F064C5CD6A8","sessionid":"40490877-F8B3-4390-901D-E5838535B01C","datalistid":"AD0B8232-C362-4B0E-80B2-4C3FBBE97421"},"firstname":"","lastname":"","teams":[],"sessionHistory":[],"activityHistory":[],"permissions":{},"hotkeys":{"firstKey":"","secondKey":"","description":""},"id":"4ffb3c6470fbe6d209000005","hash":"$2a$10$9XybfL5OeR4BFJtrifu9H.3MPjJQQnl9uTbXeBdajrjCyABExQId.","salt":"$2a$10$9XybfL5OeR4BFJtrifu9H.","login":"bob3","google":{},"github":{"plan":{}},"twit":{},"fb":{"name":{}},"_id":"4ffb3c6470fbe6d209000005"}
       */
      var dataToPost = {};
      dataToPost.login = $(".username").val();
      dataToPost.email = $(".email").val();
      dataToPost.username = $(".username").val();
      dataToPost.password = $(".password").val();
      //Send a corpusname to create
      var corpusConnection = Utils.defaultCouchConnection();
      corpusConnection.corpusname = "firstcorpus";
      dataToPost.corpuses = [corpusConnection];
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
              
//                a.createAppBackboneObjects(data.user.couchConnection.corpusname, function(){
                // Faking a login behavior, copy pasted from authentication auth function
                var auth  = a.get("authentication");
                auth.saveServerResponseToUser(data, function(){
                  //this code is now all in one place, in saveServerResponseToUser DO NOT DELETE YET
//                    auth.set("state", "loggedIn");
//                    auth.staleAuthentication = false;
//                    
//                    var u = auth.get("userPrivate");
//                    u.id = data.user._id; //set the backbone id to be the same as the mongodb id
//                    u.set(u.parse(data.user)); //might take internal elements that are supposed to be a backbone model, and override them
//                    
//                    // Over write the public copy with any (new) username/gravatar info set the backbone id of the userPublic to be the same as the mongodb id of the userPrivate
//                    auth.get("userPublic").id = auth.get("userPrivate").id;
//                    if (data.user.publicSelf == null) {
//                      // If the user hasnt already specified their public auth, then put in a username and gravatar,however they can add more details like their affiliation, name, research interests etc.
//                      data.user.publicSelf = {};
//                      data.user.publicSelf.username = auth.get("userPrivate").get("username");
//                      data.user.publicSelf.gravatar = auth.get("userPrivate").get("gravatar");
//                    }
//                    auth.get("userPublic").set(data.user.publicSelf);
//                    auth.get("userPublic").changeCorpus(data.user.corpuses[0].corpusname);
////                  auth.get("userPublic").save();
                  
                  var c = a.get("corpus");
                  c.set({
                    "title" : data.user.username + "'s Corpus",
                    "titleAsUrl" : data.user.username + "Corpus",
                    "description" : "This is an untitled corpus, created by default.",
                    "dataLists" : new DataLists(),
                    "sessions" : new Sessions(),
                    "couchConnection" : data.user.corpuses[0],
                    "corpusname" : data.user.corpuses[0].corpusname
                  });
                  
                  var s = a.get("currentSession");
                  s.get("sessionFields").where({label: "user"})[0].set("value", auth.get("userPrivate").get("username") );
                  s.get("sessionFields").where({label: "consultants"})[0].set("value", "AA");
                  s.get("sessionFields").where({label: "goal"})[0].set("value", "To explore the app and try entering/importing data");
                  s.get("sessionFields").where({label: "dateSEntered"})[0].set("value", new Date());
                  s.get("sessionFields").where({label: "dateElicited"})[0].set("value", "A few months ago, probably on a Monday night.");
                  s.set("corpusname", data.user.corpuses[0].corpusname);
                  s.changeCorpus(data.user.corpuses[0].corpusname);
                  
                  c.get("sessions").add(s);
                  
                  var dl = a.get("currentDataList");
                  dl.set({
                    "title" : "Default Data List",
                    "dateCreated" : (new Date()).toDateString(),
                    "description" : "This is the default data list for this corpus. " +
                      "Any new datum you create is added here. " +
                      "Data lists can be used to create handouts, prepare for sessions with consultants, " +
                      "export to LaTeX, or share with collaborators.",
                    "corpusname" : data.user.corpuses[0].corpusname
                  });
                  dl.changeCorpus(data.user.corpuses[0].corpusname);
                  c.get("dataLists").add(dl);
                  
                  c.changeCorpus(data.user.corpuses[0]);
                  // c.save(); //this is saving to add the corpus to the user's array of corpuses later on
                  window.startApp(a, function(){
//                     auth.get("userPrivate").addCurrentCorpusToUser();
                    window.setTimeout(function(){
                      /*
                       * Use the corpus just created to log the user into that corpus's couch server
                       */
                      var couchConnection = data.user.corpuses[0];
                      c.logUserIntoTheirCorpusServer(couchConnection, dataToPost.username, dataToPost.password, function() {
                        Utils.debug("Successfully authenticated user with their corpus server.");
                        //Bring down the views so the user can search locally without pushing to a server.
                        c.replicateCorpus(couchConnection);
                        
                        //save the users' first dashboard so at least they will have it if they close the app.
                        window.setTimeout(function(){
                          window.app.storeCurrentDashboardIdsToLocalStorage();
                          $('#user-welcome-modal').modal("hide");
                        },10000);
                        
                      });
                    }, 30000);//ask couch after 30 seconds (give it time to make the new user's design docs)
                    console.log("Loadded app for a new user.");
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
          a.createAppBackboneObjects(auth.get("userPrivate").get("corpuses")[0].corpusname, function(){
            $('#user-welcome-modal').modal("hide");
            window.startApp(a, function(){
              var couchConnection = auth.get("userPrivate").get("corpuses")[0]; //TODO make this be the last corpus they edited so that we re-load their dashboard, or let them chooe which corpus they want.
              window.app.get("corpus").logUserIntoTheirCorpusServer(couchConnection, username, password, function(){
                //Replicate user's corpus down to pouch
                window.setTimeout(function(){
                  window.app.get("corpus").replicateCorpus(couchConnection, function(){
                    if(auth.get("userPrivate").get("mostRecentIds") == undefined){
                      //do nothing because they have no recent ids
                      Utils.debug("User does not have most recent ids, doing nothing.");
                    }else{
                      /*
                       *  Load their last corpus, session, datalist etc
                       */
                      var appids = auth.get("userPrivate").get("mostRecentIds");
                      window.app.loadBackboneObjectsById(couchConnection, appids);
                    }                    
                  });
                },5000);
              });
            });
          });
          
        }
      });
    }
  });

  return UserWelcomeView;
}); 