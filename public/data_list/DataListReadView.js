//TODO this is mostly a copy of DataListEditView, we will need to think about what actually needs to go in here and what it will look like.
define( [ 
  "backbone", 
  "handlebars",
  "data_list/DataList",
  "datum/Datum",
  "datum/DatumReadView",
  "datum/Datums"
], function(
    Backbone, 
    Handlebars, 
    DataList, 
    Datum, 
    DatumReadView,
    Datums  
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
    initialize : function() {
      Utils.debug("DATALIST init: " + this.el);
      
    },

    /**
     * The underlying model of the DataListReadView is a DataList.
     */    
    model : DataList,
    
    /** 
     * The datumLatexViews array holds all the children of the
     * DataListReadView.
     */
    datumLatexViews : [],

    /**
     * Events that the DataListReadView is listening to and their handlers.
     */
    events : {
      'click a.servernext': 'nextResultPage',
      'click .serverhowmany a': 'changeCount',
      "click #populateDataList" : "renderNewModel",// TODO remove after demo
      "click .icon-resize-small" : 'resizeSmall',
      "click .icon-resize-full" : "resizeFullscreen",    
      "click .icon-edit" : "showEditable" 
    },
    
    /**
     * The Handlebars template rendered as the DataListFullscreenReadView.
     */
    fullscreenTemplate : Handlebars.templates.data_list_read_fullscreen,
    
    /**
     * The Handlebars template rendered as the DataListEmbeddedReadView.
     */
    embeddedTemplate : Handlebars.templates.data_list_read_embedded,
    
    /**
     * The Handlebars template rendered as the DataListLinkReadView.
     */
    linkTemplate : Handlebars.templates.data_list_read_link,

    /**
     * The Handlebars template of the pagination footer, which is used
     * as a partial.
     */
    footerTemplate : Handlebars.templates.paging_footer,

    /**
     * Initially renders the DataListReadView. This should only be called by 
     * this.initialize. To update the current rendering, use renderUpdate()
     * instead.
     */
    render : function() {
      Utils.debug("DATALIST render: " + this.el);
      
      if (this.format == "link") {
        // Display the Data List
        this.setElement($("#data-list-link"));
        $(this.el).html(this.linkTemplate(this.model.toJSON()));
      } else if (this.format == "leftSide") {
        this.setElement($("#data-list-embedded"));
        $(this.el).html(this.embeddedTemplate(this.model.toJSON()));
          
        // Display the pagination footer
        this.renderUpdatedPagination();
       
      }else if (this.format == "fullscreen") {
        // Display the Data List
        this.setElement($("#data-list-fullscreen"));
        $(this.el).html(this.fullscreenTemplate(this.model.toJSON()));
          
        // Display the pagination footer
        this.renderUpdatedPagination();
        
        // TODO Display the first page of DatumReadViews.
        // this.renderNewModel();
      }
      
      return this;
    },
    
    /**
     * Re-renders the datalist header based on the current model.
     */
    renderUpdatedDataList : function() {
      if ((this.format == "leftSide") || (this.format == "fullscreen")) {
        $(".title").text(this.model.get("title"));
        $(".dateCreated").text(this.model.get("dateCreated"));
        $(".description").text(this.model.get("description"));
      }
    },
    
    /**
     * Re-renders the datums based on the current model.
     * Re-renders the pagination footer based on the current pagination data.
     * 
     * This should be called whenever the model is replaced (i.e. when you open
     * a new DataList or perform a new Search).
     */
    renderNewModel : function() {
      // Remove all the DatumReadViews that are currently being displayed
      while(this.datumLatexViews.length > 0) {
        var datumLatexView = this.datumLatexViews.pop();
        datumLatexView.remove();
      }
      
      // Display the first page of Datum and the pagination footer
      for (var i = 0; i < this.perPage; i++) {
        var datumId = this.model.get("datumIds")[i];
        if (datumId) {
          this.addOne(datumId);
        }
      }
    },
    
    /**
     * Re-calculates the pagination values and re-renders the pagination footer.
     */
    renderUpdatedPagination : function() {
      // Replace the old pagination footer
      $("#data_list_footer").html(this.footerTemplate(this.getPaginationInfo()));
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
      var currentPage = (this.datumLatexViews.length > 0) ? Math.ceil(this.datumLatexViews.length / this.perPage) : 1;
      var totalPages = (this.datumLatexViews.length > 0) ? Math.ceil(this.model.get("datumIds").length / this.perPage) : 1;
      
      return {
        currentPage : currentPage,
        totalPages : totalPages,
        perPage : this.perPage,
        morePages : currentPage < totalPages
      };
    },
    
    /**
     * Displays a new DatumReadView for the Datum with the given datumId
     * and updates the pagination footer.
     * 
     * @param {String} datumId The datumId of the Datum to display.
     */
    addOne : function(datumId) {
      // Get the corresponding Datum from PouchDB 
      var d = new Datum({
        corpusname : window.app.get("corpus").get("corpusname")
      });
      d.id = datumId;
      var self = this;
      d.changeCorpus(window.app.get("corpus").get("corpusname"), function(){
        d.fetch({
          success : function(model, response) {
            // Render a DatumReadView for that Datum at the end of the DataListEditView
            var view = new DatumReadView({
              model : model,
              tagName : "li"
            });
            view.format = "latex";
            $('#data_list_content').append(view.render().el);
            
            // Keep track of the DatumReadView
            self.datumLatexViews.push(view);
            
            // Display the updated DatumReadView
            self.renderUpdatedPagination();
          },
          
          error : function() {
            Utils.debug("Error fetching datum: " + datumId);
          }
        });
      });
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
      var startIndex = this.datumLatexViews.length;
      var endIndex = startIndex + this.perPage;
      
      // Add a DatumReadView for each one
      for (var i = startIndex; i < endIndex; i++) {
        var datumId = this.model.get("datumIds")[i]; 
        if (datumId) {
          this.addOne(datumId);
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
    }
  });

  return DataListReadView;
});