require([
    "datum/Datum"
], function(Datum) {
	
		describe("Test Datum", function() {
			it("should set the utterance", function() {
				var d = new Datum();
				expect("tusunayawan" == d.get("utterance")).toBeTruthy();
			});


			it("should have a gloss line ", function() {
				var d = new Datum();
				expect("dance-IMP-1OM-3SG" == d.get("gloss")).toBeTruthy();

			});

			it("should have a translation line ", function() {
				var d = new Datum();
				expect("I feel like dancing." == d.get("translation")).toBeTruthy();

			});
			it("should have grammatical tags", function() {
				var d = new Datum();
				expect("impulsative" == d.get("grammaticalTags")).toBeTruthy();
			});

	});
});
