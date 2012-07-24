define( [ 
    "backbone",
    "handlebars",
    "activity/Activity",
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
    Activity,
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
      if(this.model.get("dataList") != undefined){
        if(this.model.dataListView != undefined){
          this.model.dataListView.render();
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
            var newfield = new DatumField({
              label : headers[f],
              encrypted: "checked",
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
              n.set("value", value);
            }
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
      thatdatum.changeCorpus(app.get("corpus").get("corpusname"), function(){
        thatdatum.save(null, {
          success : function(model, response) {
            hub.publish("savedDatumToPouch",{d: d, message: " datum "+model.id});

            // Update progress bar
            $(".import-progress").val($(".import-progress").val()+1);

            // Add Datum to the new datalist and render it this should work
            // because the datum is saved in the pouch and can be fetched
            appView.dataListEditLeftSideView.addOneDatumId(model.id);

            // Add Datum to the default data list
            var defaultIndex = app.get("corpus").get("dataLists").length - 1;
            app.get("corpus").get("dataLists").models[defaultIndex].get("datumIds").unshift(model.id);
          },
          error : function(e) {
            hub.publish("saveDatumFailedToPouch",{d: d, message: "datum "+ JSON.stringify(e) });
          }
        });
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
      window.appView.renderEditableDataListViews();
      window.appView.dataListEditLeftSideView.renderFirstPage();// TODO why not do automatically in datalist?
      window.appView.renderReadonlyDataListViews();
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

        // Create a new permanent data list in the corpus
        appView.dataListEditLeftSideView.newDataList();

        // Bring the title and description from the temporary data list, to the
        // new one.
        app.get("corpus").get("dataLists").models[0].set({
          title: appView.importView.model.dataListView.model.get("title"),
          description: appView.importView.model.dataListView.model.get("description")
        });

        // import data in reverse order from normal so that the user will get
        // their data in the order they are used to.
//      for (var d = self.model.get("datumArray").length -1; d >= 0; d++) {

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
//          window.appView.toastUser("Import succedded "+arg.d+" : "+arg.message,"alert-success","Saved!");
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
        
        // Save the new DataList since we created it above, as the new leftside
        // data list, it will be in position 0
        app.get("corpus").get("dataLists").models[0].changeCorpus(app.get("corpus").get("corpusname"), function(){
          app.get("corpus").get("dataLists").models[0].save(null, {
            success : function(model, response) {
              Utils.debug('Data list save success in import');
              window.appView.toastUser("Sucessfully saved data list.","alert-success","Saved!");

              // Update the progress bar
              $(".import-progress").val($(".import-progress").val()+1);

              // Save the datalist ID in the userPrivate
              window.app.get("authentication").get("userPrivate").get("dataLists").unshift(model.id);

              // Mark the datalist as no longer temporary
              self.model.dataListView.temporaryDataList = false;

              window.app.get("authentication").get("userPrivate").get("activities").unshift(
                  new Activity({
                    verb : "added",
                    directobject : "data list "+model.get("title"),
                    indirectobject : "in "+window.app.get("corpus").get("title"),
                    context : "via Offline App",
                    user: window.app.get("authentication").get("userPublic")
                  }));

              // Save the session
              self.model.get("session").changeCorpus(self.model.get("corpusname"), function(){
                self.model.get("session").save(null, {
                  success : function(model, response) {
                    Utils.debug('Session save success in import');
                    window.appView.toastUser("Sucessfully saved session.","alert-success","Saved!");

                    // Update progress bar
                    $(".import-progress").val($(".import-progress").val()+1);

                    // Add the new session to the corpus
                    window.app.get("corpus").get("sessions").unshift(model);

                    // Add the new session to the userPrivate
                    if(window.app.get("authentication").get("userPrivate").get("sessionHistory").indexOf(model.id) == -1){
                      window.app.get("authentication").get("userPrivate").get("sessionHistory").unshift(model.id);
                    }

                    // Add the "added session" activity to the ActivityFeed
                    window.app.get("authentication").get("userPrivate").get("activities").unshift(
                        new Activity({
                          verb : "added",
                          directobject : "session "+model.get("sessionFields").where({label: "goal"})[0].get("value"),
                          indirectobject : "in "+window.app.get("corpus").get("title"),
                          context : "via Offline App",
                          user: window.app.get("authentication").get("userPublic")
                        }));

                   
                    // save the corpus
                    window.appView.corpusEditLeftSideView.updatePouch();

                    // save the user
                    window.app.get("authentication").saveAndEncryptUserToLocalStorage();
                    
                   

                  },
                  error : function(e) {
                    window.appView.toastUser("Error in saving session in import.","alert-danger","Not saved!");
                    alert('Session save failure in import' + e);
                  }
                });
              });

            },
            error : function(e) {
              window.appView.toastUser("Error in saving data list in import.","alert-danger","Not saved!");
              alert('Data list save failure in import' + e);
            }
          });
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
        })[0].set("value", "Goal from file import " + this.model.get("status"));
       
        this.model.get("session").get("sessionFields").where({
          label : "dateElicited"
        })[0].set("value", "Probably Prior to " + this.model.get("files")[0].lastModifiedDate ? this.model.get("files")[0].lastModifiedDate.toLocaleDateString()
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