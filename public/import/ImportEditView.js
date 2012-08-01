define( [ 
    "backbone",
    "handlebars",
    "activity/Activity",
    "import/Import",
    "data_list/DataList",
    "data_list/DataListEditView",
    "datum/Datum",
    "datum/Datums",
    "datum/DatumField",
    "datum/DatumFields",
    "datum/DatumReadView",
    "datum/DatumTag",
    "datum/Session",
    "app/PaginatedUpdatingCollectionView",
    "libs/Utils"

], function(
    Backbone,
    Handlebars, 
    Activity,
    Import,
    DataList,
    DataListEditView,
    Datum,
    Datums,
    DatumField,
    DatumFields,
    DatumReadView,
    DatumTag,
    Session,
    PaginatedUpdatingCollectionView

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
      "click .add-column" : "insertDoubleColumnsInTable",
      "blur .export-large-textarea" : "updateRawText"
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
      $(".import-progress").val(1);
      $(".import-progress").attr("max", 4);

    },
    
    model : Import,
    template: Handlebars.templates.import_edit_fullscreen,
    updateRawText : function(){
      this.model.set("rawText", $(".export-large-textarea").val());
      this.model.guessFormatAndImport();
    },
    render : function() {
      this.setElement("#import-fullscreen");
      $(this.el).html(this.template(this.model.toJSON()));
      if(this.dataListView != undefined){
        this.dataListView.format = "import";
        this.dataListView.render();
        if(this.importPaginatedDataListDatumsView){
          this.importPaginatedDataListDatumsView.renderInElement(
              $("#import-data-list").find(".import-data-list-paginated-view") );
        }
      }
      if(this.model.get("asCSV") != undefined){
        this.showCSVTable();
        this.renderDatumFieldsLabels();
      }
      $(this.el).find(".icon-book").hide();
      $(this.el).find(".icon-resize-full").hide();
      $(this.el).find(".save-datalist").hide();
      $(this.el).find(".icon-resize-small").hide();
      
      //localization
      $(".locale_Save_And_Import").html(chrome.i18n.getMessage("locale_Save_And_Import"));
      $(".locale_Import").html(chrome.i18n.getMessage("locale_Import"));
      $(".locale_percent_completed").html(chrome.i18n.getMessage("locale_percent_completed"));
      $(".locale_Import_Instructions").html(chrome.i18n.getMessage("locale_Import_Instructions"));
      $(".locale_Add_Extra_Columns").html(chrome.i18n.getMessage("locale_Add_Extra_Columns"));
      $(".locale_Attempt_Import").html(chrome.i18n.getMessage("locale_Attempt_Import"));
      $(".locale_Drag_and_Drop_Placeholder").attr("placeholder", chrome.i18n.getMessage("locale_Drag_and_Drop_Placeholder"));
      
      
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
        $(".import-progress").attr("max", parseInt($(".import-progress").attr("max"))+1);
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
      $(".import-progress").attr("max", parseInt($(".import-progress").attr("max"))+1);

      //add date
      var x = document.createElement("span");
      x.classList.add("label");
      x.classList.add(colors[colorindex%colors.length]);
      x.draggable="true";
      x.innerHTML = "dateElicited";
      x.addEventListener('dragover', this.handleDragStart, false);
      colorindex++;
      $("#import-datum-field-labels").append(x);
      $(".import-progress").attr("max", parseInt($(".import-progress").attr("max"))+1);
      
    //add checkedWithConsultant
      var x = document.createElement("span");
      x.classList.add("label");
      x.classList.add(colors[colorindex%colors.length]);
      x.draggable="true";
      x.innerHTML = "checkedWithConsultant";
      x.addEventListener('dragover', this.handleDragStart, false);
      colorindex++;
      $("#import-datum-field-labels").append(x);
      $(".import-progress").attr("max", parseInt($(".import-progress").attr("max"))+1);
    },
    showCSVTable : function(rows){
      $(".import-progress").val($(".import-progress").val()+1);
      $(".approve-save").html("Save and Finish Importing")
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
      var extractedHeader = this.model.get("extractedHeader");
      for(var i = 0; i < rows[0].length; i++){
        var tableCell = document.createElement("th");
        var headercelltext = "";
        if(extractedHeader){
          headercelltext = extractedHeader[i];
        }
        $(tableCell).html('<input type="text" class="drop-label-zone header'+i+'" value="'+headercelltext+'"/>');
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
      $(".import-progress").val($(".import-progress").val()+1);

      /* clear out the data list views and datum views
       * 
       * Copied from SearchEditView 
       */
      if( this.importPaginatedDataListDatumsView ){
        this.importPaginatedDataListDatumsView.remove(); //backbone to remove from dom
        var coll = this.importPaginatedDataListDatumsView.collection; //try to be sure the collection is empty
        //this.importPaginatedDataListDatumsView.collection.reset(); could also use backbone's reset which will empty the collection, or fill it with a new group.
        while (coll.length > 0) {
          coll.pop();
        }
        delete this.importPaginatedDataListDatumsView.collection;
        delete this.importPaginatedDataListDatumsView; //tell garbage collecter we arent using it
      }
      /*
       * This holds the ordered datums of the temp import data list
       */
      this.importPaginatedDataListDatumsView = new PaginatedUpdatingCollectionView({
        collection           : new Datums(),
        childViewConstructor : DatumReadView,
        childViewTagName     : "li",
        childViewFormat      : "latex"
      }); 

      if(this.dataListView){
        this.dataListView.destroy_view();
        delete this.dataListView.model; //tell the garbage collector we are done.
      }
      
      var filename = " typing/copy paste into text area";
      var descript = "This is the data list which results from the import of the text typed/pasted in the import text area."
      try {
        filename = this.model.files[0].name;
        descript = "This is the data list which results from the import of these files." + this.model.get("fileDetails");
      }catch(e){
        //do nothing
      }
      
      this.dataListView = new DataListEditView({
        model : new DataList({
          "corpusname" : window.app.get("corpus").get("corpusname"),
          "title" : "Data from "+filename,
          "description": descript
        }),
      }); 
      this.dataListView.format = "import";
      this.dataListView.render();
      this.importPaginatedDataListDatumsView.renderInElement(
        $("#import-data-list").find(".import-data-list-paginated-view") );
      
      /* end views set up */
      
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
            var newfield = new DatumField({
              label : headers[f],
              shouldBeEncrypted: "checked",
              userchooseable: "",
              help: "This field came from file import "+this.model.get("status")
            });
            this.model.get("datumFields").add(newfield);
            window.app.get("corpus").get("datumFields").add(newfield);
          }
        }
      }
      
      /*
       * Cycle through all the rows in table and create a datum with the matching fields.
       */
      var array = [];
      try{
        //Import from html table that the user might have edited.
        $('tr').has('td').each(function() {
          var datumObject = {};
          $('td', $(this)).each(function(index, item) {
            datumObject[headers[index]] = $(item).html();
          });
          array.push(datumObject);
        });
      }catch(e){
        //Import from the array instead of using jquery and html
        alert(JSON.stringify(e));
        var rows = this.model.get("asCSV");
        for(var r in rows){
          var datumObject = {};
          for( var c in headers){
            datumObject[headers[c]] = rows[r][c];
          }
          array.push(datumObject);
        }
      }
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
          }
          //TODO turn the checkedwithconsultant into a checked, with that string as the person
