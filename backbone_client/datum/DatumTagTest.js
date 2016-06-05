define(["datum/DatumTag"], function(DatumTag) {
  "use strict";

  function registerTests() {
    describe("DatumTag", function() {
      it("should give a datum datum tag", function() {
        var d = new DatumTag();
        d.set("datum tag", "impulsative");
        expect(d.get("datum tag")).toBeTruthy("impulsative");
      });
    });
  }

  return {
    describe: registerTests
  };
});
