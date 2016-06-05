define(["permission/Permission"], function(Permission) {
  "use strict";

  function registerTests() {
    describe("Permission Tests", function() {
      it("should have a read permission by default", function() {
        var permission = new Permission();
        expect(permission.get("type")).toEqual(undefined);
      });

      it("should have a write permission", function() {
        var permission = new Permission();
        permission.set("type", "w");
        expect(permission.get("type")).toEqual("w");
      });

      it("should have an exportt permission", function() {
        var permission = new Permission();
        permission.set("type", "e");
        expect(permission.get("type")).toEqual("e");
      });
    });
  }

  return {
    describe: registerTests
  };
});
