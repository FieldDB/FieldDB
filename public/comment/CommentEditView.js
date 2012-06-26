define([ 
         "use!backbone",
         "use!handlebars", 
         "text!comment/comment_edit_embedded.handlebars",
         "comment/Comment"
  ], function(
      Backbone, 
      Handlebars,
      commentEditEmbeddedTemplate,
      Comment
) {
  var CommentEditView = Backbone.View.extend(
  /** @lends CommentEditView.prototype */
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
     * The underlying model of the CommentEditView is a Comment.
     */
    model : Comment,
    
    /**
     * Events that the DatumStateEditView is listening to and their handlers.
     */
    events : {
      "blur .comment_input" : "updateComment",
    },

    /**
     * The Handlebars template rendered as the CommentEditView.
     */
    template : Handlebars.compile(commentEditEmbeddedTemplate),
    
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
      $(this.el).html(this.template(this.model.toJSON()));
      
      return this;
    },
    
    /**
     * Change the model's state.
     */
    updateComment : function() {
      this.model.set("value", this.$el.children(".comment_input").val());
    }
  });

  return CommentEditView;
});