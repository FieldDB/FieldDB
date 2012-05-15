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
      ":corpusName/datum/:id": "showExtendedDatum",
      ":corpusName/datalist/:id": "showExtendedDataList",
      ":corpusName": "showDashboard",
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
   },
      
   /**
    * Displays the dashboard view of the given corpusName, if one was given. 
    * Or the blank dashboard view, otherwise.
    * 
    * @param {String} corpusName (Optional)
    */
   showDashboard: function(corpusName) {  
      debug("In showDashboard: " + corpusName);
   }
});