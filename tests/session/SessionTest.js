require([
    "session/Session"
], function(Session) {
	
		describe("Test SessionGeneric", function() {
			it("should assign a sessionID", function() {
				var d = new Session();
				d.set("SessionID", 0);
				expect(0 == d.get("SessionID")).toBeTruthy();
			});



	});
});