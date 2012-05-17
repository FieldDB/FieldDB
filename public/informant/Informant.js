define("Informant",
    [ "use!backbone", "user/User" ]
, function(Backbone, User) {
  var Informant = User.extend(

  /** @lends Informant.prototype */
  {
    /**
     * @class An informant is a type of user. It has the same information as a user plus extra,
     * but we want some info (e.g. first & last name) to be kept confidential. 
     * It also has permissions about the level of access to the data (read only, add/edit). 
     * 
     *  
     * @property {String} username This is a username used when login.   
     * @property {String} id This is a string of numerals/alphabets assigned to a unique user
     * @property {String} password This is a password used when login
     * @property {String} firstname This is informant's first name, to be kept confidential 
     * @property {String} lastname This is informant's last name, to be kept confidential 
     * @property {String} birthDate This is informant's date of birth, to be kept confidential
     * @property {String} language This is informant's language 
     * @property {String} dialect This is informant's dialect 
     * @property {Boolean} isTeam The default for this is set false
     * @property {Url} gravatar This is informant's gravatar, maybe to be kept confidential 
     * @property {String} researchInterest We might keep this for informant
     * @property {String} affiliation This is informant's affiliation 
     * @property {Array} corpora Corpora rea projects, they are a complete collection of datum. 
     * An informant is associated to projects/corpora 
     * @property {Array} dataLists Datalists are selected parts of corpora. An informant is 
     * associated to parts of corpora 
     * @property {Array} teams This is a list of teams to which informant is associated 
     * @property {Array} sessionHistory 
     * @property {Array} activityHistory    
     * @property {Preference} prefs This is where we'll have things like background/skin.
     * @property {Permission} permissions This is where permissions are specified (eg. read only; add/edit data etc.)   

     */

    initialize : function(attributes) {
      Informant.__super__.initialize.call(this, attributes);

      this.set("birthDate", "");
      this.set("language", "");
      this.set("dialect", "");
    }
  });

  return Informant;
});