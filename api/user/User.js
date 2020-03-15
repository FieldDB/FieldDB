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
    public: "confidential:VTJGc2RHVmtYMTlzZnd1TWZmMzlBcnY3bHJWd3JYOEZhOG1OeEo1eTZXYmpSRkV1TWh0ZEdYdTN6emtoUHhBYmg4OHpoZFVMYjFzMFpTU1paQU12U1ZJTjdoNU5oNzZVeElXNjh3TXZoYTJaanQ4eXBEUVNvSEFvc1c0ekhObmh2Qmw4ZlVsZnRzbnlDK0FJMGJ0VVVXOUhURUMraG5sSGlQQ29wYU0yVHlBUXZ1MncwSFl2emovbXB5L1hHbEFFQXJhU0l0VW9BRTg4RFhkeGNGZFd6YVlham9tMW5LbWZrb1dWaVNDZTZSS1h1R2xwU2xtRk5NbFU0U2ZwVklJNXNOaU90SVJoeG96aFkydHJZUUpreHBiU1RsQnJiMS9oYzh3QU0rNWRaT2Qyc0RPalV1bUM0QUhMMkZZK0d4QWV5c0d5Wno5bC9FUElzaGhWSG8vOEtHbEtFYjM3VU9JSTV0ZTZWVHA0K2s1ZVJyOEhsRGc5VDdrR1BPaUJQYmJIdmFkQmxhOEdtZXhlcE5aQkJyYnBhNjBiQm1yOUI3K2RTYUc3b3drZG5wTjBSKzkwbmwxamQrVE9MbERTNXRwdWR4MXpQZ2pxU3l6cmdqV3UzVXc0MFVyemp1dG5jeE1PZVE4L0FmYXc4TWl3ZExjakhiRkpKbVVWaUY0bklEYmtZRnZTOWtLeDFuSlN2YTg5VjlNTkFlKzJBcTNtOWJ4akI1RUZVS0g5a05mTWxkQUtNUTJpQ2ZGS3ZwWnY4aGlZcWg1OVo1dmtpMDYvOFhhbXE3RWtCcWhka3lFMmhubDBoZHZnK3hRYWcvMkQ0VEZEWTA3ZUhCQ3FrTDNnTWRlWGpXaEFUclgxWHJqbkxKYi81S0FzVzBWay9HSk5lMy96dEJNaXZWRWlPRFk4Y2hPc3FsbFdjTUw3ME12eitTTUQwbjFKWkZmZ1VWd29OSmVTNGo1ZkdRT2RxMVZFM0Y2Q1lzYnoyN3hhN3FMZDRNQUk0NmJqcFQ3RWNBZXppQlBPOWZWcFN4UUxnM29MOG9YYTdBVVRYY09mV3djenlyWUdUUGNjamlsVitxWU5Dc0I2anNTNklFRms1OWtBTmQ3OXBtakI4b0txeFNhQ002eWp3Y0dyYzBFSUlPTThVbUNYb1dDQVY1OG4yWWZyc3Z1NmR4RXQ5c1FsNlFkNHViOHgxcE14TjdWNkRSaGswZ1lNODlYalVkVXRoc3NEK0thalB6d0trYkRYZTNRc2pHeXhiMU1wZzVTKzd6OUZCKzF2dGZRQ2JBSENIWm5JeXpDMStWaDlOZVZHd2dESjB0VlJseDBLZkNjRnZaMWIxM2pzMS9pSEs1M2RVOXV3OGRkZExJK0JLc1NmMGlMRlByYmpZVDZCSFg1SUp5dzZGeVB4N1FGZW1XOHN5cVh3VmlEVTJSNlFERXdmNEc4bDJ1L2RXQXdlekkxcHdCc1pwVGEvT3c0WEd1eVlZUHVwRFdCTlB6Q1BlL1lJNWwwUVFFZUhGcFRXQ0ROMktkbC9rVEc4ZTNHbEZRZGZuZk9oZ1BhZGZQSzY2eXlhWGNlQ2s2UEhSSzdUZTFYeDhTQmdYMS9TeG1vK2JsQ3lzcGxBeUVhVXBuQ0ZmUzZyUitXb3Z3TUxWSTFFWit5TStpK2NsUjEvbi9UdWxlejR5QTI5cjNwbGFDT3gzWXhVSTZNMzkwTWRtTzFneTlnVVpCVXJ3WEhWK1F0aHVRRDlGVDJpVjh6b0dpNXFGWVk0cFF6UHZKbjgvMFYyYmJhRmNBWDB5UFIvUU9iK1JHZFd2S0dITllrN01leFZZekI3UXR1TWU2NG83S0NDYlBWeUJuTlJ6SWtGM3U1eEtmTDBIMFVpaXJjcUpLdU5YNkR6RDIyNzFBck1kdkRzNzFSNWZDZUpCWm5KNTVHcVNiSEl1S0hQRG9Ld01mbHFadUZMNFpKTWp4d1dsSExVRkdiOFNKU3NYWDdoYW5xei9KTDl3dmt1RXJrMHVRSHJvbGx0ZGhiNmVPRHcxUmY2VTY2RDBpTVJMenljN0dhVnZuT3RpcEgvVGlLa1VQc2dwa05yRjlFZjAxSnlHTFBuTjc0blNMRC9VOUphSDVPVGhydkRrNEZmU082Y29IWVlmTG51Q0svL1BCNUFaYTZPb1BEbXNUVFZCMDRkY0VtMk5OYnJCL3htZXZtME9lUXhZQWlFNFVHcGhTYW1CeEUyNVBtVFlpL2grbE9pb2JTaDBVMVhNalQvN3R4UVVWL2JpMVBGejVKcjA5SmxaTnFtV1E3QmJTMk55cTNHd3ZxR0NGaTNFWWtyNHZrQzdhMklpUHVYVStvbWdzVkFyWklVT21JZFJOVGpUcVNyS2kzK1M3bEdVeDhYSDZTRFBMRFoxTU9pOWh6VGtqQ3ZRRDJIZTNiakF4YndXeFFTRWhpa0s2MUExdmIwRGJTdWwyK3dvS3VxeWZlR00vQ01aOFZiU0htRU02Qks5emtoYWdJVjlHVXRSVXNnTlVwK29RZ2l2Wko4ZFFOb2o4anRIdHI0R2ZyQnVOOEtUQXQwN2VJTjVGamUvOGl6cXhSWDNtcDd3UWpjQk9XTUowZUN1VnBxdDRDWklLVnlSQkdXZm9wWEhZOWJWSWxWaG8vVnlvY0E1NVdiTlU1eGZ2TDZuNFdBWmFhR1ZxUTlsdHUxNEdoaVZSSkVDd3p0cHhkTE0yVklkeHJURmRyS2g3b1ptNDNYblBKeURFMUxZVmN5SnRVY21rQnAyaE4vUVFCYmVNdkl1eTNiZ1ZjaUZUWjlFZTdRdXNQcUVrWWIyRUZmakVoV0ZaSjFLMGpxMUx1TCt6R3loWk5FS3EwajJzSGpjQW9UZUVEU3hTV3BOSHRIWG9RdWVLTytFMFNVOGRpSW9HRnovaCs1bzRWMnE4eUlmVkFMV3hlc1lMU0lFUFN6UEZicUNUOFFXN3JILzIrc1hsaEJRTFUyMEc3R3BoalUvbUlUcDJSM01DdHhoTkFZZmpLYzc3TFY3azZuL1l1YVFWNzI3U3hQQnR3cTArZDRhQklWdm02VGk4YUc3a0lBTjJpNVUrQzliK0tDQTErMC9TOVZQblBCQmdKQXBrVC9ZbzFFTlZSU1hQUXhxanZBWFNSNGJLeXBvZlZkaUkwS3NEWnhNbjNLNVpXRU9ycC9VOVhhSXhIQ2M0dkdYUm90bThWejZQbEZPbG5NRmZ2VEFsdkJMRlR4VUY4ZVFqeXFRWmxWSUtRSTNzV3hzSUJYYmVoNjkyNVFmRE5hbFBUaEtmVUFnV2pUNGc4cmNja04rYUxEcDdON1c4VW9JSTRGZGkxZ0M2ekFrVE5sdnlmK2JUVlRHUmF0ekh4NGgreFdaVVU1NW1MenFyTmx1MTlDMEtFSHZJNEhhK2ZSVXFxK1J0RWRZQ0w3QWx3VzJwOWFvTHJabytKcFJtM0FPUDJFNUxBRjltbVdoWE5jKzUwWUpRYmx4YVk5TmxuSVJLWmlzdFRrVzdCRnV0M1NCTk9kUjZjdEV1eTBzcTB4U1dIcWhJRG1qdXBwTUx0QzhOQitOM2o3TTVvc0lOWUlzbmR3RUZvN0ZsdzlXM3UydGVjNk82QmFBV0JDeC9ZRHFqSDNrTGtGQ2wyZnp0R3hWNGRlQ2NNMUhzWUFYbW9WTStlWmZJeWJmTUlHWjJPYXlKMG1NQWlncDgvT3ZwMGJXZitJejlPUW5DK1NGZ2NTWTdhcnVrZ2FaV3hTd0J2M1FkQWtrOG1laHFhS3BsWnd2dVRydHNjNEZzaXJaVGdnRmVDekFpbzk5a2lldGdqZldMTTk1TFRUbkZJMDE0dElxcEprUXltNHcyRGtuY1BjQTBqdnZJVlNFeFVTZFJ3cGMvUnoyc2g2Qjh4WElTVnpjNUY3SEhlUnRUSjJkRjVtNFkyNjl4RG1HTDlXdnA4OXNFWENaSXZDc3oyTldESWp0bHpEU3R5RmY3UDFIRlQ5N0lLL2pLYTBQRGlIVlV0eGtZbFhhMndOZm5ONnVCRUh2VlFKMHl3S0VqVjZRZ2JHeDhvS3FrREtxY243cG04dm83ZHE3MU5nK0tSOFRRQjdEaEoxRGVMWG15Q1lzRUlJTEdONzUvcXAzVCsvMVlhWWVSdGc2RlRyOXg5YURzcERyTStjV2tMMnpjNWl1M3c2dDFudjBmN0VWNXlWcWJ1MkRhd3F1RXN5YjVQaWxUQ1dCQ3JUcFd3MUZWM0ZNd2FCMGExUWJkSTlDV3d6RUplUXVjUU8wR1ltUXRZc1ZOWElOclhEYkV6VmhLV0ZHYWNIdS82RDhFcEUydFZaOVcrNWNvVGpYeGNUZUpNY1pxWDRMTC9od3VwelYrU0ZYL3pBZTZKaEhKVGxacytxaFN6V1ZxNjJGa2JXb04wWUgzRWJzbG5SeUhvcTBUU2ExN3pXMUZ2YzRuWmdyUS8ralN6YVVtd1Z1SkFmZjd1Y3E4NlJrdlhwdU1xZEkyQ2x3ajR5NUFWQWpVK0FRc1NXdzNkdStLWWwyN1VsWjNlZlpJL3dDSlozZnBUSDNuajNBdmZXRjdvd0pHN1lIcS9YYit5azd4MVJ0UHgreFRzZEJIV3RVOFoydjg5bzdMc1VXWDJxSDFEQTFrMitVL05sRk5JSkIxMSswM01NNXJPKy9EZHV2SHRmQjU3VlJFV2tzMTB5ZktSdzBMajk2bW9CMXA3QmlEdmJjVlVRU0FYd29aSUdjazNnd3B4SlJSZTN0NE5YUUk1UmNzaVRmdDlzY3plWndwcFRlTURSM00vU2Z4bm9zTktvRXRLTHF4UmIvK3pyazBZdlg5QitHYmhPVzAwWWpYM2hpWDN2TjVUb1lMWWFrT0JmWVZCWFEvQnNnYTR3VXBhNFNUL3JBYVJiM0ZNL1FHSSs3UXFtN1N0Z0YxQkhaeE43MW5aVWd5b3B3QVFsUjZ2bVQ5bTJJU0E4eTBtUnhvSW5ndVNMUFVjeThVTnl6ajg2RmpDdHlTQ0JXZCszZWJST2VKLzArRFd3QS9ZanU4T2JyN0F6amZMRVRCM1N1c29uY0QrUUM4QTdVL051TWJ5Ukg3dHltTnF2UkVPQ2xOcEQ0Ym4xNkdhbWE1UWVKY3MrOXZMa21YTklLZUhZV0ZKR1RPUWxFL0Q5cnRwWVRIYWZpYjBTbFFkenkxTlc4RVF5dEMxV3BzYnNTd1NPcHh1RWpGRm0zcFdTd3ZGdnZGZUUxL2dJSmVwd0ZRWS9OSzkxcTVuYnpxdlJmRjBPRnlvTVlGVTVSZ2U5MWU5cnRwTExBcGRwekhEUE5uWEJpc21OT2RQNnlxMiszbExSMnA0eEIxRzE3Z1J5dDg5QU5HS0ZxMmlrRlFXTnIrUWxQeUxVbXdGdG9RNmU3YkxteExsV3QwMyt6WTZrVTQ0UHYyMlpCdi9TRmpnSExqbnQrcnBOYm92VFFMZ3NmSWtpR2NXSDNIM1V6TllTTFJSd0dJNVN5ek5nazd4ZDBMN3R0VGRYemtpZVpzYldrSE1rb3BkdE4xZ3dwZFJhZndXTTBZRFQ2ZzRza3hHUy9pc0pnaTFkc2lKS2o5NFphR1MzZXJaTU0xbk1UbjMwSWNZNlpZY3h6NVEvbUZiZ2pnS2FFdmxVWGhIZU13VHM2MWQ0RWtwK0FESnR0R0dXK3YvTnJpcGJESGhxQTFLSURjWFg5L0ZidzJ3eEQxZnc1ZVVKUHlKTERabnVUdFhyM3pFaHJQK0lHUTlEaWxQeWJ5Z0Y0S2M3enBqV2JoLytVVGJkMjAvcTI2NzFhblQyWThmRjU1UTBmTEphV0pSQ3BhUHhqK1IzdzlGRHpqb1JUNU1TdUhlaVdEY0lnbDhTb3M4Mk15N0JnKytBcUM5NTI0d1NlSm5RKzlneS81aHVCRy8vQSsyVDh2amNPRk5qNUNSOU9HZlRqVXhnaTVOOERaTHBhaHVrclZ2VU5NcHN5LzBTZkR1ZG5uNC93YTZIOUxUVmpEVTVMdm84TVdhZGl2amVBYWI0M3dpTHBST0tDazR4ckVHaHV4ODU3alZtb05IbFF1ckdCbGhPbyt5WmlwSE8vYktCbGlxNnNGVFdLeFJXeHcwaXIyKzRkUFRDNjJqQW1jQmVCR0QvaWt5WXpHakpUV1kwOEQxS1ByQkFOTHNWRlB5TklCNWRPaFpZMDF5c3BZd2RqaHgxcGFWRHUzTT0=",
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
    deferred.resolve(currentUsername);
  });

  return deferred.promise;
};


exports.User = User;
