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
      this.search("union");
      this.updateSearchBox("union");
    },
    
    /**
     * Perform a search that finds the intersection of all the criteria.
     */
    searchIntersection : function() {
      Utils.debug("In searchIntersection");
      this.search("intersection");
      this.updateSearchBox("intersection");
    },
    
    /**
     * Perform a search that finds either the union or the intersection or all
     * the criteria.
     * 
     * @param type {String} Either "union" or "intersection"
     */
    search : function(type) {
      // All the search fields related to Datum
      var datumFieldsViews = this.advancedSearchDatumView.collection;
      
      // All the resulting datumIds arrays
      var allDatumIds = [];
      
      // Use these to determine when all the mini-searches are complete and
      // we can display the results
      var numDatumFields = this.advancedSearchDatumView.collection.length;
      var numDatumFieldsProcessed = 0;
      
      datumFieldsViews.each(function(datumField) {
        var value = datumField.get("value");
        if (value && value != "") {
          (new Datum()).searchByDatumField(datumField.get("label"), value, function(datumIds) {
            numDatumFieldsProcessed++;
            
            // Add this DatumFields' results to any other results
            allDatumIds.push(datumIds);
            
            // If all the queries have finished and we have all the results
            if (numDatumFieldsProcessed == numDatumFields) {
              if (type == "union") {
                // Union the results before displaying
                appView.dataListView.model.set("datumIds", _.union.apply(_, allDatumIds));
              } else if (type == "intersection") {
                // Intersect the results before displaying
                appView.dataListView.model.set("datumIds", _.intersection.apply(_, allDatumIds));
              }
              // Display the results
              appView.dataListView.renderNewModel();
            }
          });
        } else {
          numDatumFieldsProcessed++;
        }
      });
    },
    
    /**
     * Update the little search box with the search string corresponding to the
     * current search criteria and the given type of search.
     * 
     * @param type {String} "union" if this search unions all the criteria together,
     * or "intersection" if this search intersects all the criteria together.
     */
    updateSearchBox : function(type) {      
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
      if (type == "union") {
        appView.searchView.model.set("searchKeywords", searchCriteria.join(" OR "));
      } else if (type == "intersection") {
        appView.searchView.model.set("searchKeywords", searchCriteria.join(" AND "));
      }
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