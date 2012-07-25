define( [
    "backbone",
    "user/UserMask"
], function(
    Backbone,
    UserMask
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
      var t = JSON.stringify(new Date());
     
      this.set("timestamp", new Date(JSON.parse(t)));
      
      this.set("gravatar", window.appView.authView.model.get("userPublic").get("gravatar"));
      this.set("username", window.appView.authView.model.get("userPublic").get("username"));

    },

    defaults : {
      text : "",
     username: ""
    },
    
    // Internal models: used by the parse function
    model : {
      // There are no nested models
    },

    /**
     * The remove function removes a comment.
     */
    remove : function() {
    },
    saveAndInterConnectInApp : function(callback){
      
      if(typeof callback == "function"){
        callback();
      }
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
    }
    
  });

  return Comment;
});