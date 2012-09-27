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
              
              if(c.get("dataLists").length > 0 && c.get("sessions").length > 0 ){
                self.loadCorpusDashboard(model);
              }else{
                alert("Bug: Something might be wrong with this corpus. "+e);

                c.makeSureCorpusHasADataList(function(){
                  c.makeSureCorpusHasASession(function(){
                    self.loadCorpusDashboard(model);
                    //end success to create new data list
                  },function(e){
                    alert("Failed to create a session. "+e);
                  });//end failure to create new data list
                  //end success to create new data list
                },function(){
                  alert("Failed to create a datalist. "+e);
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
              var couchConnection = window.app.get("authentication").get("userPrivate").get("corpuses")[0];
              self.bringCorpusToThisDevice(c, function(){
                alert("Downloaded this corpus to this device. Attempting to load the corpus dashboard.");
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
