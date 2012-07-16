define([
    "backbone", 
    "handlebars", 
    "comment/Comment",
    "comment/Comments",
    "comment/CommentEditView",
    "datum/DatumFieldReadView",
    "datum/Session",
    "app/UpdatingCollectionView",
    "libs/Utils"
], function(
    Backbone,
    Handlebars, 
    Comment,
    Comments,
    CommentEditView,
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
     * "embedded"  and link
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("SESSION init: " + this.el);
      this.model.bind('change', this.changeViewsOfInternalModels, this);
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
      "click .add-comment" : 'insertNewComment',
      "click .icon-resize-small" : 'resizeSmall',
      "click .icon-resize-full" : "resizeLarge",
      "click .icon-edit": "showEditable"
    },
    
    /**
     * The Handlebars template rendered as the Embedded.
     */
    templateEmbedded: Handlebars.templates.session_read_embedded,
    
    /**
     * The Handlebars template rendered as the Summary.
     */
    templateSummary : Handlebars.templates.session_summary_read_embedded,
    
    /**
     * The Handlebars template rendered as the Fullscreen.
     */
    templateFullscreen : Handlebars.templates.session_read_fullscreen,
    
    /**
     * The Handlebars template rendered as the link format.
     */
    templateLink : Handlebars.templates.session_read_link,
    
    /**
     * Renders the SessionReadView.
     */
    render : function() {
      Utils.debug("SESSION render: " + this.el);
      if (this.model == undefined) {
        Utils.debug("SESSION is undefined, come back later.");
        return this;
      }
      
      try {
        if (this.model.get("sessionFields").where({label: "goal"})[0] == undefined) {
          Utils.debug("SESSION fields are undefined, come back later.");
          return this;
        }
        if (this.format == "embedded") {
          this.setElement("#session-embedded");
          $(this.el).html(this.templateEmbedded(this.model.toJSON()));
          
          this.sessionFieldsView.el = this.$(".session-fields-ul");
          this.sessionFieldsView.render();
        } else if (this.format == "leftSide") {
          var jsonToRender = {
            goal : this.model.get("sessionFields").where({label: "goal"})[0].get("value"),
            consultants : this.model.get("sessionFields").where({label: "consultants"})[0].get("value"),
            dateElicited : this.model.get("sessionFields").where({label: "dateElicited"})[0].get("value")
          };
          
          this.setElement("#session-quickview");
          $(this.el).html(this.templateSummary(jsonToRender));
        } else if (this.format == "fullscreen") {
          this.setElement("#session-fullscreen");
          $(this.el).html(this.templateFullscreen(this.model.toJSON()));
          
          this.sessionFieldsView.el = this.$(".session-fields-ul");
          this.sessionFieldsView.render();
        } else if (this.format == "link") {
          var jsonToRender = {
              _id : this.model.get("_id"),
              goal : this.model.get("sessionFields").where({label: "goal"})[0].get("value"),
              consultants : this.model.get("sessionFields").where({label: "consultants"})[0].get("value"),
              dateElicited : this.model.get("sessionFields").where({label: "dateElicited"})[0].get("value")
            };
          $(this.el).html(this.templateLink(jsonToRender));
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
    },
    
    //functions associated with corner icons
    resizeSmall : function() {
      window.app.router.showEmbeddedSession();
    },
    
    resizeLarge : function() {
      window.app.router.showFullscreenSession();
    },
    
    //bound to book
    showEditable :function() {
      window.app.router.showEditableSession();
    }, 
    
    insertNewComment : function() {
      console.log("I'm a new comment!");
      var m = new Comment({
//        "label" : this.$el.children(".comment_input").val(),
      });
      this.model.get("comments").add(m);
    }
  });
  
  return SessionReadView;
}); 