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
      if (OPrime.debugMode) OPrime.debug("COMMENT init");
    },
    
    /**
     * The underlying model of the CommentEditView is a Comment.
     */
    model : Comment,
    
    /**
     * Events that the CommentEditView is listening to and their handlers.
     */
    events : {
      "keyup .comment-new-text" : "updateComment", 
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
      if (OPrime.debugMode) OPrime.debug("COMMENT render");
//      var JSONtorender = {};
//      if ( typeof this.model != undefined){
//    	  JSONtorender.timestamp = this.model.timestamp.toString();
//    	  JSONtorender.username = this.model.username;
//      }
      $(this.el).html(this.template(this.model.toJSON()));

      $(this.el).find(".locale_Add").html(Locale.get("locale_Add"));

      return this;
    },
    
    /**
     * Add new or edit comments, put the timestamp if there isn't one
     */
    updateComment : function(e) {
      if(e){
        e.stopPropagation();
        e.preventDefault();
      }
//    This timestamp thing doesn't seem to be working       
//      if(!this.model.get("timestamp")){
//        this.model.set("timestamp", new Date(JSON.stringify(new Date())));
//      }
      this.model.edit($(this.el).find(".comment-new-text").val());
    },
    clearCommentForReuse : function(){
      this.model.set("timestamp", Date.now());
      this.model.set("gravatar", window.appView.authView.model.get("userPublic").get("gravatar"));
      this.model.set("username", window.appView.authView.model.get("userPublic").get("username"));
      this.model.edit("");
      this.render();
    }
   

  });

  return CommentEditView;
});