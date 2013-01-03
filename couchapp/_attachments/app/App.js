define([
    "backbone", 
    "app/AppView",
    "activity/Activity",
    "authentication/Authentication", 
    "corpus/Corpus",
    "data_list/DataList",
    "datum/DatumFields",
    "search/Search",
    "datum/Session",
    "app/AppRouter",
    "confidentiality_encryption/Confidential",
    "user/User",
    "user/UserMask",
    "text!locales/en/messages.json",
    "libs/OPrime"
], function(
    Backbone, 
    AppView,
    Activity,
    Authentication, 
    Corpus,
    DataList,
    DatumFields,
    Search,
    Session,
    AppRouter,
    Confidential,
    User,
    UserMask,
    LocaleData
) {
  var App = Backbone.Model.extend(
  /** @lends App.prototype */
  {
    /**
     * @class The App handles the reinitialization and loading of the app
     *        depending on which platform (Android, Chrome, web) the app is
     *        running, who is logged in etc.
     * 
     * The App should be serializable to save state to local storage for the
     * next run.
     * 
     * @property {Authentication} authentication The auth member variable is an
     *           Authentication object permits access to the login and logout
     *           functions, and the database of users depending on whether the
     *           app is online or not. The authentication is the primary way to access the current user.
     * 
     * @property {Corpus} corpus The corpus is a Corpus object which will permit
     *           access to the datum, the data lists and the sessions. The corpus feeds the
     *           search object with indexes and fields for advanced search, the
     *           corpus has datalists, has teams with permissions, has a
     *           confidentiality_encryption key, it's datum have sessions, its
     *           datalists and datum have export.
     * 
     * @property {Search} search The current search details.
     * 
     * @property {Session} currentSession The session that is currently open.
     * 
     * @property {DataList} currentDataList The datalist that is currently open.
     * 
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
      OPrime.debug("APP INIT");
      
      if(this.get("filledWithDefaults")){
        this.fillWithDefaults();
        this.unset("filledWithDefaults");
      }
    },
    fillWithDefaults : function(){
      // If there's no authentication, create a new one
      if (!this.get("authentication")) {
        this.set("authentication", new Authentication({filledWithDefaults: true}));
      }
      this.showSpinner();
      
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
      
      /*
       * Start the pub sub hub
       */
      window.hub = {};
      OPrime.makePublisher(window.hub);
      
      /*
       * Load the user
       */
      if(!this.get("loadTheAppForTheFirstTime")){
        window.app = this;
        var appself = this;
        OPrime.debug("Loading encrypted user");
        $(".spinner-status").html("Loading encrypted user...");
        var u = localStorage.getItem("encryptedUser");
        appself.get("authentication").loadEncryptedUser(u, function(success, errors) {
          
          $(".spinner-status").html(
          "Turning on continuous sync with your team server...");
          appself.replicateContinuouslyWithCouch(function() {
            /*
             * Load the backbone objects
             */
            OPrime.debug("Creating backbone objects");
            $(".spinner-status")
            .html("Building dashboard objects...");
            appself.createAppBackboneObjects(appself.get("couchConnection").pouchname, function() {
              
              /*
               * If you know the user, load their most recent
               * dashboard
               */
              OPrime.debug("Loading the backbone objects");
              $(".spinner-status").html(
              "Loading dashboard objects...");
              appself.loadBackboneObjectsByIdAndSetAsCurrentDashboard(
                  appself.get("authentication").get(
                  "userPrivate").get("mostRecentIds"), function() {
                
                OPrime.debug("Starting the app");
                appself.startApp(function() {
                  window.app.showHelpOrNot();
                  appself.stopSpinner();
                  window.app.router.renderDashboardOrNot(true);

                });
              });
            });
            
          });
          
        });
      }
      
      window.onbeforeunload = this.warnUserAboutSavedSyncedStateBeforeUserLeaves;
    },
    
    // Internal models: used by the parse function
    internalModels : {
      corpus : Corpus,
      authentication : Authentication,
      currentSession : Session,
      currentDataList : DataList,
      search : Search
    },
    /*
     * This will be the only time the app should open the pouch.
     */
    changePouch : function(couchConnection, callback) {
      if (!couchConnection || couchConnection == undefined) {
        console.log("App.changePouch couchConnection must be supplied.");
        return;
      } else {
        console.log("App.changePouch setting couchConnection: ", couchConnection);
        this.set("couchConnection", couchConnection);
      }

      if(OPrime.isCouchApp()){
        if(typeof callback == "function"){
          callback();
        }
        return;
      }
      
      if (this.pouch == undefined) {
        // this.pouch = Backbone.sync.pouch("https://localhost:6984/"
        // + couchConnection.pouchname);
        this.pouch = Backbone.sync
        .pouch(OPrime.isAndroidApp() ? OPrime.touchUrl
            + couchConnection.pouchname : OPrime.pouchUrl
            + couchConnection.pouchname);
      }
      if (typeof callback == "function") {
        callback();
      }
    },
    /**
     * This function creates the backbone objects, and links them up so that
     * they are ready to be used in the views. This function should be called on
     * app load, either by main, or by welcome new user. This function should
     * not be called at any later time as it will break the connection between
     * the views and the models. To load different models into the app after it
     * has first loaded, use the loadBackboneObjectsById function below.
     * 
     * @param callback
     */
    createAppBackboneObjects : function(optionalpouchname, callback){
      if (optionalpouchname == null) {
        optionalpouchname == "default";
      }

      try{
        Backbone.couch_connector.config.db_name = optionalpouchname;
      }catch(e){
        OPrime.debug("Couldn't set the database name off of the pouchame.");
      }
      
      if (this.get("authentication").get("userPublic") == undefined) {
        this.get("authentication").set("userPublic", new UserMask({
          pouchname : optionalpouchname
        }));
      }
      if (this.get("authentication").get("userPrivate") == undefined) {
        this.get("authentication").set("userPrivate", new User());
      }
      var c = new Corpus({
        pouchname : optionalpouchname
      });
      this.set("corpus", c);

      this.set("currentSession", new Session({
        pouchname : optionalpouchname,
      }));

      this.set("currentDataList", new DataList({
        pouchname : optionalpouchname
      }));

      this.set("search", new Search({
        pouchname : optionalpouchname
      }));


      if (typeof callback == "function") {
        callback();
      }
    },
    
    startApp : function(callback) {
      if(!window.appView){
        window.appView = new AppView({
          model : this
        });
        /* Tell the app to render everything */
        window.appView.render();
      }

      if(typeof window.app.router == "function"){
        /* Tell the router to render the home screen divs */
        this.router = new AppRouter();
        this.router.renderDashboardOrNot(true);
        
        Backbone.history.start();
        if (typeof callback == "function") {
          OPrime.debug("Calling back the startApps callback");
          callback();
        }
      }

    },
    
    showSpinner : function(){
        $('#dashboard_loading_spinner').html("<img class='spinner-image' src='images/loader.gif'/><p class='spinner-status'>Loading dashboard...</p>");
        $('.spinner-image').css({
          'width' : function() {
            return ($(document).width() * .1 ) + 'px';
          },
          'height' : function() {
            return ($(document).width() * .1 ) + 'px';
          },
          'padding-top': '10em'
        });
    },
    stopSpinner : function(){
      $('#dashboard_loading_spinner').html("");
    },

    /**
     * Log the user into their corpus server automatically using cookies and post so that they can replicate later.
     * "http://localhost:5984/_session";
     * 
     * References:
     * http://guide.couchdb.org/draft/security.html
     * 
     * @param username this can come from a username field in a login, or from the User model.
     * @param password this comes either from the UserWelcomeView when the user logs in, or in the quick authentication view.
     * @param callback A function to call upon success, it receives the data back from the post request.
     */
    logUserIntoTheirCorpusServer : function(couchConnection, username,
        password, succescallback, failurecallback) {
      if (couchConnection == null || couchConnection == undefined) {
        couchConnection = this.get("couchConnection");
      }

      var couchurl = couchConnection.protocol + couchConnection.domain;
      if (couchConnection.port != null) {
        couchurl = couchurl + ":" + couchConnection.port;
      }
      if (!couchConnection.path) {
        couchConnection.path = "";
        this.get("couchConnection").path = "";
      }
      couchurl = couchurl + couchConnection.path + "/_session";
      var corpusloginparams = {};
      corpusloginparams.name = username;
      corpusloginparams.password = password;
      OPrime.debug("Contacting your corpus server ", couchConnection);

      $
      .ajax({
        type : 'POST',
        url : couchurl,
        data : corpusloginparams,
        success : function(serverResults) {
          if (window.appView) {
            window.appView
            .toastUser(
                "I logged you into your team server automatically, your syncs will be successful.",
                "alert-info", "Online Mode:");
          }
          if (typeof succescallback == "function") {
            succescallback(serverResults);
          }
        },
        error : function(serverResults) {
          window
          .setTimeout(
              function() {
                //try one more time 5 seconds later 
                $
                .ajax({
                  type : 'POST',
                  url : couchurl,
                  success : function(serverResults) {
                    if (window.appView) {
                      window.appView
                      .toastUser(
                          "I logged you into your team server automatically, your syncs will be successful.",
                          "alert-info", "Online Mode:");
                    }
                    if (typeof succescallback == "function") {
                      succescallback(serverResults);
                    }
                  },
                  error : function(serverResults) {
                    if (window.appView) {
                      window.appView
                      .toastUser(
                          "I couldn't log you into your corpus. What does this mean? "
                          + "This means you can't upload data to train an auto-glosser or visualize your morphemes. "
                          + "You also can't share your data with team members. If your computer is online and you are"
                          + " using the Chrome Store app, then this probably the side effect of a bug that we might not know about... please report it to us :) "
                          + OPrime.contactUs
                          + " If you're offline you can ignore this warning, and sync later when you're online. ",
                          "alert-danger",
                      "Offline Mode:");
                    }
                    if (typeof failurecallback == "function") {
                      failurecallback("I couldn't log you into your corpus.");
                    }
                    OPrime.debug(serverResults);
                    window.app.get("authentication").set(
                        "staleAuthentication", true);
                  }
                });
              }, 5000);
        }
      });
    },
    /**
     * Synchronize to server and from database.
     */
    replicateContinuouslyWithCouch : function(successcallback,
        failurecallback) {
      
//    if(OPrime.isCouchApp()){
      if(true){
        if (typeof successcallback == "function") {
          successcallback();
        }
        // no need to replicate, we are in our db already.
        return;
      }
      
      var self = this;
      var couchConnection = this.get("couchConnection");

      this.logUserIntoTheirCorpusServer(couchConnection, "devgina",
          "test", function() {
        OPrime.debug("Logged you into your corpus ",
            couchConnection);

        if(OPrime.isCouchApp()){
          if(typeof successcallback == "function"){
            successcallback();
          }
          return;
        }
          
        self.changePouch(null, function() {
          self.pouch(function(err, db) {
            var couchurl = couchConnection.protocol
            + couchConnection.domain;
            if (couchConnection.port != null) {
              couchurl = couchurl + ":" + couchConnection.port;
            }
            couchurl = couchurl + couchConnection.path + "/"
            + couchConnection.pouchname;
            if (err) {
              OPrime.debug("Opening db  error", err);

              if (typeof failurecallback == "function") {
                failurecallback();
              } else {
                alert('Opening DB error' + JSON.stringify(err));
                OPrime.debug('Opening DB error'
                    + JSON.stringify(err));
              }
            } else {
              OPrime.debug("Opening db  success", db);

              self.replicateFromCorpus(db, couchurl, function() {
                //turn on to regardless of fail or succeed
                self.replicateToCorpus(db, couchurl);
              }, function() {
                //turn on to regardless of fail or succeed
                self.replicateToCorpus(db, couchurl);
              });

              if (typeof successcallback == "function") {
                successcallback();
              }

            }
          });
        });

      });
    },
    replicateToCorpus : function(db, couchurl, success, failure) {
      db.replicate.to(couchurl, {
        continuous : true
      }, function(err, response) {
        OPrime.debug("Replicated to " + couchurl);
        OPrime.debug(response);
        OPrime.debug(err);
        if (err) {
          OPrime.debug("replicate to db  error", err);
          if (typeof failure == "function") {
            failure();
          } else {
            alert('Database replicate to error' + JSON.stringify(err));
            OPrime.debug('Database replicate to error'
                + JSON.stringify(err));
          }
        } else {
          OPrime.debug("Database replicate to success", response);
          if (typeof success == "function") {
            success();
          } else {
            OPrime.debug('Database replicating'
                + JSON.stringify(couchConnection));
          }

        }
      });
    },
    replicateFromCorpus : function(db, couchurl, succes, fail) {
      db.replicate
      .from(couchurl, {
        continuous : true
      },
      function(err, response) {
        OPrime.debug("Replicated from " + couchurl);
        OPrime.debug(response);
        OPrime.debug(err);
        if (err) {
          OPrime.debug("replicate from db  error", err);
          if (typeof fail == "function") {
            fail();
          } else {
            alert('Database replicate from error'
                + JSON.stringify(err));
            OPrime.debug('Database replicate from error'
                + JSON.stringify(err));
          }
        } else {
          OPrime.debug("Database replicate from success",
              response);
          if (typeof succes == "function") {
            succes();
          } else {
            OPrime.debug('Database replicating'
                + JSON.stringify(couchConnection));
          }

        }
      });
    },
    
    loadBackboneObjectsByIdAndSetAsCurrentDashboard : function( appids, callback) {
      OPrime.debug("loadBackboneObjectsByIdAndSetAsCurrentDashboard");
      
//      if(couchConnection == null || couchConnection == undefined){
//        couchConnection = this.get("corpus").get("couchConnection");
//      }
      var couchConnection = appids.couchConnection;
      if(!appids.corpusid){
        alert("Could not figure out what was your most recent corpus, taking you to your user page where you can choose.");
        window.location.replace("user.html");
        return;
      }
      var c = new Corpus({
        "pouchname" : couchConnection.pouchname,
        "couchConnection" : couchConnection
      });
      c.id = appids.corpusid; //tried setting both ids to match, and it worked!!
      c.changePouch(couchConnection, function(){
        //fetch only after having setting the right pouch which is what changePouch does.
        c.fetch({
          success : function(corpusModel) {
//            alert("Corpus fetched successfully in loadBackboneObjectsByIdAndSetAsCurrentDashboard");
            OPrime.debug("Corpus fetched successfully in loadBackboneObjectsByIdAndSetAsCurrentDashboard", corpusModel);
            
            $(".spinner-status").html("Opened Corpus...");
            
            c.setAsCurrentCorpus(function(){
              $(".spinner-status").html("Loading Corpus...");
              
              /*
               * Fetch sessions and datalists
               */
              c.datalists.fetchDatalists();
              c.sessions.fetchSessions();
              c.fetchPublicSelf();
             
              var dl = new DataList({
                "pouchname" : couchConnection.pouchname
              });
              dl.id = appids.datalistid; 
              dl.changePouch(couchConnection.pouchname, function(){
                dl.fetch({
                  success : function(dataListModel) {
                    $(".spinner-status").html("Opened DataList...");

//                    alert("Data list fetched successfully in loadBackboneObjectsByIdAndSetAsCurrentDashboard");
                    OPrime.debug("Data list fetched successfully", dataListModel);
                    dl.setAsCurrentDataList(function(){
                      $(".spinner-status").html("Loading your most recent DataList, "+dataListModel.get("datumIds").length+" entries...");

                      var s = new Session({
                        "pouchname" : couchConnection.pouchname
                      });
                      s.id = appids.sessionid; 
                      s.changePouch(couchConnection.pouchname, function(){
                        s.fetch({
                          success : function(sessionModel) {
                            $(".spinner-status").html("Opened Elicitation Session...");

//                            alert("Session fetched successfully in loadBackboneObjectsByIdAndSetAsCurrentDashboard");
                            OPrime.debug("Session fetched successfully", sessionModel);
                            s.setAsCurrentSession(function(){
                              
                              $(".spinner-status").html("Loading Elicitation Session...");

//                              alert("Entire dashboard fetched and loaded and linked up with views correctly.");
                              OPrime.debug("Entire dashboard fetched and loaded and linked up with views correctly.");
                              if(window.appView){
                                window.appView.toastUser("Your dashboard has been loaded from where you left off last time.","alert-success","Dashboard loaded!");
                              }
                              /*
                               * After all fetches have succeeded show the pretty dashboard, the objects have already been linked up by their setAsCurrent methods 
                               */
                              $(".spinner-status").html("Rendering Dashboard...");

                              window.app.stopSpinner();

                              
                              if (typeof callback == "function") {
                                callback();
                              }
                            }, function(){
                              alert("Failure to set as current session in loadBackboneObjectsByIdAndSetAsCurrentDashboard");
                            });
                          },
                          error : function(e) {
                            alert("There was an error fetching the session. Loading defaults..."+JSON.stringify(e));
                            s.set(
                                "sessionFields", window.app.get("corpus").get("sessionFields").clone()
                            );
                          }
                        });//end session fetch
                      });//end session change corpus

                    },function(){
                      alert("Failure to set as current data list in loadBackboneObjectsByIdAndSetAsCurrentDashboard");
                    });
                  },
                  error : function(e) {
                    alert("There was an error fetching the data list. Loading defaults..."+JSON.stringify(e));
                  }
                }); //end fetch data list
              });//end data list change corpus

            }, function(){
              alert("Failure to set as current corpus in loadBackboneObjectsByIdAndSetAsCurrentDashboard");
            });//end setAsCurrentCorpus
          },
          error : function(model, error, other) {
            console.log(model);
            console.log(error);
            console.log(other);
            alert("There was an error fetching corpus. Loading defaults..."+JSON.stringify(error));
            document.location.href='user.html';

          }
        }); //end corpus fetch
      }); //end corpus change corpus
    },
    
    router : AppRouter,

    showHelpOrNot : function() {
      var helpShownCount = localStorage.getItem("helpShownCount") || 0;
      var helpShownTimestamp = localStorage
      .getItem("helpShownTimestamp") || 0;
      var milisecondsSinceLastHelp = Date.now() - helpShownTimestamp;
      
      /* if its been more than 5 days, reset the help shown count to trigger the illustrated guide */
      if (milisecondsSinceLastHelp > 432000000) {
        helpShownCount = 0;
        $(".help_count_reason").html("Welcome back! It's been more than 5 days since you opened the app. ");
      }
      if (helpShownCount > 5) {
        // do nothing
      } else {
        $(".help_count_left").html(5-helpShownCount);
        localStorage.setItem("helpShownCount", ++helpShownCount);
        localStorage.setItem("helpShownTimestamp", Date.now());
        window.app.router.navigate("help/illustratedguide", {trigger: true});
      }
    },
    
    /**
     * This function is used to save the entire app state that is needed to load when the app is re-opened.
     * http://stackoverflow.com/questions/7794301/window-onunload-is-not-working-properly-in-chrome-browser-can-any-one-help-me
     * 
     * $(window).on('beforeunload', function() {
        return 'Your own message goes here...';
      });
     */
    warnUserAboutSavedSyncedStateBeforeUserLeaves : function(e){
      
      var returntext = "";
      if (window.appView) {
        if(window.appView.totalUnsaved.length >= 1){
          returntext = "You have unsaved changes, click cancel to save them. \n\n";
        }
        if(window.appView.totalUnsaved.length >= 1){
          returntext = returntext+"You have unsynced changes, click cancel and then click the sync button to sync them. This is only important if you want to back up your data or if you are sharing your data with a team. \n\n";
        }
      }
      if(returntext == ""){
        return; //don't show a pop up
      }else{
        return "Either you haven't been using the app and Chrome wants some of its memory back, or you want to leave the app.\n\n"+returntext;
      }
    },
    addActivity : function(backBoneActivity) {
//      var couchConnection = this.get("couchConnection");
//      var couchurl = couchConnection.protocol + couchConnection.domain;
//      if (couchConnection.port != null) {
//        couchurl = couchurl + ":" + couchConnection.port;
//      }
//      if (!couchConnection.path) {
//        couchConnection.path = "";
//        this.get("couchConnection").path = "";
//      }
//      couchurl = couchurl + couchConnection.path;
//      if (backBoneActivity.get("teamOrPersonal") == "team") {
//        couchurl = couchurl + couchConnection.pouchname + "-activity_feed";
//      } else {
//        couchurl = couchurl + this.get("authentication").get("userPrivate").get(
//        "username") + "-activity_feed";
//      }
//      OPrime.debug("Saving activity: ", backBoneActivity);
//      $.ajax({
//        url : couchurl,
//        data : backBoneActivity.toJSON(),
//        contentType : "application/json",
//        type : 'POST',
//        dataType : "json",
//        success : function(resp) {
//          OPrime
//          .debug("Successfully saved activity to your activity couch.", resp);
//        }
//      });
      
      
      
      
      
//      if (backBoneActivity.get("teamOrPersonal") == "team") {
//        window.app.get("currentCorpusTeamActivityFeed").addActivity(backBoneActivity);
//      } else {
//        window.app.get("currentUserActivityFeed").addActivity(backBoneActivity);
//      }
    },
    
    /**
     * This function sequentially saves first the session, datalist and then corpus. Its success callback is called if all saves succeed, its fail is called if any fail. 
     * @param successcallback
     * @param failurecallback
     */
    saveAndInterConnectInApp : function(successcallback, failurecallback){
      if(!failurecallback){
        failurecallback = function(){
          alert("There was a bug/problem in the saveAndInterConnectInApp in App.js, somewhere along the save call. The Session is saved first, if it succeeds, then the datalist, then the corpus. The failure is somewhere along there.");
        };
      }
      var appSelf = this;
      appSelf.get("currentSession").saveAndInterConnectInApp(function(){
        appSelf.get("currentDataList").saveAndInterConnectInApp(function(){
          appSelf.get("corpus").saveAndInterConnectInApp(function(){
            appSelf.get("authentication").saveAndInterConnectInApp(function(){
              
              appSelf.get("authentication").staleAuthentication = true;
//              localStorage.setItem("mostRecentDashboard", JSON.stringify(window.app.get("authentication").get("userPrivate").get("mostRecentIds")));
              if(window.appView){
                window.appView.toastUser("Your dashboard has been saved, you can exit the app at anytime and return to this state.","alert-success","Exit at anytime:");
              }
              
              
              //appSelf.router.showDashboard();
              if(typeof successcallback == "function"){
                successcallback();
              }

            },failurecallback);
          },failurecallback);
        }, failurecallback);
      }, failurecallback);
    }
    
   
  });

  return App;
});
