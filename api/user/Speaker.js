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
 * Speakers can have any number of additional fields or metadata
 * that a team might use to help cluster or understand variation in data.
 *
 * As 'Informant' is not politically correct in many contexts, and 'consultant' is
 * ambigious word outside of field work, the word 'speaker' is used in communication with
 * users and in the url of db queries/api.
 *
 * A speaker might also be associated to a user. In this case a speaker
 * has the same information as a user plus extra, some info (e.g. date of birth)
 * which must be kept confidential. Speaker's gravatar are locked to
 * default unless he/she wants to be public associated with/his username.
 * Speakers which are also users have permissions about the level of
 * access to the data (read only, add/edit).
 *
 * @name  Speaker
 * @extends UserMask
 * @constructs
 */
var Speaker = function Speaker(options) {
  this.debug("Constructing Speaker: ", options);
  UserMask.apply(this, arguments);
};

Speaker.prototype = Object.create(UserMask.prototype, /** @lends Speaker.prototype */ {
  constructor: {
    value: Speaker
  },

  api: {
    value: "speakers"
  },

  INTERNAL_MODELS: {
    value: {
      username: FieldDBObject.DEFAULT_STRING,
      anonymousCode: FieldDBObject.DEFAULT_STRING,
      gravatar: FieldDBObject.DEFAULT_STRING,
      fields: DatumFields,
      user: UserMask,
      confidential: Confidential
    }
  },

  defaults: {
    get: function() {
      var doc = {
        fields: DEFAULT_CORPUS_MODEL.speakerFields
      };
      return JSON.parse(JSON.stringify(doc));
    }
  },

  confidentiality: {
    get: function() {
      if (this.fields) {
        return this.fields.confidentiality.value;
      } else {
        return;
      }
    },
    set: function(value) {
      if (!this.fields) {
        this.fields = new DatumFields(this.defaults.fields);
      }
      // this.warn("Cannot change the public/private of " + this.collection + " (it must be anonymous). " + value);
      this.fields.confidentiality.value = value;
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
      if (this.fields && this.fields.username && this.fields.username.value) {
        // this.debug('this.fields.username.value :', this.fields.username.value + ":");

        if (this.fields.confidentiality.value === "generalize") {
          this.fields.username.mask = "A native speaker";
        } else if (this.fields.confidentiality.value === "team") {
          this.todo("IF the user is part of the team, they can see the username of the consultant.");
          this.fields.username.mask = this.anonymousCode;
        } else if (this.fields.confidentiality.value === "anonymous") {
          this.fields.username.mask = this.anonymousCode || this.fields.username.mask;
        } else if (this.fields.confidentiality.value === "public") {
          this.fields.username.mask = this.fields.username.value;
        } else {
          this.fields.username.mask = "A native speaker";
        }

        if (this.fields.username.decryptedMode) {
          return this.fields.username.value;
        } else {
          return this.fields.username.mask;
        }
      } else {
        return;
      }
    },
    set: function(value) {
      if (!this.confidential) {
        this.warn("Cannot set the username before the confidential is set");
        return;
      }
      if (!this.fields) {
        this.fields = new DatumFields(this.defaults.fields);
      }
      // this.fields.username.debugMode = true;
      // this.fields.username.decryptedMode = true;
      this.fields.username.confidential = this.confidential;
      this.fields.username.value = value;
    }
  },

  encryptByCorpus: {
    value: true
  },

  id: {
    get: function() {
      return this.anonymousCode;
    },
    set: function(value) {
      if(value !== this.anonymousCode){
        this.anonymousCode = value;
      }
    }
  },

  anonymousCode: {
    get: function() {
      if (this.fields && this.fields.anonymousCode) {
        return this.fields.anonymousCode.value.toUpperCase();
      } else {
        return;
      }
    },
    set: function(value) {
      var actualUsername;
      if (this.fields && this.fields.username && this.fields.username.value) {
        this.fields.username.decryptedMode = true;
        actualUsername = this.fields.username.value;
        this.fields.username.decryptedMode = false;
      }
      if (actualUsername && value.toLowerCase().indexOf(actualUsername) > -1) {
        this.bug('Cannot set the anonymous code to contain any part of the user\'s actual username, this would potentially breach their confidentiality.');
        return;
      }
      if (!this.fields) {
        this.fields = new DatumFields(this.defaults.fields);
      }
      this.fields.anonymousCode.value = value;
      this.id = value;
      if (!this.encryptByCorpus) {
        this.confidential = new Confidential({
          secretkey: value
        });
      }
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
      if (typeof value.encrypt !== "function" && value.secretkey) {
        value = new this.INTERNAL_MODELS['confidential'](value);
      }
      this.confidentialEncrypter = value;
      if (this.fields) {
        // this.debug('setting speaker fields confidential in the Speaker.confidential set function.');
        this.fields.confidential = value;
      }
    }
  },

  dateOfBirth: {
    get: function() {
      if (this.fields) {
        return this.fields.dateOfBirth.value;
      } else {
        return;
      }
    },
    set: function(value) {
      if (this.fields) {
        // this.fields.debugMode = true;
        this.fields.dateOfBirth.value = value;
      } else {
        this.fields = new DatumFields(this.defaults.fields);
        this.fields.dateOfBirth.value = value;
      }
    }
  },

  firstname: {
    get: function() {
      if (this.fields && this.fields.firstname) {
        return this.fields.firstname.value;
      } else {
        return;
      }
    },
    set: function(value) {
      if (!this.fields) {
        this.fields = new DatumFields(this.defaults.fields);
      }
      if (this.fields && this.fields.firstname) {
        // this.fields.debugMode = true;
        this.fields.firstname.value = value;
      } else {
        this.fields.firstname.value = value;
      }
    }
  },

  lastname: {
    get: function() {
      if (this.fields && this.fields.lastname) {
        return this.fields.lastname.value;
      } else {
        return;
      }
    },
    set: function(value) {
      if (!this.fields) {
        this.fields = new DatumFields(this.defaults.fields);
      }
      if (this.fields && this.fields.lastname) {
        // this.fields.debugMode = true;
        this.fields.lastname.value = value;
      } else {
        this.fields.lastname.value = value;
      }
    }
  },

  languages: {
    get: function() {
      if (this.fields) {
        return this.fields.languages.value;
      } else {
        return;
      }
    },
    set: function(value) {
      if (this.fields) {
        // this.fields.debugMode = true;
        this.fields.languages.value = value;
      } else {
        this.fields = new DatumFields(this.defaults.fields);
        this.fields.languages.value = value;
      }
    }
  },

  dialects: {
    get: function() {
      if (this.fields) {
        return this.fields.languages.value;
      } else {
        return;
      }
    },
    set: function(value) {
      if (this.fields) {
        // this.fields.debugMode = true;
        this.fields.languages.value = value;
      } else {
        this.fields = new DatumFields(this.defaults.fields);
        this.fields.languages.value = value;
      }
    }
  },

  fields: {
    get: function() {
      if (this._fields) {
        // this.debug('setting speaker fields confidential in the Speaker.fields get function.');

        // this._fields.encrypted = true;
        // this._fields.decryptedMode = true;
        this._fields.confidential = this.confidential;
      }
      return this._fields;
    },
    set: function(value) {
      if (value === this._fields) {
        return;
      }
      if (!value) {
        delete this._fields;
        return;
      } else {
        if (Object.prototype.toString.call(value) === '[object Array]') {
          value = new this.INTERNAL_MODELS['fields'](value);
        }
      }
      this._fields = value;
    }
  },

  user: {
    get: function() {
      if (!this.userMask) {

        var self = this;
        if (this.public && this.username) {
          this.userMask = new this.INTERNAL_MODELS['user']({});
          this.userMask.username = this.username;
          this.userMask.fetch().then(function(result) {
            self.debug('Fetched speaker\'s user mask', result);
          }, function(error) {
            self.debug('Failed to fetch speaker\'s user mask', error);
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
  },

  decryptedMode: {
    get: function() {
      return this._decryptedMode;
    },
    set: function(value) {
      this._decryptedMode = value;
      if (this._fields) {
        this._fields.decryptedMode = value;
      }
    }
  }


});
exports.Speaker = Speaker;
