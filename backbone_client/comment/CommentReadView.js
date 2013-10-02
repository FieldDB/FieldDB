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
      jsonToRender.gravatar = jsonToRender.gravatar.replace("https://secure.gravatar.com/avatar/","").replace("?s","").replace(/\//g,"").replace("userpublic_gravatar.png","968b8e7fb72b5ffe2915256c28a9414c");
      jsonToRender.timestamp = OPrime.prettyTimestamp(jsonToRender.timestamp);
      $(this.el).html(this.template(jsonToRender));
      $(this.el).find(".comment-text").html($.wikiText(jsonToRender.text));
      return this;
    },
    
    
    showHideCommentEdit : function(e){
      if(e){
        e.preventDefault();
      }
      if($(this.el).hasClass("thisIsEditable")){
        $(this.el).removeClass("thisIsEditable");
        $(this.el).find(".comment-text").show();
        var editedComment  = $(this.el).find(".comment-textarea").val();
        this.model.edit(editedComment);
        $(this.el).find(".comment-text").html($.wikiText(editedComment));
        this.model.set("modifiedByUsername", window.app.get("authentication").get("userPublic").get("username"));
        $(this.el).find(".icon-save").toggleClass("icon-pencil icon-save");
        $(this.el).find(".comment-textarea").hide();
      }else{
        $(this.el).addClass("thisIsEditable");
        // $(this.el).find(".comment-text").hide();
        $(this.el).find(".comment-textarea").val(this.model.get("text"));
        $(this.el).find(".comment-textarea").show();
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