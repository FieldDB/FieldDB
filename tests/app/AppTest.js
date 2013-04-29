require(["libs/Utils"], function() {
	//Testing to see where the app is running, if it is installed on android, installed in chrome or if it is a web widget.
	describe("Offline App", function() {
		it("should not be a Chrome extension", function() {
			expect(!Utils.chromeApp()).toBeTruthy();
		});
		
		it("should not be an Offline Android app", function() {
			expect(!Utils.androidApp()).toBeTruthy();
		});
		
		it("should be an Online app", function() {
			expect(Utils.onlineOnly()).toBeTruthy();
		});
	});
}); 