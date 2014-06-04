define( [
    "backbone",
    "handlebars",
    "audio_video/AudioVideo",
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
    "datum/SessionEditView",
    "app/PaginatedUpdatingCollectionView",
    "app/UpdatingCollectionView",
    "OPrime"

], function(
    Backbone,
    Handlebars,
    AudioVideo,
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
    SessionEditView,
    PaginatedUpdatingCollectionView,
    UpdatingCollectionView

) {
  /**
   * https://gist.github.com/1488561
   */
  var ImportEditView = Backbone.View.extend({
    initialize : function(){
      this.model.bind("change:asCSV", this.render, this);

      this._draghoverClassAdded = false;
      var datumToCauseCorpusToUpdate = new Datum();
    },
    events : {
      "click .approve-save" : "saveDataList",
      "click .approve-import" : function(e){
        e.preventDefault();
        $("#import-third-step").removeClass("hidden");
        this.convertTableIntoDataList();
      },
       /*event listeners for the import from dropdown menu  */
      "click #format-csv" : function(e){
        e.preventDefault();
//          this.updateRawText();
        var text = $(".export-large-textarea").val();
          this.model.importCSV(text, this.model);
          this.showSecondStep();
      },
      "click #format-tabbed" : function(e){
        e.preventDefault();
        var text = $(".export-large-textarea").val();
          this.model.importTabbed(text, this.model);
          this.showSecondStep();
      },
      "click #format-xml" : function(e){
        e.preventDefault();
        var text = $(".export-large-textarea").val();
          this.model.importXML(text, this.model);
          this.showSecondStep();
      },
      "click #format-elanxml" : function(e){
        e.preventDefault();
        var text = $(".export-large-textarea").val();
          this.model.importElanXML(text, this.model);
          this.showSecondStep();
      },
      "click #format-toolbox" : function(e){
        e.preventDefault();
        var text = $(".export-large-textarea").val();
          this.model.importToolbox(text, this.model);
          this.showSecondStep();
      },
      "click #format-praat" : function(e){
        e.preventDefault();
        var text = $(".export-large-textarea").val();
          this.model.importTextGrid(text, this.model);
          this.showSecondStep();
      },
      "click #format-latex" : function(e){
        e.preventDefault();
        var text = $(".export-large-textarea").val();
          this.model.importLatex(text, this.model);
          this.showSecondStep();
      },
      "click #format-handout" : function(e){
        e.preventDefault();
        var text = $(".export-large-textarea").val();
          this.model.importText(text, this.model);
          this.showSecondStep();
      },

      "click .icon-resize-small" : function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        window.location.href = "#render/true";
      },
      "submit #uploadAudioForTextGridform": function(e) {
        if (e) {
          e.stopPropagation();
          e.preventDefault();
        }

        //get the action-url of the form
        var actionurl = e.currentTarget.action;
        var data = new FormData();
        jQuery.each($('#uploadAudioForTextGridformFiles')[0].files, function(i, file) {
          data.append(i, file);
        });
        data.append("token", "testinguploadtoken");
        data.append("pouchname", this.model.get("pouchname"));
        data.append("username", window.app.get("authentication").get("userPrivate").get("username"));
        data.append("returnTextGrid", true);
        this.model.get("audioVideo").reset();
        var self = this;
        $.ajax({
          url: actionurl,
          type: 'post',
          // dataType: 'json',
          cache: false,
          contentType: false,
          processData: false,
          data: data,
          success: function(results) {
            if (results && results.status === 200) {
              self.model.set("uploadDetails", results);
              self.model.set("files", results.files);
              self.model.set("status", "File(s) uploaded and utterances were extracted.");
              var messages = [];
              self.model.set("rawText","");
              /* Check for any textgrids which failed */
              for (var fileIndex = 0; fileIndex < results.files.length; fileIndex++) {
                if (results.files[fileIndex].textGridStatus >= 400) {
                  console.log(results.files[fileIndex]);
                  var instructions = instructions = results.files[fileIndex].textGridInfo;
                  if(results.files[fileIndex].textGridStatus >= 500){
                    instructions = " Please report this error to us at support@lingsync.org ";
                  }
                  messages.push("Generating the textgrid for " + results.files[fileIndex].fileBaseName + " seems to have failed. "+instructions);
                } else {
                  self.model.addAudioVideoFile(OPrime.audioUrl + "/" + self.model.get("pouchname") + "/" + results.files[fileIndex].fileBaseName + '.mp3');
                  self.model.downloadTextGrid(results.files[fileIndex]);
                }
              }
              if (messages.length > 0) {
                self.model.set("status", messages.join(", "));
                $(self.el).find(".status").html(self.model.get("status"));
                window.appView.toastUser(messages.join(", "), "alert-danger", "Import:");
              }
            } else {
              console.log(results);
              var message = "Upload might have failed to complete processing on your file(s). Please report this error to us at support@lingsync.org ";
              self.model.set("status", message + ": " + JSON.stringify(results));
              window.appView.toastUser(message, "alert-danger", "Import:");
            }
            $(self.el).find(".status").html(self.model.get("status"));
          },
          error: function(response) {
            var reason = {};
            if (response && response.responseJSON) {
              reason = response.responseJSON;
            } else {
              var message = "Error contacting the server. ";
              if (response.status >= 500) {
                message = message + " Please report this error to us at support@lingsync.org ";
              } else if (response.status === 413) {
                message = message + " Your file is too big for upload, please try using FFMpeg to convert it to an mp3 for upload (you can still use your original video/audio in the app when the utterance chunking is done on an mp3.) ";
              } else {
                message = message + " Are you offline? If you are online and you still recieve this error, please report it to us: ";
              }
              reason = {
                status: response.status,
                userFriendlyErrors: [message + response.status]
              };
            }
            console.log(reason);
            if (reason && reason.userFriendlyErrors) {
              self.model.set("status", "Upload error: " + reason.userFriendlyErrors.join(" "));
              window.appView.toastUser(reason.userFriendlyErrors.join(" "), "alert-danger", "Import:");
              $(self.el).find(".status").html(self.model.get("status"));
            }
          }
        });
        this.model.set("status", "Contacting server...");
        $(this.el).find(".status").html(this.model.get("status"));
      },
      /* event listeners for the drag and drop import of files */
      "dragover .drop-zone" : "_dragOverEvent",
      "dragenter .drop-zone" : "_dragEnterEvent",
      "dragleave .drop-zone" : "_dragLeaveEvent",
      "drop .drop-zone" : "_dropEvent",
      "drop .drop-label-zone" : "_dropLabelEvent",
      "click .add-column" : "insertDoubleColumnsInTable",
      "blur .export-large-textarea" : "updateRawText"
    },
    _dragOverEvent : function(e) {
      if (e.preventDefault)
        e.preventDefault();
      if (e.originalEvent)
        e = e.originalEvent;
      var data = this._getCurrentDragData(e);

      if (this.dragOver(data, e.dataTransfer, e) !== false) {
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

      if (this._draghoverClassAdded){
        $(e.target).removeClass("draghover");
      }

      this.drop(data, e.dataTransfer, e);
    },
    _dropLabelEvent: function (e) {
      if (e.originalEvent) e = e.originalEvent;
      var data = this._getCurrentDragData(e);

      if (e.preventDefault) e.preventDefault();
      if (e.stopPropagation) e.stopPropagation(); // stops the browser from redirecting

      if (this._draghoverClassAdded) {
        $(e.target).removeClass("draghover");
      }

//      this.drop(data, e.dataTransfer, e);
    },
    _getCurrentDragData: function (e) {
      var data = null;
      if (window._backboneDragDropObject) {
        data = window._backboneDragDropObject;
      }
      return data;
    },

    dragOver: function (data, dataTransfer, e) { // optionally override me and set dataTransfer.dropEffect, return false if the data is not droppable
      $(e.target).addClass("draghover");
      this._draghoverClassAdded = true;
    },

    dragLeave: function (data, dataTransfer, e) { // optionally override me
      if (this._draghoverClassAdded) {
        $(e.target).removeClass("draghover");
      }
    },

    drop: function (data, dataTransfer, e) {
      (function(){
        var self = window.appView.importView.model;
        if (OPrime.debugMode) OPrime.debug("Recieved drop of files.");
        self.set("files", dataTransfer.files);
        self.readFiles();
      })();
      $(".import-progress").val(1);
      $(".import-progress").attr("max", 4);

    },

    model : Import,
    template: Handlebars.templates.import_edit_fullscreen,
    updateRawText : function(){
      this.model.set("rawText", $(".export-large-textarea").val());
      this.model.guessFormatAndImport();
      this.showSecondStep();
    },
    render : function() {
      this.setElement("#import-fullscreen");

      var jsonToRender = this.model.toJSON();
      jsonToRender.locale_Add_Extra_Columns = Locale.get("locale_Add_Extra_Columns");
      jsonToRender.locale_Attempt_Import = Locale.get("locale_Attempt_Import");
      jsonToRender.locale_Drag_and_Drop_Placeholder = Locale.get("locale_Drag_and_Drop_Placeholder");
      jsonToRender.locale_Import = Locale.get("locale_Import");
      jsonToRender.locale_Import_First_Step = Locale.get("locale_Import_First_Step");
      jsonToRender.locale_Import_Instructions = Locale.get("locale_Import_Instructions");
      jsonToRender.locale_Import_Second_Step = Locale.get("locale_Import_Second_Step");
      jsonToRender.locale_Import_Third_Step = Locale.get("locale_Import_Third_Step");
      jsonToRender.locale_Save_And_Import = Locale.get("locale_Save_And_Import");
      jsonToRender.locale_percent_completed = Locale.get("locale_percent_completed");

      jsonToRender.audioServerUrl = OPrime.audioUrl;
      // jsonToRender.username = window.app.get("authentication").get("userPrivate").get("username");
      // jsonToRender.audiouploadtoken = "testingaudiotoken";

      $(this.el).html(this.template(jsonToRender));

      if(this.dataListView != undefined){
        this.dataListView.format = "import";
        this.dataListView.render();
        if(this.importPaginatedDataListDatumsView){
          this.importPaginatedDataListDatumsView.renderInElement(
              $("#import-data-list").find(".import-data-list-paginated-view") );
        }
      }

      if(this.model.get("session") != undefined){
        if(this.sessionView){
          this.sessionView.destroy_view();
        }
        this.sessionView = new SessionEditView({
          model : this.model.get("session")
        });
        this.sessionView.format = "import";
        this.sessionView.render();
      }

      if(this.model.get("asCSV") != undefined){
        this.showCSVTable();
        this.renderDatumFieldsLabels();
        this.showSecondStep();
      }

      return this;
    },
    renderDatumFieldsLabels : function(){
      if(this.model.get("datumFields") == undefined){
        return;
      }
      var colors= ["label-info","label-inverse","label-success","label-warning","label-important"];
      var colorindex = 0;
      $("#import-datum-field-labels").html("");//Locale.get("locale_Drag_Fields_Instructions"));
      for(i in this.model.get("datumFields").models){
        var x = document.createElement("span");
        x.classList.add("pull-left");
        x.classList.add("label");
        x.classList.add(colors[colorindex%colors.length]);
        x.draggable="true";
        x.innerHTML = this.model.get("datumFields").models[i].get("label");
        x.addEventListener('dragstart', this.handleDragStart);
        colorindex++;
        $("#import-datum-field-labels").append(x);
        $(".import-progress").attr("max", parseInt($(".import-progress").attr("max"))+1);
      }

      //add tags
//      var x = document.createElement("span");
//      x.classList.add("pull-left");
//      x.classList.add("label");
//      x.classList.add(colors[colorindex%colors.length]);
//      x.draggable="true";
//      x.innerHTML = "datumTags";
//      x.addEventListener('dragstart', this.handleDragStart);
//      colorindex++;
//      $("#import-datum-field-labels").append(x);
//      $(".import-progress").attr("max", parseInt($(".import-progress").attr("max"))+1);

      //add date
      var x = document.createElement("span");
      x.classList.add("pull-left");
      x.classList.add("label");
      x.classList.add(colors[colorindex%colors.length]);
      x.draggable="true";
      x.innerHTML = "dateElicited";
      x.addEventListener('dragstart', this.handleDragStart);
      colorindex++;
      $("#import-datum-field-labels").append(x);
      $(".import-progress").attr("max", parseInt($(".import-progress").attr("max"))+1);

    //add CheckedWithConsultant
      var x = document.createElement("span");
      x.classList.add("pull-left");
      x.classList.add("label");
      x.classList.add("label-success");
      x.draggable="true";
      x.innerHTML = "CheckedWithConsultant";
      x.addEventListener('dragstart', this.handleDragStart);
      colorindex++;
      $("#import-datum-field-labels").append(x);
      $(".import-progress").attr("max", parseInt($(".import-progress").attr("max"))+1);

    //add ToBeCheckedWithConsultant
      var x = document.createElement("span");
      x.classList.add("pull-left");
      x.classList.add("label");
      x.classList.add("label-warning");
      x.draggable="true";
      x.innerHTML = "ToBeCheckedWithConsultant";
      x.addEventListener('dragstart', this.handleDragStart);
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
        $(tableCell).find("input")[0].addEventListener('drop', this.dragLabelToColumn);
        $(tableCell).find("input")[0].addEventListener('dragover', this.handleDragOver);
        $(tableCell).find("input")[0].addEventListener('dragleave', function(){
          $(this).removeClass("over");
        } );
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
      this.model.set("datumArray", []);
      this.model.get("session").setConsultants(this.model.get("consultants"));
      var consultantsInThisImportSession = [];
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
        childViewFormat      : "latex",
        childViewClass       : "row span11"
      });

      if(this.dataListView){
        this.dataListView.destroy_view();
        delete this.dataListView.model; //tell the garbage collector we are done.
      }

      var filename = " typing/copy paste into text area";
      var descript = "This is the data list which results from the import of the text typed/pasted in the import text area.";
      try {
        filename = this.model.get("files").map(function(file){
          return file.name;
        }).join(", ");
        descript = "This is the data list which results from the import of these file(s). " + this.model.get("fileDetails");
      }catch(e){
        //do nothing
      }

      this.dataListView = new DataListEditView({
        model : new DataList({
          "pouchname" : window.app.get("corpus").get("pouchname"),
          "title" : "Data from "+filename,
          "description": descript,
          "audioVideo": this.model.get("audioVideo")
        }),
      });
      this.dataListView.format = "import";
      this.dataListView.render();
      this.importPaginatedDataListDatumsView.renderInElement(
        $("#import-data-list").find(".import-data-list-paginated-view") );


      if(this.model.get("session") != undefined){
        if(this.sessionView){
          this.sessionView.destroy_view();
        }
        /* put metadata in the session goals */
        var sessionGoal = this.model.get("session").get("sessionFields").where({
            label : "goal"
          })[0];
        if(sessionGoal){
          sessionGoal.set("mask", this.model.metadataLines.join("\n") + "\n"+ sessionGoal.get("mask") );
        }
        this.sessionView = new SessionEditView({
          model : this.model.get("session")
        });
        this.sessionView.format = "import";
        this.sessionView.render();
      }
      /* end views set up */

      this.model.set("datumArray", []);
      var headers = [];
      $("#csv-table-area").find('th').each(function(index, item) {
        var newDatumFieldLabel = $(item).find(".drop-label-zone").val().replace(/[-\"'+=?.*&^%,\/\[\]{}() ]/g,"");
        if(!newDatumFieldLabel){
          return;
        }
        if(headers.indexOf(newDatumFieldLabel) >= 0){
          OPrime.bug("You seem to have some column labels that are duplicated" +
              " (the same label on two columns). This will result in a strange " +
              "import where only the second of the two will be used in the import. " +
          "Is this really what you want?.");
        }
        headers[index] = newDatumFieldLabel;
      });
      /*
       * Create new datum fields for new columns
       */
      for(f in headers){
        if (headers[f] == "" || headers[f] == undefined) {
          //do nothing
        } else if (headers[f] == "CheckedWithConsultant") {
          // do nothing
        } else if (headers[f] == "ToBeCheckedWithConsultant") {
          // do nothing
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
        $("#csv-table-area").find('tr').has('td').each(function() {
          var datumObject = {};
          var testForEmptyness = "";
          $('td', $(this)).each(function(index, item) {
            var newfieldValue = $(item).html().trim();
            /*
             * the import sometimes inserts &nbsp into the data,
             * often when the csv detection didnt work. This might
             * slow import down significantly. i tested it, it looks
             * like this isnt happening to the data anymore so i
             * turned this off, but if we notice &nbsp in the
             * datagain we can turn it back on . for #855
             */
//            if(newfieldValue.indexOf("&nbsp;") >= 0 ){
//              OPrime.bug("It seems like the line contiaining : "+newfieldValue+" : was badly recognized in the table import. You might want to take a look at the table and edit the data so it is in columns that you expected.");
//            }
            datumObject[headers[index]] = $(item).html().trim();
            testForEmptyness += $(item).html();
          });
          //if the table row has more than 2 non-white space characters, enter it as data
          if(testForEmptyness.replace(/[ \t\n]/g,"").length >= 2){
            array.push(datumObject);
          }else{
            //dont add blank datum
            if (OPrime.debugMode) OPrime.debug("Didn't add a blank row:"+ testForEmptyness+ ": ");
          }
        });
      }catch(e){
        //Import from the array instead of using jquery and html
        alert(JSON.stringify(e));
        var rows = this.model.get("asCSV");
        for(var r in rows){
          var datumObject = {};
          var testForEmptyness = "";
          for( var c in headers){
            datumObject[headers[c]] = rows[r][c];
            testForEmptyness += rows[r][c];
          }
        //if the table row has more than 2 non-white space characters, enter it as data
          if(testForEmptyness.replace(/\W/g,"").length >= 2){
            array.push(datumObject);
          }else{
            //dont add blank datum
            if (OPrime.debugMode) OPrime.debug("Didn't add a blank row:"+ testForEmptyness+ ": ");
          }
        }
      }

      /*
       * after building an array of datumobjects, turn them into backbone objects
       */
      for (a in array) {
        var d = new Datum({
          filledWithDefaults : true,
          pouchname : window.app.get("corpus").get("pouchname")
        });
      //copy the corpus's datum fields and empty them.
        var datumfields = app.get("corpus").get("datumFields").toJSON();
        for(var x in datumfields){
          datumfields[x].mask = "";
          datumfields[x].value = "";
        }
        var fields = new DatumFields(datumfields);
        var audioVideo = null;
        var audioFileDescriptionsKeyedByFilename = {};
        if(this.model.get("files") && this.model.get("files").map){
          this.model.get("files").map(function(fileDetails){
            var details = JSON.parse(JSON.stringify(fileDetails));
            delete details.textgrid;
            audioFileDescriptionsKeyedByFilename[fileDetails.fileBaseName + ".mp3"] = details;
          });
        }

        $.each(array[a], function(index, value) {
          if(index == "" || index == undefined){
            //do nothing
          }
          /* TODO removing old tag code for */
//          else if (index == "datumTags") {
//            var tags = value.split(" ");
//            for(g in tags){
//              var t = new DatumTag({
//                "tag" : tags[g]
//              });
//              d.get("datumTags").add(t);
//            }
//          }
          /* turn the CheckedWithConsultant and ToBeCheckedWithConsultantinto columns into a status, with that string as the person */
          else if (index.toLowerCase().indexOf("checkedwithconsultant") >-1 ) {
            var consultants = [];
            if (value.indexOf(",") > -1) {
              consultants = value.split(",");
            } else if (value.indexOf(";") > -1) {
              consultants = value.split(";");
            } else {
              consultants = value.split(" ");
            }
            var validationStati = [];
            for(g in consultants){
              var consultantusername = consultants[g].toLowerCase();
              consultantsInThisImportSession.push(consultantusername);
              if(!consultantusername){
                continue;
              }
              var validationType = "CheckedWith";
              var validationColor = "success";
              if(index.toLowerCase().indexOf("ToBeChecked") > -1){
                validationType = "ToBeCheckedWith";
                validationColor = "warning";
              }

              var validationString = validationType + consultants[g].replace(/[- _.]/g,"");
              validationStati.push(validationString);
              var n = fields.where({label: "validationStatus"})[0];
              /* add to any exisitng validation states */
              var validationStatus = n.get("mask") || "";
              validationStatus = validationStatus + " ";
              validationStatus = validationStatus + validationStati.join(" ");
              var uniqueStati = _.unique(validationStatus.trim().split(" "));
              n.set("mask", uniqueStati.join(" "));

//              ROUGH DRAFT of adding CONSULTANTS logic TODO do this in the angular app, dont bother with the backbone app
//              /* get the initials from the data */
//              var consultantCode = consultants[g].replace(/[a-z -]/g,"");
//              if(consultantusername.length == 2){
//                consultantCode = consultantusername;
//              }
//              if(consultantCode.length < 2){
//                consultantCode = consultantCode+"C";
//              }
//              var c = new Consultant("username", consultantCode);
//              /* use the value in the cell for the checked with state, but don't keep the spaces */
//              var validationType = "CheckedWith";
//              if(index.toLowerCase().indexOf("ToBeChecked") > -1){
//                validationType = "ToBeCheckedWith";
//              }
//              /*
//               * This function uses the consultant code to create a new validation status
//               */
//              var onceWeGetTheConsultant = function(){
//                var validationString = validationType+consultants[g].replace(/ /g,"");
//                validationStati.push(validationString);
//                var n = fields.where({label: "validationStatus"})[0];
//                if(n != undefined){
//                  /* add to any exisitng validation states */
//                  var validationStatus = n.get("mask") || "";
//                  validationStatus = validationStatus + " ";
//                  validationStatus = validationStatus + validationStati.join(" ");
//                  var uniqueStati = _.unique(validationStatus.trim().split(" "));
//                  n.set("mask", uniqueStati.join(" "));
//                }
//              };
//              /*
//               * This function creates a consultant code and then calls
//               * onceWeGetTheConsultant to create a new validation status
//               */
//              var callIfItsANewConsultant = function(){
//                var dialect =  "";
//                var language =  "";
//                try{
//                  dialect = fields.where({label: "dialect"})[0] || "";
//                  language = fields.where({label: "language"})[0] || "";
//                }catch(e){
//                  OPrime.debug("Couldn't get this consultant's dialect or language");
//                }
//                c = new Consultant({filledWithDefaults: true});
//                c.set("username", Date.now());
//                if(dialect)
//                  c.set("dialect", dialect);
//                if(dialect)
//                  c.set("language", language);
//
//                onceWeGetTheConsultant();
//              };
//              c.fetch({
//                success : function(model, response, options) {
//                  onceWeGetTheConsultant();
//                },
//                error : function(model, xhr, options) {
//                  callIfItsANewConsultant();
//                }
//              });


            }
          } else if(index == "validationStatus" ) {
            var n = fields.where({label: index})[0];
            if(n != undefined){
              /* add to any exisitng validation states */
              var validationStatus = n.get("mask") || "";
              validationStatus = validationStatus + " ";
              validationStatus = validationStatus + value;
              var uniqueStati = _.unique(validationStatus.trim().split(" "));
              n.set("mask", uniqueStati.join(" "));
            }
          } else if (index == "audioFileName" ) {
            if(!audioVideo){
              audioVideo = new AudioVideo();
            }
            audioVideo.set("filename", value);
            audioVideo.set("orginalFilename", audioFileDescriptionsKeyedByFilename[value] ? audioFileDescriptionsKeyedByFilename[value].name : "");
            audioVideo.set("URL", OPrime.audioUrl + "/" + window.app.get("corpus").get("pouchname") + "/" + value);
            audioVideo.set("description", audioFileDescriptionsKeyedByFilename[value] ? audioFileDescriptionsKeyedByFilename[value].description : "");
            audioVideo.set("details", audioFileDescriptionsKeyedByFilename[value]);
          } else if (index == "startTime") {
            if(!audioVideo){
              audioVideo = new AudioVideo();
            }
            audioVideo.set("startTime", value);
          } else if(index == "endTime" ) {
            if(!audioVideo){
              audioVideo = new AudioVideo();
            }
            audioVideo.set("endTime", value);
          } else {
            var knownlowercasefields = "utterance,gloss,morphemes,translation".split();
            if(knownlowercasefields.indexOf(index.toLowerCase()) > -1){
              index = index.toLowerCase();
            }
            var n = fields.where({label: index})[0];
            if(n != undefined){
              n.set("mask", value);
            }
          }
        });
        d.set("datumFields", fields);
        if (audioVideo) {
          d.get("audioVideo").add(audioVideo);
        }
        // var states = window.app.get("corpus").get("datumStates").clone();
        // d.set("datumStates", states);
        d.set("session", this.model.get("session"));
        //these are temp datums, dont save them until the user saves the data list
        this.importPaginatedDataListDatumsView.collection.add(d);
//        this.dataListView.model.get("datumIds").push(d.id); the datum has no id, cannot put in datumIds

        this.model.get("datumArray").push(d);
      }
      this.model.set("consultants", _.unique(consultantsInThisImportSession).join(","));
      this.importPaginatedDataListDatumsView.renderUpdatedPaginationControl();

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
        "pouchname" : window.app.get("corpus").get("pouchname"),
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
        //TODO This is still necessary, we cannot put the ids direclty into he datalist's model when it is created, they have no id.
//        window.appView.currentPaginatedDataListDatumsView.collection.unshift(thatdatum);
        window.appView.importView.dataListView.model.get("datumIds").unshift(thatdatum.id);

      },function(){
        //The e error should be from the error callback
        if(!e){
          e = {};
        }
        hub.publish("saveDatumFailedToPouch",{d: d, message: "datum "+ JSON.stringify(e) });
      });
    },
    popSaveADatumAndLoop : function(datumsLeftToSave){
      var thatdatum = datumsLeftToSave.shift();
      if(!thatdatum){
        this.importCompleted();
        return;
      }
      thatdatum.set({
        "session" : this.model.get("session"),
        "pouchname" : window.app.get("corpus").get("pouchname"),
        "dateEntered" : JSON.stringify(new Date()),
        "dateModified" : JSON.stringify(new Date())
      });

      thatdatum.saveAndInterConnectInApp(function(){
        // Add Datum to the new datalist and render it this should work
        window.appView.importView.dataListView.model.get("datumIds").push(thatdatum.id);
        // Update progress bar
        $(".import-progress").val($(".import-progress").val()+1);
        hub.publish("savedDatumToPouch",{ id: thatdatum.id, d: datumsLeftToSave, message: " datum "+thatdatum.id});
      },function(){
        //The e error should be from the error callback
        if(!e){
          e = {};
        }
        hub.publish("saveDatumFailedToPouch",{id: thatdatum.id, d: datumsLeftToSave, message: "datum "+ JSON.stringify(e) });
      });
    },
    importCompleted : function(){
      window.appView.toastUser( this.savedcount + " of your "
          +this.model.get("datumArray").length
          +" datum have been imported. "
          +this.savefailedcount+" didn't import. "
          ,"alert-success","Import successful:");

      window.app.addActivity(
          {
            verb : "imported",
            directobject : this.savedcount + " data entries",
            indirectobject : "in "+window.app.get("corpus").get("title"),
            teamOrPersonal : "team",
            context : "via Offline App"
          });

      window.app.addActivity(
          {
            verb : "imported",
            directobject : this.savedcount + " data entries",
            indirectobject : "in "+window.app.get("corpus").get("title"),
            teamOrPersonal : "personal",
            context : "via Offline App"
          });

      window.hub.unsubscribe("savedDatumToPouch", null, window.appView.importView);
      window.hub.unsubscribe("saveDatumFailedToPouch", null, window.appView.importView);

      // Set new data list as current one, and Render the first page of the new data list
      window.appView.importView.dataListView.model.saveAndInterConnectInApp(function(){
        window.appView.importView.dataListView.model.setAsCurrentDataList(function(){
          window.appView.toastUser("Sucessfully connected all views up to imported data list. ","alert-success","Connected!");
          window.appView.renderEditableDataListViews("leftSide");
          window.appView.renderReadonlyDataListViews("leftSide");
        });
      },function(){
        alert("bug: failure to save import's datalist");
      });
//      window.appView.currentEditDataListView.renderFirstPage();// TODO why not do automatically in datalist?
//      window.appView.renderReadonlyDataListViews();
//    window.appView.dataListReadLeftSideView.renderFirstPage(); //TODO read data
//    lists dont have this function, should we put it in...

      $(".import-progress").val( $(".import-progress").attr("max") );
      $(".approve-save").html("Finished");

      /* ask the corpus to update its frequent datum fields given the new datum */
      var couchConnection = window.app.get("corpus").get("couchConnection");
      var couchurl = OPrime.getCouchUrl(couchConnection) + "/_design/pages/_view/get_frequent_fields?group=true";
      window.app.get("corpus").getFrequentDatumFields(couchurl);
      /* might have added new datum states, so save the corpus */
      window.app.get("corpus").saveAndInterConnectInApp();

      // Go back to the dashboard
      window.location.href = "#render/true";
    },
    /**
     * permanently saves the datalist to the corpus, and all of its datums too.
     */
    saveDataList : function(){
      var self = this;
      self.createNewSession( function(){
        self.model.get("session").saveAndInterConnectInApp(function(){
          $(".import-progress").val($(".import-progress").val()+1);

          window.hub.unsubscribe("savedDatumToPouch", null, self);
          window.hub.unsubscribe("saveDatumFailedToPouch", null, self);
          this.savedcount = 0;
          this.savedindex = [];
          this.savefailedcount = 0;
          this.savefailedindex = [];
          this.nextsavedatum  = 0;

          // after we have a session
          $(".approve-save").addClass("disabled");
          // add the datums to the progress bar, so that we can augment for each
          // that is saved.
          $(".import-progress").attr("max", parseInt($(".import-progress").attr("max")) + parseInt(self.model.get("datumArray").length));

//          var dl = new DataList({
//            "pouchname" : window.app.get("corpus").get("pouchname"),
//            "title" : self.dataListView.model.get("title"),
//            "description": self.dataListView.model.get("description")
//          });
//          window.resultDataList = dl;
          //empty out datumids
          window.appView.importView.dataListView.model.set("datumIds", []);
          self.dataListView.model.saveAndInterConnectInApp(function(){

              // Update the progress bar, one more thing is done.
              $(".import-progress").val($(".import-progress").val()+1);

              window.app.addActivity({
                    verb : "attempted to import",
                    directobject : self.model.get("datumArray").length + " data entries",
                    indirectobject : "in "+window.app.get("corpus").get("title"),
                    teamOrPersonal : "team",
                    context : "via Offline App"
                  });

              window.app.addActivity({
                    verb : "attempted to import",
                    directobject : self.model.get("datumArray").length + " data entries",
                    indirectobject : "in "+window.app.get("corpus").get("title"),
                    teamOrPersonal : "personal",
                    context : "via Offline App"
                  });

              window.hub.subscribe("savedDatumToPouch", function(arg){
                this.savedindex[arg.id] = true;
                this.savedcount++;
                this.popSaveADatumAndLoop(arg.d);
              }, self);

              window.hub.subscribe("saveDatumFailedToPouch",function(arg){
                this.savefailedindex[arg.id] = false; //this.model.get("datumArray")[arg.d];
                this.savefailedcount++;
                window.appView.toastUser("Import failed "+arg.id+" : "+arg.message,"alert-danger","Failure:");
                this.popSaveADatumAndLoop(arg.d);
              }, self);

              /*
               * Begin the datum saving loop
               */
              if(self.model.get("datumArray").length > 0){
                self.popSaveADatumAndLoop(self.model.get("datumArray"));
              }else{
                alert("You havent imported anything. Please let us know if it does this again.");
                this.importCompleted();
                return;
              }

            /* end successful save of datalist and session */


          }/* Default Save datalist failure */);

        }/*Default Save session failure */);
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
          sessionFields : window.app.get("corpus").get("sessionFields").clone(),
          "pouchname" : window.app.get("corpus").get("pouchname"),
        }));

        var filemodified = JSON.stringify(new Date());
        try {
          filemodified = this.model.get("files").map(function(file) {
            var value = file.lastModifiedDate ? file.lastModifiedDate.toLocaleDateString() : "";
            if(!value){
              value = file.mtime ? new Date(file.mtime).toLocaleDateString() : "n/a";
            }
            return value;
          });
          filemodified = _.unique(filemodified).join(", ");
        } catch (e) {
          //do nothing
        }

        this.model.get("session").get("sessionFields").where({
          label : "goal"
        })[0].set("mask", "Goal from file import " + this.model.get("status"));

        this.model.get("session").get("sessionFields").where({
          label : "dateElicited"
        })[0].set("mask", "Probably Prior to " + filemodified);

        this.model.get("session").get("sessionFields").where({
          label : "consultants"
        })[0].set("mask", "Unknown");
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
      var self = this;
      $("#csv-table-area").find('td').each(function(index) {
        $(this).after('<td contenteditable = "true"></td>');
      });
      var count = $("#csv-table-area").find('th').length;
      $("#csv-table-area").find('th').each(function(index) {
        var tableCell = document.createElement("th");
        count++;
        $(tableCell).html('<input type="text" class="drop-label-zone header'+count+'" value=""/>');
        $(tableCell).find("input")[0].addEventListener('drop', self.dragLabelToColumn);
        $(tableCell).find("input")[0].addEventListener('dragover', self.handleDragOver);
        $(tableCell).find("input")[0].addEventListener('dragleave', function(){
          $(this).removeClass("over");
        } );
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
      e.dataTransfer.effectAllowed = 'copy'; // only dropEffect='copy' will be dropable

      //if not already dragging, do a drag start
      if(window.appView.importView.dragSrcEl == null){
        window.appView.importView.dragSrcEl = this;
//        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', this.innerHTML);
      }
      return false;
    },
    /**
     * http://www.html5rocks.com/en/tutorials/dnd/basics/
     *
     * @param e
     */
    dragLabelToColumn : function(e) {
      if (OPrime.debugMode) OPrime.debug("Recieved a drop import label event ");
      // this / e.target is current target element.
      if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from redirecting.
      }

   // Don't do anything if dropping the same column we're dragging.
      if (window.appView.importView.dragSrcEl != this && window.appView.importView.dragSrcEl != null) {
        // Set the source column's HTML to the HTML of the columnwe dropped on.
//        window.appView.importView.dragSrcEl.innerHTML = e.target.value;
        e.target.value = window.appView.importView.dragSrcEl.innerHTML;//e.dataTransfer.getData('text/html');
        window.appView.importView.dragSrcEl = null;
        $(this).removeClass("over");
        $(".import-progress").val($(".import-progress").val()+1);
      }
      return false;
    },
    handleDragOver : function(e) {
      if (e.preventDefault) {
        e.preventDefault(); // Necessary. Allows us to drop.
      }
      this.classList.add("over");
      e.dataTransfer.dropEffect = 'copy';  // See the section on the DataTransfer object.
      return false;
    },

//// Choose an option from Dropdown "Import from" then the second step will show up
    showSecondStep : function(e){
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      $("#import-second-step").removeClass("hidden");
    },

    /**
     *
     * http://stackoverflow.com/questions/6569704/destroy-or-remove-a-view-in-backbone-js
     */
    destroy_view: function() {
      if (OPrime.debugMode) OPrime.debug("DESTROYING IMPORT EDIT VIEW ");
      //COMPLETELY UNBIND THE VIEW
      this.undelegateEvents();

      $(this.el).removeData().unbind();

      //Remove view from DOM
//      this.remove();
//      Backbone.View.prototype.remove.call(this);
      }
  });

  return ImportEditView;
});
