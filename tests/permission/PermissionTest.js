var Permissions = require("./../../api/permission/Permissions").Permissions;

describe("Permission Tests", function() {

  it("should load", function() {
    var permissions = new Permissions();
    expect(permissions).toBeDefined();
  });

  it("should have a read permission", function() {
    var permissions = new Permissions();
    expect(permissions.readers).toBeDefined();
    expect(true).toBeTruthy();

  });

  it("should have a write permission", function() {
    var permissions = new Permissions();
    expect(permissions.readers).toBeDefined();
    expect(true).toBeTruthy();

  });

  it("should have an export permission", function() {
    var permissions = new Permissions();
    expect(permissions.exporters).toBeDefined();
    expect(true).toBeTruthy();

  });
});
