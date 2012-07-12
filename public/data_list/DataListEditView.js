define( [ 
    "backbone", 
    "handlebars",
    "data_list/DataList",
    "datum/Datum",
    "datum/DatumReadView",
    "datum/Datums"
], function(
    Backbone, 
    Handlebars, 
    DataList, 
    Datum, 
    DatumReadView,
    Datums  
) {
  var DataListEditView = Backbone.View.extend(
  /** @lends DataListEditView.prototype */
  {
    /**
     * 
     * @class This is a page where the user can create their own datalist. They
     *        can pick datum and then drag them over to their own customized
     *        data list.
     *        
     * @property {String} format Must be set when the view is
     * initialized. Valid values are "leftSide" and
     * "fullscreen" and "import"
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("DATALIST init: " + this.el);

      this.model.bind("change", this.showEditable, this);
    },

    /**
     * The underlying model of the DataListEditView is a DataList.
     */
    model : DataList,

    /** 
     * The datumLatexViews array holds all the children of the
     * DataListEditView.
     */
    datumLatexViews : [],

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
      "click .icon-book" :"showReadonly"
    },

    /**
     * The Handlebars template rendered as the DataListEditView.
     */
    fullscreenTemplate : Handlebars.templates.data_list_edit_fullscreen,
    embeddedTemplate : Handlebars.templates.data_list_edit_embedded,

    /**
     * The Handlebars template of the pagination footer, which is used
     * as a partial.
     */
    footerTemplate : Handlebars.templates.paging_footer,

    /**
     * Initially renders the DataListEditView. This should only be called by 
     * this.initialize. To update the current rendering, use renderUpdatedDataList()
     * instead.
     */
    render : function() {
      if (this.model == undefined) {
        Utils.debug("\tDataList model is not defined");
        return this;
      }
      if (this.format == "fullscreen") {
        Utils.debug("DATALIST fullscreen render: " + this.el);

        this.setElement($("#data-list-fullscreen"));
        $(this.el).html(this.fullscreenTemplate(this.model.toJSON()));
        // Display the pagination footer
        this.renderUpdatedPagination();
        // TODO Display the first page of DatumReadViews.
        // this.renderNewModel();
      } else if (this.format == "leftSide") {
        Utils.debug("DATALIST leftSide render: " + this.el);

        this.setElement($("#data-list-embedded"));
        $(this.el).html(this.embeddedTemplate(this.model.toJSON()));
        // Display the pagination footer
        this.renderUpdatedPagination();
        // TODO Display the first page of DatumReadViews.
        // this.renderNewModel();
      } else if (this.format == "import"){
        this.setElement($("#import-data-list-view"));
        $(this.el).html(this.embeddedTemplate(this.model.toJSON()));
        // Display the pagination footer
        this.renderUpdatedPagination();
      }

      return this;
    },

    /**
     * Re-renders the datalist header based on the current model.
     */
    renderUpdatedDataList : function() {
      window.appView.renderEditableDataListViews();
    },

    /**
     * Re-renders the datums based on the current model.
     * Re-renders the pagination footer based on the current pagination data.
     * 
     * This should be called whenever the model is replaced (i.e. when you open
     * a new DataList or perform a new Search).
     */
    renderNewModel : function() {
      // Remove all the DatumReadViews that are currently being displayed
      while (this.datumLatexViews.length > 0) {
        var datumLatexView = this.datumLatexViews.pop();
        datumLatexView.remove();
      }

      // Display the first page of Datum and the pagination footer
      for (var i = 0; i < this.perPage; i++) {
        var datumId = this.model.get("datumIds")[i];
        if (datumId) {
          this.addOne(datumId);
        }
      }
    },

    /**
     * Re-calculates the pagination values and re-renders the pagination footer.
     */
    renderUpdatedPagination : function() {
      // Replace the old pagination footer
      $("#data_list_footer")
          .html(this.footerTemplate(this.getPaginationInfo()));
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
      var currentPage = (this.datumLatexViews.length > 0) ? Math
          .ceil(this.datumLatexViews.length / this.perPage) : 1;
      var totalPages = (this.datumLatexViews.length > 0) ? Math.ceil(this.model
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
     */
    addOne : function(datumId) {
      // Get the corresponding Datum from PouchDB 
      var d = new Datum({
        id : datumId,
        corpusname : window.app.get("corpus").get("corpusname")
      });
      var self = this;
      d.changeCorpus(window.app.get("corpus").get("corpusname"), function(){
        d.fetch({
          success : function() {
            // Render a DatumReadView for that Datum at the end of the DataListEditView
            var view = new DatumReadView({
              model : d,
              tagName : "li"
            });
            view.format = "latex";
            $('.data_list_content').append(view.render().el);
            
            // Keep track of the DatumReadView
            self.datumLatexViews.push(view);
            
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
      var view = new DatumReadView({
        model : d,
        tagName : "li"
      });
      view.format = "latex";
      $('.data_list_content').append(view.render().el);

      // Keep track of the DatumReadView
      this.datumLatexViews.push(view);

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
      var startIndex = this.datumLatexViews.length;
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
//      this.model = new DataList(
//          {
//            "_id" : "45444C8F-D707-426D-A422-54CD4041A5A1",
//            "_rev" : "1-68565ded015c387c0aec5117b76180d6",
//            "title" : "Sample data list",
//            "dateCreated" : "May 29, 2012",
//            "description" : "This a sample data list made by Sapir. You can use datalists to prepare for sessions with your consultant, or for handouts and articles. Data lists are a way to have a subset of your corpus at your finger tips, and export it to LaTeX or other forms.",
//            "datumIds" : [ "A3F5E512-56D9-4437-B41D-684894020254",
//                           "2F4D4B26-E863-4D49-9F40-1431E737AECD",
//                           "9A465EF7-5001-4832-BABB-81ACD46EEE9D" ]
//          });
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

    }
  });

  return DataListEditView;
});