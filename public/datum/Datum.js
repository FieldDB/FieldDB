define([ 
    "backbone",
    "activity/Activity",
    "audio_video/AudioVideo", 
    "comment/Comment",
    "comment/Comments",
    "datum/DatumField", 
    "datum/DatumFields", 
    "datum/DatumState", 
    "datum/DatumStates",
    "datum/DatumTag",
    "datum/DatumTags",
    "datum/Session",
    "libs/Utils"
], function(
    Backbone, 
    Activity,
    AudioVideo, 
    Comment,
    Comments,
    DatumField, 
    DatumFields,
    DatumState, 
    DatumStates,
    DatumTag,
    DatumTags,
    Session
) {
  var Datum = Backbone.Model.extend(
  /** @lends Datum.prototype */
  {
    /**
     * @class The Datum widget is the place where all linguistic data is
     *        entered; one at a time.
     * 
     * @property {DatumField} utterance The utterance field generally
     *           corresponds to the first line in linguistic examples that can
     *           either be written in the language's orthography or a
     *           romanization of the language. An additional field can be added
     *           if the language has a non-roman script.
     * @property {DatumField} gloss The gloss field corresponds to the gloss
     *           line in linguistic examples where the morphological details of
     *           the words are displayed.
     * @property {DatumField} translation The translation field corresponds to
     *           the third line in linguistic examples where in general an
     *           English translation. An additional field can be added if
     *           translations into other languages is needed.
     * @property {DatumField} judgement The judgement is the grammaticality
     *           judgement associated with the datum, so grammatical,
     *           ungrammatical, felicitous, unfelicitous etc.
     * @property {AudioVisual} audioVideo Datums can be associated with an audio or video
     *           file.
     * @property {Session} session The session provides details about the set of
     *           data elicited. The session will contain details such as date,
     *           language, consultant etc.
     * @property {Comments} comments The comments is a collection of comments
     *           associated with the datum, this is meant for comments like on a
     *           blog, not necessarily notes, which can be encoded in a
     *           field.(Use Case: team discussing a particular datum)
     * @property {DatumTags} datumtags The datum tags are a collection of tags
     *           associated with the datum. These are made completely by the
     *           user.They are like blog tags, a way for the user to make
     *           categories without make a hierarchical structure, and make
     *           datum easier for search.
     * @property {Date} dateEntered The date the Datum was first saved.
     * @property {Date} dateModified The date the Datum was last saved.
     * 
     * @description The initialize function brings up the datum widget in small
     *              view with one set of datum fields. However, the datum widget
     *              can contain more than datum field set and can also be viewed
     *              in full screen mode.
     * 
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
      // Initially, the first datumState is selected
      if (this.get("datumStates") && (this.get("datumStates").models.length > 0)) {
        this.get("datumStates").models[0].set("selected", "selected");
      }
      
      // If there's no audioVideo, give it a new one.
      if (!this.get("audioVideo")) {
        this.set("audioVideo", new AudioVideo());
      }
      
      // If there are no comments, give it a new one
      if (!this.get("comments")) {
        this.set("comments", new Comments());
      }
      
      // If there are no datumTags, give it a new one
      if (!this.get("datumTags")) {
        this.set("datumTags", new DatumTags());
      }
    },
    
    // Internal models: used by the parse function
    model : {
      datumFields : DatumFields,
      audioVideo : AudioVideo,
      session : Session,
      comments : Comments,
      datumStates : DatumStates,
      datumTags : DatumTags
    },

    changeCorpus : function(corpusname, callback) {
      if(!corpusname){
        corpusname = this.get("corpusname");
        if(corpusname == undefined){
          corpusname = window.app.get("corpus").get("corpusname");
        }
      }
      if (this.pouch == undefined) {
        this.pouch = Backbone.sync.pouch(Utils.androidApp() ? Utils.touchUrl + corpusname : Utils.pouchUrl + corpusname);
      }
      if (typeof callback == "function") {
        callback();
      }
    },
    
    /**
     * Gets all the DatumIds in the current Corpus sorted by their date.
     * 
     * @param {Function} callback A function that expects a single parameter. That
     * parameter is the result of calling "get_datum_ids/by_date". So it is an array
     * of objects. Each object has a 'key' and a 'value' attribute. The 'key'
     * attribute contains the Datum's dateModified and the 'value' attribute contains
     * the Datum itself.
     */
    getAllDatumIdsByDate : function(callback) {
      var self = this;
      
      try{
        this.changeCorpus(this.get("corpusname"),function(){
          self.pouch(function(err, db) {
            db.query("get_datum_ids/by_date", {reduce: false}, function(err, response) {
              if ((!err) && (typeof callback == "function"))  {
                console.log("Callback with: ", response.rows);
                callback(response.rows);
              }
            });
          });
        });
        
      }catch(e){
//        appView.datumsEditView.newDatum();
        appView.datumsEditView.render();
        alert("Couldnt show the most recent datums "+JSON.stringify(e));
        
      }
    },
    
    searchByQueryString : function(queryString, callback) {
      var self = this;
      
      try{
        this.changeCorpus(this.get("corpusname"), function() {
          self.pouch(function(err, db) {
            db.query("get_datum_field/get_datum_fields", {reduce: false}, function(err, response) {
              var matchIds = [];
              
              if (!err) {
                // Process the given query string into tokens
                var queryTokens = self.processQueryString(queryString);
                
                // Go through all the rows of results
                for (i in response.rows) {
                  // Determine if this datum matches the first search criteria
                  var thisDatumIsIn = self.matchesSingleCriteria(response.rows[i].key, queryTokens[0]);
                  
                  // Progressively determine whether the datum still matches based on
                  // subsequent search criteria
                  for (var j = 1; j < queryTokens.length; j += 2) {
                    if (queryTokens[j] == "AND") {
                      // Short circuit: if it's already false then it continues to be false
                      if (!thisDatumIsIn) {
                        break;
                      }
                      
                      // Do an intersection
                      thisDatumIsIn = thisDatumIsIn && self.matchesSingleCriteria(response.rows[i].key, queryTokens[j+1]);
                    } else {
                      // Do a union
                      thisDatumIsIn = thisDatumIsIn || self.matchesSingleCriteria(response.rows[i].key, queryTokens[j+1]);
                    }
                  }
                  
                  // If the row's datum matches the given query string
                  if (thisDatumIsIn) {
                    // Keep its datum's ID, which is the value
                    matchIds.push(response.rows[i].value);
                  }
                }
              }
              if(typeof callback == "function"){
                //callback with the unique members of the array
                callback(_.unique(matchIds));
//                callback(matchIds); //loosing my this in SearchEditView
              }
            });
          });
        });
      }catch(e){
        alert("Couldnt search the data, if you sync with the server you might get the most recent search index.");
      }
    },
    
    /**
     * Determines whether the given object to search through matches the given
     * search criteria.
     * 
     * @param {Object} objectToSearchThrough An object representing a datum that
     * contains (key, value) pairs where the key is the datum field label and the
     * value is the datum field value of that attribute.
     * @param {String} criteria The single search criteria in the form of a string
     * made up of a label followed by a colon followed by the value that we wish
     * to match.
     * 
     * @return {Boolean} True if the given object matches the given criteria.
     * False otherwise.
     */
    matchesSingleCriteria : function(objectToSearchThrough, criteria) {
      var delimiterIndex = criteria.indexOf(":");
      var label = criteria.substring(0, delimiterIndex);
      var value = criteria.substring(delimiterIndex + 1);
      
      return objectToSearchThrough[label] && (objectToSearchThrough[label].toLowerCase().indexOf(value) >= 0);
    },
    
    /**
     * Process the given string into an array of tokens where each token is
     * either a search criteria or an operator (AND or OR). Also makes each
     * search criteria token lowercase, so that searches will be case-
     * insensitive.
     * 
     * @param {String} queryString The string to tokenize.
     * 
     * @return {String} The tokenized string
     */
    processQueryString : function(queryString) {      
      // Split on spaces
      var queryArray = queryString.split(" ");
      
      // Create an array of tokens out of the query string where each token is
      // either a search criteria or an operator (AND or OR).
      var queryTokens = [];
      var currentString = "";
      for (i in queryArray) {
        var currentItem = queryArray[i].trim();
        if (currentItem.length <= 0) {
          break;
        } else if ((currentItem == "AND") || (currentItem == "OR")) {
          queryTokens.push(currentString);
          queryTokens.push(currentItem);
          currentString = "";
        } else if (currentString) {
          currentString = currentString + " " + currentItem.toLowerCase();
        } else {
          currentString = currentItem.toLowerCase();
        }
      }
      queryTokens.push(currentString);
      
      return queryTokens;
    },
    
    /**
     * Clone the current Datum and return the clone. The clone is put in the current
     * Session, regardless of the origin Datum's Session.
     * 
     * @return The clone of the current Datum.
     */
    clone : function() {
      // Create a new Datum based on the current Datum
      var datum = new Datum({
        audioVideo : new AudioVideo(this.get("audioVideo").toJSON(), {parse: true}),
        comments : new Comments(this.get("comments").toJSON(), {parse: true}),
        dateEntered : this.get("dateEntered"),
        dateModified : this.get("dateModified"),
        datumFields : new DatumFields(this.get("datumFields").toJSON(), {parse: true}),
        datumStates : new DatumStates(this.get("datumStates").toJSON(), {parse: true}),
        datumTags : new DatumTags(this.get("datumTags").toJSON(), {parse: true}),
        corpusname : this.get("corpusname"),
        session: this.get("session")
      });

      return datum;
    },
    
    /**
     * The LaTeXiT function automatically mark-ups an example in LaTeX code
     * (\exg. \"a) and then copies it on the expor modal so that when the user
     * switches over to their LaTeX file they only need to paste it in.
     * 
     * We did a poll on Facebook among EGGers, and other linguists we know and
     * found that Linguex was very popular, and GB4E, so we did the export in
     * GB4E.
     */
    laTeXiT : function(showInExportModal) {
      utterance= this.get("datumFields").where({label: "utterance"})[0].get("mask");
      gloss = this.get("datumFields").where({label: "gloss"})[0].get("mask");
      translation= this.get("datumFields").where({label: "translation"})[0].get("mask");
      var result = "\n \\begin{exe} "
            + "\n \\ex [*] \\gll " + utterance + " \\\\"
            + "\n\t" + gloss + " \\\\"
            + "\n\t\\glt `" + translation + "'"
            + "\n\\end{exe}\n\n";
      if (showInExportModal != null) {
        $("#export-type-description").html(" as LaTeX (GB4E)");
        $("#export-text-area").val($("#export-text-area").val() + result);
        $("#export-modal").modal("show");
      }
      
      return result;
    },
    
    /**
     * This function simply takes the utterance gloss and translation and puts
     * them out as plain text so the user can do as they wish.
     */
    exportAsPlainText : function(showInExportModal) {
      utterance= this.get("datumFields").where({label: "utterance"})[0].get("mask");
      gloss = this.get("datumFields").where({label: "gloss"})[0].get("mask");
      translation= this.get("datumFields").where({label: "translation"})[0].get("mask");
      var result =  utterance+"\n"
            +gloss+"\n"
            +translation
            +"\n\n";
      if(showInExportModal != null){
        $("#export-type-description").html(" as text (Word)");
        $("#export-text-area").val( $("#export-text-area").val()+
           result
                 );
        $("#export-modal").modal("show");
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
      var result = '"' + resultarray.join('","') + '"';
      if (printheader != null) {
        var header = '"' + orderedFields.join('","') + '"';
        result = header + "\n" + result;
      }
      if (showInExportModal != null) {
        $("#export-type-description").html(" as CSV (Excel, Filemaker Pro)");
        $("#export-text-area").val($("#export-text-area").val() + result);
        $("#export-modal").modal("show");
      }
      return result;
    },
    
    /**
     * This function takes in a boolean whether the data should be appended in the import, the fields the data is in, and the header from the data which corresponds to datum fields.
     * TODO this function is not being used.
     * 
     * @param showInImportModal
     * @param orderedFields the values which correspond to datumfields
     * @param header the header fields which correspond to datumfields
     */
    importCSV : function(orderedFields, header) {
      for (f in header) {
        if (this.get("datumFields").where({label: header[f]})[0] != undefined) {
          this.get("datumFields").where({label: header[f]})[0].set("value", orderedFields[f]);
        } else {
          var n = new DatumField();
          n.label = header[f];
          n.value = orderedFields[f];
          this.get("datumFields").add(n);
        }
      }
      var csvDebugResult = this.exportAsCSV(null, null, true);
      
      return result;
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
      Utils.debug("Saving a Datum");
      var self = this;
      var newModel = true;
      if(this.id){
        newModel = false;
      }else{
        this.set("dateEntered", JSON.stringify(new Date()));
      }
      //protect against users moving datums from one corpus to another on purpose or accidentially
      if(window.app.get("corpus").get("corpusname") != this.get("corpusname")){
        if(typeof failurecallback == "function"){
          failurecallback();
        }else{
          alert('Datum save error. I cant save this datum in this corpus, it belongs to another corpus. ' );
        }
        return;
      }
      
      // Store the current Session, the current corpus, and the current date
      // in the Datum
      this.set({
        "session" : app.get("currentSession"),
        "corpusname" : app.get("corpus").get("corpusname"),
        "dateModified" : JSON.stringify(new Date())
      });
      
      var oldrev = this.get("_rev");
      this.changeCorpus(null,function(){
        self.save(null, {
          success : function(model, response) {
            Utils.debug('Datum save success');
            var utterance = model.get("datumFields").where({label: "utterance"})[0].get("mask");
            var differences = "<a class='activity-diff' href='#diff/oldrev/"+oldrev+"/newrev/"+response._rev+"'>"+utterance+"</a>";
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
            if(newModel){
              verb = "added";
            }
            window.app.get("authentication").get("userPrivate").get("activities").unshift(
                new Activity({
                  verb : verb,
                  directobject : "<a href='#corpus/"+model.get("corpusname")+"/datum/"+model.id+"'>datum</a> ",
                  indirectobject : "in "+window.app.get("corpus").get("title"),
                  context : differences+" via Offline App.",
                  user: window.app.get("authentication").get("userPublic")
                }));

            /*
             * Make sure the datum is at the top of the default data list which is in the corpus,
             * this is in case the default data list is not being displayed
             */
            var defaultIndex = window.app.get("corpus").get("dataLists").length - 1;
            var positionInDefaultDataList = window.app.get("corpus").get("dataLists").models[defaultIndex].get("datumIds").indexOf(model.id);
            if(positionInDefaultDataList != -1 ){
              //We only reorder the default data list datum to be in the order of the most recent modified, other data lists can stay in the order teh usr designed them. 
              window.app.get("corpus").get("dataLists").models[defaultIndex].get("datumIds").splice(positionInDefaultDataList, 1);
            }
            window.app.get("corpus").get("dataLists").models[defaultIndex].get("datumIds").unshift(model.id);
            /*
             * If the current data list is the default
             * list, render the datum there too since is the "Active" copy
             * that will eventually overwrite the default in the
             * corpus if the user saves the current data list
             */
            if(window.appView.currentEditDataListView.model.id == window.app.get("corpus").get("dataLists").models[defaultIndex].id){
              //Put it into the current data list views
              window.appView.currentPaginatedDataListDatumsView.collection.unshift(model);
              //Put it into the ids of the current data list
              var positionInCurrentDataList = window.app.get("currentDataList").get("datumIds").indexOf(model.id);
              if(positionInCurrentDataList != -1){
                window.app.get("corpus").get("dataLists").models[defaultIndex].get("datumIds").splice(positionInCurrentDataList, 1);
              }
              window.app.get("currentDataList").get("datumIds").unshift(model.id);
            }
            /*
             * If the current data list isnt the default, see if this datum matches the search datalist, and add it to the top of the search list
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
                // Insert the datum at the top of the search data list
//              TODO check this           window.appView.searchEmbeddedView.searchDataListEditLeftSideView.addOneDatumId(model.id, true);
              }
            }//end of if search is open and running for Alan
            
            window.appView.addUnsavedDoc(window.app.get("currentDataList").id);
            window.appView.addUnsavedDoc(window.app.get("corpus").id); //the corpus needs saving because it might have the only default data list with this datum in it

            //dont need to save the user every time when we change a datum.
//            window.app.get("authentication").saveAndInterConnectInApp();

            if(typeof successcallback == "function"){
              successcallback();
            }
          },
          error : function(e) {
            if(typeof failurecallback == "function"){
              failurecallback();
            }else{
              alert('Datum save error' + e);
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
     */
    setAsCurrentDatum : function(successcallback, failurecallback){
      if( window.app.get("corpus").get("corpusname") != this.get("corpusname") ){
        if (typeof failurecallback == "function") {
          failurecallback();
        }else{
          alert("This is a bug, cannot load the datum you asked for, it is not in this corpus.");
        }
        return;
      }else{
        if (window.appView.datumsEditView.datumsView.collection.models[0].id != this.id ) {
          window.appView.datumsEditView.datumsView.prependDatum(this);
          //TODO might not need to do it on the Read one since it is the same model?
        }
        if (typeof successcallback == "function") {
          successcallback();
        }
      }
    }
  });

  return Datum;
});
