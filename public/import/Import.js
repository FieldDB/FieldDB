define([ 
    "backbone",
    "handlebars",
    "data_list/DataList",
    "data_list/DataListEditView",
    "datum/Datums",
    "datum/DatumFields",
    "datum/Session",
    "libs/Utils"
], function(
    Backbone,
    Handlebars,
    DataList,
    DataListEditView,
    Datums,
    DatumFields,
    Session
) {
  var Import = Backbone.Model.extend(

  /** @lends Import.prototype */
  {
    /**
     * @class The import class helps import csv, xml and raw text data into a corpus, or create a new corpus. 
     *
     * @property {FileList} files These are the file(s) that were dragged in.
     * @property {String} corpusname This is the corpusid where the data should be imported
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
      this.set("corpusname", window.app.get("corpus").get("corpusname"));
      if(this.get("datumFields") == undefined){
        this.set("datumFields",window.app.get("corpus").get("datumFields").clone());
      }
    },

    // This is an list of attributes and their default values
    defaults : {
      status : "",
      fileDetails : "",
      corpusname : "",
      datumArray : [],
//      rawText: "",
//      asCSV : "", //leave undefined
//      asXML : "",
//      asDatumFields : "";
      files : [],
    },
    
    // Internal models: used by the parse function
    model : {
      dataList : DataList,
      fields : DatumFields,
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
    /**
     * This function tries to guess if you have \n or \r as line endings
     * and then tries to determine if you have "surounding your text".
     * 
     * CSV is a common export format for Filemaker, Microsoft Excel and
     * OpenOffice Spreadsheets, and could be a good format to export
     * from these sources and import into iField.
     * 
     * @param text
     */
    importCSV : function(text) {
      var rows = text.split("\n");
      if(rows.length < 3){
        rows = text.split("\r");
        this.set("status", this.get("status","Detected a \r line ending."));
      }
      var hasQuotes = false;
      //If it looks like it already has quotes:
      if( rows[0].split('","').length > 2 && rows[5].split('","').length > 2){
        hasQuotes = true;
        this.set("status", this.get("status","Detected text was already surrounded in quotes."));
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
          rows[l] = this.parseLineCSV(rows[l]);
        }
      }
      
      this.set("asCSV", rows);
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
    importXML : function(xml) {
    },
    /**
     * This function accepts text which uses \t tabs between columns. If
     * you have your data in ELAN or in Microsoft Excel or OpenOffice
     * spreadsheets, this will most likely be a good format to export
     * your data, and import into iField. This function is triggered if
     * your file has more than 100 tabs in it, iField guesses that it
     * should try this function.
     * 
     * @param tabbed
     */
    importTabbed : function(text) {
      var rows = text.split("\n");
      if(rows.length < 3){
        rows = text.split("\r");
        this.set("status", this.get("status","Detected a \n line ending."));
      }
      for(l in rows){
        rows[l] = rows[l].split("\t");
      }
      
      this.set("asCSV", rows);
    },
    /**
     * This function accepts text using double spaces to indicate
     * separate datum. Each line in the block is treated as a column in
     * the table.
     * 
     * If you have your data in Microsoft word or OpenOffice or plain
     * text, then this will be the easiest format for you to import your
     * data in.
     * 
     * @param text
     */
    importText : function(text) {
      var rows = text.split("\n\n");
      var macLineEndings = false;
      if(rows.length < 3){
        rows = text.split("\r\r");
        macLineEndings = true;
        this.set("status", this.get("status","Detected a MAC line ending."));
      }
      for(l in rows){
        if(macLineEndings){
          rows[l] = rows[l].replace(/  +/g," ").split("\r");
        }else{
          rows[l] = rows[l].replace(/  +/g," ").split("\n");
        }
      }
      this.set("asCSV", rows);
    },
    readFiles : function(){
      var filedetails = [];
      var files = this.get("files");
      Utils.debug(files);
      for ( var i = 0, f; f = files[i]; i++) {
        filedetails.push( escape(f.name), f.type
            || 'n/a', ' - ', f.size, ' bytes, last modified: ',
            f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString()
                : 'n/a');
        
        this.readFileIntoRawText(i, function(){
          Utils.debug("Finished reading in the raw text file.")
        });
//        this.set("asCSV", this.importCSV(f.getBytes()));
//      this.set("asXML", this.importCSV(f.getBytes()));

      }
      
      var status = this.get("status");
      this.set("fileDetails", filedetails.join('') );
      status = status + filedetails.join('');
      this.set("status", status);
      if (this.get("dataList") == undefined) {
        // Create a new DataList
        this.set("dataList", new DataList({
          title : "Data from "+files[0].name,
          description : "This is the data list which would result from the import of these files."
            + this.get("fileDetails"),
          corpusname: this.get("corpusname")
        }));
        
        // Create a new DataListEditView
        this.dataListView = new DataListEditView({
          model : this.get("dataList"),
          datumCollection : new Datums()
        });
        this.dataListView.format = "import";
      }
      
      // Render the DataList
      this.dataListView.render();
    },
    readFileIntoRawText : function(index, callback){
      var self = this;
      this.readBlob(this.get("files")[index], function(){
        self.guessFormatAndImport(0, callback); 
      });
    },
    /**
     * This function attempts to guess the format of the file, and calls the appropriate import handler.
     */
    guessFormatAndImport : function(fileIndex, callback){
      var self = this;
      if(fileIndex == null){
        fileIndex = 0;
      }
      //if the user is just typing, try raw text
      if(!self.get("files")[fileIndex]){
        self.importText(self.get("rawText"), callback);
        return;
      }
      if(self.get("files")[fileIndex].name.split('.').pop() == "csv"){
        self.importCSV(self.get("rawText"), callback);
      }else if(self.get("files")[fileIndex].name.split('.').pop() == "txt"){
        //If there are more than 100 tabs in the file, try tabbed.
        if(self.get("rawText").split("\t").length > 100){
          self.importTabbed(self.get("rawText"), callback);
        }else{
          self.importText(self.get("rawText"), callback);
        }
      }else if(self.get("files")[fileIndex].name.split('.').pop() == "eaf"){
        self.importXML(self.get("rawText"), callback);
      }
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
      }
      reader.readAsBinaryString(blob);
//      reader.readAsText(file);
    }
  });
   
  return Import;
});