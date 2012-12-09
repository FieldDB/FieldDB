define([
    "backbone", 
    "activity/Activity",
    "activity/ActivityFeed",
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
    "text!_locales/en/messages.json",
    "libs/Utils"
], function(
    Backbone, 
    Activity,
    ActivityFeed,
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
      this.bind('error', function(model, error) {
        Utils.debug("Error in App: " + error);
      });
      
      // If there's no authentication, create a new one
      if (!this.get("authentication")) {
        this.set("authentication", new Authentication());
      }
      
      window.onbeforeunload = this.warnUserAboutSavedSyncedStateBeforeUserLeaves;
//      window.onunload = this.saveAndInterConnectInApp; //This seems to be breaking the app, since it cannot actually do a complete save anyway, just not do it at all.
      
      if(LocaleData){
        window.Locale = JSON.parse(LocaleData);
      }else{
        window.Locale = {};
      }

    },
    
    // Internal models: used by the parse function
    model : {
      corpus : Corpus,
      authentication : Authentication,
      currentSession : Session,
      currentDataList : DataList,
      currentCorpusTeamActivityFeed : ActivityFeed,
      currentUserActivityFeed : ActivityFeed,
      search : Search
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
        optionalpouchname == "";
      }
      if (this.get("authentication").get("userPublic") == undefined) {
        var u = new UserMask({
          pouchname : optionalpouchname
        });
        this.get("authentication").set("userPublic", u);
      }
      if (this.get("authentication").get("userPrivate") == undefined) {
        var u2 = new User();
        this.get("authentication").set("userPrivate", u2);
      }
      var c = new Corpus({
        pouchname : optionalpouchname
      });
      this.set("corpus", c);

      var s = new Session({
        pouchname : optionalpouchname,
        sessionFields : c.get("sessionFields").clone()
      });
      this.set("currentSession", s);

      var dl = new DataList({
        pouchname : optionalpouchname
      });
      this.set("currentDataList", dl);

      var search = new Search({
        pouchname : optionalpouchname
      });
      this.set("search", search);

      if (typeof callback == "function") {
        callback();
      }
    },
   
    /**
     * @Deprecated
     * 
     * Accepts the ids to load the app. This is a helper function which is called
     * at the three entry points, main (if there is json in the localstorage
     * from where the user was last working), Welcome new user has a similar
     * function but which creates a user and their recent data, and
     * authentication calls this function to load the users most recent work
     * after they have authenticated (if they were the user who was logged in,
     * they take it from local storage, if they were not then the data will have
     * to be synced.)
     * 
     * Preconditions:
     * The user must already  be authenticated with their corpus server,
     * The corpus server has sent down (replicated) the data.
     * @param couchConnection
     * @param appids
     * @param callback
     */
    loadBackboneObjectsById : function(couchConnection, appids, callback) {
      if(couchConnection == null || couchConnection == undefined){
        couchConnection = this.get("corpus").get("couchConnection");
      }
      var self = this;
      var c = this.get("corpus");
      c.set({
        "pouchname" : couchConnection.pouchname,
        couchConnection : couchConnection
      });
      c.id = appids.corpusid; //tried setting both ids to match, and it worked!!
      
      c.changePouch(couchConnection, function(){
        //fetch only after having setting the right pouch which is what changePouch does.
        c.fetch({
          success : function(model) {
            Utils.debug("Corpus fetched successfully", model);
            window.appView.addBackboneDoc(model.id);
            window.appView.addPouchDoc(model.id);

            var s = self.get("currentSession");
            s.set({
              "pouchname" : couchConnection.pouchname});
            s.id = appids.sessionid; 
            s.changePouch(couchConnection.pouchname, function(){
              s.fetch({
                success : function(model) {
                  Utils.debug("Session fetched successfully", model);
                  window.appView.addBackboneDoc(model.id);
                  window.appView.addPouchDoc(model.id);
                  
                  var dl = self.get("currentDataList");
                  dl.set({
                    "pouchname" : couchConnection.pouchname});
                  dl.id = appids.datalistid; 
                  dl.changePouch(couchConnection.pouchname, function(){
                    dl.fetch({
                      success : function(model) {
                        Utils.debug("Data list fetched successfully", model);
                        window.appView.addBackboneDoc(model.id);
                        window.appView.addPouchDoc(model.id);
                        
                        /*
                         * After all fetches have succeeded show the pretty dashboard
                         */
                        //TODO turn these on, technically they should be called when we change the session's model.
//                        window.appView.setUpAndAssociateViewsAndModelsWithCurrentSession();
//                        window.appView.setUpAndAssociateViewsAndModelsWithCurrentDataList();
//                        window.appView.setUpAndAssociateViewsAndModelsWithCurrentCorpus();
                        window.appView.renderReadonlyDashboardViews();
                        if (typeof callback == "function") {
                          callback();
                        }
                        
                      },
                      error : function(e) {
                        alert("There was an error fetching the data list. Loading defaults..."+e);
                      }
                    });
                  });
                },
                error : function(e) {
                  alert("There was an error fetching the session. Loading defaults..."+e);
                  s.set(
                      "sessionFields", self.get("corpus").get("sessionFields").clone()
                  );
                }
              });
            });
          },
          error : function(e, x, y ) {
            console.log(e);
            console.log(x);
            console.log(y);
            
            alert("There was an error fetching corpus. Loading defaults..."+e);
            document.location.href='user.html';

          }
        });
      });
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
    loadBackboneObjectsByIdAndSetAsCurrentDashboard : function(couchConnection, appids, callback) {
      Utils.debug("loadBackboneObjectsByIdAndSetAsCurrentDashboard");
      
      /*
       * Hide everything until it has all been loaded
       */
      window.app.router.hideEverything();
//      $("#dashboard-view").show();
      window.app.showSpinner();

      
      if(couchConnection == null || couchConnection == undefined){
        couchConnection = this.get("corpus").get("couchConnection");
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
            Utils.debug("Corpus fetched successfully in loadBackboneObjectsByIdAndSetAsCurrentDashboard", corpusModel);
            window.appView.addBackboneDoc(corpusModel.id);
            window.appView.addPouchDoc(corpusModel.id);
           
            $(".spinner-status").html("Opened Corpus...");
            
            c.setAsCurrentCorpus(function(){
              $(".spinner-status").html("Loading Corpus...");
              
              var dl = new DataList({
                "pouchname" : couchConnection.pouchname
              });
              dl.id = appids.datalistid; 
              dl.changePouch(couchConnection.pouchname, function(){
                dl.fetch({
                  success : function(dataListModel) {
                    $(".spinner-status").html("Opened DataList...");

//                    alert("Data list fetched successfully in loadBackboneObjectsByIdAndSetAsCurrentDashboard");
                    Utils.debug("Data list fetched successfully", dataListModel);
                    window.appView.addBackboneDoc(dataListModel.id);
                    window.appView.addPouchDoc(dataListModel.id);
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
                            Utils.debug("Session fetched successfully", sessionModel);
                            window.appView.addBackboneDoc(sessionModel.id);
                            window.appView.addPouchDoc(sessionModel.id);
                            s.setAsCurrentSession(function(){
                              
                              $(".spinner-status").html("Loading Elicitation Session...");

//                              alert("Entire dashboard fetched and loaded and linked up with views correctly.");
                              Utils.debug("Entire dashboard fetched and loaded and linked up with views correctly.");
                              window.appView.toastUser("Your dashboard has been loaded from where you left off last time.","alert-success","Dashboard loaded!");
//                              window.appView.setUpAndAssociateViewsAndModelsWithCurrentUser(); //this didnt help, or seem to be necesary.
//                              window.appView.renderActivityFeedViews();
                              /*
                               * After all fetches have succeeded show the pretty dashboard, the objects have already been linked up by their setAsCurrent methods 
                               */
                              $(".spinner-status").html("Rendering Dashboard...");
                              window.app.router.renderDashboardOrNot(true);

                              window.app.stopSpinner();

//                              window.appView.renderReadonlyDashboardViews();
//                              window.appView.datumsEditView.format = "centerWell";
//                              window.appView.datumsEditView.render(); //this is already done in the dashboard render
                              
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
    /**
     * This function is used to save the entire app state that is needed to load when the app is re-opened.
     * http://stackoverflow.com/questions/7794301/window-onunload-is-not-working-properly-in-chrome-browser-can-any-one-help-me
     * 
     * $(window).on('beforeunload', function() {
        return 'Your own message goes here...';
      });
     */
    warnUserAboutSavedSyncedStateBeforeUserLeaves : function(e){
      localStorage.setItem("saveStatus", "Saving in unload...");
      
      var returntext = "";
      if(window.appView.totalUnsaved.length >= 1){
        returntext = "You have unsaved changes, click cancel to save them. \n\n";
      }
      if(window.appView.totalUnsaved.length >= 1){
        returntext = returntext+"You have unsynced changes, click cancel and then click the sync button to sync them. This is only important if you want to back up your data or if you are sharing your data with a team. \n\n";
      }
      if(returntext == ""){
        return; //don't show a pop up
      }else{
        return "Either you haven't been using the app and Chrome wants some of its memory back, or you want to leave the app.\n\n"+returntext;
      }
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
              localStorage.setItem("mostRecentDashboard", JSON.stringify(window.app.get("authentication").get("userPrivate").get("mostRecentIds")));
              if(window.appView){
                window.appView.toastUser("Your dashboard has been saved, you can exit the app at anytime and return to this state.","alert-success","Exit at anytime:");
              }
              
              
              //appSelf.router.showDashboard();
              
              //save activity feeds too
              appSelf.get("currentCorpusTeamActivityFeed").saveAndInterConnectInApp(function(){
                appSelf.get("currentUserActivityFeed").saveAndInterConnectInApp(function(){
                  Utils.debug("The activity feeds saved successfully.");
                  if(typeof successcallback == "function"){
                    successcallback();
                  }
                },failurecallback);
              },failurecallback);
              
            },failurecallback);
          },failurecallback);
        }, failurecallback);
      }, failurecallback);
    }
    
   
  });

  return App;
});
