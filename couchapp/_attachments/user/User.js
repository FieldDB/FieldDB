define([
    "backbone",
    "hotkey/HotKey",
    "user/UserGeneric",
    "user/UserPreference",
    "libs/OPrime"
], function(
    Backbone, 
    HotKey,
    UserGeneric,
    UserPreference
) {
  var User = UserGeneric.extend(
  /** @lends User.prototype */
  {
    /**
     * @class User extends from UserGeneric. It inherits the same attributes as UserGeneric but can 
     * login. 
     * 
     * @property {String} firstname The user's first name. 
     * @property {String} lastname The user's last name.
     * @property {Array} teams This is a list of teams a user belongs to. 
     * @property {Array} sessionHistory 
     * @property {Array} activityHistory 
     * @property {Permission} permissions This is where permissions are specified (eg. read only; add/edit data etc.)   
     *
     * @description The initialize function probably checks to see if the user is existing or new and creates a new account if it is new. 
     * 
     * @extends Backbone.Model
     * @constructs
     */
    initialize: function(attributes) {
      OPrime.debug("USER init");
      User.__super__.initialize.call(this, attributes);
      
      // If there is no prefs, create a new one
      if (!this.get("prefs")) {
        this.set("prefs", new UserPreference());
      }
      
      // If there is no hotkeys, create a new one
      if (!this.get("hotkeys")) {
        this.set("hotkeys", new HotKey());//TODO this needs to become plural
      }
      
      this.bind("change", this.checkPrefsChanged, this);
    },
    
    defaults : {
      // Defaults from UserGeneric
      username : "",
      password : "",
      email : "",
      gravatar : "user/user_gravatar.png",
      researchInterest : "",
      affiliation : "",
      description : "",
      subtitle : "",
      corpuses : [],
      dataLists : [],
      mostRecentIds : {},
      // Defaults from User
      firstname : "",
      lastname : "",
      teams : [],
      sessionHistory : []
    },

    /**
     * The subtitle function returns user's first and last names. 
     */
    subtitle: function () {
    	if (this.get("firstname") == undefined) {
        this.set("firstname","");
      }
      
      if (this.get("lastname") == undefined) {
        this.set("lastname","");
      }
      
      return this.get("firstname") + " " + this.get("lastname");
    },
    checkPrefsChanged : function(){
      try{
        window.appView.userPreferenceView.model = this.get("prefs");
        window.appView.userPreferenceView.render();
      }catch(e){
        
      }
    },
    saveAndInterConnectInApp : function(callback){
      
      if(typeof callback == "function"){
        callback();
      }
    }
  });

  return User;
});