define([
    "backbone",
    "handlebars",
    "comment/Comment",
    "comment/Comments",
    "comment/CommentReadView",
    "comment/CommentEditView",
    "datum/DatumFieldReadView",
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
      if (OPrime.debugMode) OPrime.debug("SESSION READ VIEW init: " );

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
        this.updatePouch();
        this.commentReadView.render();
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
      if (OPrime.debugMode) OPrime.debug("SESSION READ render: " );
      if (this.model == undefined) {
        if (OPrime.debugMode) OPrime.debug("SESSION is undefined, come back later.");
        return this;
      }

      try {
        if (this.model.get("sessionFields").where({label: "goal"})[0] == undefined) {
          if (OPrime.debugMode) OPrime.debug("SESSION fields are undefined, come back later.");
          return this;
        }

        var jsonToRender = this.model.toJSON();
        jsonToRender.goal = this.model.get("sessionFields").where({label: "goal"})[0].get("mask");
        jsonToRender.consultants = this.model.get("sessionFields").where({label: "consultants"})[0].get("mask");
        jsonToRender.dateElicited = this.model.get("sessionFields").where({label: "dateElicited"})[0].get("mask");

        jsonToRender.locale_Consultants = Locale.get("locale_Consultants");
        jsonToRender.locale_Edit_Session = Locale.get("locale_Edit_Session");
        jsonToRender.locale_Elicitation_Session = Locale.get("locale_Elicitation_Session");
        jsonToRender.locale_Goal = Locale.get("locale_Goal");
        jsonToRender.locale_Show_Fullscreen = Locale.get("locale_Show_Fullscreen");
        jsonToRender.locale_Show_in_Dashboard = Locale.get("locale_Show_in_Dashboard");
        jsonToRender.locale_When = Locale.get("locale_When");

        if(this.format != "link"){
          if(window.appView.currentSessionEditView){
            appView.currentSessionEditView.destroy_view();
          }
          appView.currentSessionReadView.destroy_view();
        }
        if (this.format == "leftSide") {
          if (OPrime.debugMode) OPrime.debug("SESSION READ LEFTSIDE render: " );

          this.setElement("#session-quickview");
          $(this.el).html(this.templateSummary(jsonToRender));

        } else if (this.format == "centerWell") {
          if (OPrime.debugMode) OPrime.debug("SESSION READ CENTERWELL render: " );

          this.setElement("#session-embedded");
          $(this.el).html(this.templateEmbedded(jsonToRender));


          this.sessionFieldsView.el = this.$(".session-fields-ul");
          this.sessionFieldsView.render();
          // Display the CommentReadView
          this.commentReadView.el = $(this.el).find('.comments');
          this.commentReadView.render();

          // Display the CommentEditView
          this.commentEditView.el = $(this.el).find('.new-comment-area');
          this.commentEditView.render();

        } else if (this.format == "fullscreen") {
          if (OPrime.debugMode) OPrime.debug("SESSION READ FULLSCREEN render: " );

          this.setElement("#session-fullscreen");
          $(this.el).html(this.templateFullscreen(jsonToRender));

          this.sessionFieldsView.el = this.$(".session-fields-ul");
          this.sessionFieldsView.render();

          // Display the CommentReadView
          this.commentReadView.el = $(this.el).find('.comments');
          this.commentReadView.render();

          // Display the CommentEditView
          this.commentEditView.el = $(this.el).find('.new-comment-area');
          this.commentEditView.render();

        } else if (this.format == "link") {
          if (OPrime.debugMode) OPrime.debug("SESSION READ LINK render: " );

          $(this.el).html(this.templateLink(jsonToRender));

        } else {
          throw("You have not specified a format that the SessionReadView can understand.");
        }
      } catch(e) {
        console.warn("There was a problem rendering the session, probably the datumfields are still arrays and havent been restructured yet.", e, this.model);
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

      this.commentEditView = new CommentEditView({
        model : new Comment(),
      });
    },

    //functions associated with corner icons
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

    showEditable :function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
      if(window.appView.currentSessionEditView){
        window.appView.currentSessionEditView.format = this.format;
        window.appView.currentSessionEditView.render();
      }
    },

    /**
     *
     * http://stackoverflow.com/questions/6569704/destroy-or-remove-a-view-in-backbone-js
     */
    destroy_view: function() {
      if (OPrime.debugMode) OPrime.debug("DESTROYING SESSION READ VIEW "+ this.format);

      //COMPLETELY UNBIND THE VIEW
      this.undelegateEvents();

      $(this.el).removeData().unbind();

      //Remove view from DOM
//      this.remove();
//      Backbone.View.prototype.remove.call(this);
      },
      /* ReadView is supposed to save no change but we want the comments to
       * be saved. This function saves the change/addition/deletion of the comments.
       * Changes in other parts of Session is taken care of the server according to
       * users' permissions. */
      updatePouch : function(e) {
        if(e){
          e.stopPropagation();
          e.preventDefault();
        }
        var self = this;
        if(this.format == "modal"){
          $("#new-corpus-modal").modal("hide");
        }
        this.model.saveAndInterConnectInApp(function(){
          self.render();
        },function(){
          self.render();
        });
      }


  });

  return SessionReadView;
});
