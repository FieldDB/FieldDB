define([
    "backbone", 
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
     *           app is online or not.
     * 
     * @property {Corpus} corpus The corpus is a Corpus object which will permit
     *           access to the datum, and the data lists. The corpus feeds the
     *           search object with indexes and fields for advanced search, the
     *           corpus has datalists, has teams with permissions, has a
     *           confidentiality_encryption key, it's datum have sessions, its
     *           datalists have export.
     * 
     * @property {Search} search The search is the primary surface where the
     *           global search features will attach.
     * 
     * @property {Session} currentSession The session that is currently open.
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
      
      window.onbeforeunload = this.saveAllStateBeforeUserLeaves;
      window.onunload = this.storeCurrentDashboardIdsToLocalStorage;
      localStorage.setItem("saveStatus", "Not Saved");

      
    },
    
    defaults : {
      corpus : Corpus,
      currentSession : Session,
      currentDataList : DataList
    },
    
    // Internal models: used by the parse function
    model : {
      corpus : Corpus,
      authentication : Authentication,
      currentSession : Session,
      currentDataList : DataList
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
      if(optionalcorpusname == null){
        optionalcorpusname == "";
      }
      if (this.get("authentication").get("userPublic") == undefined) {
        var u = new UserMask({corpusname: optionalcorpusname});
        this.get("authentication").set("userPublic", u);
      }
      if (this.get("authentication").get("userPrivate") == undefined) {
        var u2 = new User();
        this.get("authentication").set("userPrivate", u2);
      }
      var c = new Corpus({corpusname : optionalcorpusname});
      this.set("corpus", c);

      var s = new Session({
        corpusname : optionalcorpusname,
        sessionFields : c.get("sessionFields").clone()
      });
      this.set("currentSession", s);

      var dl = new DataList({corpusname: optionalcorpusname});
      this.set("currentDataList", dl);
      
      if (typeof callback == "function") {
        callback();
      }
    },
    /**
     * Accepts the ids to load the app. This is a helper function which is caled
     * at the three entry points, main (if there is json in the localstorage
     * from where the user was last working), Welcome new user has a similar
     * function but which creates a user and their recent data, and
     * authentication calls this function to load the users most recent work
     * after they have authenticated (if they were the user who was logged in,
     * they take it frmo local storage, if they were not then the data will have
     * to be synced.)
     * 
     * Preconditions:
     * The user is already authenticated with their corpus server,
     * The corpus server has sent down(replicated) the data.
     * 
     * @param corpusid
     * @param sessionid
     * @param datalistid
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
          success : function(e) {
            Utils.debug("Corpus fetched successfully" + e);
            //show pretty views after loading everything.
            window.appView.renderReadonlyCorpusViews();
          },
          error : function(e) {
            Utils.debug("There was an error fetching corpus. Loading defaults..."+e);
          }
        });
      });
      
      var s = this.get("currentSession");
      s.set({
        "corpusname" : couchConnection.corpusname});
      s.id = appids.sessionid; //tried setting both ids to match, and it worked!!

      s.changeCorpus(couchConnection.corpusname, function(){
        //fetch only after having setting the right pouch which is what changeCorpus does.
        s.fetch({
          success : function(e) {
            Utils.debug("Session fetched successfully" +e);
            //show pretty views after loading everything.
            window.appView.renderReadonlySessionViews();
          },
          error : function(e) {
            Utils.debug("There was an error fetching the session. Loading defaults..."+e);
            s.set(
                "sessionFields", self.get("corpus").get("sessionFields").clone()
            );
          }
        });
      });
      var dl = this.get("currentDataList");
      dl.set({
        "corpusname" : couchConnection.corpusname});
      dl.id = appids.datalistid; //tried setting both ids to match, and it worked!!

      dl.changeCorpus(couchConnection.corpusname, function(){
        //fetch only after having setting the right pouch which is what changeCorpus does.
        dl.fetch({
          success : function(e) {
            Utils.debug("Data list fetched successfully" +e);
            //show pretty views after loading everything.
            window.appView.renderReadonlyDataListViews();
          },
          error : function(e) {
            Utils.debug("There was an error fetching the data list. Loading defaults..."+e);
          }
        });
      });
      
      //TODO move this callback after the fetch succeeds?
      if (typeof callback == "function") {
        callback();
        //show pretty views after loading everything.
      }
      
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
    saveAllStateBeforeUserLeaves : function(e){
      localStorage.setItem("saveStatus", "Saving in unload...");
      
      //TODO, this doesn't work.
      //this.storeCurrentDashboardIdsToLocalStorage();
      
      return "We will attempt to save your dashboard to your computer. \n\n"
      +"If you want backup/share your data with your collaborators click Cancel, then click the Sync button.\n\n"
      +"Your data currently saved on your local tablet/laptop only.";
    },
    /**
     * This function should be called before the user leaves the page, it should also be called before the user clicks sync
     * It helps to maintain where the user was, what corpus they were working on etc. It creates the json that is used to reload
     * a users' dashboard from localstorage, or to load a fresh install when the user clicks sync my data.
     * 
     * Note: its callback is only called if saving the corpus worked. 
     * 
     */
    storeCurrentDashboardIdsToLocalStorage : function(callback){
      localStorage.setItem("saveStatus", "Saving in unload...in store function");
      window.app.get("authentication").saveAndEncryptUserToLocalStorage();

      /*
       * Turn on pub sub to find out when all three have saved, then call the callback
       */
      var thiscallback = callback;
      window.hub.unsubscribe("savedToPouch", null, this);
      window.hub.unsubscribe("saveFailedToPouch", null, this);
      
      this.savedcount = 0;
      this.savefailedcount = 0;
      window.hub.subscribe("savedToPouch",function(arg){
        alert("Saved "+ arg+ " to pouch.");
        window.app.savedcount++;
        if( window.app.savedcount > 2){
//       dont need, now using all details   localStorage.setItem("userid", window.app.get("authentication").get("userPrivate").id);//the user private should get their id from mongodb
          window.app.get("authentication").staleAuthentication = true;//TODO turn this on when the pouch stops making duplicates for all the corpus session datalists that we call save on, this will also trigger a sync of the user details to the server, and ask them to use their password to confim that they want to replcate to their corpus.
          localStorage.setItem("mostRecentDashboard", JSON.stringify(window.app.get("authentication").get("userPrivate").get("mostRecentIds")));
          alert("Your dashboard has been saved, you can exit the page at anytime and return to this state.");
          //save ids to the user also so that the app can bring them back to where they were
          if(typeof thiscallback == "function"){
            thiscallback();
          }
          window.hub.unsubscribe("savedToPouch", null, window.app);
        }
      },this);
      window.hub.subscribe("saveFailedToPouch",function(arg){
        Utils.debug("Saved "+ arg+ " to pouch.");
        window.app.savefailedcount++;
        alert("Save failed "+arg);
      },this);
      var self = this;
      this.get("currentSession").changeCorpus( self.get("corpus").get("couchConnection").corpusname, function(){
        self.get("currentSession").save(null, {
          success : function(model, response) {
            Utils.debug('Session save success');
            try{
              window.app.get("authentication").get("userPrivate").get("mostRecentIds").sessionid = model.id;
            }catch(e){
              Utils.debug("Couldnt save the session id to the user's mostrecentids"+e);
            }
            hub.publish("savedToPouch","session"+model.id);
            localStorage.setItem("saveStatus", "Saving in unload...saved session");

            self.get("currentDataList").changeCorpus( self.get("corpus").get("couchConnection").corpusname, function(){
              self.get("currentDataList").save(null, {
                success : function(model, response) {
                  Utils.debug('Datalist save success');
                  try{
                    window.app.get("authentication").get("userPrivate").get("mostRecentIds").datalistid = model.id;
                  }catch(e){
                    Utils.debug("Couldnt save the datatlist id to the user's mostrecentids"+e);
                  }
                  hub.publish("savedToPouch","datalist"+model.id);
                  localStorage.setItem("saveStatus", "Saving in unload...saved datalist");

                  self.get("corpus").changeCorpus( self.get("corpus").get("couchConnection"), function(){
                    self.get("corpus").save(null, {
                      success : function(model, response) {
                        Utils.debug('Corpus save success');
                        try{
                          window.app.get("authentication").get("userPrivate").get("mostRecentIds").corpusid = model.id;
                          localStorage.setItem("mostRecentCouchConnection", JSON.stringify(model.get("couchConnection")));
                        }catch(e){
                          Utils.debug("Couldnt save the corpus id to the user's mostrecentids"+e);
                        }
                        hub.publish("savedToPouch","corpus"+model.id);
                        localStorage.setItem("saveStatus", "Saving in unload...saved corpus");
                        localStorage.setItem("mostRecentDashboard", JSON.stringify(window.app.get("authentication").get("userPrivate").get("mostRecentIds")));
                        localStorage.setItem("saveStatus", "Saving in unload...saved entire dashboard");

                      },
                      error : function(e) {
                        Utils.debug('Corpus save error' );
                        Utils.debug(e);
                        hub.publish("saveFailedToPouch","corpus");
                      }
                    });
                  });
                },
                error : function(e) {
                  Utils.debug('Datalist save error');
                  Utils.debug(e);
                  hub.publish("saveFailedToPouch","datalist");
                }
              });
            });
          },
          error : function(e) {
            Utils.debug('Session save error' );
            Utils.debug(e);
            hub.publish("saveFailedToPouch","session");
          }
        });
      });
      localStorage.setItem("saveStatus", "Saving in unload...end store function");

      return "Returning before the save is done.";
    }
  });

  return App;
});
