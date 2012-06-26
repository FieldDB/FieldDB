define([ 
    "use!backbone", 
    "datum/Datum" 
], function(
    Backbone, 
    Datum
) {
  var DataList = Backbone.Model.extend(
  /** @lends DataList.prototype */
  {
    /**
     * TODO Update description
     * @class The Data List widget is the list that appears after a search has
     *        been called. 
     *        
     *        This Class does not exist in the Inifinite paginator by Addy Osmani
     * 
     * @description The initialize function brings up the dataList view. The
     *              dataList is not invoked until something is searched and then
     *              the dataList will provide filtered results of the user's
     *              corpus.
     * 
     * @property {String} title The title of the Data List.
     * @property {String} dateCreated The date that this Data List was created.
     * @property {String} description The description of the Data List.
     * @property {Array<String>} datumIds An ordered list of the datum IDs of the
     *   Datums in the Data List.
     * 
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
    },

    defaults : {
      title : "Untitled Data list",
      dateCreated : "May 29, 2012",
      description : "You can use datalists to create handouts or to prepare for sessions with consultants, or to share with collegues.",
      datumIds : []
    }

  });

  return DataList;
});
