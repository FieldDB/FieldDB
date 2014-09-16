var App = App || require('../../api/app/App.js').App;

describe("App", function() {

  describe("construction", function() {
    it("should load", function() {
      expect(App).toBeDefined();
    });

    it("should create new apps", function() {
      var app = new App();
      expect(app).toBeDefined();
    });
  });
});


// Testing to see where the app is running, if it is installed on android,
// installed in chrome or if it is a web widget.
describe("App: as a developer I want to deploy to multiple targets", function() {
  it("should not be a Chrome extension", function() {
    var app = new App();
    expect(app.isChromeApp).toBeFalsy();
  });

  it("should not be an Offline Android app", function() {
    var app = new App();
    expect(app.isAndroidApp).toBeFalsy();
  });

  it("should not be an CouchApp", function() {
    var app = new App();
    expect(app.isCouchApp).toBeFalsy();
  });

  it("should be a NodeJS app", function() {
    var app = new App();
    expect(app.isNodeJSApp).toBeTruthy();
  });
});
