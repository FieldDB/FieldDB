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
     * @property {String} format Valid formats are "link", "fullscreen", 
     * "leftSide", and "minimized".
     * 
     * @description Starts the DataListReadView with no children.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function(options) {
      Utils.debug("DATALIST init: " + this.el);
      
      this.changeViewsOfInternalModels();
      this.model.bind('change:title', this.changeViewsOfInternalModels, this);
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
      "click .add-comment-datalist-read" : 'insertNewComment',
      
      "click .icon-resize-small" : 'resizeSmall',
      "click .icon-resize-full" : "resizeFullscreen",    
      "click .icon-edit" : "showEditable",
      "click .icon-minus-sign" : function() {
        this.format = "minimized";
        this.render();
      },
      "click .icon-plus-sign" : function() {
        this.format = "leftSide";
        this.render();
      } 
    },
    
    /**
     * The Handlebars template rendered as the DataListFullscreenReadView.
     */
    templateFullscreen : Handlebars.templates.data_list_read_fullscreen,
    
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
      if (this.format == "link") {
        Utils.debug("DATALIST READ LINK render: " + this.el);

        // Display the Data List
        $(this.el).html(this.templateLink(this.model.toJSON()));
      
      } else if (this.format == "leftSide") {
        Utils.debug("DATALIST READ LEFTSIDE render: " + this.el);

        this.setElement($("#data-list-quickview"));
        $(this.el).html(this.templateSummary(this.model.toJSON()));

      } else if (this.format == "fullscreen") {
        Utils.debug("DATALIST READ FULLSCREEN render: " + this.el);

        // Display the Data List
        this.setElement($("#data-list-fullscreen"));
        $(this.el).html(this.templateFullscreen(this.model.toJSON()));
        
      } else if(this.format == "middle") {
        Utils.debug("DATALIST READ CENTER render: " + this.el);

        this.setElement($("#data-list-embedded"));
        $(this.el).html(this.templateEmbedded(this.model.toJSON()));
        
      } else if (this.format == "minimized") {
        Utils.debug("DATALIST READ MINIMIZED render: " + this.el);

        this.setElement($("#data-list-quickview"));
        $(this.el).html(this.templateMinimized(this.model.toJSON()));
      }
      try{
        if (this.format && this.format.indexOf("minimized") == -1){
          // Display the CommentReadView
          this.commentReadView.el = this.$('.comments');
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
    
    resizeSmall : function(){
      this.format == "leftSide";
      this.render();
      window.app.router.showDashboard();
    },
    
    resizeFullscreen : function(){
      this.format == "fullscreen";
      this.render();
      window.app.router.showFullscreenDataList();
    },
    
    //bound to pencil button
    showEditable :function(){
      window.appView.currentDataListEditView.render();
    },
    
    //This the function called by the add button, it adds a new comment state both to the collection and the model
    insertNewComment : function() {
      console.log("I'm a new comment!");
      var m = new Comment({
        "text" : this.$el.find(".comment-new-text").val(),
      });
      this.model.get("comments").add(m);
      this.$el.find(".comment-new-text").val("");
    }
  });

  return DataListReadView;
});