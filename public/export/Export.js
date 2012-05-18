define("export/Export", [ 
    "use!backbone"
], function(Backbone) {
  var Import = Backbone.Model.extend(

      /** @lends Export.prototype */
      {
        /**
<<<<<<< HEAD
         * @class The export class helps export a set of selected data into csv, xml and LaTex file. 
         *
         * @property {Collection} datalist This is the data selected for export.
         * @property {String} dataListName This is the name of the data set which appears as a filename when exported.  
         * @property {Array} fields The fields array contains titles of the fields.
         * @property {Event} event The export event (e.g. click "LatexIt").
         * 
         * @description The initialize serves to bind export to e.g. LaTexIt event. 
=======
         * @class The export class helps export selected data into csv, xml and LaTex files.   
         *
         * @property {DataList} files These are the file(s) that were dragged in.
         * @property {String} corpusid This is the corpusid where the data should be imported
         * @property {Array} fields The fields array contains titles of the data columns.
         * @property {Collection} datalist the datalist imported, to hold the data before it is saved.
         * @property {Event} event The drag/drop event.
         * 
         * @description The intialize serves to bind import to all drag and drop events. 
>>>>>>> e92371bbeb027b0a8bc2f9282edaf5a0b623db3f
         *
         * @extends Backbone.Model
         * @constructs
         */
        initialize : function() {
<<<<<<< HEAD
          }
=======
          var output = [];
          var files = this.get("files");
          (new Utils()).debug(files);
          for ( var i = 0, f; f = files[i]; i++) {
            output.push('<li><strong>', escape(f.name), '</strong> (', f.type
                || 'n/a', ') - ', f.size, ' bytes, last modified: ',
                f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString()
                    : 'n/a', '</li>');
          }
          var status = document.getElementById('status');
          if( status == null){
            status = document.createElement("div");
          }
          status.innerHTML += '<ul>' + output.join('') + '</ul>';

          this.on('all', function(e) {
            (new Utils()).debug("Import event: " + e);
>>>>>>> e92371bbeb027b0a8bc2f9282edaf5a0b623db3f
          });
        },

        // This is an list of attributes and their default values
        defaults : {
<<<<<<< HEAD
          
=======
          corpusid : "",
          files : [],
          fields : [],
          dataList : []
>>>>>>> e92371bbeb027b0a8bc2f9282edaf5a0b623db3f
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
<<<<<<< HEAD
        exportCSV : function() {

        },
        exportXML : function() {

        },
        exportLaTex : function() {

        }
      });
  return Export;
=======
        importCSV : function() {

        },
        importXML : function() {

        },
        importText : function() {

        }
      });
  return Import;
>>>>>>> e92371bbeb027b0a8bc2f9282edaf5a0b623db3f
});