define([
  "backbone",
  "app/App",
  "OPrime"
], function(
  Backbone,
  App,
  OPrime) {
  "use strict";

  function registerTests() {
    // Testing to see where the app is running, if it is installed on android,
    // installed in chrome or if it is a web widget.
    describe("App", function() {
      describe("As a user I want to see my most recent dashboard", function() {
        it("should support filledWithDefaults", function(done) {
          var app = new App({
            filledWithDefaults: true
          });

          expect(app).toBeDefined();
          app.on("change", function(model) {
            expect(model.get("corpus")).toBeDefined();

            done();
          });
        });
      });

      describe("#events", function() {
        it("should listen for dashboard:load:success", function(done) {
          var app = new App();

          app.on("change", function(model) {
            expect(model.get("loaded")).toBeDefined();
            expect(model.get("loaded")).toBeTruthy();

            done();
          });

          Backbone.trigger('dashboard:load:success');
        });
      });

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
