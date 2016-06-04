"use strict";

/*
 *
 * Spies are functions that keep track of how and often they were called, and what values were returned. This is phenomenally useful in asynchronous and event-driven applications as you can send a spy function off to keep track of what’s going on inside your methods, even if those methods are anonymous or closed off from direct inspection.
 */

define([
  "backbone",
  "libs/backbone_couchdb/backbone-couchdb",
  "jquerycouch",
  "sinon"
], function() {
  function registerTests() {
    describe("Backbone Model's change events", function() {
      var server;

      beforeEach(function() {
        server = sinon.fakeServer.create();

        Backbone.couch_connector.config.db_name = "episode";
        OPrime.debug("Backbone.couch_connector.config",
          Backbone.couch_connector.config);
      });

      afterEach(function() {
        server.restore();
      });

      it("should fire a callback when a Backbone event is triggered", function() {
        var Episode = Backbone.Model.extend({
          url: function() {
            return "/episode/" + this.id;
          }
        });

        // Create an anonymous spy
        var spy = sinon.spy();

        // Create a new Backbone 'Episode' model
        var episode = new Episode({
          title: "Hollywood - Part 2"
        });

        // Call the anonymous spy method when 'foo' is triggered
        episode.bind('foo', spy);

        // Trigger the foo event
        episode.trigger('foo');

        // Expect that the spy was called at least once
        expect(spy.called).toBeTruthy();
      });

      it("should fire the change event after a fetch from mocked server", function(done) {
        var Episode = Backbone.Model.extend({
          url: function() {
            return "/episode/" + this.id;
          }
        });

        var callback = sinon.spy();

        // Set how the fake server will respond This reads: a GET request for
        // /episode/123 will return a 200 response of type application/json with
        // the given JSON response body
        server.respondWith(
          "GET",
          "/episode/123", [
            200, {
              "Content-Type": "application/json"
            },
            '{"_id":"123", "_rev" : "1-3c03fe04b1d1c00582fa1c1992897a84", "title":"Hollywood - Part 2"}'
          ]);

        var episode = new Episode({
          _id: "123"
        });
        // It should have set the model's id
        expect(episode.id).toEqual(episode.get("_id"));

        // Bind to the change event on the model
        episode.bind('change', callback);

        // makes an ajax request to the server
        episode.fetch({
          success: function() {
            // Expect that the spy was called with the new model
            expect(callback.called).toBeTruthy();
            expect(callback.getCall(0).args[0].attributes).toEqual({
              _id: "123",
              _rev: "1-3c03fe04b1d1c00582fa1c1992897a84",
              title: "Hollywood - Part 2"
            });

            done();
          },
          error: function(err) {
            expect(callback.called).toBeTruthy();
            expect(err).toBeNull();
            done();
          }
        });

        // Fake server responds to the request
        server.respond();
      });
    });
  }

  return {
    describe: registerTests
  };
});
