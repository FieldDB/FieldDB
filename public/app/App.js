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
      
    },
    
    defaults : {
      corpus : Corpus,
      authentication : new Authentication(),
      currentSession : Session,
      currentDataList : DataList
    },
    
    model : {
      corpus : Corpus,
      authentication : Authentication,
      currentSession : Session,
      currentDataList : DataList
    },
    
    parse : function(response) {
      if (response.ok === undefined) {
        for (var key in this.model) {
          var embeddedClass = this.model[key];
          var embeddedData = response[key];
          response[key] = new embeddedClass(embeddedData, {parse:true});
        }
      }
      
      return response;
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
        "id" : appids.corpusid,
        "corpusname" : couchConnection.corpusname,
        couchConnection : couchConnection
      });
      c.id = appids.corpusid; //tried setting both ids to match, and it worked!!
      
      c.changeCorpus(function(){
        //fetch only after having setting the right pouch which is what changeCorpus does.
        c.fetch({
          success : function(e) {
            Utils.debug("Corpus fetched successfully" + e);
          },
          error : function(e) {
            Utils.debug("There was an error fetching corpus. Loading defaults..."+e);
          }
        });
      });
      
      var s = this.get("currentSession");
      s.set({"id": appids.sessionid,
        "corpusname" : couchConnection.corpusname});
      s.id = appids.sessionid; //tried setting both ids to match, and it worked!!

      s.changeCorpus(couchConnection.corpusname, function(){
        //fetch only after having setting the right pouch which is what changeCorpus does.
        s.fetch({
          success : function(e) {
            Utils.debug("Session fetched successfully" +e);
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
        "id" : appids.datalistid, 
        "corpusname" : couchConnection.corpusname});
      dl.id = appids.datalistid; //tried setting both ids to match, and it worked!!

      dl.changeCorpus(couchConnection.corpusname, function(){
        //fetch only after having setting the right pouch which is what changeCorpus does.
        dl.fetch({
          success : function(e) {
            Utils.debug("Data list fetched successfully" +e);
          },
          error : function(e) {
            Utils.debug("There was an error fetching the data list. Loading defaults..."+e);
          }
        });
      });
      
      //TODO move this callback after the fetch succeeds?
      if (typeof callback == "function") {
        callback();
      }
      
    },
    router : AppRouter,
    
    /**
     * This function should be called before the user leaves the page, it should also be called before the user clicks sync
     * It helps to maintain where the user was, what corpus they were working on etc. It creates the json that is used to reload
     * a users' dashboard from localstorage, or to load a fresh install when the user clicks sync my data.
     * 
     * Note: its callback is only called if saving the corpus worked. 
     * 
     */
    storeCurrentDashboardIdsToLocalStorage : function(callback){
      this.get("currentSession").save(null, {
        success : function(model, response) {
          console.log('Session save success');
          try{
            window.app.get("authentication").get("userPrivate").get("mostRecentIds").sessionid = model.get("id");
          }catch(e){
            Utils.debug("Couldnt save the session id to the user's mostrecentids"+e);
          }
        },
        error : function(e) {
          console.log('Session save error' + e);
        }
      });
      this.get("currentDataList").save(null, {
        success : function(model, response) {
          console.log('Datalist save success');
          try{
            window.app.get("authentication").get("userPrivate").get("mostRecentIds").datalistid = model.get("id");
          }catch(e){
            Utils.debug("Couldnt save the datatlist id to the user's mostrecentids"+e);
          }
        },
        error : function(e) {
          console.log('Datalist save error' + e);
        }
      });
      this.get("corpus").save(null, {
        success : function(model, response) {
          console.log('Corpus save success');
          try{
            localStorage.setItem("mostRecentCouchConnection", model.get("couchConnection"));
            window.app.get("authentication").get("userPrivate").get("mostRecentIds").corpusid = model.get("id");
          }catch(e){
            Utils.debug("Couldnt save the corpus id to the user's mostrecentids"+e);
          }
        },
        error : function(e) {
          console.log('Corpus save error' + e);
        }
      });

        //Note: unable to use the success and fail of the backbone save to trigger this, so instead, waiting 1 second and hoping all the saves resulted in ids
        window.setTimeout( (function(callback){
          //moved the save of these into the 
//          var ids = {};
//          ids.corpusid = window.app.get("corpus").get("id");
//          ids.sessionid = window.app.get("currentSession").get("id");
//          ids.datalistid = window.app.get("currentDataList").get("id");
          
//          localStorage.setItem("appids", JSON.stringify(ids));
          localStorage.setItem("userid", window.app.get("authentication").get("userPrivate").get("id"));//the user private should get their id from mongodb
          
          //save ids to the user also so that the app can bring them back to where they were
          
          if(typeof callback == "function"){
            callback();
          }
        })(callback), 5000);
        
        
    }

  });

  return App;
});
