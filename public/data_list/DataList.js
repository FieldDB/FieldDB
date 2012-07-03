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
      
     
    },relativizePouchToACorpus : function(corpus){
    //rebuild the pouch and touchdb urls to be relative to the active corpus TODO users shouldnt get saved in their corpus or should they? if they are saved, then if you replcate the corpus you can eaisly see the collaborators/contributors profiles since they are in the corpus. but they might be out of date.
      var c = corpus.get("couchConnection");
      this.pouch = Backbone.sync.pouch(Utils.androidApp() ? Utils.touchUrl+c.corpusname
          : Utils.pouchUrl+c.corpusname);
    },

    defaults : {
      title : "Untitled Data list",
      dateCreated : "May 29, 2012",
      description : "You can use datalists to create handouts or to prepare for sessions with consultants, or to share with collegues.",
      datumIds : []
    },
   
    
    pouch : Backbone.sync.pouch(Utils.androidApp() ? Utils.touchUrl
        : Utils.pouchUrl),

  });

  return DataList;
});
