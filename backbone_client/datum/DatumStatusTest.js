define(["datum/DatumState"], function(DatumStatus) {
  "use strict";

  function registerTests() {
    describe("DatumStatus", function() {
    it("should give a datum_status", function() {
        var d = new DatumStatus();
        d.set("datum_status", "checked");
        expect(d.get("datum_status")).toBeTruthy("checked");
      });
    });
  }

  return {
    describe: registerTests
  };
});
