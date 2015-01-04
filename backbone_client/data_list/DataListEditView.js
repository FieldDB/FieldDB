
define( [
    "backbone",
    "handlebars",
    "audio_video/AudioVideoReadView",
    "comment/Comment",
    "comment/Comments",
    "comment/CommentReadView",
    "comment/CommentEditView",
    "data_list/DataList",
    "datum/Datum",
    "datum/DatumReadView",
    "datum/Datums",
    "app/UpdatingCollectionView"
], function(
    Backbone,
    Handlebars,
    AudioVideoReadView,
    Comment,
    Comments,
    CommentReadView,
    CommentEditView,
    DataList,
    Datum,
    DatumReadView,
    Datums,
    UpdatingCollectionView
) {
  var DataListEditView = Backbone.View.extend(
  /** @lends DataListEditView.prototype */
  {
    /**
     * @class This is a page where the user can create their own datalist. They
     *        can pick datum and then drag them over to their own customized
     *        data list.
     *
     * @property {String} format Must be set when the view is
     * initialized. Valid values are "leftSide", "centreWell",
     * "fullscreen", "import", "minimized" "search" "search-minimized"
     *
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      if (OPrime.debugMode) OPrime.debug("DATALIST EDIT VIEW init: " + this.el);

      this.changeViewsOfInternalModels();

      // If the model's title changes, chances are its a new datalist, re-render its internal models.
      this.model.bind('change:dateCreated', function(){
        this.changeViewsOfInternalModels();
        this.render();
      }, this);

      this.model.bind('change:datumIds', function(){
        this.render();
      }, this);

    },

    /**
     * The underlying model of the DataListEditView is a DataList.
     */
    model : DataList,
    datumSelected : [],

    /**
     * Events that the DataListEditView is listening to and their handlers.
     */
    events : {
      //Add button inserts new Comment
      "click .add-comment-button" : function(e) {
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        /* Ask the comment edit view to get it's current text */
        this.commentEditView.updateComment();
        /* Ask the collection to put a copy of the comment into the collection */
        this.model.get("comments").insertNewCommentFromObject(this.commentEditView.model.toJSON());
        /* empty the comment edit view. */
        this.commentEditView.clearCommentForReuse();
        /* save the state of the datalist when the comment is added, and render it*/
        this.updatePouch();
        this.commentReadView.render();


//        this.model.get("comments").unshift(this.commentEditView.model);
//        this.commentEditView.model = new Comment();
      },
      //Delete button remove a comment
      "click .remove-comment-button" : function(e) {
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        this.model.get("comments").remove(this.commentEditView.model);
      },

      "click .icon-resize-small" : 'resizeSmall',
      "click .icon-resize-full" : "resizeFullscreen",

      "blur .data-list-title": "updateTitle",
      "blur .data-list-description": "updateDescription",

      "click .icon-book" :"showReadonly",

//      Issue #797
      "click .trash-button" : "putInTrash",

      "click .save-datalist" : "updatePouch",
      "click .save-search-datalist" : "saveSearchDataList",
      "click .save-import-datalist" : "saveImportDataList",

      "click .icon-minus-sign" : function(e) {
        e.preventDefault();
        if(this.format == "search"){
          this.format = "search-minimized";
        }else{
          this.format = "minimized";
        }
        this.render();
      },
      "click .icon-plus-sign" : function(e) {
        e.preventDefault();
        if(this.format == "search-minimized"){
          this.format = "search";
        }else{
          this.format = "leftSide";
        }
        this.render();
      },
      "click .latex-export-datalist": function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        $("#export-modal").show();
        $("#export-text-area").val("");
        this.model.applyFunctionToAllIds(this.getAllCheckedDatums(), "latexitDataList", true);
        return false;
      },
      "click .icon-paste": function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        $("#export-modal").show();
        $("#export-text-area").val("");
        this.model.applyFunctionToAllIds(this.getAllCheckedDatums(), "exportAsPlainText", true);
        return false;
      },
      "click .CSV": function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        $("#export-modal").show();
        $("#export-text-area").val("");
        var datumWithAllCorpusFieldsToPrintHeader = new Datum({filledWithDefaults : true});
        datumWithAllCorpusFieldsToPrintHeader.exportAsCSV(true, null, true);
        this.model.applyFunctionToAllIds(this.getAllCheckedDatums(), "exportAsCSV", true);
        return false;
      },
      "click .icon-bullhorn": function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }

        this.createPlaylistAndPlayAudioVideo(this.getAllCheckedDatums());
        return false;
      },
      "click .icon-remove-sign": function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        this.removeDatumFromThisList(this.getAllCheckedDatums());
        return false;
      },
      "click .icon-lock": function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }

        this.model.applyFunctionToAllIds(this.getAllCheckedDatums(), "encrypt");
