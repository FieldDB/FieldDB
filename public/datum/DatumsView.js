define( [
    "use!backbone", 
    "use!handlebars", 
    "datum/Datums",
    "text!datum/datums_paging_footer.handlebars"
], function(Backbone, Handlebars, Datums, datumsFooterTemplate) {
    var DatumsView = Backbone.View.extend(
      /** @lends DatumsView.prototype */
      {
          /**
           * @class 
           * 
           * Uses PaginationView
           *
           * @extends Backbone.View
           * @constructs
           */
      initialize: function () {

        this.collection.on('reset', this.render, this);
        this.collection.on('change', this.render, this);

        this.$el.appendTo('#pagination');

      },

      events: {
        'click a.servernext': 'nextResultPage',
        'click a.serverprevious': 'previousResultPage',
        'click a.orderUpdate': 'updateSortBy',
        'click a.serverlast': 'gotoLast',
        'click a.page': 'gotoPage',
        'click a.serverfirst': 'gotoFirst',
        'click a.serverpage': 'gotoPage',
        'click .serverhowmany a': 'changeCount'

      },
      collection: Datums,
      tagName: 'aside',
      datumsFooterTemplate: Handlebars.compile(datumsFooterTemplate),

      render: function () {
        var footerjson  = this.collection.info();
        footerjson.morePages= this.collection.info().currentPage < this.collection.info().totalPages;
        footerjson.afterFirstPage = this.collection.info().currentPage > this.collection.info().firstPage;
        footerjson.showNext = this.collection.info().currentPage < this.collection.info().totalPages;
        footerjson.showFirst = this.collection.info().currentPage != this.collection.info().firstPage;
        footerjson.showLast = this.collection.info().currentPage != this.collection.info().lastPage;
        
        this.$el.html(this.datumsFooterTemplate(footerjson));
      },

      updateSortBy: function (e) {
        e.preventDefault();
        var currentSort = $('#sortByField').val();
        this.collection.updateOrder(currentSort);
      },

      nextResultPage: function (e) {
        e.preventDefault();
        this.collection.requestNextPage();
      },

      previousResultPage: function (e) {
        e.preventDefault();
        this.collection.requestPreviousPage();
      },

      gotoFirst: function (e) {
        e.preventDefault();
        this.collection.goTo(this.collection.information.firstPage);
      },

      gotoLast: function (e) {
        e.preventDefault();
        this.collection.goTo(this.collection.information.lastPage);
      },

      gotoPage: function (e) {
        e.preventDefault();
        var page = $(e.target).text();
        this.collection.goTo(page);
      },

      changeCount: function (e) {
        e.preventDefault();
        var per = $(e.target).text();
        this.collection.howManyPer(per);
      }

    });

    return DatumsView;
}); 