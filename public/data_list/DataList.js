define([ "use!backbone", "datum/Datum" ], function(
    Backbone, Datum) {
  var DataList = Backbone.Model.extend(
  /** @lends DataList.prototype */
  {
    /**
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
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
    },

    defaults : {
      title : "NELS handout",
      dateCreated : "May 29, 2012",
      description : "some useful examples"
    }
    
  });

  return DataList;
});
