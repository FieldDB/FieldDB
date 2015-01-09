var Confidential = require("./../confidentiality_encryption/Confidential").Confidential;
var Database = require("./Database").Database;
var DatumFields = require("./../datum/DatumFields").DatumFields;
var DatumStates = require("./../datum/DatumStates").DatumStates;
var DatumTags = require("./../datum/DatumTags").DatumTags;
var Comments = require("./../comment/Comments").Comments;
var FieldDBObject = require("./../FieldDBObject").FieldDBObject;
var Sessions = require("./../Collection").Collection;
var DataLists = require("./../Collection").Collection;
var TeamPreference = require("./../user/UserPreference").UserPreference;


var DEFAULT_CORPUS_MODEL = require("./corpus.json");
/**
 * @class The CorpusMask is saved as corpus in the Couch repository,
 *        it is the publicly visible version of a corpus. By default it just says "This
 *        corpus is private," when users decide to make some aspects of their corpsu
 *        public they can customize the fields in their "corpus" object to display
 *        only certain sorts of data, even though the corpus is publicly discoverable.
 *
 * @property {String} title This is the title of the corpus, as set by the corpus
 *           team. It can contain any UTF-8 character.
 * @property {String} titleAsUrl This is what appears in the url on the main website.
 *           It is based on the title of the corpus and can be changed and looks
 *           nicer than the dbname which cannot be changed. eg
 *           http://fieldlinguist.com/LingLlama/SampleFieldLinguisticsCorpus
 * @property {String} description This is a short description that
 *           appears on the corpus details page
 * @property {Object} termsOfUse Terms of use set by the corpus team, includes
 *           a field for humanReadable terms which are displayed on the corpus
 *           and included in corpus exports.
 * @property {Object} license License set by the corpus team, includes a field
 *           for humanReadable terms which are displayed on the corpus and
 *           included in corpus exports, as well as a link to the license, imageUrl
 *           for the image/logo of the license for easy recognition and
 *           title of the license.
 * @property {Object} copyright Who owns the copyright to the corpus,
 *           by default it is set to the corpus team"s name but teams can customize
 *           it for example to make the corpus copyright of the language community
 *           or speakers who contributed to the corpus.
 * @property {Object} location GPS location of the corpus (longitude, latitude and accuracy)
 *           The corpus can be plotted on a map using the accuracy as a radius
 *           of roughly where the data is from.
 * @property {String} remote The url of the remote eg:
 *           git@fieldlinguist.com:LingLlama/SampleFieldLinguisticsCorpus.git
 * @property {Array} couchConnections The url of couch remote(s) where the
 *           corpus is replicated or backed up.
 * @property {Array} olacConnections The url of OLAC remote(s) where the corpus
 *           is archived or published.
 *
 * @property {Array} members Collection of public browsable/search engine
 *           discoverable members associated to the corpus
 * @property {Array} datumstates Collection of datum states for which data are
 *           will be public browsable/search engine discoverable in the corpus. This
 *           can be used to only show polished data or "checked" data on the public
 *           page for example.
 * @property {Array} datumfields Collection of datum fields which will be
 *           public browsable/search engine discoverable  on public datum in the corpus
 * @property {Array} sessions Collection of public browsable/search engine
 *           discoverable sessions that belong to the corpus
 * @property {Array} datalists Collection of public browsable/search engine
 *           discoverable data lists created under the corpus
 *
 * @extends Database
 * @tutorial tests/CorpusMaskTest.js
 */
var CorpusMask = function CorpusMask(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "CorpusMask";
  }
  this.debug(options);
  Database.apply(this, arguments);
};

