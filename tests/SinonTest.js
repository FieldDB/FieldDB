/*
 * 
 * Spies are functions that keep track of how and often they were called, and what values were returned. This is phenomenally useful in asynchronous and event-driven applications as you can send a spy function off to keep track of what’s going on inside your methods, even if those methods are anonymous or closed off from direct inspection.
 */

(function() {
	var specs = [];

	describe("Sinon spy on Backbone Episode model", function() {
		it("should fire a callback when 'foo' is triggered", function() {
			// Create an anonymous spy
			var spy = sinon.spy();

			// Create a new Backbone 'Episode' model
			var episode = new Backbone.Model({
				title : "Hollywood - Part 2"
			});

			// Call the anonymous spy method when 'foo' is triggered
			episode.bind('foo', spy);

			// Trigger the foo event
			episode.trigger('foo');

			// Expect that the spy was called at least once
			expect(spy.called).toBeTruthy();
		});
	});

})();
/*
 * Fake server: http://msdn.microsoft.com/en-us/magazine//gg649850.aspx
 * 
 * var blog = { posts : {},
 * 
 * getPost : function(id, callback, errback) { if (this.posts[id]) { typeof
 * callback == "function" && callback(posts[id]); return; }
 * 
 * jQuery.ajax({ url : "/posts/" + id, type : "get", dataType : "json",
 * 
 * success : function(data, status, xhr) { this.posts[id] = data; typeof
 * callback == "function" && callback(data); },
 * 
 * errback : function(xhr, status, exception) { typeof callback == "function" &&
 * errback(status); } }); },
 * 
 * savePost : function(blogPost, callback, errback) { // ... } };
 * TestCase("BlogPostServiceTest", sinon.testCase({ setUp : function() {
 * this.server.respondWith("GET", "/posts/312", [ 200, { "Content-Type" :
 * "application/json" }, '{"title":"Unit test your
 * JavaScript","author":"Christian Johansen"' + ',"text":"..."}' ]); },
 * 
 * "test should call callback with parsed data from server" : function() { var
 * blogPost;
 * 
 * blog.getPost(312, function(post) { blogPost = post; });
 * 
 * this.server.respond();
 * 
 * assertEquals({ title : "Unit test your JavaScript", author : "Christian
 * Johansen", text : "..." }, blogPost); } }));
 * 
 */
