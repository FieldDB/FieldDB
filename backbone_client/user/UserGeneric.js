define([
    "backbone",
    "hotkey/HotKey",
    "permission/Permission",
    "user/UserPreference",
    "user/UserMask",
    "CryptoJS",
    "OPrime"
], function(
    Backbone,
    HotKey,
    Permission,
    UserPreference,
    UserMask
) {
  var UserGeneric = Backbone.Model.extend(
  /** @lends UserGeneric.prototype */
  {
    /**
     * @class A generic user has a repository and permission groups
     *        (read, write, admin). It can not login.
     *
     * @property {String} username This is a username used when login.
     * @property {String} password This is a password used when login. It should be secure (containing 1 digit, 1 uppercase) because it is what protects the confidentiality of the corpus.
     * @property {String} email This is user's email
     * @property {String} gravatar This is user's gravatar
     * @property {String} researchInterest This is user's field of
     *           interest (eg. semantics etc)
     * @property {String} affiliation This is user's affiliation
     * @property {String} description This user's description
     * @property {String} subtitle This user's subtitle
     * @property {Array} corpora The corpus connections of the corpora owned by
     *           this user
     * @property {Array} dataLists The datalist IDs of the datalists owned
     *           by this user.
     * @property {UserPreference} prefs This is where we'll have things like
     *           background/skin.
     *
     * @description The initialize function probably checks to see if
     *              the user is existing or new and creates a new
     *              account if it is new.
     *
     * @extends Backbone.Model
     * @constructs
     */

    // This is the constructor. It is called whenever you make a new
    // User.
    initialize : function() {
      if (OPrime.debugMode) OPrime.debug("USERGENERIC init");

    },

    // Internal models: used by the parse function
    internalModels : {
      prefs : UserPreference,
      permissions : Permission, //TODO this needs to become plural
      hotkeys : HotKey, //TODO this needs to become plural
      userMask : UserMask
    },

    addCurrentCorpusToUser : function(){
      var cc = window.app.get("corpus").get("connection");
      if(window.app.get("corpus").id != undefined){
        cc.corpusid =  window.app.get("corpus").id;
        this.get("corpora").push(cc);
      }else{
        window.appView.toastUser("The corpus has no id, cant add it to the user.","alert-danger","Bug!");
      }
    },
    saveAndInterConnectInApp : function(callback){
      //TODO override in derived classes?
      if(typeof callback == "function"){
        callback();
      }
    },
     getGravatar : function(email){
      var existingGravatar = this.get("gravatar");
      if(existingGravatar.indexOf("gravatar.com") > -1){
        existingGravatar = existingGravatar.replace("https://secure.gravatar.com/avatar/","");
        this.set("gravatar", existingGravatar);
        return existingGravatar;
      }
      if(email){
        var hash = CryptoJS.MD5(email).toString();
        this.set("gravatar", hash);
        return hash;
      }
      if(existingGravatar.indexOf("/") > -1){
        existingGravatar = existingGravatar.replace(/\//g,"").replace("userpublic_gravatar.png","968b8e7fb72b5ffe2915256c28a9414c");
      }
      return existingGravatar;
    }
  });

  return UserGeneric;
});
