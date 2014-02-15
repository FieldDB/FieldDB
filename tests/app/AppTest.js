var OPrime = OPrime || require('../../backbone_client/libs/OPrime.js');

// Testing to see where the app is running, if it is installed on android,
// installed in chrome or if it is a web widget.
xdescribe("App: as a developer I want to deploy to multiple targets", function() {
  it("should not be a Chrome extension", function() {
    expect(!OPrime.isChromeApp()).toBeTruthy();
  });

  it("should not be an Offline Android app", function() {
    expect(!OPrime.isAndroidApp()).toBeTruthy();
  });

  it("should not be an CouchApp", function() {
    expect(!OPrime.isCouchApp()).toBeTruthy();
  });
});
