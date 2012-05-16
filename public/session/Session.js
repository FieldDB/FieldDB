define([
    "use!backbone",
    "team/Team",
    "user/User",
    "informant/Informant"


], function(Backbone,Team,User,Informant) {

    var Session = Backbone.Model.extend(
    /** @lends Session.prototype */
    {
       /**
        * @class The Datum widget is the place where all linguistic data is entered; one at a time.   
        * @property {Number} sessionID The session ID is an automatically generated number which will uniquely identify the session.
        * @property {String} user The user is the person inputting the data for that session.
        * @property {String} team The team is the team that the user belongs to. 
        * @property {String} informant The informant is the native speaker of the language under investigation that has verified the data in the session. 

        * @property {String} language The language is the language under investigation in the particular session. 
        * @property {String} languageFamily The language family is an attribute which users can use to group languages. 
        * @property {String} dialect The dialect specifies the dialect of the language under investigation. 
        * @property {String} date The date is the date that the data was elicited. 
        * @property {String} goal The goal is the particular linguistic goal that the researcher was pursuing during that session.












   
      * @description The initialize function brings up a page in which the user can fill out the details corresponding to the session.  These details will be linked to each datum submitted in the session. 
      * @extends Backbone.Model
      * @constructs
      */
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
     
     defaults: {

        //The Data that belongs to the session will inherent these values.
        //The sessionID is an automatically generated number.   
         sessionID : 0,
         
         user: "",
         team: "",
         informant: "",

         language: "",
         languageFamily: "",
         dialect: "",
         //allow users to insert date that data was retrieved (maybe prior to time of data entry)
         date: "",
         goal: ""
         
     },

     /**
      * Validation functions will verify that the session ID is unique and that the informant,users, and teams are all correspond to people in the system.
      *
      * @param {Object} attributes The set of attributes to validate.
      *
      * @returns {String} The validation error, if there is one. Otherwise, doesn't
      * return anything.
      */
     validate: function(attributes) {


        // TODO Validation on the attributes. Returning a String counts as an error.
        // We do need to validate some of these attributes, but not sure how they would work. I think they need for loops.
        
         //for (sessionID in sessionIDs) {
        //    return "sessionID must be unique.";
        // }
          //for (user not in uers) {
        //    return "user must be in the system.";
        // }
         //for (team not in teams) {
        //    return "team must be in the system.";
        // }
         //if (informant not in informants ) {
        //    return "informant must be in the system.";
        // }


     },
     
     });
    return Session;
    


});
















           














