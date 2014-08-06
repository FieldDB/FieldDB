var Confidential = require("./../confidentiality_encryption/Confidential").Confidential;
var DatumFields = require('./../datum/DatumFields').DatumFields;
var FieldDBObject = require('./../FieldDBObject').FieldDBObject;
var UserMask = require('./UserMask').UserMask;

var DEFAULT_CORPUS_MODEL = require("./../corpus/corpus.json");

/**
 * @class The Speaker represents a source of data, usually a
 * language consultant who is a native speaker of the language,
 * or a psycholinguistics experiment participant.
 * Each consultant has their own I-language and/or dialects which they
 * speak (unlike a published source which usually discusses an E-language
 * or standard or normal expected production of an utterance.)
 * Speakers can have any number of additional speakerFields or metadata
 * that a team might use to help cluster or understand variation in data.
 *
 * As 'Informant' is not politically correct in many contexts, and 'consultant' is
 * ambigious word outside of field work, the word 'speaker' is used in communication with
 * users and in the url.
 *
 * A speaker might also be associated to a user. In this case a speaker
 * has the same information as a user plus extra, some info (e.g. date of birth)
 * which must be kept confidential. Speaker's gravatar are locked to
 * default unless he/she wants to be public associated with/his username.
 * Speakers which are also users have permissions about the level of
 * access to the data (read only, add/edit).
 *
 * @name  Speaker
 * @extends FieldDBObject
 * @constructs
 */
var Speaker = function Speaker(options) {
  this.debug("Constructing Speaker: ", options);
  FieldDBObject.apply(this, arguments);
};

Speaker.defaults = {
  speakerFields: DEFAULT_CORPUS_MODEL.speakerFields
};

