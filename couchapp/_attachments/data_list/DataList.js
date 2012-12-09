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
      Utils.debug("DATALIST init");
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

  //This the function called by the add button, it adds a new comment state both to the collection and the model
    insertNewComment : function(commentstring) {
      var m = new Comment({
        "text" : commentstring,
     });
      
      this.get("comments").add(m);
      window.appView.addUnsavedDoc(this.id);
      
      window.app.get("currentCorpusTeamActivityFeed").addActivity(
          new Activity({
            verb : "commented",
            verbicon: "icon-comment",
            directobjecticon : "",
            directobject : "'"+commentstring+"'",
            indirectobject : "on <a href='#data/"+this.id+"'><i class='icon-pushpin'></i> "+this.get('title')+"</a>",
            teamOrPersonal : "team",
            context : " via Offline App."
          }));
      
      window.app.get("currentUserActivityFeed").addActivity(
          new Activity({
            verb : "commented",
            verbicon: "icon-comment",
            directobjecticon : "",
            directobject : "'"+commentstring+"'",
            indirectobject : "on <a href='#data/"+this.id+"'><i class='icon-pushpin'></i> "+this.get('title')+"</a>",
            teamOrPersonal : "personal",
            context : " via Offline App."
          }));
    },
    changePouch : function(pouchname, callback) {
      if(!pouchname){
        pouchname = this.get("pouchname");
        if(pouchname == undefined){
          pouchname = window.app.get("corpus").get("pouchname");
        }
      }
      if(this.pouch == undefined){
        this.pouch = Backbone.sync.pouch(Utils.androidApp() ? Utils.touchUrl + pouchname : Utils.pouchUrl + pouchname);
      }
      if(typeof callback == "function"){
        callback();
      }
    },
    getAllAudioAndVideoFiles : function(datumIdsToGetAudioVideo, callback){
      if(!datumIdsToGetAudioVideo){
        datumIdsToGetAudioVideo = this.get("datumIds");
      }
      if(datumIdsToGetAudioVideo.length == 0){
        datumIdsToGetAudioVideo = this.get("datumIds");
      }
      var audioVideoFiles = [];
      
      Utils.debug("DATA LIST datumIdsToGetAudioVideo " +JSON.stringify(datumIdsToGetAudioVideo));
      for(var id in datumIdsToGetAudioVideo){
        var obj = new Datum({pouchname: app.get("corpus").get("pouchname")});
        obj.id  = datumIdsToGetAudioVideo[id];
        var thisobjid = id;
        obj.changePouch(window.app.get("corpus").get("pouchname"), function(){
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
      Utils.debug("DATA LIST datumIdsToApplyFunction " +JSON.stringify(datumIdsToApplyFunction));
      for(var id in datumIdsToApplyFunction){
        var obj = new Datum({pouchname: app.get("corpus").get("pouchname")});
        obj.id  = datumIdsToApplyFunction[id];
        obj.changePouch(window.app.get("corpus").get("pouchname"), function(){
          obj.fetch({
            success : function(model, response) {
              model[functionToAppy](functionArguments);
            }
          });
        });
        
      }
    },
//    /**
//     * Create a permanent data list in the current corpus.  Deprecated! this is not being used, instead the callers are making their own data lists. TODO, decide if this should be used.
//     * 
//     * @param callback
//     */
//    newDataList : function(callback) {
//      //save the current data list
//      var self = this;
//      this.saveAndInterConnectInApp(function(){
//        //clone it
//        var attributes = JSON.parse(JSON.stringify(self.attributes));
//        // Clear the current data list's backbone info and info which we shouldnt clone
//        attributes._id = undefined;
//        attributes._rev = undefined;
//        attributes.comments = undefined;
//        attributes.title = self.get("title")+ " copy";
//        attributes.description = "Copy of: "+self.get("description");
//        attributes.pouchname = app.get("corpus").get("pouchname");
//        attributes.dateCreated = JSON.stringify(new Date());
//        attributes.datumIds = [];
//        self = new DataList(attributes);
//        
//        //TODO see if this destroys the collection in the default data list, technically it doesn't matter because this will need to be emptied and filled,a and the collciton is just part of the view, not part of the data list.
//        var coll = self.datumsView.collection;
//        while (coll.length > 0) {
//          coll.pop();
//        }
//        
//        // Display the new data list
////        appView.renderReadonlyDataListViews();
////        appView.renderEditableDataListViews();
//        //Why call all data lists to render?
//        self.render();
//        self.saveAndInterConnectInApp(function(){
//          //TOOD check this, this is used by the import to make the final datalist
//          self.setAsCurrentDataList(function(){
//            if(typeof callback == "function"){
//              callback();
//            }
//          });
//        });
//      });
//    },
    
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

      this.changePouch(null, function(){
        self.save(null, {
          success : function(model, response) {
            Utils.debug('DataList save success');
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
            
            window.app.get("currentCorpusTeamActivityFeed").addActivity(
                new Activity({
                  verb : "<a href='"+differences+"'>"+verb+"</a> ",
                  verbicon : verbicon,
                  directobjecticon : "icon-pushpin",
                  directobject : "<a href='#data/"+model.id+"'>"+title+"</a> ",
                  indirectobject : "in <a href='#corpus/"+window.app.get("corpus").id+"'>"+window.app.get("corpus").get('title')+"</a>",
                  teamOrPersonal : "team",
                  context : " via Offline App."
                }));
            
            window.app.get("currentUserActivityFeed").addActivity(
                new Activity({
                  verb : "<a href='"+differences+"'>"+verb+"</a> ",
                  verbicon : verbicon,
                  directobjecticon : "icon-pushpin",
                  directobject : "<a href='#data/"+model.id+"'>"+title+"</a> ",
                  indirectobject : "in <a href='#corpus/"+window.app.get("corpus").id+"'>"+window.app.get("corpus").get('title')+"</a>",
                  teamOrPersonal : "personal",
                  context : " via Offline App."
                }));
            
            window.app.get("authentication").get("userPrivate").get("mostRecentIds").datalistid = model.id;

//            /*
//             * If the corpus has no data lists in it, just save this one.
//             */
//            if(window.app.get("corpus").get("dataLists").length == 0){
//              window.app.get("corpus").get("dataLists").unshift(model);//TODO need to test
////            }else if(window.app.get("corpus").get("dataLists").length > 1){
////              var previousversionincorpus = window.app.get("corpus").get("dataLists").models[0];
////              //Remove the corresponding datalist that is in the corpus, it will be overwritten with this save.
////              if(previousversionincorpus !== model){//if they are the same there is no reason to overwrite them.
////                window.app.get("corpus").get("dataLists").models[0] = model; //TODO tested
//            }else{
//              if(window.app.get("corpus").id) window.appView.addUnsavedDoc(window.app.get("corpus").id);//creating an attemptt o save no id at new user registaiotn.
//              /*
//               * If there is more than one datalist in the corpus, we need to find this one and replace it.
//               */
              var previousversionincorpus = window.app.get("corpus").get("dataLists").get(model.id);
              if(previousversionincorpus == undefined ){
                window.app.get("corpus").get("dataLists").unshift(model);
              }else{
//                var defaultposition = window.app.get("corpus").get("dataLists").length  - 1;
//                if(window.app.get("corpus").get("dataLists").models[defaultposition].id == model.id){
//                  //this is the default, put it last
//                  window.app.get("corpus").get("dataLists").remove(previousversionincorpus);
//                  window.app.get("corpus").get("dataLists").add(model);
//                }else{
//                  //this is a normal data list, put it first
                  window.app.get("corpus").get("dataLists").remove(previousversionincorpus);
                  window.app.get("corpus").get("dataLists").unshift(model);
//                }
              }
//            }
            
            //make sure the dataList is in the history of the user
            if(window.app.get("authentication").get("userPrivate").get("dataLists").indexOf(model.id) == -1){
              window.app.get("authentication").get("userPrivate").get("dataLists").unshift(model.id);
//              window.app.get("authentication").saveAndInterConnectInApp();
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
//          window.app.set("currentDataList", app.get("corpus").get("dataLists").get(this.id)); //this pulls the datalist from the corpus which might not be the most recent version. instead we will trust the pouch one above.
        }
        window.app.get("authentication").get("userPrivate").get("mostRecentIds").datalistid = this.id;
        window.app.get("authentication").saveAndInterConnectInApp();
        var self = this;
        try{
          window.appView.setUpAndAssociateViewsAndModelsWithCurrentDataList(function() {
            if (typeof successcallback == "function") {
              successcallback();
            }else{
              //TODO remove this when done debugging and it is working all the time.
//              window.appView.toastUser("Sucessfully connected all views up to data list: "+ self.id,"alert-success","Connected!");
//              window.appView.renderEditableDataListViews("leftSide"); //TODO does this need to be run?
//              window.appView.renderReadonlyDataListViews("leftSide");
            }
          });
        }catch(e){
          Utils.debug(e);
//          /*TODO  putting this her so that import works of rhte presenation, but there is some bug */
//          if (typeof successcallback == "function") {
//            successcallback();
//          }else{
//            //TODO remove this when done debugging and it is working all the time.
//            window.appView.toastUser("Sucessfully connected all views up to data list: "+ self.id,"alert-success","Connected!");
//            window.appView.renderEditableDataListViews("leftSide");
//            window.appView.renderReadonlyDataListViews("leftSide");
//          }
          
          if (typeof failurecallback == "function") {
            alert("Calling the failure callback in the set as current data list."+self.id);
            failurecallback();
          }else{
            alert("This is probably a bug. There was a problem rendering the current dataList's views after resetting the current session."+self.id);
          }
        }
      }
    }
  });

  return DataList;
});
