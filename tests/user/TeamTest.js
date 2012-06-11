require([
    "team/Team",
    "user/User"
], function(Team,User) {
	
	describe("Test Team", function() {
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
});