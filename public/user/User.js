define([
    "use!backbone",
    "user/UserGeneric",
    "permission/Permission",
    "user/UserPreference"
], function(
    Backbone, 
    UserGeneric,
    Permission,
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
      User.__super__.initialize.call(this, attributes);
      
    },
    
    defaults : {
      // Defaults from UserGeneric
      username : "",
      password : "",
      email : "",
      gravatar : "./../user/user_gravatar.png",
      researchInterest : "",
      affiliation : "",
      description : "",
      subtitle : "",
      corpuses : [],
      dataLists : [],
      prefs : new UserPreference(),
      
      // Defaults from User
      firstname : "",
      lastname : "",
      teams : [],
      sessionHistory : [],
      activityHistory : [],
      permissions : new Permission()
    },

    /** 
     * The login function checks username, password, and the combination of the two. 
     */
//        login: function(username, password) {
//          if (this.get("username") == username) {
//            if (this.get("password") == password) {
//              window.username = username; 
//              return true;	   
//            }
//          }
//          return false;  
//        },

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
    
    /**
     * Modifies this User so that its properties match those in 
     * the given object.
     * 
     * @param {Object} obj Contains the User properties.
     */
    restructure : function(obj) {
      console.log("*** Before User resturcture: " + JSON.stringify(obj));
      console.log(this);
      
      for (key in obj) {
        if ((key == "permissions") && (this.get("permissions"))) {
          // permissions is a Permission object
          this.get("permissions").restructure(obj[key]);
        } else if ((key == "prefs") && (this.get("prefs"))) {
          // prefs is a UserPreference object
          this.get("prefs").restructure(obj[key]);
        } else {
          this.set(key, obj[key]);
        }
      }
      
      console.log("*** After User restructure");
      console.log(this);
    }
  });

  return User;
});