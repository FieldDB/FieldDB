define(["user/Consultant"], function(Speaker) {
  "use strict";

  function registerTests() {
    describe("Speaker", function() {
      describe("As an Speaker, I want to be anonymous by default", function() {
        it("should set an consultant code", function() {
          var user = new Speaker();
          user.set("consultantcode", "C.M.B.");
          expect(user.get("consultantcode")).toEqual("C.M.B.");
        });
      });

      describe("As an Speaker, I want to set up my Speaker info", function() {
        it("should set consultant's birthdate", function() {
          var user = new Speaker();
          user.set("consultantcode", "C.M.B.");
          user.set("birthDate", "January 1, 1900");
          expect(user.get("birthDate")).toEqual("January 1, 1900");
        });

        it("should set consultant's language", function() {
          var user = new Speaker();
          user.set("consultantcode", "C.M.B.");
          user.set("language", "Cat");
          expect(user.get("language")).toEqual("Cat");
        });

        it("should set consultant's dialect", function() {
          var user = new Speaker();
          user.set("consultantcode", "C.M.B.");
          user.set("dialect", "Catfrench");
          expect(user.get("dialect")).toEqual("Catfrench");
        });
      });
    });
  }

  return {
    describe: registerTests
  };
});
