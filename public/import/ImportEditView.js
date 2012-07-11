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
//      "dragover .drop-zone" : function(evt) {
//        evt.stopPropagation();
//        evt.preventDefault();
//        evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
//      },
//      "drop .drop-zone": function(evt){
//        this.dropFile(evt);
//      }
      
      "dragover .drop-zone" : function(e){
        this._dragOverEvent(e);
      },
      "dragenter .drop-zone" : function(e){
        this._dragEnterEvent(e);
      },
      "dragleave .drop-zone" : function(e){
        this._dragLeaveEvent(e);
      },
      "drop .drop-zone" : function(e){
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
    
    drop: function (data, dataTransfer, e) {
      this.model.set("files", dataTransfer.files);
      this.model.readFiles();
    },
    
    model : Import,
    
    template: Handlebars.templates.import_edit_fullscreen,
    
    render : function() {
      this.setElement("#import-fullscreen");
      $(this.el).html(this.template(this.model.toJSON()));
      if(this.model.get("datalist") != undefined){
        if(this.model.dataListView != undefined){
          this.model.dataListView.render();
        }
      }
      return this;
    }
  });
  
  return ImportEditView;
});