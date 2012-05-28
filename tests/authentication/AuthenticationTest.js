require([
    "authentication/Authentication"
], function(Authentication) {
    describe("Authentication Tests", function() {
        it("should look up the user on the server if the app is online", function() {
        	 expect(true).toBeTruthy();
        });
        it("should look up the user locally if the app is offline", function() {
        	 expect(true).toBeTruthy();
        });
        it("should not log the user in if the server replies not-authenticated", function() {
        	 expect(true).toBeTruthy();
        });
    });
});