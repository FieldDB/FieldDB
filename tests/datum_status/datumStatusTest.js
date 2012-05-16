require([
    "datum_status/DatumStatus"
], function(DatumStatus) {
	(function() {
		var specs = [];

		describe("Test DatumStatusGeneric", function() {
			it("should give a datum_status", function() {
				var d = new DatumStatus();
				d.set("datum_status", "checked");
				expect("checked" == d.get("datum_status")).toBeTruthy();
				
			});


	})();
});
