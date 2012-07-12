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
      },
      "drop .drop-label-zone" : function(e){
        this._dropLabelEvent(e);
      },
      "click .add-column" : "insertDoubleColumnsInTable"
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
    _dropLabelEvent: function (e) {
      if (e.originalEvent) e = e.originalEvent;
      var data = this._getCurrentDragData(e);

      if (e.preventDefault) e.preventDefault();
      if (e.stopPropagation) e.stopPropagation(); // stops the browser from redirecting

      if (this._draghoverClassAdded) $(this.el).removeClass("draghover");

//      this.drop(data, e.dataTransfer, e);
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
      if(this.model.get("asCSV") != undefined){
        this.showCSVTable();
        this.renderDatumFieldsLables();
      }
      return this;
    },
    renderDatumFieldsLables : function(){
      if(this.model.get("datumFields") == undefined){
        return;
      }
      var colors= ["label-info","label-inverse","label-success","label-warning","label-danger"];
      var colorindex = 0;
      $("#import-datum-field-labels").html("Drag the datum field to the top of the appropriate column: ");
      for(i in this.model.get("datumFields").models){
        var x = document.createElement("span");
        x.classList.add("label");
        x.classList.add(colors[colorindex]);
        x.draggable="true";
        x.innerHTML = this.model.get("datumFields").models[i].get("label");
        x.addEventListener('dragover', this.handleDragStart, false);
       colorindex++;
       $("#import-datum-field-labels").append(x);
      }
    },
    showCSVTable : function(rows){
      if(rows == undefined){
        rows = this.model.get("asCSV");
      }
      var tableResult = document.getElementById("csv-table-area");
      $(tableResult).empty();
      
      var tablehead = document.createElement("thead");
      var headerRow = document.createElement("tr");
      for(var i = 0; i < rows[0].length; i++){
        var tableCell = document.createElement("th");
        $(tableCell).html('<input class="drop-label-zone header'+i+'"/>');
        tableCell.addEventListener('drop', this.dragLabelToColumn, false);
        tableCell.addEventListener('dragover', this.handleDragOver, false);
        headerRow.appendChild(tableCell);
      }
      tablehead.appendChild(headerRow);
      tableResult.appendChild(tablehead);
      
      var tablebody = document.createElement("tbody");
      tableResult.appendChild(tablebody);
      for(l in rows){
        var tableRow = document.createElement("tr");
        for(c in rows[l]){
          var tableCell = document.createElement("td");
          tableCell.contentEditable="true";
          tableCell.innerHTML = rows[l][c];
          tableRow.appendChild(tableCell);
        }
        tablebody.appendChild(tableRow);
      }
      $(".add-column").show();
    },
    /*
     * Adds double the columns
     */
    insertDoubleColumnsInTable : function(){
      $('td').each(function(index) {
        $(this).after('<td contenteditable = "true"></td>');
      });
      $('th').each(function(index) {
        $(this).after('<th><input class = "drop-label-zone header"/></th>');
      });
      
    },
    dragSrcEl : null,
    /**
     * http://www.html5rocks.com/en/tutorials/dnd/basics/
     * 
     * @param e
     */
    handleDragStart : function(e) {
      // Target (this) element is the source node.
      this.classList.add("halfopacity");

      window.appView.importView.dragSrcEl = this;

      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', this.innerHTML);
    },
    /**
     * http://www.html5rocks.com/en/tutorials/dnd/basics/
     * 
     * @param e
     */
    dragLabelToColumn : function(e) {
      Utils.debug("Recieved a drop event ");
      // this / e.target is current target element.
      if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from redirecting.
      }
      
   // Don't do anything if dropping the same column we're dragging.
      if (window.appView.importView.dragSrcEl != this) {
        // Set the source column's HTML to the HTML of the columnwe dropped on.
//        window.appView.importView.dragSrcEl.innerHTML = e.target.value;
        e.target.value = window.appView.importView.dragSrcEl.innerHTML;//e.dataTransfer.getData('text/html');
      }
      
//      e.target.value = e.dataTransfer.getData('text/html');
      console.log(e);
      return false;
    },
    handleDrop : function(e) {
      // this/e.target is current target element.

      if (e.stopPropagation) {
        e.stopPropagation(); // Stops some browsers from redirecting.
      }

      // Don't do anything if dropping the same column we're dragging.
      if (window.appView.importView.dragSrcEl != this) {
        // Set the source column's HTML to the HTML of the columnwe dropped on.
        window.appView.importView.dragSrcEl.innerHTML = this.innerHTML;
        this.innerHTML = e.dataTransfer.getData('text/html');
      }

      return false;
    },
    handleDragOver : function(e) {
      if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
      }
      e.dataTransfer.dropEffect = 'move';  // See the section on the DataTransfer object.
      return false;
    },
  });
  
  return ImportEditView;
});