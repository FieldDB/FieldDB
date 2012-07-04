define([ 
    "use!backbone",
    "audio_video/AudioVideo", 
    "comment/Comments",
    "datum/DatumField", 
    "datum/DatumFields", 
    "datum/DatumState", 
    "datum/DatumStates",
    "datum/DatumTag",
    "datum/DatumTags",
    "datum/Session",
    "libs/Utils"
], function(
    Backbone, 
    AudioVideo, 
    Comments,
    DatumField, 
    DatumFields,
    DatumState, 
    DatumStates,
    DatumTag,
    DatumTags,
    Session
) {
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
     *           with a state, such as 'to be checked with an consultant'.
     * @property {AudioVisual} audioVisual Datums can be associated with an audio or video
     *           file.
     * @property {Session} session The session provides details about the set of
     *           data elicited. The session will contain details such as date,
     *           language, consultant etc.
     * @property {Comments} comments The comments is a collection of comments
     *           associated with the datum, this is meant for comments like on a
     *           blog, not necessarily notes, which can be encoded in a
     *           field.(Use Case: team discussing a particular datum)
     * @property {DatumTags} datumtags The datum tags are a collection of tags
     *           associated with the datum. These are made completely by the
     *           user.They are like blog tags, a way for the user to make
     *           categories without make a hierarchical structure, and make
     *           datum easier for search.
     * @property {Date} dateEntered The date the Datum was first saved.
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
    
    relativizePouchToACorpus : function(corpus){
      //rebuild the pouch and touchdb urls to be relative to the active corpus TODO users shouldnt get saved in their corpus or should they? if they are saved, then if you replcate the corpus you can eaisly see the collaborators/contributors profiles since they are in the corpus. but they might be out of date.
      var c = corpus.get("couchConnection");
      this.pouch = Backbone.sync.pouch(Utils.androidApp() ? Utils.touchUrl+c.corpusname
          : Utils.pouchUrl+c.corpusname);
    },
    
    defaults : {      
      datumFields : new DatumFields(),
      audioVideo : new AudioVideo(),
      comments : new Comments(),
      datumState : new DatumState(),
      datumState : new DatumState(),      // The selected DatumState
      datumTags : new DatumTags(),
      dateEntered : new Date()
    },
    
    model : {
      datumFields : DatumFields,
      audioVideo : AudioVideo,
      session : Session,
      comments : Comments,
      datumState : DatumState,
      datumState : DatumState,      // The selected DatumState
      datumTags : DatumTags
    },
    
    parse : function(response) {
      if (response.ok === undefined) {
        for (var key in this.model) {
          var embeddedClass = this.model[key];
          var embeddedData = response[key];
          response[key] = new embeddedClass(embeddedData, {parse:true});
        }
      }
      
      return response;
    },

    pouch : Backbone.sync.pouch(Utils.androidApp() ? Utils.touchUrl
        : Utils.pouchUrl),
    
    searchByQueryString : function(queryString, callback) {
      var self = this;
      this.pouch(function(err, db) {
        // Code for get_datum_field/get_datum_fields
        //
        // function(doc) {
        //   if ((doc.datumFields) && (doc.session)) {
        //     var obj = {};
        //     for (i = 0; i < doc.datumFields.length; i++) {
        //       if (doc.datumFields[i].value) {
        //         obj[doc.datumFields[i].label] = doc.datumFields[i].value;
        //       }
        //     }
        //     if (doc.session.sessionFields) {
        //       for (j = 0; j < doc.session.sessionFields.length; j++) {
        //         if (doc.session.sessionFields[j].value) {
        //           obj[doc.session.sessionFields[j].label] = doc.doc.session.sessionFields[j].value;
        //         }
        //       }
        //     }
        //     emit(obj, doc._id);
        //   }
        // }
        db.query("get_datum_field/get_datum_fields", {reduce: false}, function(err, response) {
          var matchIds = [];
          
          if (!err) {
            // Process the given query string into tokens
            var queryTokens = self.processQueryString(queryString);
            
            // Go through all the rows of results
            for (i in response.rows) {
              // Determine if this datum matches the first search criteria
              var thisDatumIsIn = self.matchesSingleCriteria(response.rows[i].key, queryTokens[0]);
              
              // Progressively determine whether the datum still matches based on
              // subsequent search criteria
              for (j = 1; j < queryTokens.length; j += 2) {
                if (queryTokens[j] == "AND") {
                  // Short circuit: if it's already false then it continues to be false
                  if (!thisDatumIsIn) {
                    break;
                  }
                  
                  // Do an intersection
                  thisDatumIsIn = thisDatumIsIn && self.matchesSingleCriteria(response.rows[i].key, queryTokens[j+1]);
                } else {
                  // Do a union
                  thisDatumIsIn = thisDatumIsIn || self.matchesSingleCriteria(response.rows[i].key, queryTokens[j+1]);
                }
              }
              
              // If the row's datum matches the given query string
              if (thisDatumIsIn) {
                // Keep its datum's ID, which is the value
                matchIds.push(response.rows[i].value);
              }
            }
          }
          
          callback(matchIds);
        });
      });
    },
    
    /**
     * Determines whether the given object to search through matches the given
     * search criteria.
     * 
     * @param {Object} objectToSearchThrough An object representing a datum that
     * contains (key, value) pairs where the key is the datum field label and the
     * value is the datum field value of that attribute.
     * @param {String} criteria The single search criteria in the form of a string
     * made up of a label followed by a colon followed by the value that we wish
     * to match.
     * 
     * @return {Boolean} True if the given object matches the given criteria.
     * False otherwise.
     */
    matchesSingleCriteria : function(objectToSearchThrough, criteria) {
      var delimiterIndex = criteria.indexOf(":");
      var label = criteria.substring(0, delimiterIndex);
      var value = criteria.substring(delimiterIndex + 1);
      
      return objectToSearchThrough[label] && (objectToSearchThrough[label].toLowerCase().indexOf(value) >= 0);
    },
    
    /**
     * Process the given string into an array of tokens where each token is
     * either a search criteria or an operator (AND or OR). Also makes each
     * search criteria token lowercase, so that searches will be case-
     * insensitive.
     * 
     * @param {String} queryString The string to tokenize.
     * 
     * @return {String} The tokenized string
     */
    processQueryString : function(queryString) {      
      // Split on spaces
      var queryArray = queryString.split(" ");
      
      // Create an array of tokens out of the query string where each token is
      // either a search criteria or an operator (AND or OR).
      var queryTokens = [];
      var currentString = "";
      for (i in queryArray) {
        var currentItem = queryArray[i].trim();
        if (currentItem.length <= 0) {
          break;
        } else if ((currentItem == "AND") || (currentItem == "OR")) {
          queryTokens.push(currentString);
          queryTokens.push(currentItem);
          currentString = "";
        } else if (currentString) {
          currentString = currentString + " " + currentItem.toLowerCase();
        } else {
          currentString = currentItem.toLowerCase();
        }
      }
      queryTokens.push(currentString);
      
      return queryTokens;
    },
    
    /**
     * Clone the current Datum and return the clone. The clone is put in the current
     * Session, regardless of the origin Datum's Session.
     * 
     * @return The clone of the current Datum.
     */
    clone : function() {
      // Create a new Datum based on the current Datum
      var datum = new Datum({
        audioVideo : new AudioVideo(this.get("audioVideo").toJSON(), {parse: true}),
        comments : new Comments(this.get("comments").toJSON(), {parse: true}),
        dateEntered : this.get("dateEntered"),
        datumFields : new DatumFields(this.get("datumFields").toJSON(), {parse: true}),
        datumState : new DatumState(this.get("datumState").toJSON(), {parse: true}),
        datumStates : new DatumStates(this.get("datumStates").toJSON(), {parse: true}),
        datumTags : new DatumTags(this.get("datumTags").toJSON(), {parse: true})
        // Don't need to do Session here since it will be overwritten in DatumContainerEditView.prependDatum()
      });
      
      return datum;
    }
  });

  return Datum;
});
