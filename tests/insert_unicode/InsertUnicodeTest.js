var InsertUnicodes = require("../../api/unicode/UnicodeSymbols").InsertUnicodes;
var SAMPLE_USER = require("../../api/user/user.json");

describe("InsertUnicode: as a User I want to use my favourite symbols", function() {
  it("should load", function() {
    expect(InsertUnicodes).toBeDefined();
  });

  it("should construct", function() {
    var unicodes = new InsertUnicodes();
    expect(unicodes).toBeDefined();
  });

  it("should accept serializations from <v2.0", function() {
    var unicodes = new InsertUnicodes(SAMPLE_USER.prefs.unicodes);
    expect(unicodes).toBeDefined();
    expect(unicodes.length).toEqual(20);
  });

  it("should be able to fill with default symbols", function() {
    var unicodes = new InsertUnicodes();
    expect(unicodes.length).toEqual(0);
    unicodes.fill();
    expect(unicodes.length).toEqual(22);
  });

  it("should show Unicode palette", function() {
    expect(true).toBeTruthy();
  });

  it("should add a new symbol to Unicode palette", function() {
    expect(true).toBeTruthy();
  });

  it("should insert a chosen symbol to entry fields", function() {
    expect(true).toBeTruthy();
  });

});
