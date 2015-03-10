var FieldDBObject = require("./../FieldDBObject").FieldDBObject;
var UserMask = require("./UserMask").UserMask;
var DatumFields = require("./../datum/DatumFields").DatumFields;
var CorpusConnection = require("./../corpus/CorpusConnection").CorpusConnection;
var CorpusConnections = require("./../corpus/CorpusConnections").CorpusConnections;
var UserPreference = require("./UserPreference").UserPreference;
var DEFAULT_USER_MODEL = require("./user.json");

/**
 * @class User extends from UserGeneric. It inherits the same attributes as UserGeneric but can
 * login.
 *
 * @property {String} firstname The user's first name.
 * @property {String} lastname The user's last name.
 * @property {Array} teams This is a list of teams a user belongs to.
 * @property {Array} sessionHistory
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
  this.debug("Constructing User length: ", options);
  UserMask.apply(this, arguments);
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
      mostRecentIds: FieldDBObject.DEFAULT_OBJECT,
      activityCouchConnection: CorpusConnection,
      corpora: CorpusConnections
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

  mostRecentIds: {
    configurable: true,
    get: function() {
      return this._mostRecentIds || FieldDBObject.DEFAULT_OBJECT;
    },
    set: function(value) {
      if (value === this._mostRecentIds) {
        return;
      }
      // if (!value) {
      //   delete this._mostRecentIds;
      //   return;
      // } else {
      //   if (!(value instanceof this.INTERNAL_MODELS["mostRecentIds"])) {
      //     value = new this.INTERNAL_MODELS["mostRecentIds"](value);
      //   }
      // }
      this._mostRecentIds = value;
    }
  },

  prefs: {
    get: function() {
      if (!this._prefs && this.INTERNAL_MODELS["prefs"] && typeof this.INTERNAL_MODELS["prefs"] === "function") {
        this.prefs = new this.INTERNAL_MODELS["prefs"](this.defaults.prefs);
      }
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
        if (Object.prototype.toString.call(value) === "[object Array]") {
          value = new this.INTERNAL_MODELS["prefs"](value);
        }
      }
      this._prefs = value;
    }
  },

  corpuses: {
    get: function() {
      return this.corpora;
    },
    set: function(value) {
      this.corpora = value;
    }
  },

  corpora: {
    configurable: true,
    get: function() {
      return this._corpora || FieldDBObject.DEFAULT_ARRAY;
    },
    set: function(value) {
      if (value === this._corpora) {
        return;
      }
      if (!value) {
        delete this._corpora;
        return;
      } else {
        if (Object.prototype.toString.call(value) === "[object Array]") {
          value = new this.INTERNAL_MODELS["corpora"](value);
        }
      }
      this._corpora = value;
    }
  },

  appbrand: {
    get: function() {
      if (this.prefs && !this.prefs.preferedDashboardType) {
        if (this._appbrand === "phophlo") {
          this.debug(" setting preferedDashboardType from user " + this._appbrand);

          this.prefs.preferedDashboardType = "experimenter";
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
      this.debug(" setting preferedDashboardType from user " + this._appbrand);
      if (this.prefs && !this.prefs.preferedDashboardType) {
        if (this._appbrand === "phophlo") {
          this.prefs._preferedDashboardType = "experimenter";
          this.debug(" it is now " + this.prefs.preferedDashboardType);

        }
      }
    }
  }

});
exports.User = User;
