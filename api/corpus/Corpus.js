/* global window, OPrime */
var Confidential = require("./../confidentiality_encryption/Confidential").Confidential;
var CorpusMask = require("./CorpusMask").CorpusMask;
var LanguageDatum = require("./../datum/LanguageDatum").LanguageDatum;
var DatumField = require("./../datum/DatumField").DatumField;
var DatumFields = require("./../datum/DatumFields").DatumFields;
var Session = require("./../datum/Session").Session;
var Speaker = require("./../user/Speaker").Speaker;
var FieldDBObject = require("./../FieldDBObject").FieldDBObject;
var Q = require("q");

var DEFAULT_CORPUS_MODEL = require("./corpus.json");
var DEFAULT_PSYCHOLINGUISTICS_CORPUS_MODEL = require("./psycholinguistics-corpus.json");

/**
 * @class A corpus is like a git repository, it has a remote, a title
 *        a description and perhaps a readme When the user hits sync
 *        their "branch" of the corpus will be pushed to the central
 *        remote, and we will show them a "diff" of what has
 *        changed.
 *
 * The Corpus may or may not be a git repository, so this class is
 * to abstract the functions we would expect the corpus to have,
 * regardless of how it is really stored on the disk.
 *
 *
 * @property {String} title This is used to refer to the corpus, and
 *           what appears in the url on the main website eg
 *           http://fieldlinguist.com/LingLlama/SampleFieldLinguisticsCorpus
 * @property {String} description This is a short description that
 *           appears on the corpus details page
 * @property {String} remote The git url of the remote eg:
 *           git@fieldlinguist.com:LingLlama/SampleFieldLinguisticsCorpus.git
 *
 * @property {Consultants} consultants Collection of consultants who contributed to the corpus
 * @property {DatumStates} datumstates Collection of datum states used to describe the state of datums in the corpus
 * @property {DatumFields} datumFields Collection of datum fields used in the corpus
 * @property {ConversationFields} conversationfields Collection of conversation-based datum fields used in the corpus
 * @property {Sessions} sessions Collection of sessions that belong to the corpus
 * @property {DataLists} datalists Collection of data lists created under the corpus
 * @property {Permissions} permissions Collection of permissions groups associated to the corpus
 *
 *
 * @property {Glosser} glosser The glosser listens to
 *           orthography/utterence lines and attempts to guess the
 *           gloss.
 * @property {Lexicon} lexicon The lexicon is a list of morphemes,
 *           allomorphs and glosses which are used to index datum, and
 *           also to gloss datum.
 *
 * @description The initialize function probably checks to see if
 *              the corpus is new or existing and brings it down to
 *              the user's client.
 *
 * @extends CorpusMask
 * @tutorial tests/corpus/CorpusTest.js
 */

var Corpus = function Corpus(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "Corpus";
  }
  this.debug("Constructing corpus", options);
  CorpusMask.apply(this, arguments);
};
Corpus.DEFAULT_DATUM = LanguageDatum;

