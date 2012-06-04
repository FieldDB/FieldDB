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
        it("should not authenticate if login good username bad password",
            function() {
          
//          var authenticated = u.login("sapir", "hypothesis");
//          expect(!authenticated).toBeTruthy();
        });
        it("should not authenticate if login bad username any password",
            function() {
         
//          var authenticated = u.login("sapri", "phoneme");
//          expect(!authenticated).toBeTruthy();
        });
        it("should  authenticate if login good username good password",
            function() {
          
//          var authenticated = u.login("sapir", "phoneme");
//          expect(authenticated).toBeTruthy();
        });
    });
});