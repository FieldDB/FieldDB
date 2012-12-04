require([
    "team/Team",
    "user/User"
], function(Team,User) {

	//TODO @cesine Do we want to have a Team admin type of entity who can add and/delete team members and modify their permissions? 
	//             Or every team member can do that? 
	

	describe("as a User I want to set up my team name", function() {
		it("should set default team name", function() {
			var u = new User();
			expect(u.get("teamname")).toEqual("");
		});
		
		it("should set user's team name", function(){
			var u = new User();
			u.set("username", "esapir");
			u.set("teams", ["YaleNavajo"]);
			expect("esapir" == u.teams(["YaleNavajo"])).tobeTruthy();
		});
		
		
	});
	
	
	describe("as a Team member, I want to be able to add and delete members", function() {
		it("should add a new team member", function() {
//			var u = new User(); 
//            expect(true).toBeTruthy();
        });

		it("should delete a team member", function() {
//            expect(true).toBeTruthy();
        });

		it("should modify member's permissions", function() {
//			var permission = new Permission();
//			expect(true).toBeTruthy();
            
        });
		
		
	}); 
	
	
});

