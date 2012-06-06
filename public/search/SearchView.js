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
     *        and the advanced power search, as well as their events.\
     * 
     * @description Starts the Search.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("SEARCH init: " + this.el);
      
      this.model.bind('change', this.render, this);
    },
    
    /**
     * The underlying model of the SearchView is a Search.
     */
    model : Search,
    
    /**
     * Events that the SearchView is listening to and their handlers.
     */
    events : {
      "change" : "search"
    },
    
    /**
     * The Handlebars template rendered as the SearchView.
     */
    template : Handlebars.compile(searchTemplate),
    
    /**
     * Renders the SearchView.
     */
    render : function() {
      Utils.debug("SEARCH render: " + this.el);
      if (this.model != undefined) {
        // Display the SearchView
        this.setElement($("#search"));
        $(this.el).html(this.template(this.model.toJSON()));
        
        Utils.debug("\trendering search: "+ this.model.get("searchKeywords"));
      } else {
        Utils.debug("\tSearch model was undefined");
      }
      
      return this;
    },
    
    /**
     * Perform a search.
     */
    search : function() {
      Utils.debug("In search");
      // TODO Display the search results
    },
    
    /**
     * Initialize the sample Search.
     */
    loadSample : function() {
      this.model.set("searchKeywords","naya");
      Utils.debug("Changing search keyword: "+ this.model.get("searchKeywords"));
    }
  });

  return SearchView;
});