define(["hotkey/HotKey"], function(HotKey) {
  "use strict";

  function registerTests() {
    describe("HotKey", function() {
      describe("A a user I want to use keyboard shortcuts for frequent actions", function() {
        it("should be able to give shortcuts to various functions", function() {
          expect(HotKey).toBeDefined();
        });
      });

      describe("A a user I want to use keyboard shortcuts for frequent characters", function() {
        it("should be able to give shortcuts to LaTeX Tipa characters", function() {
          expect(HotKey).toBeDefined();
        });
      });
    });
  }

  return {
    describe: registerTests
  };
});
