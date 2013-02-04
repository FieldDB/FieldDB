define([ 
         "backbone",
         "handlebars", 
         "comment/Comment"
  ], function(
      Backbone, 
      Handlebars,
      Comment
) {
  var CommentEditView = Backbone.View.extend(
  /** @lends CommentEditView.prototype */
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
     * The underlying model of the CommentEditView is a Comment.
     */
    model : Comment,
    
    /**
     * Events that the CommentEditView is listening to and their handlers.
     */
    events : {
      "blur .comment-new-text" : "updateComment",
      "click .add-comment-datum" : 'insertNewComment',
      
    },

    /**
     * The Handlebars template rendered as the CommentEditView.
     */
    template : Handlebars.templates.comment_edit_embedded,
    
    /**
     * Renders the DatumFieldView.
     */
    render : function() {
      OPrime.debug("COMMENT render");
//      var JSONtorender = {};
//      if ( typeof this.model != undefined){
//    	  JSONtorender.timestamp = this.model.timestamp.toString();
//    	  JSONtorender.username = this.model.username;
//      }
      $(this.el).html(this.template(this.model.toJSON()));

      
      return this;
    },
    
    /**
     * Change the model's state.
     */
    updateComment : function() {
      this.model.set("value", this.$el.children(".comment-new-text").val());
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

  });

  return CommentEditView;
});