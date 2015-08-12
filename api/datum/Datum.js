/* globals window, $, _ , OPrime*/
"use strict";

var FieldDBObject = require("./../FieldDBObject").FieldDBObject;
var AudioVideo = require("./../audio_video/AudioVideo").AudioVideo;
var AudioVideos = require("./../audio_video/AudioVideos").AudioVideos;
var Comments = require("./../comment/Comments").Comments;
var Datums = require("./../Collection").Collection;
var DatumField = require("./DatumField").DatumField;
var DatumFields = require("./DatumFields").DatumFields;
// var DatumState = require("./../FieldDBObject").FieldDBObject;
var DatumStates = require("./DatumStates").DatumStates;
// var DatumTag = require("./../FieldDBObject").FieldDBObject;
var DatumTags = require("./DatumTags").DatumTags;
var Images = require("./../image/Images").Images;
var Session = require("./Session").Session;

var DEFAULT_CORPUS_MODEL = require("./../corpus/corpus.json");

/**
 * @class The Datum model which contains metadata to help validate and search data
 *
 * @property {AudioVisual} audioVideo Datums can be associated with an audio or video
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
 * @property {Date} dateModified The date the Datum was last saved.
 *
 * @description The initialize function brings up the datum widget in small
 *              view with one set of datum fields. However, the datum widget
 *              can contain more than datum field set and can also be viewed
 *              in full screen mode.
 *
 * @name  Datum
 * @extends FieldDBObject
 * @constructs
 */
var Datum = function Datum(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "Datum";
  }
  this.debug("Constructing Datum: ", options);
  FieldDBObject.apply(this, arguments);
};

