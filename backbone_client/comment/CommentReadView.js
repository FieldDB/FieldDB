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
//    "click .edit-comment-button" : "showCommentEdit",
//    "click .remove-comment-button" : "removeComment",
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
      jsonToRender.timestamp = OPrime.prettyTimestamp(jsonToRender.timestamp);
      $(this.el).html(this.template(jsonToRender));
     
      return this;
    },
    
    
//    showCommentEdit : function(){
//        need to go to app router? 
//    },
    
//    reomveComment : function(){
//  
//    },
    
    
  });

  return CommentReadView;
});