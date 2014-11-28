define([ "backbone" ], function(Backbone) {
  var Export = Backbone.Model.extend(
  /** @lends Export.prototype */
  {
    /**
     * @class The export class helps export a set of selected data into csv, xml
     *        and LaTex file.
     *
     * @property {Collection} datalist This is the data selected for export.
     * @property {String} dataListName This is the name of the data set which
     *           appears as a filename when exported.
     * @property {Array} fields The fields array contains titles of the fields.
     * @property {Event} event The export event (e.g. click "LatexIt").
     *
     * @description The initialize serves to bind export to e.g. LaTexIt event.
     *
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
    internalModels : {
    // There are no nested models
    },

    /**
     * Describe the validation here.
     *
     * @param {Object}
     *          attributes The set of attributes to validate.
     *
     * @returns {String} The validation error, if there is one. Otherwise,
     *          doesn't return anything.
     */
    validate : function(attributes) {
    },

    exportCSV : function() {
    },

    exportXML : function() {
    },

    exportLaTex : function() {
    },

    exportLaTexPreamble : function() {
        return "\\documentclass[12pt,xelatex]{article} \n"+
            "\\usepackage{fullpage} \n"+
            "\\usepackage{tipa} \n"+
            "%\\usepackage{ucharclasses}                                          % Uncomment this line to use unicode characters\n"+
            "%\\usepackage{fontspec}                                                 % Uncomment this line to use unicode characters\n"+
            "%\\setsansfont{Arial Unicode MS}                                    % Uncomment this line to use unicode characters\n"+
            "%\\setDefaultTransitions{\\fontspec{Arial Unicode MS}}{} % Uncomment this line to use unicode characters\n"+
            "\\usepackage{qtree} \n"+
            "\\usepackage{gb4e} \n"+
            "\\begin{document} \n" ;
    },

    exportLaTexPostamble : function() {
        return "\\end{document}";
    },

    saveAndInterConnectInApp : function(callback) {

      if (typeof callback == "function") {
        callback();
      }
    }
  });

  return Export;

});
