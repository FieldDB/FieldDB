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
      
      //if the corpusname changes, change the pouch as well so that this object goes with its corpus's local pouchdb
//      this.bind("change:corpusname", function() {
//        this.pouch = Backbone.sync
//        .pouch(Utils.androidApp() ? Utils.touchUrl
//            + this.get("corpusname") : Utils.pouchUrl
//            + this.get("corpusname"));
//      }, this);
//      
//      try {
//        if (this.get("corpusname") == undefined) {
//          this.set("corpusname", app.get("corpus").get("corpusname"));
//        }
//        this.pouch = Backbone.sync
//        .pouch(Utils.androidApp() ? Utils.touchUrl
//            + this.get("corpusname") : Utils.pouchUrl
//            + this.get("corpusname"));
//      } catch(e) {
//        Utils.debug("Corpusname was undefined on this corpus, the datalist will not have a valid corpusname until it is set.");
//      }
    },

    defaults : {
      title : "Untitled Data list",
      dateCreated : "May 29, 2012",
      description : "You can use datalists to create handouts or to prepare for sessions with consultants, or to share with collegues.",
      datumIds : [],
    },
    
    model : {
      // There are no nested models
    },
    
    parse : function(response) {
      if (response.ok === undefined) {
        for (var key in this.model) {
          var embeddedClass = this.model[key];
          var embeddedData = response[key];
          response[key] = new embeddedClass(embeddedData, {parse:true});
        }
      }
      
      return response;
    },
    //dont define pouch on start, instead, define it once in change corpus
//    pouch : Backbone.sync.pouch(Utils.androidApp() ? Utils.touchUrl
//        : Utils.pouchUrl),

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
