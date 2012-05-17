require(["Utils"], function(Utils) {
	//Testing to see where the app is running, if it is installed on android, installed in chrome or if it is a web widget.
	describe("Offline App", function() {
		it("should not be a Chrome extension", function() {
			var utils = new Utils();
			expect(! utils.chromeApp() ).toBeTruthy();
		});
		it("should not be an Offline Android app", function() {
			var utils = new Utils();
			expect(! utils.androidApp() ).toBeTruthy();
		});
		it("should be an Online app", function() {
			var utils = new Utils();
			expect( utils.onlineOnly() ).toBeTruthy();
		});

	});

});