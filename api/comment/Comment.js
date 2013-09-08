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
      
      if(!this.get("timestamp")){
        this.set("timestamp", Date.now()); //copied from upstream code timestamp is back 
        this.set("gravatar", window.app.get("authentication").get("userPublic").get("gravatar"));
        this.set("username", window.app.get("authentication").get("userPublic").get("username"));
      }else{
        /* if the timestamp is an old one, replace it with a timestamp v 1.47 */
        if((""+this.get("timestamp")).indexOf("Z")  > -1){
          var olddate = new Date(this.get("timestamp"));
          this.set("timestamp", olddate.getTime());
        }
      }
      
      if(this.get("filledWithDefaults")){
        this.fillWithDefaults();
        this.unset("filledWithDefaults");
      }
    },
    fillWithDefaults : function(){
      
    },
    defaults : {
      text: "",
      username: ""
    },
    
    // Internal models: used by the parse function
    internalModels : {
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
      this.set("timestampModified", Date.now());
    }
    ,
    commentCreatedActivity : function(indirectObjectString) {
      var commentstring = this.get("text");
      window.app.addActivity({
        verb : "commented",
        verbicon : "icon-comment",
        directobjecticon : "",
        directobject : "'" + commentstring + "'",
        indirectobject : indirectObjectString ,
        teamOrPersonal : "team",
        context : " via Offline App."
      });

      window.app.addActivity({
        verb : "commented",
        verbicon : "icon-comment",
        directobjecticon : "",
        directobject : "'" + commentstring + "'",
        indirectobject : indirectObjectString ,
        teamOrPersonal : "personal",
        context : " via Offline App."
      });

    }
  });

  return Comment;
});