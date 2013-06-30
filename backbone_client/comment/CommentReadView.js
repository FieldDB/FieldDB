define([ 
         "backbone",
         "handlebars", 
         "comment/Comment"
  ], function(
      Backbone, 
      Handlebars,
      Comment
) {
  var CommentReadView = Backbone.View.extend(
  /** @lends CommentReadView.prototype */
  {
    /**
     * @class This is the view of the Comment Model. The Comment is a
     *        textarea that includes a username and a timestamp.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      if (OPrime.debugMode) OPrime.debug("COMMENT init");
    },
    
    /**
     * The underlying model of the CommentReadView is a Comment.
     */
    model : Comment,
    
    /**
     * Events that the CommentReadView is listening to and their handlers.
     */
    events : {
    "click .edit-comment-button" : "showHideCommentEdit",
    "click .remove-comment-button" : "removeComment",
    },

    /**
     * The Handlebars template rendered as the CommentReadView.
     */
    template : Handlebars.templates.comment_read_embedded,
    
    /**
     * Renders the DatumFieldView.
     */
    render : function() {
      if (OPrime.debugMode) OPrime.debug("COMMENT render");
      var jsonToRender = this.model.toJSON();
      jsonToRender.gravatar = jsonToRender.gravatar.replace("https://secure.gravatar.com/avatar/","").replace("?s","").replace(/\//g,"");
      jsonToRender.timestamp = OPrime.prettyTimestamp(jsonToRender.timestamp);
      $(this.el).html(this.template(jsonToRender));
      return this;
    },
    
    
    showHideCommentEdit : function(e){
      if(e){
        e.preventDefault();
      }
      if($(this.el).find(".comment-text").attr("contenteditable")){
        $(this.el).find(".comment-text").removeAttr("contenteditable");
        $(this.el).find(".comment-text").removeClass("thisIsEditable");
        $(this.el).find(".icon-save").toggleClass("icon-pencil icon-save");
      }else{
        $(this.el).find(".comment-text").attr("contenteditable","true");
        $(this.el).find(".comment-text").addClass("thisIsEditable");
        $(this.el).find(".icon-pencil").toggleClass("icon-save icon-pencil");
      }
    },
    
    removeComment : function(e){
      if(e){
        e.preventDefault();
      }
      var r = confirm("Are you sure you want to remove this comment?");
      if (r == true) {
        this.model.destroy();
      }
    },
    
    
  });

  return CommentReadView;
});