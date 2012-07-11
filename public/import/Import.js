define([ 
    "backbone",
    "handlebars",
    "data_list/DataList",
    "data_list/DataListEditView",
    "datum/DatumFields",
    "libs/Utils"
], function(
    Backbone,
    Handlebars,
    DataList,
    DataListEditView,
    DatumFields
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
     * @property {DataList} datalist the datalist imported, to hold the data before it is saved.
     * @property {Event} event The drag/drop event.
     * 
     * @description The initialize serves to bind import to all drag and drop events. 
     *
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
      this.set("corpusname", window.app.get("corpus").get("corpusname"));
    },

    // This is an list of attributes and their default values
    defaults : {
      status : "",
      fileDetails : "",
      corpusname : "",
      rawText: "",
      asCSV : "",
      asXML : "",
      files : [],
    },
    
    // Internal models: used by the parse function
    model : {
      dataList : DataList,
      fields : DatumFields
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
    
    importCSV : function() {
    },
    
    importXML : function() {
    },
    
    importText : function() {
    },
    readFiles : function(){
      var filedetails = [];
      var files = this.get("files");
      Utils.debug(files);
      for ( var i = 0, f; f = files[i]; i++) {
        filedetails.push( escape(f.name), f.type
            || 'n/a', ') - ', f.size, ' bytes, last modified: ',
            f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString()
                : 'n/a');
        
        this.readFileIntoRawText(i);
//        this.set("asCSV", this.importCSV(f.getBytes()));
//      this.set("asXML", this.importCSV(f.getBytes()));

      }
      
      var status = this.get("status");
      this.set("fileDetails", filedetails.join('') );
      status = status + filedetails.join('');
      this.set("status", status);
      if (this.get("datalist") == undefined) {
        this.set("datalist",new DataList(
          {
            title : "Importing workspace",
            description : "This is the data list which would result from the import of these files."
              + this.get("fieldDetails"),
            corpusname: this.get("corpusname")
          }));
      }
      this.dataListView = new DataListEditView({model : this.get("datalist")});
      this.dataListEditLeftSideView.format = "import";
      this.dataListView.render();
    },
    readFileIntoRawText : function(index, callback){
     this.readBlob(this.get("files")[index]);
     if(typeof callback == "function"){
       callback();
     }
    },
    readBlob : function (file, opt_startByte, opt_stopByte) {
      //console.log(this);
      var start = parseInt(opt_startByte) || 0;
      var stop = parseInt(opt_stopByte) || file.size - 1;
      var reader = new FileReader();

      var self = this;
      // If we use onloadend, we need to check the readyState.
      reader.onloadend = function(evt) {
        if (evt.target.readyState == FileReader.DONE) { // DONE == 2
          self.set("rawText", evt.target.result);
//          document.getElementById('byte_range').textContent = [ '' ]
//          .join('');
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