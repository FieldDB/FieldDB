define([
    "use!backbone", 
    "use!handlebars", 
    "text!user/user_welcome_modal.handlebars",
    "app/App",
    "user/User",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars, 
    user_welcomeTemplate,
    App,
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
      this.url = "https://localhost:3001";
    },

    /**
     * The underlying model of the UserWelcomeView is a User.
     */
    model : User,
    
    /**
     * Events that the UserWelcomeView is listening to and their handlers.
     */
    events : {
      "blur .username" : function(){
        this.model.set("username",$(".username").val());
      },
      "click .new-user-button" : function(){
        $(".confirm-password").show();
      },
      "click .register-new-user" : function(){
        Utils.debug("Attempting to register a new user: " + this.el);
        var dataToPost = {};
        dataToPost.login = $(".email").val();
        dataToPost.email = $(".email").val();
        dataToPost.username = $(".username").val();
        dataToPost.password = $(".password").val();
        

        if (dataToPost.username != ""
          && (dataToPost.password == $(".to-confirm-password").val())
          && dataToPost.email != "") {
          Utils
          .debug("User has entered an email and the passwords match. ");

          /*
           * Contact the server and register the new user
           */
          $.ajax({
            type : 'POST',
            url : this.url + "/register",
            data : dataToPost,
            success : function(data) {
              if(data.errors != null){
                $(".alert-error").html(data.errors.join("<br/>")+" "+Utils.contactUs );
                $(".alert-error").show();
              }else if ( data.user != null ){
                /*
                 * Create a new user, and put them into the authView, dismiss modal
                 * 
                var a = new App();
                a.get("corpus").set("dataLists", new DataLists());
                a.get("corpus").get("dataLists").add(new DataList);
                a.get("corpus").save()
                a.get("authentication").get("user").get("corpuses").push(a.get("corpus").id)
                a.get("authentication").get("user").get("dataLists").push(d)
                a.get("corpus").set("sessions", new Sessions())
                a.get("corpus").get("sessions").add(a.get("currentSession") )
                
                 */
                
//                this.model = new User(data.user);
                            var a = {
                              "corpus" : {
                                "title" : data.user.username+"'s Corpus",
                                "titleAsUrl" : data.user.username+"Corpus",
                                "description" : "This is an untitled corpus, created by default.",
                                "datumStates" : [ {
                                  "state" : "Checked",
                                  "color" : "success",
                                  "showInSearchResults" : true
                                }, {
                                  "state" : "To be checked",
                                  "color" : "warning",
                                  "showInSearchResults" : true
                                }, {
                                  "state" : "Deleted",
                                  "color" : "important",
                                  "showInSearchResults" : false
                                } ],
                                "datumFields" : [
                                    {
                                      "size" : "3",
                                      "label" : "judgement",
                                      "value" : "",
                                      "mask" : "",
                                      "encrypted" : "",
                                      "help" : "Use this field to establish your team's gramaticality/acceptablity judgements (*,#,? etc)",
                                      "userchooseable" : "disabled"
                                    },
                                    {
                                      "size" : "",
                                      "label" : "utterance",
                                      "value" : "",
                                      "mask" : "",
                                      "encrypted" : "checked",
                                      "help" : "Use this as Line 1 in your examples for handouts (ie, either Orthography, or phonemic/phonetic representation)",
                                      "userchooseable" : "disabled"
                                    },
                                    {
                                      "size" : "",
                                      "label" : "morphemes",
                                      "value" : "",
                                      "mask" : "",
                                      "encrypted" : "checked",
                                      "help" : "This line is used to determine the morpheme segmentation to generate glosses, it also optionally can show up in your LaTeXed examples if you choose to show morpheme segmentation in addtion ot line 1, gloss and translation.",
                                      "userchooseable" : "disabled"
                                    },
                                    {
                                      "size" : "",
                                      "label" : "gloss",
                                      "value" : "",
                                      "mask" : "",
                                      "encrypted" : "checked",
                                      "help" : "This line appears in the gloss line of your LaTeXed examples, we reccomend Leipzig conventions (. for fusional morphemes, - for morpehem boundaries etc) The system uses this line to partially help you in glossing. ",
                                      "userchooseable" : "disabled"
                                    },
                                    {
                                      "size" : "",
                                      "label" : "translation",
                                      "value" : "",
                                      "mask" : "",
                                      "encrypted" : "checked",
                                      "help" : "Use this as your primary translation. It does not need to be English, simply a language your team is comfortable with. If your consultant often gives you multiple languages for translation you can also add addtional translations in the customized fields. For example, your Quechua informants use Spanish for translations, then you can make all Translations in Spanish, and add an additional field for English if you want to generate a handout containing the datum. ",
                                      "userchooseable" : "disabled"
                                    } ],
                                "sessionFields" : [
                                    {
                                      "size" : "",
                                      "label" : "user",
                                      "value" : "",
                                      "mask" : "",
                                      "encrypted" : "",
                                      "help" : "This is the person(s) who entered the data.",
                                      "userchooseable" : "disabled"
                                    },
                                    {
                                      "size" : "",
                                      "label" : "consultants",
                                      "value" : "",
                                      "mask" : "",
                                      "encrypted" : "",
                                      "help" : "These are the consultants that were at the data gathering session.",
                                      "userchooseable" : "disabled"
                                    },
                                    {
                                      "size" : "",
                                      "label" : "language",
                                      "value" : "Unknown language",
                                      "mask" : "",
                                      "encrypted" : "",
                                      "help" : "This is the langauge (or language family), if you would like to use it.",
                                      "userchooseable" : "disabled"
                                    },
                                    {
                                      "size" : "",
                                      "label" : "dialect",
                                      "value" : "Unknown dialect",
                                      "mask" : "",
                                      "encrypted" : "",
                                      "help" : "You can use this field to be as precise as you would like about the dialect of this session.",
                                      "userchooseable" : "disabled"
                                    },
                                    {
                                      "size" : "",
                                      "label" : "dateElicited",
                                      "value" : Date.now(),
                                      "mask" : "",
                                      "encrypted" : "",
                                      "help" : "This is the date in which the session took place.",
                                      "userchooseable" : "disabled"
                                    },
                                    {
                                      "size" : "",
                                      "label" : "dateSEntered",
                                      "value" : Date.now(),
                                      "mask" : "",
                                      "encrypted" : "",
                                      "help" : "This is the date in which the session data was entered (which might be different from the actual session date).",
                                      "userchooseable" : "disabled"
                                    },
                                    {
                                      "size" : "",
                                      "label" : "goal",
                                      "value" : "To explore the app and try some data entry to see whether the app is useful for your data collection.",
                                      "mask" : "",
                                      "encrypted" : "",
                                      "help" : "This describes the goals of the session.",
                                      "userchooseable" : "disabled"
                                    } ],
                                "dataLists" : [ {
                                  "title" : "Untitled Data list",
                                  "dateCreated" : "May 29, 2012",
                                  "description" : "You can use datalists to create handouts or to prepare for sessions with consultants, or to share with collegues.",
                                  "datumIds" : [],
                                  "_rev" : "1-ec13b5b6b09a784cf5a249d553e21b8e",
                                  "_id" : "0B7A1499-AF41-4267-835A-6F44F1057EDD"
                                } ],
                                "comments" : [],
                                "_rev" : "1-82594f90b8ef742dc42f5ff5c8fcbc86",
                                "_id" : "C1BACE42-8086-40B2-A9FE-376755FBEEFC"
                              },
                              "sessionid" : null,
                              "authentication" : {
                                "user" : {
                                  "username" : "",
                                  "password" : "",
                                  "email" : data.user.email,
                                  "gravatar" : "./../user/user_gravatar.png",
                                  "researchInterest" : "",
                                  "affiliation" : "",
                                  "description" : "",
                                  "subtitle" : "",
                                  "corpuses" : [ "C1BACE42-8086-40B2-A9FE-376755FBEEFC" ],
                                  "dataLists" : [ "0B7A1499-AF41-4267-835A-6F44F1057EDD" ],
                                  "prefs" : {
                                    "skin" : "",
                                    "numVisibleDatum" : 3
                                  },
                                  "firstname" : "",
                                  "lastname" : "",
                                  "teams" : [],
                                  "sessionHistory" : [],
                                  "activityHistory" : [],
                                  "permissions" : {},
                                  "hotkeys" : {
                                    "firstKey" : "",
                                    "secondKey" : "",
                                    "description" : ""
                                  }
                                },
                                "username" : data.user.username,
                                "state" : "loggedIn"
                              },
                              "currentDataList" : {
                                "title" : "Untitled Data list",
                                "dateCreated" : "May 29, 2012",
                                "description" : "You can use datalists to create handouts or to prepare for sessions with consultants, or to share with collegues.",
                                "datumIds" : [],
                                "_rev" : "1-ec13b5b6b09a784cf5a249d553e21b8e",
                                "_id" : "0B7A1499-AF41-4267-835A-6F44F1057EDD"
                              },
                              "currentSession" : {
                                "sessionFields" : [
                                    {
                                      "size" : "",
                                      "label" : "user",
                                      "value" : data.user.id,
                                      "mask" : "",
                                      "encrypted" : "",
                                      "help" : "Example from DataOne: Format conventions: use uppercase ,Codes for missing values: unknown",
                                      "userchooseable" : "disabled"
                                    },
                                    {
                                      "size" : "",
                                      "label" : "consultants",
                                      "value" : "",
                                      "mask" : "",
                                      "encrypted" : "",
                                      "help" : "Example from DataOne: Format conventions: use uppercase ,Codes for missing values: unknown",
                                      "userchooseable" : "disabled"
                                    },
                                    {
                                      "size" : "",
                                      "label" : "language",
                                      "value" : "",
                                      "mask" : "",
                                      "encrypted" : "",
                                      "help" : "This is the langauge (or language family) if you would like to use it.",
                                      "userchooseable" : "disabled"
                                    },
                                    {
                                      "size" : "",
                                      "label" : "dialect",
                                      "value" : "",
                                      "mask" : "",
                                      "encrypted" : "",
                                      "help" : "You can use this field to be as precise as you would like about the dialect of this session.",
                                      "userchooseable" : "disabled"
                                    },
                                    {
                                      "size" : "",
                                      "label" : "dateElicited",
                                      "value" : "",
                                      "mask" : "",
                                      "encrypted" : "",
                                      "help" : "This is the date in which the session took place.",
                                      "userchooseable" : "disabled"
                                    },
                                    {
                                      "size" : "",
                                      "label" : "dateSEntered",
                                      "value" : "",
                                      "mask" : "",
                                      "encrypted" : "",
                                      "help" : "This is the date in which the session was entered.",
                                      "userchooseable" : "disabled"
                                    },
                                    {
                                      "size" : "",
                                      "label" : "goal",
                                      "value" : "",
                                      "mask" : "",
                                      "encrypted" : "",
                                      "help" : "This describes the goals of the session.",
                                      "userchooseable" : "disabled"
                                    } ]
                              }
                            };
                a = new App(a
//                    {
//                      parse: function(json) { //Some say to override the parse, and it will magicaly work. http://stackoverflow.com/questions/8348748/iterating-backbone-collection
//                        return json;
//                    }
//                 }
              );
                a.restructure();
                
                window.loadApp(a, function(){
                  //TODOD remove sensitive items from the user returned before turning it into a couch entry
                  console.log("Loadded app from json.");
                });
                $('#user-welcome-modal').modal("hide");
              }
            },
            dataType : ""
          });
        } else{
          Utils
          .debug("User has not entered good info. ");
          alert("Sorry, something is wrong with your password or email. ");
        }
      },
      "click .register-twitter" : function(){
        
      },
      "click .register-facebook" : function(){
        
      },
      
      "click .sync_sapir_data" : function() {
        console.log("hiding user welcome, syncing sapir");
        window.loadApp(null, function(){
          window.appView.replicateDatabasesWithCallback(function(){
            window.appView.authView.loadSample();
          });
        });
        $('#user-welcome-modal').modal("hide");
        
      },
      "click .sync_my_data" : function(){
        console.log("hiding user welcome, syncing users data");
        window.loadApp(null, function(){
          window.appView.replicateDatabasesWithCallback(function(){
            window.appView.authView.authenticate($("#welcomeusername"));
          });
        });
        
        $('#user-welcome-modal').modal("hide");
        
      }
    },


    /**
     * The Handlebars template rendered as the UserWelcomeView
     */
    template : Handlebars.compile(user_welcomeTemplate),


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
    }
  });

  return UserWelcomeView;
}); 