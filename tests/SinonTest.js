/*
 * 
 * Spies are functions that keep track of how and often they were called, and what values were returned. This is phenomenally useful in asynchronous and event-driven applications as you can send a spy function off to keep track of what’s going on inside your methods, even if those methods are anonymous or closed off from direct inspection.
 */

(function() {
	var specs = [];

	describe("Sinon spy on Backbone Episode model", function() {
		beforeEach(function() {
			this.server = sinon.fakeServer.create();
		});

		afterEach(function() {
			this.server.restore();
		});

		it("should fire the change event", function() {
			
			var Episode = Backbone.Model.extend({
				  url: function() {
				    return "/episode/" + this.id;
				  }
				});
			
			var callback = sinon.spy();

			// Set how the fake server will respond
			// This reads: a GET request for /episode/123 
			// will return a 200 response of type 
			// application/json with the given JSON response body
			this.server.respondWith("GET", "/episode/123", [ 200, {
				"Content-Type" : "application/json"
			}, '{"id":123,"title":"Hollywood - Part 2"}' ]);

			var episode = new Episode({
				id : 123
			});

			// Bind to the change event on the model
			episode.bind('change', callback);

			// makes an ajax request to the server
			episode.fetch();

			// Fake server responds to the request
			this.server.respond();

			// Expect that the spy was called with the new model
			expect(callback.called).toBeTruthy();
			expect(callback.getCall(0).args[0].attributes).toEqual({
				id : 123,
				title : "Hollywood - Part 2"
			});

		});

	});

})();