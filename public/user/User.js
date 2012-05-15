var User = Backbone.Model.extend(

/** @lends User.prototype */
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
 * @property {String} email This is user's email 
 * @property {String} firstname This is user's first name 
 * @property {String} lastname This is user's last name 
 * @property {Boolean} isTeam The default for this is set false
 * @property {Url} gravatar This is user's gravatar
 * @property {String} researchInterest This is user's field of interest (eg. semantics etc)
 * @property {String} affiliation This is user's affiliation 
 * @property {Array} corpora Corpora are projects, they are a complete collection of datum. 
 * A user is associated with projects/corpora. 
 * @property {Array} dataLists Datalists are selected parts of corpora (eg. passives; data to be checked week etc).  
 * @property {Array} teams This is a list of teams a user belongs to.  
 * @property {Array} sessionHistory 
 * @property {Array} activityHistory    
 * @property {Preference} prefs This is where we'll have things like background/skin.
 * @property {Permission} permissions This is where permissions are specified (eg. read only; add/edit data etc.)   

 * @description The initialize function probably checks to see if the user is existing or new and creates a new account if it is new. 
 * 
 * @extends Backbone.Model
 * @constructs
 */
	
	   // This is the constructor. It is called whenever you make a new User.
	   initialize: function() {
	      this.bind('error', function(model, error) {
	         // TODO Handle validation errors
	      });
	     
	   },
	
   // This is an list of attributes and their default values
   defaults: {
      // TODO set up attributes and their defaults. Example:
      // someAttribute: 5,
      // someAttribute2: 'Hello world',
      // someAttribute3: []
	   username : "",
	   id : "",
	   password : "",
	   email : "",
	   firstname : "", 
	   lastname : "",
	   isTeam : false,  
	   gravatar : "http://imgs.abduzeedo.com/files/best_week/coderdojo-octocat3.jpeg",
	   researchInterest : "",
	   affiliation : "",
	   description : "",
	   //Corpora are projects. They are a complete collection of datum.
	   corpora : [], 
	   //Datalists are selected parts of corpora (favourites, for example: passives, or data to be checked next week).
	   dataLists : [],
	   teams : [],
	   sessionHistory : [],
	   activityHistory : [],
	   //Preferences are where we'll have things like background/skin options.
	   prefs : new Preference(),
	   permissions : new Permission()
   },


/** 
 * Describe the validation here. 
 * 
 * @param {Object} attributes The set of attributes to validate. 
 * 
 * @returns {String} The validation error if there is one. Otherwise doesn't 
 * return anything. 
 */
   // This is used to validate any changes to the model. It is called whenever
   // user.set('someAttribute', __) is called, but before the changes are
   // actually made to someAttribute.
   validate: function(attributes) {
      // TODO Validation on the attributes. Returning a String counts as an error.
      //      Example:
      // if (attributes.someAttribute <= 0) {
      //    return "Must use positive numbers";
      // }
   }
   
   /** 
    * The login function checks username, password, and the combination of the two. 
    */

   ,
   login : function(username, password) {
	   if (this.get("username") == username) {
		   if (this.get("password") == password) {
			   window.userid = username; 
			   return true;

		   }
		   
	   }
	   return false;  
   }

   
   /**
    * The subtitle function checks if a user belongs to a team. If yes, returns user's 
    * affiliation. If no, returns user's first and last names. 
    */
   
   ,subtitle: function () {
       if(this.get("isTeam")) {
    	   			return this.get("affiliation");
       } else {
    	   return this.get("firstname") + " " + this.get("lastname");
       }
    }

   
   // TODO Add any other methods that will manipulate the User attributes.
   //      Example:
   // ,
   // addOne: function() {
   //    this.get("someAttribute");
   // }
});


