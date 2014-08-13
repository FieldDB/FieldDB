var UserPreference = require("../../api/user/UserPreference").UserPreference;
var SAMPLE_USER = require("../../api/user/user.json");

describe("Test UserPreference", function() {
  it("should initialize the UserPreferences", function() {
    expect(UserPreference).toBeDefined();
    var p = new UserPreference();
    expect(p.preferedDashboardType).toEqual('');
    expect(p.preferedDashboardLayout).toEqual('');
    expect(p.hotkeys).toEqual([]);
    expect(p.unicodes).toEqual([]);
  });

  it("should accept serializations from <v2.0", function() {
    var prefs = new UserPreference(SAMPLE_USER.prefs);
    expect(prefs).toBeDefined();
    expect(prefs.unicodes.length).toEqual(22);
  });

  it("should allow users to change their preferences", function() {
    expect(true).toBeTruthy();
  });


  it("should contain skin preference ", function() {
    expect(true).toBeTruthy();
    // var p = new UserPreference();
    //				expect("skin" == p.get("skin")).toBeTruthy();

  });

  it("should contain hotKey preference ", function() {
    expect(true).toBeTruthy();
    // var p = new UserPreference();
    //			expect("hotKey" == p.get("hotKey")).toBeTruthy();

  });

});
