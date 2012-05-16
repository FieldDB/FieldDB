var Datum = Backbone.Model.extend(
/** @lends Datum.prototype */
{
   /**
    * @class <The Datum widget is the place where all linguistic data is entered; one at a time.   > 
    * 
    * @mecathcart, what's with all the <> ?? im pretty sure it breaks your documentation, there  is nothing showing up in the docs:
    * http://redmine.ilanguage.ca:8080/job/Drag-and-Drop-FieldLinguistics/javadoc/symbols/Datum.html
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
       //as far as I know, attestation is not a word linguists generally use. cesine: I agree, it was the word that Alan Yu had in his database so i figured they probably debated it a bit and setted with something since utterance implies spoken... but maybe we can stick to utterance. 
       gloss : "",
       translation : "",
       
       sessionID : 0,
       status : new DatumStatus(),
       //Preferences are where we'll have things like the extra fields the user wants. TODO this is an abmigous use of the prefernce class, which was originally supposed to be user preferences like skins?
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
   
   //the following functions correspond the menu bar below the datum



    /**
    * <The status function will allow users to mark the status of a given datum, i.e. checked or needs verification.>
   */
   status: function() {
   },
   
   /**
    * <The LaTeXiT function automatically mark-ups an example in LaTeX code (\exg. \"a) and then copies it on the clipboard so that when the user switches over to their LaTeX file they only need to paste it in.  >
    */
   laTeXiT: function() {
   },
   
   /**
    * <The addAudio function is a drop box in which the user can drag an audio file and link it to the relevant datum.>
    */
   addAudio: function() {
   },
   
 /**
    * <The playDatum function appears when the audio has already been added and allows the user to play the associated audio file.>
    */
    
   playDatum: function() {
   },


   /**
    * <The copyDatum function copies all datum fields to the clipboard.>
    */
   copyDatum: function() {
   },
   
   /**
    * <The starDatum function allows the user bookmark favorite data.  Adds an additional way for user's to search data without a single search term.  For instance, if the user wants to keep track of the data used in their thesis, or data that's good for their analsysis. >
    */
   starDatum: function() {
   },


    /**
    <The duplicateDatum function opens a new datum field set with the fields already filled exactly like the previous datum so that the user can minimally edit the datum.>
    */
   duplicateDatum: function() {
   },
 /**
    * <The starDatum function allows the user bookmark favorite data.  Adds an additional way for user's to search data without a single search term.  For instance, if the user wants to keep track of the data used in their thesis, or data that's good for their analsysis. >
    */
   starDatum: function() {
   }


});


model = new Backbone.Model({
    data:[
        { text: "Google", href: "http://google.com" },
        { text: "Facebook", href: "http://facebook.com" },
        { text: "Youtube", href: "http://youtube.com" }
    ]
});
 
var View = Backbone.View.extend({
    initialize: function () {
        this.template = $('#list-template').children();
    },
    el: '#container',
    events: {
        "click button": "render"
    },
    render: function() {
        var data = this.model.get('data');
       
        for (var i=0, l=data.length; i<l; i++) {
            var li = this.template.clone().find('a').attr('href', data[i].href).text(data[i].text).end();
            this.$el.find('ul').append(li);
        }
    }
});
 
var view = new View({ model: model });













           














