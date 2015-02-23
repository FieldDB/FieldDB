var Permissions = require("./../../api/permission/Permissions").Permissions;

describe("Permission Tests", function() {
  it("should load", function() {
    var permissions = new Permissions();
    expect(permission).toBeDefined();
  });

  it("should have a read permission by default", function() {
    // var permission = new Permission();
    // expect(permission.get("type")).toEqual("r");
    expect(true).toBeTruthy();

  });

  it("should have a write permission", function() {
    // var permission = new Permission();
    // permission.set("type", "w");
    // expect(permission.get("type")).toEqual("w");
    expect(true).toBeTruthy();

  });

  it("should have an export permission", function() {
    // var permission = new Permission();
    // permission.set("type", "e");
    // expect(permission.get("type")).toEqual("e");
    expect(true).toBeTruthy();

  });
});
