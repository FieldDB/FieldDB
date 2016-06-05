define([
  "app/App",
  "OPrime"
], function(
  App,
  OPrime) {
  "use strict";

  function registerTests() {
    // Testing to see where the app is running, if it is installed on android,
    // installed in chrome or if it is a web widget.
    describe("App", function() {
      describe("As a developer I want to deploy to multiple targets", function() {
        it("should be a Chrome extension", function() {
          expect(OPrime.isChromeApp()).toBeTruthy();
        });

        it("should not be an Offline Android app", function() {
          expect(!OPrime.isAndroidApp()).toBeTruthy();
        });

        it("should not be an CouchApp", function() {
          expect(!OPrime.isCouchApp()).toBeTruthy();
        });
      });
    });
  }

  return {
    describe: registerTests
  };
});
