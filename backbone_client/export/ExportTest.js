define(["export/Export"], function(Export) {
  "use strict";

  function registerTests() {
    describe("Export: as a user I want to export to various formats", function() {
      it("should be able to export into Latex format", function() {
        expect(Export).toBeDefined();
      });

      it("should be able to export into XML format", function() {
        expect(Export).toBeDefined();
      });

      it("should be able to export into plain text format", function() {
        expect(Export).toBeDefined();
      });
    });
  }

  return {
    describe: registerTests
  };
});
