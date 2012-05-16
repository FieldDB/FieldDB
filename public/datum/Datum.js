var Datum = Backbone.Model.extend(
/** @lends Datum.prototype */
{
   /**
    * @class <The Datum widget is the place where all linguistic data is entered; one at a time.   >
    *
    * @property {String} utterance <The utterance field generally corresponds to the first line in linguistic examples that can either be written in the language's orthography or a romanization of the language. An additional field can be added if the language has a non-roman script.>
    * @property {String} gloss <The gloss field corresponds to the gloss line in linguistic examples where the morphological details of the words are displayed. >
    * @property {String} translation <The translation field corresponds to the third line in linguistic examples where in general an English translation.  An additional field can be added if translations into other languages is needed. >
    * @property {Number} sessionID <The session ID corresponds to the number assigned to the session in which the datum is being placed.  The session will contain details such as date, language, informant etc.>
    * @property {Perference} prefs <The preferences correspond to the user's preset of chosen fields, which may extend beyond the standard three.>
    *
    * @description <The initialize function brings up the datum widget in small view with one set of datum fields.  However, the datum widget can contain more than datum field set and can also be viewed in full screen mode.
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
       //as far as I know, attestation is not a word linguists generally use.
       gloss : "",
       translation : "",

       //While it will not look like a field, it will essentially be a place where the user can click and add tags and then they will appear in little bubbles.
       grammaticalTags: "",
       
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
      //I'm not sure what this function is supposed to do for this particular model, honestly, the use should be able to put in wahtever they want in the fields.    
      // TODO Validation on the attributes. Returning a String counts as an error.
      //      Example:
      // if (attributes.someAttribute <= 0) {
      //    return "Must use positive numbers";
      // }
   },
   



});
















           














