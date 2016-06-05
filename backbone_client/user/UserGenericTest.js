define(["user/UserGeneric"], function(UserGeneric) {
  "use strict";

  function registerTests() {
    describe("UserGeneric", function() {
      it("should set user's first name", function() {
        var u = new UserGeneric();
        u.set("firstname", "Bill");
        expect(u.get("firstname")).toEqual("Bill");
      });

      describe("As any type of user I want my profile to look informative without any effort", function() {
        it("should have a subtitle constisting of firstname lastname ", function() {
          var u = new UserGeneric();
          u.set("firstname", "Ed");
          u.set("lastname", "LingLlama");
          expect(u.subtitle()).toEqual("Ed LingLlama");
        });
      });

      describe("As any type of user I want to see how I appear on the dashboard", function() {
        it("should set user's first name", function() {
          var u = new UserGeneric();
          u.set("firstname", "Bill");
          expect(u.get("firstname")).toEqual("Bill");
        });
      });
    });
  }

  return {
    describe: registerTests
  };
});