//        $(".icon-unlock").toggleClass("icon-unlock icon-lock");

        return false;
      },
      "click .icon-unlock": function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }

        this.model.applyFunctionToAllIds(this.getAllCheckedDatums(), "decrypt");
//        $(".icon-lock").toggleClass("icon-unlock icon-lock");

        return false;
      },
      "click .icon-eye-open" : function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        var confidential = app.get("corpus").get("confidential");
        if(!confidential){
          alert("This is a bug: cannot find decryption module for your corpus.");
        }
        var self = this;
        confidential.turnOnDecryptedMode(function(){
          self.$el.find(".icon-eye-close").toggleClass("icon-eye-close icon-eye-open");
          $(self.el).find(".locale_Show_confidential_items_Tooltip").attr("title", Locale.get("locale_Hide_confidential_items_Tooltip"));
        });

        return false;
      },
      "click .icon-eye-close" : function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        var confidential = app.get("corpus").get("confidential");
        if(!confidential){
          alert("This is a bug: cannot find decryption module for your corpus.");
        }
        confidential.turnOffDecryptedMode();
        this.$el.find(".icon-eye-open").toggleClass("icon-eye-close icon-eye-open");
        $(this.el).find(".locale_Show_confidential_items_Tooltip").attr("title", Locale.get("locale_Show_confidential_items_Tooltip"));
        return false;
      }
    },

    templateFullscreen : Handlebars.templates.data_list_edit_embedded,

    embeddedTemplate : Handlebars.templates.data_list_edit_embedded,

    templateSummary : Handlebars.templates.data_list_summary_edit_embedded,

    /*
     * search has no readonly, or fullscreen buttons
     */
    searchTemplate : Handlebars.templates.data_list_search_edit_embedded,
    /*
     * import has no minimize, fullscreen or readonly buttons
     */
    importTemplate : Handlebars.templates.data_list_import_edit_embedded,

    templateMinimized : Handlebars.templates.data_list_summary_read_minimized,

    render : function() {
      if (this.format && this.format.indexOf("search") == -1){
        if(window.appView.currentEditDataListView){
          appView.currentEditDataListView.destroy_view();
        }
        appView.currentReadDataListView.destroy_view();
      }

      var jsonToRender = this.model.toJSON();
      if (jsonToRender.title.default) {
        jsonToRender.title = jsonToRender.title.default;
      }
      if (jsonToRender.description.default) {
        jsonToRender.description = jsonToRender.description.default;
      }
      jsonToRender.locale_Add = Locale.get("locale_Add");
      jsonToRender.locale_Decrypt_checked = Locale.get("locale_Decrypt_checked");
      jsonToRender.locale_Description = Locale.get("locale_Description");
      jsonToRender.locale_Encrypt_checked = Locale.get("locale_Encrypt_checked");
      jsonToRender.locale_Export_checked_as_CSV = Locale.get("locale_Export_checked_as_CSV");
      jsonToRender.locale_Export_checked_as_LaTeX = Locale.get("locale_Export_checked_as_LaTeX");
      jsonToRender.locale_Hide_Datalist = Locale.get("locale_Hide_Datalist");
      jsonToRender.locale_Hide_Datalist = Locale.get("locale_Hide_Datalist");
      jsonToRender.locale_Plain_Text_Export_Tooltip_checked = Locale.get("locale_Plain_Text_Export_Tooltip_checked");
      jsonToRender.locale_Play_Audio_checked = Locale.get("locale_Play_Audio_checked");
      jsonToRender.locale_Remove_checked_from_datalist_tooltip = Locale.get("locale_Remove_checked_from_datalist_tooltip");
      jsonToRender.locale_Save = Locale.get("locale_Save");
      jsonToRender.locale_Show_Datalist = Locale.get("locale_Show_Datalist");
      jsonToRender.locale_Show_Fullscreen = Locale.get("locale_Show_Fullscreen");
      jsonToRender.locale_Show_Readonly = Locale.get("locale_Show_Readonly");
      jsonToRender.locale_Show_in_Dashboard = Locale.get("locale_Show_in_Dashboard");
      jsonToRender.locale_Title = Locale.get("locale_Title");

      if(jsonToRender.decryptedMode){
        jsonToRender.locale_Show_confidential_items_Tooltip = Locale.get("locale_Hide_confidential_items_Tooltip");
      }else{
        jsonToRender.locale_Show_confidential_items_Tooltip = Locale.get("locale_Show_confidential_items_Tooltip");
      }


      if (this.format == "leftSide") {
        if (OPrime.debugMode) OPrime.debug("DATALIST EDIT LEFTSIDE render: " + this.el);

        this.setElement($("#data-list-quickview-header"));
        $(this.el).html(this.templateSummary(jsonToRender));

        window.appView.currentPaginatedDataListDatumsView.renderInElement(
            $("#data-list-quickview").find(".current-data-list-paginated-view") );

      } else  if (this.format == "fullscreen") {
        if (OPrime.debugMode) OPrime.debug("DATALIST EDIT FULLSCREEN render: " + this.el);

        this.setElement($("#data-list-fullscreen-header"));
        $(this.el).html(this.templateFullscreen(jsonToRender));

        window.appView.currentPaginatedDataListDatumsView.renderInElement(
            $("#data-list-fullscreen").find(".current-data-list-paginated-view") );

      } else if (this.format == "centreWell") {
        if (OPrime.debugMode) OPrime.debug("DATALIST EDIT CENTER render: " + this.el);

        this.setElement($("#data-list-embedded-header"));
        $(this.el).html(this.embeddedTemplate(jsonToRender));

        window.appView.currentPaginatedDataListDatumsView.renderInElement(
            $("#data-list-embedded").find(".current-data-list-paginated-view") );

      }else if (this.format == "search") {
        if (OPrime.debugMode) OPrime.debug("DATALIST EDIT SEARCH render: " + this.el);

        this.setElement($("#search-data-list-quickview-header"));
        $(this.el).html(this.searchTemplate(jsonToRender));
//        $("#search-data-list-quickview").addClass("well");
        $("#search-data-list-quickview").show();
        this.model.view = window.appView.searchEditView.searchPaginatedDataListDatumsView;

        window.appView.searchEditView.searchPaginatedDataListDatumsView.renderInElement(
            $("#search-data-list-quickview").find(".search-data-list-paginated-view") );
        $(".search-data-list-paginated-view").show();
        $("#search-data-list-quickview-header").parent().find(".pagination-control").show();

      } else if (this.format == "search-minimized") {
        if (OPrime.debugMode) OPrime.debug("DATALIST EDIT SEARCH render: " + this.el);

        this.setElement($("#search-data-list-quickview-header"));
        $(this.el).html(this.templateMinimized(jsonToRender));
//        $(this.el).addClass("well");
        try {
          $(".search-data-list-paginated-view").hide();
          $("#search-data-list-quickview-header").parent().find(".pagination-control").hide();

        } catch(e) {
          if (OPrime.debugMode) OPrime.debug("There was a problem minimizing the search datums view, probably it doesnt exist yet. ",e);
        }

      } else if (this.format == "import"){
        if (OPrime.debugMode) OPrime.debug("DATALIST EDIT IMPORT render: " + this.el);

        this.setElement($("#import-data-list-header"));
        $(this.el).html(this.importTemplate(jsonToRender));

      } else if (this.format == "minimized") {
        if (OPrime.debugMode) OPrime.debug("DATALIST EDIT MINIMIZED render: " + this.el);

        this.setElement($("#data-list-quickview-header"));
        $(this.el).html(this.templateMinimized(jsonToRender));

        window.appView.currentPaginatedDataListDatumsView.renderInElement(
            $("#data-list-quickview").find(".current-data-list-paginated-view") );

      }else{
        if (OPrime.debugMode) OPrime.debug("Bug: no format was specified for DataListEditView, nothing was rendered");
      }


      if (this.format !== "link" && !this.format == "search") {
        this.model.view = window.appView.currentPaginatedDataListDatumsView;
      }

      if (this.format !== "link") {
        // Must always Display audioVideo View so that the audio will work correctly
        this.audioVideoView.el = this.$(".audio_video_ul");
        // this.audioVideoView.collection = this.model.get("audioVideo");
        this.audioVideoView.render();
      }

      try{
        if (this.format && this.format.indexOf("minimized") == -1){
          // Display the CommentReadView          this.commentReadView.el = this.$el.find(".comments");
          this.commentReadView.el = $(this.el).find('.comments');
          this.commentReadView.render();

          // Display the CommentEditView
          this.commentEditView.el = $(this.el).find('.new-comment-area');
          this.commentEditView.render();

        }
      }catch(e){
        alert("Bug, there was a problem rendering the contents of the data list format: "+this.format);
      }

      return this;
    },

    /**
     * See definition in the model
     *
     */
    putInTrash : function(e){
      if(e){
        e.preventDefault();
      }
      var r = confirm("Are you sure you want to put this datalist in the trash?");
      if (r == true) {
        this.model.putInTrash();
      }
    },


    changeViewsOfInternalModels : function() {

      this.commentReadView = new UpdatingCollectionView({
        collection           : this.model.get("comments"),
        childViewConstructor : CommentReadView,
        childViewTagName     : 'li'
      });

      this.commentEditView = new CommentEditView({
        model : new Comment(),
      });

      this.audioVideoView = new UpdatingCollectionView({
        collection           : this.model.get("audioVideo"),
        childViewConstructor : AudioVideoReadView,
        childViewTagName     : 'li'
      });
    },
    /**
     * Loops through all (visible) checkboxes in the currentPaginatedDataListDatumsView, and returns an array of checked items.
     * @returns {Array}
     */
    getAllCheckedDatums : function(){
      var datumIdsChecked = [];

      for(var datumViewIndex in window.appView.currentPaginatedDataListDatumsView._childViews){
        if(window.appView.currentPaginatedDataListDatumsView._childViews[datumViewIndex].checked == true){
          datumIdsChecked.push(window.appView.currentPaginatedDataListDatumsView._childViews[datumViewIndex].model.id);
        }
      }
      // alert("DATA LIST EDIT VIEW datumIdsChecked "+ JSON.stringify(datumIdsChecked));

      return datumIdsChecked;
    },
    createPlaylistAndPlayAudioVideo : function(datumIds){
      alert("TODO show playlist and audio player for all audio/video in datums "+JSON.stringify(audioAndVideoFilePaths));
      this.model.getAllAudioAndVideoFiles(datumIds, function(audioAndVideoFilePaths){
      });
    },
    removeDatumFromThisList : function(datumIds){
      if(datumIds == this.model.get("datumIds")){
        return; //return quietly, refuse to remove all datum in a data list.
      }
      try{
        this.model.set("datumIds", _.difference(this.model.get("datumIds"), [datumIds]) );
        appView.currentPaginatedDataListDatumsView.collection.remove(appView.currentPaginatedDataListDatumsView.collection.get(datumIds[0]))
      }catch(e){
        if (OPrime.debugMode) OPrime.debug("Attemptign to remove datum(s) from the current datalist, there was something that went wrong.",e);
      }
    },
    resizeSmall : function(e){
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
//      this.format = "leftSide";
//      this.render();
      window.location.href = "#render/true";
    },

    resizeFullscreen : function(e){
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      this.format = "fullscreen";
      this.render();
      window.app.router.showFullscreenDataList();
    },

    updateTitle: function(){
      var newValue = this.$el.find(".data-list-title").val();
      if (typeof this.model.get("title") === "object") {
        this.model.get("title").default = newValue;
      } else {
        this.model.set("title", newValue);
      }
      if(this.model.id){
        window.appView.addUnsavedDoc(this.model.id);
      }
    },

    updateDescription: function() {
      var newValue = this.$el.find(".data-list-description").val();
      if (typeof this.model.get("description") === "object") {
        this.model.get("description").default = newValue;
      } else {
        this.model.set("description", newValue);
      }
      if (this.model.id) {
        window.appView.addUnsavedDoc(this.model.id);
      }
    },

    //bound to pencil
    showReadonly :function(e){
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      window.appView.currentReadDataListView.format = this.format;
      window.appView.currentReadDataListView.render();
    },

    updatePouch : function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      var self = this;
      this.model.saveAndInterConnectInApp(function(){
        window.appView.currentReadDataListView.format = self.format;
        window.appView.currentReadDataListView.render();
      });
    },

    saveSearchDataList : function(e, callback, failurecallback){
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }


