define([ 
    "use!backbone", 
    "user/UserPreference"
], function(
    Backbone,
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
    },
    
    pouch : Backbone.sync.pouch(Utils.androidApp() ? Utils.touchUrl
        : Utils.pouchUrl),
  });

  return UserGeneric;
});