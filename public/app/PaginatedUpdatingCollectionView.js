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
      _(this).bindAll('add', 'remove');

      if (!options.childViewConstructor)
        throw "no child view constructor provided";
      if (!options.childViewTagName)
        throw "no child view tag name provided";

      this._childViewConstructor = options.childViewConstructor;
      this._childViewTagName = options.childViewTagName;
      this._childViewFormat = options.childViewFormat || null;
      this._childViewClass = options.childViewClass || "";

      this._childViews = [];

      this.collection.each(this.add);

      this.collection.bind('add', this.add);
      this.collection.bind('remove', this.remove);
    },
    
    tagName: "ul",
    
    paginationControlTemplate : Handlebars.templates.paging_footer,
   
    /**
     * Events that the view is listening to and their handlers.
     */
    events : {
      'click a.servernext' : 'nextResultPage',
      'click .serverhowmany a' : 'changeCount',
      'click .collection-checkbox' : 'clickedCheckbox'
    },
    /*
     * TODO decide here or in childviews
     */
    clickedCheckbox : function(e){
      alert("checked a checkbox "+JSON.stringify(e));
    },
    
    add : function(model, collection, options) {
      this.filledBasedOnModels = true;
      var childView = new this._childViewConstructor({
        tagName : this._childViewTagName,
        className : this._childViewClass,
        model : model
      });
      
      if (this._childViewFormat) {
        childView.format = this._childViewFormat;
      }
      
      if(options == undefined || options == null){
        options = {};
        options.index = 1;
      }
      // Add to the top of the list
      if (options.index == 0) {
        var positionInThisCollection = this.collection.getByCid(model.cid) || this.collection.get(model.id);
        if( positionInThisCollection == -1 ){
          this._childViews.unshift(childView);
        }else{
          //dont add it?
        }
  
        if (this._rendered) {
          $(this.el).prepend(childView.render().el);
        }
      // Add to the bottom of the list
      } else {
        var positionInThisCollection = this.collection.getByCid(model.cid) || this.collection.get(model.id);
        if( positionInThisCollection == -1 ){
          this._childViews.push(childView);
        }else{
          //dont add it?
        }
  
        if (this._rendered) {
          $(this.el).append(childView.render().el);
        }
      }
    },

    remove : function(model) {
      var viewToRemove = _(this._childViews).select(function(cv) {
        return cv.model === model;
      })[0];
      this._childViews = _(this._childViews).without(viewToRemove);

      if (this._rendered)
        $(viewToRemove.el).remove();
    },

    render : function() {
      var that = this;
      this._rendered = true;

      $(this.el).empty();

      _(this._childViews).each(function(childView) {
        $(that.el).append(childView.render().el);
        childView.delegateEvents();
      });

//      // Display the DatumFieldsView
//      this.datumsView.el = this.$el.find(".data_list_content");
//      this.datumsView.render();
//      
//      // Display the pagination footer
//      this.renderUpdatedPagination();
      
      return this;
    },
    renderInElement: function(htmlElement){
      this.el = htmlElement;
      this.render();
      this.renderUpdatedPagination();
    },
    
    /**
     * Renders only the first page of the Data List.
     */
    renderFirstPage : function() {
      this.clearChildViews();
      
      for (var i = 0; i < this.perPage; i++) {
        if (this.model.get("datumIds")[i]) {
          this.addOne(this.model.get("datumIds")[i]);
        }
      }
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
              self.add(model);
              self.filledBasedOnIds = true;
            }
          });
        });
      }
    },
    // Clear the view of all its DatumReadViews
    clearChildViews : function() {
      while (this.collection.length > 0) {
        var m = this.collection.pop();
        remove(m);
      }
    },

    /**
     * Re-calculates the pagination values and re-renders the pagination footer.
     */
    renderUpdatedPagination : function() {
      // Replace the old pagination footer
      this.$el.find(".pagination-control").html(this.paginationControlTemplate(this.getPaginationInfo()));
    },

    /**
     * For paging, the number of items per page.
     */
    perPage : 12,

    /**
     * Based on the number of items per page and the current page, calculate the current
     * pagination info.
     * 
     * @return {Object} JSON to be sent to the footerTemplate.
     */
    getPaginationInfo : function() {
      var currentPage = (this.collection.length > 0) ? Math
          .ceil(this.collection.length / this.perPage) : 1;
      var totalPages = (this.collection.length > 0) ? Math.ceil(this.collection.length
          / this.perPage) : 1;

      return {
        currentPage : currentPage,
        totalPages : totalPages,
        perPage : this.perPage,
        morePages : currentPage < totalPages
      };
    },

    /**
     * Change the number of items per page.
     * 
     * @param {Object} e The event that triggered this method.
     */
    changeCount : function(e) {
      e.preventDefault();

      // Change the number of items per page
      this.perPage = parseInt($(e.target).text());
    },

    /**
     * Add one page worth of child views from the collection.
     * 
     * @param {Object} e The event that triggered this method.
     */
    nextResultPage : function(e) {
      e.preventDefault();

      // Determine the range of indexes into the model's datumIds array that are 
      // on the page to be displayed
      var startIndex = this.collection.length;
      var endIndex = startIndex + this.perPage;

      // Add a DatumReadView for each one
      for (var i = startIndex; i < endIndex; i++) {
        var m = this.collection[i];
        if (m) {
          this.add(m);
        }
      }
    }
    
  });
  return PaginatedUpdatingCollectionView;
});