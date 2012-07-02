define([
    "use!backbone", 
    "use!handlebars", 
    "text!user/user_welcome_modal.handlebars",
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
    user_welcomeTemplate,
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
      "blur .username" : function(){
        this.model.set("username",$(".username").val());
      },
      "click .new-user-button" : function(){
        $(".confirm-password").show();
      },
      "click .register-new-user" : function(){
        Utils.debug("Attempting to register a new user: " + this.el);
        var dataToPost = {};
        dataToPost.login = $(".username").val();
        dataToPost.email = $(".email").val();
        dataToPost.username = $(".username").val();
        dataToPost.password = $(".password").val();
        //Send a corpusname to create
        var corpusConnection = Utils.defaultCouchConnection();
        corpusConnection.corpusname = $(".username").val()+"corpus";
        dataToPost.corpuses = [corpusConnection];
        

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
            url : Utils.authUrl + "/register",
            data : dataToPost,
            success : function(data) {
              if(data.errors != null){
                $(".alert-error").html(data.errors.join("<br/>")+" "+Utils.contactUs );
                $(".alert-error").show();
              }else if ( data.user != null ){
                /*
                 * Create a new user, and put them into the authView, create a corpus, session and datalist for them then
                 * dismiss modal
                 */ 
                var u = new User(data.user);
                var a = new App();
                var c = new Corpus({
                  "title" : data.user.username+"'s Corpus",
                  "titleAsUrl" : data.user.username+"Corpus",
                  "description" : "This is an untitled corpus, created by default.",
                  "dataLists": new DataLists(),
                  "sessions": new Sessions(),
                  "couchConnection" : data.user.corpuses[data.user.corpuses.length-1]
                });
                a.set("corpus", c);
                a.get("corpus").save()
                u.get("corpuses").push(a.get("corpus").id);
                var s = new Session(
                    {
                      "sessionFields" : new DatumFields(
                          [
                           {
                             label : "user",
                             value : u.id //TODO turn this into an array of users
                           },
                           {
                             label : "consultants",
                             value : "AA" //TODO turn this into an array of consultants
                           },
                           {
                             label : "language",
                             value : "Unknown language"
                           },
                           {
                             label : "dialect",
                             value : "Unknown dialect"
                           },
                           {
                             label : "dateElicited",
                             value : new Date()
                           },
                           {
                             label : "dateSEntered",
                             value : new Date()
                           },
                           {
                             label : "goal",
                             value : "To explore the app and try entering/importing data"
                           } ])
                    });
                a.get("corpus").get("sessions").add(s);
                var dl = new DataList(
                    {
                      "title" : data.user.username+"'s untitled data list",
                      "dateCreated" : "May 29, 2012",
                      "description" : "You can use datalists to create handouts or to prepare for sessions with consultants, export to LaTeX or to share with collaborators. ",
                    });
                a.get("corpus").get("dataLists").add(dl);
                a.set("currentSession", s);
                a.set("currentDataList",dl);
                a.get("authentication").set("user",u);
                
                window.loadApp(a, function(){
                  //TODOD remove sensitive items from the user returned before turning it into a couch entry
                  console.log("Loadded app from json.");
                });
                $('#user-welcome-modal').modal("hide");
                
                
                /*
                 * Use the corpus just created to log the user into that corpus's couch server
                 */
                c.logUserIntoTheirCorpusServer(dataToPost.username, dataToPost.password, function(){
                  Utils.debug("Successfully authenticated user with their corpus server.")
                });
              }
            },
            dataType : ""
          });
        } else{
          Utils.debug("User has not entered good info. ");
            $(".alert-error").html("Your passwords don't match, or you didn't enter an email."+Utils.contactUs );
            $(".alert-error").show();
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
            window.appView.loadSample();
          });
        });
        $('#user-welcome-modal').modal("hide");
        
      },
      "click .sync_my_data" : function(){
        console.log("hiding user welcome, syncing users data");
        var u = new User({username:$("#welcomeusername").val(), password: $("#welcomepassword").val() });
        var auth = new Authentication();
        auth.authenticate(u, function(userfromserver){
          if(userfromserver == null){
            alert("Something went wrong, we were unable to contact the server, or something is wrong with your login info.");
            $(".alert-error").show();
          }else{
            $('#user-welcome-modal').modal("hide");
            window.loadApp(null, function(){
              window.appView.replicateDatabasesWithCallback(function(){
                /*
                 * If the user fetch didn't succeed, try again.
                 */
                if(userfromserver.get("mostRecentIds") == undefined){
                  userfromserver.fetch({
                    success : function() {
                      var appids = userfromserver.get("mostRecentIds");
//                    appids.userid = null; //This authentication will dissapear when the app is built, so let the app build the user too
                      window.app.loadMostRecentIds(appids);
                    },
                    error : function() {
                      alert("There was an error fetching your data. Loading defaults...");
                    }
                  });
                }else{
                  /*
                   * If the user fetch succeeds the first time, load their last corpus, session, datalist etc
                   */
                  var appids = userfromserver.get("mostRecentIds");
//                appids.userid = null; //This authentication will dissapear when the app is built, so let the app build the user too
                  window.app.loadMostRecentIds(appids);
                }
              });
            });
          }
        });
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