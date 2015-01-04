define([
    "backbone", 
    "handlebars", 
    "comment/Comment",
    "comment/Comments",
    "comment/CommentReadView",
    "comment/CommentEditView",
    "datum/DatumFieldEditView",
    "datum/Session",
    "app/UpdatingCollectionView",
    "OPrime"
], function(
    Backbone,
    Handlebars, 
    Comment,
    Comments,
    CommentReadView,
    CommentEditView,
    DatumFieldEditView,
    Session,
    UpdatingCollectionView
) {
  var SessionEditView = Backbone.View.extend(
  /** @lends SessionEditView.prototype */
  {
    /**
     * @class Session Edit View is where the user provides new session details.
     *
     ** @property {String} format Must be set when the view is
     * initialized. Valid values are "leftSide", "fullscreen", "modal",  
     * "centerWell" , "import"
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      if (OPrime.debugMode) OPrime.debug("SESSION EDIT VIEW init: " );
      
      this.changeViewsOfInternalModels();
      
      var self = this;
      this.model.bind('change:sessionFields', function(){
        self.changeViewsOfInternalModels();
        self.render();
        }, this);
      
//      this.model.bind('change', this.showEditable, this);
    },

    /**
     * The underlying model of the SessionEditView is a Session.
     */
    model : Session,

    /**
     * Events that the SessionEditView is listening to and their handlers.
     */
    events : {
      "click .btn-save-session" : "updatePouch",
      
//      Issue#797
      "click .trash-button" : "putInTrash", 
      
      //Add button inserts new Comment

      "click .add-comment-button" : function(e) {
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        /* Ask the comment edit view to get it's current text */
        this.commentEditView.updateComment();
        /* Ask the collection to put a copy of the comment into the collection */
        this.model.get("comments").insertNewCommentFromObject(this.commentEditView.model.toJSON());
        /* empty the comment edit view. */
        this.commentEditView.clearCommentForReuse();
        /* save the state of the session when the comment is added, and render it*/
        this.updatePouch();
        this.commentReadView.render();
        

//        this.model.get("comments").unshift(this.commentEditView.model);
//        this.commentEditView.model = new Comment();
        }, 
      //Delete button remove a comment
      "click .remove-comment-button" : function(e) {
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        this.model.get("comments").remove(this.commentEditView.model);
      }, 
      
      "click .icon-resize-small" : 'resizeSmall',
      "click .icon-resize-full" : "resizeLarge",
      "click .icon-book": "showReadonly",
      "blur .session-consultant-input" : "updateConsultant",
      "blur .session-elicitation-date-input" : "updateElicitedDate",
      "blur .session-goal-input" : "updateGoal"
    },
    
    updateConsultant : function(){
      this.model.get("sessionFields").where({
        label : "consultants"
      })[0].set("mask", this.$el.find(".session-consultant-input")
          .val());
      
      if(this.format != "import"){
        window.appView.addUnsavedDoc(this.model.id);
      }
    },
    
    updateElicitedDate : function(){
      this.model.get("sessionFields").where({
        label : "dateElicited"
      })[0].set("mask", this.$el.find(".session-elicitation-date-input")
          .val());
      
      if(this.format != "import"){
        window.appView.addUnsavedDoc(this.model.id);
      }
    },
    
    updateGoal : function(){
      this.model.get("sessionFields").where({
        label : "goal"
      })[0].set("mask", this.$el.find(".session-goal-input")
          .val());
      
      if(this.format != "import"){
        window.appView.addUnsavedDoc(this.model.id);
      }
    },
    
    
    
    templateSummary : Handlebars.templates.session_summary_edit_embedded,
    
    templateEmbedded: Handlebars.templates.session_edit_embedded,

    templateFullscreen : Handlebars.templates.session_edit_embedded,
    
    templateModal : Handlebars.templates.session_edit_modal,
    
    templateImport : Handlebars.templates.session_edit_import,

    /**
     * Renders the SessionEditView.
     */
    render : function() {
      if (OPrime.debugMode) OPrime.debug("SESSION EDIT render: " );
      if (this.model == undefined) {
        if (OPrime.debugMode) OPrime.debug("SESSION is undefined, come back later.");
        return this;
      }
      
      try{
        if (this.model.get("sessionFields").where({label: "goal"})[0] == undefined) {
          if (OPrime.debugMode) OPrime.debug("SESSION fields are undefined, come back later.");
          return this;
        }
        var jsonToRender = this.model.toJSON();
        jsonToRender.goal = this.model.get("sessionFields").where({label: "goal"})[0].get("mask");
        jsonToRender.consultants = this.model.get("sessionFields").where({label: "consultants"})[0].get("mask");
        jsonToRender.dateElicited = this.model.get("sessionFields").where({label: "dateElicited"})[0].get("mask");
        
        jsonToRender.locale_Cancel = Locale.get("locale_Cancel");
        jsonToRender.locale_Consultants = Locale.get("locale_Consultants");
        jsonToRender.locale_Elicitation_Session = Locale.get("locale_Elicitation_Session");
        jsonToRender.locale_Goal = Locale.get("locale_Goal");
        jsonToRender.locale_New_Session = Locale.get("locale_New_Session");
        jsonToRender.locale_New_Session_Instructions = Locale.get("locale_New_Session_Instructions");
        jsonToRender.locale_Save = Locale.get("locale_Save");
        jsonToRender.locale_Show_Fullscreen = Locale.get("locale_Show_Fullscreen");
        jsonToRender.locale_Show_Readonly = Locale.get("locale_Show_Readonly");
        jsonToRender.locale_Show_in_Dashboard = Locale.get("locale_Show_in_Dashboard");
        jsonToRender.locale_When = Locale.get("locale_When");
    
        
        if(this.format != "modal"){
          appView.currentSessionEditView.destroy_view();
          appView.currentSessionReadView.destroy_view();
        }
        if (this.format == "leftSide") {
          if (OPrime.debugMode) OPrime.debug("SESSION EDIT  LEFTSIDE render: " );
          
          this.setElement("#session-quickview");
          $(this.el).html(this.templateSummary(jsonToRender));
          
        }if (this.format == "import") {
          if (OPrime.debugMode) OPrime.debug("SESSION EDIT  IMPORT render: " );
          
          this.setElement("#import-session");
          $(this.el).html(this.templateImport(jsonToRender));
          
          
        } else if (this.format == "centerWell") {
          if (OPrime.debugMode) OPrime.debug("SESSION EDIT CENTERWELL render: " );

          this.setElement("#session-embedded");
          $(this.el).html(this.templateEmbedded(jsonToRender));
   
          this.sessionFieldsView.el = this.$(".session-fields-ul");
          this.sessionFieldsView.render();
          
        } else if (this.format == "fullscreen") {
          if (OPrime.debugMode) OPrime.debug("SESSION EDIT FULLSCREEN render: " );

          this.setElement("#session-fullscreen");
          this.$el.html(this.templateFullscreen(jsonToRender));
          
          this.sessionFieldsView.el = this.$(".session-fields-ul");
          this.sessionFieldsView.render();
         
          // Display the CommentReadView
          this.commentReadView.el = $(this.el).find('.comments'); 
          this.commentReadView.render();
          
          // Display the CommentEditView
          this.commentEditView.el = $(this.el).find('.new-comment-area'); 
          this.commentEditView.render();
          
        } else if (this.format == "modal") {
          if (OPrime.debugMode) OPrime.debug("SESSION EDIT MODAL render: " );

          this.setElement("#new-session-modal");
          this.changeViewsOfInternalModels();
          this.$el.html(this.templateModal(jsonToRender));
          
          this.sessionFieldsView.el = this.$(".session-fields-ul");
          this.sessionFieldsView.render();
          
          // Display the CommentReadView
          this.commentReadView.el = $(this.el).find('.comments');
          this.commentReadView.render();

          // Display the CommentEditView
          this.commentEditView.el = $(this.el).find('.new-comment-area'); 
          this.commentEditView.render();

        }
      } catch(e) {
        if (OPrime.debugMode) OPrime.debug("There was a problem rendering the session, probably the datumfields are still arrays and havent been restructured yet.");
      }
      
      return this;
    },    
    
    /**
     * See definition in the model
     * 
     */
    putInTrash : function(e){
      if(e){
        e.preventDefault();
      }
      var r = confirm("Are you sure you want to put this session in the trash?");
      if (r == true) {
        this.model.putInTrash();
      }
    },
    
    changeViewsOfInternalModels : function(){
      this.sessionFieldsView = new UpdatingCollectionView({
        collection           : this.model.get("sessionFields"),
        childViewConstructor : DatumFieldEditView,
        childViewTagName     : "tr",
        childViewFormat      : "session"
      });
      
      this.commentReadView = new UpdatingCollectionView({
        collection           : this.model.get("comments"),
        childViewConstructor : CommentReadView,
        childViewTagName     : 'li'
      });
      
      this.commentEditView = new CommentEditView({
        model : new Comment(),
      });
    },
    /**
     * creates a new session if the app's session id doesnt match this session's id after saving.
     */
    updatePouch : function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      var self = this;
      this.model.saveAndInterConnectInApp(function(){
        /* If it is in the modal, then it is a new session */
        if (OPrime.debugMode) OPrime.debug("Session format is "+self.format);
        if(self.format == "modal"){
          self.model.setAsCurrentSession(function(){
            $("#new-session-modal").hide();
            window.appView.currentSessionReadView.render();
          });
        }else{
          window.appView.currentSessionReadView.format = self.format;
          window.appView.currentSessionReadView.render();
        }
      });
    },
    //functions associated with icons
    resizeSmall : function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      window.location.href = "#render/true";
    },
    
    resizeLarge : function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      this.format = "fullscreen";
      this.render();
      window.app.router.showFullscreenSession();
    },
    
    //bound to changes
    showEditable :function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      this.changeViewsOfInternalModels();
      this.render();
    },
    
    //bound to book
    showReadonly : function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      window.appView.currentSessionReadView.format = this.format;
      window.appView.currentSessionReadView.render();
    },
   
    /**
     * 
     * http://stackoverflow.com/questions/6569704/destroy-or-remove-a-view-in-backbone-js
     */
    destroy_view: function() {
      if (OPrime.debugMode) OPrime.debug("DESTROYING SESSION EDIT VIEW "+ this.format);
      //COMPLETELY UNBIND THE VIEW
      this.undelegateEvents();

      $(this.el).removeData().unbind(); 

      //Remove view from DOM
//      this.remove();  
//      Backbone.View.prototype.remove.call(this);
      }
  });
  
  return SessionEditView;
}); 
