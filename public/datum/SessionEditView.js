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
    "libs/Utils"
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
     * initialized. Valid values are "leftSide", "fullscreen", "modal", and 
     * "embedded" 
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("SESSION init: " + this.el);
      
      this.changeViewsOfInternalModels();
      
      this.model.bind('change', this.showEditable, this);
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
      "click .add-comment-session-edit" : 'insertNewComment',
      
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
      })[0].set("value", this.$el.find(".session-consultant-input")
          .val());
      
      window.appView.addUnsavedDoc(this.model.id);

    },
    
    updateElicitedDate : function(){
      this.model.get("sessionFields").where({
        label : "dateElicited"
      })[0].set("value", this.$el.find(".session-elicitation-date-input")
          .val());
      
      window.appView.addUnsavedDoc(this.model.id);

    },
    
    updateGoal : function(){
      this.model.get("sessionFields").where({
        label : "goal"
      })[0].set("value", this.$el.find(".session-goal-input")
          .val());
      
      window.appView.addUnsavedDoc(this.model.id);

    },
    
    /**
     * The Handlebars template rendered as the Embedded.
     */
    templateEmbedded: Handlebars.templates.session_edit_embedded,
    
    /**
     * The Handlebars template rendered as the Summary.
     */
    templateSummary : Handlebars.templates.session_summary_edit_embedded,
    
    /**
     * The Handlebars template rendered as the Fullscreen.
     */
    templateFullscreen : Handlebars.templates.session_edit_fullscreen,
    
    /**
     * The Handlebars template rendered as the Modal.
     */
    templateModal : Handlebars.templates.session_edit_modal,
    
    /**
     * Renders the SessionEditView.
     */
    render : function() {
      Utils.debug("SESSION render: " + this.el);
      if (this.model == undefined) {
        Utils.debug("SESSION is undefined, come back later.");
        return this;
      }
      
      try{
        if (this.model.get("sessionFields").where({label: "goal"})[0] == undefined) {
          Utils.debug("SESSION fields are undefined, come back later.");
          return this;
        }
        if (this.format == "embedded") {
          this.setElement("#session-embedded");
          $(this.el).html(this.templateEmbedded(this.model.toJSON()));
   
          this.sessionFieldsView.el = this.$(".session-fields-ul");
          this.sessionFieldsView.render();
          
          // Display the CommentReadView
          this.commentReadView.el = this.$('.comments');
          this.commentReadView.render();
          
        } else if (this.format == "leftSide") {
          var jsonToRender = {
            goal : this.model.get("sessionFields").where({label: "goal"})[0].get("value"),
            consultants : this.model.get("sessionFields").where({label: "consultants"})[0].get("value"),
            dateElicited : this.model.get("sessionFields").where({label: "dateElicited"})[0].get("value")//NOTE: changed this to the date elicited, they shouldnt edit the date entered.
          };
          
          this.setElement("#session-quickview");
          $(this.el).html(this.templateSummary(jsonToRender));
          
        } else if (this.format == "fullscreen") {
          this.setElement("#session-fullscreen");
          this.$el.html(this.templateFullscreen(this.model.toJSON()));
          
          this.sessionFieldsView.el = this.$(".session-fields-ul");
          this.sessionFieldsView.render();
         
          // Display the CommentReadView
          this.commentReadView.el = this.$('.comments');
          this.commentReadView.render();
          
        } else if (this.format == "modal") {
          this.setElement("#new-session-modal");
          this.$el.html(this.templateModal(this.model.toJSON()));
          
          this.sessionFieldsView.el = this.$(".session-fields-ul");
          this.sessionFieldsView.render();
          // Display the CommentReadView
          this.commentReadView.el = this.$('.comments');
          this.commentReadView.render();
        }
      } catch(e) {
        Utils.debug("There was a problem rendering the session, probably the datumfields are still arrays and havent been restructured yet.");
      }
      
      //localization
      $(".Session").html(chrome.i18n.getMessage("Session"));
      $(".Save").html(chrome.i18n.getMessage("Save"));
      $(".Add").html(chrome.i18n.getMessage("Add"));
      $(".New_Session").html(chrome.i18n.getMessage("New_Session"));
      $(".New_Session_Instructions").html(chrome.i18n.getMessage("New_Session_Instructions"));
      $(".Cancel").html(chrome.i18n.getMessage("Cancel"));
      $(".Consultants").html(chrome.i18n.getMessage("Consultants"));
      $(".Goal").html(chrome.i18n.getMessage("Goal"));
      $(".When").html(chrome.i18n.getMessage("When"));
      $(".loc_Show_Readonly").attr("title", chrome.i18n.getMessage("loc_Show_Readonly"));
      $(".loc_Show_fullscreen").attr("title", chrome.i18n.getMessage("loc_Show_fullscreen"));





      
      
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
    updatePouch : function() {
      Utils.debug("Saving the Session");
      var self = this;
      this.model.changeCorpus(this.model.get("corpusname"),function(){
        self.model.save(null, {
          success : function(model, response) {
            Utils.debug('Session save success');
            window.appView.toastUser("Sucessfully saved session.","alert-success","Saved!");

            try{
              if(window.app.get("currentSession").id != model.id){
                window.app.get("corpus").get("sessions").unshift(model);
                window.app.get("authentication").get("userPrivate").get("activities").unshift(
                    new Activity({
                      verb : "added",
                      directobject : "session "+model.get("sessionFields").where({label: "goal"})[0].get("value"),
                      indirectobject : "in "+window.app.get("corpus").get("title"),
                      context : "via Offline App",
                      user: window.app.get("authentication").get("userPublic")
                    }));
              }
              window.app.set("currentSession", model);
              window.appView.renderEditableSessionViews();
              window.appView.renderReadonlySessionViews();
              window.appView.addSavedDoc(model.id);
              window.app.get("authentication").get("userPrivate").get("mostRecentIds").sessionid = model.id;
              //add session to the users session history if they dont already have it
              if(window.app.get("authentication").get("userPrivate").get("sessionHistory").indexOf(model.id) == -1){
                window.app.get("authentication").get("userPrivate").get("sessionHistory").unshift(model.id);
              }
            }catch(e){
              Utils.debug("Couldnt save the session id to the user's mostrecentids"+e);
            }
          },
          error : function(e) {
            Alert('Session save error' + e);
          }
        });
      });
      if(this.format == "modal"){
        $("#new-session-modal").modal("hide");
      }
    },
    
    //functions associated with icons
    resizeSmall : function() {
      window.app.router.showEmbeddedSession();
    },
    
    resizeLarge : function() {
      window.app.router.showFullscreenSession();
    },
    
    //bound to changes
    showEditable :function() {
      this.changeViewsOfInternalModels();
      window.appView.renderEditableSessionViews();
    },
    
    //bound to book
    showReadonly : function() {
      window.app.router.showReadonlySession();
    },
    //This the function called by the add button, it adds a new comment state both to the collection and the model
    insertNewComment : function() {
      console.log("I'm a new comment!");
      var m = new Comment({
        "text" : this.$el.find(".comment-new-text").val(),
      });
      this.model.get("comments").add(m);
      window.appView.addUnsavedDoc(this.model.id);
      this.$el.find(".comment-new-text").val("");

    }
  });
  
  return SessionEditView;
}); 