TestCase("TeamTest", { 
	"test if user is a team, if yes get affiliation in subtitle": function() {
		var team = new User();
		team.set("isTeam", true);
		team.set("affiliation", "Yale");
		assertSame("Yale", team.subtitle());
	}
,	"test setting team affiliation" : function () {
		var team = new User();
		team.set("affiliation", "Yale");
		assertSame("Yale", team.get("affiliation"));
}
});
