require([
    "datum/Datum"
], function(Datum) {
	
		describe("Test Datum", function() {
			it("should set the utterance", function() {
				var d = new Datum();
				expect("" == d.get("utterance")).toBeTruthy();
			});


			it("should have a gloss line ", function() {
				var d = new Datum();
				expect("" == d.get("gloss")).toBeTruthy();

			});

			it("should have a translation line ", function() {
				var d = new Datum();
				expect("" == d.get("translation")).toBeTruthy();

			});
			it("should have grammatical tags", function() {
				var d = new Datum();
				expect("" == d.get("grammaticalTags")).toBeTruthy();
			});

	});
});
