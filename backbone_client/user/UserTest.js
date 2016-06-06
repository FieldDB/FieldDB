define(["user/User"], function(User) {
  "use strict";

  function registerTests() {
    describe("User", function() {
      it("should set user's first name", function() {
        var u = new User();
        u.set("firstname", "Bill");
        expect(u.get("firstname")).toEqual("Bill");
      });

      it("should set user's teams", function() {
        var u = new User();
        u.set("username", "elingllama");
        u.set("teams", ["YaleNavajo"]);
        expect(u.get("teams")).toEqual(["YaleNavajo"]);
      });

      describe("As a user I want my profile to look informative without any effort", function() {
        it("should have a subtitle constisting of firstname lastname ", function() {
          var u = new User();
          u.set("firstname", "Ed");
          u.set("lastname", "LingLlama");
          expect(u.subtitle()).toEqual("Ed LingLlama");
        });
      });
    });
  }

  return {
    describe: registerTests
  };
});
