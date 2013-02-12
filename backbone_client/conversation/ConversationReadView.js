define( [ 
    "backbone", 
    "handlebars",
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
    Comment,
    Comments,
    CommentReadView,
    DataList, 
    Datum, 
    DatumReadView,
    Datums,
    UpdatingCollectionView
) {
  var DataListReadView = Backbone.View.extend(
  /** @lends DataListReadView.prototype */
  {
    /**
     * @class A list of datum that are returned as a search result. It will have
     *        check-boxes on the side and a datum menu on the bottom.
     * 
     * @property {String} format Valid formats are "link", "fullscreen", "centerWell",
     * "leftSide", and "minimized".
     * 
     * @description Starts the DataListReadView with no children.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function(options) {
      if (OPrime.debugMode) OPrime.debug("DATALIST READ VIEW init: ");
      
      this.changeViewsOfInternalModels();
      this.model.bind('change:dateCreated', function(){
        this.changeViewsOfInternalModels();
        this.render();
      }, this);
      
      this.model.bind('change:datumIds', function(){
        this.render();
      }, this);
    },

    /**
     * The underlying model of the DataListReadView is a DataList.
     */    
    model : DataList,

    /**
     * Events that the DataListReadView is listening to and their handlers.
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
      "click .icon-edit" : "showEditable",
      "click .icon-minus-sign" : function(e) {
        e.preventDefault();
        this.format = "minimized";
        this.render();
      },
      "click .icon-plus-sign" : function(e) {
        e.preventDefault();
        this.format = "leftSide";
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
        var r=window.confirm("Are you sure you want to remove these items from the datalist?");
        if (r==true) {
        	this.removeDatumFromThisList(this.getAllCheckedDatums());
        	return false;
        }
        else {
        	return false;
        }
      },
      "click .icon-lock": function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        
        this.model.applyFunctionToAllIds(this.getAllCheckedDatums(), "encrypt");
//        this.$el.find(".icon-unlock").toggleClass("icon-unlock icon-lock");
//        this.render();

        return false;
      },
      "click .icon-unlock": function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        
        this.model.applyFunctionToAllIds(this.getAllCheckedDatums(), "decrypt");
//        this.$el.find(".icon-lock").toggleClass("icon-unlock icon-lock");
//        this.render();

        return false;
      },
      "click .icon-eye-open" : function(e){
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        var confidential = app.get("corpus").get("confidential");
        if(!confidential){
          alert("This is a bug: cannot find decryption module for your corpus.")
        }
        var self = this;
        confidential.turnOnDecryptedMode(function(){
          self.$el.find(".icon-eye-close").toggleClass("icon-eye-close icon-eye-open");
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
          alert("This is a bug: cannot find decryption module for your corpus.")
        }
        confidential.turnOffDecryptedMode();
        this.$el.find(".icon-eye-open").toggleClass("icon-eye-close icon-eye-open");

        return false;
      }
    },
    
    /**
     * The Handlebars template rendered as the DataListFullscreenReadView.
     */
    templateFullscreen : Handlebars.templates.data_list_read_embedded,
    
    /**
     * The Handlebars template rendered as the DataListEmbeddedReadView.
     */
    templateEmbedded : Handlebars.templates.data_list_read_embedded,
    
    /** 
     * The Handlebars template rendered as Summary.
     */
    templateSummary : Handlebars.templates.data_list_summary_read_embedded,
    
    /**
     * The Handlebars template rendered as the DataListLinkReadView.
     */
    templateLink : Handlebars.templates.data_list_read_link,

    /**
     * The Handlebars template of the pagination footer, which is used
     * as a partial.
     */
    footerTemplate : Handlebars.templates.paging_footer,
    
    /**
     * The Handlebars template of the minimized version
     */
    templateMinimized : Handlebars.templates.data_list_summary_read_minimized,
    
    render : function() {
      if(this.format != "link"){
        window.appView.currentReadDataListView.destroy_view();
        if(window.appView.currentEditDataListView){
          window.appView.currentEditDataListView.destroy_view();
        }
      }
      
      var jsonToRender = this.model.toJSON();
      jsonToRender.datumCount = this.model.get("datumIds").length;
      jsonToRender.decryptedMode = window.app.get("corpus").get("confidential").decryptedMode;

      if (this.format == "link") {
        if (OPrime.debugMode) OPrime.debug("DATALIST READ LINK render: ");

        // Display the Data List
        $(this.el).html(this.templateLink(jsonToRender));
      
      } else if (this.format == "leftSide") {
        if (OPrime.debugMode) OPrime.debug("DATALIST READ LEFTSIDE render: ");

        this.setElement($("#data-list-quickview-header"));
        $(this.el).html(this.templateSummary(jsonToRender));
        
        window.appView.currentPaginatedDataListDatumsView.renderInElement(
            $("#data-list-quickview").find(".current-data-list-paginated-view") );
        
        //Localization of icons for quickview
        $(this.el).find(".locale_Hide_Datalist").attr("title", Locale.get("locale_Hide_Datalist"));
        $(this.el).find(".locale_Edit_Datalist").attr("title", Locale.get("locale_Edit_Datalist"));
        $(this.el).find(".locale_Show_Fullscreen").attr("title", Locale.get("locale_Show_Fullscreen"));
        
      } else if (this.format == "fullscreen") {
        if (OPrime.debugMode) OPrime.debug("DATALIST READ FULLSCREEN render: ");

        // Display the Data List
        this.setElement($("#data-list-fullscreen-header"));
        $(this.el).html(this.templateFullscreen(jsonToRender));
        
        window.appView.currentPaginatedDataListDatumsView.renderInElement(
            $("#data-list-fullscreen").find(".current-data-list-paginated-view") );
        
        //Localization of icons for fullscreen
        $(this.el).find(".locale_Edit_Datalist").attr("title", Locale.get("locale_Edit_Datalist"));
        $(this.el).find(".locale_Show_in_Dashboard").attr("title", Locale.get("locale_Show_in_Dashboard"));
       
      } else if(this.format == "centerWell") {
        if (OPrime.debugMode) OPrime.debug("DATALIST READ CENTER render: ");

        this.setElement($("#data-list-embedded-header"));
        $(this.el).html(this.templateEmbedded(jsonToRender));
        
        window.appView.currentPaginatedDataListDatumsView.renderInElement(
            $("#data-list-embedded").find(".current-data-list-paginated-view") );
       
        //Localization of icons for centerWell
        $(this.el).find(".locale_Edit_Datalist").attr("title", Locale.get("locale_Edit_Datalist"));
        $(this.el).find(".locale_Show_in_Dashboard").attr("title", Locale.get("locale_Show_in_Dashboard"));

      } else if (this.format == "minimized") {
        if (OPrime.debugMode) OPrime.debug("DATALIST READ MINIMIZED render: ");

        this.setElement($("#data-list-quickview-header"));
        $(this.el).html(this.templateMinimized(jsonToRender));
      
        //localization of the minimized data list icons
        $(this.el).find(".locale_Show_Datalist").attr("title", Locale.get("locale_Show_Datalist"));

      }
      try{
        if (this.format && this.format.indexOf("minimized") == -1){
          // Display the CommentReadView
          this.commentReadView.el = this.$('.comments');
          this.commentReadView.render();
          
          //localization of data list menu
          $(this.el).find(".locale_Play_Audio_checked").attr("title", Locale.get("locale_Play_Audio_checked"));
          $(this.el).find(".locale_Remove_checked_from_datalist_tooltip").attr("title", Locale.get("locale_Remove_checked_from_datalist_tooltip"));
          $(this.el).find(".locale_Plain_Text_Export_Tooltip_checked").attr("title", Locale.get("locale_Plain_Text_Export_Tooltip_checked"));
          $(this.el).find(".locale_Encrypt_checked").attr("title", Locale.get("locale_Encrypt_checked"));
          $(this.el).find(".locale_Decrypt_checked").attr("title", Locale.get("locale_Decrypt_checked"));
          if(jsonToRender.decryptedMode){
            $(this.el).find(".locale_Show_confidential_items_Tooltip").attr("title", Locale.get("locale_Hide_confidential_items_Tooltip"));
          }else{
            $(this.el).find(".locale_Show_confidential_items_Tooltip").attr("title", Locale.get("locale_Show_confidential_items_Tooltip"));
          }          
          $(this.el).find(".locale_Export_checked_as_LaTeX").attr("title", Locale.get("locale_Export_checked_as_LaTeX"));
          $(this.el).find(".locale_Export_checked_as_CSV").attr("title", Locale.get("locale_Export_checked_as_CSV"));
          $(this.el).find(".locale_Add").html(Locale.get("locale_Add"));
          
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
//      alert("DATA LIST READ VIEW datumIdsChecked "+ JSON.stringify(datumIdsChecked));

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
        this.model.set("datumIds", _.difference(this.model.get("datumIds"), datumIds) );
        for (var i = 0; i < datumIds.length; i++) {
        	appView.currentPaginatedDataListDatumsView.collection.remove(appView.currentPaginatedDataListDatumsView.collection.get(datumIds[i]));
      	}
        this.model.saveAndInterConnectInApp();
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
    
    //bound to pencil button
    showEditable :function(e){
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      if(window.appView.currentEditDataListView){
        window.appView.currentEditDataListView.format = this.format;
        window.appView.currentEditDataListView.render();
      }
    },
    
    /**
     * 
     * http://stackoverflow.com/questions/6569704/destroy-or-remove-a-view-in-backbone-js
     */
    destroy_view: function() {
      if (OPrime.debugMode) OPrime.debug("DESTROYING DATALIST READ VIEW "+ this.format);

      //COMPLETELY UNBIND THE VIEW
      this.undelegateEvents();

      $(this.el).removeData().unbind(); 

      //Remove view from DOM
//      this.remove();  
//      Backbone.View.prototype.remove.call(this);
      }
  });

  return DataListReadView;
});
