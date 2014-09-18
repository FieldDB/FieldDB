if ("undefined" === typeof window) {
  var window = {};
}
(function(exports) {

  /** @lends Export.prototype */
  var Export = {
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
    initialize: function() {},

    exportCSV: function() {},

    exportXML: function() {},

    exportLaTex: function() {},

  };


  exports.Export = Export;

})(window || exports)
