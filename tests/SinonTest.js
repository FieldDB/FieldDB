/*
 * Fake server:
 * http://msdn.microsoft.com/en-us/magazine//gg649850.aspx
 */
var blog = {
	posts : {},

	getPost : function(id, callback, errback) {
		if (this.posts[id]) {
			typeof callback == "function" && callback(posts[id]);
			return;
		}

		jQuery.ajax({
			url : "/posts/" + id,
			type : "get",
			dataType : "json",	

			success : function(data, status, xhr) {
				this.posts[id] = data;
				typeof callback == "function" && callback(data);
			},

			errback : function(xhr, status, exception) {
				typeof callback == "function" && errback(status);
			}
		});
	},

	savePost : function(blogPost, callback, errback) {
		// ...
	}
};

TestCase("BlogPostServiceTest", sinon.testCase({
	setUp : function() {
		this.server.respondWith("GET", "/posts/312", [
				200,
				{
					"Content-Type" : "application/json"
				},
				'{"title":"Unit test your JavaScript","author":"Christian Johansen"'
						+ ',"text":"..."}' ]);
	},

	"test should call callback with parsed data from server" : function() {
		var blogPost;

		blog.getPost(312, function(post) {
			blogPost = post;
		});

		this.server.respond();

		assertEquals({
			title : "Unit test your JavaScript",
			author : "Christian Johansen",
			text : "..."
		}, blogPost);
	}
}));
