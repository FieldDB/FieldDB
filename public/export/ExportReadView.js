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

    render : function() {
     // Display the ExportView
    	this.setElement($("#export-modal")); 
    	$(this.el).html(this.template(this.model.toJSON()));
    	//$(".locale_Export").html(chrome.i18n.getMessage("locale_Export"));
      //$(".locale_Close").html(chrome.i18n.getMessage("locale_Close"));


  	      
      return this;
    }
  });
  
  return ExportView;
}); 