//          else if (index == "checkedWithConsultant") {
//            var consultants = value.split(" ");
//            for(g in consultants){
//              var c = new UserMask({
//                "username" : consultants[g]
//              });
//              var state = new DatumState({consultant: c});
//              d.get("datumStates").add(state);
//            }
//          }
          else{
            var n = fields.where({label: index})[0];
            if(n != undefined){
//              console.log(value);
//              console.log(index);
              n.set("mask", value);
            }
          }
        });
        d.set("datumFields", fields);
        var states = window.app.get("corpus").get("datumStates").clone();
        d.set("datumStates", states);
        
        //these are temp datums, dont save them until the user saves the data list
        this.importPaginatedDataListDatumsView.collection.add(d);
//        this.dataListView.model.get("datumIds").push(d.id);

        this.model.get("datumArray").push(d);
      }
      $(".approve-save").removeAttr("disabled");
      $(".approve-save").removeClass("disabled");
    },
    savedcount : 0,
    savedindex : [],
    savefailedcount : 0,
    savefailedindex : [],
    nextsavedatum : 0,
    saveADatumAndLoop : function(d){
      var thatdatum = this.model.get("datumArray")[d];
      thatdatum.set({
        "session" : this.model.get("session"),
        "corpusname" : this.model.get("corpusname"),
        "dateEntered" : JSON.stringify(new Date()),
        "dateModified" : JSON.stringify(new Date())
      });
      
      thatdatum.saveAndInterConnectInApp(function(){
        hub.publish("savedDatumToPouch",{d: d, message: " datum "+thatdatum.id});

        // Update progress bar
        $(".import-progress").val($(".import-progress").val()+1);
     
        // Add Datum to the new datalist and render it this should work
        // because the datum is saved in the pouch and can be fetched, 
        // this will also not be the default data list because has been replaced by the data list for this import
        window.appView.currentPaginatedDataListDatumsView.collection.add(thatdatum);
        window.app.get("currentDataList").get("datumIds").push(thatdatum.id);

      },function(){
        //The e error should be from the error callback
        if(!e){
          e = {};
        }
        hub.publish("saveDatumFailedToPouch",{d: d, message: "datum "+ JSON.stringify(e) });
      });
    },
    importCompleted : function(){
      window.appView.toastUser( this.savedcount + " of your "
          +this.model.get("datumArray").length 
          +" datum have been imported. "
          +this.savefailedcount+" didn't import. "
          ,"alert-success","Import successful:");

      // Add the "imported" activity to the ActivityFeed
      window.app.get("authentication").get("userPrivate").get("activities").unshift(
          new Activity({
            verb : "imported",
            directobject : this.savedcount + " data entries",
            indirectobject : "in "+window.app.get("corpus").get("title"),
            context : "via Offline App",
            user: window.app.get("authentication").get("userPublic")
          }));

      window.hub.unsubscribe("savedDatumToPouch", null, window.appView.importView);
      window.hub.unsubscribe("saveDatumFailedToPouch", null, window.appView.importView);
      
      // Render the first page of the new data list
      this.currentReadDataListView.format = "leftSide";
      window.appView.currentReadDataListView.render();
//      window.appView.cur?`rentEditDataListView.renderFirstPage();// TODO why not do automatically in datalist?
//      window.appView.renderReadonlyDataListViews();
//    window.appView.dataListReadLeftSideView.renderFirstPage(); //TODO read data
//    lists dont have this function, should we put it in...
      
      $(".import-progress").val( $(".import-progress").attr("max") );
      $(".approve-save").html("Finished");
      
      // Go back to the dashboard while saving datum in the background
      window.location.replace("#");
    },
    /**
     * permanently saves the datalist to the corpus, and all of its datums too.
     */
    saveDataList : function(){
      var self = this;
      this.createNewSession( function(){
        window.hub.unsubscribe("savedDatumToPouch", null, window.appView.importView);
        window.hub.unsubscribe("saveDatumFailedToPouch", null, window.appView.importView);
        
        // after we have a session
        $(".approve-save").addClass("disabled");
        // add the datums to the progress bar, so that we can augment for each
        // that is saved.
        $(".import-progress").attr("max", parseInt($(".import-progress").attr("max")) + parseInt(self.model.get("datumArray").length));

        var dl = new DataList({
          "corpusname" : window.app.get("corpus").get("corpusname"),
          "title" : appView.importView.dataListView.model.get("title"),
          "description": appView.importView.dataListView.model.get("description")
        });
        dl.saveAndInterConnectInApp(function(){
          dl.setAsCurrentDataList(function(){
            
            // Update the progress bar, one more thing is done.
            $(".import-progress").val($(".import-progress").val()+1);
            
         // Add the "imported" activity to the ActivityFeed
            window.app.get("authentication").get("userPrivate").get("activities").unshift(
                new Activity({
                  verb : "attempted to import",
                  directobject : window.appView.importView.model.get("datumArray").length + " data entries",
                  indirectobject : "in "+window.app.get("corpus").get("title"),
                  context : "via Offline App",
                  user: window.app.get("authentication").get("userPublic")
                }));

            window.hub.subscribe("savedDatumToPouch", function(arg){
              this.savedindex[arg.d] = true;
              this.savedcount++;
//            window.appView.toastUser("Import succedded "+arg.d+" : "+arg.message,"alert-success","Saved!");
              if( arg.d <= 0 ){
                /*
                 * If we are at the final index in the import's datum
                 */
                this.importCompleted();
              }else{
                /*
                 * Save another datum when the previous succeeds
                 */
                var next = parseInt(arg.d) - 1;
                this.saveADatumAndLoop(next);
              }
            }, window.appView.importView);

            window.hub.subscribe("saveDatumFailedToPouch",function(arg){
              this.savefailedindex[arg.d] = false; //this.model.get("datumArray")[arg.d];
              this.savefailedcount++;
              window.appView.toastUser("Import failed "+arg.d+" : "+arg.message,"alert-danger","Failure:");

              if( arg.d <= 0 ){
                /*
                 * If we are at the final index in the import's datum
                 */
                this.importCompleted();
              }else{
                /*
                 * Save another datum when the previous fails
                 */
                var next = parseInt(arg.d) - 1;
                this.saveADatumAndLoop(next);
              }

            }, window.appView.importView);
            
            /*
             * Begin the datum saving loop with the last datum 
             */
            window.appView.importView.saveADatumAndLoop(window.appView.importView.model.get("datumArray").length - 1);
            
            window.appView.importView.model.get("session").saveAndInterConnectInApp(function(){
              //one more thing done.
              $(".import-progress").val($(".import-progress").val()+1);
            }, function(){
              alert("Bug: Import session save failed. ");
            });
            
            /* end successful save of datalist and session */
            
          },function(){
            alert("Bug: couldnt set the import data list as the current data list.");
          });
        },function(){
          alert("Bug: couldnt save the import datalist.");
        });
      });
    },
    /**
     * For now just creating a session and saving it, not showing it to the user.
     * 
     * @param callback
     */
    createNewSession : function(callback){
      if(this.model.get("session") == undefined){
        this.model.set("session", new Session({
          sessionFields : window.app.get("corpus").get("sessionFields").clone()
        }));
        
        this.model.get("session").get("sessionFields").where({
          label : "goal"
        })[0].set("mask", "Goal from file import " + this.model.get("status"));
       
        this.model.get("session").get("sessionFields").where({
          label : "dateElicited"
        })[0].set("mask", "Probably Prior to " + this.model.get("files")[0].lastModifiedDate ? this.model.get("files")[0].lastModifiedDate.toLocaleDateString()
            : 'n/a');
      }
      
      //DONT save now, save only when import is approved.
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
        $(tableCell).html('<input type="text" class="drop-label-zone header"/>');
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

      //if not already dragging, do a drag start
      if(window.appView.importView.dragSrcEl == null){
        window.appView.importView.dragSrcEl = this;
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
      }
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
        window.appView.importView.dragSrcEl = null;
        $(".import-progress").val($(".import-progress").val()+1);
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