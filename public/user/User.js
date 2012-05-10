// TODO Describe the User model.
//      What does it represent in real life?
//      What are its attributes?

var User = Backbone.Model.extend({
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
	   prefs : new Preference()
   },

   // This is the constructor. It is called whenever you make a new User.
   initialize: function() {
      this.bind('error', function(model, error) {
         // TODO Handle validation errors
      });

      // TODO Set up any other bindings (i.e. what to do when certain Events 
      //      happen). Example:
      // this.bind("change:someAttribute", function() {
      //    console.log("We just changed someAttribute");
      // });
     
   },

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
   ,subtitle: function() {
	       if(this.isTeam) {
	    	   return this.affiliation;
	       } else {
	    	   return this.firstname + " " + this.lastname;
	       }
	    }
   // TODO Add any other methods that will manipulate the User attributes.
   //      Example:
   // ,
   // addOne: function() {
   //    this.someAttribute++;
   // }
});



