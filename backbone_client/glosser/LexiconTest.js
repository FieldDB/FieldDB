define(["FieldDB"], function(FieldDB) {
  "use strict";

  function registerTests() {
    describe("Lexicon Tests", function() {
      it("should be able to build morphemes from a text file of segmented morphemes", function() {
        expect(FieldDB.Lexicon).toBeDefined();
      });

      it("should be able to build a word collection from a text file of  words", function() {
        expect(FieldDB.Lexicon).toBeDefined();
      });

      it("should be able to build translations from a text file of  translations", function() {
        expect(FieldDB.Lexicon).toBeDefined();
      });

      it("should be able to build a collection of glosses from a text file of containing only glosses", function() {
        expect(FieldDB.Lexicon).toBeDefined();
      });

      it("should be able add edges between nodes of different types", function() {
        expect(FieldDB.Lexicon).toBeDefined();
      });
    });
  }

  return {
    describe: registerTests
  };
});
