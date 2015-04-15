"use strict";
var UnicodeSymbols;
try {
  /* globals FieldDB */
  if (FieldDB) {
    UnicodeSymbols = FieldDB.UnicodeSymbols;
  }
} catch (e) {}

UnicodeSymbols = UnicodeSymbols || require("./../../api/unicode/UnicodeSymbols").UnicodeSymbols;

var SAMPLE_USER = require("../../api/user/user.json");

describe("UnicodeSymbol: as a User I want to use my favourite symbols", function() {
  it("should load", function() {
    expect(UnicodeSymbols).toBeDefined();
  });

  it("should construct", function() {
    var unicodes = new UnicodeSymbols();
    expect(unicodes).toBeDefined();
  });

  it("should accept serializations from <v2.0", function() {
    var unicodes = new UnicodeSymbols(SAMPLE_USER.prefs.unicodes);
    expect(unicodes).toBeDefined();
    expect(unicodes.length).toEqual(22);
  });

  it("should be able to fill with default symbols", function() {
    var unicodes = new UnicodeSymbols();
    expect(unicodes.length).toEqual(0);
    unicodes.fill();
    expect(unicodes.length).toEqual(22);
  });

  it("should permit unicode characters as primary keys", function() {
    var unicodes = new UnicodeSymbols();
    unicodes.add({
      tipa: "",
      symbol: " ɦ"
    });
    expect(unicodes.length).toEqual(1);
    expect(unicodes.warnMessage).toBeUndefined();
    expect(unicodes["ɦ"].symbol).toEqual("ɦ");
    expect(unicodes.ɦ.symbol).toEqual("ɦ");
    expect(unicodes.warnMessage).toBeUndefined();
  });

  it("should not permit fishy characters in primary keys", function() {
    var unicodes = new UnicodeSymbols();
    unicodes.add({
      tipa: "",
      symbol: "cd /root"
    });
    expect(unicodes.length).toEqual(1);
    expect(unicodes.cdroot.symbol).toEqual("cd /root");
    if (unicodes.warnMessage) {
      expect(unicodes.warnMessage).toContain("The sanitized the dot notation key of this object is not the same as its primaryKey: cd /root -> cdroot");
    }
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
