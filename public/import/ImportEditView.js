define( [ 
    "backbone",
    "handlebars",
    "import/Import"
], function(
    Backbone,
    Handlebars, 
    Import
) {
  var ImportEditView = Backbone.View.extend({
    initialize : function(){
      
    },
    events : {
      "dragover .drop-zone" : function(evt) {
        evt.stopPropagation();
        evt.preventDefault();
        evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
      },
      "drop .drop-zone": "dropFile"
    },
    tagName : "div",
    
    className : "import",
    
    model: Import,
    
    template: Handlebars.templates.import_edit_modal,
    dropFile : function(evt) {
      alert("dropped file");
      evt.stopPropagation();
      evt.preventDefault();
      var draggedfiles = evt.dataTransfer.files; // FileList object.
      // files is a FileList of File objects. List some properties.
//      var importObj = new Import({files: draggedfiles});

    },
    render : function() {
      this.setElement("#import-modal");
      $(this.el).html(this.template(this.model.toJSON()));

      return this;
    }
  });
  
  return ImportEditView;
});