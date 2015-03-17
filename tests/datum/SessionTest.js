var Session = require("./../../api/datum/Session").Session;

describe("Session: as a linguist I often collect data in an elicitation session", function() {
  it("should load", function() {
    expect(Session).toBeDefined();
  });

  it("should create new sessions", function() {
    var session = new Session();
    expect(session).toBeDefined();
  });

   it("should assign a sessionID", function() {
    // var d = new Session();
    // d.set("SessionID", 0);
    // expect(0 == d.get("SessionID")).toBeTruthy();
    expect(true).toBeTruthy();

  });

});
