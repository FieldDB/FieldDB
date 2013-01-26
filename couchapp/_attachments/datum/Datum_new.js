define([ 
    "backbone",
    "audio_video/AudioVideos", 
    "comment/Comments",
    "datum/Datums", 
    "datum/DatumField", 
    "datum/DatumFields", 
    "datum/Session",
    "image/Images",
    "libs/OPrime"
], function(
    Backbone, 
    AudioVideos, 
    Comments,
    Datums,
    DatumField, 
    DatumFields,
    Images,
    Session
) {
  var Datum = Backbone.Model.extend(
  /** @lends Datum.prototype */
  {
    /**
     * @class The Datum contains a single data point, with all its relevant
     *        context (image, audio, video) as well as metadata such as fields;
     *        one at a time.
     * 
     * @property {AudioVideos} audioVideo Datums can be associated with multiple
     *           audio or video file.
     * @property {Images} images Datums can be associated with multiple images,
     *           usually to allow the data to be provided in context. *
     * @property {Session} session The session provides details about the set of
     *           data elicited. The session will contain details such as date,
     *           language, consultant etc.
     * @property {Comments} comments The comments is a collection of comments
     *           associated with the datum, this is meant for comments like on a
     *           blog, not necessarily notes, which can be encoded in a
     *           field.(Use Case: team discussing a particular datum)
     * @property {Date} dateEntered The date the Datum was first saved.
     * @property {Date} dateModified The date the Datum was last saved.
     * 
     * 
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
      
      if(this.get("filledWithDefaults")){
        this.fillWithDefaults();
        this.unset("filledWithDefaults");
      }
    },
    fillWithDefaults : function(){
   // If there's no audioVideo, give it a new one.
      if (!this.get("audioVideo")) {
        this.set("audioVideo", new AudioVideo());
      }
      
      // If there are no comments, give it a new one
      if (!this.get("comments")) {
        this.set("comments", new Comments());
      }
      
      if(!this.get("datumFields") || this.get("datumFields").length == 0){
        this.set("datumFields", window.app.get("corpus").get("datumFields").clone());
      }
    },
    /**
     * backbone-couchdb adaptor set up
     */
    url : "/datums",
    
    
    // Internal models: used by the parse function
    internalModels : {
      datumFields : DatumFields,
      audioVideos : AudioVideos,
      session : Session,
      comments : Comments
    },
    
    /**
     * Clone the current Datum and return the clone. The clone is put in the current
     * Session, regardless of the origin Datum's Session. //TODO it doesn tlook liek this is the case below:
     * 
     * @return The clone of the current Datum.
     */
    clone : function() {
      // Create a new Datum based on the current Datum
      var datum = new Datum({
        audioVideos : new AudioVideos(this.get("audioVideos").toJSON(), {parse: true}),
        comments : new Comments(this.get("comments").toJSON(), {parse: true}),
        dateEntered : this.get("dateEntered"),
        dateModified : this.get("dateModified"),
        datumFields : new DatumFields(this.get("datumFields").toJSON(), {parse: true}),
        pouchname : this.get("pouchname"),
        session: this.get("session")
      });

      return datum;
    },
    /**
     * The LaTeXiT function automatically mark-ups an example in LaTeX code
     * (\exg. \"a) and then copies it on the export modal so that when the user
     * switches over to their LaTeX file they only need to paste it in.
     * 
     * We did a poll on Facebook among EGGers, and other linguists we know and
     * found that Linguex was very popular, and GB4E, so we did the export in
     * GB4E.
     */
    laTeXiT : function(showInExportModal) {
      utterance = this.get("datumFields").where({label: "utterance"})[0].get("mask");
      morphemes = this.get("datumFields").where({label: "morphemes"})[0].get("mask");
      gloss = this.get("datumFields").where({label: "gloss"})[0].get("mask");
      translation= this.get("datumFields").where({label: "translation"})[0].get("mask");
      var result = "\n \\begin{exe} "
            + "\n \\ex " + utterance 
            + "\n\t \\gll " + morphemes + " \\\\"
            + "\n\t" + gloss + " \\\\"
            + "\n\t\\trans `" + translation + "'"
            + "\n\\end{exe}\n\n";
      if (showInExportModal != null) {
        $("#export-type-description").html(" as LaTeX (GB4E)");
        $("#export-text-area").val($("#export-text-area").val() + result);
      }
      return result;
    },
    
    /**
     * This function simply takes the utterance gloss and translation and puts
     * them out as plain text so the user can do as they wish.
     */
    exportAsPlainText : function(showInExportModal) {
      var header = _.pluck(this.get("datumFields").toJSON(), "label");
      var fields = _.pluck(this.get("datumFields").toJSON(), "mask");
      var result = fields.join("\n");
      
      if(showInExportModal != null){
        $("#export-type-description").html(" as text (Word)");
        $("#export-text-area").val(
            $("#export-text-area").val() + result
        );
      }
      return result;
    },
    
    /**
     * This takes as an argument the order of fields and then creates a row of csv.
     */
    exportAsCSV : function(showInExportModal, orderedFields, printheader) {
      if (orderedFields == null) {
        orderedFields = ["judgement","utterance","morphemes","gloss","translation"];
      }
      judgement = this.get("datumFields").where({label: "judgement"})[0].get("mask");
      morphemes = this.get("datumFields").where({label: "morphemes"})[0].get("mask");
      utterance= this.get("datumFields").where({label: "utterance"})[0].get("mask");
      gloss = this.get("datumFields").where({label: "gloss"})[0].get("mask");
      translation= this.get("datumFields").where({label: "translation"})[0].get("mask");
      var resultarray =  [judgement,utterance,morphemes,gloss,translation];
      var result = '"' + resultarray.join('","') + '"\n';
      if (printheader) {
        var header = '"' + orderedFields.join('","') + '"';
        result = header + "\n" + result;
      }
      if (showInExportModal != null) {
        $("#export-type-description").html(" as CSV (Excel, Filemaker Pro)");
        $("#export-text-area").val(
            $("#export-text-area").val() + result);
      }
      return result;
    },
    
    /**
     * Encrypts the datum if it is confidential
     * 
     * @returns {Boolean}
     */
    encrypt : function() {
      this.set("confidential", true);
      this.get("datumFields").each(function(dIndex){
        dIndex.set("encrypted", "checked");
      });
      //TODO scrub version history to get rid of all unencrypted versions.
      this.saveAndInterConnectInApp(window.app.router.renderDashboardOrNot, window.app.router.renderDashboardOrNot);
    },
    
    /**
     * Decrypts the datum if it was encrypted
     */
    decrypt : function() {
      this.set("confidential", false);

      this.get("datumFields").each(function(dIndex){
        dIndex.set("encrypted", "");
      });
    },
    /**
     * Accepts two functions to call back when save is successful or
     * fails. If the fail callback is not overridden it will alert
     * failure to the user.
     * 
     * - Adds the datum to the top of the default data list in the corpus if it is in the right corpus
     * - Adds the datum to the datums container if it wasnt there already
     * - Adds an activity to the logged in user with diff in what the user changed. 
     * 
     * @param successcallback
     * @param failurecallback
     */
    saveAndInterConnectInApp : function(successcallback, failurecallback){
      OPrime.debug("Saving a Datum");
      var self = this;
      var newModel = true;
      if(this.id){
        newModel = false;
      }else{
        this.set("dateEntered", JSON.stringify(new Date()));
      }
      //protect against users moving datums from one corpus to another on purpose or accidentially
      if(window.app.get("corpus").get("pouchname") != this.get("pouchname")){
        if(typeof failurecallback == "function"){
          failurecallback();
        }else{
          alert('Datum save error. I cant save this datum in this corpus, it belongs to another corpus. ' );
        }
        return;
      }
      //If it was decrypted, this will save the changes before we go into encryptedMode
      
      this.get("datumFields").each(function(dIndex){
        //Anything can be done here, it is the set function which does all the work.
        dIndex.set("value", dIndex.get("mask"));
      });
      
      // Store the current Session, the current corpus, and the current date
      // in the Datum
      this.set({
        "pouchname" : window.app.get("corpus").get("pouchname"),
        "dateModified" : JSON.stringify(new Date()),
        "timestamp" : Date.now(),
        "jsonType" : "Datum"
      });
      if(!this.get("session")){
        this.set("session" , window.app.get("currentSession")); 
        Util.debug("Setting the session on this datum to the current one.");
      }else{
        OPrime.debug("Not setting the session on this datum.");
      }
      window.app.get("corpus").set("dateOfLastDatumModifiedToCheckForOldSession", JSON.stringify(new Date()) );
      
      var oldrev = this.get("_rev");
      /*
       * For some reason the corpus is getting an extra state that no one defined in it. 
       * this gets rid of it when we save. (if it gets in to a datum)
       */
      try{
        var ds = this.get("datumStates").models;
        for (var s in ds){
          if(ds[s].get("state") == undefined){
            this.get("datumStates").remove(ds[s]);
          }
        }
      }catch(e){
        OPrime.debug("Removing empty states work around failed some thing was wrong.",e);
      }
      
      this.changePouch(null,function(){
        self.save(null, {
          success : function(model, response) {
            OPrime.debug('Datum save success');
            var utterance = model.get("datumFields").where({label: "utterance"})[0].get("mask");
            var differences = "#diff/oldrev/"+oldrev+"/newrev/"+response._rev;
            //TODO add privacy for datum goals in corpus
//            if(window.app.get("corpus").get("keepDatumDetailsPrivate")){
//              utterance = "";
//              differences = "";
//            }
            if(window.appView){
              window.appView.toastUser("Sucessfully saved datum: "+ utterance,"alert-success","Saved!");
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
                  verbicon: verbicon,
                  directobject : "<a href='#corpus/"+model.get("pouchname")+"/datum/"+model.id+"'>"+utterance+"</a> ",
                  directobjecticon : "icon-list",
                  indirectobject : "in <a href='#corpus/"+window.app.get("corpus").id+"'>"+window.app.get("corpus").get('title')+"</a>",
                  teamOrPersonal : "team",
                  context : " via Offline App."
                });
            
            window.app.addActivity(
                {
                  verb : "<a href='"+differences+"'>"+verb+"</a> ",
                  verbicon: verbicon,
                  directobject : "<a href='#corpus/"+model.get("pouchname")+"/datum/"+model.id+"'>"+utterance+"</a> ",
                  directobjecticon : "icon-list",
                  indirectobject : "in <a href='#corpus/"+window.app.get("corpus").id+"'>"+window.app.get("corpus").get('title')+"</a>",
                  teamOrPersonal : "personal",
                  context : " via Offline App."
                });
//            /*
//             * If the current data list is the default
//             * list, render the datum there since is the "Active" copy
//             * that will eventually overwrite the default in the
//             * corpus if the user saves the current data list
//             */
//            var defaultIndex = window.app.get("corpus").datalists.length - 1;
//            if(window.appView.currentEditDataListView.model.id == window.app.get("corpus").datalists.models[defaultIndex].id){
//              //Put it into the current data list views
//              window.appView.currentPaginatedDataListDatumsView.collection.remove(model);//take it out of where it was, 
//              window.appView.currentPaginatedDataListDatumsView.collection.unshift(model); //and put it on the top. this is only in the default data list
//              //Put it into the ids of the current data list
//              var positionInCurrentDataList = window.app.get("currentDataList").get("datumIds").indexOf(model.id);
//              if(positionInCurrentDataList != -1){
//                window.app.get("currentDataList").get("datumIds").splice(positionInCurrentDataList, 1);
//              }
//              window.app.get("currentDataList").get("datumIds").unshift(model.id);
//              window.appView.addUnsavedDoc(window.app.get("currentDataList").id);
//            }else{
//              /*
//               * Make sure the datum is at the top of the default data list which is in the corpus,
//               * this is in case the default data list is not being displayed
//               */
//              var positionInDefaultDataList = window.app.get("corpus").datalists.models[defaultIndex].get("datumIds").indexOf(model.id);
//              if(positionInDefaultDataList != -1 ){
//                //We only reorder the default data list datum to be in the order of the most recent modified, other data lists can stay in the order teh usr designed them. 
//                window.app.get("corpus").datalists.models[defaultIndex].get("datumIds").splice(positionInDefaultDataList, 1);
//              }
//              window.app.get("corpus").datalists.models[defaultIndex].get("datumIds").unshift(model.id);
//              window.app.get("corpus").datalists.models[defaultIndex].needsSave  = true;
//              window.appView.addUnsavedDoc(window.app.get("corpus").id);
//            }
            /*
             * Also, see if this datum matches the search datalist, and add it to the top of the search list
             */
            if($("#search_box").val() != ""){
              //TODO check this
              var datumJson = model.get("datumFields").toJSON()
              var datumAsDBResponseRow = {};
              for (var x in datumJson){ 
                datumAsDBResponseRow[datumJson[x].label] = datumJson[x].mask;
              }
              var queryTokens = self.processQueryString($("#search_box").val());
              var thisDatumIsIn = self.matchesSingleCriteria(datumAsDBResponseRow, queryTokens[0]);

              for (var j = 1; j < queryTokens.length; j += 2) {
                if (queryTokens[j] == "AND") {
                  // Short circuit: if it's already false then it continues to be false
                  if (!thisDatumIsIn) {
                    break;
                  }

                  // Do an intersection
                  thisDatumIsIn = thisDatumIsIn && model.matchesSingleCriteria(datumAsDBResponseRow, queryTokens[j+1]);
                } else {
                  // Do a union
                  thisDatumIsIn = thisDatumIsIn || model.matchesSingleCriteria(datumAsDBResponseRow, queryTokens[j+1]);
                }
              }
              if (thisDatumIsIn) {
                // Insert the datum at the top of the search datums collection view
                window.appView.searchEditView.searchPaginatedDataListDatumsView.collection.remove(model);//take it out of where it was, 
                window.appView.searchEditView.searchPaginatedDataListDatumsView.collection.unshift(model);
                //Do the same to the datumids in the search data list itself
                var positioninsearchresults = window.appView.searchEditView.searchDataListView.model.get("datumIds").indexOf(model.id);
                if(positioninsearchresults != -1){
                  window.appView.searchEditView.searchDataListView.model.get("datumIds").splice(positioninsearchresults, 1);
                }
                window.appView.searchEditView.searchDataListView.model.get("datumIds").unshift(model.id);
              }
            }//end of if search is open and running for Alan
            

            //dont need to save the user every time when we change a datum.
//            window.app.get("authentication").saveAndInterConnectInApp();

            if(typeof successcallback == "function"){
              successcallback();
            }
          },
          error : function(e, f, g) {
            OPrime.debug("Datum save error", e, f, g)
            if(typeof failurecallback == "function"){
              failurecallback();
            }else{
              alert('Datum save error: ' + f.reason);
            }
          }
        });
      });
    },
    /**
     * Accepts two functions success will be called if sucessfull,
     * otherwise it will attempt to render the current datum views. If
     * the datum isn't in the current corpus it will call the fail
     * callback or it will alert a bug to the user. Override the fail
     * callback if you don't want the alert.
     * 
     * @param successcallback
     * @param failurecallback
     * @deprecated
     */
    setAsCurrentDatum : function(successcallback, failurecallback){
      console.warn("Using deprected method setAsCurrentDatum.");
//      if( window.app.get("corpus").get("pouchname") != this.get("pouchname") ){
//        if (typeof failurecallback == "function") {
//          failurecallback();
//        }else{
//          alert("This is a bug, cannot load the datum you asked for, it is not in this corpus.");
//        }
//        return;
//      }else{
//        if (window.appView.datumsEditView.datumsView.collection.models[0].id != this.id ) {
//          window.appView.datumsEditView.datumsView.prependDatum(this);
//          //TODO might not need to do it on the Read one since it is the same model?
//        }
//        if (typeof successcallback == "function") {
//          successcallback();
//        }
//      }
    }
  });

  return Datum;
});
