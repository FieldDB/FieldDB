var Datum = Backbone.Model.extend(
/** @lends Datum.prototype */
{
   /**
    * @class <TODO Describe the Datum model here.>
    *
    * @property {String} utterance <TODO Describe utterance here>
    * @property {String} gloss <TODO Describe gloss here>
    * @property {String} translation <TODO Describe translation here>
    * @property {Number} sessionID <TODO Describe sessionID here>
    * @property {Perference} prefs <TODO Describe prefs here>
    *
    * @description <TODO OPTIONAL Describe the initialize function here.>
    *
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
      //here are the attributes a datum minimally has to have, other fields can be added when the user designs their own fields later.
       utterance : "",
       gloss : "",
       translation : "",
       
       //not sure if this goes in default, but we need a way to link up the datum with the data from its parent, the session.
       sessionID : 0,
       
       //Preferences are where we'll have things like the extra fields the user wants.
       prefs : new Preference()
   },

   /**
    * <TODO Describe the validation here.>
    *
    * @param {Object} attributes The set of attributes to validate.
    *
    * @returns {String} The validation error, if there is one. Otherwise, doesn't
    * return anything.
    */
   validate: function(attributes) {
      // TODO Validation on the attributes. Returning a String counts as an error.
      //      Example:
      // if (attributes.someAttribute <= 0) {
      //    return "Must use positive numbers";
      // }
   },
   
   /**
    * <TODO Describe the subtitle function here.>
    */
   subtitle: function() {
   },
   
   /**
    * <TODO Describe the laTeXiT function here.>
    */
   laTeXiT: function() {
   },
   
   /**
    * <TODO Describe the addAudio function here.>
    */
   addAudio: function() {
   },
   
   /**
    * <TODO Describe the exportDatum function here.>
    */
   exportDatum: function() {
   },
   
   /**
    * <TODO Describe the syncDatum function here.>
    */
   syncDatum: function() {
   }
});
