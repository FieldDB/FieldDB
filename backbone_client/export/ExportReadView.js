define([
    "backbone", 
    "handlebars", 
    "export/Export",
], function(
    Backbone, 
    Handlebars, 
    Export
) {
  var ExportView = Backbone.View.extend(
  /** @lends ExportView.prototype */
  {
    /**
     * @class ExportView
     *
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
    },

    model : Export,

    classname : "export",

    template: Handlebars.templates.export_read_modal,

    render: function() {
      // Display the ExportView
      this.setElement($("#export-modal"));

      var jsonToRender = this.model.toJSON();
      jsonToRender.locale_Export = Locale.get("locale_Export");
      jsonToRender.locale_Close = Locale.get("locale_Close");

      $(this.el).html(this.template(jsonToRender));

      return this;
    }
  });
  
  return ExportView;
}); 