Corpus.prototype = Object.create(CorpusMask.prototype, /** @lends Corpus.prototype */ {
  constructor: {
    value: Corpus
  },

  /**
   *  Must customize id to the original method since CorpusMask overrides it with "corpus"
   */
  id: {
    get: function() {
      return this._id || FieldDBObject.DEFAULT_STRING;
    },
    set: function(value) {
      if (value === this._id) {
        return;
      }
      if (!value) {
        delete this._id;
        return;
      }
      if (value.trim) {
        value = value.trim();
      }
      this._id = value;
    }
  },

  dateOfLastDatumModifiedToCheckForOldSession: {
    get: function() {
      var timestamp = 0;
      if (this.sessions && this.sessions.length > 0) {
        var mostRecentSession = this.sessions[this.sessions.length - 1];
        if (mostRecentSession.dateModified) {
          timestamp = mostRecentSession.dateModified;
        }
      }
      return new Date(timestamp);
    },
    set: function() {}
  },

  confidential: {
    get: function() {
      return this._confidential || FieldDBObject.DEFAULT_OBJECT;
    },
    set: function(value) {
      this.ensureSetViaAppropriateType("confidential", value);
      return this._confidential;
    }
  },

  publicCorpus: {
    get: function() {
      return this._publicCorpus || FieldDBObject.DEFAULT_STRING;
    },
    set: function(value) {
      if (value === this._publicCorpus) {
        return;
      }
      if (!value || (value !== "Public" && value !== "Private")) {
        this.warn("Corpora can be either Public or Private, if you make your corpus Public you can customize which fields are visible to public visitors.");
        value = "Private";
      }
      this._publicCorpus = value;
    }
  },

  /**
   * TODO decide if we want to fetch these from the server, and keep a fossil in the object?
   * @type {Object}
   */
  corpusMask: {
    get: function() {
      if (!this._corpusMask) {
        this.corpusMask = {
          "id": "corpus"
        };
        // this.corpusMask.fetch();
      }
      return this._corpusMask;
    },
    set: function(value) {
      this.ensureSetViaAppropriateType("corpusMask", value);
    }
  },

  corpus: {
    get: function() {
      return this;
    },
    set: function() {
      // do nothing
    }
  },

  publicSelf: {
    get: function() {
      console.error("publicSelf is deprecated, use corpusMask instead");
      return this.corpusMask;
    },
    set: function(value) {
      // console.error("publicSelf is deprecated, use corpusMask instead");
      this.corpusMask = value;
    }
  },

  validationStati: {
    get: function() {
      return this._validationStati || FieldDBObject.DEFAULT_COLLECTION;
    },
    set: function(value) {
      this.ensureSetViaAppropriateType("validationStati", value);
    }
  },

  tags: {
    get: function() {
      return this._tags || FieldDBObject.DEFAULT_COLLECTION;
    },
    set: function(value) {
      this.ensureSetViaAppropriateType("tags", value);
    }
  },

  fetch: {
    value: function(optionalUrl) {
      if (!this.id && this.dbname) {
        return this.loadCorpusByDBname(this.dbname);
      } else {
        if (optionalUrl) {
          this.warn("Using a custom url to fetch this Corpus." + optionalUrl);
        }
        return FieldDBObject.prototype.fetch.apply(this, arguments);
      }
    }
  },

  loadCorpusByDBname: {
    value: function(dbname) {
      if (!dbname) {
        throw new Error("Cannot load corpus, its dbname was undefined");
      }
      var deferred = this.loadCorpusByDBnameDeferred || Q.defer(),
        self = this;

      dbname = dbname.trim();

      this.dbname = dbname;
      this.loading = true;

      // this.debugMode = true;
      Q.nextTick(function() {

        var tryAgainInCaseThereWasALag = function(reason) {
          self.debug(reason);
          if (self.runningloadCorpusByDBname) {
            self.warn("Error finding a corpus in " + self.dbname + " database. This database will not function normally. Please report this.");
            self.bug("Error finding corpus details in " + self.dbname + " database. This database will not function normally. Please report this.");
            deferred.reject(reason);
            return;
          }
          self.runningloadCorpusByDBname = true;
          self.loadCorpusByDBnameDeferred = deferred;
          self.debug("Wating 1000ms to try to load again.");
          setTimeout(function() {
            self.loadCorpusByDBname(dbname);
          }, 1000);
        };

        self.fetchCollection(self.api).then(function(corpora) {
          self.debug(corpora);

          var corpusAsSelf = function(corpusid) {
            self.runningloadCorpusByDBname = false;
            delete self.loadCorpusByDBnameDeferred;
            self.id = corpusid;
            self.fetch().then(function(result) {
              self.debug("Finished fetch of corpus ", result);
              self.loading = false;
              deferred.resolve(result);
            }, function(reason) {
              self.loading = false;
              deferred.reject(reason);
            }).fail(function(error) {
              console.error(error.stack, self);
              deferred.reject(error);
            });
          };

          if (corpora.length === 1) {
            corpusAsSelf(corpora[0]._id);
          } else if (corpora.length > 1) {
            self.warn("Impossible to have more than one corpus for this dbname, marking irrelevant corpora as trashed");
            corpora.map(function(row) {
              if (row.value.dbname === self.dbname || row.value.pouchname === self.dbname) {
                corpusAsSelf(row.value._id);
              } else {
                self.warn("There were multiple corpora details in this database, it is probaly one of the old offline databases prior to v1.30 or the result of merged corpora. This is not really a problem, the correct details will be used, and this corpus details will be marked as deleted. " + row.value);
                row.value.trashed = "deleted";
                self.set(row.value).then(function(result) {
                  self.debug("flag as deleted succedded", result);
                }, function(reason) {
                  self.warn("flag as deleted failed", reason, row.value);
                }).fail(function(error) {
                  console.error(error.stack, self);
                  deferred.reject(error);
                });
              }
            });
          } else {
            tryAgainInCaseThereWasALag(corpora);
          }
        }, function(reason) {
          self.debug(JSON.stringify(reason));
          if (reason && reason.userFriendlyErrors && reason.userFriendlyErrors[0].indexOf("device will be unable to contact") > -1) {
            deferred.reject(reason);
          } else {
            tryAgainInCaseThereWasALag(reason);
          }

        });

      });

      return deferred.promise;
    }
  },

  fetchMask: {
    value: function() {
      this.todo("test fetchMask");
      if (!this.dbname) {
        throw new Error("Cannot load corpus's public self, its dbname was undefined");
      }
      var deferred = Q.defer(),
        self = this;

      Q.nextTick(function() {

        if (self.corpusMask && self.corpusMask.rev) {
          deferred.resolve(self.corpusMask);
          return;
        }

        self.corpusMask = new CorpusMask({
          dbname: self.dbname
        });

        self.corpusMask.fetch()
          .then(deferred.resolve, deferred.reject)
          .fail(function(error) {
            console.error(error.stack, self);
            deferred.reject(error);
          });

      });
      return deferred.promise;
    }
  },

  /**
   * backbone-couchdb adaptor set up
   */

  // The couchdb-connector is capable of mapping the url scheme
  // proposed by the authors of Backbone to documents in your database,
  // so that you don't have to change existing apps when you switch the sync-strategy
  api: {
    value: "private_corpora"
  },

  defaults: {
    get: function() {
      var corpusTemplate = JSON.parse(JSON.stringify(DEFAULT_CORPUS_MODEL));
      corpusTemplate.confidential.secretkey = FieldDBObject.uuidGenerator();
      return corpusTemplate;
    },
    set: function() {}
  },

  defaults_psycholinguistics: {
    get: function() {
      var doc = this.defaults;

      if (DEFAULT_PSYCHOLINGUISTICS_CORPUS_MODEL) {
        for (var property in DEFAULT_PSYCHOLINGUISTICS_CORPUS_MODEL) {
          if (DEFAULT_PSYCHOLINGUISTICS_CORPUS_MODEL.hasOwnProperty(property)) {
            doc[property] = DEFAULT_PSYCHOLINGUISTICS_CORPUS_MODEL[property];
          }
        }
        doc.participantFields = this.defaults.speakerFields.concat(doc.participantFields);
      }

      return JSON.parse(JSON.stringify(doc));
    },
    set: function() {}
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
      OPrime.bug("Sorry deleting corpora is not available right now. Too risky... ");
      if (true) {
        return;
      }
      /* TODO contact server to delte the corpus, if the success comes back, then do this */
      this.trashed = "deleted" + Date.now();
      this.save();
    }
  },

  /**
   *  This the function called by the add button, it adds a new comment state both to the collection and the model
   * @type {Object}
   */
  newComment: {
    value: function(commentstring) {
      var m = {
        "text": commentstring,
      };

      this.comments.add(m);
      this.unsavedChanges = true;

      window.app.addActivity({
        verb: "commented",
        verbicon: "icon-comment",
        directobjecticon: "",
        directobject: "'" + commentstring + "'",
        indirectobject: "on <i class='icon-cloud'></i><a href='#corpus/" + this.id + "'>this corpus</a>",
        teamOrPersonal: "team",
        context: " via Offline App."
      });

      window.app.addActivity({
        verb: "commented",
        verbicon: "icon-comment",
        directobjecticon: "",
        directobject: "'" + commentstring + "'",
        indirectobject: "on <i class='icon-cloud'></i><a href='#corpus/" + this.id + "'>" + this.get("title") + "</a>",
        teamOrPersonal: "personal",
        context: " via Offline App."
      });

      return m;
    }
  },

  currentSession: {
    get: function() {
      return this._currentSession;
    },
    set: function(value) {
      this._currentSession = value;
    }
  },

  /**
   * Builds a new session in this corpus, copying the current session's fields (if available) or the corpus' session fields.
   * @return {Session} a new session for this corpus
   */
  newSession: {
    value: function(options) {
      var sessionFields;
      if (this.currentSession && this.currentSession.sessionFields) {
        sessionFields = this.currentSession.sessionFields.clone();
      } else {
        sessionFields = this.sessionFields.clone();
      }
      var session = new Session({
        dbname: this.dbname,
        fields: sessionFields,
        confidential: this.confidential,
        // url: this.url
      });

      for (var field in options) {
        if (!options.hasOwnProperty(field)) {
          continue;
        }
        if (session.fields[field]) {
          this.debug("  this option appears to be a sessionField " + field);
          session.fields[field].value = options[field];
        } else {
          session[field] = options[field];
        }
      }

      return session;
    }
  },

  newDoc: {
    value: function(options) {
      return this.newDatum(options);
    }
  },

  newDatum: {
    value: function(options) {
      this.debug("Creating a datum for this corpus");
      if (!this.datumFields || !this.datumFields.clone) {
        throw new Error("This corpus has no default datum fields... It is unable to create a datum.");
      }
      var datum;
      if (options instanceof Corpus.DEFAULT_DATUM) {
        datum = options;
        datum.dbname = this.dbname;
        datum.confidential = this.confidential;
        datum = this.updateDatumToCorpusFields(datum);
      } else {
        datum = new Corpus.DEFAULT_DATUM({
          fields: new DatumFields(this.datumFields.cloneStructure()),
          dbname: this.dbname,
          confidential: this.confidential
        });
      }
      for (var field in options) {
        if (!options.hasOwnProperty(field)) {
          continue;
        }
        if (datum.fields[field]) {
          this.debug("  this option appears to be a datumField " + field);
          datum.fields[field].value = options[field];
        } else {
          datum[field] = options[field];
        }
      }
      datum.fossil = datum.toJSON();
      return datum;
    }
  },

  newDatumAsync: {
    value: function(options) {
      var deferred = Q.defer(),
        self = this;

      Q.nextTick(function() {
        var datum = self.newDatum(options);
        deferred.resolve(datum);
        return datum;
      });
      return deferred.promise;
    }
  },

  newField: {
    value: function(field) {
      field = field || {};

      if (!(field instanceof DatumField)) {
        field = new DatumField(field);
      }
      return field;
    }
  },

  addDatumField: {
    value: function(field) {
      if (!field.id && field.label) {
        field.id = field.label;
      }
      if (!(field instanceof DatumField)) {
        field = new DatumField(field);
      }
      this.datumFields.add(field);
    }
  },

  newSpeaker: {
    value: function(options) {
      var deferred = Q.defer(),
        self = this;

      Q.nextTick(function() {

        self.debug("Creating a datum for this corpus");
        if (!self.speakerFields || !self.speakerFields.clone) {
          throw new Error("This corpus has no default datum fields... It is unable to create a datum.");
        }
        var datum = new Speaker({
          speakerFields: new DatumFields(self.speakerFields.clone()),
          confidential: self.confidential
        });
        for (var field in options) {
          if (!options.hasOwnProperty(field)) {
            continue;
          }
          if (datum.speakerFields[field]) {
            self.debug("  this option appears to be a datumField " + field);
            datum.speakerFields[field].value = options[field];
          } else {
            datum[field] = options[field];
          }
        }
        deferred.resolve(datum);
      });
      return deferred.promise;
    }
  },

  updateDatumToCorpusFields: {
    value: function(datum) {
      if (!this.datumFields) {
        return datum;
      }
      if (!datum.fields) {
        datum.fields = this.datumFields.clone();
        return datum;
      }
      datum.fields = new DatumFields().merge(this.datumFields, datum.fields);
      return datum;
    }
  },

  updateSpeakerToCorpusFields: {
    value: function(speaker) {
      if (!this.speakerFields) {
        this.speakerFields = this.defaults_psycholinguistics.speakerFields;
      }
      if (!speaker.fields) {
        speaker.fields = this.speakerFields.clone();
        return speaker;
      }
      speaker.fields = new DatumFields().merge(this.speakerFields, speaker.fields);
      return speaker;
    }
  },

  updateParticipantToCorpusFields: {
    value: function(participant) {
      if (!this.participantFields) {
        this.participantFields = this.defaults_psycholinguistics.participantFields;
      }
      if (!participant.fields) {
        participant.fields = this.participantFields.clone();
        return participant;
      }
      participant.fields = new DatumFields().merge(this.participantFields, participant.fields, "overwrite");
      return participant;
    }
  },

  /**
   * Builds a new corpus based on this one (if this is not the team's practice corpus)
   * @return {Corpus} a new corpus based on this one
   */
  newCorpus: {
    value: function(options) {
      var newCorpusJson,
        self = this;

      if (this.dbname && this.dbname.indexOf("firstcorpus") > -1) {
        newCorpusJson = new Corpus(Corpus.prototype.defaults);
      } else {
        newCorpusJson = this.clone();

        newCorpusJson.comments = [];
        newCorpusJson.confidential = new Confidential().fillWithDefaults().toJSON();

        var fieldsToClear = ["datumFields", "sessionFields", "conversationFields", "participantFields", "speakerFields", "fields"];
        //clear out search terms from the new corpus's datum fields
        var defaults = this.defaults;
        fieldsToClear.map(function(fieldsType) {
          if (self[fieldsType]) {
            self.debug("Cloning structure only of fieldsType: ", fieldsType);
            newCorpusJson[fieldsType] = self[fieldsType].cloneStructure();
          } else {
            self.debug("fieldsType " + fieldsType + " was missing on this corpus, it's copy will have the fields. ", self);
            newCorpusJson[fieldsType] = defaults[fieldsType];
          }
        });

        newCorpusJson = new Corpus(newCorpusJson);
        if (this.dbname) {
          newCorpusJson.dbname = this.dbname + "copy";
        }
        newCorpusJson.title = newCorpusJson.title + " copy";
        newCorpusJson.titleAsUrl = newCorpusJson.titleAsUrl + "Copy";
        newCorpusJson.description = "Copy of: " + newCorpusJson.description;
      }

      for (var aproperty in options) {
        if (options.hasOwnProperty(aproperty)) {
          newCorpusJson[aproperty] = options[aproperty];
        }
      }

      return newCorpusJson;
    }
  },

  cloneStructure: {
    value: function() {
      return this.newCorpus();
    }
  },

  /**
   * DO NOT store in attributes when saving to pouch (too big)
   * @type {FieldDBGlosser}
   */
  glosser: {
    get: function() {
      return this.glosserExternalObject;
    },
    set: function(value) {
      if (value === this.glosserExternalObject) {
        return;
      }
      this.glosserExternalObject = value;
    }
  },

  lexicon: {
    get: function() {
      return this.lexiconExternalObject;
    },
    set: function(value) {
      if (value === this.lexiconExternalObject) {
        return;
      }
      this.lexiconExternalObject = value;
    }
  },

  find: {
    value: function(uri) {
      var deferred = Q.defer();

      if (!uri) {
        throw new Error("Uri must be specified ");
      }

      Q.nextTick(function() {
        deferred.resolve([]); /* TODO try fetching this uri */
      });

      return deferred.promise;
    }
  },

  /**
   *  This function looks for the field's details from the corpus fields, if it exists it returns that field template.
   *
   * If the field isnt in the corpus' fields exactly, it looks for fields which this field should map to (eg, if the field is codepermanent it can be mapped to anonymouscode)
   * @param  {String/Object} field A datumField to look for, or the label/id of a datum field to look for.
   * @return {DatumField}       A datum field with details filled in from the corresponding field in the corpus, or from a template.
   */
  normalizeFieldWithExistingCorpusFields: {
    value: function(field, optionalAllFields) {
      if (field && typeof field.trim === "function") {
        field = field.trim();
      }
      if (field === undefined || field === null || field === "") {
        return;
      }
      if (typeof field !== "object") {
        field = {
          id: field
        };
      }
      var incomingFieldIdOrLabel = field.id || field.label;
      // incomingFieldIdOrLabel = incomingFieldIdOrLabel + "";
      if (incomingFieldIdOrLabel === undefined || incomingFieldIdOrLabel === null || incomingFieldIdOrLabel === "") {
        return;
      }
      // this.debugMode = true;
      // this.debug("Normalizing " + incomingFieldIdOrLabel + " if it is known to this corpus.");
      var fuzzyLabel = incomingFieldIdOrLabel.toLowerCase().replace(/[^a-z]/g, "");
      if (!optionalAllFields) {
        optionalAllFields = new DatumFields();
        if (this.datumFields && this.datumFields.length > 0) {
          optionalAllFields.add(this.datumFields.toJSON());
        } else {
          optionalAllFields.add(DEFAULT_CORPUS_MODEL.datumFields);
        }
        if (this.participantFields && this.participantFields.length > 0 && this.participantFields.toJSON) {
          optionalAllFields.add(this.participantFields.toJSON());
        } else {
          optionalAllFields.add(DEFAULT_PSYCHOLINGUISTICS_CORPUS_MODEL.participantFields);
        }
        if (this.speakerFields && this.speakerFields.length > 0 && this.speakerFields.toJSON) {
          optionalAllFields.add(this.speakerFields.toJSON());
        } else {
          optionalAllFields.add(DEFAULT_CORPUS_MODEL.speakerFields);
        }
        if (this.conversationFields && this.conversationFields.length > 0 && this.conversationFields.toJSON) {
          optionalAllFields.add(this.conversationFields.toJSON());
        } else {
          optionalAllFields.add(DEFAULT_CORPUS_MODEL.conversationFields);
        }
        this.debug("Using a clone of the corpus fields. ", optionalAllFields);
      }
      var correspondingDatumField = optionalAllFields.find(field, null, true);
      /* if there is no corresponding field yet in the optionalAllFields, then maybe there is a field which is normalized to this label */
      if (!correspondingDatumField || correspondingDatumField.length === 0) {
        if (fuzzyLabel.indexOf("checkedwith") > -1 || fuzzyLabel.indexOf("checkedby") > -1 || fuzzyLabel.indexOf("publishedin") > -1) {
          correspondingDatumField = optionalAllFields.find("validationStatus");
          if (correspondingDatumField.length > 0) {
            this.debug("This header matches an existing corpus field. ", correspondingDatumField);
            correspondingDatumField[0].labelFieldLinguists = field.labelFieldLinguists || incomingFieldIdOrLabel;
            correspondingDatumField[0].labelExperimenters = field.labelExperimenters || incomingFieldIdOrLabel;
          }
        } else if (fuzzyLabel.indexOf("codepermanent") > -1) {
          correspondingDatumField = optionalAllFields.find("anonymouscode");
          if (correspondingDatumField.length > 0) {
            this.debug("This header matches an existing corpus field. ", correspondingDatumField);
            correspondingDatumField[0].labelFieldLinguists = field.labelFieldLinguists || incomingFieldIdOrLabel;
            correspondingDatumField[0].labelExperimenters = field.labelExperimenters || incomingFieldIdOrLabel;
          }
        } else if (fuzzyLabel.indexOf("nsection") > -1) {
          correspondingDatumField = optionalAllFields.find("courseNumber");
          if (correspondingDatumField.length > 0) {
            this.debug("This header matches an existing corpus field. ", correspondingDatumField);
            correspondingDatumField[0].labelFieldLinguists = field.labelFieldLinguists || incomingFieldIdOrLabel;
            correspondingDatumField[0].labelExperimenters = field.labelExperimenters || incomingFieldIdOrLabel;
          }
        } else if (fuzzyLabel.indexOf("prenom") > -1 || fuzzyLabel.indexOf("prnom") > -1) {
          correspondingDatumField = optionalAllFields.find("firstname");
          if (correspondingDatumField.length > 0) {
            this.debug("This header matches an existing corpus field. ", correspondingDatumField);
            correspondingDatumField[0].labelFieldLinguists = field.labelFieldLinguists || incomingFieldIdOrLabel;
            correspondingDatumField[0].labelExperimenters = field.labelExperimenters || incomingFieldIdOrLabel;
          }
        } else if (fuzzyLabel.indexOf("nomdefamille") > -1) {
          correspondingDatumField = optionalAllFields.find("lastname");
          if (correspondingDatumField.length > 0) {
            this.debug("This header matches an existing corpus field. ", correspondingDatumField);
            correspondingDatumField[0].labelFieldLinguists = field.labelFieldLinguists || incomingFieldIdOrLabel;
            correspondingDatumField[0].labelExperimenters = field.labelExperimenters || incomingFieldIdOrLabel;
          }
        } else if (fuzzyLabel.indexOf("datedenaissance") > -1) {
          correspondingDatumField = optionalAllFields.find("dateofbirth");
          if (correspondingDatumField.length > 0) {
            this.debug("This header matches an existing corpus field. ", correspondingDatumField);
            correspondingDatumField[0].labelFieldLinguists = field.labelFieldLinguists || incomingFieldIdOrLabel;
            correspondingDatumField[0].labelExperimenters = field.labelExperimenters || incomingFieldIdOrLabel;
          }
        }
      }

      /* if the field is still not defined inthe corpus, construct a blank field with this label */
      if (!correspondingDatumField || correspondingDatumField.length === 0) {
        correspondingDatumField = [new DatumField(DatumField.prototype.defaults)];
        correspondingDatumField[0].id = incomingFieldIdOrLabel;
        correspondingDatumField[0].labelFieldLinguists = incomingFieldIdOrLabel;
        // correspondingDatumField[0].notInCorpus = true;
        optionalAllFields.add(correspondingDatumField[0]);
      }
      if (correspondingDatumField && correspondingDatumField[0]) {
        correspondingDatumField = correspondingDatumField[0];
      }

      this.debug("correspondingDatumField ", correspondingDatumField);

      if (correspondingDatumField instanceof DatumField) {
        return correspondingDatumField;
      } else {
        return new DatumField(correspondingDatumField);
      }
    }
  },

  prepareANewOfflinePouch: {
    value: function() {
      throw new Error("I dont know how to prepareANewOfflinePouch");
    }
  },

  /**
   * Accepts two functions to call back when save is successful or
   * fails. If the fail callback is not overridden it will alert
   * failure to the user.
   *
   * - Adds the corpus to the corpus if it is in the right corpus, and wasn't already there
   * - Adds the corpus to the user if it wasn't already there
   * - Adds an activity to the logged in user with diff in what the user changed.
   * @return {Promise} promise for the saved corpus
   */
  saveCorpus: {
    value: function() {
      var deferred = Q.defer(),
        self = this;

      var newModel = false;
      if (!this.id) {
        self.debug("New corpus");
        newModel = true;
      } else {
        self.debug("Existing corpus");
      }
      var oldrev = this.get("_rev");

      this.timestamp = Date.now();

      self.unsavedChanges = false;
      self.save().then(function(model) {
        var title = model.title;
        var differences = "#diff/oldrev/" + oldrev + "/newrev/" + model._rev;
        var verb = "modified";
        var verbicon = "icon-pencil";
        if (newModel) {
          verb = "added";
          verbicon = "icon-plus";
        }
        var teamid = self.dbname.split("-")[0];
        window.app.addActivity({
          verb: "<a href='" + differences + "'>" + verb + "</a> ",
          verbmask: verb,
          verbicon: verbicon,
          directobject: "<a href='#corpus/" + model.id + "'>" + title + "</a>",
          directobjectmask: "a corpus",
          directobjecticon: "icon-cloud",
          indirectobject: "created by <a href='#user/" + teamid + "'>" + teamid + "</a>",
          context: " via Offline App.",
          contextmask: "",
          teamOrPersonal: "personal"
        });
        window.app.addActivity({
          verb: "<a href='" + differences + "'>" + verb + "</a> ",
          verbmask: verb,
          verbicon: verbicon,
          directobject: "<a href='#corpus/" + model.id + "'>" + title + "</a>",
          directobjectmask: "a corpus",
          directobjecticon: "icon-cloud",
          indirectobject: "created by <a href='#user/" + teamid + "'>this team</a>",
          context: " via Offline App.",
          contextmask: "",
          teamOrPersonal: "team"
        });
        deferred.resolve(self);
      }, deferred.reject).fail(
        function(error) {
          console.error(error.stack, self);
          deferred.reject(error);
        });

      return deferred.promise;
    }
  },

  /**
   * If more views are added to corpora, add them here
   * @returns {} an object containing valid map reduce functions
   * TODO: add conversation search to the get_datum_fields function
   */
  validDBQueries: {
    value: function() {
      return {
        // activities: {
        //   url: "/_design/deprecated/_view/activities",
        //   map: requireoff("./../../map_reduce_unused/views/activities/map")
        // },
        // add_synctactic_category: {
        //   url: "/_design/deprecated/_view/add_synctactic_category",
        //   map: requireoff("./../../map_reduce_unused/views/add_synctactic_category/map")
        // },
        // audioIntervals: {
        //   url: "/_design/deprecated/_view/audioIntervals",
        //   map: requireoff("./../../map_reduce_unused/views/audioIntervals/map")
        // },
        // byCollection: {
        //   url: "/_design/deprecated/_view/byCollection",
        //   map: requireoff("./../../map_reduce_unused/views/byCollection/map")
        // },
        // by_date: {
        //   url: "/_design/deprecated/_view/by_date",
        //   map: requireoff("./../../map_reduce_unused/views/by_date/map")
        // },
        // by_rhyming: {
        //   url: "/_design/deprecated/_view/by_rhyming",
        //   map: requireoff("./../../map_reduce_unused/views/by_rhyming/map"),
        //   reduce: requireoff("./../../map_reduce_unused/views/by_rhyming/reduce")
        // },
        // cleaning_example: {
        //   url: "/_design/deprecated/_view/cleaning_example",
        //   map: requireoff("./../../map_reduce_unused/views/cleaning_example/map")
        // },
        // corpora: {
        //   url: "/_design/deprecated/_view/corpora",
        //   map: requireoff("./../../map_reduce_unused/views/corpora/map")
        // },
        // datalists: {
        //   url: "/_design/deprecated/_view/datalists",
        //   map: requireoff("./../../map_reduce_unused/views/datalists/map")
        // },
        // datums: {
        //   url: "/_design/deprecated/_view/datums",
        //   map: requireoff("./../../map_reduce_unused/views/datums/map")
        // },
        // datums_by_user: {
        //   url: "/_design/deprecated/_view/datums_by_user",
        //   map: requireoff("./../../map_reduce_unused/views/datums_by_user/map"),
        //   reduce: requireoff("./../../map_reduce_unused/views/datums_by_user/reduce")
        // },
        // datums_chronological: {
        //   url: "/_design/deprecated/_view/datums_chronological",
        //   map: requireoff("./../../map_reduce_unused/views/datums_chronological/map")
        // },
        // deleted: {
        //   url: "/_design/deprecated/_view/deleted",
        //   map: requireoff("./../../map_reduce_unused/views/deleted/map")
        // },
        // export_eopas_xml: {
        //   url: "/_design/deprecated/_view/export_eopas_xml",
        //   map: requireoff("./../../map_reduce_unused/views/export_eopas_xml/map"),
        //   reduce: requireoff("./../../map_reduce_unused/views/export_eopas_xml/reduce")
        // },
        // get_corpus_datum_tags: {
        //   url: "/_design/deprecated/_view/get_corpus_datum_tags",
        //   map: requireoff("./../../map_reduce_unused/views/get_corpus_datum_tags/map"),
        //   reduce: requireoff("./../../map_reduce_unused/views/get_corpus_datum_tags/reduce")
        // },
        // get_corpus_fields: {
        //   url: "/_design/deprecated/_view/get_corpus_fields",
        //   map: requireoff("./../../map_reduce_unused/views/get_corpus_fields/map")
        // },
        // get_corpus_validationStati: {
        //   url: "/_design/deprecated/_view/get_corpus_validationStati",
        //   map: requireoff("./../../map_reduce_unused/views/get_corpus_validationStati/map"),
        //   reduce: requireoff("./../../map_reduce_unused/views/get_corpus_validationStati/reduce")
        // },
        // get_datum_fields: {
        //   url: "/_design/deprecated/_view/get_datum_fields",
        //   map: requireoff("./../../map_reduce_unused/views/get_datum_fields/map")
        // },
        // get_datums_by_session_id: {
        //   url: "/_design/deprecated/_view/get_datums_by_session_id",
        //   map: requireoff("./../../map_reduce_unused/views/get_datums_by_session_id/map")
        // },
        // get_frequent_fields: {
        //   url: "/_design/deprecated/_view/get_frequent_fields",
        //   map: requireoff("./../../map_reduce_unused/views/get_frequent_fields/map"),
        //   reduce: requireoff("./../../map_reduce_unused/views/get_frequent_fields/reduce")
        // },
        // get_search_fields_chronological: {
        //   url: "/_design/deprecated/_view/get_search_fields_chronological",
        //   map: requireoff("./../../map_reduce_unused/views/get_search_fields_chronological/map")
        // },
        // glosses_in_utterance: {
        //   url: "/_design/deprecated/_view/glosses_in_utterance",
        //   map: requireoff("./../../map_reduce_unused/views/glosses_in_utterance/map"),
        //   reduce: requireoff("./../../map_reduce_unused/views/glosses_in_utterance/reduce")
        // },
        // lexicon_create_tuples: {
        //   url: "/_design/deprecated/_view/lexicon_create_tuples",
        //   map: requireoff("./../../map_reduce_unused/views/lexicon_create_tuples/map"),
        //   reduce: requireoff("./../../map_reduce_unused/views/lexicon_create_tuples/reduce")
        // },
        // morpheme_neighbors: {
        //   url: "/_design/deprecated/_view/morpheme_neighbors",
        //   map: requireoff("./../../map_reduce_unused/views/morpheme_neighbors/map"),
        //   reduce: requireoff("./../../map_reduce_unused/views/morpheme_neighbors/reduce")
        // },
        // morphemes_in_gloss: {
        //   url: "/_design/deprecated/_view/morphemes_in_gloss",
        //   map: requireoff("./../../map_reduce_unused/views/morphemes_in_gloss/map"),
        //   reduce: requireoff("./../../map_reduce_unused/views/morphemes_in_gloss/reduce")
        // },
        // recent_comments: {
        //   url: "/_design/deprecated/_view/recent_comments",
        //   map: requireoff("./../../map_reduce_unused/views/recent_comments/map")
        // },
        // sessions: {
        //   url: "/_design/deprecated/_view/sessions",
        //   map: requireoff("./../../map_reduce_unused/views/sessions/map")
        // },
        // users: {
        //   url: "/_design/deprecated/_view/users",
        //   map: requireoff("./../../map_reduce_unused/views/users/map")
        // },
        // word_list: {
        //   url: "/_design/deprecated/_view/word_list",
        //   map: requireoff("./../../map_reduce_unused/views/word_list/map"),
        //   reduce: requireoff("./../../map_reduce_unused/views/word_list/reduce")
        // },
        // map_reduce_unused_word_list_rdf: {
        //   url: "/_design/deprecated/_view/map_reduce_unused_word_list_rdf",
        //   map: requireoff("./../../map_reduce_unused/views/word_list_rdf/map"),
        //   reduce: requireoff("./../../map_reduce_unused/views/word_list_rdf/reduce")
        // }
      };
    }
  },

  validate: {
    value: function(attrs) {
      attrs = attrs || this;
      if (attrs.publicCorpus) {
        if (attrs.publicCorpus !== "Public") {
          if (attrs.publicCorpus !== "Private") {
            return "Corpus must be either Public or Private"; //TODO test this.
          }
        }
      }
    }
  },

  /**
   * This function takes in a dbname, which could be different
   * from the current corpus in case there is a master corpus with
   * more/better monolingual data.
   *
   * @param dbname
   * @param callback
   */
  buildMorphologicalAnalyzerFromTeamServer: {
    value: function(dbname, callback) {
      if (!dbname) {
        dbname = this.dbname;
      }
      this.glosser.downloadPrecedenceRules(dbname, this.glosserURL, callback);
    }
  },
  /**
   * This function takes in a dbname, which could be different
   * from the current corpus incase there is a master corpus wiht
   * more/better monolingual data.
   *
   * @param dbname
   * @param callback
   */
  buildLexiconFromTeamServer: {
    value: function(dbname, callback) {
      if (!dbname) {
        dbname = this.dbname;
      }
      this.lexicon.buildLexiconFromCouch(dbname, callback);
    }
  },

  /**
   * This function takes in a dbname, which could be different
   * from the current corpus incase there is a master corpus wiht
   * more representative datum
   * example : https://corpusdev.example.org/lingllama-cherokee/_design/deprecated/_view/get_frequent_fields?group=true
   *
   * It takes the values stored in the corpus, if set, otherwise it will take the values from this corpus since the window was last refreshed
   *
   * If a url is passed, it contacts the server for fresh info.
   *
   * @param dbname
   * @param callback
   */
  getFrequentDatumFields: {
    value: function() {
      return this.getFrequentValues("fields", ["judgement", "utterance", "morphemes", "gloss", "translation"]);
    }
  },

  /**
   * This function takes in a dbname, which could be different
   * from the current corpus incase there is a master corpus wiht
   * more representative datum
   * example : https://corpusdev.example.org/lingllama-cherokee/_design/deprecated/_view/get_corpus_validationStati?group=true
   *
   * It takes the values stored in the corpus, if set, otherwise it will take the values from this corpus since the window was last refreshed
   *
   * If a url is passed, it contacts the server for fresh info.
   *
   * @param dbname
   * @param callback
   */
  getFrequentDatumValidationStates: {
    value: function() {
      return this.getFrequentValues("validationStatus", ["Checked", "Deleted", "ToBeCheckedByAnna", "ToBeCheckedByBill", "ToBeCheckedByClaude"]);
    }
  },

  getCorpusSpecificLocalizations: {
    value: function(optionalLocaleCode) {
      var self = this;

      if (optionalLocaleCode) {
        this.todo("Test the loading of an optionalLocaleCode");
        this.get(optionalLocaleCode + "/messages.json").then(function(locale) {
          if (!locale) {
            self.warn("the requested locale was empty.");
            return;
          }
          self.application.contextualizer.addMessagesToContextualizedStrings("null", locale);
        }, function(error) {
          self.warn("The requested locale wasn't loaded");
          self.debug("locale loading error", error);
        }).fail(function(error) {
          console.error(error.stack, self);
        });
      } else {
        this.fetchCollection("locales").then(function(locales) {
          for (var localeIndex = 0; localeIndex < locales.length; localeIndex++) {
            if (!locales[localeIndex]) {
              self.warn("the requested locale was empty.");
              continue;
            }
            self.application.contextualizer.addMessagesToContextualizedStrings(null, locales[localeIndex]);
          }
        }, function(error) {
          self.warn("The locales didn't loaded");
          self.debug("locale loading error", error);
        }).fail(function(error) {
          console.error(error.stack, self);
        });
      }

      return this;
    }
  },

  getFrequentValues: {
    value: function(fieldname, defaults) {
      var deferred = Q.defer(),
        self;

      if (!defaults) {
        defaults = self["defaultFrequentDatum" + fieldname];
      }

      /* if we have already asked the server in this page load, return */
      if (self["frequentDatum" + fieldname]) {
        Q.nextTick(function() {
          deferred.resolve(self["frequentDatum" + fieldname]);
        });
        return deferred.promise;
      }

      // var jsonUrl = self.validDBQueries["get_corpus_" + fieldname].url + "?group=true&limit=100";
      this.fetchCollection("frequentDatum" + fieldname, 0, 0, 100, true).then(function(frequentValues) {
        /*
         * TODO Hide optionally specified values
         */
        self["frequentDatum" + fieldname] = frequentValues;
        deferred.resolve(frequentValues);
      }, function(response) {
        self.debug("resolving defaults for frequentDatum" + fieldname, response);
        deferred.resolve(defaults);
      });

      return deferred.promise;
    }
  },
  /**
   * This function takes in a dbname, which could be different
   * from the current corpus incase there is a master corpus wiht
   * more representative datum
   * example : https://corpusdev.example.org/lingllama-cherokee/_design/deprecated/_view/get_corpus_validationStati?group=true
   *
   * It takes the values stored in the corpus, if set, otherwise it will take the values from this corpus since the window was last refreshed
   *
   * If a url is passed, it contacts the server for fresh info.
   *
   * @param dbname
   * @param callback
   */
  getFrequentDatumTags: {
    value: function() {
      return this.getFrequentValues("tags", ["Passive", "WH", "Indefinte", "Generic", "Agent-y", "Causative", "Pro-drop", "Ambigous"]);
    }
  },
  changeCorpusPublicPrivate: {
    value: function() {
      //      alert("TODO contact server to change the public private of the corpus");
      throw new Error(" I dont know how change this corpus' public/private setting ");
    }
  },

  toJSON: {
    value: function(includeEvenEmptyAttributes, removeEmptyAttributes) {
      this.debug("Customizing toJSON ", includeEvenEmptyAttributes, removeEmptyAttributes);
      var attributesNotToJsonify = ["gravatar", "OLAC_export_connections", "url"];
      var json = FieldDBObject.prototype.toJSON.apply(this, [includeEvenEmptyAttributes, removeEmptyAttributes, attributesNotToJsonify]);

      if (!json) {
        this.warn("Not returning json right now.");
        return;
      }
      if (this.team && typeof this.team.toJSON === "function") {
        json.team = this.team.toJSON();
      }
      if (this.confidential && typeof this.confidential.toJSON === "function") {
        json.confidential = this.confidential.toJSON();
      }
      if (this.activityConnection && typeof this.activityConnection.toJSON === "function") {
        json.activityConnection = this.activityConnection.toJSON();
      }

      this.debug(json);
      return json;
    }
  }

});

exports.Corpus = Corpus;
exports.FieldDatabase = Corpus;
