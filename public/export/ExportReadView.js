define([
    "use!backbone", 
    "use!handlebars", 
    "text!export/export_read_modal.handlebars",
    "export/Export",
], function(
    Backbone, 
    Handlebars, 
    exportTemplate, 
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
  	      
      return this;
    }
  });
  
  return ExportView;
}); 