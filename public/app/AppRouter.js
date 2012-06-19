define([ 
    "use!backbone",
    "datum/Datum",
    "datum/Session",
    "libs/Utils"
], function(
    Backbone,
    Datum,
    Session
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
      "corpus/:corpusName" : "showFullscreenCorpus",
      "corpus/:corpusName/datum/:id" : "showFullscreenDatum",
      "corpus/:corpusName/session/:id" : "showNewSession",
      "corpus/:corpusName/datalist/:id" : "showFullscreenDataList",
      "corpus/:corpusName/datalist" : "newFullscreenDataList",
      "corpus/:corpusName/search" : "showAdvancedSearch",
      "corpus/" : "newFullscreenCorpus",
      "corpus/:corpusName/export" : "showExport",
      "user/:userName" : "showUserProfile",
      "user/:userName/prefs" : "showUserPreferences",
      "user/:userName/datumprefs" : "showDatumPreferences",
      "user/:userName/hotkeyconfig" : "showHotKeyConfig",
      "import" : "showImport",
      "" : "showDashboard",
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
      $("#fullscreen-corpus-view").show();
    },

      
    
    
    /**
     * TODO do we need this to be full screen? why not a pop-up? 
     * Displays a a page where the user can create a new corpus. 
     * 
     * @param {String}
     *          corpusName The name of the corpus this datum is from.
     * @param {Number}
     *          sessionId The ID of the session within the corpus.
     */
    newFullscreenCorpus : function() {
      Utils.debug("In newFullscreenCorpus: " );

      this.hideEverything();

      $("#dashboard-view").show();
      $("#new-corpus").show();
    },

    /**
     * Displays all of the corpus details and settings. 
     * 
     * @param {String}
     *          corpusName The name of the corpus this datum is from.
     */
    showFullscreenCorpus : function(corpusName ) {
      Utils.debug("In showFullscreenCorpus: " + corpusName);

      alert("TODO, go get the corpus that matches this name");
      this.hideEverything();

      $("#dashboard-view").show();
      $("#corpus-info-view").show();
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
          // Update the display with the Datum with the given datumId
          appView.fullScreenDatumView.render();
          
          // Display the fullscreen datum view and hide all the other views
          self.hideEverything();

          $("#dashboard-view").show();
          $("#fullscreen-datum-view").show();
        },
        
        error : function() {
          Utils.debug("Datum does not exist: " + datumId);
          
          // Create a new Datum and render it
          appView.fullScreenDatumView.model = new Datum();
          appView.fullScreenDatumView.render();
          
          // Display the fullscreen datum view and hide all the other views

          self.hideEverything();
          
          $("#dashboard-view").show();
          $("#fullscreen-datum-view").show();

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
    showNewSession : function(corpusName, sessionId) {
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
          $("#new-session-view").show();
        },
        
        error : function() {
          Utils.debug("Session does not exist: " + sessionId);
          
          // Create a new Session and render it
          appView.sessionEditView.model = new Session();
          appView.sessionEditView.render();
          
          // Display the edit session view and hide all the other views
          self.hideEverything();
          $("#dashboard-view").show();
          $("#new-session-view").show();
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
    //TODO this guy isn't connected to any div in the DOM right now (there is nothing with the id "fullscreen-datalist-vew")
    showFullscreenDataList : function(corpusName, dataListId) {
      Utils.debug("In showFullscreenDataList: " + corpusName + " *** "
          + dataListId);

      this.hideEverything();
     
      $("#dashboard-view").show();
      $("#fullscreen-datalist-view").show();      
    },
    /**
     * Displays a page where the user can make their own modified datalist specified by the given
     * corpusName and the given datumId.
     * 
     * @param {String}
     *          corpusName The name of the corpus this datum is from.
     * @param {Number}
     *          sessionId The ID of the session within the corpus.
     */
    newFullscreenDataList : function(corpusName) {
      Utils.debug("In newFullscreenDataList: " + corpusName);

      this.hideEverything();
      
      $("#dashboard-view").show();
      $('#new_data_list').show();
      
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
      
      $("#dashboard-view").show();
      $("#fullscreen-search-view").show();
      $("#corpus").show();
      $("#activity_feed").show();
     

    },

   

    /**
     * Displays the profile of the user specified by the given userName.
     * 
     * @param {String}
     *          userName The username of the user whose profile to display.
     */
    showUserProfile : function(userName) {
      Utils.debug("In showUserProfile: " + userName);
      
      // TODO Set appView.fullScreenUserview.model's properties to be for the
      // user with the given username, currently using the logged in user.
      appView.fullScreenUserView.model.set(
        appView.authView.model.get("user")
      );

      this.hideEverything();
      
      $("#dashboard-view").show();
      $("#fullscreen-user-profile-view").show();

    },

    /**
     * Displays the preferences of the logged in user.
     * 
     * @param {String}
     *          userName The username of the user logged in.
     */
    showUserPreferences : function(userName) {
      Utils.debug("In showUserPreferences: " + userName);
      
      this.hideEverything();
 
      $("#dashboard-view").show();
      $("#fullscreen-datalist-view").show();
      $("#user-preferences-view").show();
      
    },
    
    showDatumPreferences : function(userName) {
      Utils.debug("In showDatumPreferences: " + userName);

      this.hideEverything();
      
      $("#dashboard-view").show();
      $("#fullscreen-datalist-view").show();
      $("#datum-preferences-view").show();
      
    },
    
    
    showHotKeyConfig : function(userName) {
      Utils.debug("In showHotKeyConfig: " + userName);

      this.hideEverything();
      
        $("#dashboard-view").show();
        $("#fullscreen-datalist-view").show();
        $("#hotkey-config-view").show();

      },
    
      
      showImport : function() {
        Utils.debug("In import: ");

        this.hideEverything();
        $("#dashboard-view").show();
        $('#import').show();



    },
    
    showExport : function(corpusName) {
        Utils.debug("In showExport: " + corpusName);


        this.hideEverything();
        $("#dashboard-view").show();
        $('#export-view').show();
          

      },
      
      hideEverything: function() {
          $("#dashboard-view").hide();
          $("#fullscreen-datum-view").hide();
          $("#new-session-view").hide();
          $("#fullscreen-datalist-view").hide();
          $("#fullscreen-search-view").hide();
          $("#fullscreen-user-profile-view").hide();
          $("#fullscreen-corpus-view").hide();
          $("#user-preferences-view").hide();
          $("#datum-preferences-view").hide();
          $("#hotkey-config-view").hide();
          $('#new_data_list').hide();
          $("#new-corpus").hide();
          $('#export-view').hide();
          $('#import').hide();
      }
    
    
  });

  return AppRouter;
});