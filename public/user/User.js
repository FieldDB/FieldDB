define([
    "use!backbone",
    "user/UserGeneric"
], function(
    Backbone, 
    UserGeneric
) {
  var User = UserGeneric.extend(
  /** @lends User.prototype */
  {
    /**
     * @class User extends from UserGeneric. It inherits the same attributes as UserGeneric but can 
     * login. 
     * 
     * @property {String} firstname This is user's first name 
     * @property {String} lastname This is user's last name 
     * @property {Array} teams This is a list of teams a user belongs to.  
     * @property {Array} sessionHistory 
     * @property {Array} activityHistory    
     * @property {Permission} permissions This is where permissions are specified (eg. read only; add/edit data etc.)   

     * @description The initialize function probably checks to see if the user is existing or new and creates a new account if it is new. 
     * 
     * @extends Backbone.Model
     * @constructs
     */
    initialize: function(attributes) {
//        	this.set("firstname" , ""), //setting these here makes it impossible to set them using attributes ie: 
//            this.set("lastname" , "") //new User({"username":"sapir","password":"wharf","firstname":"Ed","lastname":"Sapir"});
        
      User.__super__.initialize.call(this, attributes);
      
      this.set("subtitle",this.subtitle());
      
      this.set("teams" , []);
      
      if (this.get("firstname") == undefined) {
    	  this.set("firstname","");
      }
      
      if (this.get("lastname") == undefined) {
    	  this.set("lastname","");
      }
    },

    /** 
     * The login function checks username, password, and the combination of the two. 
     */
//        login: function(username, password) {
//          if (this.get("username") == username) {
//            if (this.get("password") == password) {
//              window.userid = username; 
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
    }
  });

  return User;
});