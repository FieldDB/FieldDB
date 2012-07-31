define([ 
    "backbone",
], function(Backbone) {
var PaginatedUpdatingCollectionView = Backbone.View.extend(
    /** @lends PaginatedUpdatingCollectionView.prototype */
{
  /**
   * @class This class is used to insert models into the data list which happens in import and in normal use for the default datums collection..
   * 
   * @description
   * 
   * @property {Collection<Object>} datumCollection A multi-page collection which is shown in the paginated view.
   * 
   * @extends Backbone.Model
   * @constructs
   */
  initialize : function(options) {
    Utils.debug("PAGINATED UPDATING COLLECTION INIT");
      _(this).bindAll('addChildView', 'removeChildView');

      if (!options.childViewConstructor)
        throw "no child view constructor provided";
      if (!options.childViewTagName)
        throw "no child view tag name provided";

      this._childViewConstructor = options.childViewConstructor;
      this._childViewTagName = options.childViewTagName;
      this._childViewFormat = options.childViewFormat || null;
      this._childViewClass = options.childViewClass || "";

      this._childViews = [];

      this.collection.each(this.addChildView);

      this.collection.bind('add', this.addChildView);
      this.collection.bind('unshift', this.addChildView);
      this.collection.bind('remove', this.removeChildView);
      
      try{
        this.perPage = app.get("authentication").get("userPrivate").get("prefs").get("numberOfItemsInPaginatedViews");
        this.currentVisibleEnd = this.perPage - 1;

      }catch(e){
        Utils.debug("there was a problem getting the number of items per page for the user, using default of 12.");
      }
      
    },
    
    tagName: "ul",
    
    paginationControlTemplate : Handlebars.templates.paging_footer,
   

    /**
     * Events that the view is listening to and their handlers.
     * These events are fired from the pagination control, which is
     * not in this element but in the sister of this element. see jquery
     * binding in the render pagination control.
     */
    events : {
//      'click a.nextinfinitepagination' : 'nextResultPage',
//      'click .howmanyperpagination a' : 'changeCount',
    },
    
    addChildView : function(model, collection, options) {
      Utils.debug("PAGINATED UPDATING COLLECTION add: " , this._childViews.length);

      //If the model is not supposed to be visible, don't run this function.
      if(this.collection.indexOf(model) > this.currentVisibleEnd){
        return;
      }
      
      this.filledBasedOnModels = true;
      var childView = new this._childViewConstructor({
        tagName : this._childViewTagName,
        className : this._childViewClass,
        model : model
      });
      
      if (this._childViewFormat) {
        childView.format = this._childViewFormat;
      }
      
      //Add to top by default
      if(options == undefined || options == null){
        options = {};
        options.index = 0;
      }
      // Add to the top of the list
      if (options.index == 0) {
        
        var positionInChildViews = -1;
        for (var x in this._childViews){ 
          if(this._childViews[x].model.cid == model.cid){
            positionInChildViews = x;
          }
          if(this._childViews[x].model.id == model.id){
            positionInChildViews = x;
          }
        }
        
        if( positionInChildViews == -1 ){
          this._childViews.unshift(childView);
          if (this._rendered) {
            $(this.el).prepend(childView.render().el);
          }
        }else{
          //dont add it?
        }
  
      // Add to the bottom of the list
      } else {
        var positionInChildViews = -1;
        for (var x in this._childViews){ 
          if(this._childViews[x].model.cid == model.cid){
            positionInChildViews = x;
          }
          if(this._childViews[x].model.id == model.id){
            positionInChildViews = x;
          }
        }
        if( positionInChildViews == -1 ){
          this._childViews.push(childView); //TODO put in its index position
          if (this._rendered) {
            $(this.el).append(childView.render().el);
          }
        }else{
          //dont add it?
        }
  
      }
      if(this._childViews.length > this.currentVisibleEnd + 1){
        this.removeChildView(this._childViews[this.currentVisibleEnd + 1].model);
      }
      
    },

    removeChildView : function(model) {
      var viewToRemove = _(this._childViews).select(function(cv) {
        return cv.model === model;
      })[0];
      //If the view wasnt displayed anyway because it was outside the pagination, dont bother removing the view.
      if(!viewToRemove){
        return;
      }
      this._childViews = _(this._childViews).without(viewToRemove);

      if (this._rendered)
        $(viewToRemove.el).remove();
    },

    render : function() {
      Utils.debug("PAGINATED UPDATING COLLECTION render: " , this._childViews.length);

      var that = this;
      this._rendered = true;

      $(this.el).empty();

      _(this._childViews).each(function(childView) {
        $(that.el).append(childView.render().el);
        childView.delegateEvents();
      });

      /*
       * This wont add the view if it is already in the views, but to
       * avoid extra processing, only run this if the number of child
       * views is an unexpected value compared to the current visible
       * views.
       */
      if(this._childViews.length != this.currentVisibleEnd + 1){
        this.renderFirstPage();
      }
      // Display the pagination footer
      this.renderUpdatedPaginationControl();
      
      return this;
    },
    /**
     * Renders only the first page of the Data List.
     */
    renderFirstPage : function() {
//      this.clearChildViews(); //The addChildView wont add it if it is already there, so we dont need to clear it.
      
      for (var i = 0; i < this.currentVisibleEnd; i++) {
        if (this.collection.models[i]) {
          this.addChildView(this.collection.models[i], this.collection, {index: i});
        }
      }
    },
    renderInElement: function(htmlElement){
      this.el = htmlElement;
      this.render();
    },
   
    filledBasedOnIds: false,
    filledBasedOnModels : false,
    /**
     * Takes in an array of ids, and turns them all into elements in the collection.
     */
    fillWithIds : function(objectIds, Model){
      if(this.filledBasedOnModels){
        alert("mixing a collection from id and models!");
      }
      for(var id in objectIds){
        var obj = new Model({corpusname: app.get("corpus").get("corpusname")});
        obj.id  = objectIds[id];
        var self = this;
        obj.changeCorpus(window.app.get("corpus").get("corpusname"), function(){
          obj.fetch({
            success : function(model, response) {
              // Render at the bottom
              self.collection.add(model);
              self.filledBasedOnIds = true;
            }
          });
        });
      }
    },
    // Clear the view of all its ChildViews
    clearChildViews : function() {
      while (this._childViews.length > 0) {
        var viewToRemove = this._childViews.pop();
        $(viewToRemove.el).remove();
      }
    },

    /**
     * Re-calculates the pagination values and re-renders the pagination footer and binds its events using jquery binding instead of backbone binding
//      'click a.nextinfinitepagination' : 'nextResultPage',
//      'click .howmanyperpagination a' : 'changeCount',
     */
    renderUpdatedPaginationControl : function() {
      var paginatedSelf = this;
      //Remove events and old footer
      this.el.parent().find(".nextinfinitepagination").unbind('click', function(e){
        paginatedSelf.nextResultPage(e, paginatedSelf);
      });
      this.el.parent().find(".howmanyperpagination").unbind('click', function(e){
        paginatedSelf.changeCount(e, paginatedSelf);
      });
      this.el.parent().find(".pagination-control").empty();
      
      // Put in new footer and bind events again
      this.el.parent().find(".pagination-control").html(this.paginationControlTemplate(this.getPaginationInfo()));
      this.el.parent().find(".nextinfinitepagination").bind('click', function(e){
        paginatedSelf.nextResultPage(e, paginatedSelf);
      });
      this.el.parent().find(".howmanyperpagination").bind('click', function(e){
        paginatedSelf.changeCount(e, paginatedSelf);
      });
      
    },

    /**
     * For paging, the number of items per page.
     */
    perPage : 12,
    currentVisibleStart : 0,
    currentVisibleEnd: 11,
    /**
     * Based on the number of items per page and the current page, calculate the current
     * pagination info.
     * 
     * @return {Object} JSON to be sent to the footerTemplate.
     */
    getPaginationInfo : function() {
      var currentPage = (this._childViews.length > 0) ? Math
          .ceil(this._childViews.length / this.perPage) : 1;
      var totalPages = (this.collection.length > 0) ? Math.ceil(this.collection.length
          / this.perPage) : 1;

      return {
        currentPage : currentPage,
        totalPages : totalPages,
        perPage : this.perPage,
        morePages : currentPage < totalPages,
        allShown : this.currentVisibleEnd >= this.collection.length
      };
    },

    /**
     * Change the number of items per page.
     * 
     * @param {Object} e The event that triggered this method.
     */
    changeCount : function(e, self) {
      e.preventDefault();

      var previousPerPage = self.perPage;
      var previousVisibleEnd = self.currentVisibleEnd;
      // Change the number of items per page
      self.perPage = parseInt($(e.target).text());
      try{
        app.get("authentication").get("userPrivate").get("prefs").set("numberOfItemsInPaginatedViews", self.perPage);
        self.currentVisibleEnd = self.perPage - 1;
      }catch(e){
        Utils.debug("There was a problem trying to save the number of items per page to the user's preferences.",e);
      }
      //If the user is trying to see less, render.
      if( self.perPage < previousVisibleEnd ){
        self.clearChildViews();
        self.render();
      }
      //If the user is trying to see more, render. 
      if( self.perPage > previousVisibleEnd ){
        self.nextResultPage(null, self);
      }

    },

    /**
     * Add one page worth of child views from the collection.
     * 
     * @param {Object} e The event that triggered this method.
     */
    nextResultPage : function(e, self) {
      if(e){
        e.preventDefault();
      }
      if(!self){
        self = this;
      }
      self.currentVisibleEnd = self.currentVisibleEnd + self.perPage;
      // Determine the range of indexes into the model's datumIds array that are 
      // on the page to be displayed

      // Add a ChildView for each one that is not visible
      for (var i = self._childViews.length; i < self.currentVisibleEnd; i++) {
        var m = self.collection.models[i];
        if (m) {
          self.addChildView(m, self.collection, {index: i});
        }
      }
      self.renderUpdatedPaginationControl();
    }
    
  });
  return PaginatedUpdatingCollectionView;
});