Datum.prototype = Object.create(FieldDBObject.prototype, /** @lends Datum.prototype */ {
  constructor: {
    value: Datum
  },

  fields: {
    get: function() {
      this.debug("getting fields");
      if (!this._fields && this.corpus && typeof this.corpus.updateDatumToCorpusFields === "function") {
        this.corpus.updateDatumToCorpusFields(this);
      }
      return this._fields;
    },
    set: function(value) {
      if (value && !value.confidential && this.confidential) {
        value.confidential = this.confidential;
      }
      this.ensureSetViaAppropriateType("fields", value);
    }
  },

  datumFields: {
    get: function() {
      this.debug("datumFields is depreacted, just use fields instead");
      return this.fields;
    },
    set: function(value) {
      this.debug("datumFields is depreacted, just use fields instead");
      return this.fields = value;
    }
  },

  accessAsObject: {
    get: function() {
      var obj = {};

      var passValueReference = function(field) {
        obj[field.id] = field.value;
      };

      this.fields.map(passValueReference);
      if (this.session) {
        this.session.fields.map(passValueReference);
      } else {
        this.warn("this datum is missing a session, this is stange");
      }

      obj.comments = this.comments.map(function(comment) {
        return comment.text;
      }).join("; ");
      obj.audioVideo = this.audioVideo.map(function(audioVideo) {
        return audioVideo.filename;
      }).join("; ");
      obj.images = this.images.map(function(image) {
        return image.filename;
      }).join("; ");
      return obj;
    },
    set: function() {}
  },

  addField: {
    value: function(field) {
      if (!this.fields) {
        this.fields = [];
      }
      if (typeof field === "string") {
        // this.fields.debugMode = true;
        if (this.fields[field]) {
          return this.fields[field];
        }
        field = {
          id: field
        };
      }
      this.debug("adding field", field);
      return this.fields.add(field);
    }
  },

  addFile: {
    value: function(newFileDetails) {
      if (!newFileDetails) {
        this.warn("A null file was requested to be added to this datum", newFileDetails);
        return;
      }
      newFileDetails.type = newFileDetails.type || "";
      if (newFileDetails.type.indexOf("audio") === 0) {
        this.audioVideo = this.audioVideo || [];
        this.audioVideo.add(newFileDetails);
      } else if (newFileDetails.type.indexOf("video") === 0) {
        this.audioVideo = this.audioVideo || [];
        this.audioVideo.add(newFileDetails);
      } else if (newFileDetails.type.indexOf("image") === 0) {
        this.images = this.images || [];
        this.images.add(newFileDetails);
      } else {
        var regularizedJSON = new AudioVideo(newFileDetails).toJSON();
        this.addRelatedData(regularizedJSON);
      }
      this.unsaved = true;
    }
  },

  audioVideo: {
    get: function() {
      if (this._audioVideo && this._audioVideo.fieldDBtype === "AudioVideos") {
        this._audioVideo.dbname = this.dbname;
      }
      return this._audioVideo || FieldDBObject.DEFAULT_COLLECTION;
    },
    set: function(value) {
      this.ensureSetViaAppropriateType("audioVideo", value);
    }
  },

  hasAudio: {
    get: function() {
      var hasAudio = false;
      if (this.audioVideo.length > 0) {
        this.audioVideo.map(function(audioVideo) {
          if (audioVideo.trashed !== "deleted") {
            hasAudio = true;
          }
        });
      }
      return hasAudio;
    },
    set: function() {}
  },

  play: {
    value: function(optionalIndex) {
      this.debug("optionalIndex", optionalIndex);
      if (this._audioVideo && typeof this._audioVideo.play === "function") {
        this._audioVideo.play(0);
      }
    }
  },

  images: {
    get: function() {
      if (this._images && this._images.fieldDBtype === "Images") {
        this._images.dbname = this.dbname;
      }
      return this._images || FieldDBObject.DEFAULT_COLLECTION;
    },
    set: function(value) {
      if (value && !value.confidential && this.confidential) {
        value.confidential = this.confidential;
      }
      this.ensureSetViaAppropriateType("images", value);
    }
  },

  hasImages: {
    get: function() {
      var hasImages = false;
      if (this.images.length > 0) {
        this.images.map(function(image) {
          if (image.trashed !== "deleted") {
            hasImages = true;
          }
        });
      }
      return hasImages;
    },
    set: function() {}
  },

  relatedData: {
    get: function() {
      if (!this.fields) {
        return;
      }
      if (this.fields && !this.fields.relatedData && DEFAULT_CORPUS_MODEL && DEFAULT_CORPUS_MODEL.datumFields && DEFAULT_CORPUS_MODEL.datumFields.length >= 10) {
        this.fields.add(DEFAULT_CORPUS_MODEL.datumFields[10]);
      }
      this.fields.relatedData.json = this.fields.relatedData.json || {};
      this.fields.relatedData.json.relatedData = this.fields.relatedData.json.relatedData || [];
      return this.fields.relatedData.json.relatedData;
    },
    set: function() {
      // if (this.fields && this.fields.relatedData) {
      //   // this.fields.debugMode = true;
      // } else {
      //   return;
      // }
      // // this.fields.relatedData.json = this.fields.relatedData.json || {};
      // // this.fields.relatedData.json.relatedData = value;
    }
  },

  // The couchdb-connector is capable of mapping the url scheme
  // proposed by the authors of Backbone to documents in your database,
  // so that you don't have to change existing apps when you switch the sync-strategy
  api: {
    value: "datums"
  },

  // Internal models: used by the parse function
  INTERNAL_MODELS: {
    value: {
      fields: DatumFields,
      audioVideo: AudioVideos,
      session: Session,
      comments: Comments,
      datumStates: DatumStates,
      datumTags: DatumTags,
      images: Images
    }
  },

  /**
   * Gets all the DatumIds in the current Corpus sorted by their date.
   *
   * @param {Function} callback A function that expects a single parameter. That
   * parameter is the result of calling "pages/datums". So it is an array
   * of objects. Each object has a 'key' and a 'value' attribute. The 'key'
   * attribute contains the Datum's dateModified and the 'value' attribute contains
   * the Datum itself.
   */
  getMostRecentIdsByDate: {
    value: function(howmany, callback) {
      var self = this;

      if (OPrime.isBackboneCouchDBApp()) {
        //        self.bug("TODO check  getMostRecentIdsByDate");
        //TODO this might be producing the error on line  815 in backbone.js       model = new this.model(attrs, options);
        var tempDatums = new Datums();
        tempDatums.model = Datum;
        tempDatums.fetch({
          descending: true,
          limit: howmany,
          error: function(model, xhr, options) {
            OPrime.bug("There was an error loading your datums.", xhr, options);
            if (typeof callback === "function") {
              callback([]);
            }
          },
          success: function(model, response) {
            self.debug(model);
            //            if (response.length >= 1) {
            //              callback([response[0]._id], [response[1]._id]);
            callback(response);
            //            }
          }
        });
        return;
      }


      try {
        self.pouch(function(err, db) {
          db.query("pages/datums", {
            reduce: false
          }, function(err, response) {

            if (err) {
              if (window.toldSearchtomakebydateviews) {
                self.debug("Told pouch to make by date views once, apparently it didnt work. Stopping it from looping.");
                return;
              }
              /*
               * Its possible that the pouch has no by date views, create them and then try searching again.
               */
              window.toldSearchtomakebydateviews = true;
              window.app.corpus.createPouchView("pages/datums", function() {
                window.appView.toastUser("Initializing your corpus' sort items by date functions for the first time.", "alert-success", "Sort:");
                self.getMostRecentIdsByDate(howmany, callback);
              });
              return;
            }

            if ((!err) && (typeof callback === "function")) {
              self.debug("Callback with: ", response.rows);
              callback(response.rows);
            }
          });
        });

      } catch (e) {
        //        appView.datumsEditView.newDatum();
        window.appView.datumsEditView.render();
        self.bug("Couldnt show the most recent datums " + JSON.stringify(e));

      }
    }
  },
  fillWithCorpusFieldsIfMissing: {
    value: function() {
      if (!this.fields) {
        return;
      }
      /* Update the datum to show all fields which are currently in the corpus, they are only added if saved. */
      var corpusFields = window.app.corpus.datumFields.models;
      for (var field in corpusFields) {
        var label = corpusFields[field].get("label");
        this.debug("Label " + label);
        var correspondingFieldInThisDatum = this.fields.where({
          label: label
        });
        if (correspondingFieldInThisDatum.length === 0) {
          this.fields.push(corpusFields[field]);
        }
      }
    }
  },
  search: {
    value: function(queryString, limitToOptionalFields) {
      try {
        //http://support.google.com/analytics/bin/answer.py?hl=en&answer=1012264
        window.pageTracker._trackPageview("/search_results.php?q=" + queryString);
      } catch (e) {
        this.debug("Search Analytics not working.");
      }

      // Process the given query string into tokens
      var queryTokens = this.processQueryString(queryString);
      var doGrossKeywordMatch = false;
      if (queryString.indexOf(":") === -1) {
        doGrossKeywordMatch = true;
        queryString = queryString.toLowerCase().replace(/\s/g, "");
      }

      if (true) {
        var accessAsObject = this.accessAsObject;
        // If the caller asked for only certain fields, search only those.
        if (limitToOptionalFields) {
          this.debug("Reducing fields to the fields requested by the user", limitToOptionalFields);
          for (var fieldlabel in limitToOptionalFields) {
            if (!limitToOptionalFields.hasOwnProperty(fieldlabel) || !limitToOptionalFields[fieldlabel]) {
              continue;
            }
            limitToOptionalFields[fieldlabel] = accessAsObject[fieldlabel];
          }
        } else {
          limitToOptionalFields = accessAsObject;
        }

        var highlightedMatchesInHTML = this.highlightMatches(limitToOptionalFields, queryString, doGrossKeywordMatch, queryTokens);
        // If the row's datum matches the given query string
        if (highlightedMatchesInHTML && highlightedMatchesInHTML.length > 0) {
          // Keep its datum's ID, which is the value
          this.highlightedMatches = highlightedMatchesInHTML; // ["TODO showing the matched with a window of 20 char before and after."];
          return this.highlightedMatches;
        }
        delete this.highlightedMatches;
        return;
      }



      try {
        var self = this;
        self.pouch(function(err, db) {
          db.query("pages/get_datum_fields", {
            reduce: false
          }, function(err, response) {
            var matchIds = [];

            if (!err) {

              // Go through all the rows of results
              for (var i in response.rows) {
                var thisDatumIsIn = self.highlightMatches(response.rows[i], queryString, doGrossKeywordMatch, queryTokens);
                // If the row's datum matches the given query string
                if (thisDatumIsIn) {
                  // Keep its datum's ID, which is the value
                  matchIds.push(response.rows[i].value);
                }
              }
            } else {
              if (window.toldSearchtomakeviews) {
                self.debug("Told search to make views once, apparently it didnt work. Stopping it from looping.");
                return;
              }
              /*
               * Its possible that the corpus has no search views, create them and then try searching again.
               */
              window.appView.toastUser("Initializing your search functions for the first time." +
                " Search is pretty powerful, " +
                " in fact if you're the power user type you can write your " +
                "own data extracting/filtering/visualization queries using " +
                " <a href='http://www.kchodorow.com/blog/2010/03/15/mapreduce-the-fanfiction/' target='_blank'>MapReduce.</a>", "alert-success", "Search:");
              window.toldSearchtomakeviews = true;
              var previousquery = queryString;
              window.app.corpus.createPouchView("pages/get_datum_fields", function() {
                window.appView.searchEditView.search(previousquery);
              });
            }

          });
        });
      } catch (e) {
        self.bug("Couldnt search the data, if you sync with the server you might get the most recent search index.");
      }
    }
  },
  highlightMatches: {
    value: function(simpleObject, queryString, doGrossKeywordMatch, queryTokens) {
      var fieldlabel,
        highlightedmatch;


      this.debug("Highlighting matches for ", simpleObject, queryString, doGrossKeywordMatch, queryTokens);
      var highlightedMatches = [];
      // If the query string is null, include all datumIds
      if (queryString.trim() === "") {
        this.debug("user searched for nothing, which means we will include this item.");
        highlightedMatches = [" "];
      } else if (doGrossKeywordMatch) {
        this.debug("user searched for GrossKeywordMatch of " + queryString);

        for (fieldlabel in simpleObject) {
          if (!simpleObject.hasOwnProperty(fieldlabel) || !simpleObject[fieldlabel]) {
            continue;
          }
          highlightedmatch = this.highlight(simpleObject[fieldlabel], queryString);
          if (highlightedmatch.indexOf("<span") > -1) {
            highlightedMatches.push(highlightedmatch);
          }
        }
        return highlightedMatches;
      } else {


        var conditionalHighlightedMatches = [];
        this.debug(" Searching through ", queryTokens);

        // Determine if this datum matches the first search criteria
        highlightedmatch = this.matchesSingleCriteria(simpleObject, queryTokens[0]);
        if (highlightedmatch && highlightedmatch.indexOf("<span") > -1) {
          this.debug("      Found one match  " + highlightedmatch);

          conditionalHighlightedMatches.push(highlightedmatch);
        }
        // Progressively determine whether the datum still matches based on
        // subsequent search criteria
        for (var j = 1; j < queryTokens.length; j += 2) {
          if (queryTokens[j] === "AND") {
            // Do an intersection, if this fails, exit early.
            highlightedmatch = this.matchesSingleCriteria(simpleObject, queryTokens[j + 1]);
            if (highlightedmatch && highlightedmatch.indexOf("<span") > -1) {
              this.debug("       Passed intersection match  " + highlightedmatch);
              conditionalHighlightedMatches.push(highlightedmatch);
            } else {
              this.debug("       Failed the Intersection match " + highlightedmatch);
              return;
            }
          } else {
            // Do a union
            highlightedmatch = this.matchesSingleCriteria(simpleObject, queryTokens[j + 1]);
            if (highlightedmatch && highlightedmatch.indexOf("<span") > -1) {
              this.debug("      Found another match  ", highlightedmatch);
              conditionalHighlightedMatches.push(highlightedmatch);
            }
          }
        }

        if (conditionalHighlightedMatches && conditionalHighlightedMatches.length > 0) {
          this.debug("This datum matches ", conditionalHighlightedMatches);
          return conditionalHighlightedMatches;
        }
        this.debug("This datum doesnt match ", queryTokens);

      }
      return highlightedMatches;
    }
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
  matchesSingleCriteria: {
    value: function(objectToSearchThrough, criteria) {
      var delimiterIndex = criteria.indexOf(":");
      var label = criteria.substring(0, delimiterIndex);
      var negate = false;
      if (label.indexOf("!") === 0) {
        label = label.replace(/^!/, "");
        negate = true;
      }
      var value = criteria.substring(delimiterIndex + 1);

      this.debug("    Looking at label:" + label + ": value :" + value + ": in :" + objectToSearchThrough[label]);
      /* handle the fact that "" means grammatical, so if user asks for  specifically, give only the ones wiht empty judgemnt */
      if (label === "judgement" && value.toLowerCase() === "grammatical") {
        if (!objectToSearchThrough[label]) {
          return this.highlight("Grammatical", "Grammatical");
        }
      }

      var searchResult = objectToSearchThrough[label];
      searchResult = this.highlight(searchResult, value);


      if (negate) {
        if (searchResult.indexOf("<span") > -1) {
          searchResult = "";
        } else {
          searchResult = this.highlight(searchResult, searchResult);
        }
      }

      return searchResult;
    }
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
  processQueryString: {
    value: function(queryString) {
      if (!queryString) {
        return;
      }
      queryString = queryString + "";
      queryString = queryString.replace(/\&\&/g, " AND ").replace(/\|\|/g, " OR ");
      this.debug("    Normalized  query string, " + queryString);

      // Split on spaces
      var queryArray = queryString.split(/ +/);

      // Create an array of tokens out of the query string where each token is
      // either a search criteria or an operator (AND or OR).
      var queryTokens = [];
      var currentString = "";
      for (var i in queryArray) {
        var currentItem = queryArray[i].trim();
        if (currentItem.length <= 0) {
          break;
        } else if ((currentItem === "AND") || (currentItem === "OR")) {
          queryTokens.push(currentString);
          queryTokens.push(currentItem);
          currentString = "";
        } else if (currentString) {
          /* toLowerCase introduces a bug in search where camel case fields loose their capitals, then cant be matched with fields in the map reduce results */
          currentString = currentString + " " + currentItem; //.toLowerCase();
        } else {
          currentString = currentItem; //.toLowerCase();
        }
      }
      queryTokens.push(currentString);

      this.debug("    Tokenized query string, ", queryTokens);
      return queryTokens;
    }
  },
  getDisplayableFieldForActivitiesEtc: {
    value: function() {
      return this.model.fields.where({
        label: "utterance"
      })[0].get("mask");
    }
  },
  /**
   * Clone the current Datum and return the clone. The clone is put in the current
   * Session, regardless of the origin Datum's Session. //TODO it doesn tlook liek this is the case below:
   *
   * @return The clone of the current Datum.
   */
  cloneDeprecated: {
    value: function() {
      // Create a new Datum based on the current Datum
      var datum = new Datum({
        audioVideo: new AudioVideos(this.get("audioVideo").toJSON(), {
          parse: true
        }),
        comments: new Comments(this.get("comments").toJSON(), {
          parse: true
        }),
        dateEntered: this.get("dateEntered"),
        dateModified: this.get("dateModified"),
        fields: new DatumFields(this.fields.toJSON(), {
          parse: true
        }),
        datumStates: new DatumStates(this.get("datumStates").toJSON(), {
          parse: true
        }),
        datumTags: new DatumTags(this.get("datumTags").toJSON(), {
          parse: true
        }),
        dbname: this.dbname,
        session: this.get("session")
      });

      return datum;
    }
  },

  /**
   * This function is used to get the most prominent datumstate (now called
   * ValidationStatus) eg "CheckedWithSeberina" or "Deleted" or "ToBeChecked"
   *
   * @returns {String} a string which is the first item in the
   *          validationSatuts field
   */
  getValidationStatus: {
    value: function() {
      var validationStatus = "";
      var stati = this.fields.where({
        "label": "validationStatus"
      });
      if (stati.length > 0) {
        stati = stati[0].get("mask").split(" ");
        if (stati.length > 0) {
          validationStatus = stati[0];
        }
      }
      /* Handle upgrade from previous corpora look in datum states too */
      if (validationStatus === "") {
        stati = this.get("datumStates").where({
          selected: "selected"
        });
        if (stati.length > 0) {
          validationStatus = stati[0].get("state");
        }
      }
      this.updateDatumState(validationStatus);
      return validationStatus;
    }
  },
  /**
   * This function is used to colour a datum background to make
   * visually salient the validation status of the datum.
   *
   * @param status
   *            This is an optional string which is used to find the
   *            colour for a particular DatumState. If the string is
   *            not provided it gets the first element from the
   *            validation status field.
   * @returns {String} This is the colour using Bootstrap (warning is
   *          Orange, success Green etc.)
   */
  getValidationStatusColor: {
    value: function(status) {
      if (!status) {
        status = this.getValidationStatus();
      }
      /* TODO once the new ValidationStatus pattern is in the corpus proper, dont hard code the colors */
      if (status.toLowerCase().indexOf("deleted") > -1) {
        return "danger";
      }
      if (status.toLowerCase().indexOf("tobechecked") > -1) {
        return "warning";
      }
      if (status.toLowerCase().indexOf("checked") > -1) {
        return "success";
      }
    }
  },


  /**
   * This function is used to set the primary status of the datum,
   * eg. put Deleted as the first item in the validation status.
   *
   * @param selectedValue
   *            This is a string which is the validation status
   *            you want the datum to be
   */
  updateDatumState: {
    value: function(selectedValue) {
      if (!selectedValue) {
        return;
      }
      this.debug("Asking to change the datum state to " + selectedValue);
      /* make sure all the corpus states are availible in this datum */
      var thisdatumStates = this.get("datumStates");
      window.app.corpus.get("datumStates").each(function(datumstate) {
        var obj = datumstate.toJSON();
        obj.selected = "";
        thisdatumStates.addIfNew(obj);
      });
      try {
        $.each(this.get("datumStates").where({
          selected: "selected"
        }), function() {
          if (this.get("state") !== selectedValue) {
            this.set("selected", "");
          }
        });
        this.get("datumStates").where({
          state: selectedValue
        })[0].set("selected", "selected");
      } catch (e) {
        this.debug("problem getting color of datum state, probaly none are selected.", e);
      }

      /* prepend this state to the new validationStates as of v1.46.2 */
      var n = this.fields.where({
        label: "validationStatus"
      })[0];
      if (n === [] || !n) {
        n = new DatumField({
          label: "validationStatus",
          shouldBeEncrypted: "",
          showToUserTypes: "all",
          userchooseable: "disabled",
          help: "Any number of status of validity (replaces DatumStates). For example: ToBeCheckedWithSeberina, CheckedWithRicardo, Deleted etc..."
        });
        this.fields.add(n);
      }
      var validationStatus = n.get("mask") || "";
      validationStatus = selectedValue + " " + validationStatus;
      var uniqueStati = _.unique(validationStatus.trim().split(" "));
      n.set("mask", uniqueStati.join(" "));


      //      this.save();
      //TODO save it
    }
  },

  /**
   * Make the  model marked as Deleted, mapreduce function will
   * ignore the deleted models so that it does not show in the app,
   * but deleted model remains in the database until the admin empties
   * the trash.
   *
   * Also remove it from the view so the user cant see it.
   *
   */
  putInTrash: {
    value: function() {
      this.set("trashed", "deleted" + Date.now());
      this.updateDatumState("Deleted");
      this.saveAndInterConnectInApp(function() {
        /* This actually removes it from the database */
        //thisdatum.destroy();
        if (window.appView) {
          window.appView.datumsEditView.showMostRecentDatum();
        }
      });
    }
  },

  /**
   * The LaTeXiT function automatically mark-ups an example in LaTeX code
   * (\exg. \"a) and then copies it on the export modal so that when the user
   * switches over to their LaTeX file they only need to paste it in.
   *
   * We did a poll on Facebook among EGGers, and other linguists we know and
   * found that Linguex was very popular, and GB4E, so we did the export in
   * GB4E.
   */
  /* jshint ignore:start */

  laTeXiT: {
    value: function(showInExportModal) {
      this.debug(showInExportModal);
      //corpus's most frequent fields
      var frequentFields;
      if (this.application && this.application.corpus && this.application.corpus.frequentFields) {
        frequentFields = this.application.corpus.frequentFields;
      } else {
        frequentFields = this.fields.map(function(field) {
          return field.id
        });
      }
      //this datum/datalist's datumfields and their names
      var fields = this.fields.map(function(field) {
        return field.value;
      });
      var fieldLabels = this.fields.map(function(field) {
        return field.id;
      });

      var result = "\n";

      //remove any empty fields from our arrays
      for (var i = fields.length - 1; i >= 0; i--) {
        if (!fields[i]) {
          fields.splice(i, 1);
          fieldLabels.splice(i, 1);
        }
      }
      /*throughout this next section, print frequent fields and infrequent ones differently
      frequent fields get latex'd as items in a description and infrequent ones are the same,
      but commented out.*/
      if (fields && (fields.length > 0)) {
        var numInfrequent = 0;
        for (var field in fields) {
          if (frequentFields.indexOf(fieldLabels[field]) >= 0) {
            break;
          }
          numInfrequent++;
        }
        if (numInfrequent !== fieldLabels.length) {
          result = result + "\n  \\begin\{description\}";
        } else {
          result = result + "\n%  \\begin\{description\}";
        }
        for (field in fields) {
          if (fields[field] && (frequentFields.indexOf(fieldLabels[field]) >= 0)) {
            result = result + "\n    \\item\[\\sc\{" + this.escapeLatexChars(fieldLabels[field]) + "\}\] " + this.escapeLatexChars(fields[field]);
          } else if (fields[field]) {
            /* If as a field that is designed for LaTex dont excape the LaTeX characters */
            if (fieldLabels[field].toLowerCase().indexOf("latex") > -1) {
              result = result + "\n " + fields[field];
            } else {
              result = result + "\n%    \\item\[\\sc\{" + this.escapeLatexChars(fieldLabels[field]) + "\}\] " + this.escapeLatexChars(fields[field]);
            }
          }
        }
        if (numInfrequent !== fieldLabels.length) {
          result = result + "\n  \\end\{description\}";
        } else {
          result = result + "\n%  \\end\{description\}";
        }

      }
      result = result + "\n\\end{exe}\n\n";

      return result;
    }
  },
  /* jshint ignore:end */

  latexitDataList: {
    value: function(showInExportModal) {
      //this version prints new data as well as previously shown latex'd data (best for datalists)
      var result = this.laTeXiT(showInExportModal);
      if (showInExportModal) {
        $("#export-type-description").html(" as <a href='http://latex.informatik.uni-halle.de/latex-online/latex.php?spw=2&id=562739_bL74l6X0OjXf' target='_blank'>LaTeX (GB4E)</a>");
        $("#export-text-area").val($("#export-text-area").val() + result);
      }
      return result;
    }
  },

  latexitDatum: {
    value: function(showInExportModal) {
      //this version prints new data and deletes previously shown latex'd data (best for datums)
      var result = this.laTeXiT(showInExportModal);
      if (showInExportModal) {
        $("#export-type-description").html(" as <a href='http://latex.informatik.uni-halle.de/latex-online/latex.php?spw=2&id=562739_bL74l6X0OjXf' target='_blank'>LaTeX (GB4E)</a>");
        var latexDocument =
          "\\documentclass[12pt]{article} \n" +
          "\\usepackage{fullpage} \n" +
          "\\usepackage{tipa} \n" +
          "\\usepackage{qtree} \n" +
          "\\usepackage{gb4e} \n" +
          "\\begin{document} \n" + result +
          "\\end{document}";
        $("#export-text-area").val(latexDocument);
      }
      return result;
    }
  },

  escapeLatexChars: {
    value: function(input) {
      var result = input;
      //curly braces need to be escaped TO and escaped FROM, so we're using a placeholder
      result = result.replace(/\\/g, "\\textbackslashCURLYBRACES");
      result = result.replace(/\^/g, "\\textasciicircumCURLYBRACES");
      result = result.replace(/\~/g, "\\textasciitildeCURLYBRACES");
      result = result.replace(/#/g, "\\#");
      result = result.replace(/\$/g, "\\$");
      result = result.replace(/%/g, "\\%");
      result = result.replace(/&/g, "\\&");
      result = result.replace(/_/g, "\\_");
      result = result.replace(/{/g, "\\{");
      result = result.replace(/}/g, "\\}");
      result = result.replace(/</g, "\\textless");
      result = result.replace(/>/g, "\\textgreater");

      result = result.replace(/CURLYBRACES/g, "{}");
      return result;
    }
  },

  datumIsInterlinearGlossText: {
    value: function(fieldLabels) {
      if (!fieldLabels) {
        fieldLabels = this.fields.map(function(field) {
          return field.id;
        });
      }

      var utteranceOrMorphemes = false;
      var gloss = false;
      var trans = false;
      for (var fieldLabel in fieldLabels) {
        if (fieldLabels[fieldLabel] === "utterance" || fieldLabels[fieldLabel] === "morphemes") {
          utteranceOrMorphemes = true;
        }
        if (fieldLabels[fieldLabel] === "gloss") {
          gloss = true;
        }
        if (fieldLabels[fieldLabel] === "translation") {
          trans = true;
        }
      }
      if (gloss || utteranceOrMorphemes || trans) {
        return true;
      } else {
        return false;
      }
    }
  },

  /**
   * This function simply takes the utterance gloss and translation and puts
   * them out as plain text so the user can do as they wish.
   */
  exportAsPlainText: {
    value: function(showInExportModal) {
      // var header = _.pluck(this.fields.toJSON(), "label") || [];
      var fields = this.fields.map(function(field) {
        return field.value;
      });
      var result = fields.join("\n");
      if (showInExportModal) {
        $("#export-type-description").html(" as text (Word)");
        $("#export-text-area").val(
          $("#export-text-area").val() + result
        );
      }
      return result;
    }
  },

  /**
   * This takes as an argument the order of fields and then creates a row of csv.
   */
  exportAsCSV: {
    value: function(showInExportModal, orderedFields, printheaderonly) {
      var asFlatObject = this.accessAsObject,
        header = orderedFields || [],
        columns = [];

      if (orderedFields) {
        columns = orderedFields.map(function(fieldid) {
          return asFlatObject[fieldid] || "";
        });
      } else {
        for (var fieldlabel in asFlatObject) {
          header.push(fieldlabel);
          columns.push(asFlatObject[fieldlabel]);
        }
      }
      if (printheaderonly) {
        columns = header;
      }
      var result = columns.map(function(cell) {
        return "\"" + cell.replace(/"/g, "\\\"") + "\"";
      }).join(",") + "\n";

      //      if (orderedFields === null) {
      //        orderedFields = ["judgement","utterance","morphemes","gloss","translation"];
      //      }
      //      judgement = this.columns.where({label: "judgement"})[0].get("mask");
      //      morphemes = this.columns.where({label: "morphemes"})[0].get("mask");
      //      utterance= this.columns.where({label: "utterance"})[0].get("mask");
      //      gloss = this.columns.where({label: "gloss"})[0].get("mask");
      //      translation= this.columns.where({label: "translation"})[0].get("mask");
      //      var resultarray =  [judgement,utterance,morphemes,gloss,translation];
      //      var result = '"' + resultarray.join('","') + '"\n';

      if (showInExportModal) {
        $("#export-type-description").html(" as CSV (Excel, Filemaker Pro)");
        $("#export-text-area").val(
          $("#export-text-area").val() + result);
      }
      return result;
    }
  },

  /**
   * Encrypts the datum if it is confidential
   *
   * @returns {Boolean}
   */
  encrypt: {
    value: function() {
      this.set("confidential", true);
      this.fields.each(function(dIndex) {
        dIndex.set("encrypted", "checked");
      });
      //TODO scrub version history to get rid of all unencrypted versions.
      this.saveAndInterConnectInApp(window.app.router.renderDashboardOrNot, window.app.router.renderDashboardOrNot);
    }
  },

  /**
   * Decrypts the datum if it was encrypted
   */
  decrypt: {
    value: function() {
      this.set("confidential", false);

      this.fields.each(function(dIndex) {
        dIndex.set("encrypted", "");
      });
    }
  },
  /**
   * Accepts two functions to call back when save is successful or
   * fails. If the fail callback is not overridden it will alert
   * failure to the user.
   *
   * - Adds the datum to the top of the default data list in the corpus if it is in the right corpus
   * - Adds the datum to the datums container if it wasnt there already
   * - Adds an activity to the logged in user with diff in what the user changed.
   *
   * @param successcallback
   * @param failurecallback
   */
  saveAndInterConnectInApp: {
    value: function(successcallback, failurecallback) {
      this.debug("Saving a Datum");
      var self = this;
      var newModel = true;
      if (this.id) {
        newModel = false;
      } else {
        this.set("dateEntered", JSON.stringify(new Date()));
      }
      //protect against users moving datums from one corpus to another on purpose or accidentially
      if (window.app.corpus.dbname !== this.dbname) {
        if (typeof failurecallback === "function") {
          failurecallback();
        } else {
          self.bug("Datum save error. I cant save this datum in this corpus, it belongs to another corpus. ");
        }
        return;
      }
      //If it was decrypted, this will save the changes before we go into encryptedMode

      this.fields.each(function(dIndex) {
        //Anything can be done here, it is the set function which does all the work.
        dIndex.set("value", dIndex.get("mask"));
      });

      // Store the current Session, the current corpus, and the current date
      // in the Datum
      this.set({
        "dbname": window.app.corpus.dbname,
        "dateModified": JSON.stringify(new Date()),
        "timestamp": Date.now(),
        "jsonType": "Datum"
      });
      if (!this.get("session")) {
        this.set("session", window.app.get("currentSession"));
        self.debug("Setting the session on this datum to the current one.");
      } else {
        self.debug("Not setting the session on this datum.");
      }
      window.app.corpus.set("dateOfLastDatumModifiedToCheckForOldSession", JSON.stringify(new Date()));

      var oldrev = this.get("_rev");
      /*
       * For some reason the corpus is getting an extra state that no one defined in it.
       * this gets rid of it when we save. (if it gets in to a datum)
       */
      try {
        var ds = this.get("datumStates").models;
        for (var s in ds) {
          if (ds[s].get("state") === undefined) {
            this.get("datumStates").remove(ds[s]);
          }
        }
      } catch (e) {
        self.debug("Removing empty states work around failed some thing was wrong.", e);
      }

      self.save(null, {
        success: function(model, response) {
          self.debug("Datum save success");
          var utterance = model.fields.where({
            label: "utterance"
          })[0].get("mask");
          var differences = "#diff/oldrev/" + oldrev + "/newrev/" + response._rev;
          //TODO add privacy for datum goals in corpus
          //            if(window.app.corpus.get("keepDatumDetailsPrivate")){
          //              utterance = "";
          //              differences = "";
          //            }
          if (window.appView) {
            window.appView.toastUser("Sucessfully saved datum: " + utterance, "alert-success", "Saved!");
            window.appView.addSavedDoc(model.id);
          }
          var verb = "modified";
          var verbicon = "icon-pencil";
          if (newModel) {
            verb = "added";
            verbicon = "icon-plus";
          }
          window.app.addActivity({
            verb: "<a href='" + differences + "'>" + verb + "</a> ",
            verbicon: verbicon,
            directobject: "<a href='#corpus/" + model.dbname + "/datum/" + model.id + "'>" + utterance + "</a> ",
            directobjecticon: "icon-list",
            indirectobject: "in <a href='#corpus/" + window.app.corpus.id + "'>" + window.app.corpus.get("title") + "</a>",
            teamOrPersonal: "team",
            context: " via Offline App."
          });

          window.app.addActivity({
            verb: "<a href='" + differences + "'>" + verb + "</a> ",
            verbicon: verbicon,
            directobject: "<a href='#corpus/" + model.dbname + "/datum/" + model.id + "'>" + utterance + "</a> ",
            directobjecticon: "icon-list",
            indirectobject: "in <a href='#corpus/" + window.app.corpus.id + "'>" + window.app.corpus.get("title") + "</a>",
            teamOrPersonal: "personal",
            context: " via Offline App."
          });
          //            /*
          //             * If the current data list is the default
          //             * list, render the datum there since is the "Active" copy
          //             * that will eventually overwrite the default in the
          //             * corpus if the user saves the current data list
          //             */
          //            var defaultIndex = window.app.corpus.datalists.length - 1;
          //            if(window.appView.currentEditDataListView.model.id === window.app.corpus.datalists.models[defaultIndex].id){
          //              //Put it into the current data list views
          //              window.appView.currentPaginatedDataListDatumsView.collection.remove(model);//take it out of where it was,
          //              window.appView.currentPaginatedDataListDatumsView.collection.unshift(model); //and put it on the top. this is only in the default data list
          //              //Put it into the ids of the current data list
          //              var positionInCurrentDataList = window.app.get("currentDataList").get("datumIds").indexOf(model.id);
          //              if(positionInCurrentDataList !== -1){
          //                window.app.get("currentDataList").get("datumIds").splice(positionInCurrentDataList, 1);
          //              }
          //              window.app.get("currentDataList").get("datumIds").unshift(model.id);
          //              window.appView.addUnsavedDoc(window.app.get("currentDataList").id);
          //            }else{
          //              /*
          //               * Make sure the datum is at the top of the default data list which is in the corpus,
          //               * this is in case the default data list is not being displayed
          //               */
          //              var positionInDefaultDataList = window.app.corpus.datalists.models[defaultIndex].get("datumIds").indexOf(model.id);
          //              if(positionInDefaultDataList !== -1 ){
          //                //We only reorder the default data list datum to be in the order of the most recent modified, other data lists can stay in the order teh usr designed them.
          //                window.app.corpus.datalists.models[defaultIndex].get("datumIds").splice(positionInDefaultDataList, 1);
          //              }
          //              window.app.corpus.datalists.models[defaultIndex].get("datumIds").unshift(model.id);
          //              window.app.corpus.datalists.models[defaultIndex].needsSave  = true;
          //              window.appView.addUnsavedDoc(window.app.corpus.id);
          //            }
          /*
           * Also, see if this datum matches the search datalist, and add it to the top of the search list
           */
          if ($("#search_box").val() !== "") {
            //TODO check this
            var datumJson = model.fields.toJSON();
            var datumAsDBResponseRow = {};
            for (var x in datumJson) {
              datumAsDBResponseRow[datumJson[x].label] = datumJson[x].mask;
            }
            var queryTokens = self.processQueryString($("#search_box").val());
            var thisDatumIsIn = self.matchesSingleCriteria(datumAsDBResponseRow, queryTokens[0]);

            for (var j = 1; j < queryTokens.length; j += 2) {
              if (queryTokens[j] === "AND") {
                // Short circuit: if it's already false then it continues to be false
                if (!thisDatumIsIn) {
                  break;
                }

                // Do an intersection
                thisDatumIsIn = thisDatumIsIn && model.matchesSingleCriteria(datumAsDBResponseRow, queryTokens[j + 1]);
              } else {
                // Do a union
                thisDatumIsIn = thisDatumIsIn || model.matchesSingleCriteria(datumAsDBResponseRow, queryTokens[j + 1]);
              }
            }
            if (thisDatumIsIn) {
              // Insert the datum at the top of the search datums collection view
              window.appView.searchEditView.searchPaginatedDataListDatumsView.collection.remove(model); //take it out of where it was,
              window.appView.searchEditView.searchPaginatedDataListDatumsView.collection.unshift(model);
              //Do the same to the datumids in the search data list itself
              var positioninsearchresults = window.appView.searchEditView.searchDataListView.model.get("datumIds").indexOf(model.id);
              if (positioninsearchresults !== -1) {
                window.appView.searchEditView.searchDataListView.model.get("datumIds").splice(positioninsearchresults, 1);
              }
              window.appView.searchEditView.searchDataListView.model.get("datumIds").unshift(model.id);
            }
          } //end of if search is open and running for Alan


          //dont need to save the user every time when we change a datum.
          //            window.app.get("authentication").saveAndInterConnectInApp();

          if (typeof successcallback === "function") {
            successcallback();
          }
        },
        error: function(e, f, g) {
          self.debug("Datum save error", e, f, g);
          if (typeof failurecallback === "function") {
            failurecallback();
          } else {
            self.bug("Datum save error: " + f.reason);
          }
        }
      });
    }
  },
  /**
   * Accepts two functions success will be called if sucessfull,
   * otherwise it will attempt to render the current datum views. If
   * the datum isn't in the current corpus it will call the fail
   * callback or it will alert a bug to the user. Override the fail
   * callback if you don't want the alert.
   *
   * @param successcallback
   * @param failurecallback
   * @deprecated
   */
  setAsCurrentDatum: {
    value: function() {
      this.warn("Using deprected method setAsCurrentDatum.");
      //      if( window.app.corpus.dbname !== this.dbname ){
      //        if (typeof failurecallback === "function") {
      //          failurecallback();
      //        }else{
      //          self.bug("This is a bug, cannot load the datum you asked for, it is not in this corpus.");
      //        }
      //        return;
      //      }else{
      //        if (window.appView.datumsEditView.datumsView.collection.models[0].id !== this.id ) {
      //          window.appView.datumsEditView.datumsView.prependDatum(this);
      //          //TODO might not need to do it on the Read one since it is the same model?
      //        }
      //        if (typeof successcallback === "function") {
      //          successcallback();
      //        }
      //      }
    }
  },

  /* highlight returns text with all instances of stringToHighlight enclosed
   * in a span.  Note that stringToHighlight is treated as a regexp.
   */
  highlight: {
    value: function(text, stringToHighlight, className) {
      className = className || "highlight";
      var re = new RegExp("(" + stringToHighlight + ")", "gi");
      return text.replace(re, "<span class='" + className + "'>$1</span>");
    }
  },

  toJSON: {
    value: function(includeEvenEmptyAttributes, removeEmptyAttributes) {
      this.debug("Customizing toJSON ", includeEvenEmptyAttributes, removeEmptyAttributes);

      var json = FieldDBObject.prototype.toJSON.apply(this, arguments);
      if (!json) {
        this.warn("Not returning json right now.");
        return;
      }

      this.debug("saving fields as the deprecated datumFields");
      json.datumFields = json.fields;
      delete json.fields;

      this.debug(json);
      return json;
    }
  }

});
exports.Datum = Datum;
