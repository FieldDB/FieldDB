define([
    "backbone", 
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
    "libs/Utils"
], function(
    Backbone, 
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
    UserMask
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
      window.onunload = this.saveAndInterConnectInApp;
      
    },
    
    // Internal models: used by the parse function
    model : {
      corpus : Corpus,
      authentication : Authentication,
      currentSession : Session,
      currentDataList : DataList,
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
    createAppBackboneObjects : function(optionalcorpusname, callback){
      if (optionalcorpusname == null) {
        optionalcorpusname == "";
      }
      if (this.get("authentication").get("userPublic") == undefined) {
        var u = new UserMask({
          corpusname : optionalcorpusname
        });
        this.get("authentication").set("userPublic", u);
      }
      if (this.get("authentication").get("userPrivate") == undefined) {
        var u2 = new User();
        this.get("authentication").set("userPrivate", u2);
      }
      var c = new Corpus({
        corpusname : optionalcorpusname
      });
      this.set("corpus", c);

      var s = new Session({
        corpusname : optionalcorpusname,
        sessionFields : c.get("sessionFields").clone()
      });
      this.set("currentSession", s);

      var dl = new DataList({
        corpusname : optionalcorpusname
      });
      this.set("currentDataList", dl);

      var search = new Search({
        corpusname : optionalcorpusname
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
        "corpusname" : couchConnection.corpusname,
        couchConnection : couchConnection
      });
      c.id = appids.corpusid; //tried setting both ids to match, and it worked!!
      
      c.changeCorpus(couchConnection, function(){
        //fetch only after having setting the right pouch which is what changeCorpus does.
        c.fetch({
          success : function(model) {
            Utils.debug("Corpus fetched successfully", model);
            window.appView.addBackboneDoc(model.id);
            window.appView.addPouchDoc(model.id);

            var s = self.get("currentSession");
            s.set({
              "corpusname" : couchConnection.corpusname});
            s.id = appids.sessionid; 
            s.changeCorpus(couchConnection.corpusname, function(){
              s.fetch({
                success : function(model) {
                  Utils.debug("Session fetched successfully", model);
                  window.appView.addBackboneDoc(model.id);
                  window.appView.addPouchDoc(model.id);
                  
                  var dl = self.get("currentDataList");
                  dl.set({
                    "corpusname" : couchConnection.corpusname});
                  dl.id = appids.datalistid; 
                  dl.changeCorpus(couchConnection.corpusname, function(){
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
          error : function(e) {
            alert("There was an error fetching corpus. Loading defaults..."+e);
          }
        });
      });
    },
    
    loadBackboneObjectsByIdAndSetAsCurrentDashboard : function(couchConnection, appids, callback) {
      if(couchConnection == null || couchConnection == undefined){
        couchConnection = this.get("corpus").get("couchConnection");
      }
      var c = new Corpus({
        "corpusname" : couchConnection.corpusname,
        "couchConnection" : couchConnection
      });
      c.id = appids.corpusid; //tried setting both ids to match, and it worked!!
      c.changeCorpus(couchConnection, function(){
        //fetch only after having setting the right pouch which is what changeCorpus does.
        c.fetch({
          success : function(corpusModel) {
            alert("Corpus fetched successfully in loadBackboneObjectsByIdAndSetAsCurrentDashboard", corpusModel);
            window.appView.addBackboneDoc(corpusModel.id);
            window.appView.addPouchDoc(corpusModel.id);
            c.setAsCurrentCorpus(function(){
              
              var dl = new DataList({
                "corpusname" : couchConnection.corpusname
              });
              dl.id = appids.datalistid; 
              dl.changeCorpus(couchConnection.corpusname, function(){
                dl.fetch({
                  success : function(dataListModel) {
                    alert("Data list fetched successfully", dataListModel);
                    window.appView.addBackboneDoc(dataListModel.id);
                    window.appView.addPouchDoc(dataListModel.id);
                    dl.setAsCurrentDataList(function(){
                      
                      var s = new Session({
                        "corpusname" : couchConnection.corpusname
                      });
                      s.id = appids.sessionid; 
                      s.changeCorpus(couchConnection.corpusname, function(){
                        s.fetch({
                          success : function(sessionModel) {
                            Utils.debug("Session fetched successfully", sessionModel);
                            window.appView.addBackboneDoc(sessionModel.id);
                            window.appView.addPouchDoc(sessionModel.id);
                            s.setAsCurrentSession(function(){
                              /*
                               * After all fetches have succeeded show the pretty dashboard, the objects have already been linked up by their setAsCurrent methods 
                               */
                              window.appView.renderReadonlyDashboardViews();
                              if (typeof callback == "function") {
                                callback();
                              }
                            }, function(){
                              alert("Failure to set as current session in loadBackboneObjectsByIdAndSetAsCurrentDashboard");
                            });
                          },
                          error : function(e) {
                            alert("There was an error fetching the session. Loading defaults..."+e);
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
                    alert("There was an error fetching the data list. Loading defaults..."+e);
                  }
                }); //end fetch data list
              });//end data list change corpus

            }, function(){
              alert("Failure to set as current corpus in loadBackboneObjectsByIdAndSetAsCurrentDashboard");
            });//end setAsCurrentCorpus
          },
          error : function(e) {
            alert("There was an error fetching corpus. Loading defaults..."+e);
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
        }
      }
      var appSelf = this;
      appSelf.get("currentSession").saveAndInterConnectInApp(function(){
        appSelf.get("currentDataList").saveAndInterConnectInApp(function(){
          appSelf.get("corpus").saveAndInterConnectInApp(function(){
            appSelf.get("authentication").saveAndInterConnectInApp(function(){
              
              appSelf.get("authentication").staleAuthentication = true;
              localStorage.setItem("mostRecentDashboard", JSON.stringify(window.app.get("authentication").get("userPrivate").get("mostRecentIds")));
              window.appView.toastUser("Your dashboard has been saved, you can exit the page at anytime and return to this state.","alert-success","Exit at anytime:");
              appSelf.router.showDashboard();
              
              if(typeof successcallback == "function"){
                alert("The dashboard saved successfully, now calling the successcallback.");
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
