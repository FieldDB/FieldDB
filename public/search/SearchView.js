define([ 
    "use!backbone", 
    "use!handlebars", 
    "text!search/search.handlebars",
    "datum/Datum",
    "search/Search",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars, 
    searchTemplate,
    Datum,
    Search
) {
  var SearchView = Backbone.View.extend(
  /** @lends SearchView.prototype */
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
      "click .icon-search" : "search"
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
      Utils.debug("Will search for " + $("#search_box").val());
      
      (new Datum()).searchByDatumField("gloss", $("#search_box").val(), function(datumIds) {
        appView.dataListView.model.set("datumIds", datumIds);
        appView.dataListView.renderNewModel();
      });
    },
    
    /**
     * Initialize the sample Search.
     */
    loadSample : function() {
      this.model.set({
        searchKeywords : "naya"
      });
    }
  });

  return SearchView;
});