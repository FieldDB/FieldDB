//needs to have attributes as DatumFields.... but  can't put them in until DatumFields is up and running.
define([
    "use!backbone",
    "comment/Comments",
    "datum/DatumField",
    "datum/DatumFields",
    "user/Consultant",
    "user/Team",
    "user/User",
], function(
    Backbone,
    Comments,
    DatumField,
    DatumFields,
    Consultant,
    Team,
    User
) {
  var Session = Backbone.Model.extend(
  /** @lends Session.prototype */
  {
    /**
     * @class The Datum widget is the place where all linguistic data is
     *        entered; one at a time.
     * @property {Number} sessionID The session ID is an automatically generated
     *           number which will uniquely identify the session.
     * @property {String} user The user is the person inputting the data for
     *           that session.
     * @property {String} team The team is the team that the user belongs to.
     * @property {String} consultant The consultant is the native speaker of the
     *           language under investigation that has verified the data in the
     *           session.
     * @property {String} language The language is the language under
     *           investigation in the particular session.
     * @property {String} languageFamily The language family is an attribute
     *           which users can use to group languages.
     * @property {String} dialect The dialect specifies the dialect of the
     *           language under investigation.
     * @property {String} date The date is the date that the data was elicited.
     * @property {String} goal The goal is the particular linguistic goal that
     *           the researcher was pursuing during that session.
     * 
     * @description The initialize function brings up a page in which the user
     *              can fill out the details corresponding to the session. These
     *              details will be linked to each datum submitted in the
     *              session.
     * @extends Backbone.Model
     * @constructs
     */
    initialize: function() {
    },
   
    defaults: {
      sessionFields : new DatumFields(),
      comments : Comments
    },
   
    pouch : Backbone.sync.pouch(Utils.androidApp() ? Utils.touchUrl : Utils.pouchUrl),
   
    /**
     * Validation functions will verify that the session ID is unique and
     * that the consultant,users, and teams are all correspond to people in
     * the system.
     * 
     * @param {Object}
     *          attributes The set of attributes to validate.
     * 
     * @returns {String} The validation error, if there is one. Otherwise,
     *          doesn't return anything.
     */
    validate: function(attributes) {
      // TODO Validation on the attributes. Returning a String counts as an error.
      // We do need to validate some of these attributes, but not sure how they would work. I think they need for loops.
      
        //for (user not in users) {
      //    return "user must be in the system.";
      // }
       //for (team not in teams) {
      //    return "team must be in the system.";
      // }
       //if (consultant not in consultants ) {
      //    return "consultant must be in the system.";
      // }
    },
    /**
     * When a Session is returned from the database, its internal models are just
     * arrays of their attributes. This restructures them into their models.
     * 
     * Function copied from Datum.js
     */
    restructure : function() {
      // Restructure the SessionFields
      if (this.get("sessionFields")) {
        // Keep track of the data that we want to restructure
        var temp = this.get("sessionFields");
        
        // Create the model to store each DatumField
        this.set("sessionFields", new DatumFields());
        
        // Create the Datum Field models and store them
        for (i in temp) {
          var field = new DatumField(temp[i]);
          this.get("sessionFields").push(field);
        }
      }
    
      
      // TODO Restructure the rest
    },
  });
  return Session;
});