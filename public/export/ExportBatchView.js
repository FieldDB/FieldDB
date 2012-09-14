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
    
    events : {
      "click .shouldBeEncryptedExport" : "updateEncryptedExport"     
    },

    classname : "export",

    templateBatch : Handlebars.templates.export_batch_modal,

    render : function() {
     // Display the ExportView
      this.setElement($("#export-batch-modal")); 
      $(this.el).html(this.templateBatch(this.model.toJSON()));
      
      //localization
      $(".locale_Export").html(chrome.i18n.getMessage("locale_Export"));
      $(".locale_Close").html(chrome.i18n.getMessage("locale_Close")); 
      $(".locale_Decrypt").html(chrome.i18n.getMessage("locale_Decrypt"));

      
      return this;
    },
    updateEncryptedExport : function() {
      var checked = this.$el.children(".shouldBeEncryptedExport").is(':checked');
     
      if (checked) {
        checked = "checked";
      } else {
        checked = "";
        alert("Warning! You are about to export decrypted data.");
      }      
      Utils.debug("Updated shouldBeEncryptedExport to " + checked);
     
    //  this.model.set("shouldBeEncrypted", checked);
     
    },
  });
  
  return ExportBatchView;
}); 