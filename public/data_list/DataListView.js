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
    },
    
    events : {
      'click a.servernext': 'nextResultPage',
      'click a.serverprevious': 'previousResultPage',
      'click a.orderUpdate': 'updateSortBy',
      'click a.serverlast': 'gotoLast',
      'click a.page': 'gotoPage',
      'click a.serverfirst': 'gotoFirst',
      'click a.serverpage': 'gotoPage',
      'click .serverhowmany a': 'changeCount'
    },
    
    // el : '#data_list',
    
    model : DataList,
    
    classname : "dataList",
    
    template : Handlebars.compile(data_listTemplate),
    
    footerTemplate : Handlebars.compile(pagingFooterTemplate),

    /**
     * Displays a new DatumLatexView for every Datum in this DataList.
     */
    addAll : function() {
      // TODO Loop through all the datumIds in the DataList
      //      Call addOne() on each datumId
      // this.collection.each(this.addOne);
    },

    /**
     * Displays a new DatumLatexView for the Datum with the given datumId.
     * 
     * @param {String} datumId The datumId of the Datum to display.
     */
    addOne : function(datumId) {
      var view = new DatumLatexView({
        model :  m
      });
      $('#data_list_content').append(view.render().el);
    },

    render : function() {
      // Display the pagination footer
      var totalPages = this.model.get("datumIds").length
      var footerjson  = {};
      footerjson.currentPage = this.currentPage,
      footerjson.firstPage = 1,
      footerjson.totalPages = totalPages,
      footerjson.lastPage = totalPages,
      footerjson.perPage = this.perPage,
      footerjson.morePages = this.currentPage < totalPages;
      footerjson.afterFirstPage = this.currentPage > 1;
      footerjson.showNext = this.currentPage < totalPages;
      footerjson.showFirst = this.currentPage != 1;
      footerjson.showLast = this.currentPage != totalPages;
      Handlebars.registerPartial("paging_footer", this.footerTemplate(footerjson));
      
      $(this.el).html(this.template(this.model.toJSON()));
      this.$el.appendTo('#data_list');
      
      return this;
    },
    
    /**
     * For paging: the current page.
     */
    currentPage : 1,
    
    /**
     * For paging, the number of items per page.
     */
    perPage : 3,

    updateSortBy: function (e) {
      e.preventDefault();
      Utils.debug("in updateSortBy");
      // var currentSort = $('#sortByField').val();
      // this.collection.updateOrder(currentSort);
    },

    nextResultPage: function (e) {
      e.preventDefault();
      Utils.debug("in nextResultPage");
      // this.collection.requestNextPage();
    },

    previousResultPage: function (e) {
      e.preventDefault();
      Utils.debug("in previousResultPage");
      // this.collection.requestPreviousPage();
    },

    gotoFirst: function (e) {
      e.preventDefault();
      Utils.debug("in gotoFirst");
      // this.collection.goTo(this.collection.information.firstPage);
    },

    gotoLast: function (e) {
      e.preventDefault();
      Utils.debug("in gotoLast");
      // this.collection.goTo(this.collection.information.lastPage);
    },

    gotoPage: function (e) {
      e.preventDefault();
      Utils.debug("in gotoPage");
      // var page = $(e.target).text();
      // this.collection.goTo(page);
    },

    changeCount: function (e) {
      e.preventDefault();
      Utils.debug("in changeCount");
      // var per = $(e.target).text();
      // this.collection.howManyPer(per);
    }
  });

  return DataListView;
});