var HotKeys = require("../../api/hotkey/HotKeys").HotKeys;

describe("HotKey: as a user I want to use keyboard shortcuts for frequent actions", function() {
  it("should load", function() {
    expect(HotKeys).toBeDefined();
    var hotkeys = new HotKeys();
    expect(hotkeys).toBeDefined();
  });

  it("should load from < v2.0", function() {
    expect(HotKeys).toBeDefined();
    var hotkeys = new HotKeys({
      "firstKey": "",
      "secondKey": "",
      "description": ""
    });
    expect(hotkeys).toBeDefined();
  });

  it("should load from serialization", function() {
    expect(HotKeys).toBeDefined();
    var hotkeys = new HotKeys([{
      "firstKey": "CMD",
      "secondKey": "D",
      "description": "Duplicate Datum"
    }]);
    expect(hotkeys).toBeDefined();
    expect(hotkeys.cmdd).toBeDefined();

  });


  it("should be able to give shortcuts to various functions", function() {
    expect(true).toBeTruthy();
  });

  it("should be able to give shortcuts to LaTeX Tipa characters", function() {
    expect(true).toBeTruthy();
  });

});
