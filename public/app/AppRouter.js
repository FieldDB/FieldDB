define([ 
    "use!backbone",
    "datum/Datum",
    "datum/DatumEditView",
    "datum/Session",
    "datum/SessionEditView",
    "libs/Utils"
], function(
    Backbone,
    Datum,
    DatumEditView,
    Session,
    SessionEditView
) {
  var AppRouter = Backbone.Router.extend(
  /** @lends AppRouter.prototype */
  {
    /**
     * @class Routes URLs to different dashboard layouts and data.As backbone is
     *        a one page app, this shows and hides different "pages", for
     *        example it starts out with a full screen dashboard view, with
     *        datalist and a datum, but when the user clicks the full screen
     *        buttons or uses the navigation menu, and it also happens any time
     *        the URL changes it will make the component full screen by hiding
     *        and showing divs using jquery.
     * 
     * @extends Backbone.Router
     * @constructs
     */
    initialize : function() {
    },

    routes : {
      "corpus/:corpusId"                : "showFullscreenCorpus", 
      "corpus/:corpusName/datum/:id"    : "showEmbeddedDatum",
      "corpus/:corpusName/search"       : "showAdvancedSearch",
      "corpus/"                         : "showFullscreenCorpus", 
      "data/:dataListId"                : "showFullscreenDataList",
      "user/:username"                  : "showFullscreenUser",
      "import"                          : "showImport",
      ""                                : "showDashboard"
    },
    
    /**
     * Displays the dashboard view of the given corpusName, if one was given. Or
     * the blank dashboard view, otherwise.
     * 
     * @param {String}
     *          corpusName (Optional) The name of the corpus to display.
     */
    showDashboard : function(corpusName) {
      Utils.debug("In showDashboard: " + corpusName);

      this.hideEverything();
      $("#dashboard-view").show();
      $("#datums-embedded").show();
      
    },
    /**
     * Displays the fullscreen user page view of the given user
     */
    showFullscreenUser : function(userName) {
      Utils.debug("In showFullscreenUser: " + userName);

      this.hideEverything();
      $("#user-fullscreen").show();
    },
    
    /**
     * Displays the fullscreen datum container page view.
     */
    showFullscreenDatumContainer : function() {
      Utils.debug("In showFullscreenDatumContainer");
      
      this.hideEverything();
      $("#datum-container-fullscreen").show();
    },

    /**
     * Displays all of the corpus details and settings. 
     * 
     * @param {String}
     *          corpusName The name of the corpus this datum is from.
     */
    showFullscreenCorpus : function(corpusName ) {
      Utils.debug("In showFullscreenCorpus: " + corpusName);

      this.hideEverything();
      $("#corpus-fullscreen").show();
    },
    /**
     * Displays all of the corpus details and settings. 
     * 
     * @param {String}
     *          corpusName The name of the corpus this datum is from.
     */
    showEmbeddedCorpus : function(corpusName ) {
      Utils.debug("In showEmbeddedCorpus: " + corpusName);

      this.hideEverything();
      $("#dashboard-view").show();
      $("#corpus-embedded").show();
    },
    
    /**
     * Displays the fullscreen view of the datum specified by the given
     * corpusName and the given datumId.
     * 
     * @param {String}
     *          corpusName The name of the corpus this datum is from.
     * @param {Number}
     *          datumId The ID of the datum within the corpus.
     */
    showFullscreenDatum : function(corpusName, datumId) {
      Utils.debug("In showFullscreenDatum: " + corpusName + " *** " + datumId);

      // Change the id of the fullscreen datum view's Datum to be the given datumId
      appView.fullScreenDatumView.model.id = datumId;
      
      // Save the currently displayed Datum, if needed
      appView.fullScreenDatumView.saveScreen();
      
      // Fetch the Datum's attributes from the PouchDB
      var self = this;
      appView.fullScreenDatumView.model.fetch({
        success : function() {
          // Restructure Datum's inner models
          appView.fullScreenDatumView.model.restructure();
          
          // Update the display with the Datum with the given datumId
          appView.fullScreenDatumView.render();
          
          // Display the fullscreen datum view and hide all the other views
          self.hideEverything();
          $("#datums-fullscreen").show();
        },
        
        error : function() {
          Utils.debug("Datum does not exist: " + datumId);
          
          // Create a new Datum (cloning the default datum fields from the
          // corpus in case they changed) and render it
          appView.fullScreenDatumView = new DatumEditView({
            model : new Datum({
              datumFields : app.get("corpus").get("datumFields").clone(),
              datumStates : app.get("corpus").get("datumStates").clone()
            })
          });
          appView.fullScreenDatumView.render();
          
          // Display the fullscreen datum view and hide all the other views
          self.hideEverything();
          $("#datums-fullscreen").show();
        },
      });
    }, 
    /**
     * Displays the fullscreen view of the datum specified by the given
     * corpusName and the given datumId.
     * 
     * @param {String}
     *          corpusName The name of the corpus this datum is from.
     * @param {Number}
     *          datumId The ID of the datum within the corpus.
     */
    showEmbeddedDatum : function(corpusName, datumId) {
      Utils.debug("In showEmbeddedDatum: " + corpusName + " *** " + datumId);

      // Change the id of the fullscreen datum view's Datum to be the given datumId
      appView.fullScreenDatumView.model.id = datumId;
      
      // Save the currently displayed Datum, if needed
      appView.fullScreenDatumView.saveScreen();
      
      // Fetch the Datum's attributes from the PouchDB
      var self = this;
      appView.fullScreenDatumView.model.fetch({
        success : function() {
          // Restructure Datum's inner models
          appView.fullScreenDatumView.model.restructure();
          
          // Update the display with the Datum with the given datumId
          appView.fullScreenDatumView.render();
          
          // Display the fullscreen datum view and hide all the other views
          self.hideEverything();
          $("#dashboard-view").show();
          $("#datums-embedded").show();
        },
        
        error : function() {
          Utils.debug("Datum does not exist: " + datumId);
          
          // Create a new Datum (cloning the default datum fields from the
          // corpus in case they changed) and render it
          appView.fullScreenDatumView = new DatumEditView({
            model : new Datum({
              datumFields : app.get("corpus").get("datumFields").clone(),
              datumStates : app.get("corpus").get("datumStates").clone()
            })
          });
          appView.fullScreenDatumView.render();
          
          // Display the fullscreen datum view and hide all the other views
          self.hideEverything();
          $("#dashboard-view").show();
          $("#datums-embedded").show();
        },
      });
    },
    
    /**
     * Displays the fullscreen view of the session specified by the given
     * corpusName and the given datumId.
     * 
     * @param {String}
     *          corpusName The name of the corpus this datum is from.
     * @param {Number}
     *          sessionId The ID of the session within the corpus.
     */
    showEmbeddedSession : function(corpusName, sessionId) {
      Utils.debug("In showFullscreenSession: " + corpusName + " *** "
          + sessionId);
          
      // Change the id of the edit session view's Session to be the given sessionId
      appView.sessionEditView.model.id = sessionId;
      
      // Fetch the Session's attributes from the PouchDB
      var self = this;
      appView.sessionEditView.model.fetch({
        success : function() {
          // Update the display with the Session with the given sessionId
          appView.sessionEditView.render();
          
          // Display the edit session view and hide all the other views
          self.hideEverything();
          $("#dashboard-view").show();
          $("#session-embedded").show();
        },
        
        error : function() {
          Utils.debug("Session does not exist: " + sessionId);
          
          // Create a new Session (cloning the default session fields from the
          // corpus in case they changed) and render it
          appView.sessionEditView = new SessionEditView({
            model : new Session({
              sessionFields : app.get("corpus").get("sessionFields").clone()
            })
          });
          appView.sessionEditView.render();
          
          // Display the edit session view and hide all the other views
          self.hideEverything();
          $("#dashboard-view").show();
          $("#session-embedded").show();
        }
      });
    },
   
    /**
     * Displays the fullscreen view of the datalist specified by the given
     * corpusName and the given dataListId
     * 
     * @param {String}
     *          corpusName The name of the corpus this datalist is from.
     * @param {Number}
     *          dataListId The ID of the datalist within the corpus.
     */
    showFullscreenDataList : function(corpusName, dataListId) {
      Utils.debug("In showFullscreenDataList: " + corpusName + " *** "
          + dataListId);

      this.hideEverything();
      $("#data-list-fullscreen").show();      
    },
    
    /**
     * Display the fullscreen view of search within the corpus specified by the
     * given corpusName.
     * 
     * @param {String}
     *          corpusName The name of the corpus to search in.
     */
    showAdvancedSearch : function(corpusName) {
      Utils.debug("In showAdvancedSearch: " + corpusName);

      this.hideEverything();
      $("#search-fullscreen").show();
    },

    showImport : function() {
      Utils.debug("In import: ");

      this.hideEverything();
      $("#dashboard-view").show();
      $('#import-modal').modal("show");
    },
    
    showExport : function(corpusName) {
      Utils.debug("In showExport: " + corpusName);

      this.hideEverything();
      $("#dashboard-view").show();
      $('#export-modal').modal("show");
    },
    
    //Functions that toggle between editable and readonly corpus views
    showEditableCorpus : function(corpusid){
      window.appView.renderEditableCorpusViews(corpusid);
    },
    showReadonlyCorpus : function(corpusid){
      window.appView.renderReadonlyCorpusViews(corpusid);
    },
    
    //Functions that toggle between editable and readonly session views
    showEditableSession : function(sessionid){
      window.appView.renderEditableSessionViews(sessionid);
    },
    showReadonlySession : function(sessionid){
      window.appView.renderReadonlySessionViews(sessionid);
    },
    
    hideEverything: function() {
      $("#dashboard-view").hide();
      $("#datums-embedded").hide();
      $("#data-list-fullscreen").hide();
      $("#datum-container-fullscreen").hide();
      $("#corpus-embedded").hide();
      $("#corpus-fullscreen").hide();
      $("#search-fullscreen").hide();
      $("#search-embedded").hide();
      $("#session-embedded").hide();
      $('#user-fullscreen').hide();
    },
    /**
     * This function should be called before the user leaves the page, it should also be called before the user clicks sync
     * It helps to maintain where the user was, what corpus they were working on etc. It creates the json that is used to reload
     * a users' dashboard from localstorage, or to load a fresh install when the user clicks sync my data.
     */
    storeCurrentDashboardIdsToLocalStorage : function(){
      var ids = {};
      window.appView.authView.model.get("user").save();
      window.app.get("currentSession").save();
      window.app.get("currentDataList").save();
      window.app.get("corpus").save();
      
      ids.corpusid = window.app.get("corpus").id;
      ids.sessionid = window.app.get("currentSession").id;
      ids.datalistid = window.app.get("currentDataList").id;
      ids.userid = window.appView.authView.model.get("user").id;
      localStorage.setItem("appids",JSON.stringify(ids));
      
      //save ids to the user also so that the app can bring them back to where they were
      window.appView.authView.model.get("user").set("mostRecentIds",ids);
      window.appView.authView.model.get("user").save();
    }
  });

  return AppRouter;
});
