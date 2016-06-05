define([
  "search/Search",
  "corpus/Corpus"
], function(Search, Corpus) {
  "use strict";

  function registerTests() {
    describe("Search", function() {
      it("should be able search", function() {
        expect(Search).toBeDefined();
        expect(Corpus).toBeDefined();
      });
    });
  }

  return {
    describe: registerTests
  };
});
