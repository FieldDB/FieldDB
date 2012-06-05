define( [ 
    "use!backbone", 
    "use!handlebars",
    "datum/Datum",
    "datum/DatumLatexView",
    "datum/Datums",
    "data_list/DataList",
    "text!data_list/data_list.handlebars",
    "text!datum/paging_footer.handlebars"
], function(
    Backbone, 
    Handlebars, 
    Datum, 
    DatumLatexView,
    Datums,
    DataList, 
    data_listTemplate,
    pagingFooterTemplate
) {
  var DataListView = Backbone.View.extend(
  /** @lends DataList.prototype */
  {
    /**
     * TODO Update description
     * @class A list of datum that are returned as a search result. It will have
     *        check-boxes on the side and a datum menu on the bottom.
     *        
     *        This class is based off of the Infinite paginator by Addy Osmani's AppView
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      // Update the display every time the model is changed
      this.model.bind('change', this.renderNewModel);
    },
    
    events : {
      'click a.servernext': 'nextResultPage'
    },
    
    model : DataList,
    
    classname : "dataList",
    
    template : Handlebars.compile(data_listTemplate),
    
    footerTemplate : Handlebars.compile(pagingFooterTemplate),

    /**
     * Initially renders the DataListView. This should only be called by 
     * this.initialize. To update the current rendering, use renderUpdate()
     * instead.
     */
    render : function() {
      // Display the Data List
      $(this.el).html(this.template(this.model.toJSON()));
      this.$el.appendTo('#data_list');
      
      // Display the pagination footer and the first page of DatumLatexViews.
      // this.renderNewModel();
      
      return this;
    },
    
    /**
     * Based on the number of items per page and the current page, calculate the current
     * pagination info.
     * 
     * @return {Object} JSON to be sent to the footerTemplate.
     */
    getPaginationInfo : function() {
      var totalPages = Math.ceil(this.model.get("datumIds").length / this.perPage);
      var footerjson  = {};
      footerjson.currentPage = this.currentPage,
      footerjson.totalPages = totalPages,
      footerjson.perPage = this.perPage,
      footerjson.morePages = this.currentPage < totalPages;
      
      return footerjson;
    },
    
    /**
     * Re-renders the pagination footer based on the current pagination data.
     * Re-renders the datums based on the current model.
     * 
     * This should be called whenever the model is replaced (i.e. when you open
     * a new DataList or perform a new Search).
     */
    renderNewModel : function() {
      // Remove all the DatumLatexViews that are currently being displayed
      while(this.datumLatexViews.length > 0) {
        var datumLatexView = this.datumLatexViews.pop();
        datumLatexView.remove();
      }
      
      // Start at page one
      this.currentPage = 1;
      
      // Display the updated pagination footer
      this.renderUpdatedPagination();
      
      // Display the first page of Datum
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
    
    datumLatexViews : [],

    /**
     * Displays a new DatumLatexView for the Datum with the given datumId.
     * 
     * @param {String} datumId The datumId of the Datum to display.
     */
    addOne : function(datumId) {
      // Get the corresponding Datum from PouchDB 
      var d = new Datum({id: datumId});
      d.fetch();
      
      // Render a DatumLatexView for that Datum at the end of the DataListView
      var view = new DatumLatexView({
        model :  d
      });
      $('#data_list_content').append(view.render().el);
      
      // Keep track of the DatumLatexView
      this.datumLatexViews.push(view);
    },
    
    /**
     * For paging: the current page.
     */
    currentPage : 1,
    
    /**
     * For paging, the number of items per page.
     */
    perPage : 3,

    nextResultPage: function (e) {
      e.preventDefault();
      Utils.debug("in nextResultPage");
      // this.collection.requestNextPage();
    },
  });

  return DataListView;
});