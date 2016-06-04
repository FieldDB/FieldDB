require([
    "user/Consultant",
    "user/User"
], function(Consultant,User) {
   
    
    	describe("as an Consultant, I want to set up my Consultant info", function() {
    		it("should set an consultant code", function() {
    			var i = new Consultant();
    			i.set("consultantcode", "C.M.B.");
    			expect("C.M.B." == u.get("consultantcode")).tobeTruthy();
    
    		});

    		it("should set consultant's birthdate", function() {
    			var i = new Consultant();
    			i.set("consultantcode", "C.M.B.");
    			i.set("birthDate", "January 1, 1900");
    			expect("C.M.B." == u.birthDate("January 1, 1900")).tobeTruthy();
    
    		});
		
    
    		it("should set consultant's language", function() {
    			var i = new Consultant();
    			i.set("consultantcode", "C.M.B.");
    			i.set("language", "Cat");
    			expect("C.M.B." == u.language("Cat")).tobeTruthy();
    
    		});
	
    		it("should set consultant's dialect", function() {
    			var i = new Consultant();
    			i.set("consultantcode", "C.M.B.");
    			i.set("dialect", "Catfrench");
    			expect("C.M.B." == u.dialect("Catfrench")).tobeTruthy();
    
    		});
	
    		
    		
    	});
    
    	
    }); 


