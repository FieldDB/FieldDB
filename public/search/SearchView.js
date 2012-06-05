define([ 
    "use!backbone", 
    "use!handlebars", 
    "search/Search",
    "text!search/search.handlebars",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars, 
    Search,
    searchTemplate
) {
  var SearchView = Backbone.View.extend(
  /** @lends DatumFieldView.prototype */
  {
    /**
     * @class Search View handles the render of the global search in the corner,
     *        and the advanced power search, as well as their events.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      this.on('all', function(e) {
        this.render();
      });
      
      this.model.bind('change', this.render);
      
      // Update display
      this.render();
    },
    
    events : {
      "change" : "render",
      "all" : "render"
//      "blur" : this.model.saveKeyword
    },
    
    model : Search,
    
    classname : "search",
    
    template : Handlebars.compile(searchTemplate),
    
    render : function() {
      if (this.model != undefined) {
        $(this.el).html(this.template(this.model.toJSON()));
        this.$el.appendTo('#search');
        Utils.debug("\trendering search: "+ this.model.get("searchKeywords"));
      } else {
        Utils.debug("\tSearch model was undefined");
      }
      
      return this;
    },
    
    /**
     * Initialize the sample Search.
     */
    loadSample : function() {
      this.model.set("searchKeywords","naya");
      Utils.debug("Changing search keyword: "+ this.model.get("searchKeywords"));
      
      this.render();
    }
  });

  return SearchView;
});