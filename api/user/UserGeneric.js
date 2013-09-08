/**
 * @lends UserGeneric.prototype
 *
 * @class A generic user has a repository and permission groups
 *        (read, write, admin). It can not login.
 *
 *
 * @description Contains basic functions to manipulate User json and schema,
 * can be used as a shared model between clients and servers.
 * Uses dependancy injection for classes it depends on.
 *
 * @param {Hotkey} Hotkey               [description]
 * @param {Permission} Permission       [description]
 * @param {UserPreference} UserPreference [description]
 * @param {UserMask} UserMask           [description]
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
 * @property {Array} corpuses The corpus connections of the corpuses owned by
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
 * @extends Object
 *
 */
var UserGeneric = function(Hotkey, MD5, Permission, UserPreference, UserMask) {

  // Internal models: used by the parse function
  this.internalModels = {
    prefs: UserPreference,
    permissions: Permission, //TODO this needs to become plural
    hotkeys: HotKey, //TODO this needs to become plural
    publicSelf: UserMask
  };

  this.addCorpusToUser = function(corpus) {
    this.corpuses.unshift(corpus);
  };
  this.save = function(user) {
    console.log(JSON.stringify(user, null, 2));
  };
  this.getGravatar = function(optionalEmail) {
    var existingGravatar = this.gravatar;
    if (existingGravatar.indexOf('gravatar.com') > -1) {
      existingGravatar = existingGravatar.replace('https://secure.gravatar.com/avatar/', '');
      this.gravatar = existingGravatar;
      return existingGravatar;
    }
    if (optionalEmail) {
      var hash = MD5(optionalEmail).toString();
      this.set('gravatar', hash);
      return hash;
    }
    if (existingGravatar.indexOf('/') > -1) {
      existingGravatar = existingGravatar.replace(/\//g, '').replace('userpublic_gravatar.png', '968b8e7fb72b5ffe2915256c28a9414c');
    }
    return existingGravatar;
  };
};

module.exports = UserGeneric;