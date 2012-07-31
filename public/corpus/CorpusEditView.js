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
     
      
      // If the model changes, re-render
      this.model.bind('change', this.showEditable, this);
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
      "click .add-datum-state" : 'insertNewDatumState',
      
      //Add button inserts new Datum Field
      "click .add-datum-field" : 'insertNewDatumField',
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
      if (this.format == "centreWell") {
        Utils.debug("CORPUS READ FULLSCREEN render: " + this.el);
        if (this.model != undefined) {
          // Display the CorpusEditEmbeddedView
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
   
        } else {
          Utils.debug("\tCorpus model was undefined.");
        }
      } else if (this.format == "fullscreen") {
        this.setElement($("#corpus-fullscreen"));
        $(this.el).html(this.templateFullscreen(this.model.toJSON()));

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

      } else if (this.format == "leftSide"){
        this.setElement($("#corpus-quickview"));
        $(this.el).html(this.templateSummary(this.model.toJSON()));
      
      }else if (this.format == "modal"){
        this.setElement($("#new-corpus-modal"));
        $(this.el).html(this.templateNewCorpus(this.model.toJSON()));
      
      }else {
        throw("You have not specified a format that the CorpusEditView can understand.");
      }
        
      //localization
      $(".locale_New_menu").html(chrome.i18n.getMessage("locale_New_menu"));
      $(".locale_New_Datum").html(chrome.i18n.getMessage("locale_New_Datum"));
      $(".locale_New_Data_List").html(chrome.i18n.getMessage("locale_New_Data_List"));
      $(".locale_New_Session").html(chrome.i18n.getMessage("locale_New_Session"));
      $(".locale_New_Corpus").html(chrome.i18n.getMessage("locale_New_Corpus"));
      $(".locale_Data_menu").html(chrome.i18n.getMessage("locale_Data_menu"));
      $(".locale_Import_Data").html(chrome.i18n.getMessage("locale_Import_Data"));
      $(".locale_Export_Data").html(chrome.i18n.getMessage("locale_Export_Data"));
      $(".locale_Save").html(chrome.i18n.getMessage("locale_Save"));
      $(".locale_Title").html(chrome.i18n.getMessage("locale_Title"));
      $(".locale_Description").html(chrome.i18n.getMessage("locale_Description"));
      $(".locale_Sessions_associated").html(chrome.i18n.getMessage("locale_Sessions_associated"));
      $(".locale_Datalists_associated").html(chrome.i18n.getMessage("locale_Datalists_associated"));
      $(".locale_Permissions_associated").html(chrome.i18n.getMessage("locale_Permissions_associated"));
      $(".locale_Datum_field_settings").html(chrome.i18n.getMessage("locale_Datum_field_settings"));
      $(".locale_Encrypt_if_confidential").html(chrome.i18n.getMessage("locale_Encrypt_if_confidential"));
      $(".locale_Help_Text").html(chrome.i18n.getMessage("locale_Help_Text"));
      $(".locale_Add").html(chrome.i18n.getMessage("locale_Add"));
      $(".locale_Datum_state_settings").html(chrome.i18n.getMessage("locale_Datum_state_settings"));
      $(".locale_Green").html(chrome.i18n.getMessage("locale_Green"));
      $(".locale_Orange").html(chrome.i18n.getMessage("locale_Orange"));
      $(".locale_Red").html(chrome.i18n.getMessage("locale_Red"));
      $(".locale_Blue").html(chrome.i18n.getMessage("locale_Blue"));
      $(".locale_Teal").html(chrome.i18n.getMessage("locale_Teal"));
      $(".locale_Black").html(chrome.i18n.getMessage("locale_Black"));
      $(".locale_Default").html(chrome.i18n.getMessage("locale_Default"));
      $(".locale_Warning").html(chrome.i18n.getMessage("locale_Warning"));
      $(".locale_New_Corpus").html(chrome.i18n.getMessage("locale_New_Corpus"));
      $(".locale_New_Corpus_Instructions").html(chrome.i18n.getMessage("locale_New_Corpus_Instructions"));
      $(".locale_New_Corpus_Warning").html(chrome.i18n.getMessage("locale_New_Corpus_Warning"));
      $(".locale_Cancel").html(chrome.i18n.getMessage("locale_Cancel"));
      $(".locale_Description_Summary_Edit").html(chrome.i18n.getMessage("locale_Description"));
      $(".locale_Help_Text_Placeholder").attr("placeholder", chrome.i18n.getMessage("locale_Help_Text_Placeholder"));
      $(".locale_Add_Placeholder").attr("placeholder", chrome.i18n.getMessage("locale_Add_Placeholder"));
      $(".locale_Show_Readonly").attr("title", chrome.i18n.getMessage("locale_Show_Readonly"));
      $(".locale_Show_fullscreen").attr("title", chrome.i18n.getMessage("locale_Show_fullscreen"));
      $(".locale_Add_locale_New_Datum_Field").attr("title", chrome.i18n.getMessage("locale_Add_locale_New_Datum_Field"));
      $(".locale_Add_locale_New_Datum_State").attr("title", chrome.i18n.getMessage("locale_Add_locale_New_Datum_State"));
      $(".locale_Show_in_Dashboard").attr("title", chrome.i18n.getMessage("locale_Show_in_Dashboard"));
      $(".locale_Edit_corpus").attr("title", chrome.i18n.getMessage("locale_Edit_corpus"));
      $(".locale_Show_corpus_settings").attr("title", chrome.i18n.getMessage("locale_Show_corpus_settings"));


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
      
      //Create a Permissions View
      this.permissionsView = new UpdatingCollectionView({
        collection : this.model.get("permissions"),
        childViewConstructor : PermissionEditView,
        childViewTagName     : 'li',
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
      window.app.get("currentSession").save();
      //Clone it and send its clone to the session modal so that the users can modify the fields and then change their mind, wthout affecting the current session.
      window.appView.sessionModalView.model = window.app.get("currentSession").clone();
      //Give it a null id so that pouch will save it as a new model.
      //WARNING this might not be a good idea, if you find strange side effects in sessions in the future, it might be due to this way of creating (duplicating) a session.
      window.appView.sessionModalView.model.id = undefined;
      window.appView.sessionModalView.model.rev = undefined;
      window.appView.sessionModalView.model.set("_id", undefined);
      window.appView.sessionModalView.model.set("_rev", undefined);
      window.appView.sessionModalView.render();
    },
    
    newCorpus : function(){
      $("#new-corpus-modal").modal("show");
      //Save the current session just in case
      window.app.get("corpus").save();
      //Clone it and send its clone to the session modal so that the users can modify the fields and then change their mind, wthout affecting the current session.
      window.appView.corpusNewModalView.model = window.app.get("corpus").clone(); //MUST be a new model, other wise it wont save in a new pouch.
      //Give it a null id so that pouch will save it as a new model.
      window.appView.corpusNewModalView.model.id = undefined;
      window.appView.corpusNewModalView.model.rev = undefined;
      window.appView.corpusNewModalView.model.set("_id", undefined);
      //WARNING this might not be a good idea, if you find strange side effects in corpora in the future, it might be due to this way of creating (duplicating) a corpus. However with a corpus it is a good idea to duplicate the permissions and settings so that the user won't have to redo them.
      window.appView.corpusNewModalView.model.set("title", window.app.get("corpus").get("title")+ " copy");
      window.appView.corpusNewModalView.model.set("titleAsUrl", window.app.get("corpus").get("titleAsUrl")+"Copy");
      window.appView.corpusNewModalView.model.set("corpusname", window.app.get("corpus").get("corpusname")+"copy");
      window.appView.corpusNewModalView.model.get("couchConnection").corpusname = window.app.get("corpus").get("corpusname")+"copy";
      window.appView.corpusNewModalView.model.set("description", "Copy of: "+window.app.get("corpus").get("description"));
      window.appView.corpusNewModalView.model.set("dataLists", new DataLists());
      window.appView.corpusNewModalView.model.set("sessions", new Sessions());
      window.appView.corpusNewModalView.render();
    },
      
    

     //Insert functions associate the values chosen with a new
    // model in the collection, adding it to the collection, which in turn
    // triggers a view thats added to
    // the ul
    
    //TODO this function needs to mean "save" ie insert new comment in the db, not add an empty comment on the screen. 
//    this a confusion of the pattern in the datumfilds view where exsting fields are in the  updating collection (just 
//    like extisting comments are in the updating collection) and there is a blank one in the 
//    corpus_edit_embedded corpus_edit_fullscreen handlebars

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
        "encrypted" : checked,
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
//        "encrypted" : checked,
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
      Utils.debug("Saving the Corpus");
      var self = this;
      if(this.model.id == undefined){
        this.model.set("corpusname", window.app.get("authentication").get("userPrivate").get("username")
          +"-"+encodeURIComponent(this.model.get("title").replace(/[^a-zA-Z0-9-._~]/g,"").replace(/ /g,"")) );
        this.model.get("couchConnection").corpusname = window.app.get("authentication").get("userPrivate").get("username")
          +"-"+encodeURIComponent(this.model.get("title").replace(/[^a-zA-Z0-9-._~]/g,"").replace(/ /g,"")) ;
      }
      this.model.changeCorpus(window.app.get("authentication").get("userPrivate").get("username")
          +"-"+encodeURIComponent(this.model.get("title").replace(/[^a-zA-Z0-9-._~]/g,"").replace(/ /g,"")), function(){
        self.model.save(null, {
          success : function(model, response) {
            Utils.debug('Corpus save success');
            window.appView.toastUser("Sucessfully saved corpus.","alert-success","Saved!");

//            try{
              if(window.app.get("corpus").id != model.id){
                //add corpus to user
                model.set("titleAsUrl", encodeURIComponent(model.get("title")));
                window.app.get("authentication").get("userPrivate").get("corpuses").unshift(model.get("couchConnection"));
                window.app.get("authentication").get("userPrivate").get("activities").unshift(
                    new Activity({
                      verb : "added",
                      directobject : "a corpus",
                      indirectobject : "",
                      context : "via Offline App",
                      user: window.app.get("authentication").get("userPublic")
                    }));
                //create the first session and datalist for this corpus.
                var s = new Session({
                  corpusname : model.get("corpusname"),
                  sessionFields : model.get("sessionFields").clone()
                }); //MUST be a new model, other wise it wont save in a new pouch.
                s.get("sessionFields").where({label: "user"})[0].set("value", window.app.get("authentication").get("userPrivate").get("username") );
                s.get("sessionFields").where({label: "consultants"})[0].set("value", "AA");
                s.get("sessionFields").where({label: "goal"})[0].set("value", "To explore the app and try entering/importing data");
                s.get("sessionFields").where({label: "dateSEntered"})[0].set("value", new Date());
                s.get("sessionFields").where({label: "dateElicited"})[0].set("value", "A few months ago, probably on a Monday night.");
                s.set("corpusname", model.get("corpusname"));
                s.changeCorpus(model.get("corpusname"));
                model.get("sessions").add(s);
                app.set("currentSession", s);//TODO this will probably require the appView to reinitialize.
                window.app.get("authentication").get("userPrivate").get("mostRecentIds").sessionid = model.id;

                var dl = new DataList({
                  corpusname : model.get("corpusname")}); //MUST be a new model, other wise it wont save in a new pouch.
                dl.set({
                  "title" : "Default Data List",
                  "dateCreated" : (new Date()).toDateString(),
                  "description" : "This is the default data list for this corpus. " +
                    "Any new datum you create is added here. " +
                    "Data lists can be used to create handouts, prepare for sessions with consultants, " +
                    "export to LaTeX, or share with collaborators.",
                  "corpusname" : model.get("corpusname")
                });
                dl.changeCorpus(model.get("corpusname"));
                model.get("dataLists").add(dl);
                window.app.set("currentDataList", dl);
                window.app.get("authentication").get("userPrivate").get("mostRecentIds").datalistid = model.id;
                window.app.get("authentication").get("userPrivate").get("mostRecentIds").corpusid = model.id;
                window.app.set("corpus", model);
                window.app.storeCurrentDashboardIdsToLocalStorage(function(){
                  //force the app to reload with the new corpus as the main corpus, this is require dbecause otherwise we cannot garentee that the new models will end up in the right pouches and in the right views will let go of the old models. 
                  //another alternative would be to implement switchSession and switchDataList functions in the appView
                  window.location.redirect("/");
                });
              }
              window.app.set("corpus", model);
              window.appView.renderEditableCorpusViews();
              window.appView.renderReadonlyCorpusViews();
              window.app.get("authentication").get("userPrivate").get("mostRecentIds").corpusid = model.id;
              window.appView.addSavedDoc(model.id);
              //            }catch(e){
//              Utils.debug("Couldnt save the corpus somewhere"+e);
//            }
            if(this.format == "modal"){
              $("#new-corpus-modal").modal("hide");
              window.app.router.showFullscreenCorpus();
              window.appView.toastUser("The permissions and datum fields and session fields were copied from the previous corpus, please check your corpus settings to be sure they are what you want for this corpus.");
            }
            
            
          },
          error : function(e) {
            Alert('Corpus save error' + e);
            if(this.format == "modal"){
              $("#new-corpus-modal").modal("hide");
              window.app.router.showFullscreenCorpus();
              window.appView.toastUser("The permissions and datum fields and session fields were copied from the previous corpus, please check your corpus settings to be sure they are what you want for this corpus.");
            }
          }
        });
      });
    },  
  });

  return CorpusEditView;
});