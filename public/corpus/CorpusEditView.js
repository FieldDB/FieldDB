define([ 
    "backbone", 
    "handlebars",
    "activity/Activity",
    "corpus/Corpus",
    "comment/Comment",
    "comment/Comments",
    "comment/CommentReadView",
    "data_list/DataList",
    "data_list/DataLists",
    "data_list/DataListReadView",
    "datum/DatumField",
    "datum/DatumFields",
    "datum/DatumFieldEditView",
    "datum/DatumState",
    "datum/DatumStates",
    "datum/DatumStateEditView",
    "permission/Permission",
    "permission/Permissions",
    "permission/PermissionEditView",
    "datum/Session",
    "datum/Sessions",
    "datum/SessionReadView",
    "app/UpdatingCollectionView",
    "libs/Utils"
], function(
    Backbone, 
    Handlebars,
    Activity,
    Corpus,
    Comment,
    Comments,
    CommentReadView,
    DataList,
    DataLists,
    DataListReadView,
    DatumField,
    DatumFields,
    DatumFieldEditView,
    DatumState,
    DatumStates,
    DatumStateEditView,
    Permission,
    Permissions,
    PermissionEditView,
    Session,
    Sessions,
    SessionReadView,
    UpdatingCollectionView
) {
  var CorpusEditView = Backbone.View.extend(
  /** @lends CorpusReadFullScreenView.prototype */
  {
    /**
     * @class This is the corpus view. To the user it looks like a
     *        Navigation panel on the main dashboard screen, which
     *        displays a menu of things the User can do (ex. open a new
     *        session, browse all entries, etc.).
     * 
     * @property {String} format Must be set when the CorpusEditView is
     * initialized. Valid values are "centreWell" and
     * "fullscreen" and "leftSide" and "modal"
     * 
     * @description Starts the Corpus and initializes all its children.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("CORPUS DETAILS init: " + this.el);
      this.changeViewsOfInternalModels();
     
      
      // If the model's title changes, chances are its a new corpus, re-render its internal models.
      this.model.bind('change:title', function(){
        this.changeViewsOfInternalModels();
        this.render();
      }, this);
    },

    /**
     * The underlying model of the CorpusReadFullScreenView is a Corpus.
     */    
    model : Corpus,
   
    /**
     * Events that the CorpusReadFullScreenView is listening to and their handlers.
     */
    events : {
      "click .icon-book": "showReadonly",
      //Add button inserts new Comment
      "click .add-comment-edit" : 'insertNewComment',
    	
      //Add button inserts new Datum State
      "click .add_datum_state" : 'insertNewDatumState',
      
      //Add button inserts new Datum Field
      "click .add_datum_field" : 'insertNewDatumField',
      "click .icon-resize-small" : 'resizeSmall',
      "click .resize-full" : "resizeFullscreen",
      
      //corpus menu buttons
      "click .new-datum-edit" : "newDatum",
      "click .new-data-list" : "newDataList",
      "click .new-session" : "newSession",
      "click .new-corpus" : "newCorpus",
      
      //text areas in the edit view
      "blur .corpus-title-input" : "updateTitle",
      "blur .corpus-description-input" : "updateDescription",
//      "blur .update-datum-field" : "updateDatumField",
      "click .save-corpus" : "updatePouch",
//      "blur .save-corpus-blur" : "updatePouch"//TODO why was someone saving the corpus to pouch on blur!? this will make a ton of revisions.
    },

    /**
     * The Handlebars template rendered as the CorpusFullscreenView.
     */
    templateFullscreen : Handlebars.templates.corpus_edit_fullscreen,
    
    /**
     * The Handlebars template rendered as the CorpusWellView.
     */
    templateCentreWell : Handlebars.templates.corpus_edit_embedded,
    
    /**
     * The Handlebars template rendered as the Summary
     */
    templateSummary : Handlebars.templates.corpus_summary_edit_embedded,
    
    
    templateNewCorpus : Handlebars.templates.corpus_edit_new_modal,
    /**
     * Renders the CorpusReadFullScreenView and all of its child Views.
     */
    render : function() {
      if (this.model == undefined) {
        Utils.debug("\tCorpus model was undefined.");
        return this;
      }
      if (this.format == "centreWell") {
        Utils.debug("CORPUS Edit center render: " + this.el);
          // Display the CorpusReadFullScreenView
          this.setElement($("#corpus-embedded"));
          $(this.el).html(this.templateCentreWell(this.model.toJSON()));
          
          // Display the CommentReadView
          this.commentReadView.el = this.$('.comments');
          this.commentReadView.render();
          
          // Display the DataListsView
         this.dataListsView.el = this.$('.datalists-updating-collection'); 
         this.dataListsView.render();
          
         // Display the SessionsView
         this.sessionsView.el = this.$('.sessions-updating-collection'); 
         this.sessionsView.render();
         
         // Display the PermissionsView
         this.permissionsView.el = this.$('.permissions-updating-collection');
         this.permissionsView.render();
         
          // Display the DatumFieldsView
          this.datumFieldsView.el = this.$('.datum_field_settings');
          this.datumFieldsView.render();
          
          // Display the DatumStatesView
          this.datumStatesView.el = this.$('.datum_state_settings');
          this.datumStatesView.render();
      } else if (this.format == "fullscreen") {
        Utils.debug("CORPUS EDIT FULLSCREEN render: " + this.el);

        this.setElement($("#corpus-fullscreen"));
        $(this.el).html(this.templateFullscreen(this.model.toJSON()));

        // Display the CommentReadView
        this.commentReadView.el = this.$('.comments');
        this.commentReadView.render();
        
        // Display the DataListsView
        this.dataListsView.el = this.$('.datalists-updating-collection'); 
        this.dataListsView.render();
        
        // Display the SessionsView
        this.sessionsView.el = this.$('.sessions-updating-collection'); //TODO do not use such ambiguous class names, compare this with datum_field_settings below.  there is a highlyily hood that the sesson module will be using the same class name and will overwrite your renders.
        this.sessionsView.render();
        
        // Display the PermissionsView
        this.permissionsView.el = this.$('.permissions-updating-collection');
        this.permissionsView.render();

        // Display the DatumFieldsView
        this.datumFieldsView.el = this.$('.datum_field_settings');
        this.datumFieldsView.render();

        // Display the DatumStatesView
        this.datumStatesView.el = this.$('.datum_state_settings');
        this.datumStatesView.render();
        
        

      } else if (this.format == "leftSide"){
        this.setElement($("#corpus-quickview"));
        $(this.el).html(this.templateSummary(this.model.toJSON()));
      
      }else if (this.format == "modal"){
        this.setElement($("#new-corpus-modal"));
        $(this.el).html(this.templateNewCorpus(this.model.toJSON()));
      
      }else {
        throw("You have not specified a format that the CorpusEditView can understand.");
      }
        
      return this;
    },
    changeViewsOfInternalModels : function(){
      //Create a CommentReadView     
      this.commentReadView = new UpdatingCollectionView({
        collection           : this.model.get("comments"),
        childViewConstructor : CommentReadView,
        childViewTagName     : 'li'
      });
      
      // Create a DataList List
      this.dataListsView = new UpdatingCollectionView({
        collection : this.model.get("dataLists"),
        childViewConstructor : DataListReadView,
        childViewTagName     : 'li',
        childViewFormat      : "link"
      });
      
      this.model.loadPermissions();
      //Create a Permissions View
      this.permissionsView = new UpdatingCollectionView({
        collection : this.model.permissions,
        childViewConstructor : PermissionEditView,
        childViewTagName     : 'li',
        childViewClass       : "breadcrumb"
      });
      
      //Create a Sessions List 
       this.sessionsView = new UpdatingCollectionView({
         collection : this.model.get("sessions"),
         childViewConstructor : SessionReadView,
         childViewTagName     : 'li',
         childViewFormat      : "link"  
       });
      

      //Create a DatumFieldsView     
      this.datumFieldsView = new UpdatingCollectionView({
        collection           : this.model.get("datumFields"),
        childViewConstructor : DatumFieldEditView,
        childViewTagName     : 'li',
        childViewFormat      : "corpus",
        childViewClass       : "breadcrumb"
      });
          
      // Create a DatumStatesView    
      this.datumStatesView = new UpdatingCollectionView({
        collection           : this.model.get("datumStates"),
        childViewConstructor : DatumStateEditView,
        childViewTagName     : 'li',
        childViewFormat      : "corpus"
      });
      
    },
    
    updateTitle: function(){
      this.model.set("title",this.$el.find(".corpus-title-input").val());
      window.appView.addUnsavedDoc(this.model.id);

    },
    
    updateDescription: function(){
      this.model.set("description",this.$el.find(".corpus-description-input").val());
      window.appView.addUnsavedDoc(this.model.id);

    },
   
    //Functions assoicate with the corpus menu
    newDatum : function() {
      appView.datumsView.newDatum();
      app.router.showDashboard();
    },
    
    newDataList : function() {
      //take the user to the search so they can create a data list using the search feature.
      window.appView.toastUser("Taking you to the Advanced Search, this is the easiest way to make a new Data List","alert-info","How to make a new Data List");
      app.router.showEmbeddedSearch();
    },
    
    newSession : function() {
      $("#new-session-modal").modal("show");
      //Save the current session just in case
      window.app.get("currentSession").saveAndInterConnectInApp();
      //Clone it and send its clone to the session modal so that the users can modify the fields and then change their mind, wthout affecting the current session.
      window.appView.sessionModalView.model = new Session({
        corpusname : window.app.get("corpus").get("corpusname"),
        sessionFields : new DatumFields(window.app.get("currentSession").get("sessionFields").toJSON())
      });
      window.appView.sessionModalView.model.set("comments", new Comments());
      window.appView.sessionModalView.render();
    },
    
    newCorpus : function(){
      $("#new-corpus-modal").modal("show");
      //Save the current session just in case
      window.app.get("corpus").saveAndInterConnectInApp();
      //Clone it and send its clone to the session modal so that the users can modify the fields and then change their mind, wthout affecting the current session.
      window.appView.corpusNewModalView.model = new Corpus(window.app.get("corpus").toJSON()); //MUST be a new model, other wise it wont save in a new pouch.
      //Give it a null id so that pouch will save it as a new model.
      //WARNING this might not be a good idea, if you find strange side effects in corpora in the future, it might be due to this way of creating (duplicating) a corpus. However with a corpus it is a good idea to duplicate the permissions and settings so that the user won't have to redo them.
      window.appView.corpusNewModalView.model.set("title", window.app.get("corpus").get("title")+ " copy");
      window.appView.corpusNewModalView.model.set("titleAsUrl", window.app.get("corpus").get("titleAsUrl")+"Copy");
      window.appView.corpusNewModalView.model.set("corpusname", window.app.get("corpus").get("corpusname")+"copy");
      window.appView.corpusNewModalView.model.get("couchConnection").corpusname = window.app.get("corpus").get("corpusname")+"copy";
      window.appView.corpusNewModalView.model.set("description", "Copy of: "+window.app.get("corpus").get("description"));
      window.appView.corpusNewModalView.model.set("dataLists", new DataLists());
      window.appView.corpusNewModalView.model.set("sessions", new Sessions());
      window.appView.corpusNewModalView.model.set("comments", new Comments());
      window.appView.corpusNewModalView.render();
    },

     //Insert functions associate the values chosen with a new
    // model in the collection, adding it to the collection, which in turn
    // triggers a view thats added to
    // the ul

    //This the function called by the add button, it adds a new comment state both to the collection and the model
    insertNewComment : function() {
      var m = new Comment({
        "text" : this.$el.find(".comment-new-text").val(),
//        "username" : 
     });
      
      // Add new comment to the db ? 
      this.model.get("comments").add(m);
      window.appView.addUnsavedDoc(this.model.id);
      this.$el.find(".comment-new-text").val("");

    },
    
    // This the function called by the add button, it adds a new datum field both to the 
    // collection and the model
    insertNewDatumField : function() {
      //don't add blank fields
      if(this.$el.find(".choose_add_field").val().toLowerCase().replace(/ /g,"_") == ""){
        return;
      }
      // Remember if the encryption check box was checked
      var checked = this.$el.find(".add_encrypted").is(':checked') ? "checked" : "";
      
      // Create the new DatumField based on what the user entered
      var m = new DatumField({
        "label" : this.$el.find(".choose_add_field").val().toLowerCase().replace(/ /g,"_"),
        "shouldBeEncrypted" : checked,
        "help" : this.$el.find(".add_help").val()
      });

      // Add the new DatumField to the Corpus' list for datumFields
      this.model.get("datumFields").add(m);
      
      // Reset the line with the add button
      this.$el.find(".choose_add_field").val("");//.children("option:eq(0)").attr("selected", true);
      this.$el.find(".add_help").val("");
      window.appView.addUnsavedDoc(this.model.id);

    },
    //needed to be able to change datum fields NO, this already exists in the DatumFieldEditView.js
//    updateDatumField : function(e) {
//      var datumField = $(e.target.parentElement);
//      var checked = datumField.find(".encrypted").is(':checked') ? "checked" : "";
//      var oldLabel = e.target.parentElement.firstChild.classList[1]; //get the old label from the span
//      // Create the new DatumField based on what the user entered
//      var m = this.model.get("datumFields").where({"label" : oldLabel })[0]; //TODO if this doesnt work could maybe count from top.
//      if(!m){
//        window.appView.toastUser("Couldn't find your datum field to modify it."); 
//        return;
//      }
//      m.set({
//        "label" : datumField.find(".choose-field").val().toLowerCase().replace(/ /g,"_"),
//        "shouldBeEncrypted" : checked,
//        "help" : datumField.find(".help-text").val()
//      });
//      window.appView.addUnsavedDoc(this.model.id);
//    },

    
    //This the function called by the add button, it adds a new datum state both to the collection and the model
    insertNewDatumState : function() {
      var m = new DatumField({
        "state" : this.$el.find(".add_input").val(),
        "color" : this.$el.find(".add_color_chooser").val()
      });
      this.model.get("datumStates").add(m);
      window.appView.addUnsavedDoc(this.model.id);

    },
  //This the function called by the add button, it adds a new datum state both to the collection and the model
    insertNewPermission : function() {
      //TODO perform a server call to do this, and display the the results/errors
      var p = this.model.permissions.where({role: this.$el.find(".choose-add-permission-role").val()})[0];
      if(p){
        p.get("usernames").push(this.$el.find(".choose-add-permission-username").val());
      }

    },
    resizeSmall : function(){
      window.app.router.showEmbeddedCorpus();
    },
    resizeFullscreen : function(){
      window.app.router.showFullscreenCorpus();
    },
    //This is the function that is  bound to the book button
    showReadonly : function(){
      window.app.router.showReadonlyCorpus();
    },
    //This is the function that is bound to changes
    showEditable :function(){
      //If the model has changed, then change the views of the internal models because they are no longer connected with this corpus's models
      this.changeViewsOfInternalModels();
      window.appView.renderEditableCorpusViews();
    },
    /**
     * saves the current corpus to pouch, if the corpus id doesnt match the
     * corpus in the app, It attempts to save it to to its pouch, and create new
     * session and data lists, and then save them to pouch. The new session and
     * datalist are set to the current ones, but the views are not reloaded yet,
     * then the corpus and session and data lists are saved via the
     * app.storeCurrentDashboardIdsToLocalStorage function. after that the app
     * needs to be reloaded entirely (page refresh), or we can attempt to attach
     * the views to these new models.
     */
    updatePouch : function() {
      var self = this;
      this.model.saveAndInterConnectInApp(function(){
        if(this.format == "modal"){
          $("#new-corpus-modal").modal("hide");
          window.appView.toastUser("The permissions and datum fields and session fields were copied from the previous corpus, please check your corpus settings to be sure they are what you want for this corpus.");
        }
      },function(){
        if(this.format == "modal"){
          $("#new-corpus-modal").modal("hide");
          alert("There was a problem somewhere loading and saving the new corpus.")
          window.appView.toastUser("The permissions and datum fields and session fields were copied from the previous corpus, please check your corpus settings to be sure they are what you want for this corpus.");
        }
      });
    }
  });

  return CorpusEditView;
});