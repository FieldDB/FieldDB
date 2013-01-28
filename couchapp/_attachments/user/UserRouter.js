define([ 
    "backbone",
    "corpus/Corpus",
    "corpus/CorpusMask",
    "user/User",
    "libs/OPrime"
], function(
    Backbone,
    Corpus,
    CorpusMask,
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
      "corpus/:pouchname"               : "guessCorpusIdAndShowDashboard", 
      "login/:pouchname"                : "showQuickAuthenticateAndRedirectToDatabase",
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
    showQuickAuthenticateAndRedirectToDatabase : function(pouchname){
      window.app.set("corpus", new Corpus()); 
      window.app.get("authentication").syncUserWithServer(function(){
        var optionalCouchAppPath = OPrime.guessCorpusUrlBasedOnWindowOrigin(pouchname);
        window.location.replace(optionalCouchAppPath+"corpus.html");
    });
    },
    guessCorpusIdAndShowDashboard : function(pouchname){
      var connection = JSON.parse(JSON.stringify(window.app.get("authentication").get("userPrivate").get("corpuses")[0]));
      if(!connection){
        return;
      }
      /* this assumes that the user's corpus connection for this pouch is not on a different server */
      connection.pouchname = pouchname;
      window.app.changePouch(connection, function(){
        var c = new CorpusMask();
        c.set({
          "pouchname" : pouchname
        });
        c.id = "corpus";
        c.fetch({
          success : function(model) {
            OPrime.debug("Corpus fetched successfully", model);
            var corpusidfromCorpusMask = model.get("corpusid");
            /* Upgrade to version 1.38 */
            if(!corpusidfromCorpusMask){
              corpusidfromCorpusMask = model.get("corpusId");
            }
            if(corpusidfromCorpusMask){
              window.app.router.showCorpusDashboard(pouchname, corpusidfromCorpusMask);
            }else{
              OPrime.bug("There was a problem loading this corpus. Please report this.");
              if(OPrime.isChromeApp()){
                OPrime.bug("There was a problem loading this corpus, maybe it is not backed up?\n\n Attempting to back it up now...");
                /* TODO get the id of the only corpus in the database */
                window.location.replace("backup_pouches.html");
              }
            }
          },
          error : function(e, x, y ) {
            OPrime.debug("Problem opening the dashboard ", e, x, y);
            var reason = "";
            if(x){
              reason = x.reason;
            }
            OPrime.debug("There was a potential problem opening your dashboard." + reason);
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
        window.app.router.navigate("corpus/"+pouchname, {trigger: true});

        return;
      }
      if(!pouchname){
        OPrime.debug("the pouchname is missing, this should never happen");
        return;
      }
      var connection = JSON.parse(JSON.stringify(window.app.get("authentication").get("userPrivate").get("corpuses")[0]));
      if(!connection){
        return;
      }
      var self = this;
      connection.pouchname = pouchname;
      window.app.changePouch(connection, function(){

        var c = new Corpus();
        c.set({
          "pouchname" : pouchname
        });
        c.id = corpusid;
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
            window.app.replicateOnlyFromCorpus(null, callback);
          });
          break;
        }
      }
    }
    
  });

  return UserRouter;
});
