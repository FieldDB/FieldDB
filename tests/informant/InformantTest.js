require([
    "informant/Informant", 
    "user/User",
], function(Informant,User) {
   
    
    	describe("Test Informant", function() {
    		it("should create an informant", function() {
    			var i = new Informant();
    			var isanInformant = i instanceof Informant;
    			var isaUser = i instanceof User;
    			expect(isanInformant && isaUser).toBeTruthy();
    
    		});
    		it("should create multiple informants", function() {
    			var  informants = [];
    			informants.push(new Informant());
    			informants.push(new Informant());
    			informants.push(new Informant());
    			
    			expect(informants.length == 3).toBeTruthy();
    			
    		});
    
    	});
    
    	
    });