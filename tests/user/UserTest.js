require([
    "user/User"
], function(User) {

  describe("Test User", function() {
    it("should set user's first name", function() {
      var u = new User();
      u.set("firstname", "Bill");
      expect("Bill" == u.get("firstname")).toBeTruthy();
    });
  });
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
		
	});

});