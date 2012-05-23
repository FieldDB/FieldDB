require([
 "user_generic/UserGeneric"
 ], function(UserGeneric) {
	
  describe("UserGeneric", function() {
	  
    it("should set default username", function() {
      //var UserGeneric = require("UserGeneric");
      var u = new UserGeneric();
      expect(u.get("username")).toEqual("");
    });
    
    it("should set default password", function() {
        //var UserGeneric = require("UserGeneric");
        var u = new UserGeneric();
        expect(u.get("password")).toEqual("");
      });

    it("should set default email", function() {
        //var UserGeneric = require("UserGeneric");
        var u = new UserGeneric();
        expect(u.get("email")).toEqual("");
      });
  
    it("should set default gravatar", function() {
        //var UserGeneric = require("UserGeneric");
        var u = new UserGeneric();
        expect(u.get("gravatar")).toEqual("./../user/user_gravatar.png");
      });



  });
}); 
