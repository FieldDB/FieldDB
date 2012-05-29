require([
    "user/User"
], function(User) {
   
	describe("Test User", function() {
		it("should set user's first name", function() {
			var u = new User();
			u.set("firstname", "Bill");
			expect("Bill" == u.get("firstname")).toBeTruthy();
		});
		it("should have a subtitle constisting of firstname lastname ", function() {
			var u = new User();
			u.set("firstname", "Ed");
			u.set("lastname", "Sapir");
			expect("Ed Sapir" == u.subtitle()).toBeTruthy();
		});
		it("should not authenticate if login good username bad password",
				function() {
			var u = new User();
			u.set("username", "esapir");
			u.set("password", "wharf");
			var authenticated = u.login("esapir", "hypothesis");
			expect(!authenticated).toBeTruthy();
		});
		it("should not authenticate if login bad username any password",
				function() {
			var u = new User();
			u.set("username", "esapir");
			u.set("password", "wharf");
			var authenticated = u.login("essapir", "wharf");
			expect(!authenticated).toBeTruthy();
		});
		it("should  authenticate if login good username good password",
				function() {
			var u = new User();
			u.set("username", "esapir");
			u.set("password", "wharf");
			var authenticated = u.login("esapir", "wharf");
			expect(authenticated).toBeTruthy();
		});
	});

});