define([ 
    "use!backbone", 
    "hotkey/HotKey",
    "user/UserPreference"
], function(
    Backbone,
    HotKey,
    UserPreference
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
     * @property {Array} corpuses The corpus IDs of the corpuses owned by
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
      this.set("hotkeys", new HotKey()); //TODO dont know where this should go now, whether it goes in UserGeneric, or in the defaults of User since thats where everything else is.
    
      
    },
    //users dont go into couch
//    relativizePouchToACorpus : function(corpus){
//    //rebuild the pouch and touchdb urls to be relative to the active corpus TODO users shouldnt get saved in their corpus or should they? if they are saved, then if you replcate the corpus you can eaisly see the collaborators/contributors profiles since they are in the corpus. but they might be out of date.
//      var c = corpus.get("couchConnection");
//      this.pouch = Backbone.sync.pouch(Utils.androidApp() ? Utils.touchUrl+c.corpusname
//          : Utils.pouchUrl+c.corpusname);
//    },
//    pouch : Backbone.sync.pouch(Utils.androidApp() ? Utils.touchUrl
//        : Utils.pouchUrl),
  });

  return UserGeneric;
});