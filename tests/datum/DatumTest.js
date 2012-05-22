require([
    "datum/Datum"
], function(Datum) {
	//(function() {
		//var specs = [];

		describe("Test DatumGeneric", function() {
			it("should set the utterance", function() {
				var d = new Datum();
				d.set("utterance", "tusunayawan");
				expect("tusunayawan" == d.get("utterance")).toBeTruthy();
			});


			it("should have a gloss line ", function() {
				var d = new Datum();
				d.set("utterance", "tusunayawan");
				d.set("gloss", "dance-IMP-1OM-3SG");
				expect("dance-IMP-1OM-3SG" == d.get("gloss")).toBeTruthy();

			});

			it("should have a translation line ", function() {
				var d = new Datum();
				d.set("utterance", "tusunayawan");
				d.set("gloss", "dance-IMP-1OM-3SG");
				d.set("translation","I feel like dancing.");
				expect("I feel like dancing." == d.get("translation")).toBeTruthy();

			});

	});
});
