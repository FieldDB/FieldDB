define( [ "backbone",
          "comment/Comment",
          "libs/OPrime"
], function(Backbone, Comment) {
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
    },
    
    internalModels : Comment,
    model: Comment,
    
    
//    clone : function() {
//        var newCollection = new Comments();
//        
//        for (var i = 0; i < this.length; i++) {
//          newCollection.push(new Comment(this.models[i].toJSON())); 
//        }
//        
//        return newCollection;
//      }
    
  });

  return Comments;
});
