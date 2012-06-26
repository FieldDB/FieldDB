define( [ "use!backbone",
          "comment/Comment",
          "libs/Utils"
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
