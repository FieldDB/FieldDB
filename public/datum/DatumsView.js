define( [
    "use!backbone", 
    "use!handlebars", 
    "datum/Datums"
], function(Backbone, Handlebars, Datums) {
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
      },
      collection: Datums
    });

    return DatumsView;
}); 