define([ 
    "use!backbone", 
    "use!handlebars", 
    "text!search/advanced_search.handlebars",
    "search/Search",
    "datum/DatumFields",
    "datum/DatumFieldView",
    "app/UpdatingCollectionView",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars, 
    advanced_searchTemplate,
    Search,
    DatumFields,
    DatumFieldView,
    UpdatingCollectionView
) {
  var AdvancedSearchView = Backbone.View.extend(
  /** @lends AdvancedSearchView.prototype */
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
      
      //grabbing datumFields from datum and session in the corpus
      this.advancedSearchDatumView = new UpdatingCollectionView({
        collection           : window.app.get("corpus").get("datumFields"),
        childViewConstructor : DatumFieldView,
        childViewTagName     : 'li'
      });
      this.advancedSearchSessionView = new UpdatingCollectionView({
        collection           : window.app.get("corpus").get("sessionFields"),
        childViewConstructor : DatumFieldView,
        childViewTagName     : 'li'
      });
      
      
      
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
    template : Handlebars.compile(advanced_searchTemplate),
    advancedSearchDatumView : UpdatingCollectionView,
    advancedSearchSessionView : UpdatingCollectionView,
   
    /**
     * Renders the SearchView.
     */
    render : function() {
      Utils.debug("SEARCH render: " + this.el);
      if (this.model != undefined) {
        // Display the SearchView
        this.setElement($("#fullscreen-search-view"));
        $(this.el).html(this.template(this.model.toJSON()));
        

        this.advancedSearchDatumView.el = this.$('.advanced_search_datum');
        this.advancedSearchDatumView.render();

        this.advancedSearchSessionView.el = this.$('.advanced_search_session');
        this.advancedSearchSessionView.render();

        
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
      this.model.set({
        searchKeywords : "naya"
      });
    }
  });

  return AdvancedSearchView;
});