define([
    "backbone",
    "hotkey/HotKey",
    "user/UserGeneric",
    "permission/Permission",
    "user/UserPreference",
    "libs/OPrime"
], function(
    Backbone, 
    HotKey,
    UserGeneric,
    Permission,
    UserPreference
) {
  var Team = UserGeneric.extend(
  /** @lends Team.prototype */
  {
    /**
     * @class Team extends from UserGeneric. It inherits the same attributes as UserGeneric but can 
     * login. 
     * 
     * @description The initialize function probably checks to see if the user is existing or new and creates a new account if it is new. 
     * 
     * @extends Backbone.Model
     * @constructs
     */
    initialize: function(attributes) {
      UserGeneric.__super__.initialize.call(this, attributes);
      
      // If there is no prefs, create a new one
      if (!this.get("prefs")) {
        this.set("prefs", new UserPreference());
      }
      
      // If there is no permissions, create a new one
      if (!this.permissions) {
        this.permissions = new Permissions();
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

  return Team;
});