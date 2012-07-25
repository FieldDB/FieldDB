define([ 
    "backbone", 
    "activity/Activity",
    "datum/Datum",
    "comment/Comment",
    "comment/Comments"
], function(
    Backbone, 
    Activity,
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
      if(!corpusname){
        corpusname = this.get("corpusname");
        if(corpusname == undefined){
          corpusname = window.app.get("corpus").get("corpusname");
        }
      }
      if(this.pouch == undefined){
        this.pouch = Backbone.sync.pouch(Utils.androidApp() ? Utils.touchUrl + corpusname : Utils.pouchUrl + corpusname);
      }
      if(typeof callback == "function"){
        callback();
      }
    },
    /**
     * Accepts two functions to call back when save is successful or
     * fails. If the fail callback is not overridden it will alert
     * failure to the user.
     * 
     * - Adds the dataList to the corpus if it is in the right corpus, and wasnt already there
     * - Adds the dataList to the user if it wasn't already there
     * - Adds an activity to the logged in user with diff in what the user changed. 
     * 
     * @param successcallback
     * @param failurecallback
     */
    saveAndInterConnectInApp : function(successcallback, failurecallback){
      Utils.debug("Saving the DataList");
      var self = this;
      var newModel = true;
      if(this.id){
        newModel = false;
      }
      //protect against users moving dataLists from one corpus to another on purpose or accidentially
      if(window.app.get("corpus").get("corpusname") != this.get("corpusname")){
        if(typeof failurecallback == "function"){
          failurecallback();
        }else{
          alert('DataList save error. I cant save this dataList in this corpus, it belongs to another corpus. ' );
        }
        return;
      }
      var oldrev = this.get("_rev");
      this.changeCorpus(null, function(){
        self.save(null, {
          success : function(model, response) {
            Utils.debug('DataList save success');
            var title = model.get("title");
            var differences = "<a class='activity-diff' href='#diff/oldrev/"+oldrev+"/newrev/"+response._rev+"'>"+title+"</a>";
            //TODO add privacy for dataList in corpus
//            if(window.app.get("corpus").get("keepDataListDetailsPrivate")){
//              title = "";
//              differences = "";
//            }
            if(window.appView){
              window.appView.toastUser("Sucessfully saved data list: "+ title,"alert-success","Saved!");
              window.appView.addSavedDoc(model.id);
            }
            var verb = "updated";
            if(newModel){
              verb = "added";
            }
            window.app.get("authentication").get("userPrivate").get("activities").unshift(
                new Activity({
                  verb : verb,
                  directobject : "<a href='#data/"+model.id+"'>dataList</a> ",
                  indirectobject : "in "+window.app.get("corpus").get("title"),
                  context : differences+" via Offline App.",
                  user: window.app.get("authentication").get("userPublic")
                }));
            
            //make sure the dataList is in this corpus, if it is the same corpusname
            if(window.app.get("corpus").get("dataLists").get(model.id) == undefined && window.app.get("corpus").get("corpusname") == model.get("corpusname")){
              window.app.get("corpus").get("dataLists").unshift(model);
              window.appView.addUnsavedDoc(window.app.get("corpus").id);
            }
            //make sure the dataList is in the history of the user
            if(window.app.get("authentication").get("userPrivate").get("dataLists").indexOf(model.id) == -1){
              window.app.get("authentication").get("userPrivate").get("dataLists").unshift(model.id);
              window.app.get("authentication").saveAndInterConnectInApp();
            }

            if(typeof successcallback == "function"){
              successcallback();
            }
          },
          error : function(e) {
            if(typeof failurecallback == "function"){
              failurecallback();
            }else{
              alert('DataList save error' + e);
            }
          }
        });
      });
    },
    /**
     * Accepts two functions success will be called if successful,
     * otherwise it will attempt to render the current dataList views. If
     * the dataList isn't in the current corpus it will call the fail
     * callback or it will alert a bug to the user. Override the fail
     * callback if you don't want the alert.
     * 
     * @param successcallback
     * @param failurecallback
     */
    setAsCurrentDataList : function(successcallback, failurecallback){
      if( window.app.get("corpus").get("corpusname") != this.get("corpusname") ){
        if (typeof failurecallback == "function") {
          failurecallback();
        }else{
          alert("This is a bug, cannot load the dataList you asked for, it is not in this corpus.");
        }
        return;
      }else{
        if (window.app.get("currentDataList").id != this.id ) {
          window.app.set("currentDataList", this);
        }
        window.app.get("authentication").get("userPrivate").get("mostRecentIds").datalistid = this.id;
        window.app.get("authentication").saveAndInterConnectInApp();
        
        try{
          window.appView.setUpAndAssociateViewsAndModelsWithCurrentDataList(function() {
            if (typeof successcallback == "function") {
              successcallback();
            }else{
              //TODO remove this when done debugging and it is working all the time.
              var self = this;
              window.appView.toastUser("Sucessfully connected all views up to data list: "+ self.id,"alert-success","Connected!");
//            window.appView.renderEditableDataListViews();
//            window.appView.renderReadonlyDataListViews();
            }
          });
        }catch(e){
          if (typeof failurecallback == "function") {
            failurecallback();
          }else{
            alert("This is probably a bug. There was a problem rendering the current dataList's views after resetting the current session.");
          }
        }
      }
    }
  });

  return DataList;
});
