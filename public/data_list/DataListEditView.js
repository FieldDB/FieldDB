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
      Utils.debug("DATALIST init: " + this.el);

      this.changeViewsOfInternalModels();
      
      // If the model's title changes, chances are its a new datalist, re-render its internal models.
      this.model.bind('change:title', function(){
        this.changeViewsOfInternalModels();
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
      "click .add-comment-datalist-edit" : 'insertNewComment',

      "click .icon-resize-small" : 'resizeSmall',
      "click .icon-resize-full" : "resizeFullscreen",
      
      "blur .data-list-title": "updateTitle",
      "blur .data-list-description": "updateDescription",

      "click .icon-book" :"showReadonly",
      
      "click .save-datalist" : "updatePouch",
      "click .save-search-datalist" : "saveSearchDataList",
      "click .save-import-datalist" : "saveImportDataList",
      
      "click .icon-minus-sign" : function() {
        if(this.format == "search"){
          this.format = "search-minimized";
        }else{
          this.format = "minimized";
        }
        this.render();
      },
      "click .icon-plus-sign" : function() {
        if(this.format == "search-minimized"){
          this.format = "search";
        }else{
          this.format = "leftSide";
        }
        this.render();
      }
    },

    templateFullscreen : Handlebars.templates.data_list_edit_fullscreen,
   
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
      if (this.format == "fullscreen") {
        Utils.debug("DATALIST EDIT FULLSCREEN render: " + this.el);

        this.setElement($("#data-list-fullscreen"));
        $(this.el).html(this.templateFullscreen(this.model.toJSON()));
        
      } else if (this.format == "leftSide") {
        Utils.debug("DATALIST EDIT LEFTSIDE render: " + this.el);

        this.setElement($("#data-list-quickview"));
        $(this.el).html(this.templateSummary(this.model.toJSON()));

      }else if (this.format == "search") {
        Utils.debug("DATALIST EDIT SEARCH render: " + this.el);

        this.setElement($("#search-data-list-quickview"));
        $(this.el).html(this.templateSummary(this.model.toJSON()));
        $(this.el).addClass("well");

      }else if (this.format == "search-minimized") {
        Utils.debug("DATALIST EDIT SEARCH render: " + this.el);
        
        this.setElement($("#search-data-list-quickview"));
        $(this.el).html(this.templateMinimized(this.model.toJSON()));
        $(this.el).addClass("well");

      }else if (this.format == "import"){
        Utils.debug("DATALIST EDIT IMPORT render: " + this.el);

        this.setElement($("#import-data-list-view"));
        $(this.el).html(this.importTemplate(this.model.toJSON()));
        
      } else if (this.format == "centreWell") {
        Utils.debug("DATALIST EDIT CENTER render: " + this.el);

        this.setElement($("#data-list-embedded"));
        $(this.el).html(this.embeddedTemplate(this.model.toJSON()));
        
      } else if (this.format == "minimized") {
        Utils.debug("DATALIST EDIT MINIMIZED render: " + this.el);

        this.setElement($("#data-list-quickview"));
        $(this.el).html(this.templateMinimized(this.model.toJSON()));
      }else{
        Utils.debug("Bug: no format was specified for DataListEditView, nothing was rendered");
      }
      try{
        if (this.format && this.format.indexOf("minimized") == -1){
          // Display the CommentReadView
          this.commentReadView.el = this.$el.find(".comments");
          this.commentReadView.render();
          
        }
      }catch(e){
        alert("Bug, there was a problem rendering the contents of the data list format: "+this.format)
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
    
    resizeSmall : function(e){
      if(e){
        e.stopPropagation();
      }
//      this.format = "leftSide";
//      this.render();
      window.app.router.showDashboard();
    },
    
    resizeFullscreen : function(e){
      if(e){
        e.stopPropagation();
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
      }
      window.appView.currentReadDataListView.format = this.format;
      window.appView.currentReadDataListView.render();
    },
    
    updatePouch : function(e) {
      if(e){
        e.stopPropagation();
      }
      this.model.saveAndInterConnectInApp(function(){
        window.appView.renderReadonlyDataListViews();
      });
    },
    
    saveSearchDataList : function(e){
      if(e){
        e.stopPropagation();
      }
      var self = this;
      this.model.saveAndInterConnectInApp(function(){
          self.format = "search-minimized";
          self.render();
          self.model.setAsCurrentDataList();
        window.appView.renderReadonlyDataListViews();
      });
    },
    saveImportDataList : function(e){
      if(e){
        e.stopPropagation();
      }
      alert("TODO");
    },
    
  //This the function called by the add button, it adds a new comment state both to the collection and the model
    insertNewComment : function(e) {
      if(e){
        e.stopPropagation();
      }
      console.log("I'm a new comment!");
      var m = new Comment({
        "text" : this.$el.find(".comment-new-text").val(),
      });
      this.model.get("comments").add(m);
      if(this.model.id){
        window.appView.addUnsavedDoc(this.model.id);
      }
      this.$el.find(".comment-new-text").val("");
    }
    
  });

  return DataListEditView;
});