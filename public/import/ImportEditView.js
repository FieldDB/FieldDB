define( [ 
    "use!backbone",
    "use!handlebars",
    "import/Import",
    "text!import/import_edit_modal.handlebars"
], function(
    Backbone,
    Handlebars, 
    Import,
    importTemplate
) {
  var ImportEditView = Backbone.View.extend({
    tagName : "div",
    
    className : "import",
    
    model: Import,
    
    template: Handlebars.templates.import_edit_modal,

    render : function() {
      this.setElement("#import-modal");
      $(this.el).html(this.template(this.model.toJSON()));

      return this;
    }
  });
  
  return ImportEditView;
});