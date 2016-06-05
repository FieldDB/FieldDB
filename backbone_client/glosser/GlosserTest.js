define(["FieldDB"], function(FieldDB) {
  "use strict";

  function registerTests() {
    describe("Glosser: as a user I don't want to enter glosses that are already in my data", function() {
      it("should be able to predict the gloss", function() {
        expect(FieldDB.Glosser).toBeDefined();
      });
    });
  }

  return {
    describe: registerTests
  };
});
