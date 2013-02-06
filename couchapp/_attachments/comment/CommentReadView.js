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
      OPrime.debug("COMMENT init");
    },
    
    /**
     * The underlying model of the CommentReadView is a Comment.
     */
    model : Comment,
    
    /**
     * Events that the CommentReadView is listening to and their handlers.
     */
    events : {
      "blur .comment-text" : "updateComment",
      "click .add-comment-button" : 'insertNewComment',
//    "click .edit-comment" : "showCommentEdit",
//    "click .delete-comment" : "deleteComment",
    },

    /**
     * The Handlebars template rendered as the CommentReadView.
     */
    template : Handlebars.templates.comment_read_embedded,
    
    /**
     * Renders the DatumFieldView.
     */
    render : function() {
      OPrime.debug("COMMENT render");

      $(this.el).html(this.template(this.model.toJSON()));
     

      
      return this;
    },
    
    /**
     * Change the model's state.
     */
    updateComment : function() {
      this.model.set("value", this.$el.children(".comment-text").val());
    },

  insertNewComment : function(e) {
  if(e){
    e.stopPropagation();
    e.preventDefault();
  }
  var m = new Comment({
    "text" : this.$el.find(".comment-new-text").val(),
  });
  //unshift adds things in front instead of adding to the end
  this.model.get("comments").unshift(m);
  this.$el.find(".comment-new-text").val("");
  },

    
//    showCommentEdit : function(){
//        need to go to app router? 
//    },
    
//    deleteComment : function(){
//  
//    },
    
    
  });

  return CommentReadView;
});