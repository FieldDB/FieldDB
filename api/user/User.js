/* globals localStorage */
var Activities = require("./../activity/Activities").Activities;
var FieldDBObject = require("./../FieldDBObject").FieldDBObject;
var UserMask = require("./UserMask").UserMask;
var DatumFields = require("./../datum/DatumFields").DatumFields;
var Connection = require("./../corpus/Connection").Connection;
var Corpora = require("./../corpus/Corpora").Corpora;
var Database = require("./../corpus/Database").Database;
var Confidential = require("./../confidentiality_encryption/Confidential").Confidential;
var UserPreference = require("./UserPreference").UserPreference;
var DEFAULT_USER_MODEL = require("./user.json");
var Q = require("q");

/**
 * @class User extends from UserGeneric. It inherits the same attributes as UserGeneric but can
 * login.
 *
 * @property {String} firstname The user's first name.
 * @property {String} lastname The user's last name.
 * @property {Array} teams This is a list of teams a user belongs to.
 * @property {Array} sessionHistory
 * @property {Array} datalistHistory
 * @property {Permission} permissions This is where permissions are specified (eg. read only; add/edit data etc.)
 *
 * @name  User
 * @extends UserMask
 * @constructs
 */
var User = function User(options) {
  if (!this._fieldDBtype) {
    this._fieldDBtype = "User";
  }
  if (options && options.nodejs) {
    this.todo("creating user from express body, verify options are sanitized ");
    delete options.nodejs;
    delete options.password;
  }

  this.debug("Constructing User length: ", options);
  UserMask.apply(this, arguments);

  if (this.username) {
    this.id = this.username;
  }
};

