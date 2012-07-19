define([ 
    "backbone", 
    "datum/Datum",
    "comment/Comment",
    "comment/Comments"
], function(
    Backbone, 
    Datum,
    Comment,
    Comments
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
      // If there are no comments, give it a new one
      if (!this.get("comments")) {
        this.set("comments", new Comments());
      }
      
      if (!this.get("dateCreated")) {
        this.set("dateCreated", (new Date()).toDateString());
      }
    },

    defaults : {
      title : "Untitled Data List",
      description : "",
      datumIds : []
    },
    
    // Internal models: used by the parse function
    model : {
      comments: Comments
    },

    changeCorpus : function(corpusname, callback) {
      if(this.pouch == undefined){
        this.pouch = Backbone.sync.pouch(Utils.androidApp() ? Utils.touchUrl + corpusname : Utils.pouchUrl + corpusname);
      }
      if(typeof callback == "function"){
        callback();
      }
    }
  });

  return DataList;
});
