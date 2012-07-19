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
     * @property {String} format Valid formats are "link", "fullscreen", or "leftSide".
     * 
     * @description Starts the DataListReadView with no children.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function(options) {
      Utils.debug("DATALIST init: " + this.el);
      
      // Create a DatumView
      if (options.datumCollection) {
        this.datumsView = new UpdatingCollectionView({
          collection           : options.datumCollection,
          childViewConstructor : DatumReadView,
          childViewTagName     : "li",
          childViewFormat      : "latex"
        });
      }
      
      this.changeViewsOfInternalModels();
      this.model.bind('change', this.changeViewsOfInternalModels, this);

      // Remove options
      delete this.model.collection;
      
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
      
      'click a.servernext': 'nextResultPage',
      'click .serverhowmany a': 'changeCount',
      "click .icon-resize-small" : 'resizeSmall',
      "click .icon-resize-full" : "resizeFullscreen",    
      "click .icon-edit" : "showEditable" 
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

    render : function() {
      if (this.format == "link") {
        // Display the Data List
        $(this.el).html(this.templateLink(this.model.toJSON()));
      
      } else if (this.format == "leftSide") {
        this.setElement($("#data-list-quickview"));
        $(this.el).html(this.templateSummary(this.model.toJSON()));
        
        // Display the DatumFieldsView
        this.datumsView.el = this.$(".data_list_content");
        this.datumsView.render();
          
        // Display the pagination footer
        this.renderUpdatedPagination();
      
      } else if (this.format == "fullscreen") {
        // Display the Data List
        this.setElement($("#data-list-fullscreen"));
        $(this.el).html(this.templateFullscreen(this.model.toJSON()));
        
        // Display the CommentReadView
        this.commentReadView.el = this.$('.comments');
        this.commentReadView.render();

        // Display the DatumFieldsView
        this.datumsView.el = this.$(".data_list_content");
        this.datumsView.render();
        
        // Display the pagination footer
        this.renderUpdatedPagination();
      
      } else if(this.format == "middle") {
        this.setElement($("#data-list-embedded"));
        $(this.el).html(this.templateEmbedded(this.model.toJSON()));
      
        // Display the CommentReadView
        this.commentReadView.el = this.$('.comments');
        this.commentReadView.render();
        
        // Display the DatumFieldsView
        this.datumsView.el = this.$(".data_list_content");
        this.datumsView.render();
        
        // Display the pagination footer
        this.renderUpdatedPagination();
      } else {
        throw("You have not specified a format that the SessionReadView can understand.");
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
     * Re-calculates the pagination values and re-renders the pagination footer.
     */
    renderUpdatedPagination : function() {
      // Replace the old pagination footer
      $(".data-list-footer").html(this.footerTemplate(this.getPaginationInfo()));
    },
    
    /**
     * For paging, the number of items per page.
     */
    perPage : 3,
    
    /**
     * Based on the number of items per page and the current page, calculate the current
     * pagination info.
     * 
     * @return {Object} JSON to be sent to the footerTemplate.
     */
    getPaginationInfo : function() {
      var currentPage = (this.datumsView.collection.length > 0) ? Math.ceil(this.datumsView.collection.length / this.perPage) : 1;
      var totalPages = (this.datumsView.collection.length > 0) ? Math.ceil(this.model.get("datumIds").length / this.perPage) : 1;
      
      return {
        currentPage : currentPage,
        totalPages : totalPages,
        perPage : this.perPage,
        morePages : currentPage < totalPages
      };
    },
    
    /**
     * Change the number of items per page.
     * 
     * @param {Object} e The event that triggered this method.
     */
    changeCount : function(e) {
      e.preventDefault();
      
      // Change the number of items per page
      this.perPage = parseInt($(e.target).text());
    },

    /**
     * Add one page worth of DatumReadViews from the DataList.
     * 
     * @param {Object} e The event that triggered this method.
     */
    nextResultPage: function (e) {
      e.preventDefault();
      
      // Determine the range of indexes into the model's datumIds array that are 
      // on the page to be displayed
      var startIndex = this.datumsView.collection.length;
      var endIndex = startIndex + this.perPage;
      
      // Add a DatumReadView for each one
      for (var i = startIndex; i < endIndex; i++) {
        var datumId = this.model.get("datumIds")[i]; 
        if (datumId) {
          appView.dataListEditLeftSideView.addOne(datumId);
        }
      }
    },
    
    resizeSmall : function(){
      window.app.router.showDashboard();
    },
    
    resizeFullscreen : function(){
      window.app.router.showFullscreenDataList();
    },
    
    //bound to pencil button
    showEditable :function(){
      window.app.router.showEditableDataList();
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