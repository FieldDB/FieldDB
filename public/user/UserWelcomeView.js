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
    "libs/Utils"
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
      
      "blur .username" : function() {
        if (this.$el.find(".username").val() != "YourNewUserNameGoesHere") {
            this.model.set("username",$(".username").val());      
            $(".confirm-password").show();
        };
      },
//      "click .new-user-button" : function() {
//        $(".confirm-password").show();
//      },
      "click .register-new-user" : function() {
        Utils.debug("Attempting to register a new user: " + this.el);
        var dataToPost = {};
        dataToPost.login = $(".username").val();
        dataToPost.email = $(".email").val();
        dataToPost.username = $(".username").val();
        dataToPost.password = $(".password").val();
        //Send a corpusname to create
        var corpusConnection = Utils.defaultCouchConnection();
        corpusConnection.corpusname = "firstcorpus";
        dataToPost.corpuses = [corpusConnection];
        
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
                /*
                 * Create a new user, and put them into the authView, create a corpus, session and datalist for them then
                 * dismiss modal
                 */ 
                
//                a.createAppBackboneObjects(data.user.couchConnection.corpusname, function(){
                  // Faking a login behavior, copy pasted from authentication auth function
                  var auth  = a.get("authentication");
                  auth.set("state", "loggedIn");
                  auth.staleAuthentication = false;

                  var u = auth.get("userPrivate");
                  u.set("id",data.user._id); //set the backbone id to be the same as the mongodb id
                  u.set(data.user);//TODO maybe id conflicts are popping up here
                  
                  // Over write the public copy with any (new) username/gravatar info set the backbone id of the userPublic to be the same as the mongodb id of the userPrivate
                  auth.get("userPublic").set("id", auth.get("userPrivate").get("id"));
                  if (data.user.publicSelf == null) {
                    // If the user hasnt already specified their public auth, then put in a username and gravatar,however they can add more details like their affiliation, name, research interests etc.
                    data.user.publicSelf = {};
                    data.user.publicSelf.username = auth.get("userPrivate").get("username");
                    data.user.publicSelf.gravatar = auth.get("userPrivate").get("gravatar");
                  }
                  auth.get("userPublic").set(data.user.publicSelf);
                  auth.get("userPublic").changeCorpus(data.user.corpuses[0].corpusname);
//                  auth.get("userPublic").save();
                  
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
                    "title" : data.user.username + "'s untitled data list",
                    "dateCreated" : "May 29, 2012",
                    "description" : "You can use datalists to create handouts or to prepare for sessions with consultants, export to LaTeX or to share with collaborators. ",
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
                       });
                     }, 5000);
                     console.log("Loadded app for a new user.");
                   });
                   $('#user-welcome-modal').modal("hide");
//                });
              }
            },//end successful registration
            dataType : ""
          });
        } else{
          Utils.debug("User has not entered good info. ");
            $(".alert-error").html("Your passwords don't match, or you didn't enter an email. " + Utils.contactUs );
            $(".alert-error").show();
        }
      },
      "click .register-twitter" : function() {
        
      },
      "click .register-facebook" : function() {
        
      },

      "click .sync-sapir-data" : function() {
        console.log("hiding user welcome, syncing sapir");
        //Load a corpus, datalist, session and user
        a = new App();
        a.createAppBackboneObjects("sapir-firstcorpus",function() {
          $('#user-welcome-modal').modal("hide");
          window.startApp(a, function() {
            window.appView.loadSample();
          });
        });
      },

      "click .sync-my-data" : function() {
        console.log("hiding user welcome, syncing users data");
        var u = new User({username:$("#welcomeusername").val(), password: $("#welcomepassword").val() });
        a = new App();
        var auth = a.get("authentication");
        auth.authenticate(u, function(success, errors){
          if(success == null){
            $(".alert-error").html(
                errors.join("<br/>") + " " + Utils.contactUs);
//            alert("Something went wrong, we were unable to contact the server, or something is wrong with your login info.");
            $(".alert-error").show();
            $('#user-welcome-modal').modal("show");
          }else{
            a.createAppBackboneObjects(auth.get("userPrivate").get("corpuses")[0].corpusname, function(){
              $('#user-welcome-modal').modal("hide");
              window.startApp(a, function(){
                var couchConnection = auth.get("userPrivate").get("corpuses")[0]; //TODO make this be the last corpus they edited so that we re-load their dashboard, or let them chooe which corpus they want.
                window.app.get("corpus").logUserIntoTheirCorpusServer(couchConnection, $("#welcomeusername").val(), $("#welcomepassword").val(), function(){
                  //Replicate user's corpus down to pouch
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
                });
              });
            });
            
          }
        });
      },

      "click .dropdown-menu" : function(e) {
        e.stopPropagation();
      },
            
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
    }
  });

  return UserWelcomeView;
}); 