//      var self = this;
//      this.model.saveAndInterConnectInApp(function(){
//          self.format = "search-minimized";
//          self.render();
//          self.model.setAsCurrentDataList();
//        window.appView.renderReadonlyDataListViews("leftSide");
//      });

      var searchself = appView.searchEditView.searchDataListView; //TODO this was because the wrong tempalte was in the serach data list.for some reason the model is a function here when i click on the save button on the temp serach data list. this is a workaround.

      /* if there is no call back, make this the full screen data list. */
      if(!callback){
        callback = function(){
          window.appView.currentReadDataListView.format = "leftSide";
          window.appView.currentReadDataListView.render();
        };
      }
      searchself.model.saveAndInterConnectInApp(function(){
        searchself.format = "search-minimized";
        searchself.render();
        searchself.model.setAsCurrentDataList(callback);
//        window.location.href = "#render/true";
      }, failurecallback);

    },
    saveImportDataList : function(e){
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      alert("TODO");
    },

    /**
     *
     * http://stackoverflow.com/questions/6569704/destroy-or-remove-a-view-in-backbone-js
     */
    destroy_view: function() {
      if (OPrime.debugMode) OPrime.debug("DESTROYING DATALIST EDIT VIEW "+ this.format);

      //COMPLETELY UNBIND THE VIEW
      this.undelegateEvents();

      $(this.el).removeData().unbind();

      //Remove view from DOM
//      this.remove();
//      Backbone.View.prototype.remove.call(this);
      }
  });

  return DataListEditView;
});
