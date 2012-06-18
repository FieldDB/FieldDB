define( [ "use!backbone"
], function(Backbone) {
  var Comments = Backbone.Collection.extend(

  /** @lends Comments.prototype  */

  {
    /**
     * @class Comments is a collection of the model Comment. 
     * 
     * @extends Comment.Collection
     * @constructs
     * 
     */
    initialize : function() {
      this.bind('error', function(model, error) {
        // TODO Handle validation errors
      });

      model: Comment;
    }
  });

  return Comments;
});
