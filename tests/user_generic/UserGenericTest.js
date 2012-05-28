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

    
    it("should set default researchInterest", function() {
        //var UserGeneric = require("UserGeneric");
        var u = new UserGeneric();
        expect(u.get("researchInterest")).toEqual("");
      });
    
    
    it("should set default affiliation", function() {
        //var UserGeneric = require("UserGeneric");
        var u = new UserGeneric();
        expect(u.get("affiliation")).toEqual("");
      });
  
    
    it("should set default description", function() {
        //var UserGeneric = require("UserGeneric");
        var u = new UserGeneric();
        expect(u.get("description")).toEqual("");
      });
  
    
    it("should set default subtitle", function() {
        //var UserGeneric = require("UserGeneric");
        var u = new UserGeneric();
        expect(u.get("subtitle")).toEqual("");
      });
  
    
    it("should CORPUS", function() {
        //var UserGeneric = require("UserGeneric");
        var u = new UserGeneric();
        expect(u.get("email")).toEqual("");
      });
  
    it("should DataList", function() {
        //var UserGeneric = require("UserGeneric");
        var u = new UserGeneric();
        expect(u.get("email")).toEqual("");
      });
  
    
    it("should set PREFs", function() {
        //var UserGeneric = require("UserGeneric");
        var u = new UserGeneric();
        expect(u.get("email")).toEqual("");
      });
  
    

  });
}); 
