var App = App || require('../../api/app/App.js').App;
var specIsRunningTooLong = 5000;

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
      app.contextualizer.currentLocale = "es";
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
        default: "locale_Username"
      })).toEqual("Username:");

    });

    it("should be not error if asked to contextualize objects when no contextualizer exists", function() {
      var app = new App({
        debugMode: true
      });

      expect(app).toBeDefined();
      expect(app.contextualizer).toBeUndefined();
      expect(app.contextualize({
        default: "locale_Username"
      })).toEqual("locale_Username");

    });
  });

  describe("load", function() {

    it("should begin with positions for data to be filled in", function() {
      var app = new App();
      expect(app.datumsList).toBeDefined();
      expect(app.sessionsList).toBeDefined();
      expect(app.datalistsList).toBeDefined();
      expect(app.usersList).toBeDefined();
    });

    it("should be able to load a corpus dashboard based on routeParams", function(done) {
      var app = new App({
        // debugMode: true
      });
      app.processRouteParams();
      expect(app.warnMessage).toContain("Route params are undefined, not loading anything");

      app.processRouteParams({
        team: "lingllama",
        corpusid: "community-_corpus"
      });
      expect(app.currentCorpusDashboard).toEqual("lingllama/community-_corpus");
      expect(app.currentCorpusDashboardDBname).toEqual("lingllama-community-_corpus");

      setTimeout(function() {
        expect(app.warnMessage).toContain("Rendering, but the render was not injected for this App");
        done();
      }, 500);
    }, specIsRunningTooLong);

    it("should be able to load an import dashboard based on routeParams", function(done) {
      var app = new App({
        debugMode: true
      });
      app.processRouteParams({
        team: "lingllama",
        corpusid: "community-_corpus",
        importType: "participants"
      });
      expect(app.currentCorpusDashboard).toEqual("lingllama/community-_corpus");
      expect(app.currentCorpusDashboardDBname).toEqual("lingllama-community-_corpus");

      setTimeout(function() {
        expect(app.warnMessage).toContain("Rendering, but the render was not injected for this App");
        done();
      }, 100);
    }, specIsRunningTooLong);

    it("should be able to load an search dashboard based on routeParams", function(done) {
      var app = new App({
        debugMode: true
      });
      app.processRouteParams({
        team: "lingllama",
        corpusid: "community-_corpus",
        searchQuery: "morphemes:naya OR gloss:des OR gloss:IMP"
      });
      expect(app.currentCorpusDashboard).toEqual("lingllama/community-_corpus");
      expect(app.currentCorpusDashboardDBname).toEqual("lingllama-community-_corpus");

      setTimeout(function() {
        expect(app.warnMessage).toContain("Rendering, but the render was not injected for this App");
        done();
      }, 100);
    }, specIsRunningTooLong);

    it("should be able to load an user/team dashboard based on routeParams", function(done) {
      var app = new App({
        debugMode: true
      });
      app.processRouteParams({
        team: "lingllama"
      });
      expect(app.currentCorpusDashboard).toBeUndefined();
      expect(app.currentCorpusDashboardDBname).toBeUndefined();

      setTimeout(function() {
        expect(app.warnMessage).toContain("Rendering, but the render was not injected for this App");
        done();
      }, 100);
    }, specIsRunningTooLong);

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
