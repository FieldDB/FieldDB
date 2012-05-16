require([
    "datum_tag/DatumTag"
], function(DatumTag) {
	(function() {
		var specs = [];

		describe("Test DatumTagGeneric", function() {
			it("should give a datum datum tag", function() {
				var d = new DatumStatus();
				d.set("datum tag", "impulsative");
				expect("impulsative" == d.get("datum tag")).toBeTruthy();
				
			});


	})();
});