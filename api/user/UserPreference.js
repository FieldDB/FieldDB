var FieldDBObject = require('./../FieldDBObject').FieldDBObject;
var HotKeys = require('./../Collection').Collection;
var InsertUnicodes = require('./../Collection').Collection;

/**
 * @class  Hold preferences for users like the skin of the app
 *
 * @property {int} skin This is user's preferred skin.
 * @property {int} numVisibleDatum The number of Datum visible at the time on
 * the Datum*View's.
 *
 * @name  UserPreference
 * @extends FieldDBObject
 * @constructs
 */
var UserPreference = function UserPreference(options) {
  this.debug("Constructing UserPreference length: ", options);
  FieldDBObject.apply(this, arguments);
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

  preferedDashboardLayout: {
    get: function() {
      return this._preferedDashboardLayout;
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
      delete this.hotkeys;
    }
  }

});
exports.UserPreference = UserPreference;
