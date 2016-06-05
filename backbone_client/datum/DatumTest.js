define(["datum/Datum"], function(Datum) {
  "use strict";

  function registerTests() {
    describe("Datum", function() {
      it("should set the utterance", function() {
        var datum = new Datum();
        expect(datum.get("utterance")).toEqual(undefined);
      });

      it("should have a gloss line ", function() {
        var datum = new Datum();
        expect(datum.get("gloss")).toEqual(undefined);
      });

      it("should have a translation line ", function() {
        var datum = new Datum();
        expect(datum.get("translation")).toEqual(undefined);
      });

      it("should have grammatical tags", function() {
        var datum = new Datum();
        expect(datum.get("grammaticalTags")).toEqual(undefined);
      });
    });
  }

  return {
    describe: registerTests
  };
});