User.prototype = Object.create(UserMask.prototype, /** @lends User.prototype */ {
  constructor: {
    value: User
  },

  api: {
    value: "users"
  },

  defaults: {
    get: function() {
      return JSON.parse(JSON.stringify(DEFAULT_USER_MODEL));
    }
  },

  INTERNAL_MODELS: {
    value: {
      username: FieldDBObject.DEFAULT_STRING,
      firstname: FieldDBObject.DEFAULT_STRING,
      lastname: FieldDBObject.DEFAULT_STRING,
      email: FieldDBObject.DEFAULT_STRING,
      gravatar: FieldDBObject.DEFAULT_STRING,
      researchInterest: FieldDBObject.DEFAULT_STRING,
      affiliation: FieldDBObject.DEFAULT_STRING,
      description: FieldDBObject.DEFAULT_STRING,
      appbrand: FieldDBObject.DEFAULT_STRING,
      fields: DatumFields,
      prefs: UserPreference,
      mostRecentIds: FieldDBObject,
      activityConnection: Activities,
      authUrl: FieldDBObject.DEFAULT_STRING,
      userMask: UserMask,
      corpora: Corpora,
      newCorpora: Corpora,
      sessionHistory: FieldDBObject.DEFAULT_ARRAY,
      datalistHistory: FieldDBObject.DEFAULT_ARRAY
    }
  },

  hotkeys: {
    get: function() {
      if (this.prefs) {
        return this.prefs.hotkeys;
      }
    },
    set: function(value) {
      if (!this.prefs) {
        this.prefs = new this.INTERNAL_MODELS["prefs"]();
      }
      if (Object.prototype.toString.call(value) !== "[object Array]") {
        if (!value.firstKey && !value.secondKey && !value.description) {
          value = [];
        } else {
          value = [value];
        }
      }
      this.prefs.hotkeys = value;
      delete this.hotkeys;
    }
  },

  authUrl: {
    get: function() {
      return this._authUrl || "";
    },
    set: function(value) {
      this.debug("setting authurl", value);
      if (value === this._authUrl) {
        return;
      }
      if (!value) {
        delete this._authUrl;
        return;
      } else {
        if (typeof value.trim === "function") {
          value = value.trim();
        }
        value = value.replace(/[^.\/]*.fieldlinguist.com:3183/g, "auth.lingsync.org");
      }
      this._authUrl = value;
    }
  },

  datalists: {
    get: function() {
      return this.datalistHistory;
    },
    set: function(value) {
      if (value && !this._datalistHistory) {
        this.datalistHistory = value;
      }
    }
  },

  datalistHistory: {
    get: function() {
      return this._datalistHistory || FieldDBObject.DEFAULT_ARRAY;
    },
    set: function(value) {
      this._datalistHistory = value;
    }
  },

  sessionHistory: {
    get: function() {
      return this._sessionHistory || FieldDBObject.DEFAULT_ARRAY;
    },
    set: function(value) {
      this._sessionHistory = value;
    }
  },

  mostRecentIds: {
    configurable: true,
    get: function() {
      return this._mostRecentIds || FieldDBObject.DEFAULT_OBJECT;
    },
    set: function(value) {
      if (value === this._mostRecentIds) {
        return;
      }
      if (!value) {
        delete this._mostRecentIds;
        return;
      } else {
        if (!(value instanceof this.INTERNAL_MODELS["mostRecentIds"])) {
          value = new this.INTERNAL_MODELS["mostRecentIds"](value);
        }
      }

      value.connection = value.connection || value.corpusConnection || value.couchConnection;
      delete value.corpusConnection;
      delete value.couchConnection;
      if (value.connection) {
        value.connection = new Connection(value.connection);
      }
      this._mostRecentIds = value;
    }
  },

  prefs: {
    get: function() {
      // if (!this._prefs && this.INTERNAL_MODELS["prefs"] && typeof this.INTERNAL_MODELS["prefs"] === "function") {
      //   this.prefs = new this.INTERNAL_MODELS["prefs"](this.defaults.prefs);
      // }
      return this._prefs;
    },
    set: function(value) {
      this.ensureSetViaAppropriateType("prefs", value);
      // if(this._prefs){
      //   this._prefs.parent = this;
      // }
    }
  },

  corpuses: {
    configurable: true,
    get: function() {
      return this.corpora;
    },
    set: function(value) {
      this.corpora = value;
    }
  },

  newCorpusConnections: {
    configurable: true,
    get: function() {
      return this.newCorpora;
    },
    set: function(value) {
      this.newCorpora = value;
    }
  },

  appbrand: {
    get: function() {
      if (this.prefs && this.prefs.preferredDashboardType === this.prefs.defaults.preferredDashboardType) {
        if (this._appbrand === "phophlo") {
          this.debug(" setting preferredDashboardType from user " + this._appbrand);

          this.prefs.preferredDashboardType = "experimenter";
        }
      }
      return this._appbrand || "lingsync";
    },
    set: function(value) {
      if (value === this._appbrand) {
        return;
      }

      if (this._appbrand) {
        this.warn("appbrand cannot be modified by client side apps.");
      } else {
        if (value.trim) {
          value = value.trim();
        }
        this._appbrand = value;
      }
      this.debug(" setting preferredDashboardType from user " + this._appbrand);
      if (this.prefs && this.prefs.preferredDashboardType === this.prefs.defaults.preferredDashboardType) {
        if (this._appbrand === "phophlo") {
          this.prefs._preferredDashboardType = "experimenter";
          this.debug(" it is now " + this.prefs.preferredDashboardType);

        }
      }
    }
  },

  userMask: {
    get: function() {
      this.debug("getting userMask");
      return this._userMask;
    },
    set: function(value) {
      if (value && typeof value === "object") {
        value.username = this.username;
        value.gravatar = value.gravatar || this.gravatar;
        value.researchInterest = value.researchInterest || "No public information available";
        value.description = value.description || "No public information available";
        value.affiliation = value.affiliation || "No public information available";
      }
      this.ensureSetViaAppropriateType("userMask", value);
    }
  },

  publicSelf: {
    get: function() {
      return this.userMask;
    },
    set: function(value) {
      this.userMask = value;
    }
  },

  activityConnection: {
    get: function() {
      this.debug("getting activityConnection");
      return this._activityConnection;
    },
    set: function(value) {
      if (value) {
        value.parent = this;
        if (!value.confidential && this.confidential) {
          value.confidential = this.confidential;
        }
      }
      this.ensureSetViaAppropriateType("activityConnection", value);

      if (this.username && this._activityConnection && this._activityConnection._connection && !this._activityConnection._database) {
        this._activityConnection._database = new Database({
          dbname: this.username + "-activity_feed",
          connection: this._activityConnection._connection
        });
      }
    }
  },

  activityCouchConnection: {
    configurable: true,
    get: function() {
      return this.activityConnection;
    },
    set: function(value) {
      this.activityConnection = value;
    }
  },

  toJSON: {
    value: function(includeEvenEmptyAttributes, removeEmptyAttributes) {
      this.debug("Customizing toJSON ", includeEvenEmptyAttributes, removeEmptyAttributes);
      includeEvenEmptyAttributes = true;
      var json = FieldDBObject.prototype.toJSON.apply(this, arguments);

      // TODO not including the corpuses, instead include corpora
      if (this.corpora && typeof this.corpora.toJSON === "function") {
        json.corpora = this.corpora.toJSON();
      } else {
        json.corpora = this.corpora;
      }
      delete json.corpuses;

      delete json.connection;
      delete json.authentication;

      // TODO deprecated
      json.datalists = this.datalists;

      if (json.mostRecentIds) {
        delete json.mostRecentIds.fieldDBtype;
        delete json.mostRecentIds.version;
        delete json.mostRecentIds.dateCreated;
        delete json.mostRecentIds.dateModified;
        delete json.mostRecentIds.comments;
        if (!json.mostRecentIds.dbname) {
          delete json.mostRecentIds.dbname;
        }
      }

      this.debug(json);
      return json;
    }
  },

  save: {
    value: function(options) {
      this.debug("Customizing save ", options);
      var key,
        userKey,
        encryptedUserPreferences,
        deferred = Q.defer();

      this.whenReady = deferred.promise;

      var self = this;
      Q.nextTick(function() {
        deferred.resolve(self);
      });

      if (!this._rev) {
        this.warn("Refusing to save a user doc which is incomplete, and doesn't have a rev");
        return deferred.promise;
      }

      try {
        // save the user's preferences encrypted in local storage so they can work without by connecting only to their corpus
        key = localStorage.getItem("X09qKvcQn8DnANzGdrZFqCRUutIi2C");
        if (!key) {
          key = Confidential.secretKeyGenerator();
          localStorage.setItem("X09qKvcQn8DnANzGdrZFqCRUutIi2C", key);
        }
      } catch (e) {
        this.constructor.prototype.temp = this.constructor.prototype.temp || {};
        key = this.constructor.prototype.temp.X09qKvcQn8DnANzGdrZFqCRUutIi2C;
        if (!key) {
          key = Confidential.secretKeyGenerator();
          this.constructor.prototype.temp.X09qKvcQn8DnANzGdrZFqCRUutIi2C = key;
        }
        this.debug("unable to use local storage, this app wont be very usable offline ");
        this.debug(" error ", e);
      }
      userKey = key + this.username;
      var userJSON = this.toJSON();
      self.debug("saving " + userKey, userJSON);
      encryptedUserPreferences = new Confidential({
        secretkey: userKey
      }).encrypt(userJSON);

      try {
        localStorage.setItem(userKey, encryptedUserPreferences);
      } catch (e) {
        this.constructor.prototype.temp = this.constructor.prototype.temp || {};
        this.constructor.prototype.temp[userKey] = encryptedUserPreferences;
        this.debug("unable to use local storage, this app wont be very usable offline ");
        this.debug(" error ", e);
      }

      return deferred.promise;
    }
  },

  fetch: {
    value: function(options) {
      this.debug("Customizing fetch ", options);
      var key,
        userKey,
        encryptedUserPreferences,
        decryptedUser = {},
        overwriteOrNot,
        self = this,
        deferred = Q.defer();

      this.whenReady = deferred.promise;

      Q.nextTick(function() {
        deferred.resolve(self);
      });

      try {
        // fetch the user's preferences encrypted in local storage so they can work without by connecting only to their corpus
        key = localStorage.getItem("X09qKvcQn8DnANzGdrZFqCRUutIi2C");
      } catch (e) {
        self.constructor.prototype.temp = self.constructor.prototype.temp || {};
        key = self.constructor.prototype.temp.X09qKvcQn8DnANzGdrZFqCRUutIi2C;
        self.debug("unable to use local storage, this app wont be very usable offline ");
        self.debug(" error ", e);
      }
      if (!key) {
        self.warn("cannot fetch user info locally");
        return deferred.promise;
      }
      userKey = key + self.username;
      try {
        encryptedUserPreferences = localStorage.getItem(userKey);
      } catch (e) {
        if (!self.constructor.prototype.temp) {
          self.warn("no local users have been saved");
          return FieldDBObject.prototype.fetch.apply(self, arguments);
        }
        encryptedUserPreferences = self.constructor.prototype.temp[userKey];
      }
      decryptedUser = {};
      if (!encryptedUserPreferences) {
        self.warn("This user " + self.username + " hasnt been used this device before, need to request their prefs when they login.");
        return deferred.promise;
        // return FieldDBObject.prototype.fetch.apply(self, arguments);
      }
      self.debug("userKey is " + userKey);
      self.debug("user encrypted is " + encryptedUserPreferences);
      decryptedUser = new Confidential({
        secretkey: userKey
      }).decrypt(encryptedUserPreferences);

      self.debug(" Opening user prefs from previous session on self device", decryptedUser);
      if (!self._rev) {
        overwriteOrNot = "overwrite";
      }

      self.merge("self", new User(decryptedUser), overwriteOrNot);
      return deferred.promise;
    }
  }

});
exports.User = User;
