define([ "use!backbone", "use!handlebars", "datum/Datums",
    "text!/datum/datum_latex.handlebars", "text!datum/datums.handlebars" ], function(Backbone, Handlebars,
    Datums, datum_latexTemplate, datumsTemplate) {
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
    initialize : function() {
      // this.collection.on('reset', this.render, this);
      // this.collection.on('change', this.render, this);
    },

    events : {
      'click a.servernext' : 'nextResultPage',
      'click a.serverprevious' : 'previousResultPage',
      'click a.orderUpdate' : 'updateSortBy',
      'click a.serverlast' : 'gotoLast',
      'click a.page' : 'gotoPage',
      'click a.serverfirst' : 'gotoFirst',
      'click a.serverpage' : 'gotoPage',
      'click .serverhowmany a' : 'changeCount'
    },
    collection : Datums,
    tagName : 'aside',
    template : Handlebars.compile(datumsTemplate),

    render : function() {
      $(this.el).html(this.template(this.model.toJSON()));
      console.log("\trendering datums " );
    
//      this.$el.appendTo('#pagination');
//      var html = this.template(this.collection.info());
//      this.$el.html(html);
    },

    updateSortBy : function(e) {
      e.preventDefault();
      var currentSort = $('#sortByField').val();
      this.collection.updateOrder(currentSort);
    },

    nextResultPage : function(e) {
      e.preventDefault();
      this.collection.requestNextPage();
    },

    previousResultPage : function(e) {
      e.preventDefault();
      this.collection.requestPreviousPage();
    },

    gotoFirst : function(e) {
      e.preventDefault();
      this.collection.goTo(this.collection.information.firstPage);
    },

    gotoLast : function(e) {
      e.preventDefault();
      this.collection.goTo(this.collection.information.lastPage);
    },

    gotoPage : function(e) {
      e.preventDefault();
      var page = $(e.target).text();
      this.collection.goTo(page);
    },

    changeCount : function(e) {
      e.preventDefault();
      var per = $(e.target).text();
      this.collection.howManyPer(per);
    }

  });

  return DatumsView;
});