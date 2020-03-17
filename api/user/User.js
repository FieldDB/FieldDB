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
    public: "confidential:VTJGc2RHVmtYMTgySGVEc05QdGVNclBWNlRxL2pucFhqcnpYQ0JXUjVWckJ6UERXNGJwVUtyN3NrTTgwYlloeEgwNFp5MnE1cGhkbmwwdE11aG5vZ2ZVZmZqM2NJVlMzUGxCS1YrcDhPL3pQMkJldEJ0WUt2YmIvNXlqWkIybUVuL0VRSE9KR2NocjRVcnEySzNla2o2V0tpOFdIN1hIV3M0Y0I1UE5ESXhTa0FEOWxnajduWHh5YzFraDlxTllub1hDWm5oeTVla1JXVi9HTDFXeW9KMVROREdXakIwK3RBSWxGVWRHOE9HbjRkckJIaFlkSUk0RCtWc25lSWhkTGRuYkY5VzgxUmZ4OHZFdVcrRGpXa0Q5SEQ0ckVGRlNPWVc4VHRrUGxBdTZpbWFXQzl3V3pobVR4K2VGVkl5QndTYnRSR3lyTklNUGxvM0gyMjVyNmpXTUhnaENyRHd2N2tQOGk4dTQ0SFAxOUhDNDVTdXRpdlZYM2tzNVl2eHgrNmFmTUtlUTB1VE5FMUhyYnQ1MjFZWmV0TExKUUVuT1VKR004bEYza0ZMa1pKR0xwakJid3BLYm96engwNWxQNFpjWlEzcmxaOWM0UHZMTTFOS1JMQmg0NnVob2RQNktMdSt1YkpKZEZpZklrUkVkR3c0dmlSak9yUXU2SCtiakV1ckp3MlJOckd4NUdpYWRqMjNLYXJXZmdTa2hNS1ZtcFJrVmdpc1d1RlRwV24vanJTVTA5YkJFRHRwWlFjYUFPWkMvMmJITFpqWHNidjB4SFFkL2dNaWdOZG9XUVhORzdYcUJpZ05qMFhmY250cURLbnhpb3c3Tm1nWEVVdkE5dkk3S1FpMVBCT2Rnc2pXWFZKeHlyb3NTK29oQ1dtOGNXYlZRREo2bGUzUENQMHlIZEVQeGNzeEZHbFNxbmxsSHlUQkxaYnphVjdHTHoyMnlCY2dFQ0dDNjNva3owcFIzaGF0VUErRXg2Wk95R0IrUFBJaDVKVVZpL05GTXlDdkVXa0FMaDFJZDVoZlJrdHhzMkNydHJzL0ViN0hmZ01QMnNYTkVuUnFNOTBjS2RmaGYwOEZwSWNYQUI5VEVSN21abWo0ekRManA2VkF3dVFoMUVMVXlKNjYvNXpNZUJnQjcvUE9qMzhRTzZWYjRDK2JVUEdhdGIydU14Q21NZlFYdWhNNU4yM0d6SHY5a0xFSE5lRENLcXhkc0RGSENUbWd5T1ZtT0ZhNndUcG9qOXY1eVpwcVlWc0U2L2ovM0JLck5sZTJhK0JzVWN0a2hobXh0YWs3T0NLVjdnd1laZXZwcGhjWVpsVHNPb0Y1MGRURk1jVjZDalVOdmoySEJPUW1scUh6R25jbXRHVVBWRGNuaEcyQm5nT21nd2Q0WkhPYnRORE5td0JkRmFCaEFtWlFrZjhOUDB4TFB6VDlHMlYyY2hrS2hzZnV2d25SdDFuZCtSTVkvY3RaZ2hlTTZiOCtmR2w5WWplWS96OEIvRi9rQTFEeDdHa1VmYXlnNGoxZHlWbTFkQjNFU1pUdGpJQXFMMU45Q28rSGdaRy84Ri9oQXIrSGZvcWxWQ1ZIdm1TaVZNR2k2VGdZUC90N2ZXM2ZxUXlRNTFhSlhOc1BZcGlHdTFUSWZjSzQ3RDFETzRNZzBlK1lwNVN0OWNnTkpjakNOSUI2ZHl1OERGTm05eTJzY0U1S2Jib1RxTTdib0lPYTg2KytRNnZBVWdHTjRybUtXY3RjQVdjNjR0b1BWSFBqMGpCVENBdys3N3FoZjVVNklyZFJqS2JnZHFBVWQ4VEdmcWR2dzF0MzZaS1g4SGV0eWhKV3l4YVRNTW82QWpWNGQ5VFBieHNINEpVWmJmMWhhT2FSZXlYTFVTc0V4V2U4NjdZL05RWFhZMTB2SHF4M0pQTDF3Y0p1aldDSXlsZWtOWFR6NlVzTU9lTDlHK3pwKzg3bmFkU3o0SzZsOTJGbjRnemMwQXhTQU1WWU1ER2JiWmxmQVpWdWFadU9tSkRkN1M2eWFDRjkyNHBjRzJ0OGI2alhzNUhBZ2JhZk54K3phd2tMMDRWKzBhZkF4eEhKQWR4SFFDbWh6VW5RZUM5M2grSEVHbkdqUDJ1Q3BZb0pWWDVuY0VRaE1WbEhrQXpxNWtyelY0Tk41Yzd6S0Ntd3ZUbkN2MmN4MjJtRVQ3Vy9vTXNHK2hBTVlDMS9uOVlhZzJXQ3Y3K0VvTkRvM0Z4SFdRMWllbUszTk9jaVRFdHB2OXZRSWJqdU5KQ3l3NXFzK3RwQ0dubDgxcm5NUEdHcnhxbGN0TXVZUlZHZ1ZTb1VTSXlyS3pBMi9zQm9sSUJIdkFiZU5VQkFCSTNldHdvTDJQRzkya3BvK3ZIdVkyQnVZUWNXRDlOK2ZGOG1UajdOVFVFTHJZWTlBMFN6akY0bHpoZFRKa0tSOGJpYmZTYk00RllmdHgvdWNZQVdTOFU1TDJiN0dpTzBSQTlXZU94RTVyUzZpZ2hjbjE1UGc1Rmx3L0h4eTdyMXg0TnJNckkwWE1GZXhackVBbERZZUlrOHlCMis3Uzh3eFAyeTV3cHcyVVFUNkI2MXFmeXFkNXJHMkk4akZLM1lYaExRODc0RHNvYjBrUDFHMzk3dUJHamIvcXNIdUhPWDJsL3pQY2lJR1lwRnJ1elFLTWtTK1ZTQ0xSQjJUUkJWYnNZVjNyQlZMRkdOV2plbDIzbjVNeDBoUkd2RndHbjFSWHFycUh4d0xWYy95aG9SaEZuZUpkYTlUeS9pak9uOHIxRC9KSlplcGlQZFpVSjFsWE9vWlJRcTExTWVWVkxYZSs0Z3cweFlNWXA0L0hyOWl1OVlrU01PQ2w2VzRZSFRKelF5SU5xWjBsSEpFTWNXU3dmZUFadjRmTFBsS0dTMi91ejhPSVFqYmplcDNib1hPOTB4Z0ZNcjNsT3JmakJ4OW1hMjdSVFZ0RGlOYmZPS2F6NDVGYmY4ZGlpQlBTR05TeXc5RkxWTWI3blRNM2lXT21lT3dHSTcyYXBSL3FZWUxBM0RKekcxZWNzRFE2dlFpNHBJeU5hVERrYTIyOVFmbW81c2gxb1FMOW1mZE1RVVJiOEdNdjN5Vk95dWMvS0IzaEhneFFMZ1hUZGVIRGNSeHU3Y01OaGRwRWtpclRnQ2VJRFkzSVhRWG9rMnhNMlBpMUF6cm5QSzVXenN1ZDQ2UjRDejBsTS94U0NqVEs0WG1ma2dMS0xtcWlyS0hZck1QaFJWcmZRd3Erd2haOXRtdFVobEQxdjhVQW14b0FJSnBKdXFvY0hmOUthZU9XTk1HTXVVRzl4S2xkWTk4RUR5SCtRb3QxNW9yM05hdGpnTXpubWhlTHkrTUREclR5YWZvMWZpV0loUlVlYnR0RC9ad0xNYThFWGtGTFYxWXFzS1M1aXpkV005K1BCb1ZXb1hldFRhcEs1L0kxcjhKeTM4SFJvYWpIRzArS3YrTEZ4TkROSisvVmU4VEx3UXUzTExXa3FqMkVlaktsaEIvaFJWWENvWFJVQ3ZSVDBwS2JZQTlqYUlZcC9oQlV4TkNmOHlGcVV6SUZJcnRlZkVvNmZ2aktoMVJYZ2FVYUwzSTVHTmx3di9MM08vMVBuVEVlMDhGelJtTlc3MUw1ZDZjSDZHY2krYXozZ0pSSXhWSnZXbzBIeVB3L01FUFJGd29hNCtxcWFpRTUzcWl0V0JSV3JsN2RtZ1lKb2Y3dGptSUxwN2tIdlFwZE1INVZaeVVsT2NGMWpWdkM5bUFLVlpRb1A1d1FPOWt0U1dTa0VSWUc0T3d1M2NWVG82QnRNUmVuMTA2MnArRU55NG1idGdYczNkQkNKVC8ydDExdWF4UDBQdWxRWWZNemxBMmxGUDdkbkExVDBaZ3h0SERnSzVMa29IMWRkenBtUXJUaHIxWnR4Q043cGNVWDQ3KzIrUTBOTTdGRFlDeWdZTXJWZ0ZiVDBWRDlpZE55VXBldzNFV2QzTUpvdmlSb1NoZFRSSVFwanNZTjg4SC9MY1hzbDByeExjTUlZejFSazVkU3c5bDVjenlXNGpBYTZ6THZ5R2xIRDBWUkp6b0IvZWlnVy9rUDNtb1pMdExKbkZuRTlzMGt4N29mVnF6cmtWUVNBRGZqZ2hZVElXS3JRcVpmQXlSNk5sc0UvVkRLS3g0S04ra3FlbktVVURFdloyMTVKaGxHRHdyQ1hpNnpCZ3ZVMDEzYlhhNy9jQk9EL3dKWHNFZTN2M2kyY2VmNXVYdlg1WE5WRkptcnFPalpGeGVVVVF3QVEvczVveXdaYVN6eGQyaHppUFFycTd4Z0JUaVpyVjA0bkhlT1dESTBCdnpVRGh0ekplSTRJY3hmblJkdm1ZUm13VFVMVDBTOGd6eSs2WXFLYkdrdU92MTFQamV0N0t1K1gydjN3M1gzL2o4VGVVWTFEaHVVMnFMZkNsb2VYenZha3NVL0Zwamo5Y0x3bndCU3ZuZHJKVFVKczJBU2hJdmtCV3JoTVFiS0RMMFhYM3V1OGp3WU1tREJWRmxITlZVam93a28yam0yT1I0QWk5WVd5VUhZbkRUZEZpSnZmRGRoaGRyRVUzZDRBSWlZVUdvZlVDank0VHA1TWh0UTlENWhUcXNxTVQ5UXFqN2QvNDdsQVpuRXhnNTRIUnFDUjJ4NHU4Zm5DRFFrSllYeFJjZXM0TDF2d3lZNmZJc0o3Z3hDekdvU2dmdzNRaUovYU9KRVowZXVKNWN6RUlZT3dTajZSd0RWdm9jZlBFdlhoa1NLWnA3YUlvZkZFVnpWUi9IV3Q3ckhHcDAveDgwNXRSUXpkdjJPNHJrc01qWGJVeHA3Y0h4dktydTdVRWd0U1gvYU1mc1hHTXJOZHYrZUwxcW9WbGVkZ2xNeTMwazBqK1ptZDdsMXc2WnpGU200YUlGYUxwdTdPcGxVcFdPZ2dQTzZJMUVUbXlGd1VzNXArWnE5VTFjS3owbzJsN3hYNXV2djNyUSt1R2VhRkxlR2N2M1V3TWtFOG1BZ1gvRTJ6eU9ubGd3UlNJSmtMZ2JBNHQ2b0dPeTI0SERMdzJ6ai9MdkFwbHd2YWJ4VldJdGN3VmhSL3JEUlYyMXZsM1JRQ1NHdm9pbjlobWpSSU9QRkFtR1hsTFZHZGFEMWJkcHEvaWsrc2ZTTDNCTG1aNm8xV1ZlclkrZjJXMzRRM2JZakdkQjZtaDZaYkdpb1ZGdEhReEdPd0hMc01ZdlBmVk1kbDZML2NLWTV1RC9PaVV6U1U0R2REWTZLSm0vck5FWGw3WkdVQWVKSERUcWRFWFhHcFcwVThpT2hqd3AwRVV5WlBwcGdpY0x2TVd1MVRwRXVMckc4WEl6NkZpdFlFSnhVamtrT0QvZHlBQkl6QXZHQ3pUdXEwNm9HWTc1RzBHSUtsUXJGZTcrSkxCYklVaExKaWQ1RW8vbFhtWDhObzVJelh2Rkxpem9aZnNlOEVsSUNUc1c4S090c0RyTVFiaGdPL1A4dFp2WGt4SWhIWWd5WUp1cVZVMGtzMzVDZzg4Mno0Q0EzaHRUNUd2aEc3c0NOQmk3RE5kNFA2bitKNlN3b3ZiY2MwLzU4OCthNjNIM1BHWDlsbGIwTkt0alk0WEthQUJWWUY0WCt5NFk1VlFkUHA2WnRnS3RJLzRVUVh6M3FjTDF6bWhvS1NydTgzY3dIOWdaN3ZGbmRpMjdjL3lPczZ2WEFKL3FkVzF3amNkN0UyOTV3a2FYVG1vRW9ObXgzdE5aQThxZDV4bVprTkc0RXpkYlF0bko4bXhVbE5CRFg5WURvZXhCQmdISjBzcm82dVcyNkdSQVlMVk96VlYzZ2Z0ODFkM0dicVpUM1dlMkZBQ3VRaUdtZFBSNjlVOENnQ1ZvM1MwUXpuTU1KTmUrQXBCRy9iUk5jYXd5bnJhTDVOZnBmWkJ3T2FHQ1lwMktWdXBNUnVaN3QreEllYW5HRmoyWWU0WlpNclIxNGJ3aUFDT0UyKzZRZlRQSTJRQTlDNE05NkNlWGNWdkI3azRhSFNlckNIalluVEFyTUxEQlNqRU5nVGF0VjNBSHdNYnVFTUZrNVAzWDdrZkU4VW50WmtTSzFSUlJ4N0ZhQzlkZEtzVElwYVV2bFRFTkx6dmlicHVORU9XUVVGdUVKTXQ4aTdyMVlKeG5zZzJqVnR6M3grcy9LdzZvT0s3KzNINXVuL1Uzb0hrZ0pobGdoczJvU3N1RHpyQXl0RnNEb1RFd2kycGpJajFQQ2V2K2F2cmhGL3dmS1VUMzZUekk3UDJyNTlxdXByVmhVSUNXR1ZYMHJmUTZPYjhuN3UzODViUmMxS25tUUxxdzdLOCtuT0QrSHhSMkI2a25PdEdielE4c2pSakhWTHBId1hVUnZDZGtMOGNSUE00THRCK3dTN3ZMR0d5UnkxakF0OTQ2di9KNlZ2emVIdklDNWw2QzZ3WTFvbVZHQmI3MVRqRjRrdGlpZ3ZPUmFHSEJ1Sk82RHFsZS9helJSOU9jVnk1QlRVd2MzN1ptR0xId045RU14WHk3d21PdHFKL0pXVGMrOTdvUXlsbVB3anRvSXNMcXJzNnhCa0tWZ2hUY2VBV3VHTnc3bXI4NSs4dDVXeHF3cVMxRGVvUFVpUjdpU1RRWGpLek5Za21mUnBQdjQvdkNjbmQxWlF0MzJZRHBHQXVGNGlkZUd4V3RSNWYyVDVhQnVWNnFDZnVlT04zYWMrd0xrZ2hnN1ZRa1ZEbFpVKzJJUmN1YU4rYjRIOFpZQTZzR2FDVnRhdW1ib0l5d0NIaGhGeHA2dlR1SC9RUnd6UFBrSG9IcUFKOGVtUUJMaWFtcnJFQXhhSDdQMDhIRnhjNjkwZllvTVpxK0wxYzJyN0ZMUDd4TGpwdWpGSGZUYWJxczZ6VjA1UHU3UEw4QmdCTndTdi9BbmJna05mQ3R4ZUJHRHR5azJ1eU1wUmFXc2JQTGtYdXUyY3VoNlJlc1dPZFpHNVB6bFVLUWVyNVNKWXJzNm1maVBqRkFQeE44dzNlbW9mOU91RjBnMm9KZWg0NVNrUjBYMmh6VU1WZTZiQW1QYWZsSHg3Z21KcEwxWTJRSFMrNDR0eXpWWU9QSUtGMitydkp3NE1ZWUVHZU53SW9UekV5SnQ4TmtOMVhaM3hlZmxTVjhuRjZXY3dxdjBqTWNJU2w2RXd0NythR3p5M3lxdXNLS1BGZFpPaVBFalk2ZU0velVyczBJalhLbWtBRStZbmMzV0MvNmZURzVTUU4wY3RRbS8zbUZiV2RXNDUzZGRqcTdkdFJrUlk0M082SjZwMU9GOVV5cVk4eTIveERINDZxRkJrK3pXcGZSRDYwa0R1UEJYSllCanR2cENGbXZKeWV4Y2VvQjVCSk1IREEzSm5nMzJlVjFKVGRQUzYrekFwd1JKdlNENEZucXRNNnRrYTFQS3kvTTRpeTk2Rm9XL2VyMExvTmVHNldYK0VtamdQKzJWWFI0R0pVUERZVnZMS3VEckxVZFMxRXAzQVM0cEdiTGdMN3hzc1IzSzNZU01UWlBFZVh0dHF5WHBMOEtJS29KTDVVYjBoZ3hSUG9JRlovR3M4eDdiRFErUkw5Zk5HZ0E0RERRaVVpYSttVUtQZWRxcU1hUzIvbDZzOUVpTHVXRFVRTHFkcU1CWkRiREVmWlpmeEgwMU1iNnk2V3Rzbk5veXVLSnNFOCtlei9KTUVRS3BVMFlrakhYVllOdzg4NXE1Wk5NcHlwSnZMRXU0MEVEOVFjNHBDSktGUG10WGwwTTEzOE1GVGoyYnRIaXFFUUFueGRYbVpyZGpldHJNMzZkMmRrZU1rbWloM3VOU216OHZ0cEpvZ0pnTkZhYUdQR1pkTUlzaW4yYjMxa2g1ZEtSREh6TCtQVXE5VTFSY0VaaVFiYXcvM0tyZEF6NmVoUWZMbmkzcWo0NnJQT0hkRmZFVFd6TnpPa2x2cU1UL3lRdnl5SU4zTElVUUxKbXNmTUJiWFppZXd2YTlQc01BeUQ0NnRyYTg3d1dnZUE5bHo4Tm5obGZyM3RPMWR6OVJGSUgzdXZNaUlYSWZtc0xMSjRlQ3UwRzFzVmljQjI5dGpaWjNuYzZVbkdNYmNaWjlXaDc1NXJqSTRySkxTN2pZbDdJVDNFTlZNNVoweDJYcTNZOG4zVFR1ZGpZS2tFakJMU3JzeGhJY1FhWWxwbGo3V1pVN2Z0SDNMU3RQTmIwZEJzT0lHeTdJTmhsZXVWdWlzVzBjWmZLYUt6V1RLMmhTd1ZKUU5XaUQ3R0dKZVNsQmZiemNXMGk0bEtLQXhOalNvRUdLdjBiYkRseGUrdVpEdCtLRHdCdER4MjFVWWVjQUYyL2JUdDdiaDBxbjFsTldaU2Q1SzJ4emg1VnFpY0Z6ZHZoeGdjeGtVOU1XNEdZMjRlUi9MTjZsUFFrWDNXUDM1NXdFSGpHMS8wQnZIOHFZMkFRaVYveTdvMTlaV2VYL2JsdGJzR2twbEFMdmU4THgrdHRkeEF6Zk55bmFTQ25WM0x2amQwWjFTRUcwM3FOSHJJVE1jdmljNzhpNFhISlJwc0pOTkJiMHpVNG9SZmNuNWxKaVRtM2hwS3NGOVorMU11cjliMDdoQkMvOFNoNzZxNkRDUVpnaU5aYVZLdTNzUlN0bUgyNUF4TGdlV0NHNVJNcVBCMkVsU09aVXplcGtCbElIVXhtL2xGMmZqVkJsZzU1OFE3NGJvS0MzUFNFakhDQ0VmTGV6bnphMVQ3L1FRczRNSWh3MkF5aUQwOUh5eEhhdDlwcmZqYjRDTXFOQ0pMZVZGd1QxU1B5Wm1icXNDa05Kc284OVdtbFM0dG5vM1p2dkt2aFAvdDMrbjZnMkxEYVlaSWJwd1lOY1RMV1Q5QU4vQVczZGpqN0llVzIzSmtxZXd5ejFiaDFpOTlUTXloc0JmbGFIb3MvNFFYdkNqeEdUQWo0VldzaXp1K21YNytKNGZ0N1NveXg4cEFLQUJhaW4ySEZVU1dHbU9JZXM5S1VmV0I4MUhLeXlIYlhPem95K1BWS1lFUC9pUHdFS0d1NXplT2hhNW1FdmkvWVZ5ek82ZkxKM3J6bWthRWg4NTVvRnQ4dzlPMXE1SFIvL0VScEM1MmlnVnZvZnloVVg2MmNxYjJlaEUrTVJoRDNnOUlzTkowTEtLd0tzeGR4c0lLMWlqMEpqZG9teFBkMm1sMXVSaU1ZWUJMWmZydm54UGlDWlZjTm0rU3RhZ3p2S3RIYS9NUTV3NWdyU3V4bCtCMjYybjRBaXV4eE1SOW90Tm5YZ0hoOGJhc0thS2ZVcVBpUUpXQXc1WEY5Uk9sYnF2elBWY3V1UnBEeWUwU1lRMHhTRVJXRFVqYVllMGdhNUJPbnRaWmt3dW5RQlpGTEpUWXV3dVppNDNpa2xpZkNsWCtabkpVbHBnNEg0VFhrZnlXNFgzNExyNkt1YVJWYjFRK3lEUTVMbkM4bi8wREl5d3VhOEFQbmRRRC9pWVdZbUZvVVR0Q1B6NGtFeTZlY1RZVDNsbmgrZXpGU2h4a3RCbVR6ZHZiOExURkthOG5GeEY5YmNxU3FwT1NBcmQwbE8xMS9iVGU1VVBBOVdhWHFqZUlpS0MyMDBjclhndG1EcGp1V2hTajlRNk4yK2hYV1pNQWxhYWtqZEFTMk1qc085Q0dyOWNxeFRDb1RhUlp0ME9yaW55dU5Pd21DMEh2aEo5VXlSM2l2K1NlSEZsZTdEd2h2bnJBZDBvYlo2UHk2TUxTRlpLY3J2ZmNVeEIwWU5Kdm9xQ1IyQVlKcEhDb0ZzZ0doV3JtU1RoS1dZM3NkZ1ZJeDNrQVNxRm1xd2UxMEFMNE82cEl4Qmp1TGN0dCtuYW41THViYmFzMU5xMlpleHNCK09OZjdESmlCaWNaK3QwTW50TS9HM3dzc3ozZUdCYzJGMTFFZlhQMnJadzFnclhtL3FVNlY3bCt3N0VsUEF2MEs3MThmVkx2NFNvZ2lJR0lyYkpuMzV1T0p0SVc1Q0F6L3VxS0p5SFBiZFRhRGFscktSb29mTERtYURtUWtRZlhaU3VrMHZ0ZVgydDJlWFZpWTYzYTl6dUUvNmQ3d05QRkplNVdvMmhQTGczNUZMeG5HeVUrSzM0S0REU0dEWDJ0MlB1Y0g4d0J1RlI5cDdrNzFGR3hyMTNzcWwvc3ZFM2JnM2FlQjdJRFFzU0tpMkZ0SU9EcWx5eERFdlR5Y2pLS3d5YjNyc212aFVQV3RsOHRYZHJ5dWxra29VWnl6VGhUcHV5aFpKV0M2MzhZc3IxQU1Wc1hKYjV2a1hEcm9NYUNLV0ttNGRNK014YlFVYmVqbjhuTVovWTV4aTYvUDUwRXRaVmVUZmJJa0Y2akNYQ1pNNlBXSEVuRkNVVWVOOSt0TTNoRkE1V0dVa202Yy9vRU1WcEFGVUJWbUhBWGpBZ3RsZ25aNXV0M1dqL2FaMndTTHN4RzBIdjlOd0RMa0lOQWs1T1JuRjlIdk9QOGRSVmtPclVFMVE0RkZ6RFpRdGNNWDM4bE1Ea2R1dTZrMnBJWVJzNU9UaXZpVEtPeUcvOFBEYk9EVWJUdEQ4VTNsK2ZOM1lObFBCaDJWOCs1K2IxeVBoTXZUdFFhengrUHNteFR1ay9ua0NxWDJ5RjlVL1QzdW5HcXJDeTJ3aldBZlNhZ1diUjN1Q2ROVVFFU2JRUTltTGY0MkYvaWRKbVVDTU1uemtDeXdYWmt4NlE0R2pPOHczdUVkclFZc3F3QjBIekFjSGN6cUIyQ3p1OTJFeVZ0bU5sTWdzeW9PYlJoRXNFR0RUbXN4WEU4NVlaUjNha3M4NFJzdXlnMkQ2QWUveGpNNXJjNm13N3NwNXgzUGRlT2w2M01VUXNyMFF5ZDJmdTdxMVZ0K3dObGNCeVlDNG92aXdrQU9rMDgvMGl4b2JLWW1mK2dTNGZ2emxXV2gvZVJnbEVHTy9DUWVsOTZQVTk4WWFDU3NYaUtFRFJESnE1Mkp6N1UzM3BmQm55d0JoZUU5Z25HRUFzN1NvVjdwcFl4dUZvQmhhakJmZzBoeWhNMk1uUkFhWi9TR0h3SnFRcFVnYTdCcElNQUN4T0hWa2VVQzNmcXI0QytoZ0kxcURDR1NETDNaSzc3UlMrajNMUWxwWmsyWWZud1F5aTBySWhTL2ZmMWhOMzVZVmtrZDA0c2czQkxaaVJUL1JjWVRjZlhNN29MRTFjMTVRa2d3RzZ2OU5QekROaUJsYkpNOW8zN0ptUXo2U0VqMXdiU1hUZ2NhTjdIRzJ5S1V0cm1nb0RPTnhzNzBDTUdIT2k3a0N4VDIxaDBnckVNSTR5NnZwbDZ3RkplNi9GbnJ6ay8vM0R4RzFCRXRDMDV6YjRiZkFMWnE4Tm1qRElIUU83dzVHZUtnbkN5TWM2cjFQM1pheksyM05xQ2tiam04aDhQQlJFN2pienpTdUdzSkswWjFVb1hoU2xVZ1ZzNG5WMEJ6VjEvWkpUdnlQOTBIQ05aTElVTEFEWS9CM3Jrcy9DNnlDRmN0NGlmaTByb2VmWXgwY2d4Slc5SU02TTJzbThnZEtHb1JXM1ZyeE5sY3loSHhCU1pJYzZOUlNCaThqSFBPRmZrOVdLaUt5NkMveHNhNzh6MXdmYVVIc1pIcVFVWW04ZXJTVk15VlBWSkJzOHRDTmJSMW5yQVFQME95aDVVUVdFSGg2dDRLc3hoNUFMY2JpSVFtQ0Nrb3IwVkJUbkxXb1RwazB5V0I3VlMvQnNETC90emNTeXN0ZHd5cVhWM1dTZVdSd0xNU2pNRXJWMjRrbXlaNy9CT1lwTGZYblB3TmszZm92OVY4UXNESDJIN0lkMlFqdERXMnpqR05TODBTMTJ2dGRhakNIckQ3UnBWNTNQRlh4TkJ6M1RVVXdVZm9qWVd0ZFNWd3FFTmtscTBlVlRpWHVDcG1yb050MnJjVTExYTBDdVpONkpYRS9oUG5peXhTWEYvVXhNTDNVUkN3cGdybnRxOGt5QTN4WEVleUpFNlVwMEp2NzNxMHZiTUpPU2NBZlZCZ29jeTBhaGFUbVRrZVg3dnltT2RNSEpQdVFDYkpzYjkrU3hKOC9ZK1VMb1VlRER4bTQvNVN5WGh0cVRrUTBlN3ovUlRiQVMyd2drQ3IwYTIxbHluK2dkTzh2c00wRjk4ZENZWHBiYTg4WkkzbmZ4RnAwN3dvck9VajAzVDlvM252bGNYbUtzSGdUVWdVT2J1dWFZOTYxdk9Eck41OTB3cWZCdGRSYlk5Y2FmaTdFdFNmZHpDY0NXblpsWmhQQUZCTVU3eURtSDJxMTYxMytKU3Y0REZGcHJnNTRXTERFbGdyQjRNYVQrNCt1UDdzT3JaWjJwNUh6U1MxTkpDL3d0OWkyZjQzTE9WU2xtaW1sbm5KQ3plYXlySmw1Z1lzN1lvQktpNGliY3p4MEFyODdRN2d1SjNLQ2ptdHBqK21UaStvbmd1NHI5SkJObTBQUFl0ZHhWR2RMNEgvd0kxdXdtTWRkT0Z0eHJVR2plWnR2SGVuTVhtdGxZZzkxK2JZU0tWdmViSGpyZElhSTBmT1RJZlJNd0NXdFd1YmZONjR2TjFDL0dQc3JUWGkvL2p4ZmR4RnVWTFF2dFI0NXFYa2daZFRPL2ZUcmp3TUJRU29VL2VtZmtIRlM3ZmxTNkJaWGdYUDZzbFBIUHZlTEdqK1Y2UVQreXIrZ1M1S1ZWeXZPbU12UEtqc1p1Z0xSa1F5RmNpY3VMNmMzdEJwUk90WHNjVDBhZWh6NWwzcDN3THUzeTh6VXVVcGJsSFp4MmtTa3ZRVWdUQjBLaHorQ0gyRkdDQzUrdXZzVXdFcmdEMFY4MSs1VSt5TWdTdDBwc3l4S2xOOFlXVHI3U1hrYnRYNWRQcVlFTGF2T2h1di82Q0hzOGFKMnduQ0RORHVMM3FMME1wSzEzeDhkUDZPSVo0YmNKV2FOdXZTZWpRQm9meTFLUVpCNVdRNUxybk53Ynk3dVRGUS9ObWZYdW1TVlNEei90V1ZMU2hNb0c1RFIwdGFueG82K2tpNHFlaFdjbGN3NGJmY3lPcll6YWU4WXg4a3N3S1piUTRvOXNtMytEaFpxUjhPcTFrU3VZZVA1YmtlclNVZCs2emlqRWNYTE8yL3lMQzAxSWthNUxVaTFTUUpmKzhObGJIMGkyejlvRWtTZEM0c0RYN2ZGdmV2QXJwUHl0cW00cDMyZVNIVkNpVkM5YVN6S3RoOWlVVGE3U1o5Q1UyVnkxSi92a3pFWnpwRzZQd2RrTWlKMkVKWWpaL2MwY2d2cmtrL25MUEJGQ0E1T0FyL0IrYnlVR1BmQzBkNml6SGJiNEJkeUtNcU10VFFUS2FBR3J2NTVyZkJuSHpjUkNRbW5ONU5EajZ2ejZjbGZxbFVGUnNVUmpvSG9BUGwybGJTdFBIU29vbCtnT2VXOERtaTAwNDM1Q3BWc3hTajd6MlViUld5RE14VCtORENIWGRVbXB2ZzN3YUQ3Y3BTREgrN3h5bFcyaWhNNjdOTlluSzhGR0UxQmVUUTEzUkkyQ1NyZisrcGpWOVk5clVOWFVsTng2aUU2Ym9BSU9lVDJwRFFSMFh0OFJWYmoyMlJqZEtRQVhnL0ZaU0o3aXU4UWhadFFnaGUvL3F4QWg5Y0NBSEwzRmhyOGdYTnZjSi9TR3lVMVFTSUE1Z2tDUE92WUlkOXAxMk96ZDZjMmtSb1UvdWZSOThiRVhYMWlVeDc4K01RMTZPQ1JVcHhEcW5YaHRrbHlBOGRnYnFtaVBwRE9QUWRXQWowRHB0RUVNOUJZWldkaHVWZTV3LzBkR3J0bVIyN0QzcFVZTFpVNmNFbGxLNm50N2tRRXdqbEdKMjFkV1pheHozR3lBSEVwMDRMMkJNTUFsa08wdmdpNUVMaURKLy9CdUhwQjVvNFJGOWdTcmhESnZLa2xxRkxrdGhjUzFOZFQzSHkzMllLNFZUdkRDSTRtalBLM0F1K0drUDZ1U3NMS1RERVAyZGNQS2NnSTEwZkZHdElrYXpUbXlzaklJZnhwODBQM0JOaHNMSW9tTnRhMGVCOGJ6NEQ0L25SWXpUTXAvUDRDLzZqalFHaE9DTXU0NGtreHlVcEZLMWJwRi9VQm54Ym80VjFXWlBqRS9IYjZnMCtGR1RXZkg3Znh1MTkxMnF4UThEa3ZlZ1piZEVOeCtERWo4dXc1VWtRM1Z1ZkdCS1pQNWdUVTloNmRDOWx0dUgvTG1hN2hIUkJhY3BzSTRYeG90aDJOczFNWjNiVU13cDJQUjk1eUpUR3VSemFncEhiWHZMQ0JWekR5RWFNdC8zaTI4SFFuS1lpS0VJRk15TzJuYVFVeFR3ZWdYT0RPY1B1blNKc3dYeU43dGNmeVh5dGNnUlJaUG93c2dOYzNQamZ6bG9NamJpRCtZUXdtWUhIZndwSjlhbXF5YmtNeDMyS3VZMExXY3ZKKzBadndMNDJ4N1F6TVJZaUN4Q1VITzQzeWhYWDVhZzd1N1cwZFNHL1dBcGt0aThJQXY0bHNuTEUwbjBqbDU5cmI5Yi9VUmRkNlZwQ1d4NVdnUHVUYTBnZmhmQWdpcDVsQ1NxVVhubngzckxERDFIY1ZQQkVOalVkV1BDZjY0MVZLMkZjQjlVQjVCVkFuZUNaRFFpRnByQnkrQmtRV25MK0FTUG1sZlkzV0xRdDZrRlVGR3poVlJEYTVaWVZ5VW5WK0RiZnBRdEJpUSs4YUV3YUlsaFpaejdhQVNDT0ZmNEF6c0x6SnRWcHVsTWRRbzFLMGJxMnZkTXU3V0hiZkJxL2xVL0lWWWdzK3dUdlJaak5pakpKbkMycEpsT01NWEVZcmNRbDlhR1VmVDcvVWRZVXZ3MERuZjNMUnNDUjc1L2ZmK1cvT2VrUlR3OGwyMDhWemcxMkdKUzREVnM1Lyt0Smk0SWZOM1pxUlF4TXVranNlQkRIUFdxQmhzK0RMZnh2ZXplbmRkTEMrcmhROGNNTER6QjJVU01CSW1VeEhMMWFTS3h6MUlKdFhsemFMcnJCUFY4N243RGVWRVRXcW93YmoyZ2JMbGdtczVoUk43RTNvanZleWJHbm55UFVVcHdrZEI3VCtsMFRrK29ibUsrcmJjRzlDTHFHYW9BZ2JjeU9yRXk1a3NEb3B0OVJUaHBNdCtUcmhzOUZRTUNMblhMb1N3T3pmWlpHaUh1ODJsNithRnZGS1dCVmgxaXJyZGdyV2JMNkpiK2tobjB1MkFtZUV4RTdDSkFaOE8rYnpTcUpwREhyZE92cjRYaU0vQlJGZVdCRVA5UEVtNStqbjlwN2Qzc3MrSmhGSi94Zjhybi9ieFhPQ3ZDQmJueHpzY0lEM2F0aWNSMGt2OFVpMW1LQUlOcFVYamQ3M0Vja3pTQk1sbmhVWHp0SUZPVzlONTRDa3hmYUxOM2g2WE5HSXc5dTJUVXdPbS82bjhaVFV0c3dYbWZmaDl5SlEwbFQ5QWMxUENoOVNJWW5RNmhsWlhaWGQ4UTV1dmY0Q1pLaFpyK2tGaGhvVkk4QTcxL3pIZ256amI5cjBCVElqZloxUnhsYVFyVFBwL0tMQW1FNEpFWE1YVU9LTkpJRDhmMUFpSCtlbVd2K0h3NEo4N0lLaTB6c01jRnhPR1pnVHhQQ3h6WEc3UlBFaUIvY0drSEtvV3dCb3V2OHVZVm40clBVYWpEV2cxQzNSbVhaQUhZVmcrblRPVnZmUUZURncrM1NZdGkzalhmaGhUVFdWWkluK255REVVUHBFVXVrMmRzOEVqblFlVlV2MjIrQVIyQnVTQkM0NGk1NExYem1URzRNSlQ0dFpGN043VTYzSjNCQXFIdDNUNWQrdnVyTE92c29nQURvRERvRENKSTdrNm1DSy9VeGE3eElwSnZpMzFOOHJzcDRUQVI3eUpXWm1pZ0Y3ZlZ4QW5kR0dTRzZiNkVzTHFYaHlRWmdVbWY3TWJjSXBGaGpIUEEraG5JNWU1SXB3RkZmRFFiajBpR1NSVlpmUHZKV2JkTkUzSlZCTW9YbWRTd0hLdFRCTUo0REtXbVorUXFQaytJMzBaUmJoV0RvdjdwUjJFbDZZL2x0WS9oZXBZUUZrSy8xcDhMVU9zeWVrSkc3NXhTVHRCVXRyd0ozS0lXRGF2aFNPOTJ3cWY2WUN0NnRqRTlUSVRLdWM4eFJCVE9leW5GM2U3M085MTMxUHBzNGFpWDRZVmVGRzJIOTVRbHVvbnpiUU5aOUVjdTg9=",
    username: "public"
  };
};

User.loadPublicUserIfNoUserAlready = function() {
  var self = this;
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
      self.debug("user is authenticated")
      deferred.resolve(currentUsername);
    },function() {
      self.warn("user is not authenticated")
      deferred.resolve(currentUsername);
    });
  });

  return deferred.promise;
};


exports.User = User;
