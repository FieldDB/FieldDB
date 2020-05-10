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

  /*
   * Deprecated
   */
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

  /*
   * Deprecated
   */
  dataLists: {
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

  /*
   * Deprecated
   */
  sessions: {
    get: function() {
      return this.sessionHistory;
    },
    set: function(value) {
      if (value && !this._sessionHistory) {
        this.sessionHistory = value;
      }
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
        value.id = value.username;
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
    value: function(includeEvenEmptyAttributes, removeEmptyAttributes, attributesToIgnore) {
      this.debug("Customizing toJSON ", includeEvenEmptyAttributes, removeEmptyAttributes, attributesToIgnore);
      includeEvenEmptyAttributes = true;
      var json = UserMask.prototype.toJSON.apply(this, arguments);

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

/* New user types can create their own public users prefs and save them to local storage, and then copy paste them here. */
User.publicUserStaleDetails = function() {
  return {
    token: "$2a$10$TpNxdbXtDQuFGBYW5BfnA.F7D0PUftrH1W9ERS7IdxkDdM.k7A5oy",
    public: "confidential:VTJGc2RHVmtYMS81anhBWjBET0dTbVNyT0pOT01rUlQ0MWNqZ05uMzY3dUE0S2NZSUkyQjNYVS9IQ01vb1hqYUNNeWp4Z2hBeDlzUjR5c1" +
     "FtWEdHaCt2Tm9zM2szRmM2UXNjbDZpNmEyd1dsVW9yN3dJblBZeE5mbStjbTdyRFZGNk1VWFhOdXk5ZVYyRHlkTk5ROU9uVkwxbWg4d3BNSEpKdHRFOWpYeWZnNzRM" +
     "RWxMdTRMV1JLM0lCNFdGbUNPYzUwVzRNSFZEcVdJdXRNV01DYkYzakV0a2JKSTdyY2pUb0FYUk4vYTlQY1pDc0tJYU5yZU9xb1UrTzlDcnNSQ2wxL0xaUW9CL0VzTD" +
     "BqYzRrK2l4TVVRU2pNVlovUUphaFFmMzFPYnROWnkxSFVqQzFkNTNHNlY4RmNJK3VHUUo4SVBHYnl3eWFGZDFSSFJFajRhUmI2OTU0QU9ieW1YR0U0SkRnVnlpcTQ3" +
     "VmJUOUxqRjdwN2cybllISWxKVmNsZ1Ntbmo0RnRZSDZVRU9Mdk1LNXFqMTJVckRhNjN6ajVNNGZsaE01VlNKMjZONkRjVTUzT3pEOEg5MUVjR1RhMTRNa0NLQjFRL0" +
     "hYSU5nUnY3TWt1bkxpYjFaY1Z4bmttS2RPemxsSkhuMGNmOWJsS05neFRQcVRIOVZoaGJuZjNyMVc5YVRTazZqN1dCQk1vM2tESjRaV0xlaGtYK2NuQVZFQmIvRDVK" +
     "MGtrcDlmcEJKbys3dU0xYVZ1VGhRYzJmdUNDL3d4UkV1UUdJRTk4aDlsb2ZzTkhIdWZrNWNjdCt0VGZZTjhzMi9ROW9TV054M1pKclFQWHQySUpPVEJ6Z2NDT2sreD" +
     "k5eEJ0dlRIN1dhTHBUbVErSkJqR2VZTlJwdzcyd0FwM2Z0cnRMK2tOR1ZtQWp6RWlFRlBtRUlDZWZkUnlRSzduL0xNZHRady8yQzE0WHdFRDBSbzNuaXZHTXdVSmpu" +
     "Y0FVMHExUndpN0pTdG93b1FHNUE0OXRFQUlSN0VnUStyMkdHbUhVTlZYMU8yR1ljYTI1SXViQ2k3NUZMaWVHb3RXTmdUbWVXTWJETWNNSHVTNXJQMmx0VWxCKzFMT0" +
     "g3RkJXbS9FVDA0dmVZZ3RYVDJ2SURILzNnaUNuU2xpRGVJTEtqUngvSlZobis4eHVBR1dVL3RZU3haNTdHbWZQZkttb1BJM1RDSmpWZGZCRnhYUDdPUWxBUnQwdE5R" +
     "LytkQWE4YldkcUpnSFBWY05XMXB0WVh1SXlYUHlWWG1GQ3JTbTZmOTVNRVJ0dFhpQUhRcEQ4amR2ZkY3Y05SYkVJMHdRc3FWM0U5dFlHVExNL0FxajZsR2E5Q21Paj" +
     "Vqdk1HZ0FEVkd0RGJ2Yk1VVzQ2TnMvditsNmE3UlBpY05hdzRpdDhid1NaaFdGdlVnd2t2VDY4OHBnSG1PNGdIWGoxNzdwby93ZldjK3EvZTV6T0pVTEpLYUI0M2pC" +
     "VUEyRy90MWpJdXZzRnAvdG4rQkJ6cnVWTXVzSldGYWw4ZmdOVHBuOEdhTXRpNnFDcHVqS2ZTRzRjWlk1TGZzY0R4cGhZTk9PZEVneVl1M3BIaDlJZEN1RDdaUHVhWno" +
     "5aWZZZlhpODcyczdiSG05Zk54RThHQ0pLQkR1TmMyMzVRL3E4TEVpYkJCaC9LVUw1NUVmUmZ3dmZ3Z2VrcEliNG5CTll3eFNXejVxeGJydTlIT3owOFdpTklhYUpVK1" +
     "RzZ0xwVXl2MC93K0hKY3pjcEh4bXJvaHpPbG9SKzREaEpQRVRXTDZaYUFDTVNmSzdFeUxTaEx2T1B1cEhaVG0zRzhtelpoN0ZWZ2hWRVZuN1A4b0RiVHFSQlRZM0Ra" +
     "M0piSEFpZE9NelJLZy9sQ1kyMi9EZ01LVmtCRlpKUWdjK2RmU3FkRXZOQ1lWMlZoTlpnVG4wMjIxclIrMGNvYmhJNmUvT3Vna1dKUWpmMjgzTkJvWWdNUThFcFk1Y3" +
     "VkSjBwMkpZTU9MWS9kN0NWSWVaSFNINUNqcmdKcm9lNVp1c0UzeElZekhveHRrYTZTd2N3UFZGWmcrSTBhbzJYaXdPNW4zU25hM2VxZm9yTU1FdVRLSE9lZCtNa0U5WV" +
     "RlZ3Z5UlQvWTVSbGt5S25kRS9Id3gwZ2dSVXlSaHJRNHZzVGtRclBlZ0JCYTFHZmNoZGdid1hUbnM4NlRFNVJYK1FjVEN4QkoyUGE5QVR0UWF2SURQbnJkUHgrU0p5cF" +
     "ZUSUtqWnJBdStKaEorUVBmL1AxcDJvd0NhaGFRVEpKNzdVcE95ZURML3oxdHllbDh0TUl6ZFdVV21Dbi9GOUFNNExuMVk2WGFHMVlxMVVDQzlhYWZJbUpSN0Y2cmlNVD" +
     "lyak1ObXZWNTVkZ1Y2blI3OEhlcWZLYlY5eEpOelI4cG1maTIrMzRNM2FPbUoxajVMZG9WajAyZHRYOFExZy8zekM0SGlaeldLY1I5ZEVIZkNzWXgzcEI2QmgxNFlLc0" +
     "5YY1o0TjJvWnhpOVJ2aDlySmlucjMxR0kxVi95NHlQVm0xZGxLMWk2UWViY2xjc2U5WUo1MElnR0M0eVpFa0dPTXJWMU5nQXJrWElWWklpUTJWOXNjdlgvQmtZcmdKdF" +
     "g2b1Yrclh1UC9SQTFySTk1eDBQQUUyUzdqWXpNYWlxa0pQb3BaZWQ4d1FrUm9FNXVVZFFIa0dXdmpZMGVGaE8vR2FlSXN2SGtXcEhUQjZNajcyWmJrNmFpYnc2cDh4VV" +
     "VKK1JJZ3Uya3lkZkNPeWZQSmg5R1pYc0hhVWlseXIyTWxPUXhNTU9hYkdFak9jUzBoeG9LK1R4dzJ3ZERaV1hxK2ZxK25YY1hiT3RCS2RkbjNrUlQ3VjhkZ3ZkMU1aM3" +
     "ZDNjhYWUhQblMxYm1KR3lOMmNhVUszRmdKQ21IZWZ6MnBoSzdrNHZwVFlVbmg0cEYwT0J5TXZoVTJFOTkzUnNhYWlCTVFXZnFGdlkvdU94dkhQbTZpcm9tYnR3SDNFLy" +
     "9JeDZLSEpLTVczd0E5aE13eHRzdGhQV3ArenpPbVMwNCsrWEN5cFUzV0xJSmZmRGt2T3dRUmRydlo3Sy9mUmZzQXZlTXlXbVRSeE93cGthSzBvZGowTmRORnh1SWlJZj" +
     "k3NFU2encwSzVUQmo3eTB0TUNKcW9NUUZDajF3VXM1QVFMWk53RTBUVGcxMFJONElTZEpLL2FoSmJCYTdrVFA2ZTVLV2ptZi9hak05YS9sWlQ5ZTZBditEbjJrbFcwMH" +
     "J5OUpVWE9TOGFrYjNXbDJNaGJTTUhGVEY1V2kyeFpSUGxaM3BTd2g4QWpERC9qQUR1NE02OHRlcUppSCtzTStuVmEvKzBpMFJSTTVVMGU3enk1ODNpWW95VUY1TTRHdU" +
     "tFbUthOExrQWVsUFhtZ1JGV1hJODdUOG94MEpKZUZxSER0SWs3VEZlMjloMTA3RVlGRkxKN213a3ZUZ1VMY0xkbUdVTTBXWVJXNFplK3pmZVBITWRCSUl0MzY0MUNVNT" +
     "J5dCtkWUtqNU5XZUJFVk9RK0M3dDVoUzVLZlpjSWNaV3gyajBtVlJ4NVNHS1hucHZONkdhUVUyL3g3K0U1OWthVXp1L05OWjB5M0dCZXhyS2JlSDlKUHd1TzlydlhkY2I" +
     "xanYxb1FWbnJOdTBrcUNTMUd3aFo3d1kzT0ZiTUw2dnBaNDNBMzlid1IrZDFmR0JvUDc4Yjh2dGVBT0ozT0hVSm9mYkJJSUZYOUh5K3hPR0IxMmZxK0JYL2FQTFVGUU9" +
     "yRFdYM2tnczIrVnp3Nk81SnFvR1dyN0RNZ2ZvYmpiR1ZxQlIvYXkwRm1QcGFBSk9VWXMrNlJ6blErVFAxOUV1Qk5vOXUyR05rQ1dDM0o0Y2RWSCtGcy9IVUZ3bjRoeTg" +
     "3akc3QXJHRnFIeGthVjB5Nml0N3hpTmNXYVVvTmVFRGY0Z24wY2x4UjZZQjdNd29FYUpjLy81QjhubXhBMlMxb0YvbE1JL0tBUkJMZnVxQlVNNVVSSWVWQVNRSE5LaytU" +
     "bFhMdTFkQ2FWM0l3WUtxMjZhckVDQmwybjVYNFI1bFNWcUlnQjVxaEtEZXZHbU0xVGNXdzRmaStDaXNZZnptb01GY1doR2ZHZU8wZmFCM0VvS2VXQk05aFNDeHFaZ2hoS" +
     "ERWUm9WTkpISy9yYTBtblVUR2VhVzZ4aEI3QlpCWXcwWnZyQVFIWTNYVTFYVkJpSDB2aUZMVGtiMFBoWW9IcmlNME1lUFcwZ1JEOS8vSmVRNEhBaHQ2dWJydmRwbTdQWU" +
     "5WK3E3bTQ4M2tHVFN1Ujg1MHNQVk1XeFhHTUJLaWpHQXZsRVM0blhobTRpcjFQOG1jeVI2TCtrK3Rwc3BDamNDcUZaWU4zNHVUN1J4TGtVYnVORFppT3hMbG10MlN5MHZ" +
     "Kb3pZY2dpOHEwVXE1S2lTZnNFM1BJd1NucDFEemhHOWxTR1RtMHlZcHh4dk1ZaEUybnVDYUs0OVRHcXIxd3lGSWxIMFZnSlppRGdYNE1vaTlVbDBoTDJFQ1FnRGVIUEhr" +
     "aVFqOUQxRnVLSDNPR2NhanBmdUM5Rml1YU82U3BCbHMrR3BBMy9PMHArdVJJcUl0cWVZYmo5bHltS2ZEcmRvU3hGQlJQVkxnM2tCT3NpcjBKWFc2cVh5R1R6akVhdDEwU" +
     "i85N0N3ZHJ1ZEFlZFhNWHgveUpYdjViVHgzVVRSQ1JtSCtGbERuTVlnRFhwUytKVGxUeGtoZ3o5VzhyOG9IWml1YmlmSGhERnNoeDhmaDM5c3FvWW05c3NUNEJld1d0YW" +
     "EwMitwUUFwdEp4a2dYVjRiZXFrSmhQeGIrS1RRREFIeFl2TWdIbEgwbFd4OXVUbGdmL0w3MFhtTVA5cnVFTTlBbDhqQ2djWGkzQk16bHNDQkJZd0RVK3dKanJRczR3Wmh" +
     "DSEJlNE5zZ0xORVZ4R1FRcmRkRXNlakpzMzBnZ04za2wya05Kalg2MjFETk44YnBmYmQ3M1B6RGVPSE0wWW52SmRsK0xnb0VtelZISWxkZHFlYkxsek1teDJJVHFGNmd4" +
     "STJlKzJVQWxNNFdKUEMwUGRRRjVJbkxDem1Ub25JL2VlaUxkcjdMV1VMbzNVVEpmR1ExMmdKMDZ2YnlwY0t4UDdnR0lXZWRMUEI0Yk1hR01CcDc3TE1aZXFGR0xsSXNxY2" +
     "tFUmI3dUg1Rk5oZFk2ckFxN0lPeGIwYlBIYk5GaS9oQkFwUEF3Y2g5YVRsdllueWsxNXkrRk00QWZuYjY3bHZhRU43Mnh2QWRpQVA1VUVaK1FsMTMzU296aVpJT3g4eXdm" +
     "QmpDZDFuUmk0azhxblhVNVNCTkxNTWhWQno2Skg1TUxHdGZhSkRQcW5FeW5LT3M4T0hXSDJTQmJSUFVYOWFIWWhZWURHQnJLb0V2dDg5K2JKaHhkLytMN3RoRHl5OUpkM2" +
     "8vWkRxbVUzUzZQRnVTMmd3MWxrRkxGbWdxRTlUVy9SVXZlU21mbTNaVVlXeHNaS3VpYzdjN25NNE02dGhMOTYwSjNrbC81TEhUYU84eDdoYkRoRlkyWmhVWUk3dDR0eGhR" +
     "L2hrUTdxcVVvRW9SOGpiamk2KzZVQlZiOWJSNmdHRUhmUkREekJhRFpqaEVrZ0pDVllNS0NQMkxSdzAvVEN2czluUy9nbFl4UVVTWVpZY2xIc2w3RUt1eFA1VUZ4OHVaN2M" +
     "zQmlUczJZdVc1aHdPM2hZT01mMFd6bGY0cFZ0QW45Rk9CZlZHQUppUi9tVnpuVm5MbmludnRWanNUcUVrR2NXbmIramUxTlFEY0x1NkJKVWZaaUV4RmMzdC9Da2o1OWJlNT" +
     "hrL2ZldFJmb29XMWYwaHBkMjB2MlpqM1QzTWJjWFJKMTFabm9SSWk5ZU44YU5maExFTCtkOUN4SFJVYnFmaFhuZ2Zab2syNFNHaUVuMzBNWUhPRXNKbi9SbVg5d0Rua1BGR" +
     "G1uditrYzB5anord25FbHZucSt4cTNvNDhkMEpqYlBXMnZRVmZaaCtMMGhtekp5Q21CeWZoR0NEOVhCODF0RlpXSk5DQldSNnd4SmRzYkNpWXNwUG4zRGZoTUNKNTlSVnRB" +
     "TXMzNDY0NTMvM3BBK2pJM1FwamxPeDV4cG1BblZsOGxQaEpKWmxjSEpKeWFzdml3OW40MzZhdmMyWlpsTVJ6WVJxSEt5Nlh3K1d6dWJvZE9zZ0crNkp2ZGpYZU1UaXlQSEx" +
     "0Snk3NFZYbHJjSGFwaVRQZlJZc2NHWTlzbW9oS3NMS21iMEp0emtKZ1BEZUc1SStwTkx0VEFGREY0VHVGNnczdjJCT1E5WHY1QU5lOFpvbkFUM0d5RXFvV3Y2NW5MWHVURW" +
     "VYRDJMUk9PTjNnN3BSOUFvRnYweHZ4SmxvYnZ6SEhSdUs4NGIzZTlxUm9CbEpreHlPVHR1cFNScWQ0dC85c2YrQlJoQUMxckRRVUoydmFWaDFYYWxQRStBRHVFODZXMmZ4M2" +
     "xRSXZtbHRnUGlIMXlmRitjelN0MzIxWDRtMVlwdWNkK3BQMnkrRVNaRVZuUCsrOTd5cEE1NzQ4VjZqVU93Q04wcnVEdHFXNFdQNDZjZmVLQVFyY0JTR3dkU0Z3bkV3Qm0vMGZ" +
     "naDkwMXdWUVYvWHBzUitvdHhYcTdNbTVYSDNlQ3d1TlBoZFJVZDN0WFF2RjRHNlZDRTh2bW85ZTFEV0NTVXR5VUowcVM0bHc4eEkvUXRkcTRPL0lkVW8zVjVDdmFVaXFHc0Rz" +
     "MVFaNDNPQkltNWpIZUJkY2d1Q3ZIQ1pkWkNaZWdRajhTNUEvckwwTHNHY2xlZG5pN3p3RW1EOElyOFFRYjBhdStlQlZ5M1o0c1orZSt1clZWSmNFUzV1UW1VcWxtVGZYbFE" +
     "3OW1xTGhucS9KWC9SeFp0RGt1bXFkWXR0bmZwdStlTHYvRVE5SmE1SzBvb2wwSkJTbEViYmdjaW5CQnBsVkNNMVRGMGUxcFRVNUdORGxHL1VEa1VwK2c1SE5yc0E5VWtvbH" +
     "Qya0Vud1JMbE9KWXpEQkFHaGpCZ09sWmtyL2VUYlp3T1c3c3h5Y3FkZnNNRGtMUFhUU0VFV3Vycllrc2FYajdBekFOMnoyQjFFTVRDQjJ3N2l4Q2pqTUhQeUw2VlBSZnB2Rj" +
     "Q5TUZBL2NROHBQZCszeU4zZ2dMVHlJeVlqeXBzbTBkMG1YUmpyUlBwa2tETXdleGExNnRJN3N0MktycHRTQmZNRmE4dDVUUFc3bXZJcDV3ZThzbkQ5dWR2bytobVA3SlN0c0" +
     "tndnI5bDQya2FZbThmRGJEKzVvbjBwYUxaT1NPSXNIT2JOVkJZd2FYeHhZSWprOWlzUmlPSENBVUZmY3IzcURVWlJ1NHN6SDJKK1lROXY2MkZmQVpGYzRaNllUMGNIYWU5W" +
     "TlKUVhiWm1YTWJRay9jYzB2cUx2NGsyK2Y3RTVUZUlKYTNKSVBQelg0K1UvK2ZvUk0zVWZlL2doL2MrVWlzVlY3WHdKMlVmaEcxVWtsRUIvSUQ4a1RPNW5LdW5CRmlKWEx" +
     "kcWp2MDRMUFFGS3o1TlRYTXlxU1pNM3hEMUR4YmhtUFB3Wk16K2VUelA0bG93L0wvUFUxT3MvUXRVd0RrN1ZYM0NuWmFmbTdFdm56U2ZYbjdKWkxUNGhQVzBKTXZiOStlR" +
     "kVOclc4Zm45WkQ1WmJKTm9naUpSeU9sTFgvMWhHay9OR2ZFWjZZWDFEcVJNWVMwaHA2TDJMbGtLVnZPYThvNnVtcjRQRnRhSXdBWEtxTU4vT0RDU0xabkhFOVVtMmhPeC" +
     "9GdmZCd28yT1FOVHlxZU5kYk53dkowdUNPVlJnZCtnTmI4TnlGN01jUGtWOXlQSWl1VFluN25vYlRzMDFiK2Q0MEoydGdJeExOVk9ReHpldndYcmRtWEQ1dXZqc3cxSGt" +
     "iekdrcGlRUkJXUUNVMUNqU1dwRU82ZFJNQUZTNTdvMW40Ny9jQ2VITHlnc3BMc1hsbDlYQUlqQm5kVHVxeEJ0ZVN3WkZudGJpbW9xdWJOUkJtd2ltcEtCN0ViVEk5UVpV" +
     "ZXB1Y2JOMHBTb1JKT0Q2QkhodlpmSEVjU0xtaFloa1dTR0FnOHEvUUxNeHpiZnlTTmJlZWRkVlJPVzBhaWRjNUMxdXpOeUN2YWF4R2RCYnVjSG1kSm9kVUlMNllZOVVza" +
     "1BIak1YOTIvLzR5aDE3QWlQaFJWNjdUOXkwdUVyY3oxY2pkWEFVWXFqb1FSckl5TEVBYmxWRlFNeWYzRWdSay8rbkt5MlhSWHQwYXZQeGtKazJzNU0rRnNsaGx3aVM1OVlz" +
     "Z1hEeE4vbG03QkF1enBpM3JMRmEvR2ZVVEk2ZndZTThyelV2ZEV1a0JHZFl1SDA0Q3NZVitTWGVKQksyR3pqak50UVdxREVMZ3BaQUhYQ0NoZEtOWjFQZmpFWlJWOU42aFJ" +
     "NY1NnS3M3a1Q0TnRGdXFPMktWU2NwbXRtT2FkTVJ0WlhhTnI1emgvaFZnQjl0dGpkVHpyT0kyZGk5bnh6aGhlcWRnM1Y2dmdiQnVGb2JEU2plNjdBSGY5K1V0SkJ1VjY4QU" +
     "5SMUpmWXovWUdibi9UWGpPbmNUQUxKY1k2Wmc2WU1McUs4UnVmYW1vVXNkWkFRNXZKM2dwTFJvdDJGT2RWQ0wvUENZYUE5Nnhuc2tXSDhaU0xqSlc2bTZIVTdmbjNlZGYzc" +
     "E95UFlkWmQySlJGTldBRVN6bGJ0OE5BbGNjTnpvRmM5QUVNSkJJcjFKY2JyR1BpS2hJNWE2MW9DVTViVkhwMk5KZjFNdUxlb1BndWVYalNQS3k1WW9oVDNER0U4RVFDR0Mz" +
     "MTRNN2l5dVBVamFmKytkdnV0Qkl3MWZCZHptQlJvNVZoWlFHYTlXNWpud2FXUXpJSUM2ZVo3bkRObURxSWkxTlJNbVlENWE4N045VUs3QldTNk5JSEFBOEwrRkQzenRwUUd" +
     "XME10c2JCWENpcU90bThiTEczVjlBV0NyeEVReWNpd1pBYlhhMmRBTWx5S0grd242M0ZacHhDVHhMTjhmamcyVlFudnVhYS9xRjI0bWMvYXRxTHRaN1lDYW94U3o2enBpS3" +
     "Z6ZExpL3M3QmRCcUpLOTlvNkE0aFhmOWxzQkJTbnNVZDJRd0hXWnJQbjdEeUlSMmZVWHgyYjVaNXU0RnhZd3VnOUkyZUFyMi9GUGVCb0YwcHFlSndSakRZcVd4L0xpcWh6c" +
     "EVNK0RIY1VCTXkwUVdCNWF5Q2F4V0l0TTdLM1lwcURaWlU0Z2tiNm9tVktPdW9TWDkxcmNqN1VqbG5OS2t6SFVuYzNPU0s0MjdHU1UzTUg1NmFSS2hHSGFwVUJqUXFmOG5V" +
     "K3FkT1pybUt4K3pMTU02U1RNd3kyWU4rN1A1OHJscUJ2UUZBSFhMQW1JL2djR09WRzh6d3BTekMrMFJOY1FuSFQyazkxUTFHTytLU1VwNENka3ZNTlZsY0RZWEtoc0cwd1p" +
     "RSWt2eXFDak00ZU1UVlFsM0ppVUdVbGQ4dHlCRjdBNC9mcWZ6WmtJVHpLRmx3S3ppS1BldGZaUTZPL094RnVTQ2NaZ2NxQzROTTJuQUgwZjZtRjVIcmJlYlAvNys0M3JDZ2" +
     "w5bHJrMVA3S0xMZkowR3RkOWVET1NLWmZyRUx6ZmE5dzRGditacUxEVWx4UXBUNVNhQTA2Y0hiY2ZYdHVHVjRaemEyNThESGd5ejZ4V2V1eFlhU2xUUjE0VWFyOHMxcXI1T" +
     "HVlTzVXRjJ6YUx6aHNwajk4VEpjN3JaVEZoR1QzK2lNY2ZSNzlwL3hSZUMwd0ZFZjhScmtRUGlxbkRXRGsyMjdhb3l1V1JEV203Nm9ScWdDRnBlaFV1elZYOUpEVGlhMCtx" +
     "UzRyc2Y4WjhJSHB1VmxIN3Fuc1BDcWxzY1RINXhvQjV3TXhGZUJJeEpXN2lQZlhrZDZDa0dLRUl5bmJrYytQMHB4a2hIdkFqeWJFZXBETG4xR3M0U09RbzJVdElHcWRCWjZ" +
     "pMVpuS2NhMnh1cDV5RzhLemNlejFKZW5CVm5UbkhGdG04TXMvWEpZWHBKdVVERTNtc0pVaUZzLzM0cWhqSUt0SnhmdTFKcUhyOXo2M0MycW8wSHI0ZWU1YW9hTjZCZTl6Yk" +
     "QrOHBkbUJmK1JadG1SYldyVTZoWUo4TVZjZWNBTy9SSENJUUQ3dFFzb3NqRmdxRzI2RjlWeGkydUZ3dVBlbTBHWExnbXFjRklMNkZSNWpzczFDUllmMG9xblVFbTFHVmxKT" +
     "1dMWnhBa0M4R1ZWZkJWbWpsMXBWZ3hYclNud2U4SGpFNEpmOER1eERYOEN2SVo3TndGZnJIc0hpTFdLRWNveG1PRDZWY3U2cGRmdlM2MHNhMW5xODYxbzB6dEcySVBYY3hDY" +
     "W0veHZUM2Z4MUFFeXNWeWpjY29xRVNYQ0t2U1E5cCtlYzk4TWxCZUt0SHJjU1JuWkNYTlZpNld4S0lTdlhGWnpZc3J4anlDNHlicm5nZ2VmUXZEdm9ULzIwMHpMaWYybXNoa" +
     "2lJcXE3ZkRncGxPZWtIZ3ozRG10UVJqQkZ0Q0krNitzUnRnSDJrUnlVdkFMQTJnWUNRUUl4cTVFRFNsZDBHMmtnVGFQY2puc094Zm5WYnJvREszd0RkTXAwRW0zRkdsRi9pQ" +
     "WZZWjVqSFBxdUlOK0hBc2JmOFpRZnJtbzR3TldEUXpENWdFRW00KzhnajZQL1grZXRETFlSTzFMOHdaSDNWam1uYkNoUjdEZ01KOXp6SUxocGd5dlFzQXhRMkdKOFZkMmVDT" +
     "zRha2FMUnJ6dGwzQXZmeW9JdVk4ZENMNGdocWIrb2pUdjRhNGpLZG89",
    username: "public"
  };
};

User.loadPublicUserIfNoUserAlready = function() {
  var deferred = Q.defer();

  Q.nextTick(function() {
    var currentUsername = localStorage.getItem("username");
    if (!currentUsername) {
      var mostRecentPublicUser = User.publicUserStaleDetails();
      for (var x in mostRecentPublicUser) {
        localStorage.setItem(x, mostRecentPublicUser[x]);
      }
      currentUsername = mostRecentPublicUser.username;
    } else {
      FieldDBObject.debug("Not overwriting active user.", currentUsername);
    }

    if (currentUsername !== "public") {
      return deferred.resolve(currentUsername);
    }

    var db = new Database();
    db.login({
      name: "public",
    })
    .then(function() {
      FieldDBObject.debug("user is authenticated")
      deferred.resolve(currentUsername);
    },function() {
      FieldDBObject.warn("user is not authenticated")
      deferred.resolve(currentUsername);
    });
  });

  return deferred.promise;
};


exports.User = User;
