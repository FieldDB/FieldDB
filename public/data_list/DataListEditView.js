
define( [ 
    "backbone", 
    "handlebars",
    "activity/Activity",
    "comment/Comment",
    "comment/Comments",
    "comment/CommentReadView",
    "data_list/DataList",
    "datum/Datum",
    "datum/DatumReadView",
    "datum/Datums",
    "app/UpdatingCollectionView"
], function(
    Backbone, 
    Handlebars, 
    Activity,
    Comment,
    Comments,
    CommentReadView,
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
      Utils.debug("DATALIST EDIT VIEW init: " + this.el);

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
      "click .add-comment-datalist" : function(e) {
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        var commentstring = this.$el.find(".comment-new-text").val();
        
        this.model.insertNewComment(commentstring);
        this.$el.find(".comment-new-text").val("");
        
      },      

      "click .icon-resize-small" : 'resizeSmall',
      "click .icon-resize-full" : "resizeFullscreen",
      
      "blur .data-list-title": "updateTitle",
      "blur .data-list-description": "updateDescription",

      "click .icon-book" :"showReadonly",
      
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
        $("#export-modal").modal("show");
        $("#export-text-area").val("");
        this.model.applyFunctionToAllIds(this.getAllCheckedDatums(), "laTeXiT", true);
        return false;
      },
      "click .icon-paste": function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        $("#export-modal").modal("show");
        $("#export-text-area").val("");
        this.model.applyFunctionToAllIds(this.getAllCheckedDatums(), "exportAsPlainText", true);
        return false;
      },
      "click .CSV": function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        $("#export-modal").modal("show");
        $("#export-text-area").val("");
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
          $(self.el).find(".locale_Show_confidential_items_Tooltip").attr("title", Locale["locale_Hide_confidential_items_Tooltip"].message);
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
        $(this.el).find(".locale_Show_confidential_items_Tooltip").attr("title", Locale["locale_Show_confidential_items_Tooltip"].message);
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
      if(window.appView.currentEditDataListView){
        appView.currentEditDataListView.destroy_view();
      }
      appView.currentReadDataListView.destroy_view();
      
      var jsonToRender = this.model.toJSON();
      jsonToRender.datumCount = this.model.get("datumIds").length;
      jsonToRender.decryptedMode = window.app.get("corpus").get("confidential").decryptedMode;

      if (this.format == "leftSide") {
        Utils.debug("DATALIST EDIT LEFTSIDE render: " + this.el);

        this.setElement($("#data-list-quickview-header"));
        $(this.el).html(this.templateSummary(jsonToRender));
        
        window.appView.currentPaginatedDataListDatumsView.renderInElement(
            $("#data-list-quickview").find(".current-data-list-paginated-view") );

        //Localization of icons and buttons for edit quickview
        $(this.el).find(".locale_Save").html(Locale["locale_Save"].message);
        $(this.el).find(".locale_Hide_Datalist").attr("title", Locale["locale_Hide_Datalist"].message);
        $(this.el).find(".locale_Show_Readonly").attr("title", Locale["locale_Show_Readonly"].message);
        $(this.el).find(".locale_Show_Fullscreen").attr("title", Locale["locale_Show_Fullscreen"].message);
        
        //localization of data list menu
        $(this.el).find(".locale_Play_Audio_checked").attr("title", Locale["locale_Play_Audio_checked"].message);
        $(this.el).find(".locale_Remove_checked_from_datalist_tooltip").attr("title", Locale["locale_Remove_checked_from_datalist_tooltip"].message);
        $(this.el).find(".locale_Plain_Text_Export_Tooltip_checked").attr("title", Locale["locale_Plain_Text_Export_Tooltip_checked"].message);
        $(this.el).find(".locale_Encrypt_checked").attr("title", Locale["locale_Encrypt_checked"].message);
        $(this.el).find(".locale_Decrypt_checked").attr("title", Locale["locale_Decrypt_checked"].message);
        if(jsonToRender.decryptedMode){
          $(this.el).find(".locale_Show_confidential_items_Tooltip").attr("title", Locale["locale_Hide_confidential_items_Tooltip"].message);
        }else{
          $(this.el).find(".locale_Show_confidential_items_Tooltip").attr("title", Locale["locale_Show_confidential_items_Tooltip"].message);
        }
        $(this.el).find(".locale_Export_checked_as_LaTeX").attr("title", Locale["locale_Export_checked_as_LaTeX"].message);
        $(this.el).find(".locale_Export_checked_as_CSV").attr("title", Locale["locale_Export_checked_as_CSV"].message);
        $(this.el).find(".locale_Add").html(Locale["locale_Add"].message);

      } else  if (this.format == "fullscreen") {
        Utils.debug("DATALIST EDIT FULLSCREEN render: " + this.el);

        this.setElement($("#data-list-fullscreen-header"));
        $(this.el).html(this.templateFullscreen(jsonToRender));
        
        window.appView.currentPaginatedDataListDatumsView.renderInElement(
            $("#data-list-fullscreen").find(".current-data-list-paginated-view") );
        
        //Localization of icons for fullscreen
        $(this.el).find(".locale_Show_Readonly").attr("title", Locale["locale_Show_Readonly"].message);
        $(this.el).find(".locale_Show_in_Dashboard").attr("title", Locale["locale_Show_in_Dashboard"].message);
        $(this.el).find(".locale_Save").html(Locale["locale_Save"].message);

        //localization of data list menu
        $(this.el).find(".locale_Play_Audio_checked").attr("title", Locale["locale_Play_Audio_checked"].message);
        $(this.el).find(".locale_Remove_checked_from_datalist_tooltip").attr("title", Locale["locale_Remove_checked_from_datalist_tooltip"].message);
        $(this.el).find(".locale_Plain_Text_Export_Tooltip_checked").attr("title", Locale["locale_Plain_Text_Export_Tooltip_checked"].message);
        $(this.el).find(".locale_Encrypt_checked").attr("title", Locale["locale_Encrypt_checked"].message);
        $(this.el).find(".locale_Decrypt_checked").attr("title", Locale["locale_Decrypt_checked"].message);
        if(jsonToRender.decryptedMode){
          $(this.el).find(".locale_Show_confidential_items_Tooltip").attr("title", Locale["locale_Hide_confidential_items_Tooltip"].message);
        }else{
          $(this.el).find(".locale_Show_confidential_items_Tooltip").attr("title", Locale["locale_Show_confidential_items_Tooltip"].message);
        }        
        $(this.el).find(".locale_Export_checked_as_LaTeX").attr("title", Locale["locale_Export_checked_as_LaTeX"].message);
        $(this.el).find(".locale_Export_checked_as_CSV").attr("title", Locale["locale_Export_checked_as_CSV"].message);
        $(this.el).find(".locale_Add").html(Locale["locale_Add"].message);

      } else if (this.format == "centreWell") {
        Utils.debug("DATALIST EDIT CENTER render: " + this.el);
        
        this.setElement($("#data-list-embedded-header"));
        $(this.el).html(this.embeddedTemplate(jsonToRender));
        
        window.appView.currentPaginatedDataListDatumsView.renderInElement(
            $("#data-list-embedded").find(".current-data-list-paginated-view") );
        
        //Localization of icons for centerWell
        $(this.el).find(".locale_Show_Readonly").attr("title", Locale["locale_Show_Readonly"].message);
        $(this.el).find(".locale_Show_in_Dashboard").attr("title", Locale["locale_Show_in_Dashboard"].message);
        $(this.el).find(".locale_Save").html(Locale["locale_Save"].message);

        //localization of data list menu
        $(this.el).find(".locale_Play_Audio_checked").attr("title", Locale["locale_Play_Audio_checked"].message);
        $(this.el).find(".locale_Remove_checked_from_datalist_tooltip").attr("title", Locale["locale_Remove_checked_from_datalist_tooltip"].message);
        $(this.el).find(".locale_Plain_Text_Export_Tooltip_checked").attr("title", Locale["locale_Plain_Text_Export_Tooltip_checked"].message);
        $(this.el).find(".locale_Encrypt_checked").attr("title", Locale["locale_Encrypt_checked"].message);
        $(this.el).find(".locale_Decrypt_checked").attr("title", Locale["locale_Decrypt_checked"].message);
        if(jsonToRender.decryptedMode){
          $(this.el).find(".locale_Show_confidential_items_Tooltip").attr("title", Locale["locale_Hide_confidential_items_Tooltip"].message);
        }else{
          $(this.el).find(".locale_Show_confidential_items_Tooltip").attr("title", Locale["locale_Show_confidential_items_Tooltip"].message);
        }        
        $(this.el).find(".locale_Export_checked_as_LaTeX").attr("title", Locale["locale_Export_checked_as_LaTeX"].message);
        $(this.el).find(".locale_Export_checked_as_CSV").attr("title", Locale["locale_Export_checked_as_CSV"].message);
        $(this.el).find(".locale_Add").html(Locale["locale_Add"].message);

      }else if (this.format == "search") {
        Utils.debug("DATALIST EDIT SEARCH render: " + this.el);

        this.setElement($("#search-data-list-quickview-header"));
        $(this.el).html(this.searchTemplate(jsonToRender));
        $("#search-data-list-quickview").addClass("well");

        window.appView.searchEditView.searchPaginatedDataListDatumsView.renderInElement(
            $("#search-data-list-quickview").find(".search-data-list-paginated-view") );
        $(".search-data-list-paginated-view").show();
        $("#search-data-list-quickview-header").parent().find(".pagination-control").show();
        
        //Localization of icons and buttons for search quickview
        $(this.el).find(".locale_Save").html(Locale["locale_Save"].message);
        $(this.el).find(".locale_Hide_Datalist").attr("title", Locale["locale_Hide_Datalist"].message);
        
        //localization of search data list menu
        $(this.el).find(".locale_Play_Audio_checked").attr("title", Locale["locale_Play_Audio_checked"].message);
        $(this.el).find(".locale_Remove_checked_from_datalist_tooltip").attr("title", Locale["locale_Remove_checked_from_datalist_tooltip"].message);
        $(this.el).find(".locale_Plain_Text_Export_Tooltip_checked").attr("title", Locale["locale_Plain_Text_Export_Tooltip_checked"].message);
        $(this.el).find(".locale_Encrypt_checked").attr("title", Locale["locale_Encrypt_checked"].message);
        $(this.el).find(".locale_Decrypt_checked").attr("title", Locale["locale_Decrypt_checked"].message);
        if(jsonToRender.decryptedMode){
          $(this.el).find(".locale_Show_confidential_items_Tooltip").attr("title", Locale["locale_Hide_confidential_items_Tooltip"].message);
        }else{
          $(this.el).find(".locale_Show_confidential_items_Tooltip").attr("title", Locale["locale_Show_confidential_items_Tooltip"].message);
        }        
        $(this.el).find(".locale_Export_checked_as_LaTeX").attr("title", Locale["locale_Export_checked_as_LaTeX"].message);
        $(this.el).find(".locale_Export_checked_as_CSV").attr("title", Locale["locale_Export_checked_as_CSV"].message);
        //No add comment button
        
      }else if (this.format == "search-minimized") {
        Utils.debug("DATALIST EDIT SEARCH render: " + this.el);
        
        this.setElement($("#search-data-list-quickview-header"));
        $(this.el).html(this.templateMinimized(jsonToRender));
//        $(this.el).addClass("well");
        try{
          $(".search-data-list-paginated-view").hide();
          $("#search-data-list-quickview-header").parent().find(".pagination-control").hide();

          
        }catch(e){
          Utils.debug("There was a problem minimizing the search datums view, probably it doesnt exist yet. ",e);
        }

        //localization of the minimized data list icons
        $(this.el).find(".locale_Show_Datalist").attr("title", Locale["locale_Show_Datalist"].message);

      }else if (this.format == "import"){
        Utils.debug("DATALIST EDIT IMPORT render: " + this.el);

        this.setElement($("#import-data-list-header"));
        $(this.el).html(this.importTemplate(jsonToRender));
        
        //localization of import data list menu
        $(this.el).find(".locale_Plain_Text_Export_Tooltip_checked").attr("title", Locale["locale_Plain_Text_Export_Tooltip_checked"].message);
        $(this.el).find(".locale_Encrypt_checked").attr("title", Locale["locale_Encrypt_checked"].message);
        $(this.el).find(".locale_Decrypt_checked").attr("title", Locale["locale_Decrypt_checked"].message);
        if(jsonToRender.decryptedMode){
          $(this.el).find(".locale_Show_confidential_items_Tooltip").attr("title", Locale["locale_Hide_confidential_items_Tooltip"].message);
        }else{
          $(this.el).find(".locale_Show_confidential_items_Tooltip").attr("title", Locale["locale_Show_confidential_items_Tooltip"].message);
        }        
        $(this.el).find(".locale_Export_checked_as_LaTeX").attr("title", Locale["locale_Export_checked_as_LaTeX"].message);
        $(this.el).find(".locale_Export_checked_as_CSV").attr("title", Locale["locale_Export_checked_as_CSV"].message);
        $(this.el).find(".locale_Add").html(Locale["locale_Add"].message);

        
      } else if (this.format == "minimized") {
        Utils.debug("DATALIST EDIT MINIMIZED render: " + this.el);

        this.setElement($("#data-list-quickview-header"));
        $(this.el).html(this.templateMinimized(jsonToRender));
        
        //localization of the minimized data list icons
        $(this.el).find(".locale_Show_Datalist").attr("title", Locale["locale_Show_Datalist"].message);

      }else{
        Utils.debug("Bug: no format was specified for DataListEditView, nothing was rendered");
      }
      try{
        if (this.format && this.format.indexOf("minimized") == -1){
          // Display the CommentReadView
          this.commentReadView.el = this.$el.find(".comments");
          this.commentReadView.render();
          
          //localization of edit data list 
          $(this.el).find(".locale_Title").html(Locale["locale_Title"].message);
          $(this.el).find(".locale_Description").html(Locale["locale_Description"].message);

        }
      }catch(e){
        alert("Bug, there was a problem rendering the contents of the data list format: "+this.format);
      }
      
      return this;
    },
    
    changeViewsOfInternalModels : function() {
   
      // Create a CommentReadView     
      this.commentReadView = new UpdatingCollectionView({
        collection           : this.model.get("comments"),
        childViewConstructor : CommentReadView,
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
      alert("DATA LIST EDIT VIEW datumIdsChecked "+ JSON.stringify(datumIdsChecked));

      return datumIdsChecked;
    },
    createPlaylistAndPlayAudioVideo : function(datumIds){
      this.model.getAllAudioAndVideoFiles(datumIds, function(audioAndVideoFilePaths){
        alert("TODO show playlist and audio player for all audio/video in datums "+JSON.stringify(audioAndVideoFilePaths));
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
        Utils.debug("Attemptign to remove datum(s) from the current datalist, there was something that went wrong.",e);
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
      this.model.set("title", this.$el.find(".data-list-title").val());
      if(this.model.id){
        window.appView.addUnsavedDoc(this.model.id);
      }
    },
    
    updateDescription: function(){
      this.model.set("description", this.$el.find(".data-list-description").val());
      if(this.model.id){
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
    
    saveSearchDataList : function(e, callback){
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
      searchself.model.saveAndInterConnectInApp(function(){
        searchself.format = "search-minimized";
        searchself.render();
        searchself.model.setAsCurrentDataList(callback);
//        window.location.href = "#render/true";
      });

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
      Utils.debug("DESTROYING DATALIST EDIT VIEW "+ this.format);

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
