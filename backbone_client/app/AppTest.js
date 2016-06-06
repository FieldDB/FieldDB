define([
  "backbone",
  "libs/FieldDBBackboneModel",
  "jquery",
  "app/App",
  "OPrime",
  "sinon"
], function(
  Backbone,
  FieldDBBackboneModel,
  jQuery,
  App,
  OPrime,
  sinon
) {
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

      describe("As a user I want to work offine", function() {
        it("should require a couch connection", function() {
          var app = new App();
          var callback = sinon.spy();

          expect(function() {
            app.changePouch(null, callback);
          }).toThrowError("The app cannot function without knowing which database is in use.");

          expect(callback.called).toBeFalsy();
        });

        it("should set the couch url", function(done) {
          var app = new App();
          expect(Backbone.sync.pouch).toEqual(undefined);
          expect(Backbone.couch_connector.config).toEqual({
            db_name: 'default',
            ddoc_name: 'deprecated',
            view_name: 'byCollection',
            list_name: null,
            global_changes: false,
            single_feed: false,
            base_url: null
          });

          app.changePouch({
            dbname: "tester-set-couch-url",
            corpusUrl: "https://db.somewhere.ca"
              // corpusUrl: "https://localhost:6984"
          }, function() {
            expect(Backbone.sync.pouch).toEqual(undefined);
            expect(Backbone.couch_connector.config).toEqual({
              db_name: 'tester-set-couch-url',
              ddoc_name: 'deprecated',
              view_name: 'byCollection',
              list_name: null,
              global_changes: false,
              single_feed: false,
              base_url: 'https://db.somewhere.ca'
            });

            expect(jQuery.couch.urlPrefix).toEqual('https://db.somewhere.ca');
            expect(app.get("connection").dbname).toEqual("tester-set-couch-url");

            done();
          });
        });
      });
    });
  }

  return {
    describe: registerTests
  };
});
