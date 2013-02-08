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
//      "click .remove-comment-button" : "removeComment"
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
      var JSONtorender = this.model.toJSON();
      //TODO use the pretty timestamp function in OPrime
      $(this.el).html(this.template(JSONtorender));

      $(this.el).find(".locale_Add").html(Locale.get("locale_Add"));

      return this;
    },
    
    /**
     * Add new or edit comments, put the timestamp if there isn't one
     */
    updateComment : function(e) {
      if(e){
//        e.stopPropagation();
        e.preventDefault();
      }
      if(!this.model.get("timestamp")){
        this.model.set("timestamp", new Date(JSON.stringify(new Date())));
      }
      this.model.edit($(this.el).find(".comment-new-text").val());
    }
   

  });

  return CommentEditView;
});