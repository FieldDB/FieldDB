define([ 
         "backbone",
         "handlebars", 
         "permission/Permission"
  ], function(
      Backbone, 
      Handlebars,
      Permission
) {
  var PermissionEditView = Backbone.View.extend(
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
      Utils.debug("PERMISSION init");
    },
    
    /**
     * The underlying model of the CommentEditView is a Comment.
     */
    model : Comment,
    
    /**
     * Events that the CommentEditView is listening to and their handlers.
     */
    events : {
    },

    /**
     * The Handlebars template rendered as the CommentEditView.
     */
    template : Handlebars.templates.permissions_edit_embedded,
    
    /**
     * Renders the DatumFieldView.
     */
    render : function() {
      Utils.debug("PERMISSION render");
//      var JSONtorender = {};
//      if ( typeof this.model != undefined){
//        JSONtorender.timestamp = this.model.timestamp.toString();
//        JSONtorender.username = this.model.username;
//      }
      $(this.el).html(this.template(this.model.toJSON()));
      
      return this;
    },
    
    /**
     * Change the model's state.
     */
    updatePermission : function() {
     // this.model.set("value", this.$el.children(".comment_input").val());
    }
  });

  return PermissionEditView;
});