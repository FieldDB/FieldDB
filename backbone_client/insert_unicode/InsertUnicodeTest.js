define(["insert_unicode/InsertUnicode"], function(InsertUnicode) {
  "use strict";

  function registerTests() {
    describe("InsertUnicode", function() {
      describe("As a User I want to have easy access to Unicode symbols without any effort", function() {
        it("should show Unicode palette", function() {
          expect(InsertUnicode).toBeDefined();
        });
      });

      describe("As a User I want to use my favourite symbols", function() {
        it("should add a new symbol to Unicode palette", function() {
          expect(InsertUnicode).toBeDefined();
        });

        it("should insert a chosen symbol to entry fields", function() {
          expect(InsertUnicode).toBeDefined();
        });
      });
    });
  }

  return {
    describe: registerTests
  };
});