CorpusMask.prototype = Object.create(Database.prototype, /** @lends CorpusMask.prototype */ {
  constructor: {
    value: CorpusMask
  },

  id: {
    get: function() {
      return "corpus";
    },
    set: function(value) {
      if (value === this._id) {
        return;
      }
      this.warn("CorpusMask id cannot be set, it is \"corpus\" by default." + value);
      value = "corpus";
      this._id = value;
    }
  },

  api: {
    value: "corpora"
  },

  defaults: {
    get: function() {
      var filteredCorpus = JSON.parse(JSON.stringify(DEFAULT_CORPUS_MODEL));
      filteredCorpus.title = "Private Corpus";
      filteredCorpus.description = "The details of this corpus are not public.";
      filteredCorpus.location = {
        latitude: 0,
        longitude: 0,
        accuracy: 0
      };

      var publicStates = [];
      filteredCorpus.validationStati.map(function(state) {
        if (state.validationStatus === "Checked*") {
          publicStates.push(state);
        } else if (state.validationStatus === "Published*") {
          publicStates.push(state);
        } else if (state.validationStatus === "ApprovedLanguageLearningContent*") {
          publicStates.push(state);
        }
      });
      filteredCorpus.validationStati = publicStates;

      var publicableTags = [];
      filteredCorpus.tags.map(function() {
        // none
      });
      filteredCorpus.tags = publicableTags;

      var publicableDatumFields = [];
      filteredCorpus.datumFields.map(function(field) {
        if (field.id === "judgement") {
          publicableDatumFields.push(field);
        } else if (field.id === "orthography") {
          publicableDatumFields.push(field);
        } else if (field.id === "utterance") {
          publicableDatumFields.push(field);
        } else if (field.id === "morphemes") {
          publicableDatumFields.push(field);
        } else if (field.id === "gloss") {
          publicableDatumFields.push(field);
        } else if (field.id === "translation") {
          publicableDatumFields.push(field);
        }
      });
      filteredCorpus.datumFields = publicableDatumFields;

      var publicableSessionFields = [];
      filteredCorpus.sessionFields.map(function(field) {
        if (field.id === "dialect") {
          publicableSessionFields.push(field);
        } else if (field.id === "register") {
          publicableSessionFields.push(field);
        } else if (field.id === "language") {
          publicableSessionFields.push(field);
        } else if (field.id === "location") {
          publicableSessionFields.push(field);
        }
      });
      filteredCorpus.sessionFields = publicableSessionFields;

      var publicableSpeakerFields = [];
      filteredCorpus.speakerFields.map(function(field) {
        if (field.id === "anonymousCode") {
          publicableSpeakerFields.push(field);
        }
      });
      filteredCorpus.speakerFields = publicableSpeakerFields;


      return filteredCorpus;
    }
  },

  INTERNAL_MODELS: {
    value: {
      _id: FieldDBObject.DEFAULT_STRING,
      _rev: FieldDBObject.DEFAULT_STRING,
      dbname: FieldDBObject.DEFAULT_STRING,
      version: FieldDBObject.DEFAULT_STRING,
      dateCreated: FieldDBObject.DEFAULT_DATE,
      dateModified: FieldDBObject.DEFAULT_DATE,
      comments: Comments,
      sessions: Sessions,
      datalists: DataLists,

      title: FieldDBObject.DEFAULT_STRING,
      titleAsUrl: FieldDBObject.DEFAULT_STRING,
      description: FieldDBObject.DEFAULT_STRING,
      termsOfUse: FieldDBObject.DEFAULT_OBJECT,
      license: FieldDBObject.DEFAULT_OBJECT,
      copyright: FieldDBObject.DEFAULT_STRING,
      replicatedCorpusUrls: FieldDBObject.DEFAULT_ARRAY,
      olacExportConnections: FieldDBObject.DEFAULT_ARRAY,
      publicCorpus: FieldDBObject.DEFAULT_STRING,
      confidential: Confidential,

      validationStati: DatumStates,
      tags: DatumTags,

      datumFields: DatumFields,
      speakerFields: DatumFields,
      participantFields: DatumFields,
      conversationFields: DatumFields,
      sessionFields: DatumFields,

      prefs: TeamPreference
    }
  },

  titleAsUrl: {
    get: function() {
      if (!this._titleAsUrl && this.title) {
        this._titleAsUrl = this.sanitizeStringForFileSystem(this._title, "_").toLowerCase();
      }
      return this._titleAsUrl;
    },
    set: function(value) {
      if (value === this._titleAsUrl) {
        return;
      }
      // If an app is explicity trying to overwrite a titleAsUrl, complain.
      if (this._titleAsUrl) {
        this.warn("titleAsUrl cannot be set directly, setting the title will cause it to be set.");
      }
    }
  },

  title: {
    get: function() {
      return this._title || FieldDBObject.DEFAULT_STRING;
    },
    set: function(value) {
      if (value === this._title) {
        return;
      }
      if (!value) {
        delete this._title;
        return;
      }
      this._title = value.trim();
      this._titleAsUrl = this.sanitizeStringForFileSystem(this._title, "_").toLowerCase(); //this makes the accented char unnecessarily unreadable: encodeURIComponent(attributes.title.replace(/ /g,"_"));
    }
  },

  description: {
    get: function() {
      return this._description || FieldDBObject.DEFAULT_STRING;
    },
    set: function(value) {
      if (value === this._description) {
        return;
      }
      if (!value) {
        delete this._description;
        return;
      }
      this._description = value.trim();
    }
  },

  prefs: {
    get: function() {
      return this._prefs;
    },
    set: function(value) {
      if (value === this._prefs) {
        return;
      }
      if (!value) {
        delete this._prefs;
        return;
      } else {
        if (Object.prototype.toString.call(value) === "[object Object]") {
          value = new this.INTERNAL_MODELS["prefs"](value);
        }
      }
      this._prefs = value;
    }
  },

  preferredDatumTemplate: {
    get: function() {
      if (this.prefs && this.prefs.preferredDatumTemplate) {
        var upgradeSucess = this.upgradeCorpusFieldsToMatchDatumTemplate(this.prefs.preferredDatumTemplate);
        if (!upgradeSucess) {
          return this.prefs.preferredDatumTemplate;
        } else {
          this.warn("preferredDatumTemplate is no longer needed");
        }
      }
    },
    set: function(value) {
      if (this.prefs && this.prefs.preferredDatumTemplate && value === this.prefs.preferredDatumTemplate) {
        return;
      }
      if (!value || value === "default") {
        if (this.prefs && this.prefs.preferredDatumTemplate) {
          delete this.prefs.preferredDatumTemplate;
        }
        return;
      }
      this.prefs = this.prefs || new this.INTERNAL_MODELS["prefs"]();
      var upgradeSucess = this.upgradeCorpusFieldsToMatchDatumTemplate(value.trim());
      if (!upgradeSucess) {
        this.prefs.preferredDatumTemplate = value.trim();
      } else {
        this.warn("preferredDatumTemplate is no longer needed");
      }
    }
  },

  upgradeCorpusFieldsToMatchDatumTemplate: {
    value: function(value) {
      if (this.preferredDatumTemplateAtVersion) {
        return true;
      }
      if (!this.datumFields.reorder) {
        this.warn("could not upgrade corpus fields order to match data entry template for the spreadsheet app ");
        return false;
      }
      this.preferredDatumTemplateAtVersion = this.version;
      this.preferredDatumTemplate = null;

      var order = ["judgement", "utterance", "morphemes", "gloss", "translation", "validationStatus", "tags"];
      if (value === "compacttemplate") {
        order = ["judgement", "utterance", "morphemes", "gloss", "translation"];

      } else if (value === "fulltemplate") {
        order = ["judgement", "utterance", "morphemes", "gloss", "translation", "validationStatus", "tags"];

      } else if (value === "mcgillfieldmethodsspring2014template") {
        order = ["judgement", "utterance", "morphemes", "gloss", "translation", "validationStatus", "tags"];

      } else if (value === "mcgillfieldmethodsfall2014template") {
        order = ["judgement", "utterance", "morphemes", "gloss", "translation", "phonetic", "notes"];

      } else if (value === "yalefieldmethodsspring2014template") {
        order = ["judgement", "orthography", "utterance", "morphemes", "gloss", "translation", "spanish", "Housekeeping", "tags"];
        this.prefs.fullTemplateDefaultNumberOfFieldsPerColumn = 4;
      }


      var fieldTemplate = {
        "id": "",
        "label": "",
        "shouldBeEncrypted": false,
        "showToUserTypes": "all",
        "defaultfield": false,
        "value": "",
        "mask": "",
        "json": {},
        "help": "You can add help/conventions here which explain what this data entry field is for your teammates."
      };
      for (var expectedPosition in order) {
        var currentPosition = this.datumFields.indexOf(order[expectedPosition]);
        if (currentPosition === -1) {
          var newField = JSON.parse(JSON.stringify(fieldTemplate));
          newField.id = order[expectedPosition];
          // newField.label = order[expectedPosition];
          this.datumFields.push(newField);
          currentPosition = this.datumFields.length - 1;
        }
        if (currentPosition === expectedPosition) {
          this.debug(order[expectedPosition] + " Field was in the correct order. ");
        } else {
          this.debug(currentPosition + " moving to" + expectedPosition);

          this.datumFields.reorder(currentPosition, expectedPosition);
        }
      }
      var resultingOrder = this.datumFields.map(function(field) {
        return field.id;
      });
      this.warn("reordered fields to " + resultingOrder);

      return true;
    }
  },

  preferredLocale: {
    get: function() {
      if (this.prefs && this.prefs.preferredLocale) {
        return this.prefs.preferredLocale;
      }
    },
    set: function(value) {
      if (this.prefs && this.prefs.preferredLocale && value === this.prefs.preferredLocale) {
        return;
      }
      if (!value || value === "default") {
        if (this.prefs && this.prefs.preferredLocale) {
          delete this.prefs.preferredLocale;
        }
        return;
      }
      this.prefs = this.prefs || new this.INTERNAL_MODELS["prefs"]();
      this.prefs.preferredLocale = value.trim();
    }
  },

  preferredDashboardLayout: {
    get: function() {
      if (this.prefs && this.prefs.preferredDashboardLayout) {
        return this.prefs.preferredDashboardLayout;
      }
    },
    set: function(value) {
      if (this.prefs && this.prefs.preferredDashboardLayout && value === this.prefs.preferredDashboardLayout) {
        return;
      }
      if (!value || value === "default") {
        if (this.prefs && this.prefs.preferredDashboardLayout) {
          delete this.prefs.preferredDashboardLayout;
        }
        return;
      }
      this.prefs = this.prefs || new this.INTERNAL_MODELS["prefs"]();
      this.prefs.preferredDashboardLayout = value.trim();
    }
  },

  preferredTemplate: {
    get: function() {
      this.warn("preferredTemplate is deprecated, use preferredDatumTemplate instead.");
      return this.preferredDatumTemplate;
    },
    set: function(value) {
      this.warn("preferredTemplate is deprecated, please use preferredDatumTemplate instead.");
      this.preferredDatumTemplate = value;
    }
  }

});
exports.CorpusMask = CorpusMask;
