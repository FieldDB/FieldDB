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

  describe("contextualiation", function() {
    it("should be able to contextualize strings", function() {
      var app = new App({
        // debugMode: true
      });
      app.contextualizer = {};

      expect(app).toBeDefined();
      expect(app.contextualizer.currentLocale).toEqual('en');
      expect(app.contextualize('locale_Username')).toEqual('Username:');
      app.contextualizer.currentLocale = 'es';
      expect(app.contextualize('locale_Username')).toEqual('Usuario:');
    });

    it("should be able to contextualize objects", function() {
      var app = new App({
        // debugMode: true,
        contextualizer: {}
      });

      expect(app).toBeDefined();
      expect(app.contextualizer).toBeDefined();
      expect(app.contextualize({
        default: 'locale_Username'
      })).toEqual('Username:');

    });

    it("should be not error if asked to contextualize objects when no contextualizer exists", function() {
      var app = new App({
        debugMode: true
      });

      expect(app).toBeDefined();
      expect(app.contextualizer).toBeUndefined();
      expect(app.contextualize({
        default: 'locale_Username'
      })).toEqual('locale_Username');

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

  it("should not be an Android 4 app", function() {
    var app = new App();
    expect(app.isAndroid4).toBeFalsy();
  });

  it("should not be an CouchApp", function() {
    var app = new App();
    expect(app.isCouchApp).toBeFalsy();
  });

  it("should not be an TouchDBApp", function() {
    var app = new App();
    expect(app.isTouchDBApp).toBeFalsy();
  });

  it("should be a NodeJS app", function() {
    var app = new App();
    expect(app.isNodeJSApp).toBeTruthy();
  });
});
