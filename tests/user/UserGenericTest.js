require([
 "user/UserGeneric"
 ], function(UserGeneric) {

    //TODO @hisakonog do we want these to test that the UserGeneric is populated with the Sapir character? or that they are null... or that they are the "public" character?
    //TODO @cesine let UserGeneric be the "public" character and use Sapir for User test

	describe("as a Generic User I want to see how I appear on the dashboard", function() {
		it("should set public user name", function() {
			var u = new UserGeneric();
			expect(u.get("username")).toEqual("");	
			//			u.set("username", "public");
//			expect("public" == u.get("username")).tobeTruthy();
		});
 
    
        it("should set default password", function() {
        	var u = new UserGeneric();
            expect(u.get("password")).toEqual("");
        });

    
        it("should set default email", function() {
        	var u = new UserGeneric();
            expect(u.get("email")).toEqual("");
        });
  
    
        it("should set default gravatar", function() {
        	var u = new UserGeneric();
        	expect(u.get("gravatar")).toEqual("./../user/user_gravatar.png");
        	//        	u.set("gravatar", "./../user/public_gravatar.png")
//            expect("./../user/public_gravatar.png" == u.get("gravatar")).tobeTruthy();
        });

    
        it("should set default researchInterest", function() {
        	var u = new UserGeneric();
            expect(u.get("researchInterest")).toEqual("");

        });
    
    
        it("should set default affiliation", function() {
        	var u = new UserGeneric();
            expect(u.get("affiliation")).toEqual("");
        });
 
    
        it("should set default description", function() {
			var u = new UserGeneric();
			expect(u.get("description")).toEqual("");
			//			u.set("description", "public user");
//			expect("public user" == u.get("description")).tobeTruthy();
        });
  
    
        it("should set default subtitle", function() {
        	var u = new UserGeneric();
        	expect(u.get("subtitle")).toEqual("");
        });
  
    
        it("should set default dataList", function() {
        	var u = new UserGeneric();
        	expect(u.get("dataLists")).toEqual([]);
        });
  
    
        it("should set default prefs", function() {
        	var u = new UserGeneric();
        	expect(u.get("prefs")).toBeTruthy;
      });
  
    

  });
}); 
