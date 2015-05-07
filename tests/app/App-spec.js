"use strict";
/* globals navigator, FieldDB */

var App;
var FieldDBObject;
try {
  if (FieldDB) {
    App = FieldDB.App;
    FieldDBObject = FieldDB.FieldDBObject;
  }
} catch (e) {}
App = App || require("./../../api/app/App").App;
FieldDBObject = FieldDBObject || require("./../../api/FieldDBObject").FieldDBObject;


var specIsRunningTooLong = 5000;

describe("App", function() {

  afterEach(function() {
    if (FieldDBObject.application) {
      // console.log("Cleaning up.");
      FieldDBObject.application = null;
    }
  });

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

      // Set locale to user's preferred locale by default
      expect(app.contextualizer.currentLocale.iso).toBeDefined();
      try {
        if (navigator.languages[0].indexOf(app.contextualizer.currentLocale.iso) === -1) {
          expect(app.contextualizer.currentLocale.iso).toEqual(navigator.languages[0]);
        }
      } catch (e) {
        expect(app.contextualizer.currentLocale.iso).toEqual("en");
      }

      app.contextualizer.currentLocale.iso = "en";
      expect(app.contextualize("locale_Username")).toEqual("Username:");

      app.contextualizer.currentLocale.iso = "es";
      expect(app.contextualize("locale_Username")).toEqual("Usuario:");
    });

    it("should be able to contextualize objects", function() {
      var app = new App({
        // debugMode: true,
        contextualizer: {}
      });

      expect(app).toBeDefined();
      expect(app.contextualizer).toBeDefined();
      app.contextualizer.loadDefaults();
      expect(app.contextualize({
        default: "locale_Username"
      })).toEqual("Username:");

    });

    it("should be not error if asked to contextualize objects when no contextualizer exists", function() {
      var app = new App({
        // debugMode: true
      });

      expect(app).toBeDefined();
      expect(app.contextualizer).toBeUndefined();
      expect(app.contextualize({
        default: "locale_doesnt_exist_yet"
      })).toEqual("locale_doesnt_exist_yet");

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
      var processingPromise = app.processRouteParams();
      expect(processingPromise).toBeUndefined();
      expect(app.warnMessage).toContain("Route params are undefined, not loading anything");

      processingPromise = app.processRouteParams({
        team: "nottestinguserexistsonlyrouteparams",
        corpusidentifier: "firstcorpus"
      });
      expect(processingPromise).toBeDefined();

      processingPromise.then(function(result) {
        expect(result).toEqual(app);
      }, function(reason) {
        expect(reason).toEqual(" ");
      }).fail(function(error) {
        console.error(error.stack);
        expect(error).toEqual(" ");
      }).done(done);

      expect(app.currentCorpusDashboard).toEqual("nottestinguserexistsonlyrouteparams/firstcorpus");
      expect(app.corpus.dbname).toEqual("nottestinguserexistsonlyrouteparams-firstcorpus");
    }, specIsRunningTooLong);

    it("should be able to load an import dashboard based on routeParams", function(done) {
      var app = new App({
        // debugMode: true
      });
      var processingPromise = app.processRouteParams({
        team: "nottestinguserexistsonlyrouteparams",
        corpusidentifier: "firstcorpus",
        importType: "participants"
      });
      expect(processingPromise).toBeDefined();

      processingPromise.then(function(result) {
        expect(result).toEqual(app);
        expect(app.warnMessage).toContain("An app of type App has become automagically available to all fielddb objects");
      }, function(reason) {
        expect(reason).toEqual(" ");
      }).fail(function(error) {
        console.error(error.stack);
        expect(error).toEqual(" ");
      }).done(done);

      expect(app.currentCorpusDashboard).toEqual("nottestinguserexistsonlyrouteparams/firstcorpus");
      expect(app.corpus.dbname).toEqual("nottestinguserexistsonlyrouteparams-firstcorpus");

    }, specIsRunningTooLong);

    it("should be able to load an search dashboard based on routeParams", function(done) {
      var app = new App({
        // debugMode: true
      });
      var processingPromise = app.processRouteParams({
        team: "nottestinguserexistsonlyrouteparams",
        corpusidentifier: "firstcorpus",
        searchQuery: "morphemes:naya OR gloss:des OR gloss:IMP"
      });
      expect(processingPromise).toBeDefined();
      // console.log("processingPromise");
      // console.log(processingPromise);
      processingPromise.then(function(result) {
        expect(result).toEqual(app);
      }, function(reason) {
        expect(reason).toEqual(" ");
      }).fail(function(error) {
        console.error(error.stack);
        expect(error).toEqual(" ");
      }).done(done);

      expect(app.currentCorpusDashboard).toEqual("nottestinguserexistsonlyrouteparams/firstcorpus");
      expect(app.corpus.dbname).toEqual("nottestinguserexistsonlyrouteparams-firstcorpus");

    }, specIsRunningTooLong);

    it("should be able to load an user/team dashboard based on routeParams", function() {
      var app = new App({
        // debugMode: true
      });

      var processingPromise = app.processRouteParams({
        team: "nottestinguserexistsonlyrouteparams"
      });
      expect(processingPromise).toBeUndefined();

      expect(app.currentCorpusDashboard).toBeUndefined();
      expect(app.corpus.dbname).toBeFalsy();

    });

  });

  describe("Demonstrating encrypted data", function() {
    var app;
    beforeEach(function() {
      app = new App({
        authentication: {
          user: {
            rev: "11-b56759be3f9f76762c64bb80dd95d23",
            username: "auserwhoknowstheirpassword",
            salt: "$2a$10$UsUudKMbgfBQzn5SDYWyFe",
            hash: "$2a$10$UsUudKMbgfBQzn5SDYWyFe/b47olanTrn.T4txLY/7hD08eJqrQxa",
            lastSyncWithServer: Date.now()
          }
        },
        corpus: {
          _id: "12345",
          confidential: {
            secretkey: "abc123"
          }
        }
      });
      // Simulate login
      app.authentication.user.authenticated = true;

      app.participantsList.add({
        fieldDBtype: "Participant",
        _id: "migm740610ea",
        _rev: "1-66d7dcf2ec5756f96705e4c190efbf7b",
        fields: [{
          _id: "lastname",
          shouldBeEncrypted: true,
          encrypted: true,
          defaultfield: true,
          encryptedValue: "confidential:VTJGc2RHVmtYMS9QTXluTC9qbHFSWTRrbVZyb0c5b1pjRDN1ZTY5Q291MD0=",
          mask: "xxxxxxx",
          value: "xxxxxxx"
        }],
        dateCreated: 1407516364440,
        version: "v2.0.1",
        dateModified: 1407516364460
      });

      expect(app.participantsList.docs).toBeDefined();
      expect(app.participantsList.docs.migm740610ea).toBeDefined();
    });

    it("should mask data which is encrypted", function() {
      if (app.participantsList.docs.migm740610ea.fieldDBtype === "Participant") {
        expect(app.participantsList.docs.migm740610ea.lastname).toEqual("xxxxxxx");
      }
    });

    it("should prompt user to confirm their identity to enter into unmasked mode showing encrypted data", function(done) {
      app.participantsList.docs.migm740610ea.fields.confidential = app.corpus.confidential;
      app.alwaysReplyToPrompt = "phoneme";
      FieldDBObject.application = app;
      app.enterDecryptedMode().then(function() {
        FieldDBObject.application = app;
        if (app.participantsList.docs.migm740610ea.fieldDBtype === "Participant") {
          expect(app.participantsList.docs.migm740610ea.lastname).toEqual("rkvadze");
        } else {
          expect(app.participantsList.docs.migm740610ea.fields[0].fieldDBtype).toBeUndefined();
        }
      }).done(done);
    }, specIsRunningTooLong);


    it("should show mask if user enters the wrong password", function(done) {
      app.participantsList.docs.migm740610ea.fields.confidential = app.corpus.confidential;
      app.alwaysReplyToPrompt = "iforgotmypassword";
      FieldDBObject.application = app;
      app.enterDecryptedMode().then(function(response) {
        expect(response).toEqual("Shouldnt return positive");
        FieldDBObject.application = app;
        expect(app.decryptedMode).toEqual(false);
        expect(app.participantsList.docs.migm740610ea.lastname).toEqual("xxxxxxx");
      }, function() {
        FieldDBObject.application = app;
        expect(app.decryptedMode).toEqual(false);
        if (app.participantsList.docs.migm740610ea.fieldDBtype === "Participant") {
          expect(app.participantsList.docs.migm740610ea.lastname).toEqual("xxxxxxx");
        }
      }).done(done);
    }, specIsRunningTooLong);


    it("should show mask if the wrong key is being used to decrypt", function(done) {
      app.corpus.confidential = {
        secretkey: "tryinganotherkey"
      };
      app.participantsList.docs.migm740610ea.fields.confidential = app.corpus.confidential;
      app.alwaysReplyToPrompt = "phoneme";
      FieldDBObject.application = app;
      app.enterDecryptedMode().then(function() {
        FieldDBObject.application = app;
        expect(app.decryptedMode).toEqual(true);
        if (app.participantsList.docs.migm740610ea.fieldDBtype === "Participant") {
          expect(app.participantsList.docs.migm740610ea.lastname).toEqual("xxxxxxx");
          expect(app.decryptedMode).toEqual(false);
        }
      }).done(done);
    }, specIsRunningTooLong);


  });
});


// Testing to see where the app is running, if it is installed on android,
// installed in chrome or if it is a web widget.
describe("App: as a developer I want to deploy to multiple targets", function() {

  afterEach(function() {
    if (FieldDBObject.application) {
      // console.log("Cleaning up.");
      FieldDBObject.application = null;
    }
  });

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