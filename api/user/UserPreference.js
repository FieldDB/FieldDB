var FieldDBObject = require("./../FieldDBObject").FieldDBObject;
var HotKeys = require("./../hotkey/HotKeys").HotKeys;
var UnicodeSymbols = require("./../unicode/UnicodeSymbols").UnicodeSymbols;

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
  if (!this._fieldDBtype) {
    this._fieldDBtype = "UserPreference";
  }
  this.debug("Constructing UserPreference length: ", options);
  FieldDBObject.apply(this, arguments);
};

UserPreference.preferedDashboardLayouts = ["layoutAllTheData", "layoutJustEntering", "layoutWhatsHappening", "layoutCompareDataLists"];
UserPreference.preferedDashboardTypes = ["fieldlinguistNormalUser", "fieldlinguistPowerUser"];

UserPreference.prototype = Object.create(FieldDBObject.prototype, /** @lends UserPreference.prototype */ {
  constructor: {
    value: UserPreference
  },

  defaults: {
    value: {
      skin: "",
      numVisibleDatum: 2, //Use two as default so users can see minimal pairs
      transparentDashboard: false,
      alwaysRandomizeSkin: true,
      numberOfItemsInPaginatedViews: 10,
      preferedDashboardLayout: UserPreference.preferedDashboardLayouts[0],
      preferedDashboardType: UserPreference.preferedDashboardTypes[0],
      preferedSpreadsheetShape: {
        columns: 2,
        rows: 3
      },
      hotkeys: []
    }
  },

  INTERNAL_MODELS: {
    value: {
      hotkeys: HotKeys,
      unicodes: UnicodeSymbols
    }
  },

  skin: {
    get: function() {
      return this._skin || this.defaults.skin;
    },
    set: function(value) {
      this.debug("setting _skin from " + value);
      if (value === this._skin) {
        return;
      }
      if (!value) {
        delete this._skin;
        return;
      }
      if (value.trim) {
        value = value.trim();
      }
      this._skin = value;
    }
  },

  transparentDashboard: {
    get: function() {
      return this._transparentDashboard || this.defaults.transparentDashboard;
    },
    set: function(value) {
      this.debug("setting _transparentDashboard from " + value);
      if (value === this._transparentDashboard) {
        return;
      }
      if (value === false || value === "false" || !value) {
        this._transparentDashboard = false;
      } else {
        this._transparentDashboard = true;
      }
    }
  },

  alwaysRandomizeSkin: {
    get: function() {
      return this._alwaysRandomizeSkin || this.defaults.alwaysRandomizeSkin;
    },
    set: function(value) {
      this.debug("setting _alwaysRandomizeSkin from " + value);
      if (value === this._alwaysRandomizeSkin) {
        return;
      }
      if (value === false || value === "false" || !value) {
        this._alwaysRandomizeSkin = false;
      } else {
        this._alwaysRandomizeSkin = true;
      }
    }
  },

  preferedDashboardType: {
    get: function() {
      return this._preferedDashboardType || this.defaults.preferedDashboardType;
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
      return this._preferedDashboardLayout || this.defaults.preferedDashboardLayout;
    },
    set: function(value) {

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

  preferedSpreadsheetShape: {
    get: function() {
      if (!this._preferedSpreadsheetShape) {
        this._preferedSpreadsheetShape = JSON.parse(JSON.stringify(this.defaults.preferedSpreadsheetShape));
      }
      return this._preferedSpreadsheetShape;
    },
    set: function(value) {
      this._preferedSpreadsheetShape = value;
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
  },

  numVisibleDatum: {
    get: function() {
      return this._numVisibleDatum || this.defaults.numVisibleDatum;
    },
    set: function(value) {
      if (value === this._numVisibleDatum) {
        return;
      }
      if (!value) {
        delete this._numVisibleDatum;
        return;
      } else {
        if (typeof value.trim === "function") {
          value = value.trim();
        }
      }
      value = parseInt(value, 10);
      this._numVisibleDatum = value;
    }
  },

  numberOfItemsInPaginatedViews: {
    get: function() {
      return this._numberOfItemsInPaginatedViews || this.defaults.numberOfItemsInPaginatedViews;
    },
    set: function(value) {
      if (value === this._numberOfItemsInPaginatedViews) {
        return;
      }
      if (!value) {
        delete this._numberOfItemsInPaginatedViews;
        return;
      } else {
        if (typeof value.trim === "function") {
          value = value.trim();
        }
      }
      value = parseInt(value, 10);
      this._numberOfItemsInPaginatedViews = value;
    }
  },

  preferredLocale: {
    get: function() {
      return this._preferredLocale;
    },
    set: function(value) {
      this.debug("setting _preferredLocale from " + value);
      if (value === this._preferredLocale) {
        return;
      }
      if (!value) {
        delete this._preferredLocale;
        return;
      }
      if (value.trim) {
        value = value.trim();
      }
      this._preferredLocale = value;
    }
  },

  toJSON: {
    value: function(includeEvenEmptyAttributes, removeEmptyAttributes) {
      this.debug("Customizing toJSON ", includeEvenEmptyAttributes, removeEmptyAttributes);
      var attributesNotToJsonify = ["fieldDBtype", "dateCreated", "version"];
      var json = FieldDBObject.prototype.toJSON.apply(this, [includeEvenEmptyAttributes, removeEmptyAttributes, attributesNotToJsonify]);

      if (!json) {
        this.warn("Not returning json right now.");
        return;
      }
      this.debug("JSON before removing items which match defaults", json);

      for (var pref in this.defaults) {
        if (this.defaults.hasOwnProperty(pref) && json[pref] === this.defaults[pref]) {
          this.debug("removing pref which is set to a default " + pref);
          delete json[pref];
        }
      }

      // if (json.preferedSpreadsheetShape && json.preferedSpreadsheetShape.columns === this.defaults.preferedSpreadsheetShape.columns && json.preferedSpreadsheetShape.rows === this.defaults.preferedSpreadsheetShape.rows) {
      //   delete json.preferedSpreadsheetShape;
      // }
      if (JSON.stringify(json) === "{}") {
        return;
      }

      json.fieldDBtype = this.fieldDBtype;
      json.version = this.version;
      json.dateCreated = this.dateCreated;
      this.debug("Json", json);
      return json;
    }
  }

});
exports.UserPreference = UserPreference;