var FieldDBObject = require('./../FieldDBObject').FieldDBObject;
var UserMask = require('./UserMask').UserMask;
var UserPreference = require('./UserPreference').UserPreference;
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
      if (Object.prototype.toString.call(value) !== '[object Array]') {
        value = [value];
      }
      this.prefs.hotkeys = value;
      delete this.hotkeys;
    }
  },

  prefs: {
    get: function() {
      if(!this._prefs){
        this.prefs = new this.INTERNAL_MODELS['prefs'](this.defaults.prefs)
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
        if (Object.prototype.toString.call(value) === '[object Array]') {
          value = new this.INTERNAL_MODELS['prefs'](value);
        }
      }
      this._prefs = value;
    }
  },

  appbrand: {
    get: function() {
      if (this.prefs && !this.prefs.preferedDashboardType) {
        if (this._appbrand === "phophlo") {
          this.debug(' setting preferedDashboardType from user '+ this._appbrand);

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
      this.debug(' setting preferedDashboardType from user '+ this._appbrand);
      if (this.prefs && !this.prefs.preferedDashboardType) {
        if (this._appbrand === "phophlo") {
          this.prefs._preferedDashboardType = "experimenter";
          this.debug(' it is now '+ this.prefs.preferedDashboardType);

        }
      }
    }
  }

});
exports.User = User;
