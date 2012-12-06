define([ 
    "backbone",
    "corpus/Corpus",
    "user/User",
    "libs/Utils"
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
      Utils.debug("In showDashboard: " );
//      $("#user-modal").modal("show");

    },
    /**
     * Displays the dashboard view of the user loaded in authentication
     * 
     */
    showFullscreenUser : function() {
      Utils.debug("In showFullscreenUser: " );
    },
    guessCorpusIdAndShowDashboard : function(pouchname){
      var c = new Corpus();
      c.set({
        "pouchname" : pouchname
      });
      c.id = "corpus";
      c.changePouch({pouchname: pouchname},function(){
        
        c.fetch({
          success : function(model) {
            Utils.debug("Corpus fetched successfully", model);
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
      Utils.debug("In showFullscreenCorpus: " );
      
      /*
       * If the corpusid is not specified, then try to guess it by re-routing us to the guess function
       */
      if(!corpusid){
        window.location.href="#corpus/"+pouchname;
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
            Utils.debug("Corpus fetched successfully", model);

            if(c.get("dataLists").length > 0 && c.get("sessions").length > 0 ){
              self.loadCorpusDashboard(model);
            }else{
              alert("Bug: Something might be wrong with this corpus. ");

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
            }

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
          datalistid : c.get("dataLists").models[0].id,
          sessionid : c.get("sessions").models[0].id
        };
        console.log("mostRecentIds",mostRecentIds);
        localStorage.setItem("mostRecentCouchConnection",JSON.stringify(c.get("couchConnection")));
        localStorage.setItem("mostRecentDashboard", JSON.stringify(mostRecentIds));
        window.location.replace("corpus.html");
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
