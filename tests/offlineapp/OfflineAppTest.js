
TestCase("OfflineAppTest", {
    "test as Chrome extension": function() {
        var app = new App();
        assertFalse(app.chromeApp);
    }
	,"test as Android app": function() {
        var app = new App();
        assertFalse(app.androidApp);
	}
	,"test as Online app": function() {
        var app = new App();
        assertTrue(app.onlineOnly);
    }
});