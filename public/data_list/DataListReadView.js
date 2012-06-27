define( [ 
  "use!backbone", 
  "use!handlebars",
  "text!data_list/data_list_read_fullscreen.handlebars",
  "text!data_list/data_list_read_embedded.handlebars",
  "text!datum/paging_footer.handlebars",
  "data_list/DataList",
  "datum/Datum",
  "datum/DatumLatexReadView",
  "datum/Datums"
], function(
    Backbone, 
    Handlebars, 
    dataListReadFullscreenTemplate,
    dataListReadEmbeddedTemplate,
    pagingFooterTemplate,
    DataList, 
    Datum, 
    DatumLatexReadView,
    Datums  
) {
  var DataListReadView = Backbone.View.extend(
  /** @lends DataListReadView.prototype */
  {
    /**
     * 
     * @class A list of datum that are returned as a search result. It will have
     *        check-boxes on the side and a datum menu on the bottom.
     * 
     * @description Starts the DataListReadView with no children.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("DATALIST init: " + this.el);
      
      this.model.bind("change:title change:dateCreated change:description", this.renderUpdatedDataList, this);
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
      "click #populateDataList" : "renderNewModel"    // TODO remove after demo
    },
    
    /**
     * The Handlebars template rendered as the DataListReadView.
     */
    fullscreenTemplate : Handlebars.compile(dataListReadFullscreenTemplate),
    embeddedTemplate : Handlebars.compile(dataListReadEmbeddedTemplate),

    /**
     * The Handlebars template of the pagination footer, which is used
     * as a partial.
     */
    footerTemplate : Handlebars.compile(pagingFooterTemplate),

    /**
     * Initially renders the DataListReadView. This should only be called by 
     * this.initialize. To update the current rendering, use renderUpdate()
     * instead.
     */
    render : function() {
      Utils.debug("DATALIST render: " + this.el);
      if (this.model != undefined) {
        // Display the Data List
        this.setElement($("#data_list"));
        $(this.el).html(this.embeddedTemplate(this.model.toJSON()));
      //TODO do the other template
        
        // Display the pagination footer
        this.renderUpdatedPagination();
        
        // TODO Display the first page of DatumLatexReadViews.
        // this.renderNewModel();
      } else {
        Utils.debug("\tDataList model is not defined");
      }
      
      return this;
    },
    
    /**
     * Re-renders the datalist header based on the current model.
     */
    renderUpdatedDataList : function() {
      $(".title").text(this.model.get("title"));
      $(".dateCreated").text(this.model.get("dateCreated"));
      $(".description").text(this.model.get("description"));
    },
    
    /**
     * Re-renders the datums based on the current model.
     * Re-renders the pagination footer based on the current pagination data.
     * 
     * This should be called whenever the model is replaced (i.e. when you open
     * a new DataList or perform a new Search).
     */
    renderNewModel : function() {
      // Remove all the DatumLatexReadViews that are currently being displayed
      while(this.datumLatexViews.length > 0) {
        var datumLatexView = this.datumLatexViews.pop();
        datumLatexView.remove();
      }
      
      // Display the first page of Datum and the pagination footer
      for (i = 0; i < this.perPage; i++) {
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
     * Displays a new DatumLatexReadView for the Datum with the given datumId
     * and updates the pagination footer.
     * 
     * @param {String} datumId The datumId of the Datum to display.
     */
    addOne : function(datumId) {
      // Get the corresponding Datum from PouchDB 
      var d = new Datum();
      d.id = datumId;
      var self = this;
      d.fetch({
        success : function() {
          // Restructure Datum's inner models
          d.restructure();

          // Render a DatumLatexReadView for that Datum at the end of the DataListReadView
          var view = new DatumLatexReadView({
            model :  d
          });
          $('#data_list_content').append(view.render().el);
          
          // Keep track of the DatumLatexReadView
          self.datumLatexViews.push(view);
          
          // Display the updated DatumLatexReadView
          self.renderUpdatedPagination();
        },
        
        error : function() {
          Utils.debug("Error fetching datum: " + datumId);
        }
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
     * Add one page worth of DatumLatexReadViews from the DataList.
     * 
     * @param {Object} e The event that triggered this method.
     */
    nextResultPage: function (e) {
      e.preventDefault();
      
      // Determine the range of indexes into the model's datumIds array that are 
      // on the page to be displayed
      var startIndex = this.datumLatexViews.length;
      var endIndex = startIndex + this.perPage;
      
      // Add a DatumLatexReadView for each one
      for (var i = startIndex; i < endIndex; i++) {
        var datumId = this.model.get("datumIds")[i]; 
        if (datumId) {
          this.addOne(datumId);
        }
      }
    }
  });

  return DataListReadView;
});