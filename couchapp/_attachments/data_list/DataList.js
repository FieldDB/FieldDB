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
     * @class The Data List widget is used for import search, to prepare handouts and to share data on the web.
     * 
     * @description 
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
      if (OPrime.debugMode) OPrime.debug("DATALIST init");
      
      if (!this.get("comments")) {
        this.set("comments", new Comments());
      }
      if(this.get("filledWithDefaults")){
        this.fillWithDefaults();
        this.unset("filledWithDefaults");
      }
    },
    fillWithDefaults : function(){
      // If there are no comments, give it a new one
      if (!this.get("comments")) {
        this.set("comments", new Comments());
      }
      
      if (!this.get("dateCreated")) {
        this.set("dateCreated", (new Date()).toDateString());
      }
    },
    /**
     * backbone-couchdb adaptor set up
     */
    
    // The couchdb-connector is capable of mapping the url scheme
    // proposed by the authors of Backbone to documents in your database,
    // so that you don't have to change existing apps when you switch the sync-strategy
    url : "/datalists",
    
    defaults : {
      title : "Untitled Data List",
      description : "",
      datumIds : []
    },
    
    // Internal models: used by the parse function
    internalModels : {
      comments: Comments
    },

  //This the function called by the add button, it adds a new comment state both to the collection and the model
    insertNewComment : function(commentstring) {
      var m = new Comment({
        "text" : commentstring,
     });
      
      this.get("comments").add(m);
      window.appView.addUnsavedDoc(this.id);
      
      window.app.addActivity(
          {
            verb : "commented",
            verbicon: "icon-comment",
            directobjecticon : "",
            directobject : "'"+commentstring+"'",
            indirectobject : "on <a href='#data/"+this.id+"'><i class='icon-pushpin'></i> "+this.get('title')+"</a>",
            teamOrPersonal : "team",
            context : " via Offline App."
          });
      
      window.app.addActivity(
         {
            verb : "commented",
            verbicon: "icon-comment",
            directobjecticon : "",
            directobject : "'"+commentstring+"'",
            indirectobject : "on <a href='#data/"+this.id+"'><i class='icon-pushpin'></i> "+this.get('title')+"</a>",
            teamOrPersonal : "personal",
            context : " via Offline App."
          });
    },
    getAllAudioAndVideoFiles : function(datumIdsToGetAudioVideo, callback){
      if(!datumIdsToGetAudioVideo){
        datumIdsToGetAudioVideo = this.get("datumIds");
      }
      if(datumIdsToGetAudioVideo.length == 0){
        datumIdsToGetAudioVideo = this.get("datumIds");
      }
      var audioVideoFiles = [];
      
      if (OPrime.debugMode) OPrime.debug("DATA LIST datumIdsToGetAudioVideo " +JSON.stringify(datumIdsToGetAudioVideo));
      for(var id in datumIdsToGetAudioVideo){
        var obj = new Datum({pouchname: app.get("corpus").get("pouchname")});
        obj.id  = datumIdsToGetAudioVideo[id];
        var thisobjid = id;
          obj.fetch({
            success : function(model, response) {
              audioVideoFiles.push(model.get("audioVideo").get("URL"));
              
              if(thisobjid == datumIdsToGetAudioVideo.length - 1){
                if(typeof callback == "function"){
                  callback(audioVideoFiles);
                }
              }
            }
          });
        
      }
    },

    applyFunctionToAllIds : function(datumIdsToApplyFunction, functionToAppy, functionArguments){
      if(!datumIdsToApplyFunction){
        datumIdsToApplyFunction = this.get("datumIds");
      }
      if(datumIdsToApplyFunction.length == 0){
        datumIdsToApplyFunction = this.get("datumIds");
      }
      if(!functionToAppy){
        functionToAppy = "laTeXiT";
      }
      if(!functionArguments){
//        functionArguments = true; //leave it null so that the defualts will apply in the Datum call
      }
      if (OPrime.debugMode) OPrime.debug("DATA LIST datumIdsToApplyFunction " +JSON.stringify(datumIdsToApplyFunction));
      for(var id in datumIdsToApplyFunction){
        /* look for the datum in the datum loaded in the view, and use that one rather than re-opening the datum */
//        var indexInCurrentPaginatedDataListDatums = _.pluck(window.appView.currentPaginatedDataListDatumsView.collection.models, "id").indexOf(datumIdsToApplyFunction[id]);
//        window.appView.currentPaginatedDataListDatumsView._childViews[indexInCurrentPaginatedDataListDatums].model[functionToAppy](functionArguments);

        
        /* this code re-opens the datum, but if its already in the child views, ths is  unnecesary */
        var obj = new Datum({pouchname: app.get("corpus").get("pouchname")});
        obj.id  = datumIdsToApplyFunction[id];
          obj.fetch({
            success : function(model, response) {
              model[functionToAppy](functionArguments);
            } 
        });
        
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
      if (OPrime.debugMode) OPrime.debug("Saving the DataList");
      var self = this;
//      var idsInCollection = [];
//      for(d in this.datumCollection.models){
//        idsInCollection.push( this.datumCollection.models[d] );
//      }
//      this.set("datumIds", idsInCollection);
      var newModel = true;
      if(this.id){
        newModel = false;
      }else{
        this.set("dateCreated",JSON.stringify(new Date()));
      }
      
      //protect against users moving dataLists from one corpus to another on purpose or accidentially
      if(window.app.get("corpus").get("pouchname") != this.get("pouchname")){
        if(typeof failurecallback == "function"){
          failurecallback();
        }else{
          alert('DataList save error. I cant save this dataList in this corpus, it belongs to another corpus. ' );
        }
        return;
      }
      var oldrev = this.get("_rev");
      this.set("dateModified", JSON.stringify(new Date()));
      this.set("timestamp", Date.now());

        self.save(null, {
          success : function(model, response) {
            if (OPrime.debugMode) OPrime.debug('DataList save success');
            var title = model.get("title");
            var differences = "#diff/oldrev/"+oldrev+"/newrev/"+response._rev;
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
            verbicon = "icon-pencil";
            if(newModel){
              verb = "added";
              verbicon = "icon-plus";
            }
            
            window.app.addActivity(
                {
                  verb : "<a href='"+differences+"'>"+verb+"</a> ",
                  verbicon : verbicon,
                  directobjecticon : "icon-pushpin",
                  directobject : "<a href='#data/"+model.id+"'>"+title+"</a> ",
                  indirectobject : "in <a href='#corpus/"+window.app.get("corpus").id+"'>"+window.app.get("corpus").get('title')+"</a>",
                  teamOrPersonal : "team",
                  context : " via Offline App."
                });
            
            window.app.addActivity(
                {
                  verb : "<a href='"+differences+"'>"+verb+"</a> ",
                  verbicon : verbicon,
                  directobjecticon : "icon-pushpin",
                  directobject : "<a href='#data/"+model.id+"'>"+title+"</a> ",
                  indirectobject : "in <a href='#corpus/"+window.app.get("corpus").id+"'>"+window.app.get("corpus").get('title')+"</a>",
                  teamOrPersonal : "personal",
                  context : " via Offline App."
                });
            
            window.app.get("authentication").get("userPrivate").get("mostRecentIds").datalistid = model.id;

            /*
             * Make sure the data list is visible in this corpus
             */
            var previousversionincorpus = window.app.get("corpus").datalists.get(model.id);
            if(previousversionincorpus == undefined ){
              window.app.get("corpus").datalists.unshift(model);
            }else{
              window.app.get("corpus").datalists.remove(previousversionincorpus);
              window.app.get("corpus").datalists.unshift(model);
            }
            
            //make sure the dataList is in the history of the user
            if(window.app.get("authentication").get("userPrivate").get("dataLists").indexOf(model.id) == -1){
              window.app.get("authentication").get("userPrivate").get("dataLists").unshift(model.id);
//              window.app.get("authentication").saveAndInterConnectInApp();
            }

            if(typeof successcallback == "function"){
              successcallback();
            }
          },
          error : function(e, f, g) {
            if (OPrime.debugMode) OPrime.debug("DataList save error", e, f, g);
            if(typeof failurecallback == "function"){
              failurecallback();
            }else{
              alert('DataList save error: ' + f.reason);
            }
          }
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
      if( window.app.get("corpus").get("pouchname") != this.get("pouchname") ){
        if (typeof failurecallback == "function") {
          failurecallback();
        }else{
          alert("This is a bug, cannot load the dataList you asked for, it is not in this corpus.");
        }
        return;
      }else{
        if (window.app.get("currentDataList").id != this.id ) {
          //remove reference between current dataList and the model  TODO check this..
//          delete window.app.attributes.currentDataList; //this seems to delte the datalist from the corpus too. :(
//          window.app.attributes.currentDataList = this; //trying to get backbone not to notice we are switching the current data list.
          window.app.set("currentDataList", this); //This results in a non-identical copy in the currentDatalist, it doesn't change when the one in the corpus changes. 
//          window.app.set("currentDataList", app.get("corpus").datalists.get(this.id)); //this pulls the datalist from the corpus which might not be the most recent version. instead we will trust the pouch one above.
        }
        window.app.get("authentication").get("userPrivate").get("mostRecentIds").datalistid = this.id;
        window.app.get("authentication").saveAndInterConnectInApp();
        if(window.appView) {
          window.appView.setUpAndAssociateViewsAndModelsWithCurrentDataList(function() {
            if (typeof successcallback == "function") {
              successcallback();
            }
          });
        }else{
          if (typeof successcallback == "function") {
            successcallback();
          }
        }
      }
    }
  });

  return DataList;
});
