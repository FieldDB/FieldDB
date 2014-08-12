var UserMask = require('./UserMask').UserMask;
var UserPreference = require('./../FieldDBObject').FieldDBObject;

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
    value: {
      // Defaults from UserGeneric
      username: "",
      password: "",
      email: "",
      gravatar: "user/user_gravatar.png",
      researchInterest: "",
      affiliation: "",
      description: "",
      subtitle: "",
      corpuses: [],
      dataLists: [],
      mostRecentIds: {},
      // Defaults from User
      firstname: "",
      lastname: "",
      teams: [],
      sessionHistory: []
    }
  },

  INTERNAL_MODELS: {
    value: {
      prefs: UserPreference
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
        this.prefs = new this.INTERNAL_MODELS['prefs']();
      }
      this.prefs.hotkeys = value;
      delete this.hotkeys;
    }
  },

  appbrand: {
    get: function() {
      if (this.prefs && !this.prefs.preferedDashboardType) {
        if (this._appbrand === "phophlo") {
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
        this.warn('appbrand cannot be modified by client side apps.');
      } else {
        if (value.trim) {
          value = value.trim();
        }
        this._appbrand = value;
      }

      if (this.prefs && !this.prefs.preferedDashboardType) {
        if (this._appbrand === "phophlo") {
          this.prefs.preferedDashboardType = "experimenter";
        }
      }
    }
  }

});
exports.User = User;
