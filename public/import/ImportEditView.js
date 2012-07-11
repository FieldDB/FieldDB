define( [ 
    "backbone",
    "handlebars",
    "import/Import"
], function(
    Backbone,
    Handlebars, 
    Import
) {
  /**
   * https://gist.github.com/1488561
   */
  var ImportEditView = Backbone.View.extend({
    initialize : function(){
      this.model.bind("change", this.render, this);
      this._draghoverClassAdded = false;
    },
    events : {
//      "dragover .modal-body" : function(evt) {
//        evt.stopPropagation();
//        evt.preventDefault();
//        evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
//      },
//      "drop .modal-body": function(evt){
//        this.dropFile(evt);
//      }
      
      "dragover .modal-body" : function(e){
        this._dragOverEvent(e);
      },
      "dragenter .modal-body" : function(e){
        this._dragEnterEvent(e);
      },
      "dragleave .modal-body" : function(e){
        this._dragLeaveEvent(e);
      },
      "drop .modal-body" : function(e){
        this._dropEvent(e);
      }
    },
    _dragOverEvent: function (e) {
      if (e.originalEvent) e = e.originalEvent;
      var data = this._getCurrentDragData(e);

      if (this.dragOver(data, e.dataTransfer, e) !== false) {
        if (e.preventDefault) e.preventDefault();
        e.dataTransfer.dropEffect = 'copy'; // default
      }
    },

    _dragEnterEvent: function (e) {
      if (e.originalEvent) e = e.originalEvent;
      if (e.preventDefault) e.preventDefault();
    },

    _dragLeaveEvent: function (e) {
      if (e.originalEvent) e = e.originalEvent;
      var data = this._getCurrentDragData(e);
      this.dragLeave(data, e.dataTransfer, e);
    },

    _dropEvent: function (e) {
      if (e.originalEvent) e = e.originalEvent;
      var data = this._getCurrentDragData(e);

      if (e.preventDefault) e.preventDefault();
      if (e.stopPropagation) e.stopPropagation(); // stops the browser from redirecting

      if (this._draghoverClassAdded) $(this.el).removeClass("draghover");

      this.drop(data, e.dataTransfer, e);
    },

    _getCurrentDragData: function (e) {
      var data = null;
      if (window._backboneDragDropObject) data = window._backboneDragDropObject;
      return data;
    },

    dragOver: function (data, dataTransfer, e) { // optionally override me and set dataTransfer.dropEffect, return false if the data is not droppable
      $(this.el).addClass("draghover");
      this._draghoverClassAdded = true;
    },

    dragLeave: function (data, dataTransfer, e) { // optionally override me
      if (this._draghoverClassAdded) $(this.el).removeClass("draghover");
    },
//    bindEvents : function(){
//      //https://gist.github.com/1488561
//      $(this.el).bind("dragover", _.bind(this._dragOverEvent, this));
//      $(this.el).bind("dragenter", _.bind(this._dragEnterEvent, this));
//      $(this.el).bind("dragleave", _.bind(this._dragLeaveEvent, this));
//      $(this.el).bind("drop", _.bind(this._dropEvent, this));
//      this._draghoverClassAdded = false;
//    },
    
    drop: function (data, dataTransfer, e) {
      alert("dropped");
      this.model.set("files", dataTransfer.files);
      this.model.readFiles();
    },
    
    model : Import,
    template: Handlebars.templates.import_edit_modal,
    dropFile : function(evt) {
      alert("dropped file");
//      evt.stopPropagation();
//      evt.preventDefault();
//      var draggedfiles = evt.dataTransfer.files; // FileList object.
////       files is a FileList of File objects. List some properties.
//      this.model = new Import({files: draggedfiles});
//      return false;
    },
    render : function() {
      this.setElement("#import-modal");
      $(this.el).html(this.template(this.model.toJSON()));
      return this;
    }
  });
  
  return ImportEditView;
});