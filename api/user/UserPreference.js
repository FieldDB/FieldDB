var FieldDBObject = require("./../FieldDBObject").FieldDBObject;
var HotKeys = require("./../hotkey/HotKeys").HotKeys;
var InsertUnicodes = require("./../unicode/UnicodeSymbols").InsertUnicodes;

/**
 * @class  Hold preferences for users like the skin of the app
 *
 * @property {int} skin This is user's preferred skin.
 * @property {int} numVisibleDatum The number of Datum visible at the time on
 * the Datum*View"s.
 *
 * @name  UserPreference
 * @extends FieldDBObject
 * @constructs
 */
var UserPreference = function UserPreference(options) {
  this.debug("Constructing UserPreference length: ", options);
  FieldDBObject.apply(this, arguments);
  this.alwaysConfirmOkay = true;
  this.todo("setting prefs to auto confirm overwrite to avoid popups in the demo");
};

UserPreference.prototype = Object.create(FieldDBObject.prototype, /** @lends UserPreference.prototype */ {
  constructor: {
    value: UserPreference
  },

  defaults: {
    value: {
      skin: "",
      numVisibleDatum: 2, //Use two as default so users can see minimal pairs
      transparentDashboard: "false",
      alwaysRandomizeSkin: "true",
      numberOfItemsInPaginatedViews: 10,
      preferedDashboardLayout: "layoutAllTheData",
      preferedDashboardType: "fieldlinguistNormalUser"
    }
  },

  INTERNAL_MODELS: {
    value: {
      hotkeys: HotKeys,
      unicodes: InsertUnicodes
    }
  },

  preferedDashboardType: {
    get: function() {
      this.debug("getting preferedDashboardType " + this._preferedDashboardType);
      if (!this._preferedDashboardType && this.preferedDashboardLayout) {
        this.debug("getting preferedDashboardType from _preferedDashboardLayout ");
      }
      return this._preferedDashboardType || FieldDBObject.DEFAULT_STRING;
    },
    set: function(value) {
      this.debug("setting _preferedDashboardType from " + value);
      if (value === this._preferedDashboardType) {
        return;
      }
      if (!value) {
        delete this._preferedDashboardType;
        return;
      }
      if (value.trim) {
        value = value.trim();
      }
      this._preferedDashboardType = value;
    }
  },

  preferedDashboardLayout: {
    get: function() {
      this.debug("getting preferedDashboardLayout from ");

      return this._preferedDashboardLayout || FieldDBObject.DEFAULT_STRING;
    },
    set: function(value) {
      this.debug("setting preferedDashboardLayout from " + value);

      if (value === this._preferedDashboardLayout) {
        return;
      }
      if (!value) {
        delete this._preferedDashboardLayout;
        return;
      }
      // Guess which kind of user this is
      if (!this.preferedDashboardType) {
        if (this._preferedDashboardLayout === "layoutAllTheData" || this._preferedDashboardLayout === "layoutJustEntering" || this._preferedDashboardLayout === "layoutWhatsHappening") {
          this.preferedDashboardType = "fieldlinguistNormalUser";
        } else if (this._preferedDashboardLayout === "layoutCompareDataLists" || this._preferedDashboardLayout === "layoutEverythingAtOnce") {
          this.preferedDashboardType = "fieldlinguistPowerUser";
        }
      }

      this._preferedDashboardLayout = value;
    }
  },

  hotkeys: {
    get: function() {
      return this._hotkeys || FieldDBObject.DEFAULT_COLLECTION;
    },
    set: function(value) {
      if (value === this._hotkeys) {
        return;
      }
      if (!value) {
        delete this._hotkeys;
        return;
      } else {
        if (value.firstKey) {
          value = [value];
        }
        if (Object.prototype.toString.call(value) === "[object Array]") {
          value = new this.INTERNAL_MODELS["hotkeys"](value);
        }
      }
      this._hotkeys = value;
    }
  },

  unicodes: {
    get: function() {
      return this._unicodes || FieldDBObject.DEFAULT_COLLECTION;
    },
    set: function(value) {
      if (value === this._unicodes) {
        return;
      }
      if (!value) {
        delete this._unicodes;
        return;
      } else {
        if (Object.prototype.toString.call(value) === "[object Array]") {
          value = new this.INTERNAL_MODELS["unicodes"](value);
        }
      }
      this._unicodes = value;
    }
  }

});
exports.UserPreference = UserPreference;
