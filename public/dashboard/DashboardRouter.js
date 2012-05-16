define([
    "use!backbone",
    "./../../libs/Utils.js"
], function(Backbone) {
    var DashboardRouter = Backbone.Router.extend(
    /** @lends DashboardRouter.prototype */
    {
       /**
        * @class Routes URLs to different dashboard layouts and data.
        *
        * @extends Backbone.Router
        * @constructs
        */
       initialize: function() {
       },
       
       routes: {
          "corpus/:corpusName/datum/:id": "showExtendedDatum",
          "corpus/:corpusName/datalist/:id": "showExtendedDataList",
          "corpus/:corpusName/search": "showExtendedSearch",
          "corpus/:corpusName": "showDashboard",
          "user/:userName": "showUserProfile",
          "": "showDashboard"
       },
          
       /**
        * Displays the extended view of the datum specified by the given 
        * corpusName and the given datumId.
        * 
        * @param {String} corpusName The name of the corpus this datum is from.
        * @param {Number} datumId The ID of the datum within the corpus.
        */
       showExtendedDatum: function(corpusName, datumId) {
       	  debug("In showExtendedDatum: " + corpusName + " *** " + datumId);
       	  
       	  $("#dashboard-view").hide();
       	  $("#extended-datum-view").show();
       	  $("#extended-datalist-view").hide();
       	  $("#extended-search-view").hide();
       	  $("#user-profile-view").hide();
       },
          
       /**
        * Displays the extended view of the datalist specified by the given
        * corpusName and the given dataListId
        *  
        * @param {String} corpusName The name of the corpus this datalist is from.
        * @param {Number} dataListId The ID of the datalist within the corpus.
        */
       showExtendedDataList: function(corpusName, dataListId) {
          debug("In showExtendedDataList: " + corpusName + " *** " + dataListId);
          
     	  $("#dashboard-view").hide();
       	  $("#extended-datum-view").hide();
       	  $("#extended-datalist-view").show();
       	  $("#extended-search-view").hide();
       	  $("#user-profile-view").hide();
       },
       
       /**
        * Display the extended view of search within the corpus specified by the 
        * given corpusName.
        * 
        * @param {String} corpusName The name of the corpus to search in.
        */
       showExtendedSearch: function(corpusName) {
          debug("In showExtendedSearch: " + corpusName);
          
     	  $("#dashboard-view").hide();
       	  $("#extended-datum-view").hide();
       	  $("#extended-datalist-view").hide();
       	  $("#extended-search-view").show();
       	  $("#user-profile-view").hide();
       },
          
       /**
        * Displays the dashboard view of the given corpusName, if one was given. 
        * Or the blank dashboard view, otherwise.
        * 
        * @param {String} corpusName (Optional) The name of the corpus to display.
        */
       showDashboard: function(corpusName) {  
          debug("In showDashboard: " + corpusName);
          
       	  $("#dashboard-view").show();
       	  $("#extended-datum-view").hide();
       	  $("#extended-datalist-view").hide();
       	  $("#extended-search-view").hide();
       	  $("#user-profile-view").hide();
       },
       
       /**
        * Displays the profile of the user specified by the given userName.
        *  
        * @param {String} userName The username of the user whose profile to display.
        */
       showUserProfile: function(userName) {
       	  debug("In showUserProfile: " + userName);
       	  
       	  $("#dashboard-view").hide();
       	  $("#extended-datum-view").hide();
       	  $("#extended-datalist-view").hide();
       	  $("#extended-search-view").hide();
       	  $("#user-profile-view").show();
       }
    });
    
    return DashboardRouter;
});