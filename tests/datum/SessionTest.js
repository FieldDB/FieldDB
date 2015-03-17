var Session = require("./../../api/datum/Session").Session;

describe("Session: as a linguist I often collect data in an elicitation session", function() {
  it("should load", function() {
    expect(Session).toBeDefined();

    var session = new Session();
    expect(session).toBeDefined();
  });
});
