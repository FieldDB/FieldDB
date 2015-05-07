"use strict";
var UserPreference;
try {
  /* globals FieldDB */
  if (FieldDB) {
    UserPreference = FieldDB.UserPreference;
  }
} catch (e) {}

UserPreference = UserPreference || require("./../../api/user/UserPreference").UserPreference;

var SAMPLE_USER = require("../../sample_data/user_v1.22.1.json")[0];

describe("UserPreference", function() {
  it("should initialize the UserPreferences", function() {
    expect(UserPreference).toBeDefined();
    var p = new UserPreference();
    expect(p).toBeDefined();
  });

  it("should accept serializations from <v2.0", function() {
    expect(SAMPLE_USER.prefs.skin).toEqual("images/skins/purple.jpg");
    var prefs = new UserPreference(SAMPLE_USER.prefs);

    expect(prefs).toBeDefined();
    expect(prefs.unicodes.length).toEqual(20);
    expect(prefs.skin).toEqual("images/skins/purple.jpg");
  });


  describe("defaults", function() {
    var prefs = new UserPreference();

    it("should contain dashboard preferences", function() {
      expect(prefs.preferredDashboardType).toEqual("fieldlinguistNormalUser");
      expect(prefs.preferredDashboardLayout).toEqual("layoutAllTheData");
    });

    it("should contain spreadsheet preferences", function() {
      expect(prefs.preferredSpreadsheetShape.columns).toEqual(2);
      expect(prefs.preferredSpreadsheetShape.rows).toEqual(3);
    });

    it("should contain unicode preferences", function() {
      expect(prefs.unicodes.length).toEqual(0);
    });

    it("should contain locale preferences", function() {
      expect(prefs.preferredLocale).toBeFalsy();
    });

    it("should contain skin preference ", function() {
      expect(prefs.skin).toEqual("");
      expect(prefs.transparentDashboard).toEqual(false);
      expect(prefs.alwaysRandomizeSkin).toEqual(true);
    });

    it("should contain pagination preference ", function() {
      expect(prefs.numVisibleDatum).toEqual(2);
      expect(prefs.numberOfItemsInPaginatedViews).toEqual(10);
    });

    it("should contain hotKey preference ", function() {
      expect(prefs.hotkeys).toEqual([]);
    });
  });

  describe("customization", function() {

    it("should allow remember if users change their preferences", function() {
      var prefs = new UserPreference({
        debugMode: true
      });
      var serialized = prefs.toJSON();
      expect(serialized).toEqual({});

      expect(prefs.preferredSpreadsheetShape.rows).toEqual(3);
      prefs.preferredSpreadsheetShape.rows = 4;
      expect(prefs.preferredSpreadsheetShape.rows).toEqual(4);

      serialized = prefs.toJSON();
      expect(serialized).toEqual({
        preferredSpreadsheetShape: {
          columns: 2,
          rows: 4
        },
        fieldDBtype: "UserPreference",
        version: serialized.version,
        dateCreated: serialized.dateCreated
      });

      expect(prefs.preferredDashboardLayout).toEqual("layoutAllTheData");
      prefs.preferredDashboardLayout = "layoutJustEntering";
      expect(prefs.preferredDashboardLayout).toEqual("layoutJustEntering");

      serialized = prefs.toJSON();
      expect(serialized.preferredDashboardLayout).toEqual("layoutJustEntering");
    });

  });

});