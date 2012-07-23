define( [ 
    "backbone", 
    "handlebars",
    "activity/Activity",
    "comment/Comment",
    "comment/Comments",
    "comment/CommentReadView",
    "data_list/DataList",
    "datum/Datum",
    "datum/DatumReadView",
    "datum/Datums",
    "app/UpdatingCollectionView"
], function(
    Backbone, 
    Handlebars, 
    Activity,
    Comment,
    Comments,
    CommentReadView,
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
     * "fullscreen", "import", and "minimized."
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
      
      this.changeViewsOfInternalModels();
      
      // Remove options
      delete this.model.collection;

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
      //Add button inserts new Comment
      "click .add-comment-datalist-edit" : 'insertNewComment',
      
      'click a.servernext' : 'nextResultPage',
      'click .serverhowmany a' : 'changeCount',
      "click .icon-resize-small" : 'resizeSmall',
      "click .icon-resize-full" : "resizeFullscreen",
      "blur .data-list-title": "updateTitle",
      "blur .data-list-description": "updateDescription",
      "click .icon-book" :"showReadonly",
      "click .save-datalist" : "updatePouch",
      "click .icon-minus-sign" : function() {
        this.format = "minimized";
        this.render();
      },
      "click .icon-plus-sign" : function() {
        this.format = "leftSide";
        this.render();
      }
    },

    /**
     * The Handlebars template rendered as fullscreen.
     */
    templateFullscreen : Handlebars.templates.data_list_edit_fullscreen,
    
    /** 
     * The Handlebars template rendered as embedded.
     */
    embeddedTemplate : Handlebars.templates.data_list_edit_embedded,

    /** 
     * The Handlebars template rendered as Summary.
     */
    templateSummary : Handlebars.templates.data_list_summary_edit_embedded,
    
    /**
     * The Handlebars template of the pagination footer, which is used
     * as a partial.
     */
    footerTemplate : Handlebars.templates.paging_footer,
    
    /**
     * The Handlebars template of the minimized version
     */
    templateMinimized : Handlebars.templates.data_list_summary_read_minimized,

    render : function() {
      if (this.format == "fullscreen") {
        this.setElement($("#data-list-fullscreen"));
        $(this.el).html(this.templateFullscreen(this.model.toJSON()));
       
        // Display the CommentReadView
        this.commentReadView.el = this.$('.comments');
        this.commentReadView.render();
        
        // Display the DatumFieldsView
        this.datumsView.el = this.$(".data_list_content");
        this.datumsView.render();
        
        // Display the pagination footer
        this.renderUpdatedPagination();
     
      } else if (this.format == "leftSide") {
        this.setElement($("#data-list-quickview"));
        $(this.el).html(this.templateSummary(this.model.toJSON()));

        
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
        this.setElement($("#data-list-embedded"));
        $(this.el).html(this.embeddedTemplate(this.model.toJSON()));
        
        // Display the DatumFieldsView
        this.datumsView.el = this.$(".data_list_content");
        this.datumsView.render();
       
        // Display the CommentReadView
        this.commentReadView.el = this.$('.comments');
        this.commentReadView.render();
        
        // Display the pagination footer
        this.renderUpdatedPagination();
        
      } else if (this.format == "minimized") {
        this.setElement($("#data-list-quickview"));
        $(this.el).html(this.templateMinimized(this.model.toJSON()));
      }

      return this;
    },
    

    changeViewsOfInternalModels : function() {
      // Create a CommentReadView     
      this.commentReadView = new UpdatingCollectionView({
        collection           : this.model.get("comments"),
        childViewConstructor : CommentReadView,
        childViewTagName     : 'li'
      });  
    },
    
    /**
     * Renders only the first page of the Data List.
     */
    renderFirstPage : function() {
      this.clearDataList();
      
      for (var i = 0; i < this.perPage; i++) {
        if (this.model.get("datumIds")[i]) {
          this.addOne(this.model.get("datumIds")[i]);
        }
      }
    },
    
    // Clear the view of all its DatumReadViews
    clearDataList : function() {
      var coll = this.datumsView.collection; 
      while (coll.length > 0) {
        coll.pop();
      }
    },

    /**
     * Re-calculates the pagination values and re-renders the pagination footer.
     */
    renderUpdatedPagination : function() {
      // Replace the old pagination footer
      $(".data-list-footer").html(this.footerTemplate(this.getPaginationInfo()));
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
     * Create a permanent data list in the current corpus.
     */
    newDataList : function() {
      //save the current data list
      this.model.save();
      //clone it
      this.model = this.model.clone();
      // Clear the current data list
      this.model.attributes = {};
      this.model.set((new DataList()).toJSON()); //TODO is this a creative way of wipeing the current data list? i just cloned them
      this.model.set("datumIds", []);
      this.model.set("corpusname", app.get("corpus").get("corpusname"));
      delete this.model.id;
      delete this.model.rev;
//      window.appView.sessionModalView.model.id = undefined;
//      window.appView.sessionModalView.model.rev = undefined; //TODO this is how i did it in the new session new corpus buttons
      this.model.set("_id", undefined);
      this.model.set("_rev", undefined);
      
      // Clear the view
      app.get("corpus").get("dataLists");//TODO what is this line for?
      var coll = this.datumsView.collection;
      while (coll.length > 0) {
        coll.pop();
      }
      
      // Add the new data list to the corpus
      app.get("corpus").get("dataLists").unshift(this.model);
      
      
      // Display the new data list
      appView.renderReadonlyDataListViews();
      appView.renderEditableDataListViews();
    },
    
    /**
     * Add the given datum ID to the data list.
     * Determine whether to add the Datum to the datumsView.
     * Re-render.
     * 
     * @param {String} datumId The datumId of the Datum to add.
     * @param {Boolean} addToTop If true, adds the new Datum to the top of
     * the DataList. If it is false or undefined adds the new Datum to the 
     * bottom of the DataList.
     */
    addOneDatumId : function(datumId, addToTop) {
      if (addToTop) {
        // Add it to the front of the model's list of datum ids
        this.model.get("datumIds").unshift(datumId);
        
        // Fetch its model from the database
        var d = new Datum({
          corpusname : window.app.get("corpus").get("corpusname")
        });
        d.id = datumId;
        var self = this;
        d.changeCorpus(window.app.get("corpus").get("corpusname"), function(){
          d.fetch({
            success : function(model, response) {
              // Render at the top
              self.datumsView.collection.add(model, {at:0});
              
              // Display the updated data list
              appView.renderReadonlyDataListViews();
              appView.renderEditableDataListViews();
            }
          });
        });
      } else {
        // Add it to the back of the model's list of datum ids
        this.model.get("datumIds").push(datumId);
        
        // If there is room on the current page
        var numDatumCurrentlyDisplayed = this.datumsView.collection.length
        if ((numDatumCurrentlyDisplayed == 0) || (numDatumCurrentlyDisplayed % this.perPage != 0)) {
          // Fetch its model from the database
          var d = new Datum({
            corpusname : window.app.get("corpus").get("corpusname")
          });
          d.id = datumId;
          var self = this;
          d.changeCorpus(window.app.get("corpus").get("corpusname"), function(){
            d.fetch({
              success : function(model, response) {
                // If there is still room on the current page
                var numDatumCurrentlyDisplayed = self.datumsView.collection.length
                if ((numDatumCurrentlyDisplayed == 0) || (numDatumCurrentlyDisplayed % self.perPage != 0)) {
                  // Render at the bottom
                  self.datumsView.collection.add(model);
                  
                  // Display the updated data list
                  appView.renderReadonlyDataListViews();
                  appView.renderEditableDataListViews();
                }
              }
            });
          });
        } else {
          // Display the updated data list
          appView.renderReadonlyDataListViews();
          appView.renderEditableDataListViews();
        }
      }
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
    
    resizeSmall : function(){
      window.app.router.showDashboard();
    },
    
    resizeFullscreen : function(){
      window.app.router.showFullscreenDataList();
    },

    updateTitle: function(){
      this.model.set("title",this.$el.find(".data-list-title").val());
      if(this.model.id){
        window.appView.addUnsavedDoc(this.model.id);
      }
    },
    
    updateDescription: function(){
      this.model.set("description",this.$el.find(".data-list-description").val());
      if(this.model.id){
        window.appView.addUnsavedDoc(this.model.id);
      }
    },
    
    //bound to pencil
    showReadonly :function(){
      window.app.router.showReadonlyDataList();
    },
    
    //bound to change
    showEditable :function(){
      //If the model has changed, then change the views of the internal models because they are no longer connected with this corpus's models
      this.changeViewsOfInternalModels();
      
      window.appView.renderEditableDataListViews();
    },
    
    updatePouch : function() {
      var newDataList = true;
      if(this.model.id){
        newDataList = false;
      }
      var self = this;
      this.model.saveAndInterConnectInApp(function(){
        /* If it is in the modal, then it is a new session */
        if(newDataList){
          this.model.setAsCurrentDataList();
        }
      });
    },
    
  //This the function called by the add button, it adds a new comment state both to the collection and the model
    insertNewComment : function() {
      console.log("I'm a new comment!");
      var m = new Comment({
        "text" : this.$el.find(".comment-new-text").val(),

//        "label" : this.$el.children(".comment_input").val(),//TODO turn this back on

      });
      this.model.get("comments").add(m);
      if(this.model.id){
        window.appView.addUnsavedDoc(this.model.id);
      }
      this.$el.find(".comment-new-text").val("");
    },
    
  });

  return DataListEditView;
});