define( [
    "backbone",
    "user/User"
], function(
    Backbone,
    User
) {
	var Comment = Backbone.Model.extend(
  /** @lends Comment.prototype */
  {
    /**
     * @class Comments allow users to collaborate between each other and take
     *        note of important things, issues to be fixed, etc. These can
     *        appear on datum, sessions corpora, and dataLists. Comments can
     *        also be edited and removed.
     * 
     * @property {String} text Describe text here.
     * @property {Number} username Describe username here.
     * @property {Date} timestamp Describe timestamp here.
     * 
     * @description Initialize function has a timestamp and a username and waits
     *              until text is entered.
     * 
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
      this.set("timestamp", JSON.stringify(new Date()));
      
    //  this.set("username", this.authView.model.get("userPrivate").get("username"));
    },

    defaults : {
      text : "",
      timestamp : ""
    },
   

    
    // Internal models: used by the parse function
    model : {
      user : User
    
    },

    /**
     * The remove function removes a comment.
     */
    remove : function() {
    },

    /**
     * The edit function allows users to edit a comment.
     * 
     * @param {String}
     *          newtext Takes new text and replaces old one.
     * 
     */
    edit : function(newtext) {
      this.set("text", newtext);
    },
    
    // in your Model validate function
    validate : function(attrs) {
      if (!attrs.mask) {
        attrs.mask = "hi empty mask";
      }
    }
  });

  return Comment;
});