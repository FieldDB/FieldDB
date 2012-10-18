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
    	
    	//localization
    	$(this.el).find(".locale_Export").html(Locale["locale_Export"].message);
    	$(this.el).find(".locale_Close").html(Locale["locale_Close"].message);


  	      
      return this;
    }
  });
  
  return ExportView;
}); 