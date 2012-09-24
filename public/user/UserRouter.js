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
      ""                                : "showDashboard"
    },
    
    /**
     * Displays the dashboard view of the user loaded in authentication
     * 
     */
    showDashboard : function() {
      Utils.debug("In showDashboard: " );
      $("#user-modal").modal("show");

    },
    /**
     * Displays the dashboard view of the user loaded in authentication
     * 
     */
    showFullscreenUser : function() {
      Utils.debug("In showFullscreenUser: " );
    },
    
    /**
     * Loads the requested corpus, and redirects the user to the corpus dashboard 
     * 
     * @param {String}
     *          pouchname The name of the corpus this datum is from.
     */
    showCorpusDashboard : function(pouchname, corpusid) {
      Utils.debug("In showFullscreenCorpus: " );
      
      var self = this;
      if(corpusid){
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
              var mostRecentIds = {
                corpusid : c.id,
                datalistid : c.get("dataLists").models[0].id,
                sessionid : c.get("sessions").models[0].id
              };
              console.log("mostRecentIds",mostRecentIds);
              localStorage.setItem("mostRecentCouchConnection",JSON.stringify(model.get("couchConnection")));
              localStorage.setItem("mostRecentDashboard", JSON.stringify(mostRecentIds));
              window.location.replace("corpus.html");
            },
            error : function(e, x, y ) {
              console.log(e);
              console.log(x);
              console.log(y);
              if(self.islooping){
                return;
              }
              var couchConnection = window.app.get("userPrivate").get("corpuses")[0];
              self.bringCorpusToThisDevice(couchConnection, function(){
                alert("Downloaded this corpus to this device. "+e);
                self.showCorpusDashboard(pouchname, corpusid);
                self.islooping = true;
                
              }, function(){
                alert("Couldn't download this corpus to this device. There was an error replicating corpus..."+e);
              });
            }
          });
        });
              
      }else{
        alert("Cannot fetch the corpus without its id..."+e);
      }
      
    },
    bringCorpusToThisDevice : function(corpus, callback) {
      window.app.get("authentication").syncUserWithServer(function(){
        corpus.replicateFromCorpus(null, callback);
      });
    }
    
  });

  return UserRouter;
});
