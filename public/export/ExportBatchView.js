define([
    "backbone", 
    "handlebars", 
    "export/Export",
], function(
    Backbone, 
    Handlebars, 
    Export
) {
  var ExportBatchView = Backbone.View.extend(
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

    templateBatch : Handlebars.templates.export_batch_modal,

    render : function() {
     // Display the ExportView
      this.setElement($("#export-batch-modal")); 
      $(this.el).html(this.templateBatch(this.model.toJSON()));
      
      //localization
      $(".locale_Export").html(chrome.i18n.getMessage("locale_Export"));
      $(".locale_Close").html(chrome.i18n.getMessage("locale_Close"));


          
      return this;
    }
  });
  
  return ExportBatchView;
}); 