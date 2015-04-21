define([
    "backbone",
    "handlebars",
    "audio_video/AudioVideo",
    "audio_video/AudioVideos",
    "data_list/DataList",
    "data_list/DataListEditView",
    "datum/DatumReadView",
    "datum/Datums",
    "datum/DatumFields",
    "datum/Session",
    "app/PaginatedUpdatingCollectionView",
    "xml2json",
    "bower_components/textgrid/dist/textgrid",
    "OPrime"
], function(
    Backbone,
    Handlebars,
    AudioVideo,
    AudioVideos,
    DataList,
    DataListEditView,
    DatumReadView,
    Datums,
    DatumFields,
    Session,
    PaginatedUpdatingCollectionView,
    X2JS
) {
  var Import = Backbone.Model.extend(

  /** @lends Import.prototype */
  {
    /**
     * @class The import class helps import csv, xml and raw text data into a corpus, or create a new corpus.
     *
     * @property {FileList} files These are the file(s) that were dragged in.
     * @property {String} dbname This is the corpusid where the data should be imported
     * @property {DatumFields} fields The fields array contains titles of the data columns.
     * @property {DataList} dataList the datalist imported, to hold the data before it is saved.
     * @property {Event} event The drag/drop event.
     *
     * @description The initialize serves to bind import to all drag and drop events.
     *
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
      this.set("dbname", window.app.get("corpus").get("dbname"));
      if(this.get("datumFields") == undefined){
        this.set("datumFields",window.app.get("corpus").get("datumFields").clone());
      }
      if(this.get("filledWithDefaults")){
        this.fillWithDefaults();
        this.unset("filledWithDefaults");
      }
      this.set("audioVideo", new AudioVideos());
    },
    fillWithDefaults : function(){
      if(this.get("datumFields") == undefined){
        this.set("datumFields",window.app.get("corpus").get("datumFields").clone());
      }
    },
    // This is an list of attributes and their default values
    defaults : {
      status : "",
      fileDetails : "",
      dbname : "",
      datumArray : [],
//      rawText: "",
//      asCSV : "", //leave undefined
//      asXML : "",
//      asDatumFields : "";
      files : [],
    },

    // Internal models: used by the parse function
    internalModels : {
      dataList : DataList,
      datumFields : DatumFields,
      session : Session
    },

    /**
     * Describe the validation here.
     *
     * @param {Object} attributes The set of attributes to validate.
     *
     * @returns {String} The validation error, if there is one. Otherwise, doesn't
     * return anything.
     */
    validate : function(attributes) {
    },
    saveAndInterConnectInApp : function(callback){

      if(typeof callback == "function"){
        callback();
      }
    },

    /**
     * This function tries to guess if you have \n or \r as line endings
     * and then tries to determine if you have "surounding your text".
     *
     * CSV is a common export format for Filemaker, Microsoft Excel and
     * OpenOffice Spreadsheets, and could be a good format to export
     * from these sources and import into FieldDB.
     *
     * @param text
     */
    importCSV : function(text, self, callback) {
      var rows = text.split("\n");
      if(rows.length < 3){
        rows = text.split("\r");
        self.set("status", self.get("status","Detected a \r line ending."));
      }
      var firstrow = rows[0];
      var hasQuotes = false;
      //If it looks like it already has quotes:
      if( rows[0].split('","').length > 2 && rows[5].split('","').length > 2){
        hasQuotes = true;
        self.set("status", self.get("status","Detected text was already surrounded in quotes."));
      }
      for(l in rows){
        if(hasQuotes){
          rows[l] = rows[l].trim().replace(/^"/,"").replace(/"$/,"").split('","');
//          var withoutQuotes = [];
//          _.each(rows[l],function(d){
//            withoutQuotes.push(d.replace(/"/g,""));
//          });
//          rows[l] = withoutQuotes;
        }else{
          rows[l] = self.parseLineCSV(rows[l]);
          /* This was a fix for alan's data but it breaks other data. */
//          var rowWithoutQuotes = rows[l].replace(/"/g,"");
//          rows[l] = self.parseLineCSV(rowWithoutQuotes);
        }
      }
      /* get the first line and set it to be the header by default */
      var header = [];
      if(rows.length > 3){
        firstrow = firstrow.toLowerCase().replace(/[-"'+=?./\[\]{}() ]/g,"");
        if(hasQuotes){
          header = firstrow.trim().replace(/^"/,"").replace(/"$/,"").split('","');
        }else{
          header = self.parseLineCSV(firstrow);
        }
      }
      self.set("extractedHeader",header);

      self.set("asCSV", rows);
      if(typeof callback == "function"){
        callback();
      }
    },


    /**
     * http://purbayubudi.wordpress.com/2008/11/09/csv-parser-using-javascript/
     * // -- CSV PARSER --
      // author  : Purbayu, 30Sep2008
      // email   : purbayubudi@gmail.com
      //
      // description :
      //  This jscript code describes how to load csv file and parse it into fields.
      //  Additionally, a function to display html table as result is added.
      //
      // disclamer:
      //  To use this code freely, you must put author's name in it.
     */
    parseLineCSV : function(lineCSV) {
      // parse csv line by line into array
      var CSV = new Array();

      // Insert space before character ",". This is to anticipate
      // 'split' in IE
      // try this:
      //
      // var a=",,,a,,b,,c,,,,d";
      // a=a.split(/\,/g);
      // document.write(a.length);
      //
      // You will see unexpected result!
      //
      lineCSV = lineCSV.replace(/,/g, " ,");

      lineCSV = lineCSV.split(/,/g);

      // This is continuing of 'split' issue in IE
      // remove all trailing space in each field
      for ( var i = 0; i < lineCSV.length; i++) {
        lineCSV[i] = lineCSV[i].replace(/\s*$/g, "");
      }

      lineCSV[lineCSV.length - 1] = lineCSV[lineCSV.length - 1]
      .replace(/^\s*|\s*$/g, "");
      var fstart = -1;

      for ( var i = 0; i < lineCSV.length; i++) {
        if (lineCSV[i].match(/"$/)) {
          if (fstart >= 0) {
            for ( var j = fstart + 1; j <= i; j++) {
              lineCSV[fstart] = lineCSV[fstart] + "," + lineCSV[j];
              lineCSV[j] = "-DELETED-";
            }
            fstart = -1;
          }
        }
        fstart = (lineCSV[i].match(/^"/)) ? i : fstart;
      }

      var j = 0;

      for ( var i = 0; i < lineCSV.length; i++) {
        if (lineCSV[i] != "-DELETED-") {
          CSV[j] = lineCSV[i];
          CSV[j] = CSV[j].replace(/^\s*|\s*$/g, ""); // remove leading & trailing
          // space
          CSV[j] = CSV[j].replace(/^"|"$/g, ""); // remove " on the beginning
          // and end
          CSV[j] = CSV[j].replace(/""/g, '"'); // replace "" with "
          j++;
        }
      }
      return CSV;
    },
    importXML : function(text, self, callback) {
      alert("The app thinks this might be a XML file, but we haven't implemented this kind of import yet. You can vote for it in our bug tracker.");
    },
    importElanXML : function(text, self, callback) {
      //alert("The app thinks this might be a XML file, but we haven't implemented this kind of import yet. You can vote for it in our bug tracker.");
      var xmlParser = new X2JS();
      window.text = text;
      var jsonObj = xmlParser.xml_str2json( text );
      if (OPrime.debugMode) OPrime.debug(jsonObj);

      //add the header to the session
//    HEADER can be put in the session and in the datalist
      var annotationDetails = JSON.stringify(jsonObj.ANNOTATION_DOCUMENT.HEADER).replace(/,/g,"\n").replace(/[\[\]{}]/g,"").replace(/:/g," : ").replace(/"/g,"").replace(/\\n/g,"").replace(/file : /g,"file:").replace(/ : \//g,":/").trim();
      //TODO turn these into session fields
      self.set("status", self.get("status")+"\n"+annotationDetails);


      var header = [];
      var tierinfo = [];
//    TIER has tiers of each, create datum  it says who the informant is and who the data entry person is. can turn the objects in the tier into a datum
//for tier, add rows containing
//    _ANNOTATOR
      tierinfo.push("_ANNOTATOR");
//    _DEFAULT_LOCALE
      tierinfo.push("_DEFAULT_LOCALE");
//    _LINGUISTIC_TYPE_REF
      tierinfo.push("_LINGUISTIC_TYPE_REF");
//    _PARTICIPANT
      tierinfo.push("_PARTICIPANT");
//    _TIER_ID
      tierinfo.push("_TIER_ID");
//    __cnt
      tierinfo.push("__cnt");

      var annotationinfo = [];
//    ANNOTATION.ALIGNABLE_ANNOTATION.ANNOTATION_VALUE.__cnt
//      annotationinfo.push({"FieldDBDatumFieldName" : "ANNOTATION.ALIGNABLE_ANNOTATION.ANNOTATION_VALUE", "elanALIGNABLE_ANNOTATION": "ANNOTATION_VALUE"});
//    ANNOTATION.ALIGNABLE_ANNOTATION._ANNOTATION_ID
      annotationinfo.push({"FieldDBDatumFieldName" : "ANNOTATION.ALIGNABLE_ANNOTATION._ANNOTATION_ID", "elanALIGNABLE_ANNOTATION": "_ANNOTATION_ID"});
//    ANNOTATION.ALIGNABLE_ANNOTATION._TIME_SLOT_REF1
      annotationinfo.push({"FieldDBDatumFieldName" : "ANNOTATION.ALIGNABLE_ANNOTATION._TIME_SLOT_REF1", "elanALIGNABLE_ANNOTATION": "_TIME_SLOT_REF1"});
//    ANNOTATION.ALIGNABLE_ANNOTATION._TIME_SLOT_REF2
      annotationinfo.push({"FieldDBDatumFieldName" : "ANNOTATION.ALIGNABLE_ANNOTATION._TIME_SLOT_REF2", "elanALIGNABLE_ANNOTATION": "_TIME_SLOT_REF2"});
//
      var refannotationinfo = [];
//    ANNOTATION.REF_ANNOTATION.ANNOTATION_VALUE
      refannotationinfo.push({"FieldDBDatumFieldName" : "ANNOTATION.REF_ANNOTATION.ANNOTATION_VALUE", "elanREF_ANNOTATION": "ANNOTATION_VALUE"});
//    ANNOTATION.REF_ANNOTATION._ANNOTATION_ID
      refannotationinfo.push({"FieldDBDatumFieldName" : "ANNOTATION.REF_ANNOTATION._ANNOTATION_ID", "elanREF_ANNOTATION": "_ANNOTATION_ID"});
//    ANNOTATION.REF_ANNOTATION._ANNOTATION_REF
      refannotationinfo.push({"FieldDBDatumFieldName" : "ANNOTATION.REF_ANNOTATION._ANNOTATION_REF", "elanREF_ANNOTATION": "_ANNOTATION_REF"});


      header.push("_ANNOTATOR");
      header.push("_DEFAULT_LOCALE");
      header.push("_LINGUISTIC_TYPE_REF");
      header.push("_PARTICIPANT");
      header.push("_TIER_ID");
      header.push("__cnt");

      header.push("ANNOTATION.ALIGNABLE_ANNOTATION.ANNOTATION_VALUE");

      header.push("ANNOTATION.ALIGNABLE_ANNOTATION._ANNOTATION_ID");
      header.push("ANNOTATION.ALIGNABLE_ANNOTATION._TIME_SLOT_REF1");
      header.push("ANNOTATION.ALIGNABLE_ANNOTATION._TIME_SLOT_REF2");

      header.push("ANNOTATION.REF_ANNOTATION.ANNOTATION_VALUE");
      header.push("ANNOTATION.REF_ANNOTATION._ANNOTATION_ID");
      header.push("ANNOTATION.REF_ANNOTATION._ANNOTATION_REF");


      //similar to toolbox
      var matrix = [];
      var TIER = jsonObj.ANNOTATION_DOCUMENT.TIER;

      //there are normally 8ish tiers, with different participants
      for(l in TIER){
        //in those tiers are various amounts of annotations per participant
        for(annotation in TIER[l].ANNOTATION){
          matrix[annotation] = [];

          for(cell in tierinfo){
            matrix[annotation][tierinfo[cell]] = jsonObj.ANNOTATION_DOCUMENT.TIER[l][tierinfo[cell]];
          }

          try{
            matrix[annotation]["ANNOTATION.ALIGNABLE_ANNOTATION.ANNOTATION_VALUE.__cnt"] = TIER[l].ANNOTATION[annotation].ALIGNABLE_ANNOTATION.ANNOTATION_VALUE.__cnt;
            for(cell in annotationinfo){
              matrix[annotation][annotationinfo[cell].FieldDBDatumFieldName] = TIER[l].ANNOTATION[annotation].ALIGNABLE_ANNOTATION[annotationinfo[cell].elanALIGNABLE_ANNOTATION];
            }
          }catch(e){
            if (OPrime.debugMode) OPrime.debug("TIER "+l+" doesnt seem to have a ALIGNABLE_ANNOTATION object. We don't really knwo waht the elan file format is, or why some lines ahve ALIGNABLE_ANNOTATION and some dont. So we are just skipping them for this datum.");
          }

          try{
            for(cell in refannotationinfo){
              matrix[annotation][refannotationinfo[cell].FieldDBDatumFieldName] = TIER[l].ANNOTATION[annotation].REF_ANNOTATION[refannotationinfo[cell].elanREF_ANNOTATION];
            }
          }catch(e){
            if (OPrime.debugMode) OPrime.debug("TIER "+l+" doesnt seem to have a REF_ANNOTATION object. We don't really knwo waht the elan file format is, or why some lines ahve REF_ANNOTATION and some dont. So we are just skipping them for this datum.");
          }

        }
      }
      var rows = [];
      for(var d in matrix){
        var cells = [];
        //loop through all the column headings, find the data for that header and put it into a row of cells
        for(var h in header){
          var cell = matrix[d][header[h]];
          if(cell){
            cells.push(cell);
          }else{
            //fill the cell with a blank if that datum didn't have a header
            cells.push("");
          }
        }
        rows.push(cells);
      }
      if(rows == []){
        rows.push("");
      }
      self.set("extractedHeader",header);
      self.set("asCSV", rows);
      if(typeof callback == "function"){
        callback();
      }
    },

    importMorphChallengeSegmentation: function(text, self, callback) {
      var rows = text.trim().split("\n");
      if (rows.length < 3) {
        rows = text.split("\r");
        self.set("status", self.get("status","Detected a \n line ending."));
      }
      var row,
        original,
        twoPieces,
        word,
        alternates,
        orthography,
        morphemes,
        gloss,
        source,
        l,
        filename = self.get("files")[0].name;

      var header = ["orthography", "utterance", "morphemes", "gloss", "alternatesAnalyses", "alternates", "original", "source"];
      self.set("extractedHeader",header);

      var convertFlatIGTtoObject = function(alternateParse) {
        morphemes = alternateParse.trim().split(" ");
        // console.log("working on alternateParse", morphemes);
        return morphemes.map(function(morpheme) {
          return {
            morphemes: morpheme.split(":")[0],
            gloss: morpheme.split(":")[1]
          };
        });
      };
      var extractMorphemesFromIGT = function(alternate) {
        return alternate.morphemes.replace("+", "");
      };
      var extractGlossFromIGT = function(alternate) {
        return alternate.gloss.replace("+", "");
      };
      for (l in rows) {
        row = original = rows[l] + "";
        source = filename + ":line:" + l;
        twoPieces = row.split(/\t/);
        word = twoPieces[0];
        if (!twoPieces || !twoPieces[1]) {
          continue;
        }
        alternates = twoPieces[1].split(",");
        alternates = alternates.map(convertFlatIGTtoObject);
        morphemes = alternates[0].map(extractMorphemesFromIGT).join("-");
        gloss = alternates[0].map(extractGlossFromIGT).join("-");
        alternates.shift();
        // get alternative morpheme analyses so they show in the app.
        var alternateMorphemes = [];
        for (var alternateIndex = 0; alternateIndex < alternates.length; alternateIndex++) {
          alternateMorphemes.push(alternates[alternateIndex].map(extractMorphemesFromIGT).join("-"));
        }
        orthography = self.undoMorphochallengeEncoding(word, filename);
        rows[l] = [orthography, word, morphemes, gloss, twoPieces[1], alternateMorphemes.join(","), original + "", source];
      }

      self.set("asCSV", rows);

      if (typeof callback === "function") {
        callback();
      }
    },

    undoMorphochallengeEncoding: function(ascii, filename) {
      var extension = filename.substring(filename.lastIndexOf("."));
      if (extension === ".tur") {
        return ascii
          .replace(/I/g, "ı")
          .replace(/O/g, "ö")
          .replace(/U/g, "ü")
          .replace(/C/g, "ç")
          .replace(/G/g, "ğ")
          .replace(/S/g, "ş");
      } else if (extension === ".fin") {
        return ascii;
      }
      return ascii;
    },

    /**
     * This function accepts text which uses \t tabs between columns. If
     * you have your data in ELAN or in Microsoft Excel or OpenOffice
     * spreadsheets, this will most likely be a good format to export
     * your data, and import into FieldDB. This function is triggered if
     * your file has more than 100 tabs in it, FieldDB guesses that it
     * should try this function.
     *
     * @param tabbed
     */
    importTabbed : function(text, self, callback) {
      var rows = text.split("\n");
      if(rows.length < 3){
        rows = text.split("\r");
        self.set("status", self.get("status","Detected a \n line ending."));
      }
      for(l in rows){
        rows[l] = rows[l].split("\t");
      }

      self.set("asCSV", rows);
      if(typeof callback == "function"){
        callback();
      }
    },

    metadataLines : [],

    /**
     * This function takes in a text block, splits it on lines and then
     * takes the first word with a \firstword as the data type/column
     * heading and then walks through the file looking for lines that
     * start with \ge and creates a new datum each time it finds \ge
     * This works for verb lexicons but would be \ref if an interlinear
     * gloss. TODO figure out how Toolbox knows when one data entry
     * stops and another starts. It doesn't appear to be double spaces...
     *
     * @param text
     * @param self
     * @param callback
     */
    importToolbox : function(text, self, callback){
      var lines = text.split("\n");
      var macLineEndings = false;
      if(lines.length < 3){
        lines = text.split("\r");
        macLineEndings = true;
        self.set("status", self.get("status","Detected a \r line ending."));
      }

      var matrix = [];
      var currentDatum = -1;
      var header = [];
      var columnhead = "";

      var firstToolboxField = "";

      /* Looks for the first line of the toolbox data */
      while(!firstToolboxField && lines.length > 0){
        var potentialToolBoxFieldMatches = lines[0].match(/^\\[a-zA-Z]+\b/);
        if(potentialToolBoxFieldMatches && potentialToolBoxFieldMatches.length > 0){
          firstToolboxField = potentialToolBoxFieldMatches[0];
        }else{
          /* remove the line, and put it into the metadata lines */
          this.metadataLines.push(lines.shift());
        }
      }

      for(var l in lines){
        //Its a new row
        if( lines[l].indexOf(firstToolboxField) == 0 ){
          currentDatum += 1;
          matrix[currentDatum] = {};
          matrix[currentDatum][firstToolboxField.replace(/\\/g,"")] = lines[l].replace(firstToolboxField,"").trim();
          header.push(firstToolboxField.replace(/\\/g,""));
        }else{
          if(currentDatum >= 0){
            //If the line starts with \ its a column
            if(lines[l].match(/^\\/) ){
              var pieces = lines[l].split(/ +/);
              columnhead = pieces[0].replace('\\',"");
              matrix[currentDatum][columnhead] = lines[l].replace(pieces[0],"");
              header.push(columnhead);
            }else{
              //add it to the current column head in the current datum, its just another line.
              if(lines[1].trim() != ""){
                matrix[currentDatum][columnhead] += lines[l];
              }
            }
          }
        }
      }
      //only keep the unique headers
      header = _.unique(header);
      var rows = [];
      for(var d in matrix){
        var cells = [];
        //loop through all the column headings, find the data for that header and put it into a row of cells
        for(var h in header){
          var cell = matrix[d][header[h]];
          if(cell){
            cells.push(cell);
          }else{
            //fill the cell with a blank if that datum didn't have a header
            cells.push("");
          }
        }
        rows.push(cells);
      }
      if(rows == []){
        rows.push("");
      }
      self.set("extractedHeader",header);
      self.set("asCSV", rows);
      if(typeof callback == "function"){
        callback();
      }
    },


    downloadTextGrid: function(fileDetails){
      var textridUrl =  OPrime.audioUrl + "/" + this.get("dbname") + "/" + fileDetails.fileBaseName + ".TextGrid";
      var self = this;
      $.ajax({
        url: textridUrl,
        type: 'get',
        // dataType: 'text',
        success: function(results) {
          if (results) {
            fileDetails.textgrid = results;
            var syllables = "unknown";
            if (fileDetails.syllablesAndUtterances && fileDetails.syllablesAndUtterances.syllableCount) {
              syllables = fileDetails.syllablesAndUtterances.syllableCount;
            }
            var pauses = "unknown";
            if (fileDetails.syllablesAndUtterances && fileDetails.syllablesAndUtterances.pauseCount) {
              pauses = parseInt(fileDetails.syllablesAndUtterances.pauseCount,10);
            }
            var utteranceCount = 1;
            if(pauses > 0){
              utteranceCount = pauses +2;
            }
            var message = " Downloaded Praat TextGrid which contained a count of roughly " + syllables + " syllables and auto detected utterances for " + fileDetails.fileBaseName + " The utterances were not automatically transcribed for you, you can either save the textgrid and transcribe them using Praat, or continue to import them and transcribe them after.";
            fileDetails.description = message;
            self.set("status", self.get("status") + "<br/>" +  message);
            self.set("fileDetails", self.get("status") + message);
            window.appView.toastUser(message, "alert-info", "Import:");
            self.set("rawText", self.get("rawText").trim() + "\n\n\nFile name = " + fileDetails.fileBaseName + ".mp3\n" + results);
            self.importTextGrid(self.get("rawText"), self, null);
          } else {
            console.log(results);
            fileDetails.textgrid = "Error result was empty. " + results;
          }
        },
        error: function(response) {
          var reason = {};
          if (response && response.responseJSON) {
            reason = response.responseJSON;
          } else {
            var message = "Error contacting the server. ";
            if (response.status >= 500) {
              message = message + " Please report this error to us at support@lingsync.org ";
            } else {
              message = message + " Are you offline? If you are online and you still recieve this error, please report it to us: ";
            }
            reason = {
              status: response.status,
              userFriendlyErrors: [message + response.status]
            };
          }
          console.log(reason);
          if (reason && reason.userFriendlyErrors) {
            self.set("status", fileDetails.fileBaseName + "import error: " + reason.userFriendlyErrors.join(" "));
            window.appView.toastUser(reason.userFriendlyErrors.join(" "), "alert-danger", "Import:");
          }
        }
      });
    },

    addAudioVideoFile: function(url) {
      if (!this.get("audioVideo")) {
        this.set("audioVideo", new AudioVideos())
      }
      this.get("audioVideo").add(new AudioVideo({
        filename: url.substring(url.lastIndexOf("/") + 1),
        URL: url,
        description: "File from import"
      }));
    },

    importTextGrid : function(text, self, callback){
      console.log(textgrid);
      // alert("The app thinks this might be a Praat TextGrid file, but we haven't implemented this kind of import yet. You can vote for it in our bug tracker.");
      var textgrid = TextGrid.textgridToIGT(text);
      var audioFileName = self.get("files")[0] ?  self.get("files")[0].name : "copypastedtextgrid_unknownaudio";
      audioFileName = audioFileName.replace(/\.textgrid/i, "");
      if (!textgrid || !textgrid.intervalsByXmin) {
        if (typeof callback == "function") {
          callback();
        }
      }
      var matrix = [],
        h,
        itemIndex,
        pointIndex,
        intervalIndex,
        point,
        row,
        interval,
        tierName;
      var header = [];
      var consultants = [];
      if (textgrid.isIGTNestedOrAlignedOrBySpeaker.probablyAligned) {
        for (itemIndex in textgrid.intervalsByXmin) {
          if (!textgrid.intervalsByXmin.hasOwnProperty(itemIndex)) {
            continue;
          }
          if (textgrid.intervalsByXmin[itemIndex]) {
            row = {};
            for (intervalIndex = 0; intervalIndex < textgrid.intervalsByXmin[itemIndex].length; intervalIndex++) {
              interval = textgrid.intervalsByXmin[itemIndex][intervalIndex];
              row.startTime = row.startTime ? row.startTime : interval.xmin;
              row.endTime = row.endTime ? row.endTime : interval.xmax;
              row.utterance = row.utterance ? row.utterance : interval.text.trim();
              row.modality = "spoken";
              row.tier = interval.tierName;
              row.speakers = interval.speaker;
              row.audioFileName = interval.fileName || audioFileName;
              row.CheckedWithConsultant = interval.speaker;
              consultants.push(row.speakers);
              row[interval.tierName] = interval.text;
              header.push(interval.tierName);
            }
            matrix.push(row);
          }
        }
      } else {
        for (itemIndex in textgrid.intervalsByXmin) {
          if (!textgrid.intervalsByXmin.hasOwnProperty(itemIndex)) {
            continue;
          }
          if (textgrid.intervalsByXmin[itemIndex]) {
            for (intervalIndex = 0; intervalIndex < textgrid.intervalsByXmin[itemIndex].length; intervalIndex++) {
              row = {};
              interval = textgrid.intervalsByXmin[itemIndex][intervalIndex];
              row.startTime = row.startTime ? row.startTime : interval.xmin;
              row.endTime = row.endTime ? row.endTime : interval.xmax;
              row.utterance = row.utterance ? row.utterance : interval.text.trim();
              row.modality = "spoken";
              row.tier = interval.tierName;
              row.speakers = interval.speaker;
              row.audioFileName = interval.fileName || audioFileName;
              row.CheckedWithConsultant = interval.speaker;
              consultants.push(row.speakers);
              row[interval.tierName] = interval.text;
              header.push(interval.tierName);
              matrix.push(row);
            }
          }
        }
      }
      header = _.unique(header);
      consultants = _.unique(consultants);
      if (consultants.length > 0) {
        self.set("consultants", consultants.join(","));
      } else {
        self.set("consultants", "Unknown");
      }
      header = header.concat( ["utterance", "tier", "speakers", "CheckedWithConsultant", "startTime", "endTime", "modality", "audioFileName"]);
      var rows = [];
      for (var d in matrix) {
        var cells = [];
        //loop through all the column headings, find the data for that header and put it into a row of cells
        for (var h in header) {
          var cell = matrix[d][header[h]];
          if (cell) {
            cells.push(cell);
          } else {
            //fill the cell with a blank if that datum didn't have a that column
            cells.push("");
          }
        }
        //if the datum has any text, add it to the table
        if(cells.length >= 8 && cells.slice(0, cells.length - 8).join("").replace(/[0-9.]/g, "").length > 0 && cells[cells.length - 8] !== "silent"){
          // cells.push(audioFileName);
          rows.push(cells);
        }else{
          // console.log("This row has only the default columns, not text or anything interesting.");
        }
      }
      if (rows == []) {
        rows.push("");
      }
      // header.push("audioFileName");
      self.set("extractedHeader", header);
      self.set("asCSV", rows);

      if (typeof callback == "function") {
        callback();
      }
    },
    importLatex : function(text, self, callback){
      alert("The app thinks this might be a LaTeX file, but we haven't implemented this kind of import yet. You can vote for it in our bug tracker.");
      if(typeof callback == "function"){
        callback();
      }
    },


    /**
     * This function accepts text using double (or triple etc) spaces to indicate
     * separate datum. Each line in the block is treated as a column in
     * the table.
     *
     * If you have your data in Microsoft word or OpenOffice or plain
     * text, then this will be the easiest format for you to import your
     * data in.
     *
     * @param text
     */
    importText : function(text, self) {
      if (!text) {
        return;
      }
      var rows = text.split("\n");
      if (rows.length < 2) {
        var macrows = text.split("\r");
        if (macrows.length > rows.length) {
          rows = text.split(/\r\r+/);
          this.status = this.status + " Detected a \r line ending.";
        }
      } else {
        rows = text.split(/\n\n+/);
      }
      var l;
      for (l = 0; l < rows.length; l++) {
        rows[l] = rows[l].replace(/  +/g, " ").replace(/\t+/g, " ").split(/[\r\n]/);
      }
      if (rows && rows.length > 0) {
        self.set("extractedHeader", rows[0]);
      }
      self.set("asCSV", rows);
      if (typeof callback == "function") {
        callback();
      }
    },
    readFiles : function(){
      var filedetails = [];
      var files = this.get("files");
      if (OPrime.debugMode) OPrime.debug(files);
      for ( var i = 0, f; f = files[i]; i++) {
        filedetails.push( escape(f.name), ' ', f.type
            || ' n/a', ' - ', f.size, ' bytes, last modified: ',
            f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString()
                : ' n/a');

        this.readFileIntoRawText(i);
//        this.set("asCSV", this.importCSV(f.getBytes()));
//      this.set("asXML", this.importCSV(f.getBytes()));

      }

      var status = this.get("status");
      this.set("fileDetails", filedetails.join('') );
      status = status + filedetails.join('');
      this.set("status", status);

//      // Create a new DataListEditView
//      window.appView.importView.dataListView = new DataListEditView({
//        model : new DataList({
//          title : "Data from "+files[0].name,
//          description : "This is the data list which would result from the import of these files."
//            + this.get("fileDetails"),
//            dbname: this.get("dbname")
//        })
//      });
//      window.appView.importView.dataListView.format = "import";
//      window.appView.importView.importPaginatedDataListDatumsView = new PaginatedUpdatingCollectionView({
//        collection           : new Datums(),
//        childViewConstructor : DatumReadView,
//        childViewTagName     : "li",
//        childViewFormat      : "latex"
//      });
//
//      // Render the DataList
//      window.appView.importView.dataListView.format = "import";
//      window.appView.importView.dataListView.render();
//      window.appView.importView.importPaginatedDataListDatumsView.renderInElement(
//        $("#import-data-list").find(".import-data-list-paginated-view") );
//
    },
    readFileIntoRawText : function(index, callback){
      var self = this;
      this.readBlob(this.get("files")[index], function(){
        self.guessFormatAndImport(null, callback);
      });
    },
    /**
     * This function attempts to guess the format of the file/textarea, and calls the appropriate import handler.
     */
    guessFormatAndImport : function(fileIndex, callback){
      var self = this;
      if(fileIndex == null){
        fileIndex = 0;
      }

      var importType = {
        csv: { confidence: 0, importFunction : this.importCSV }
        ,tabbed: { confidence: 0, importFunction : this.importTabbed }
        ,xml: { confidence: 0, importFunction : this.importXML }
        ,toolbox: { confidence: 0, importFunction : this.importToolbox }
        ,elanXML: { confidence: 0, importFunction : this.importElanXML }
        ,praatTextgrid: { confidence: 0, importFunction : this.importTextGrid }
        ,latex: { confidence: 0, importFunction : this.importLatex }
        ,handout: { confidence: 0, importFunction : this.importText }
        ,morphoChallenge: { confidence: 0, importFunction : this.importMorphChallengeSegmentation }
      };

      //if the user is just typing, try raw text
      if(self.get("files")[fileIndex]){
        var fileExtension = self.get("files")[fileIndex].name.split('.').pop().toLowerCase();
        if(fileExtension == "csv"){
          importType.csv.confidence++;
        }else if(fileExtension == "txt"){
          //If there are more than 20 tabs in the file, try tabbed.
          if(self.get("rawText").split("\t").length > 20){
            importType.tabbed.confidence++;
          }else{
            importType.handout.confidence++;
          }
        }else if(fileExtension == "eaf"){
          importType.elanXML.confidence++;
        }else if(fileExtension == "xml"){
          importType.xml.confidence++;
        }else if(fileExtension == "sf"){
          importType.toolbox.confidence++;
        }else if(fileExtension == "tex"){
          importType.latex.confidence++;
        }else if(fileExtension == "textgrid"){
          importType.praatTextgrid.confidence++;
        }else if(fileExtension == "mov"){
          importType.praatTextgrid.confidence++;
        }else if(fileExtension == "wav"){
          importType.praatTextgrid.confidence++;
        }else if(fileExtension == "mp3"){
          importType.praatTextgrid.confidence++;
        }else if(fileExtension == "tur"){
          importType.morphoChallenge.confidence++;
        }else if(fileExtension == "fin"){
          importType.morphoChallenge.confidence++;
        }else if(fileExtension == "eng"){
          importType.morphoChallenge.confidence++;
        }
      }
      var mostLikelyImport = _.max(importType, function(obj) { return obj.confidence; });
      mostLikelyImport.importFunction(self.get("rawText"), self, null); //no callback, TODO strange loss of reference in importview
      self.set("status","");
    },
    readBlob : function (file, callback, opt_startByte, opt_stopByte) {
      //console.log(this);
      var start = parseInt(opt_startByte) || 0;
      var stop = parseInt(opt_stopByte) || file.size - 1;
      var reader = new FileReader();

      var self = this;
      // If we use onloadend, we need to check the readyState.
      reader.onloadend = function(evt) {
        if (evt.target.readyState == FileReader.DONE) { // DONE == 2
          self.set("rawText", evt.target.result);
          if(typeof callback == "function"){
            callback();
          }
        }
      };
      var blob = '';
      if (file.webkitSlice) {
        blob = file.webkitSlice(start, stop + 1);
      } else if (file.mozSlice) {
        blob = file.mozSlice(start, stop + 1);
      }else if(file.slice){
        blob = file.slice(start, stop + 1);
      }
      reader.readAsBinaryString(blob);
//      reader.readAsText(file);
    }
  });

  return Import;
});
