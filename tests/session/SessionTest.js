require([
    "session/Session"
], function(Session) {
	
		describe("Test SessionGeneric", function() {
			it("should assign a sessionID", function() {
				var d = new Session();
				d.set("SessionID", 0);
				expect(0 == d.get("SessionID")).toBeTruthy();
			});


			it("should have a user", function() {
				var d = new Datum();
				d.set("user", "Edward Sapir");
				expect("Edward Sapir" == d.get("user")).toBeTruthy();

			});

			it("should have a team", function() {
				var d = new Datum();
				d.set("team", "fieldlinguist");
				expect("fieldlinguist" == d.get("team")).toBeTruthy();

			});

			it("should have an informant", function() {
				var d = new Datum();
				d.set("informant", "Lingit");
				//Name for the people who speak Tlingit.
				expect("Lingit" == d.get("informant")).toBeTruthy();

			});

			it("should have a language", function() {
				var d = new Datum();
				d.set("language", "Tlingit");
				expect("Tlingit" == d.get("language")).toBeTruthy();

			});
			
			it("should have a language family", function() {
				var d = new Datum();
				d.set("language family", "Na-Dene");
				expect("Na-Dene" == d.get("language family")).toBeTruthy();

			});

			it("should have a dialect", function() {
				var d = new Datum();
				d.set("dialect", "Yakutat");
				expect("Yakutat" == d.get("dialect")).toBeTruthy();
				//Yakutat City largest city in the US, six times larger than the state of Rhode Island.

			});

			it("should have a date", function() {
				var d = new Datum();
				d.set("date", "16/5/2012");
				//what form does the date really go in? Could it be a number?
				expect("16/5/2012" == d.get("date")).toBeTruthy();

			});

			it("should have a goal", function() {
				var d = new Datum();
				d.set("goal", "To prove that Haida is related.");
				expect("To prove that Haida is related" == d.get("goal")).toBeTruthy();

			});		

	});
});