define([ 
    "backbone", 
    "handlebars", 
    "data_list/DataList",
    "data_list/DataListEditView",
    "datum/Datum",
    "datum/Datums",
    "datum/DatumFieldEditView",
    "datum/DatumReadView",
    "search/Search",
    "app/UpdatingCollectionView",
    "app/PaginatedUpdatingCollectionView",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars, 
    DataList,
    DataListEditView,
    Datum,
    Datums,
    DatumFieldEditView,
    DatumReadView,
    Search,
    UpdatingCollectionView,
    PaginatedUpdatingCollectionView
) {
  var SearchEditView = Backbone.View.extend(
  /** @lends SearchEditView.prototype */
  {
    /**
     * @class Search View handles the render of the global search in the corner,
     *        and the advanced power search, as well as their events.
     * 
     * @property {String} format Valid values are "fullscreen", "top", or "centreWell" 
     * 
     * @description Starts the Search.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("SEARCH init: " + this.el);
      
      this.newTempDataList();
      this.changeViewsOfInternalModels();

      this.model.bind('change', this.render, this);
    },
    
    /**
     * The underlying model of the SearchEditView is a Search.
     */
    model : Search,
    
    /**
     * Events that the SearchEditView is listening to and their handlers.
     */
    events : {
      "click .btn-search-union" : "searchUnion",
      "click .btn-search-intersection" : "searchIntersection",
      "click .icon-search" : "searchTop",
      "click .icon-resize-small" : "resizeSmall",
      "click .icon-resize-full" : 'resizeFullscreen',
      //These functions are now in the AppView since it can listen for these events, and the search editview is rendering the top search and embedded serach.
//      "click .btn-advanced-search" : "resizeSmall",
//      "click .icon-search" : function(e){
//        if(e){
//          e.stopPropagation();
//        }
//        this.searchTop();
//      },
//      "keyup #search_box" : function(e) {
////        if(e){
////          e.stopPropagation();
////        }
//        var code = e.keyCode || e.which;
//        
//        // code == 13 is the enter key
//        if (code == 13) {
//          this.searchTop();
//        }
////        return false;
//      }
    },
    
    /**
     * The Handlebars template rendered as the embedded AdvancedSearchView.
     */
    embeddedTemplate : Handlebars.templates.search_advanced_edit_embedded,
    
    /**
     * The Handlebars template rednered as the fullscreen AdvancedSearchView.
     */
    fullscreenTemplate : Handlebars.templates.search_advanced_edit_fullscreen,
    
    /**
     * The Handlebars template rendered as the TopSearchView.
     */
    topTemplate : Handlebars.templates.search_edit_embedded,
   
    /**
     * Renders the SearchEditView.
     */
    render : function() {
      Utils.debug("SEARCH render: " + this.el);
      //make sure the datum fields and session fields match the current corpus
      this.changeViewsOfInternalModels();

      if (this.format == "fullscreen") {
        // Display the SearchView
        this.setElement($("#search-fullscreen"));
        $(this.el).html(this.fullscreenTemplate(this.model.toJSON()));
        
      } else if (this.format == "centreWell") {
        // Display the SearchView
        this.setElement($("#search-embedded"));
        $(this.el).html(this.embeddedTemplate(this.model.toJSON()));
      } 
      
      this.advancedSearchDatumView.el = this.$('.advanced_search_datum');
      this.advancedSearchDatumView.render();
      
      this.advancedSearchSessionView.el = this.$('.advanced_search_session');
      this.advancedSearchSessionView.render();

//      this.setElement($("#search-top"));
      $("#search-top").html(this.topTemplate(this.model.toJSON()));
      
      return this;
    },
    newTempDataList : function(callback){
      /*
       * Only do this if it is the top search. otherwise it seems that all three
       * search edit views are making a data list, and their three data lists
       * are listening to the same events and doing them three times, which migh
       * tmean we g will get three resulting saved ata lsits if the user pushes
       * save?
       */
//      if(this.format == "top"){ //now there is only one search
        if( this.searchPaginatedDataListDatumsView ){
          this.searchPaginatedDataListDatumsView.remove(); //backbone to remove from dom
          var coll = this.searchPaginatedDataListDatumsView.collection; //try to be sure the collection is empty
          //this.searchPaginatedDataListDatumsView.collection.reset(); could also use backbone's reset which will empty the collection, or fill it with a new group.
          while (coll.length > 0) {
            coll.pop();
          }
          delete this.searchPaginatedDataListDatumsView.collection;
          delete this.searchPaginatedDataListDatumsView; //tell garbage collecter we arent using it
        }
        
        /*
         * This holds the ordered datums of the temp search data list, and is the important place to keep the
         * datum, it's ids will be saved into the resulting data list if and when the data list is saved
         */
        this.searchPaginatedDataListDatumsView = new PaginatedUpdatingCollectionView({
          collection           : new Datums(),
          childViewConstructor : DatumReadView,
          childViewTagName     : "li",
          childViewFormat      : "latex"
        }); 
        
        // Scrub this better pouch it was still saving it as a revision.
        if(this.searchDataListView){
//          this.searchDataListView.remove(); //backbone to remove from dom this is removing my id div too.
          delete this.searchDataListView.model; //tell the garbage collector we are done.
          delete this.searchDataListView;
        }
        
//        var attributes = JSON.parse(JSON.stringify(new DataList({datumIds: []})));
//        // Clear the current data list's backbone info and info which we shouldnt clone
//        attributes._id = undefined;
//        attributes._rev = undefined;
//        attributes.comments = undefined;
//        attributes.title = self.model.get("title")+ " copy";
//        attributes.description = "Copy of: "+self.model.get("description");
//        attributes.corpusname = app.get("corpus").get("corpusname");
//        attributes.datumIds = [];
        
        
        this.searchDataListView = new DataListEditView({
//          model : new DataList(attributes),
          model : new DataList({
            "corpusname" : window.app.get("corpus").get("corpusname"),
            "title" : "Temporary Search Results",
            "description":"You can use search to create data lists for handouts."
          }),
        }); 
        this.searchDataListView.format = "search-minimized";
        
        if(typeof callback == "function"){
          callback();
        }
//      }
    },
    changeViewsOfInternalModels : function(){
      
      //TODO, why clone? with clones they are never up to date with what is in the corpus.
      this.advancedSearchDatumView = new UpdatingCollectionView({
        collection           : window.app.get("corpus").get("datumFields"),
        childViewConstructor : DatumFieldEditView,
        childViewTagName     : 'li',
        childViewFormat      : "datum"
      });
      
      this.advancedSearchSessionView = new UpdatingCollectionView({
        collection           : window.app.get("corpus").get("sessionFields"),
        childViewConstructor : DatumFieldEditView,
        childViewTagName     : 'li',
        childViewFormat      : "session"
      });
      
    },
    /**
     * Perform a search that finds the union of all the criteria.
     */
    searchUnion : function() {
      Utils.debug("In searchUnion");
      
      // Create a query string from the search criteria
      var queryString = this.getQueryString("union");
      
      // Update the search box
      this.model.set("searchKeywords", queryString);
      
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
      this.model.set("searchKeywords", queryString);
      
      // Start the search
      this.search(queryString);
    },
    
    /**
     * Perform a search.
     */
    searchTop : function() {
      Utils.debug("Will search for " + $("#search_box").val());
      this.model.set("searchKeywords", $("#search_box").val());
            // Search for Datum that match the search criteria      
      this.search($("#search_box").val());
      
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
      var sessionFieldsView = this.advancedSearchSessionView.collection;
      
      // Get all the search criteria
      var searchCriteria = [];
      datumFieldsViews.each(function(datumField) {
        var value = datumField.get("mask");
        if (value && value != "") {
          searchCriteria.push(datumField.get("label") + ":" + value);
        }
      });
      sessionFieldsView.each(function(sessionField) {
        var value = sessionField.get("mask");
        if (value && value != "") {
          searchCriteria.push(sessionField.get("label") + ":" + value);
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
      
      Utils.debug("Searching for " + queryString);
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
      var searchself = this;
      (new Datum({"corpusname": app.get("corpus").get("corpusname")})).searchByQueryString(queryString
          , function(datumIds){
        
        //this will take in datumIds from its caller
        // Create a new temporary data list in search datalist on the LeftSide
//        if(searchself.format != "top"){
//          searchself = window.appView.searchTopView; //now there is only one serach
//          return; //dont try to put dat in unless you have a data list, and its the centerwell one who controls the temp serach results
//        }
        searchself.newTempDataList(function(){
          searchself.searchDataListView.model.set("title"
              , $("#search_box").val()
              + " search result");
          searchself.searchDataListView.model.set("description"
              ,  "This is the result of searching for : " 
              + $("#search_box").val()
              + " in " 
              + window.app.get("corpus").get("title") 
              + " on "+ JSON.stringify(new Date()) );
          searchself.searchDataListView.format = "search";
          searchself.searchDataListView.render();
//          searchself.searchPaginatedDataListDatumsView.renderInElement(
//              $("#search-data-list-quickview").find(".search-data-list-paginated-view") );
          // Add search results to the data list
          searchself.searchPaginatedDataListDatumsView.fillWithIds(datumIds, Datum);
          searchself.searchDataListView.model.set("datumIds", datumIds); //TODO do we want to put them into the data list yet, or do that when we save?
          Utils.debug("Successfully got data back from search and put it into the temp search data list");
        });
      });
    },
    
    /**
     * Initialize the sample Search.
     */
    loadSample : function() {
      this.model.set({
        searchKeywords : "naya"
      });
    },
      
    resizeSmall : function(e){
      if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from running same command twice
      }
//      this.format = "centreWell";
//      this.render(); this is done in the router
      window.app.router.showEmbeddedSearch();
    },
    
    resizeFullscreen : function(e){
      if (e.stopPropagation) {
        e.stopPropagation(); // stops the browser from running same command twice.
      }
//      this.format = "fullscreeen";
//      this.render(); //this is done in the router
      window.app.router.showFullscreenSearch();
    }
  });

  return SearchEditView;
});