Speaker.prototype = Object.create(FieldDBObject.prototype, /** @lends Speaker.prototype */ {
  constructor: {
    value: Speaker
  },

  url: {
    value: "/speakers"
  },

  collection: {
    value: "speakers"
  },

  INTERNAL_MODELS: {
    value: {
      username: FieldDBObject.DEFAULT_STRING,
      anonymousCode: FieldDBObject.DEFAULT_STRING,
      gravatar: FieldDBObject.DEFAULT_STRING,
      speakerFields: DatumFields,
      user: UserMask,
      confidential: Confidential
    }
  },

  confidentiality: {
    get: function() {
      if (this.speakerFields) {
        return this.speakerFields.confidentiality.value;
      } else {
        return;
      }
    },
    set: function(value) {
      if (!this.speakerFields) {
        this.speakerFields = new DatumFields(JSON.parse(JSON.stringify(Speaker.defaults.speakerFields)));
      }
      // this.warn("Cannot change the public/private of " + this.collection + " (it must be anonymous). " + value);
      this.speakerFields.confidentiality.value = value;
    }
  },


  buildGravatar: {
    value: function() {
      this._gravatar = "968b8e7fb72b5ffe2915256c28a9414c";
      return this._gravatar;
    }
  },

  gravatar: {
    get: function() {
      return this.buildGravatar();
    },
    set: function(value) {
      this.warn('Cannot set the gravatar of a ' + this.type + ' (it must be anonymous).' + value);
    }
  },

  username: {
    get: function() {
      console.log('this.speakerFields.username.value :', this.speakerFields.username.value + ":");
      if (this.speakerFields && this.speakerFields.username && this.speakerFields.username.value) {

        if (this.speakerFields.confidentiality.value === "generalize") {
          this.speakerFields.username.mask = "A native speaker";
        } else if (this.speakerFields.confidentiality.value === "team") {
          this.todo("IF the user is part of the team, they can see the username of the consultant.");
          this.speakerFields.username.mask = this.anonymousCode;
        } else if (this.speakerFields.confidentiality.value === "anonymous") {
          this.speakerFields.username.mask = this.anonymousCode;
        } else if (this.speakerFields.confidentiality.value === "public") {
          this.speakerFields.speaker.mask = value;
        } else {
          this.speakerFields.username.mask = "A native speaker";
        }

        return this.speakerFields.username.mask;
      } else {
        return;
      }
    },
    set: function(value) {
      if (!this.confidential) {
        this.warn("Cannot set the username before the anonymousCode is set");
        return;
      }
      if (!this.speakerFields) {
        this.speakerFields = new DatumFields(JSON.parse(JSON.stringify(Speaker.defaults.speakerFields)));
      }
      this.speakerFields.username.debugMode = true;
      // this.speakerFields.username.decryptedMode = true;
      this.speakerFields.username.confidential = this.confidential;
      this.speakerFields.username.encrypted = true;
      this.speakerFields.username.value = value;
    }
  },

  anonymousCode: {
    get: function() {
      if (this.speakerFields) {
        return this.speakerFields.anonymousCode.value;
      } else {
        return;
      }
    },
    set: function(value) {
      if (this.username && value.toLowerCase().indexOf(this.username) > -1) {
        this.bug('Cannot set the anonymous code to contain any part of the user\'s actual username, this would potentially breach their confidentiality.');
        return;
      }
      if (!this.speakerFields) {
        this.speakerFields = new DatumFields(JSON.parse(JSON.stringify(Speaker.defaults.speakerFields)));
      }
      this.speakerFields.anonymousCode.value = value;
      this.confidential = new Confidential({
        secretkey: value
      });
    }
  },

  confidential: {
    get: function() {
      return this.confidentialEncrypter;
    },
    set: function(value) {
      if (value === this.confidentialEncrypter) {
        return;
      }
      this.confidentialEncrypter = value;
    }
  },

  dateOfBirth: {
    get: function() {
      if (this.speakerFields) {
        return this.speakerFields.dateOfBirth.value;
      } else {
        return;
      }
    },
    set: function(value) {
      if (this.speakerFields) {
        this.speakerFields.debugMode = true;
        this.speakerFields.dateOfBirth.value = value;
      } else {
        this.speakerFields = new DatumFields(JSON.parse(JSON.stringify(Speaker.defaults.speakerFields)));
        this.speakerFields.dateOfBirth.value = value;
      }
    }
  },

  languages: {
    get: function() {
      if (this.speakerFields) {
        return this.speakerFields.languages.value;
      } else {
        return;
      }
    },
    set: function(value) {
      if (this.speakerFields) {
        this.speakerFields.debugMode = true;
        this.speakerFields.languages.value = value;
      } else {
        this.speakerFields = new DatumFields(JSON.parse(JSON.stringify(Speaker.defaults.speakerFields)));
        this.speakerFields.languages.value = value;
      }
    }
  },

  dialects: {
    get: function() {
      if (this.speakerFields) {
        return this.speakerFields.languages.value;
      } else {
        return;
      }
    },
    set: function(value) {
      if (this.speakerFields) {
        this.speakerFields.debugMode = true;
        this.speakerFields.languages.value = value;
      } else {
        this.speakerFields = new DatumFields(JSON.parse(JSON.stringify(Speaker.defaults.speakerFields)));
        this.speakerFields.languages.value = value;
      }
    }
  },

  speakerFields: {
    get: function() {
      return this._speakerFields;
    },
    set: function(value) {
      if (value === this._speakerFields) {
        return;
      }
      if (!value) {
        delete this._speakerFields;
        return;
      } else {
        if (Object.prototype.toString.call(value) === '[object Array]') {
          value = new this.INTERNAL_MODELS['speakerFields'](value);
        }
      }
      this._speakerFields = value;
    }
  },

  user: {
    get: function() {
      if (!this.userMask) {
        if (this.public && this.username) {
          this.userMask = new this.INTERNAL_MODELS['user']({});
          this.userMask.username = this.username;
          this.userMask.fetch().then(function(result) {
            console.log('Fetched speaker\'s user mask', result);
          }, function(error) {
            console.log('Failed to fetch speaker\'s user mask', error);
          });
        } else {
          this.userMask = {};
        }
        this.userMask = {
          username: this.anonymousCode,
          gravatar: this.gravatar
        };
      }
      return this.userMask;
    },
    set: function(value) {
      if (value === this.userMask) {
        return;
      }
      if (!value) {
        value = {};
      }
      this.userMask = value;
    }
  }

});
exports.Speaker = Speaker;
