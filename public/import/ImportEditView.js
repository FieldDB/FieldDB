define( [ 
    "backbone",
    "handlebars",
    "import/Import",
    "datum/Datum",
    "datum/DatumField",
    "datum/DatumFields",
    "datum/DatumTag",
    "datum/Session",
    "libs/Utils"

], function(
    Backbone,
    Handlebars, 
    Import,
    Datum,
    DatumField,
    DatumFields,
    DatumTag,
    Session
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
      "click .approve-save" : "saveDataList",
      "click .approve-import" : "convertTableIntoDataList",
      "click .icon-resize-small" : function(){
        window.app.router.showDashboard();
      },
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
      if(this.model.get("dataList") != undefined){
        if(this.model.dataListView != undefined){
          this.model.dataListView.render();
        }
      }
      if(this.model.get("asCSV") != undefined){
        this.showCSVTable();
        this.renderDatumFieldsLabels();
      }
      $(".icon-book").hide();
      
      return this;
    },
    renderDatumFieldsLabels : function(){
      if(this.model.get("datumFields") == undefined){
        return;
      }
      var colors= ["label-info","label-inverse","label-success","label-warning","label-danger"];
      var colorindex = 0;
      $("#import-datum-field-labels").html("Drag the datum field to the top of the appropriate column: ");
      for(i in this.model.get("datumFields").models){
        var x = document.createElement("span");
        x.classList.add("label");
        x.classList.add(colors[colorindex%colors.length]);
        x.draggable="true";
        x.innerHTML = this.model.get("datumFields").models[i].get("label");
        x.addEventListener('dragover', this.handleDragStart, false);
        colorindex++;
        $("#import-datum-field-labels").append(x);
      }
      
      //add tags
      var x = document.createElement("span");
      x.classList.add("label");
      x.classList.add(colors[colorindex%colors.length]);
      x.draggable="true";
      x.innerHTML = "datumTags";
      x.addEventListener('dragover', this.handleDragStart, false);
      colorindex++;
      $("#import-datum-field-labels").append(x);
      
      //add date
      var x = document.createElement("span");
      x.classList.add("label");
      x.classList.add(colors[colorindex%colors.length]);
      x.draggable="true";
      x.innerHTML = "dateElicited";
      x.addEventListener('dragover', this.handleDragStart, false);
      colorindex++;
      $("#import-datum-field-labels").append(x);
    },
    showCSVTable : function(rows){
      if(this.model.get("session") == undefined){
        this.createNewSession();
      }
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
      $(".approve-import").show();
    },
    convertTableIntoDataList : function(){
      //clear out the data list
      this.model.dataListView.clearDataList();
      this.model.set("datumArray", []);
      var headers = [];
      $('th').each(function(index, item) {
          headers[index] = $(item).find(".drop-label-zone").val();
      });
      /*
       * Create new datum fields for new columns
       */
      for(f in headers){
        if (headers[f] == "" || headers[f] == undefined) {
          //do nothing
        } else if (headers[f] == "datumTags") {
          //do nothing
        } else{
          if(this.model.get("datumFields").where({label: headers[f]})[0] == undefined){
            this.model.get("datumFields").add(new DatumField({
              label : headers[f],
              encrypted: "checked",
              userchooseable: "",
              help: "This field came from file import "+this.model.get("status")
            }));
          }
        }
      }
      
      /*
       * Cycle through all the rows in table and create a datum with the matching fields.
       */
      var array = [];
      
      $('tr').has('td').each(function() {
          var arrayItem = {};
          $('td', $(this)).each(function(index, item) {
              arrayItem[headers[index]] = $(item).html();
          });
          array.push(arrayItem);
      });
      for (a in array) {
        var d = new Datum({corpusname : this.model.get("corpusname")});
        var fields = this.model.get("datumFields").clone();
        $.each(array[a], function(index, value) { 
          if(index == "" || index == undefined){
            //do nothing
          } else if (index == "datumTags") {
            var tags = value.split(" ");
            for(g in tags){
              var t = new DatumTag({
                "tag" : tags[g]
              });
              d.get("datumTags").add(t);
            }
          }else{
            var n = fields.where({label: index})[0];
            n.set("value", value);
          }
        });
        d.set("datumFields", fields);
        var states = window.app.get("corpus").get("datumStates").clone();
        d.set("datumStates", states);
        this.model.dataListView.addOneTempDatum(d);
        this.model.get("datumArray").push(d);
      }
      $(".approve-save").removeAttr("disabled");
      $(".approve-save").removeClass("disabled");
    },
    /**
     * permanently saves the datalist to the corpus, and all of its datums too.
     */
    saveDataList : function(){
      var self = this;
      this.createNewSession( function(){
        //after we have a session
        for(d in self.model.get("datumArray")){
          var thatdatum = self.model.get("datumArray")[d];
          thatdatum.set({
            "session" : self.model.get("session"),
            "corpusname" : self.model.get("corpusname")
          });

          thatdatum.set("dateEntered", JSON.stringify(new Date()));
          thatdatum.set("dateModified", JSON.stringify(new Date()));

          Utils.debug("Saving the Datum");
          thatdatum.changeCorpus(app.get("corpus").get("corpusname"), function(){
            thatdatum.save(null, {
              success : function(model, response) {
                Utils.debug('Datum save success in import');
                self.model.dataListView.addOne(model.id);
                
                // Add it to the default data list
                var defaultIndex = app.get("corpus").get("dataLists").length - 1;
                app.get("corpus").get("dataLists").models[defaultIndex].get("datumIds").unshift(model.id);
                
                // If the default data list is the currently visible data list, re-render it
                if (app.get("corpus").get("dataLists").models[defaultIndex].cid == app.get("corpus").get("dataLists").models[defaultIndex].cid) {
                  appView.dataListEditLeftSideView.addOne(model.id);
                }
              },
              error : function(e) {
                alert('Datum save failure in import' + e);
              }
            });
          });
        }
        
        // Save the default DataList
        Utils.debug("Saving the DataList");
        var defaultIndex = app.get("corpus").get("dataLists").length - 1;
        app.get("corpus").get("dataLists").models[defaultIndex].changeCorpus(self.model.get("corpusname"), function() {
          app.get("corpus").get("dataLists").models[defaultIndex].save();
          app.get("corpus").save();
        });
        
        // Save the new DataList
        self.model.get("dataList").changeCorpus(self.model.get("corpusname"), function(){
          self.model.get("dataList").save(null, {
            success : function(model, response) {
              Utils.debug('Data list save success in import');
              window.app.get("corpus").get("dataLists").unshift(self.model.get("dataList"));
              window.app.get("authentication").get("userPrivate").get("dataLists").push(self.model.get("dataList").id);
              self.model.dataListView.temporaryDataList = false;
            },
            error : function(e) {
              alert('Data list save failure in import' + e);
            }
          });
        });
      });
      window.app.router.showDashboard();
    },
    /**
     * For now just creating a session and saving it, not showing it to the user.
     * 
     * @param callback
     */
    createNewSession : function(callback){
      this.model.set("session", new Session({
        sessionFields : window.app.get("corpus").get("sessionFields").clone()
      }));
      
      this.model.get("session").get("sessionFields").where({
        label : "goal"
      })[0].set("value", "Goal from file import " + this.model.get("status"));
     
      this.model.get("session").get("sessionFields").where({
        label : "dateElicited"
      })[0].set("value", "Probably Prior to " + this.model.get("files")[0].lastModifiedDate ? this.model.get("files")[0].lastModifiedDate.toLocaleDateString()
          : 'n/a');
      
      var sessself = this;
      this.model.get("session").changeCorpus(this.model.get("corpusname"), function(){
        sessself.model.get("session").save(null, {
          success : function(model, response) {
            Utils.debug('Session save success in import');
          },
          error : function(e) {
            alert('Session save failure in import' + e);
          }
        });
      });
      if(typeof callback == "function"){
        callback();
      }
    },
    /*
     * Adds double the columns
     */
    insertDoubleColumnsInTable : function(){
      $('td').each(function(index) {
        $(this).after('<td contenteditable = "true"></td>');
      });
      $('th').each(function(index) {
        var tableCell = document.createElement("th");
        $(tableCell).html('<input class="drop-label-zone header"/>');
        tableCell.addEventListener('drop', this.dragLabelToColumn, false);
        tableCell.addEventListener('dragover', this.handleDragOver, false);
        $(this).after(tableCell);
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