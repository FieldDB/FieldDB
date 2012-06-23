define([ 
    "use!backbone", 
    "use!handlebars", 
    "text!search/advanced_search.handlebars",
    "datum/Datum",
    "datum/DatumFields",
    "datum/DatumFieldView",
    "search/Search",
    "app/UpdatingCollectionView",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars, 
    advanced_searchTemplate,
    Datum,
    DatumFields,
    DatumFieldView,
    Search,
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
        collection           : window.app.get("corpus").get("datumFields").clone(),
        childViewConstructor : DatumFieldView,
        childViewTagName     : 'li'
      });
      this.advancedSearchSessionView = new UpdatingCollectionView({
        collection           : window.app.get("corpus").get("sessionFields").clone(),
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
      "click .btn-search-union" : "searchUnion",
      "click .btn-search-intersection" : "searchIntersection"
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
     * Perform a search that finds the union of all the criteria.
     */
    searchUnion : function() {
      Utils.debug("In searchUnion");
      
      // Create a query string from the search criteria
      var queryString = this.getQueryString("union");
      
      // Update the search box
      appView.searchView.model.set("searchKeywords", queryString);
      
      // Start the search
      this.search(queryString);
    },
    
    /**
     * Perform a search that finds the intersection of all the criteria.
     */
    searchIntersection : function() {
      Utils.debug("In searchIntersection");
      
      // Create a query string from the search criteria
      var queryString = this.getQueryString("intersection");
      
      // Update the search box
      appView.searchView.model.set("searchKeywords", queryString);
      
      // Start the search
      this.search(queryString);
    },
    
    /**
     * Create a string representation of the search criteria. Each
     * Object's key is the datum field's label and its value is the datum
     * field's value (i.e the search criteria). An example object would be
     *  {
     *    utterance : "searchForThisUtterance",
     *    gloss : "searchForThisGloss",
     *    translation : "searchForThisTranslation"
     *  }
     * 
     * @return {Object} The created query object.
     */
    getQueryString : function(type) {      
      // All the search fields related to Datum
      var datumFieldsViews = this.advancedSearchDatumView.collection;
      
      // Get all the search criteria
      var searchCriteria = [];
      datumFieldsViews.each(function(datumField) {
        var value = datumField.get("value");
        if (value && value != "") {
          searchCriteria.push(datumField.get("label") + ":" + value);
        }
      });
      
      // Update the search box with the search string corresponding to the
      // current search criteria
      var queryString = "";
      if (type == "union") {
        queryString = searchCriteria.join(" OR ");
      } else if (type == "intersection") {
        queryString = searchCriteria.join(" AND ");
      }
      
      return queryString;
    },
    
    /**
     * Perform a search that finds either the union or the intersection or all
     * the criteria.
     * 
     * @param queryString {String} The string representing the query.
     */
    search : function(queryString) {
      // Search for Datum that match the search criteria      
      var allDatumIds = [];
      (new Datum()).searchByQueryString(queryString, function(datumIds) {        
        // Display the results in the DataListView
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

  return AdvancedSearchView;
});