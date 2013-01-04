define([ 
    "backbone",
    "corpus/Corpus",
    "user/User",
    "libs/OPrime"
], function(
    Backbone,
    Corpus,
    User
) {
  var UserRouter = Backbone.Router.extend(
  /** @lends UserRouter.prototype */
  {
    /**
     * @class Routes URLs to handle the user dashboard. Mostly just
     *        shows the user a list of their corpora so they can switch
     *        between corpora.
     * 
     * @extends Backbone.Router
     * @constructs
     */
    initialize : function() {
    },

    routes : {
      "corpus/:pouchname/:id"           : "showCorpusDashboard", 
      "corpus/:pouchname/"              : "guessCorpusIdAndShowDashboard", 
      "render/:render"                  : "showDashboard",
      ""                                : "showDashboard"
    },
    
    /**
     * Displays the dashboard view of the user loaded in authentication
     * 
     */
    showDashboard : function(renderOrNot) {
      OPrime.debug("In showDashboard: " );
//      $("#user-modal").modal("show");

    },
    /**
     * Displays the dashboard view of the user loaded in authentication
     * 
     */
    showFullscreenUser : function() {
      OPrime.debug("In showFullscreenUser: " );
    },
    guessCorpusIdAndShowDashboard : function(pouchname){
      if(pouchname == "new"){
        alert("TODO create a new corpus and direct user to its dashboard.");
        return;
      }
      
      try{
        Backbone.couch_connector.config.db_name = pouchname;
      }catch(e){
        OPrime.debug("Couldn't set the database name off of the pouchame.");
      }
      
      var c = new Corpus();
      c.set({
        "pouchname" : pouchname
      });
      c.id = "corpus";
      c.changePouch({pouchname: pouchname},function(){
        
        c.fetch({
          success : function(model) {
            OPrime.debug("Corpus fetched successfully", model);
            window.app.router.showCorpusDashboard(pouchname, c.get("corpusId"));
          },
          error : function(e, x, y ) {
            alert("There was a problem opening your dashboard.");
          }
        });
      });
    },
    
    /**
     * Loads the requested corpus, and redirects the user to the corpus dashboard 
     * 
     * @param {String}
     *          pouchname The name of the corpus this datum is from.
     */
    showCorpusDashboard : function(pouchname, corpusid) {
      OPrime.debug("In showFullscreenCorpus: " );
      
      /*
       * If the corpusid is not specified, then try to guess it by re-routing us to the guess function
       */
      if(!corpusid){
        window.location.href="#corpus/"+pouchname;
        return;
      }
      
      try{
        Backbone.couch_connector.config.db_name = pouchname;
      }catch(e){
        OPrime.debug("Couldn't set the database name off of the pouchame.");
      }

      var self = this;
      var c = new Corpus();
      c.set({
        "pouchname" : pouchname
      });
      c.id = corpusid;
      c.changePouch({pouchname: pouchname}, function(){
        //fetch only after having setting the right pouch which is what changePouch does.
        c.fetch({
          success : function(model) {
            OPrime.debug("Corpus fetched successfully", model);

            c.makeSureCorpusHasADataList(function(){
              c.makeSureCorpusHasASession(function(){
                self.loadCorpusDashboard(model);
                //end success to create new data list
              },function(){
                alert("Failed to create a session. ");
              });//end failure to create new data list
              //end success to create new data list
            },function(){
              alert("Failed to create a datalist. ");
            });//end failure to create new data list

          },
          error : function(e, x, y ) {
            console.log(e);
            console.log(x);
            console.log(y);
            if(self.islooping){
              return;
            }
            
            self.bringCorpusToThisDevice(c, function(){
              alert("Downloaded this corpus to this device. Attempting to load the corpus dashboard.");
              self.showCorpusDashboard(pouchname, corpusid);
              self.islooping = true;

            }, function(e){
              alert("Couldn't download this corpus to this device. There was an error replicating corpus..."+e);
            });

          }
        });
      });


    },
    loadCorpusDashboard: function(c){
      var mostRecentIds = {
          corpusid : c.id,
          datalistid : c.datalists.models[0].id,
          sessionid : c.sessions.models[0].id,
          couchConnection : c.get("couchConnection")
        };
        console.log("mostRecentIds", mostRecentIds);
        window.app.get("authentication").get("userPrivate").set("mostRecentIds", mostRecentIds);
        window.app.get("authentication").saveAndInterConnectInApp(function(){
          var optionalCouchAppPath= "";
          if(c.get("couchConnection").pouchname){
             optionalCouchAppPath = OPrime.guessCorpusUrlBasedOnWindowOrigin(c.get("couchConnection").pouchname);
          }
          window.location.replace(optionalCouchAppPath+"corpus.html");
          return;
        });
    },
    bringCorpusToThisDevice : function(corpus, callback) {
      for (var x in window.app.get("authentication").get("userPrivate").get("corpuses")){
        if(window.app.get("authentication").get("userPrivate").get("corpuses")[x].pouchname == corpus.get("pouchname")){
          corpus.set("couchConnection", window.app.get("authentication").get("userPrivate").get("corpuses")[x]);
          window.app.set("corpus",corpus);
          window.app.get("authentication").staleAuthentication = true;
          window.app.get("authentication").syncUserWithServer(function(){
            corpus.replicateFromCorpus(null, callback);
          });
          break;
        }
      }
    }
    
  });

  return UserRouter;
});
