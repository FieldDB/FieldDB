"use strict";

/*
 * Spies are functions that keep track of how and often they were called,
 *  and what values were returned. This is phenomenally useful in asynchronous
 *  and event-driven applications as you can send a spy function off to keep track of whatâ
 *   going on inside your methods, even if those methods are anonymous or closed off from direct inspection.
 */

define([
  "backbone",
  "sinon"
], function() {
  function registerTests() {
    describe("Backbone-CouchDB Connection", function() {
      var server;

      beforeEach(function() {
        server = sinon.fakeServer.create();

        Backbone.couch_connector.config.db_name = "episode";
        OPrime.debug("Backbone.couch_connector.config", Backbone.couch_connector.config);
      });

      afterEach(function() {
        server.restore();
      });

      it("should be able to recieve a doc from a mocked couchdb server", function(done) {
        var callback = sinon.spy();
        var Episode = Backbone.Model.extend({
          url: function() {
            return "/episode/" + this.id;
          }
        });

        /*
         * Set how the fake server will respond This reads: a GET
         * request for /episode/123 will return a 200 response of type
         * application/json with the given JSON response body
         */
        server.respondWith(
          "GET",
          "/episode/123", [
            200, {
              "Content-Type": "application/json"
            },
            "{\"_id\":\"123\", \"_rev\" : \"1-3c03fe04b1d1c00582fa1c1992897a84\", \"title\":\"Hollywood - Part 2\"}"
          ]);

        var episode = new Episode({
          _id: "123"
        });
        // Backbone-CouchDB adaptor should have set the model's id
        expect(episode.id).toEqual(episode.get("_id"));

        // Bind to the change event on the model
        episode.bind("change", callback);

        // makes an ajax request to the server
        episode.fetch({
          success: function() {
            // Expect that the spy was called with the new model
            expect(callback.called).toBeTruthy();
            expect(episode.attributes).toEqual({
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

        OPrime.debug("episode", episode);

        // Fake server responds to the request
        server.respond();
      });
    });
  }

  return {
    describe: registerTests
  };
});
