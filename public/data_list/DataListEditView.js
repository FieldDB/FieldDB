define( [ 
    "backbone", 
    "handlebars",
    "data_list/DataList",
    "datum/Datum",
    "datum/DatumReadView",
    "datum/Datums",
    "app/UpdatingCollectionView"
], function(
    Backbone, 
    Handlebars, 
    DataList, 
    Datum, 
    DatumReadView,
    Datums,
    UpdatingCollectionView
) {
  var DataListEditView = Backbone.View.extend(
  /** @lends DataListEditView.prototype */
  {
    /**
     * @class This is a page where the user can create their own datalist. They
     *        can pick datum and then drag them over to their own customized
     *        data list.
     *        
     * @property {String} format Must be set when the view is
     * initialized. Valid values are "leftSide", "centreWell",
     * "fullscreen" and "import"
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function(options) {
      Utils.debug("DATALIST init: " + this.el);
            
      // Create a DatumView
      if (options.datumCollection) {
        this.datumsView = new UpdatingCollectionView({
          collection           : options.datumCollection,
          childViewConstructor : DatumReadView,
          childViewTagName     : "li",
          childViewFormat      : "latex"
        });
      }

      this.model.bind("change", this.showEditable, this);
    },

    /**
     * The underlying model of the DataListEditView is a DataList.
     */
    model : DataList,

    /**
     * Events that the DataListEditView is listening to and their handlers.
     */
    events : {
      'click a.servernext' : 'nextResultPage',
      'click .serverhowmany a' : 'changeCount',
      "click .icon-resize-small" : 'resizeSmall',
      "click .icon-resize-full" : "resizeFullscreen",
      "blur .data-list-title": "updateTitle",
      "blur .data-list-description": "updateDescription",
      "click .icon-book" :"showReadonly",
      "click .save-datalist" : "updatePouch"
    },

    /**
     * The Handlebars template rendered as fullscreen.
     */
    fullscreenTemplate : Handlebars.templates.data_list_edit_fullscreen,
    
    /** 
     * The Handlebars template rendered as embedded.
     */
    embeddedTemplate : Handlebars.templates.data_list_edit_embedded,

    /**
     * The Handlebars template of the pagination footer, which is used
     * as a partial.
     */
    footerTemplate : Handlebars.templates.paging_footer,

    render : function() {
      if (this.format == "fullscreen") {
        this.setElement($("#data-list-fullscreen"));
        $(this.el).html(this.fullscreenTemplate(this.model.toJSON()));
        
        // Display the DatumFieldsView
        this.datumsView.el = this.$(".data_list_content");
        this.datumsView.render();
        
        // Display the pagination footer
        this.renderUpdatedPagination();
      } else if (this.format == "leftSide") {
        this.setElement($("#data-list-embedded"));
        $(this.el).html(this.embeddedTemplate(this.model.toJSON()));
        
        // Display the DatumFieldsView
        this.datumsView.el = this.$(".data_list_content");
        this.datumsView.render();
        
        // Display the pagination footer
        this.renderUpdatedPagination();
      } else if (this.format == "import"){
        this.setElement($("#import-data-list-view"));
        $(this.el).html(this.embeddedTemplate(this.model.toJSON()));
        
        // Display the DatumFieldsView
        this.datumsView.el = this.$(".data_list_content");
        this.datumsView.render();
        
        // Display the pagination footer
        this.renderUpdatedPagination();
      } else if (this.format == "centreWell") {
        this.setElement($("#new-datalist-embedded"));
        $(this.el).html(this.embeddedTemplate(this.model.toJSON()));
        
        // Display the DatumFieldsView
        this.datumsView.el = this.$(".data_list_content");
        this.datumsView.render();
        
        // Display the pagination footer
        this.renderUpdatedPagination();
      }

      return this;
    },

    /**
     * Re-calculates the pagination values and re-renders the pagination footer.
     */
    renderUpdatedPagination : function() {
      // Replace the old pagination footer
      $("#data_list_footer").html(this.footerTemplate(this.getPaginationInfo()));
    },

    /**
     * For paging, the number of items per page.
     */
    perPage : 3,

    /**
     * Based on the number of items per page and the current page, calculate the current
     * pagination info.
     * 
     * @return {Object} JSON to be sent to the footerTemplate.
     */
    getPaginationInfo : function() {
      var currentPage = (this.datumsView.collection.length > 0) ? Math
          .ceil(this.datumsView.collection.length / this.perPage) : 1;
      var totalPages = (this.datumsView.collection.length > 0) ? Math.ceil(this.model
          .get("datumIds").length
          / this.perPage) : 1;

      return {
        currentPage : currentPage,
        totalPages : totalPages,
        perPage : this.perPage,
        morePages : currentPage < totalPages
      };
    },

    /**
     * Displays a new DatumReadView for the Datum with the given datumId
     * and updates the pagination footer.
     * 
     * @param {String} datumId The datumId of the Datum to display.
     * @param {Boolean} addToTop If true, adds the new Datum to the top of
     * the DataList. If it is false or undefined adds the new Datum to the 
     * bottom of the DataList.
     */
    addOne : function(datumId, addToTop) {
      // Get the corresponding Datum from PouchDB 
      var d = new Datum({
        corpusname : window.app.get("corpus").get("corpusname")
      });
      d.id = datumId;
      var self = this;
      d.changeCorpus(window.app.get("corpus").get("corpusname"), function(){
        d.fetch({
          success : function(model, response) {
            // Render a DatumReadView for that Datum
            if (addToTop) {
              // Render at the top
              self.datumsView.collection.add(model, {at:0});
            } else {
              // Render at the bottom
              self.datumsView.collection.add(model);
            }
            
            // Display the updated DatumReadView
            self.renderUpdatedPagination();
          },
          
          error : function() {
            Utils.debug("Error fetching datum: " + datumId);
          }
        });
      });
    },
    
    temporaryDataList : false,
    
    /**
     * Displays a new DatumReadView for the Datum with the given a full datum. The datum is not saved.
     * and updates the pagination footer.
     * 
     * @param {String} datumId The datumId of the Datum to display.
     */
    addOneTempDatum : function(d) {
      temporaryDataList = true;

      // Render a DatumReadView for that Datum at the end of the DataListEditView
      this.datumsView.collection.add(d);

      // Display the updated DatumReadView
      this.renderUpdatedPagination();
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
     * Add one page worth of DatumReadViews from the DataList.
     * 
     * @param {Object} e The event that triggered this method.
     */
    nextResultPage : function(e) {
      e.preventDefault();

      // Determine the range of indexes into the model's datumIds array that are 
      // on the page to be displayed
      var startIndex = this.datumsView.collection.length;
      var endIndex = startIndex + this.perPage;

      // Add a DatumReadView for each one
      for (var i = startIndex; i < endIndex; i++) {
        var datumId = this.model.get("datumIds")[i];
        if (datumId) {
          this.addOne(datumId);
        }
      }
    },
    
    loadSample : function() {
      this.model.set({
        "id" : "45444C8F-D707-426D-A422-54CD4041A5A1",
        "corpusname" : "sapir-firstcorpus"
      });
      
      this.model.changeCorpus("sapir-firstcorpus",function(){
        this.model.fetch();
      });
    },
    
    resizeSmall : function(){
      window.app.router.showDashboard();
    },
    
    resizeFullscreen : function(){
      window.app.router.showFullscreenDataList();
    },

    updateTitle: function(){
      this.model.set("title",this.$el.find(".data-list-title").val());
    },
    
    updateDescription: function(){
      this.model.set("description",this.$el.find(".data-list-description").val());
    },
    
    //bound to pencil
    showReadonly :function(){
      window.app.router.showReadonlyDataList();
    },
    
    //bound to change
    showEditable :function(){
      window.appView.renderEditableDataListViews();
    },
    
    updatePouch : function() {
      Utils.debug("Saving the DataList");
      var self = this;
      this.model.changeCorpus(this.model.get("corpusname"),function(){
        self.model.save();
      });
    },
  });

  return DataListEditView;
});