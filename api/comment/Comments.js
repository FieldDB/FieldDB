
var Collection = require("./../Collection").Collection;
var Comment = require("./Comment").Comment;

/**
 * @class

 * @name  Comments
 * @description The Comments is a minimal customization of the Collection
 * to add an internal model of Comment.
 *
 * @extends Collection
 * @constructs
 */
var Comments = function Comments(options) {
  this.debug("Constructing Comments ", options);
  Collection.apply(this, arguments);
};

Comments.prototype = Object.create(Collection.prototype, /** @lends Comments.prototype */ {
  constructor: {
    value: Comments
  },

  primaryKey: {
    value: "timestamp"
  },

  INTERNAL_MODELS: {
    value: {
      item: Comment
    }
  },

  insertNewCommentFromObject : {
    value: function(commentObject){
      commentObject.timestamp = Date.now();
      this.add(new Comment(commentObject));
    }
  }


});
exports.Comments = Comments;
