define([ 
         "use!backbone",
         "use!handlebars", 
         "text!comment/comment.handlebars",
         "comment/Comment"
  ], function(
      Backbone, 
      Handlebars,
      commentTemplate,
      Comment
) {
  var CommentView = Backbone.View.extend(
  /** @lends CommentView.prototype */
  {
    /**
     * @class This is the view of the Comment Model. The Comment is a
     *        textarea that includes a userid and a timestamp.
     * 
     * @extends Backbone.View
     * @constructs
     */
    initialize : function() {
      Utils.debug("COMMENT init");
    },
    
    /**
     * The underlying model of the CommentView is a Comment.
     */
    model : Comment,
    
    /**
     * Events that the DatumStateEditView is listening to and their handlers.
     */
    events : {
      "blur .comment_input" : "updateComment",
    },

    /**
     * The Handlebars template rendered as the CommentView.
     */
    template : Handlebars.compile(commentTemplate),
    
    /**
     * Renders the DatumFieldView.
     */
    render : function() {
      Utils.debug("COMMENT render");
//      var JSONtorender = {};
//      if ( typeof this.model != undefined){
//    	  JSONtorender.timestamp = this.model.timestamp.toString();
//    	  JSONtorender.userid = this.model.userid;
//      }
      // $(this.el).html(this.template(JSONtorender));
      
      return this;
    },
    
    /**
     * Change the model's state.
     */
    updateComment : function() {
      this.model.set("value", this.$el.children(".comment_input").val());
    }
  });

  return CommentView;
});