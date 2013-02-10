define([ 
    "backbone",
    "audio_video/AudioVideo", 
    "comment/Comment",
    "comment/Comments",
    "datum/Datums", 
    "datum/DatumField", 
    "datum/DatumFields", 
    "datum/DatumState", 
    "datum/DatumStates",
    "datum/DatumTag",
    "datum/DatumTags",
    "datum/Session",
    "libs/OPrime"
], function(
    Backbone, 
    AudioVideo, 
    Comment,
    Comments,
    Datums,
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
//      if (this.get("datumStates") && (this.get("datumStates").models.length > 0)) {
//        this.get("datumStates").models[0].set("selected", "selected");
//      }
      
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
      
      // If there are no datumTags, give it a new one
      if (!this.get("datumTags")) {
        this.set("datumTags", new DatumTags());
      }
      
      if(!this.get("datumFields") || this.get("datumFields").length == 0){
        this.set("datumFields", window.app.get("corpus").get("datumFields").clone());
      }
    },
    /**
     * backbone-couchdb adaptor set up
     */
    
    // The couchdb-connector is capable of mapping the url scheme
    // proposed by the authors of Backbone to documents in your database,
    // so that you don't have to change existing apps when you switch the sync-strategy
    url : "/datums",
    
    
    // Internal models: used by the parse function
    internalModels : {
      datumFields : DatumFields,
      audioVideo : AudioVideo,
      session : Session,
      comments : Comments,
      datumStates : DatumStates,
      datumTags : DatumTags
    },

    /**
     * Gets all the DatumIds in the current Corpus sorted by their date.
     * 
     * @param {Function} callback A function that expects a single parameter. That
     * parameter is the result of calling "pages/by_date". So it is an array
     * of objects. Each object has a 'key' and a 'value' attribute. The 'key'
     * attribute contains the Datum's dateModified and the 'value' attribute contains
     * the Datum itself.
     */
    getMostRecentIdsByDate : function(callback) {
      var self = this;
      
      if(OPrime.isBackboneCouchDBApp()){
//        alert("TODO check  getMostRecentIdsByDate");
        //TODO this might be producing the error on line  815 in backbone.js       model = new this.model(attrs, options);
        var tempDatums = new Datums();
        tempDatums.model = Datum;
        tempDatums.fetch({
          limit: 2,
//          ascending: false,
          error : function(model, xhr, options) {
            OPrime.bug("There was an error loading your datums.");
            if(typeof callback == "function"){
              callback([]);
            }
          },
          success : function(model, response, options) {
//            if (response.length >= 1) {
//              callback([response[0]._id], [response[1]._id]);
              callback(response);
//            }
          }
        });
        return;
      }
      
      
      try{
          self.pouch(function(err, db) {
            db.query("pages/by_date", {reduce: false}, function(err, response) {
              
              if(err){
                if(window.toldSearchtomakebydateviews){
                  if (OPrime.debugMode) OPrime.debug("Told pouch to make by date views once, apparently it didnt work. Stopping it from looping.");
                  return;
                }
                /*
                 * Its possible that the pouch has no by date views, create them and then try searching again.
                 */
                window.toldSearchtomakebydateviews = true;
                window.app.get("corpus").createPouchView("pages/by_date", function(){
                  window.appView.toastUser("Initializing your corpus' sort items by date functions for the first time.","alert-success","Sort:");
                  self.getMostRecentIdsByDate(callback);
                });
                return;
              }
              
              if ((!err) && (typeof callback == "function"))  {
                if (OPrime.debugMode) OPrime.debug("Callback with: ", response.rows);
                callback(response.rows);
              }
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
        //http://support.google.com/analytics/bin/answer.py?hl=en&answer=1012264
        window.pageTracker._trackPageview('/search_results.php?q='+queryString); 
      }catch(e){
        if (OPrime.debugMode) OPrime.debug("Search Analytics not working.");
      }
      
      // Process the given query string into tokens
      var queryTokens = self.processQueryString(queryString);
      var doGrossKeywordMatch = false;
      if(queryString.indexOf(":") == -1){
        doGrossKeywordMatch = true;
        queryString = queryString.toLowerCase().replace(/\s/g,"");
      }
      
      if(OPrime.isBackboneCouchDBApp()){

      // run a custom map reduce
//        var mapFunction = function(doc) {
//          if(doc.collection != "datums"){
//            return;
//          }
//          var fields  = doc.datumFields;
//          var result = {};
//          for(var f in fields){
//            if(fields[f].label == "gloss"){
//              result.gloss = fields[f].value;
//            }else if(fields[f].label == "morphemes"){
//              result.morphemes = fields[f].value;
//            }else if(fields[f].label == "judgement"){
//              result.judgement = fields[f].value;
//            }
//          }
//          emit( result,  doc._id );
//        };
//        $.couch.db(this.get("pouchname")).query(mapFunction, "_count", "javascript", {
        //use the get_datum_fields view
//        alert("TODO test search in chrome extension");
        $.couch.db(self.get("pouchname")).view("pages/get_datum_fields", {
          success: function(response) {
            if (OPrime.debugMode) OPrime.debug("Got "+response.length+ "datums to check for the search query locally client side.");
            var matchIds = [];
//            console.log(response);
            for (i in response.rows) {
              var thisDatumIsIn = self.isThisMapReduceResultInTheSearchResults(response.rows[i], queryString, doGrossKeywordMatch, queryTokens);
              // If the row's datum matches the given query string
              if (thisDatumIsIn) {
                // Keep its datum's ID, which is the value
                matchIds.push(response.rows[i].value);
              }
            }
            
            if(typeof callback == "function"){
              //callback with the unique members of the array
              callback(_.unique(matchIds));
//              callback(matchIds); //loosing my this in SearchEditView
            }
          },
          error: function(status) {
            console.log("Error quering datum",status);
          },
          reduce: false
        });

        return;
      }
        
      
      
      try{
          self.pouch(function(err, db) {
            db.query("pages/get_datum_fields", {reduce: false}, function(err, response) {
              var matchIds = [];
              
              if (!err) {
               
                // Go through all the rows of results
                for (i in response.rows) {
                  var thisDatumIsIn = self.isThisMapReduceResultInTheSearchResults(response.rows[i], queryString, doGrossKeywordMatch, queryTokens);
                  // If the row's datum matches the given query string
                  if (thisDatumIsIn) {
                    // Keep its datum's ID, which is the value
                    matchIds.push(response.rows[i].value);
                  }
                }
              }else{
                if(window.toldSearchtomakeviews){
                  if (OPrime.debugMode) OPrime.debug("Told search to make views once, apparently it didnt work. Stopping it from looping.");
                  return;
                }
                /*
                 * Its possible that the corpus has no search views, create them and then try searching again.
                 */
                window.appView.toastUser("Initializing your search functions for the first time." +
                		" Search in LingSync is pretty powerful, " +
                		" in fact if you're the power user type you can write your " +
                		"own data extracting/filtering/visualization queries using " +
                		" <a href='http://www.kchodorow.com/blog/2010/03/15/mapreduce-the-fanfiction/' target='_blank'>MapReduce.</a>","alert-success","Search:");
                window.toldSearchtomakeviews = true;
                var previousquery = queryString;
                window.app.get("corpus").createPouchView("pages/get_datum_fields", function(){
                  window.appView.searchEditView.search(previousquery);
                });
              }
              if(typeof callback == "function"){
                //callback with the unique members of the array
                callback(_.unique(matchIds));
//                callback(matchIds); //loosing my this in SearchEditView
              }
            });
        });
      }catch(e){
        alert("Couldnt search the data, if you sync with the server you might get the most recent search index.");
      }
    },
    isThisMapReduceResultInTheSearchResults : function(keyValuePair, queryString, doGrossKeywordMatch, queryTokens){
      
      
      var thisDatumIsIn = false;
      // If the query string is null, include all datumIds
      if(queryString.trim() == ""){
        thisDatumIsIn = true;
      }else if(doGrossKeywordMatch){
          if(JSON.stringify(keyValuePair.key).toLowerCase().replace(/\s/g,"").search(queryString) > -1){
            thisDatumIsIn = true;
          }
      }else{
        
        // Determine if this datum matches the first search criteria
        thisDatumIsIn = this.matchesSingleCriteria(keyValuePair.key, queryTokens[0]);
        
        // Progressively determine whether the datum still matches based on
        // subsequent search criteria
        for (var j = 1; j < queryTokens.length; j += 2) {
          if (queryTokens[j] == "AND") {
            // Short circuit: if it's already false then it continues to be false
            if (!thisDatumIsIn) {
              break;
            }
            
            // Do an intersection
            thisDatumIsIn = thisDatumIsIn && this.matchesSingleCriteria(keyValuePair.key, queryTokens[j+1]);
          } else {
            // Do a union
            thisDatumIsIn = thisDatumIsIn || this.matchesSingleCriteria(keyValuePair.key, queryTokens[j+1]);
          }
        }
      }
      return thisDatumIsIn;
      
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
      var negate = false;
      if (label.indexOf("!") == 0)
      {
    	  label = label.replace(/^!/,"");
    	  negate  = true;
      }
      var value = criteria.substring(delimiterIndex + 1);
      /* handle the fact that "" means grammatical, so if user asks for  specifically, give only the ones wiht empty judgemnt */
      if(label == "judgement" && value.toLowerCase() == "grammatical"){
        if(!objectToSearchThrough[label]){
          return true;
        }
      }
//      if(!label || !value){
//        return false;
//      }
      
      var searchResult = objectToSearchThrough[label] && (objectToSearchThrough[label].toLowerCase().search(value.toLowerCase()) >= 0);

      
      if (negate)
    	  {
    	  	searchResult = !searchResult;
    	  }
      
      
      return  searchResult;
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
          /* toLowerCase introduces a bug in search where camel case fields loose their capitals, then cant be matched with fields in the map reduce results */
          currentString = currentString + " " + currentItem;//.toLowerCase();  
        } else {
          currentString = currentItem;//.toLowerCase();
        }
      }
      queryTokens.push(currentString);
      
      return queryTokens;
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
        audioVideo : new AudioVideo(this.get("audioVideo").toJSON(), {parse: true}),
        comments : new Comments(this.get("comments").toJSON(), {parse: true}),
        dateEntered : this.get("dateEntered"),
        dateModified : this.get("dateModified"),
        datumFields : new DatumFields(this.get("datumFields").toJSON(), {parse: true}),
        datumStates : new DatumStates(this.get("datumStates").toJSON(), {parse: true}),
        datumTags : new DatumTags(this.get("datumTags").toJSON(), {parse: true}),
        pouchname : this.get("pouchname"),
        session: this.get("session")
      });

      return datum;
    },
    updateDatumState : function(selectedValue){
      console.log("Asking to change the datum state to "+selectedValue); 
      
      try{
        this.get("datumStates").where({selected : "selected"})[0].set("selected", "");
        this.get("datumStates").where({state : selectedValue})[0].set("selected", "selected");
      }catch(e){
        Utils.debug("problem getting color of datum state, probaly none are selected.",e);
      }
      console.log("done"); 

//      this.save();
      //TODO save it
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
    	//corpus's most frequent fields
        var frequentFields = window.app.get("corpus").frequentFields;
        //this datum/datalist's datumfields and their names 
    	var fields = _.pluck(this.get("datumFields").toJSON(), "mask");
    	var fieldLabels = _.pluck(this.get("datumFields").toJSON(), "label");
    	//setting up for IGT case...
    	var utteranceIndex = -1;
    	var utterance = "";
    	var morphemesIndex = -1;
    	var morphemes = "";
    	var glossIndex = -1;
    	var gloss = "";
    	var translationIndex = -1;
    	var translation = "";
    	var result = "\n \\begin{exe} \n \\ex \[";
    	//IGT case:
    	if(this.datumIsInterlinearGlossText()){
    		/* get the key pieces of the IGT and delete them from the fields and fieldLabels arrays*/
    	  judgementIndex = fieldLabels.indexOf("judgement");
        if(judgementIndex >= 0){
          judgement = fields[judgementIndex];
           fieldLabels.splice(judgementIndex,1);
           fields.splice(judgementIndex,1);
        }
    	  utteranceIndex = fieldLabels.indexOf("utterance");
    		if(utteranceIndex >= 0){
    			 utterance = fields[utteranceIndex];
    			 fieldLabels.splice(utteranceIndex,1);
    			 fields.splice(utteranceIndex,1);
    		}
    		morphemesIndex = fieldLabels.indexOf("morphemes");
    		if(morphemesIndex >= 0){
    			morphemes = fields[morphemesIndex];
    			fieldLabels.splice(morphemesIndex,1);
    			fields.splice(morphemesIndex,1);
    		}
    		glossIndex = fieldLabels.indexOf("gloss");
    		if (glossIndex >= 0){
    			gloss = fields[glossIndex];
    			fieldLabels.splice(glossIndex,1);
    			fields.splice(glossIndex,1);
    		}
    		translationIndex = fieldLabels.indexOf("translation");
    		if (translationIndex >=0){
    			translation = fields[translationIndex];
    			fieldLabels.splice(translationIndex,1);
    			fields.splice(translationIndex,1);
    		}
    		//print the main IGT, escaping special latex chars
    		result = result + this.escapeLatexChars(judgement) + "\]\{" +  this.escapeLatexChars(utterance)
    			+ "\n \\gll " + this.escapeLatexChars(morphemes) + "\\\\"
    			+ "\n " + this.escapeLatexChars(gloss) + "\\\\"
    			+ "\n \\trans " + this.escapeLatexChars(translation) + "\}" +
    			"\n\\label\{\}";
    	}
    	//remove any empty fields from our arrays
    	for(i=fields.length-1;i>=0;i--){
    		if(!fields[i]){
    			fields.splice(i,1);
    			fieldLabels.splice(i,1);
    		}
    		
    	}
    	/*throughout this next section, print frequent fields and infrequent ones differently
    	frequent fields get latex'd as items in a description and infrequent ones are the same,
    	but commented out.*/
    	if(fields && (fields.length>0)){
    		var numInfrequent = 0;
    		for (var field in fields){
    			if(frequentFields.indexOf(fieldLabels[field])>=0){
    				break;
    			}
    			numInfrequent++;
    		}
    		if(numInfrequent!=fieldLabels.length){
    			result = result + "\n \\begin\{description\}";
    		}else{
    			result = result + "\n% \\begin\{description\}";
    		}
    		for (var field in fields){
    			if(fields[field] && (frequentFields.indexOf(fieldLabels[field])>=0)){
    				result = result
    				+ "\n \\item\[\\sc\{" + this.escapeLatexChars(fieldLabels[field])
    				+ "\}\] " + this.escapeLatexChars(fields[field]) ;
    			} else if(fields[field]){
    				result = result
    				+ "\n% \\item\[\\sc\{" + this.escapeLatexChars(fieldLabels[field])
    				+ "\}\] " + this.escapeLatexChars(fields[field]) ;
    			}
    		}
    		if(numInfrequent!=fieldLabels.length){
    			result = result + "\n \\end\{description\}";
    		}else{
    			result = result + "\n% \\end\{description\}";
    		}

    	}
    	result = result + "\n\\end{exe}\n\n";

    	return result;
    },
    
    latexitDataList : function(showInExportModal){
    	//this version prints new data as well as previously shown latex'd data (best for datalists)
    	var result = this.laTeXiT(showInExportModal);
    	if (showInExportModal != null) {
    		$("#export-type-description").html(" as LaTeX (GB4E)");
    		$("#export-text-area").val($("#export-text-area").val() + result);
    	}
    	return result;
    },
    
    latexitDatum : function(showInExportModal){
    	//this version prints new data and deletes previously shown latex'd data (best for datums)
    	var result = this.laTeXiT(showInExportModal);
    	if (showInExportModal != null) {
    		$("#export-type-description").html(" as LaTeX (GB4E)");
    		$("#export-text-area").val(result);
    	}
    	return result;
    },

    escapeLatexChars : function(input){
    	var result = input;
    	//curly braces need to be escaped TO and escaped FROM, so we're using a placeholder
    	result = result.replace(/\\/g,"\\textbackslashCURLYBRACES");
    	result = result.replace(/\^/g,"\\textasciicircumCURLYBRACES");
    	result = result.replace(/\~/g,"\\textasciitildeCURLYBRACES");
    	result = result.replace(/#/g,"\\#");
    	result = result.replace(/\$/g,"\\$");
    	result = result.replace(/%/g,"\\%");
    	result = result.replace(/&/g,"\\&");
    	result = result.replace(/_/g,"\\_");
    	result = result.replace(/{/g,"\\{");
    	result = result.replace(/}/g,"\\}");
    	result = result.replace(/</g,"\\textless");
    	result = result.replace(/>/g,"\\textgreater");
    	
    	result = result.replace(/CURLYBRACES/g,"{}");
    	return result;
    },
    
    datumIsInterlinearGlossText : function(fieldLabels) {
    	if(!fieldLabels){
        	fieldLabels = _.pluck(this.get("datumFields").toJSON(), "label");
    	}
    	var utteranceOrMorphemes = false;
    	var gloss = false;
    	var trans = false;
    	for (var fieldLabel in fieldLabels){
    		if(fieldLabels[fieldLabel] == "utterance" || fieldLabels[fieldLabel] == "morphemes"){
    			utteranceOrMorphemes = true;
    		}
    		if (fieldLabels[fieldLabel] == "gloss"){
    			gloss = true;
    		}
    		if (fieldLabels[fieldLabel] == "translation"){
    			trans = true;
    		}		
    	}
    	if (gloss || utteranceOrMorphemes || trans){
    		return true;
    	}
    	else{ 
    		return false;
    	}
    },
    
    /**
     * This function simply takes the utterance gloss and translation and puts
     * them out as plain text so the user can do as they wish.
     */
    exportAsPlainText : function(showInExportModal) {
      var header = _.pluck(this.get("datumFields").toJSON(), "label");
      var fields = _.pluck(this.get("datumFields").toJSON(), "mask");
      var result = fields.join("\n");
      if (showInExportModal != null) {
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
    exportAsCSV : function(showInExportModal, orderedFields, printheaderonly) {
      
      var header = _.pluck(this.get("datumFields").toJSON(), "label");
      var fields = _.pluck(this.get("datumFields").toJSON(), "mask");
      var result = fields.join(",") +"\n";
      
//      if (orderedFields == null) {
//        orderedFields = ["judgement","utterance","morphemes","gloss","translation"];
//      }
//      judgement = this.get("datumFields").where({label: "judgement"})[0].get("mask");
//      morphemes = this.get("datumFields").where({label: "morphemes"})[0].get("mask");
//      utterance= this.get("datumFields").where({label: "utterance"})[0].get("mask");
//      gloss = this.get("datumFields").where({label: "gloss"})[0].get("mask");
//      translation= this.get("datumFields").where({label: "translation"})[0].get("mask");
//      var resultarray =  [judgement,utterance,morphemes,gloss,translation];
//      var result = '"' + resultarray.join('","') + '"\n';
      if (printheaderonly) {
        result = header.join(",") + "\n";
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
      if (OPrime.debugMode) OPrime.debug("Saving a Datum");
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
        if (OPrime.debugMode) OPrime.debug("Not setting the session on this datum.");
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
        if (OPrime.debugMode) OPrime.debug("Removing empty states work around failed some thing was wrong.",e);
      }
      
        self.save(null, {
          success : function(model, response) {
            if (OPrime.debugMode) OPrime.debug('Datum save success');
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
            if (OPrime.debugMode) OPrime.debug("Datum save error", e, f, g)
            if(typeof failurecallback == "function"){
              failurecallback();
            }else{
              alert('Datum save error: ' + f.reason);
            }
          }
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
