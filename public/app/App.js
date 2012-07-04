define([
    "use!backbone", 
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
    createAppBackboneObjects : function(callback){
      if (typeof this.get("authentication").get("userPublic") == "function") {
        var u = new UserMask();
        this.get("authentication").set("userPublic", u);
      }
      if (typeof this.get("authentication").get("userPrivate") == "function") {
        var u2 = new User();
        this.get("authentication").set("userPrivate", u2);
      }
      var c = new Corpus();
      this.set("corpus", c);

      var s = new Session({
        sessionFields : c.get("sessionFields").clone()
      });
      this.set("currentSession", s);

      var dl = new DataList();
      this.set("currentDataList", dl);
      
      if(typeof callback == "function"){
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
     * @param corpusid
     * @param sessionid
     * @param datalistid
     */
    loadBackboneObjectsById: function(appids, callback){
      var self = this;
      var c = this.get("corpus");
      c.id = appids.corpusid;
      this.set("corpus", c);
      
      var s = this.get("currentSession");
      s.id = appids.sessionid;
      this.set("currentSession", s);
      
      var dl = this.get("currentDataList");
      dl.id = appids.datalistid;
      dl.fetch();
      this.set("currentDataList", dl);
      
      c.fetch({
        success : function(e) {
          Utils.debug("Corpus fetched successfully" +e);
        },
        error : function(e) {
          Utils.debug("There was an error fetching corpus. Loading defaults..."+e);
        }
      });
      
      s.fetch({
        success : function(e) {
          Utils.debug("Session fetched successfully" +e);
          s.set(
              sessionFields , self.get("corpus").get("sessionFields").clone()
          );
        },
        error : function(e) {
          Utils.debug("There was an error restructuring the session. Loading defaults..."+e);
          s.set(
              sessionFields , self.get("corpus").get("sessionFields").clone()
          );
        }
      });
      
      
      if(typeof callback == "function"){
        callback();
      }
      
    },
    router : AppRouter,
    
    /**
     * This function should be called before the user leaves the page, it should also be called before the user clicks sync
     * It helps to maintain where the user was, what corpus they were working on etc. It creates the json that is used to reload
     * a users' dashboard from localstorage, or to load a fresh install when the user clicks sync my data.
     */
    storeCurrentDashboardIdsToLocalStorage : function(callback){
//      try{
        var ids = {};
        this.get("currentSession").save();
        this.get("currentDataList").save();
        this.get("corpus").save();
        
        ids.corpusid = this.get("corpus").id;
        ids.sessionid = this.get("currentSession").id;
        ids.datalistid = this.get("currentDataList").id;
        localStorage.setItem("appids",JSON.stringify(ids));
        localStorage.setItem("userid",this.get("authentication").get("userPrivate").id);//the user private should get their id from mongodb
        
        //save ids to the user also so that the app can bring them back to where they were
        this.get("authentication").get("userPrivate").set("mostRecentIds",ids);
        
        if(typeof callback == "function"){
          callback();
        }
//      }catch(e){
//        Utils.debug("storeCurrentDashboardIdsTo  LocalStorage failed, probably called too early. ");
//        Utils.debug(e);
//      }
    }

  });

  return App;
});
