define([ "use!backbone",
         "audio_video/AudioVideo", 
         "comment/Comments",
         "datum/DatumField", 
         "datum/DatumFields", 
         "datum/DatumState", 
         "datum/DatumTags", 
         "datum/Session",
         "libs/Utils"
], function(Backbone, 
    AudioVideo, 
    Comments,
    DatumField, 
    DatumFields,
    DatumState, 
    DatumTags,
    Session) {
  var Datum = Backbone.Model.extend(
  /** @lends Datum.prototype */
  {
    /**
     * @class The Datum widget is the place where all linguistic data is
     *        entered; one at a time.
     * 
     * @property {DatumField} utterance The utterance field generally
     *           corresponds to the first line in linguistic examples that can
     *           either be written in the language's orthography or a
     *           romanization of the language. An additional field can be added
     *           if the language has a non-roman script.
     * @property {DatumField} gloss The gloss field corresponds to the gloss
     *           line in linguistic examples where the morphological details of
     *           the words are displayed.
     * @property {DatumField} translation The translation field corresponds to
     *           the third line in linguistic examples where in general an
     *           English translation. An additional field can be added if
     *           translations into other languages is needed.
     * @property {DatumField} judgment The judgment is the grammaticality
     *           judgment associated with the datum, so grammatical,
     *           ungrammatical, felicitous, unfelicitous etc.
     * @property {DatumState} state When a datum is created, it can be tagged
     *           with a state, such as 'to be checked with an informant'.
     * @property {AudioVisual} audioVisual Datums can be associated with an audio or video
     *           file.
     * @property {Session} session The session provides details about the set of
     *           data elicited. The session will contain details such as date,
     *           language, informant etc.
     * @property {Comments} comments The comments is a collection of comments
     *           associated with the datum, this is meant for comments like on a
     *           blog, not necessarily notes, which can be encoded in a
     *           field.(Use Case: team discussing a particular datum)
     * @property {DatumTags} datumtags The datum tags are a collection of tags
     *           associated with the datum. These are made completely by the
     *           user.They are like blog tags, a way for the user to make
     *           categories without make a hierarchical structure, and make
     *           datum easier for search.
     * 
     * 
     * 
     * @description The initialize function brings up the datum widget in small
     *              view with one set of datum fields. However, the datum widget
     *              can contain more than datum field set and can also be viewed
     *              in full screen mode.
     * 
     * @extends Backbone.Model
     * @constructs
     */
    initialize : function() {
      if(typeof this.get("audioVideo") == "function"){
        this.set("audioVideo",new AudioVideo());
      }
      
    },

    defaults : {      
      datumFields : DatumFields,
      
      audioVideo : AudioVideo,
      session : Session,
      comments : Comments,
      datumState : DatumState,
      datumTags : DatumTags,
      dateEntered : DatumField
    },

    pouch : Backbone.sync.pouch(Utils.androidApp() ? Utils.touchUrl
        : Utils.pouchUrl),

    
    /**
     * When a Datum is returned from the database, its internal models are just
     * arrays of their attributes. This restructures them into their models.
     */
    restructure : function() {
      // Restructure the DatumFields
      if (this.get("datumFields")) {
        // Keep track of the data that we want to restructure
        var temp = this.get("datumFields");
        
        // Create the model to store each DatumField
        this.set("datumFields", new DatumFields());
        
        // Create the Datum Field models and store them
        for (i in temp) {
          var field = new DatumField(temp[i]);
          this.get("datumFields").push(field);
        }
      }
    
      // Restructure the AudioVideo
      if (this.get("audioVideo")) {
        this.set("audioVideo", new AudioVideo(this.get("audioVideo")));
      }
      
      // TODO Restructure the Session
      
      // TODO Restructure the Comments
      
      // TODO Restructure the DatumState
      
      // TODO Restructure the DatumTags
      
      // TODO Restructure the dateEntered DatumField
    },
    
    /**
     * Search Datums whose gloss contains the given string.
     * 
     * @param gloss {String} The string to search for in the gloss.
     * @param callback {Function} A function that takes a single parameter: an 
     * array of all the DatumIds whose gloss cotnains the given string or an 
     * empty Array if there are no matches.
     */
    searchByGloss : function(gloss, callback) {
      this.pouch(function(err, db) {
        // Code for get_gloss/get_gloss:
        //
        // function(doc) {
        //   if (doc.datumFields) {
        //     for (i = 0; i < doc.datumFields.length; i++) {
        //       if (doc.datumFields[i].label == "gloss") {
        //         emit(doc.datumFields[i].value, doc._id);
        //       }
        //     }
        //   }
        // }
        db.query("get_gloss/get_gloss", {reduce: false}, function(err, response) {
          var matchIds = [];
          
          if (!err) {
            // Go through all the rows of glosses
            for (i in response.rows) {
              // If the row's gloss contains the given string
              if (response.rows[i].key.indexOf(gloss) != 0) {
                // Keep its datum's ID, which is the value
                matchIds.push(response.rows[i].value);
              }
            }
          }
          
          callback(matchIds);
        });
      });
    }
  });

  return Datum;
});
