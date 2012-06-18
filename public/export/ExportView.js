define([
    "use!backbone", 
    "use!handlebars", 
    "text!export/export.handlebars",
    "export/Export",
], function(Backbone, Handlebars, exportTemplate, Export) {
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

        template: Handlebars.compile(exportTemplate),
   	
        render : function() {
         //   $(this.el).html(this.template(this.model.toJSON()));
            
         // Display the ExportView
          	this.setElement($("#export-view")); 
          	$(this.el).html(this.template(this.model.toJSON()));
        	      
            return this;
        },
           
    });
    
    return ExportView;
}); 