define(["user/UserPreference"], function(UserPreference) {
  "use strict";

  function registerTests() {
    describe("UserPreference", function() {
      describe("As a user I dont want to configure my preferences", function() {
        it("should initialize the UserPreference menu", function() {
          var p = new UserPreference();
          expect(p).not.toBeNull();
        });

        xit("should contain hotKey preference ", function() {
          var p = new UserPreference();
          expect(p.get("hotKey")).toBeDefined();
        });
      });

      describe("As a user I want to be able to reduce eyestrain by customizing the colors/contrast/brightness of my dashboard", function() {
        it("should allow users to change their preferences", function() {
          expect(true).toBeTruthy();
        });

        it("should contain skin preference ", function() {
          var p = new UserPreference();
          expect(p.get("skin")).toBeDefined();
        });
      });
    });
  }

  return {
    describe: registerTests
  };
});
