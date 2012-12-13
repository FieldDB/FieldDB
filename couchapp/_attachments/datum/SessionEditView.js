define([
    "backbone", 
    "handlebars", 
    "activity/Activity",
    "comment/Comment",
    "comment/Comments",
    "comment/CommentReadView",
    "datum/DatumFieldEditView",
    "datum/Session",
    "app/UpdatingCollectionView",
    "libs/OPrime"
], function(
    Backbone,
    Handlebars, 
    Activity,
    Comment,
    Comments,
    CommentReadView,
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
      OPrime.debug("SESSION EDIT VIEW init: " );
      
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
      
      //Add button inserts new Comment
      "click .add-comment-session" : function(e) {
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        var commentstring = this.$el.find(".comment-new-text").val();
        
        this.model.insertNewComment(commentstring);
        this.$el.find(".comment-new-text").val("");
        
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
      OPrime.debug("SESSION EDIT render: " );
      if (this.model == undefined) {
        OPrime.debug("SESSION is undefined, come back later.");
        return this;
      }
      
      try{
        if (this.model.get("sessionFields").where({label: "goal"})[0] == undefined) {
          OPrime.debug("SESSION fields are undefined, come back later.");
          return this;
        }
        if(this.format != "modal"){
          appView.currentSessionEditView.destroy_view();
          appView.currentSessionReadView.destroy_view();
        }
        if (this.format == "leftSide") {
          OPrime.debug("SESSION EDIT  LEFTSIDE render: " );

          var jsonToRender = {
            goal : this.model.get("sessionFields").where({label: "goal"})[0].get("mask"),
            consultants : this.model.get("sessionFields").where({label: "consultants"})[0].get("mask"),
            dateElicited : this.model.get("sessionFields").where({label: "dateElicited"})[0].get("mask")//NOTE: changed this to the date elicited, they shouldnt edit the date entered.
          };
          
          this.setElement("#session-quickview");
          $(this.el).html(this.templateSummary(jsonToRender));
          
          //Localization for leftSide
          $(this.el).find(".locale_Show_Readonly").attr("title", Locale.get("locale_Show_Readonly"));
          $(this.el).find(".locale_Show_Fullscreen").attr("title", Locale.get("locale_Show_Fullscreen"));
          $(this.el).find(".locale_Elicitation_Session").html(Locale.get("locale_Elicitation_Session"));
          $(this.el).find(".locale_Goal").html(Locale.get("locale_Goal"));
          $(this.el).find(".locale_Consultants").html(Locale.get("locale_Consultants"));
          $(this.el).find(".locale_When").html(Locale.get("locale_When"));

          
        }if (this.format == "import") {
          OPrime.debug("SESSION EDIT  IMPORT render: " );

          var jsonToRender = {
            goal : this.model.get("sessionFields").where({label: "goal"})[0].get("mask"),
            consultants : this.model.get("sessionFields").where({label: "consultants"})[0].get("mask"),
            dateElicited : this.model.get("sessionFields").where({label: "dateElicited"})[0].get("mask")//NOTE: changed this to the date elicited, they shouldnt edit the date entered.
          };
          
          this.setElement("#import-session");
          $(this.el).html(this.templateImport(jsonToRender));
          
          //Localization for leftSide
          $(this.el).find(".locale_Elicitation_Session").html(Locale.get("locale_Elicitation_Session"));
          $(this.el).find(".locale_Goal").html(Locale.get("locale_Goal"));
          $(this.el).find(".locale_Consultants").html(Locale.get("locale_Consultants"));
          $(this.el).find(".locale_When").html(Locale.get("locale_When"));

          
        } else if (this.format == "centerWell") {
          OPrime.debug("SESSION EDIT CENTERWELL render: " );

          this.setElement("#session-embedded");
          $(this.el).html(this.templateEmbedded(this.model.toJSON()));
   
          this.sessionFieldsView.el = this.$(".session-fields-ul");
          this.sessionFieldsView.render();
          
          // Display the CommentReadView
          this.commentReadView.el = this.$('.comments');
          this.commentReadView.render();
          
          //Localization for centerWell
          $(this.el).find(".locale_Show_Readonly").attr("title", Locale.get("locale_Show_Readonly"));
          $(this.el).find(".locale_Show_in_Dashboard").attr("title", Locale.get("locale_Show_in_Dashboard"));
          $(this.el).find(".locale_Save").html(Locale.get("locale_Save"));
          $(this.el).find(".locale_Elicitation_Session").html(Locale.get("locale_Elicitation_Session"));
          $(this.el).find(".locale_Add").html(Locale.get("locale_Add"));

        } else if (this.format == "fullscreen") {
          OPrime.debug("SESSION EDIT FULLSCREEN render: " );

          this.setElement("#session-fullscreen");
          this.$el.html(this.templateFullscreen(this.model.toJSON()));
          
          this.sessionFieldsView.el = this.$(".session-fields-ul");
          this.sessionFieldsView.render();
         
          // Display the CommentReadView
          this.commentReadView.el = this.$('.comments');
          this.commentReadView.render();
          
          //Localization for fullscreen
          $(this.el).find(".locale_Show_Readonly").attr("title", Locale.get("locale_Show_Readonly"));
          $(this.el).find(".locale_Show_in_Dashboard").attr("title", Locale.get("locale_Show_in_Dashboard"));
          $(this.el).find(".locale_Save").html(Locale.get("locale_Save"));
          $(this.el).find(".locale_Elicitation_Session").html(Locale.get("locale_Elicitation_Session"));
          $(this.el).find(".locale_Add").html(Locale.get("locale_Add"));

          
        } else if (this.format == "modal") {
          OPrime.debug("SESSION EDIT MODAL render: " );

          this.setElement("#new-session-modal");
          this.changeViewsOfInternalModels();
          this.$el.html(this.templateModal(this.model.toJSON()));
          
          this.sessionFieldsView.el = this.$(".session-fields-ul");
          this.sessionFieldsView.render();
          // Display the CommentReadView
          this.commentReadView.el = this.$('.comments');
          this.commentReadView.render();
          
          //Localization for modal
          $(this.el).find(".locale_New_Session").html(Locale.get("locale_New_Session"));
          $(this.el).find(".locale_New_Session_Instructions").html(Locale.get("locale_New_Session_Instructions"));
          $(this.el).find(".locale_Cancel").html(Locale.get("locale_Cancel"));
          $(this.el).find(".locale_Save").html(Locale.get("locale_Save"));

        }
      } catch(e) {
        OPrime.debug("There was a problem rendering the session, probably the datumfields are still arrays and havent been restructured yet.");
      }
      
      return this;
    },    
    
    changeViewsOfInternalModels : function(){
      this.sessionFieldsView = new UpdatingCollectionView({
        collection           : this.model.get("sessionFields"),
        childViewConstructor : DatumFieldEditView,
        childViewTagName     : "li",
        childViewFormat      : "session"
      });
      
      this.commentReadView = new UpdatingCollectionView({
        collection           : this.model.get("comments"),
        childViewConstructor : CommentReadView,
        childViewTagName     : 'li'
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
        OPrime.debug("Session format is "+self.format);
        if(self.format == "modal"){
          self.model.setAsCurrentSession(function(){
            $("#new-session-modal").modal("hide");
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
      OPrime.debug("DESTROYING SESSION EDIT VIEW "+ this.format);
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
