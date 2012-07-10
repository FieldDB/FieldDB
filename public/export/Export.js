define([ 
    "backbone",
    "data_list/DataList"
], function(
    Backbone, 
    DataList
) {
  var Export = Backbone.Model.extend(
  /** @lends Export.prototype */
  {
    /**
     * @class The export class helps export a set of selected data into csv, xml and LaTex file. 
     *
     * @property {Collection} datalist This is the data selected for export.
     * @property {String} dataListName This is the name of the data set which appears as a filename when exported.  
     * @property {Array} fields The fields array contains titles of the fields.
     * @property {Event} event The export event (e.g. click "LatexIt").
     * 
     * @description The initialize serves to bind export to e.g. LaTexIt event.

     *
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
    },

    // This is an list of attributes and their default values
    defaults : {
      fields : [],
      dataList : null,
      dataListName : "",
      event : null 
    },
    
    // Internal models: used by the parse function
    model : {
      // There are no nested models
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
    
    exportCSV : function() {
    },
    
    exportXML : function() {
    },
    
    exportLaTex : function() {
    }
  });

  return Export;

});