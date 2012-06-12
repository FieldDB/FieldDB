require([
    "user/Informant",
    "user/User"
], function(Informant,User) {
   
    
    	describe("as an Informant, I want to set up my Informant info", function() {
    		it("should set an informant code", function() {
    			var i = new Informant();
    			i.set("informantcode", "C.M.B.");
    			expect("C.M.B." == u.get("informantcode")).tobeTruthy();
    
    		});

    		it("should set informant's birthdate", function() {
    			var i = new Informant();
    			i.set("informantcode", "C.M.B.");
    			i.set("birthDate", "January 1, 1900");
    			expect("C.M.B." == u.birthDate("January 1, 1900")).tobeTruthy();
    
    		});
		
    
    		it("should set informant's language", function() {
    			var i = new Informant();
    			i.set("informantcode", "C.M.B.");
    			i.set("language", "Cat");
    			expect("C.M.B." == u.language("Cat")).tobeTruthy();
    
    		});
	
    		it("should set informant's dialect", function() {
    			var i = new Informant();
    			i.set("informantcode", "C.M.B.");
    			i.set("dialect", "Catfrench");
    			expect("C.M.B." == u.dialect("Catfrench")).tobeTruthy();
    
    		});
	
    		
    		
    	});
    
    	
    }); 


