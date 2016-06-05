define(["datum/Session"], function(Session) {
  "use strict";

  function registerTests() {
    describe("Session", function() {
      it("should assign a sessionID", function() {
        var d = new Session();
        d.set("id", 0);
        expect(d.get("id")).toEqual(0);
      });
    });
  }

  return {
    describe: registerTests
  };
});
