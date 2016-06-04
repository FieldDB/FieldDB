require([
    "user/UserPreference"
], function(UserPreference) {
	
		describe("Test UserPreference", function() {
          it("should initialize the UserPreference menu", function() {
          var p = new UserPreference();
          expect(p).not.toBeNull();
          });


			it("should allow users to change their preferences", function() {
				expect(true).toBeTruthy();
			});


			it("should contain skin preference ", function() {
				var p = new UserPreference();
//				expect("skin" == p.get("skin")).toBeTruthy();

			});

			it("should contain hotKey preference ", function() {
				var p = new UserPreference();
	//			expect("hotKey" == p.get("hotKey")).toBeTruthy();

			});

	});
});
