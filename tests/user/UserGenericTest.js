require([
 "user/UserGeneric"
 ], function(UserGeneric) {
	
  describe("UserGeneric", function() {
	  
	  //TODO @hisakonog do we want these to test that the UserGeneric is populated with the Sapir character? or that they are null... or that they are the "public" character?
//	  
//    it("should set default username", function() {
//      //var UserGeneric = require("UserGeneric");
//      var u = new UserGeneric();
//      expect(u.get("username")).toEqual("");
//    });
// 
//    
//    it("should set default password", function() {
//        //var UserGeneric = require("UserGeneric");
//        var u = new UserGeneric();
//        expect(u.get("password")).toEqual("");
//      });
//
//    
//    it("should set default email", function() {
//        //var UserGeneric = require("UserGeneric");
//        var u = new UserGeneric();
//        expect(u.get("email")).toEqual("");
//      });
//  
//    
//    it("should set default gravatar", function() {
//        //var UserGeneric = require("UserGeneric");
//        var u = new UserGeneric();
//        expect(u.get("gravatar")).toEqual("./../user/user_gravatar.png");
//      });
//
//    
//    it("should set default researchInterest", function() {
//        //var UserGeneric = require("UserGeneric");
//        var u = new UserGeneric();
//        expect(u.get("researchInterest")).toEqual("");
//      });
//    
//    
//    it("should set default affiliation", function() {
//        //var UserGeneric = require("UserGeneric");
//        var u = new UserGeneric();
//        expect(u.get("affiliation")).toEqual("");
//      });
//  
//    
//    it("should set default description", function() {
//        //var UserGeneric = require("UserGeneric");
//        var u = new UserGeneric();
//        expect(u.get("description")).toEqual("");
//      });
  
    
    it("should set default subtitle", function() {
        //var UserGeneric = require("UserGeneric");
        var u = new UserGeneric();
        expect(u.get("subtitle")).toEqual("");
      });
  
    
    it("should set default dataList", function() {
        //var UserGeneric = require("UserGeneric");
        var u = new UserGeneric();
        expect(u.get("dataLists")).toEqual([]);
      });
  
    
    it("should set default prefs", function() {
        //var UserGeneric = require("UserGeneric");
        var u = new UserGeneric();
        expect(u.get("prefs")).toBeTruthy;
      });
  
    

  });
}); 
