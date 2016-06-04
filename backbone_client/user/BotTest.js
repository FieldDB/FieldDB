require([
    "bot/Bot"
], function(Bot) {
    
    
    	describe("Test Bot", function() {
    		it("should create a bot", function() {
    			var b = new Bot();
    			var isaBot = b instanceof Bot;
    			var isaUser = b instanceof User;
    			expect(isaBot && isaUser).toBeTruthy();
    
    		});
    		it("should create multiple bots", function() {
    			var  bots = [];
    			bots.push(new Bot());
    			bots.push(new Bot());
    			bots.push(new Bot());
    			
    			expect(bots.length == 3).toBeTruthy();
    			
    
    		});
    
    	});   	
   
});