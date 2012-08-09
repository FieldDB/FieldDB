define([
    "backbone", 
    "handlebars", 
    "comment/Comment",
    "comment/Comments",
    "comment/CommentReadView",
    "datum/DatumFieldReadView",
    "datum/Session",
    "app/UpdatingCollectionView",
    "libs/Utils"
], function(
    Backbone,
    Handlebars, 
    Comment,
    Comments,
    CommentReadView,
    DatumFieldReadView,
    Session,
    UpdatingCollectionView
) {
  var SessionReadView = Backbone.View.extend(
  /** @lends SessionReadView.prototype */
  {
    /**
     * @class Session Edit View is where the user provides new session details.
    
     * @property {String} format Must be set when the view is
     * initialized. Valid values are "leftSide", "fullscreen", 
     * "centerWell"  and link
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("SESSION READ VIEW init: " );
      
      this.changeViewsOfInternalModels();
      
      var self = this;
      this.model.bind('change:sessionFields', function(){
        self.changeViewsOfInternalModels();
        self.render();
        }, this);
    },

    /**
     * The underlying model of the SessionReadView is a Session.
     */
    model : Session,

    /**
     * Events that the SessionReadView is listening to and their handlers.
     */
    events : {
      //Add button inserts new Comment
      "click .add-comment-session" : 'insertNewComment',
      "click .icon-resize-small" : 'resizeSmall',
      "click .icon-resize-full" : "resizeLarge",
      "click .icon-edit": "showEditable"
    },
    
    /**
     * The Handlebars template rendered as the Summary.
     */
    templateSummary : Handlebars.templates.session_summary_read_embedded,
    
    /**
     * The Handlebars template rendered as the Embedded.
     */
    templateEmbedded: Handlebars.templates.session_read_embedded,
    
    /**
     * The Handlebars template rendered as the Fullscreen.
     */
    templateFullscreen : Handlebars.templates.session_read_embedded,
    
    /**
     * The Handlebars template rendered as the link format.
     */
    templateLink : Handlebars.templates.session_read_link,
    
    /**
     * Renders the SessionReadView.
     */
    render : function() {
      Utils.debug("SESSION READ render: " );
      if (this.model == undefined) {
        Utils.debug("SESSION is undefined, come back later.");
        return this;
      }
      
      try {
        if (this.model.get("sessionFields").where({label: "goal"})[0] == undefined) {
          Utils.debug("SESSION fields are undefined, come back later.");
          return this;
        }
        if(this.format != "link"){
          appView.currentSessionEditView.destroy_view();
          appView.currentSessionReadView.destroy_view();
        }
        if (this.format == "leftSide") {
          Utils.debug("SESSION READ LEFTSIDE render: " );

          var jsonToRender = {
              goal : this.model.get("sessionFields").where({label: "goal"})[0].get("mask"),
              consultants : this.model.get("sessionFields").where({label: "consultants"})[0].get("mask"),
              dateElicited : this.model.get("sessionFields").where({label: "dateElicited"})[0].get("mask")
          };

          this.setElement("#session-quickview");
          $(this.el).html(this.templateSummary(jsonToRender)); 

          //Localization for leftSide
          $(this.el).find(".locale_Edit_Session").attr("title", chrome.i18n.getMessage("locale_Edit_Session"));
          $(this.el).find(".locale_Show_fullscreen").attr("title", chrome.i18n.getMessage("locale_Show_fullscreen"));
          $(this.el).find(".locale_Elicitation_Session").html(chrome.i18n.getMessage("locale_Elicitation_Session"));
          $(this.el).find(".locale_Goal").html(chrome.i18n.getMessage("locale_Goal"));
          $(this.el).find(".locale_Consultants").html(chrome.i18n.getMessage("locale_Consultants"));
          $(this.el).find(".locale_When").html(chrome.i18n.getMessage("locale_When"));

        }else if (this.format == "centerWell") {
          Utils.debug("SESSION READ CENTERWELL render: " );

          this.setElement("#session-embedded");
          $(this.el).html(this.templateEmbedded(this.model.toJSON()));
          
          
          this.sessionFieldsView.el = this.$(".session-fields-ul");
          this.sessionFieldsView.render(); 
          // Display the CommentReadView
          this.commentReadView.el = this.$('.comments');
          this.commentReadView.render();
          
          //Localization for centerWell
          $(this.el).find(".locale_Edit_Session").attr("title", chrome.i18n.getMessage("locale_Edit_Session"));
          $(this.el).find(".locale_Show_in_Dashboard").attr("title", chrome.i18n.getMessage("locale_Show_in_Dashboard"));
          $(this.el).find(".locale_Elicitation_Session").html(chrome.i18n.getMessage("locale_Elicitation_Session"));
          $(this.el).find(".locale_Add").html(chrome.i18n.getMessage("locale_Add"));

        } else if (this.format == "fullscreen") {
          Utils.debug("SESSION READ FULLSCREEN render: " );

          this.setElement("#session-fullscreen");
          $(this.el).html(this.templateFullscreen(this.model.toJSON()));
          
          this.sessionFieldsView.el = this.$(".session-fields-ul");
          this.sessionFieldsView.render();
          // Display the CommentReadView
          this.commentReadView.el = this.$('.comments');
          this.commentReadView.render();
          
          //Localization for fullscreen
          $(this.el).find(".locale_Edit_Session").attr("title", chrome.i18n.getMessage("locale_Edit_Session"));
          $(this.el).find(".locale_Show_in_Dashboard").attr("title", chrome.i18n.getMessage("locale_Show_in_Dashboard"));
          $(this.el).find(".locale_Elicitation_Session").html(chrome.i18n.getMessage("locale_Elicitation_Session"));
          $(this.el).find(".locale_Add").html(chrome.i18n.getMessage("locale_Add"));

        } else if (this.format == "link") {
          Utils.debug("SESSION READ LINK render: " );

          $(this.el).html(this.templateLink(this.model.toJSON()));
       
          var jsonToRender = {
              _id : this.model.get("_id"),
              goal : this.model.get("sessionFields").where({label: "goal"})[0].get("mask"),
              consultants : this.model.get("sessionFields").where({label: "consultants"})[0].get("mask"),
              dateElicited : this.model.get("sessionFields").where({label: "dateElicited"})[0].get("mask")
            };
          $(this.el).html(this.templateLink(jsonToRender));
          
          //Localization of link
          $(this.el).find(".locale_Goal").html(chrome.i18n.getMessage("locale_Goal"));
          $(this.el).find(".locale_Consultants").html(chrome.i18n.getMessage("locale_Consultants"));
          
        } else {
          throw("You have not specified a format that the SessionReadView can understand.");
        }
      } catch(e) {
        Utils.debug("There was a problem rendering the session, probably the datumfields are still arrays and havent been restructured yet.");
      }
      
      return this;
    },
    
    changeViewsOfInternalModels : function(){
      this.sessionFieldsView = new UpdatingCollectionView({
        collection           : this.model.get("sessionFields"),
        childViewConstructor : DatumFieldReadView,
        childViewTagName     : "li",
        childViewFormat      : "session"
      });
      
      this.commentReadView = new UpdatingCollectionView({
        collection           : this.model.get("comments"),
        childViewConstructor : CommentReadView,
        childViewTagName     : 'li'
      });     
      
    },
    
    //functions associated with corner icons
    resizeSmall : function(e) {
      if(e){
        e.stopPropagation();
      }
      window.app.router.showDashboard();
    },
    
    resizeLarge : function(e) {
      if(e){
        e.stopPropagation();
      }
      this.format = "fullscreen";
      this.render();
      window.app.router.showFullscreenSession();
    },
    
    showEditable :function(e) {
      if(e){
        e.stopPropagation();
      }
      window.appView.currentSessionEditView.format = this.format;
      window.appView.currentSessionEditView.render();
    }, 
 
    insertNewComment : function(e) {
      if(e){
        e.stopPropagation();
      }
      var m = new Comment({
        "text" : this.$el.find(".comment-new-text").val(),
      });
      this.model.get("comments").add(m);
      this.$el.find(".comment-new-text").val("");
    },
    /**
     * 
     * http://stackoverflow.com/questions/6569704/destroy-or-remove-a-view-in-backbone-js
     */
    destroy_view: function() {
      Utils.debug("DESTROYING SESSION READ VIEW "+ this.format);

      //COMPLETELY UNBIND THE VIEW
      this.undelegateEvents();

      $(this.el).removeData().unbind(); 

      //Remove view from DOM
//      this.remove();  
//      Backbone.View.prototype.remove.call(this);
      }
  });
  
  return SessionReadView;
}); 