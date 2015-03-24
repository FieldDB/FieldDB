var FieldDBObject = require("../api/FieldDBObject").FieldDBObject;
var specIsRunningTooLong = 5000;

describe("FieldDBObject", function() {

  describe("construction", function() {

    it("should accept a json object", function() {
      var u = new FieldDBObject();
      u.aproperty = "hasavalue";
      expect(u.aproperty).toEqual("hasavalue");

      u = new FieldDBObject({
        aproperty: "adifferentvalue"
      });
      expect(u.aproperty).toEqual("adifferentvalue");
    });

    it("should accept a json object on extended classes", function() {

      var Child = function Child(options) {
        this.debug("In Child ", options);
        FieldDBObject.apply(this, arguments);
        this._fieldDBtype = "Child";
      };

      Child.prototype = Object.create(FieldDBObject.prototype, /** @lends Child.prototype */ {
        constructor: {
          value: Child
        }
      });

      // var u = new Child();
      // u.aproperty = "hasavalue";
      // expect(u.aproperty).toEqual("hasavalue");

      var u2 = new Child({
        aproperty: "adifferentvalue"
      });
      expect(u2.aproperty).toEqual("adifferentvalue");
      expect(u2.fieldDBtype).toEqual("Child");

    });

    it("should add dateCreated if it was missing", function() {
      var u = new FieldDBObject();
      expect(u.dateCreated).toBeDefined();
    });

    it("should pass a reference to the application if it was specified", function() {
      delete FieldDBObject.application;
      var applicationLess = new FieldDBObject();
      expect(applicationLess.application).toBeUndefined();

      FieldDBObject.application = new FieldDBObject({
        context: "Offline",
        fieldDBtype: "PsycholinguisticsApp"
      });
      var u = new FieldDBObject();
      expect(u.application).toBeDefined();
      expect(u.application.context).toEqual("Offline");
      expect(applicationLess.application).toBe(u.application);

      var t = new FieldDBObject();
      expect(u.application).toBe(t.application);

      FieldDBObject.application = new FieldDBObject({
        context: "Online",
        fieldDBtype: "PsycholinguisticsApp"
      });
      expect(u.application.context).toEqual("Online");
      expect(u.application).toBe(t.application);

      expect(u.toJSON().application).toBeUndefined();
    });

  });

  describe("serialization", function() {
    var penguin;
    var body = [{
      wings: "flightless"
    }, {
      feet: "good-for-walking"
    }];

    beforeEach(function() {
      penguin = new FieldDBObject({
        body: body,
        _id: "firstPenguin",
        _rev: "2-123"
      });
    });

    it("should not loose attributes that were in the original JSON", function() {
      var resultingJSON = penguin.toJSON();
      expect(resultingJSON.body).toBe(body);
      expect(resultingJSON._id).toEqual("firstPenguin");
      expect(resultingJSON._rev).toEqual("2-123");
    });


    it("should not introduce attributes that weren't in the original JSON", function() {
      var resultingJSON = penguin.toJSON();
      expect(resultingJSON).toEqual({
        body: [{
          wings: "flightless"
        }, {
          feet: "good-for-walking"
        }],
        _id: "firstPenguin",
        _rev: "2-123",
        version: FieldDBObject.DEFAULT_VERSION,
        fieldDBtype: "FieldDBObject"
      });

      var accessingAttributeShouldNotCauseItToExist = penguin.dbname;
      expect(accessingAttributeShouldNotCauseItToExist).toEqual(FieldDBObject.DEFAULT_STRING);

      accessingAttributeShouldNotCauseItToExist = penguin.dateModified;
      expect(accessingAttributeShouldNotCauseItToExist).toEqual(FieldDBObject.DEFAULT_DATE);

      expect(penguin.toJSON()).toEqual(resultingJSON);
    });


    it("should be possible to request a smaller object with empty attributes removed if caller requests", function() {
      var resultingJSON = new FieldDBObject({
        body: [],
        _id: "firstPenguin",
        _rev: ""
      }).toJSON(null, "removeEmptyAttributes");

      expect(resultingJSON).toEqual({
        _id: "firstPenguin",
        version: FieldDBObject.DEFAULT_VERSION,
        fieldDBtype: "FieldDBObject"
      });
    });

    it("should be possible to request a complete object if caller requests", function() {
      var resultingJSON = new FieldDBObject({
        dateCreated: 1,
        _id: "123"
      }).toJSON("complete");
      expect(resultingJSON).toEqual({
        fieldDBtype: "FieldDBObject",
        dateCreated: 1,
        _id: "123",
        version: FieldDBObject.DEFAULT_VERSION,
        dbname: "",
        dateModified: 0,
        comments: []
      });
    });

    it("should not clone id and rev", function() {
      expect(penguin.rev).toEqual("2-123");
      var babypenguin = penguin.clone();
      expect(penguin.rev).toEqual("2-123");
      expect(babypenguin.rev).toBeUndefined();
    });

    it("should clone objects deeply", function() {
      expect(penguin.body).toBe(body);
      var babypenguin = penguin.clone();

      expect(babypenguin.body).not.toBe(body);
      expect(babypenguin.body).toEqual(body);

      penguin.body.beak = "yellow";
      expect(penguin.body.beak).toEqual("yellow");
      expect(babypenguin.body.beak).toBeUndefined();
    });


    it("should clone objects recursively", function() {
      var datumTypeThing = new FieldDBObject({
        _id: "82u398jaeoiajwo3a",
        _rev: "8-ojqa3ja0eios09k3aw",
        utterance: "noqata tusunaywanmi",
        translation: "I feel like dancing",
        sessionTypeThing: new FieldDBObject({
          _id: "9a0j0ejoi32jo",
          _rev: "29-903jaoijoiw3ajow",
          page: "34",
          publisher: "MITWPL",
          speakerTypeThing: new FieldDBObject({
            _id: "yuioiuni98y932",
            _rev: "3-i3orj0jw203j",
            fields: []
          })
        })
      });

      var clonedParentForMinimalPairs = datumTypeThing.clone();
      expect(clonedParentForMinimalPairs).toEqual({
        fieldDBtype: "FieldDBObject",
        utterance: "noqata tusunaywanmi",
        translation: "I feel like dancing",
        sessionTypeThing: {
          fieldDBtype: "FieldDBObject",
          page: "34",
          publisher: "MITWPL",
          speakerTypeThing: {
            fieldDBtype: "FieldDBObject",
            fields: [],
            version: "v2.47.20",
            relatedData: [{
              URI: "yuioiuni98y932?rev=3-i3orj0jw203j",
              relation: "clonedFrom"
            }]
          },
          version: "v2.47.20",
          relatedData: [{
            URI: "9a0j0ejoi32jo?rev=29-903jaoijoiw3ajow",
            relation: "clonedFrom"
          }]
        },
        version: "v2.47.20",
        relatedData: [{
          URI: "82u398jaeoiajwo3a?rev=8-ojqa3ja0eios09k3aw",
          relation: "clonedFrom"
        }]
      });

    });

    it("should not effect clone if original object is changed", function() {
      var babypenguin = penguin.clone();
      penguin.body.beak = "yellow";

      expect(penguin.body.beak).toEqual("yellow");
      expect(babypenguin.body.beak).toBeUndefined();
    });

    it("should add a new linked data to the original", function() {
      var babypenguin = penguin.clone();

      expect(babypenguin.relatedData).toEqual([{
        URI: "firstPenguin?rev=2-123",
        relation: "clonedFrom"
      }]);
    });

  });

  describe("persisance", function() {
    it("should be able to return a promise for an item from the database", function(done) {
      var object = new FieldDBObject({
        dbname: "lingallama-communitycorpus",
        id: "D093j2ae-akmoi3m-2a3wkjen"
      });

      object.fetch().then(function() {
        expect(false).toBeTruthy();
      }, function(error) {
        expect(error.userFriendlyErrors).toEqual(["CORS not supported, your browser is unable to contact the database."]);
      }).done(done);
    }, specIsRunningTooLong);

    it("should be able to set the revision number and other housekeeping after a save of a new item", function(done) {
      var object = new FieldDBObject({
        dbname: "lingallama-communitycorpus",
        something: "else",
        // debugMode: true
      });

      object.save().then(function(resultingdocument) {
        expect(false).toBeTruthy();
        expect(resultingdocument.id).toBeDefined();
        expect(resultingdocument.rev).toBeDefined();
      }, function(error) {
        expect(error.userFriendlyErrors).toEqual(["CORS not supported, your browser is unable to contact the database."]);
      }).done(done);

      expect(object.enteredByUser.value).toEqual("unknown");
      expect(object.enteredByUser.json.user).toEqual({
        name: "",
        username: "unknown"
      });
      expect(object.enteredByUser.json.software.appVersion).toEqual("PhantomJS unknown");
      console.log("hardware", object.enteredByUser.json.hardware);
      expect(object.enteredByUser.json.hardware.cpus).toBeGreaterThan(1);

    }, specIsRunningTooLong);

    it("should be able to set the revision number and other housekeeping after a save of an existing item", function(done) {
      var object = new FieldDBObject({
        dbname: "lingallama-communitycorpus",
        something: "else",
        _rev: "2-ioewmraoimwa",
        _id: "weomaoi23o",
        modifiedByUser: {
          "label": "modifiedByUser",
          "value": "inuktitutcleaningbot",
          "mask": "inuktitutcleaningbot",
          "encrypted": "",
          "shouldBeEncrypted": "",
          "help": "An array of users who modified the datum",
          "showToUserTypes": "all",
          "readonly": true,
          "users": [{
            "gravatar": "968b8e7fb72b5ffe2915256c28a9414c",
            "username": "inuktitutcleaningbot",
            "collection": "users",
            "firstname": "Cleaner",
            "lastname": "Bot"
          }],
          "userchooseable": "disabled"
        },
        // debugMode: true
      });
      expect(object.modifiedByUser.users).toBeDefined();

      object.save().then(function(resultingdocument) {
        expect(false).toBeTruthy();
        expect(resultingdocument.id).toBeDefined();
        expect(resultingdocument.rev).toBeDefined();
      }, function(error) {
        expect(error.userFriendlyErrors).toEqual(["CORS not supported, your browser is unable to contact the database."]);
      }).done(done);

      expect(object.modifiedByUser.value).toEqual("inuktitutcleaningbot, unknown");
      expect(object.modifiedByUser.users).toBeUndefined();
      expect(object.modifiedByUser.json.users[0].username).toEqual("inuktitutcleaningbot");
      expect(object.modifiedByUser.json.users[1].username).toEqual("unknown");
      expect(object.modifiedByUser.json.users[1].software.appVersion).toEqual("PhantomJS unknown");
      // console.log("hardware", object.modifiedByUser.json.hardware);
      expect(object.modifiedByUser.json.users[1].hardware.cpus).toBeGreaterThan(1);

    }, specIsRunningTooLong);

    it("should be able set entered by user using database connection info", function(done) {
      FieldDBObject.application = {
        corpus: {
          connectionInfo: {
            "ok": true,
            "userCtx": {
              "name": "teammatetiger",
              "roles": ["computationalfieldworkshop-group_data_entry_tutorial_reader", "fielddbuser", "jessepollak-spring_2013_field_methods_reader", "lingllama-cherokee_admin", "lingllama-cherokee_commenter", "lingllama-cherokee_reader", "lingllama-cherokee_writer", "lingllama-communitycorpus_admin", "lingllama-firstcorpus_admin", "lingllama-firstcorpus_commenter", "lingllama-firstcorpus_reader", "lingllama-firstcorpus_writer", "lingllama-test_corpus_admin", "lingllama-test_corpus_commenter", "lingllama-test_corpus_reader", "lingllama-test_corpus_writer", "teammatetiger-firstcorpus_commenter", "teammatetiger-firstcorpus_reader", "teammatetiger-firstcorpus_writer", "lingllama-communitycorpus_commenter", "lingllama-communitycorpus_reader", "lingllama-communitycorpus_writer"]
            },
            "info": {
              "authentication_db": "_users",
              "authentication_handlers": ["oauth", "cookie", "default"],
              "authenticated": "cookie"
            }
          }
        }
      };
      var object = new FieldDBObject({
        dbname: "lingallama-communitycorpus",
        something: "else"
      });

      object.save().then(function(resultingdocument) {
        expect(false).toBeTruthy();
        expect(resultingdocument.id).toBeDefined();
        expect(resultingdocument.rev).toBeDefined();
      }, function(error) {
        expect(error.userFriendlyErrors).toEqual(["CORS not supported, your browser is unable to contact the database."]);
      }).done(done);

      expect(object.enteredByUser.value).toEqual("teammatetiger");

    }, specIsRunningTooLong);


    it("should be able set location of the data", function(done) {
      FieldDBObject.software = {
        location: {
          "speed": null,
          "heading": null,
          "altitudeAccuracy": null,
          "accuracy": 57,
          "altitude": null,
          "longitude": -73.5537868,
          "latitude": 45.5169767
        }
      };
      var object = new FieldDBObject({
        dbname: "lingallama-communitycorpus",
        something: "else",
        location: {
          "id": "location",
          "type": "location",
          "labelFieldLinguists": "Location",
          "labelNonLinguists": "Location",
          "labelTranslators": "Location",
          "shouldBeEncrypted": true,
          "encrypted": true,
          "defaultfield": true,
          "value": "41,21",
          "json": {
            "location": {
              "latitude": 21,
              "longitude": 41,
              "accuracy": 20
            }
          },
          "help": "This is the GPS location of where the document exists/was created (if available)",
          "helpLinguists": "This is the GPS location of where the document exists/was created (if available)"
        }
      });
      expect(object.location.value).toEqual("41,21");

      object.save().then(function(resultingdocument) {
        expect(false).toBeTruthy();
        expect(resultingdocument.id).toBeDefined();
        expect(resultingdocument.rev).toBeDefined();
      }, function(error) {
        expect(error.userFriendlyErrors).toEqual(["CORS not supported, your browser is unable to contact the database."]);
      }).done(done);

      expect(object.location.value).toEqual("45.5169767,-73.5537868");
      expect(object.location.json.previousLocations).toEqual([{
        "latitude": 21,
        "longitude": 41,
        "accuracy": 20
      }]);
      expect(object.location.json.location.latitude).toEqual(45.5169767);

    }, specIsRunningTooLong);

    it("should flag an item as deleted", function(done) {
      var object = new FieldDBObject({
        dbname: "lingallama-communitycorpus",
        something: "else"
      });
      object.delete("I entered this by mistake").then(function(resultingdocument) {
        expect(false).toBeTruthy();
        expect(resultingdocument.id).toBeDefined();
        expect(resultingdocument.rev).toBeDefined();
      }, function(error) {
        expect(error.userFriendlyErrors).toEqual(["CORS not supported, your browser is unable to contact the database."]);
      }).done(done);

      expect(object.trashed).toEqual("deleted");
      expect(object.trashedReason).toEqual("I entered this by mistake");

    }, specIsRunningTooLong);

    it("should be able to put items in the trash", function(done) {
      var object = new FieldDBObject({
        dbname: "lingallama-communitycorpus",
        something: "else"
      });
      object.trash("I entered this by mistake").then(function(resultingdocument) {
        expect(false).toBeTruthy();
        expect(resultingdocument.id).toBeDefined();
        expect(resultingdocument.rev).toBeDefined();
      }, function(error) {
        expect(error.userFriendlyErrors).toEqual(["CORS not supported, your browser is unable to contact the database."]);
      }).done(done);

      expect(object.trashed).toEqual("deleted");
      expect(object.trashedReason).toEqual("I entered this by mistake");

    }, specIsRunningTooLong);

    it("should undelete items", function(done) {
      var object = new FieldDBObject({
        dbname: "lingallama-communitycorpus",
        something: "else",
        trashed: "deleted",
        trashedReason: "I imported this by mistake"
      });
      object.undelete("I deleted this by mistake").then(function(resultingdocument) {
        expect(false).toBeTruthy();
        expect(resultingdocument.id).toBeDefined();
        expect(resultingdocument.rev).toBeDefined();
      }, function(error) {
        expect(error.userFriendlyErrors).toEqual(["CORS not supported, your browser is unable to contact the database."]);
      }).done(done);

      expect(object.trashed).toEqual("restored");
      expect(object.trashedReason).toEqual("I imported this by mistake");
      expect(object.untrashedReason).toEqual("I deleted this by mistake");

    }, specIsRunningTooLong);

  });

  describe("render", function() {
    it("should not error if it has no render function", function() {
      var app = new FieldDBObject();
      expect(app.render).toBeDefined();
      app.debug(app.render);
      app.render();
      expect(app.warnMessage).toContain("but the render was not injected for this");
    });

    it("should accept a render function from the containing app or framework", function() {
      var app = new FieldDBObject();
      var oldRender = FieldDBObject.render;
      FieldDBObject.render = function() {
        this.debug("I rendered.");
      };
      expect(app.render).toBeDefined();
      app.render();
      expect(app.warnMessage).toBeUndefined();
      FieldDBObject.render = oldRender;
    });

    xit("should accept a render function for each object", function() {
      var app = new FieldDBObject();
      app.render = function() {
        this.warn("I rendered.");
      };
      app.render();
      expect(app.warnMessage).toEqual("I rendered");
    });
  });

  describe("debugging", function() {
    it("should be able to debug one object if we want", function() {
      var buggy = new FieldDBObject();
      buggy.debugMode = true;
      expect(buggy.debugMode).toEqual(true);
      buggy.debug("This is some debug output", buggy, FieldDBObject);
      buggy.debugMode = false;
      console.log("It should say \" Done debugMode testing\" after this: ");
      buggy.debug("THERE WAS SOME OUTPUT", buggy, FieldDBObject);
      if (buggy.debugMode) {
        buggy.debugMode = true;
        buggy.debug("THIS IS SOME HEAVY STRINGIFICATION OUPUT THAT IS AVOIDED", JSON.stringify(buggy), JSON.stringify(FieldDBObject));
      }
      console.log(" Done debugMode testing");

      buggy.warn("This will print a warning", buggy);
      buggy.bug("This will print an warning in Nodejs");
      buggy.todo("This will print a todo", buggy);
      expect(buggy.toJSON().warnMessage).toBeUndefined();
      expect(buggy.toJSON().bugMesssage).toBeUndefined();
      expect(buggy.toJSON().todoMessage).toBeUndefined();
    });

    it("should not bug about the same message if it has already been bugged and not cleared", function() {
      var buggy = new FieldDBObject();
      expect(buggy.bugMessage).toBeUndefined();
      buggy.bug("This is a problem, please report this.");
      expect(buggy.bugMessage).toEqual("This is a problem, please report this.");
      buggy.bug("This is a problem, please report this.");
      expect(buggy.bugMessage).toEqual("This is a problem, please report this.");
      expect(buggy.warnMessage).toContain("Not repeating bug message: This is a problem, please report this");
    });

    it("should be possible for client apps to override the bug function", function() {
      FieldDBObject.bug = function(message) {
        this.debug(this.mystuff + " will render this bug message in a user friendly modal or in a error message " + message);
        this.showBugMessage = message;
        this.render();
      };
      var buggy = new FieldDBObject({
        mystuff: "this is me"
      });
      buggy.bug("oopps somethign is wrong, please report this.");
      expect(buggy.showBugMessage).toEqual("oopps somethign is wrong, please report this.");
    });
  });

  describe("confirming", function() {
    it("should be able to show a confirm UI and wait asyncronously false case", function(done) {

      var riskyObject = new FieldDBObject();
      riskyObject.alwaysConfirmOkay = true;
      expect(riskyObject.alwaysConfirmOkay).toBeTruthy();
      riskyObject.alwaysConfirmOkay = false;
      expect(riskyObject.alwaysConfirmOkay).toBeFalsy();

      riskyObject.confirm("Do you want to do this, are you really sure?").then(function(results) {
        expect(results.message).toEqual(" ");
        expect(riskyObject.confirmMessage).toEqual("Do you want to do this, are you really sure?");
        expect(results.response).toEqual(false);
        expect(true).toBeFalsy();
      }, function(results) {
        expect(results.message).toEqual("Do you want to do this, are you really sure?");
        expect(results.response).toEqual(false);
        expect(riskyObject.confirmMessage).toEqual("Do you want to do this, are you really sure?");
        expect(false).toBeFalsy();
      }).done(done);

    }, specIsRunningTooLong);

    it("should be able to show a confirm UI and wait asyncronously true case", function(done) {

      var lessRiskyObject = new FieldDBObject();
      lessRiskyObject.alwaysConfirmOkay = true;
      expect(lessRiskyObject.alwaysConfirmOkay).toBeTruthy();
      lessRiskyObject.confirm("Do you want to do this?").then(function(results) {
        expect(lessRiskyObject.confirmMessage).toEqual("Do you want to do this?");
        expect(results.response).toEqual(true);
        expect(true).toBeTruthy();
      }, function(results) {
        expect(lessRiskyObject.confirmMessage).toEqual("Do you want to do this?");
        expect(results.response).toEqual(true);
        expect(false).toBeTruthy();
      }).done(done);
      expect(lessRiskyObject.confirmMessage).toEqual("Do you want to do this?");

    }, specIsRunningTooLong);
  });


  describe("merging", function() {
    var aBaseObject;
    var atriviallyDifferentObject;

    beforeEach(function() {
      aBaseObject = new FieldDBObject({
        externalString: "easy model",
        externalEqualString: "merging",
        externalArray: ["four", "two"],
        externalObject: new FieldDBObject({
          internalString: "internal",
          internalTrue: true,
          internalEmptyString: "",
          internalBoolean: true,
          internalNumber: 1,
          missingInTarget: "i'm a old property",
          // debugMode: true
        }),
        // debugMode: true
      });
      expect(aBaseObject.fieldDBtype).toEqual("FieldDBObject");

      atriviallyDifferentObject = new FieldDBObject({
        externalString: "trivial model",
        externalEqualString: "merging",
        externalArray: ["one", "two", "three"],
        externalObject: new FieldDBObject({
          internalString: "internal overwrite",
          internalTrue: true,
          internalEmptyString: "",
          internalBoolean: false,
          internalNumber: 2,
          missingInOriginal: "i'm a new property",
          // debugMode: true
        }),
        // debugMode: true
      });
    });

    it("should be able to merge one object into another without affecting the second object", function() {
      expect(atriviallyDifferentObject.fieldDBtype).toEqual("FieldDBObject");
      expect(aBaseObject.externalString).toEqual("easy model");

      var resultObject = aBaseObject.merge("self", atriviallyDifferentObject, "overwrite");
      expect(resultObject).toBe(aBaseObject);
      expect(aBaseObject.externalString).toEqual("trivial model");
      expect(aBaseObject.externalEqualString).toEqual("merging");
      expect(aBaseObject.externalArray).toEqual(["four", "two", "one", "three"]);
      expect(aBaseObject.warnMessage).toContain("Overwriting contents of externalString (this may cause disconnection in listeners)");

      expect(aBaseObject.externalObject.internalString).toEqual("internal overwrite");
      expect(aBaseObject.externalObject.internalTrue).toEqual(true);
      expect(aBaseObject.externalObject.internalEmptyString).toEqual("");
      expect(aBaseObject.externalObject.internalBoolean).toEqual(false);
      expect(aBaseObject.externalObject.internalNumber).toEqual(2);
      expect(aBaseObject.externalObject.missingInTarget).toEqual("i'm a old property");
      expect(aBaseObject.externalObject.missingInOriginal).toEqual("i'm a new property");
      expect(aBaseObject.externalObject.warnMessage).toContain("Overwriting contents of internalString (this may cause disconnection in listeners)");

      // Make sure atriviallyDifferentObject is as it was
      expect(atriviallyDifferentObject).not.toEqual(aBaseObject);
      expect(atriviallyDifferentObject.externalString).toEqual("trivial model");
      expect(atriviallyDifferentObject.externalEqualString).toEqual("merging");
      expect(atriviallyDifferentObject.externalArray).toEqual(["one", "two", "three"]);
      expect(atriviallyDifferentObject.warnMessage).toBeUndefined();

      expect(atriviallyDifferentObject.externalObject.internalString).toEqual("internal overwrite");
      expect(atriviallyDifferentObject.externalObject.internalTrue).toEqual(true);
      expect(atriviallyDifferentObject.externalObject.internalEmptyString).toEqual("");
      expect(atriviallyDifferentObject.externalObject.internalBoolean).toEqual(false);
      expect(atriviallyDifferentObject.externalObject.internalNumber).toEqual(2);
      expect(atriviallyDifferentObject.externalObject.missingInTarget).toBeUndefined("i'm a old property");
      expect(atriviallyDifferentObject.externalObject.missingInOriginal).toEqual("i'm a new property");
      expect(atriviallyDifferentObject.externalObject.warnMessage).toBeUndefined();

    });

    it("should be able to merge two objects into a third", function() {
      expect(atriviallyDifferentObject.fieldDBtype).toEqual("FieldDBObject");
      expect(aBaseObject.externalString).toEqual("easy model");

      var aThirdObject = new FieldDBObject();
      aThirdObject.merge(aBaseObject, atriviallyDifferentObject, "overwrite");
      expect(aThirdObject).not.toBe(aBaseObject);
      expect(aThirdObject.externalString).toEqual("trivial model");
      expect(aThirdObject.externalEqualString).toEqual("merging");
      expect(aThirdObject.externalArray).toEqual(["four", "two", "one", "three"]);
      expect(aThirdObject.warnMessage).toContain("Overwriting contents of externalString (this may cause disconnection in listeners)");

      expect(aThirdObject.externalObject.internalString).toEqual("internal overwrite");
      expect(aThirdObject.externalObject.internalTrue).toEqual(true);
      expect(aThirdObject.externalObject.internalEmptyString).toEqual("");
      expect(aThirdObject.externalObject.internalBoolean).toEqual(false);
      expect(aThirdObject.externalObject.internalNumber).toEqual(2);
      expect(aThirdObject.externalObject.missingInTarget).toEqual("i'm a old property");
      expect(aThirdObject.externalObject.missingInOriginal).toEqual("i'm a new property");
      expect(aThirdObject.externalObject.warnMessage).toContain("Overwriting contents of internalString (this may cause disconnection in listeners)");

      // Make sure aBaseObject is as it was
      expect(aBaseObject.externalString).toEqual("easy model");
      expect(aBaseObject.externalEqualString).toEqual("merging");
      expect(aBaseObject.externalArray).toEqual(["four", "two"]);
      expect(aBaseObject.warnMessage).toBeUndefined();

      expect(aBaseObject.externalObject.internalString).toEqual("internal");
      expect(aBaseObject.externalObject.internalTrue).toEqual(true);
      expect(aBaseObject.externalObject.internalEmptyString).toEqual("");
      expect(aBaseObject.externalObject.internalBoolean).toEqual(true);
      expect(aBaseObject.externalObject.internalNumber).toEqual(1);
      expect(aBaseObject.externalObject.missingInTarget).toEqual("i'm a old property");
      expect(aBaseObject.externalObject.missingInOriginal).toBeUndefined();
      expect(aBaseObject.externalObject.warnMessage).toBeUndefined();


      // Make sure atriviallyDifferentObject is as it was
      expect(atriviallyDifferentObject).not.toBe(aBaseObject);
      expect(atriviallyDifferentObject.externalString).toEqual("trivial model");
      expect(atriviallyDifferentObject.externalEqualString).toEqual("merging");
      expect(atriviallyDifferentObject.externalArray).toEqual(["one", "two", "three"]);
      expect(atriviallyDifferentObject.warnMessage).toBeUndefined();

      expect(atriviallyDifferentObject.externalObject.internalString).toEqual("internal overwrite");
      expect(atriviallyDifferentObject.externalObject.internalTrue).toEqual(true);
      expect(atriviallyDifferentObject.externalObject.internalEmptyString).toEqual("");
      expect(atriviallyDifferentObject.externalObject.internalBoolean).toEqual(false);
      expect(atriviallyDifferentObject.externalObject.internalNumber).toEqual(2);
      expect(atriviallyDifferentObject.externalObject.missingInTarget).toBeUndefined("i'm a old property");
      expect(atriviallyDifferentObject.externalObject.missingInOriginal).toEqual("i'm a new property");
      expect(atriviallyDifferentObject.externalObject.warnMessage).toBeUndefined();
    });

    it("should be able to ask the user asynchronously what to do if overwrite is not specified false case", function(done) {
      aBaseObject.merge("self", atriviallyDifferentObject);

      setTimeout(function() {
        expect(aBaseObject.externalString).toEqual("easy model");
        expect(aBaseObject.externalObject.internalString).toEqual("internal");

        expect(atriviallyDifferentObject.externalString).toEqual("trivial model");
        expect(atriviallyDifferentObject.externalObject.internalString).toEqual("internal overwrite");
        done();
      }, 10);
      expect(aBaseObject.confirmMessage).toContain("I found a conflict for externalString, Do you want to overwrite it from \"easy model\" -> \"trivial model\"");
      expect(aBaseObject.externalObject.confirmMessage).toContain("I found a conflict for internalString, Do you want to overwrite it from \"internal\" -> \"internal overwrite\"");
    });


    it("should be able to ask the user asynchronously what to do if overwrite is not specified  true case", function(done) {
      aBaseObject.alwaysConfirmOkay = true;
      aBaseObject.externalObject.alwaysConfirmOkay = true;
      aBaseObject.merge("self", atriviallyDifferentObject);

      setTimeout(function() {
        expect(aBaseObject.externalString).toEqual("trivial model");
        expect(aBaseObject.externalObject.internalString).toEqual("internal overwrite");

        expect(atriviallyDifferentObject.externalString).toEqual("trivial model");
        expect(atriviallyDifferentObject.externalObject.internalString).toEqual("internal overwrite");
        done();
      }, 10);

      expect(aBaseObject.confirmMessage).toContain("I found a conflict for externalString, Do you want to overwrite it from \"easy model\" -> \"trivial model\"");
      expect(aBaseObject.externalObject.confirmMessage).toContain("I found a conflict for internalString, Do you want to overwrite it from \"internal\" -> \"internal overwrite\"");
    });

    it("should reject to merge items with different ids", function() {
      var aBaseObjectWithDifferentId = new FieldDBObject({
        externalString: "old string",
        externalObject: new FieldDBObject({
          _id: "aw1we24",
          internalString: "some object",
        }),
        // debugMode: true
      });
      expect(aBaseObjectWithDifferentId.fieldDBtype).toEqual("FieldDBObject");

      var atriviallyDifferentObjectWithADifferentInternalObject = new FieldDBObject({
        externalString: "new string",
        externalObject: new FieldDBObject({
          _id: "ye12waer8",
          internalString: "a different object",
          // debugMode: true
        }),
        // debugMode: true
      });
      expect(atriviallyDifferentObjectWithADifferentInternalObject.fieldDBtype).toEqual("FieldDBObject");
      expect(aBaseObjectWithDifferentId.externalString).toEqual("old string");

      var resultObject = aBaseObjectWithDifferentId.merge("self", atriviallyDifferentObjectWithADifferentInternalObject, "overwrite");
      expect(resultObject.externalString).toEqual("new string");

      expect(resultObject.externalObject._id).toEqual("aw1we24");
      expect(resultObject.externalObject.internalString).toEqual("some object");
      expect(resultObject.externalObject.warnMessage).toEqual("Refusing to merge these objects, they have different ids: aw1we24  and ye12waer8");

    });

    it("should be merge larger objects into smaller ones", function(done) {
      var subsetObject = new FieldDBObject({
        _id: "13132",
        // debugMode: true
      });
      var supersetObject = new FieldDBObject({
        _id: "13132",
        _rev: "3-3242",
        lastname: "ioeaea",
        firstname: "ioriqamoesdf",
        // debugMode: true
      });
      subsetObject.merge("self", supersetObject);

      setTimeout(function() {
        expect(subsetObject._id).toEqual("13132");
        expect(subsetObject.lastname).toEqual("ioeaea");
        expect(subsetObject.firstname).toEqual("ioriqamoesdf");
        done();
      }, 10);
    });



    it("should be merge arrays correctly", function(done) {
      var subsetObject = new FieldDBObject({
        _id: "13132",
        // debugMode: true
      });
      var supersetObject = new FieldDBObject({
        _id: "13132",
        _rev: "3-3242",
        lastname: "ioeaea",
        firstname: "ioriqamoesdf",
        internalArray: [{
          x: 200,
          y: 200,
          score: 1
        }, {
          x: 300,
          y: 300,
          score: 0.4
        }],
        internalNumber: 4,
        internalDate: new Date(10),
        // debugMode: true
      });
      subsetObject.merge("self", supersetObject);

      setTimeout(function() {
        expect(subsetObject._id).toEqual("13132");
        expect(subsetObject.lastname).toEqual("ioeaea");
        expect(subsetObject.firstname).toEqual("ioriqamoesdf");

        expect(subsetObject.internalArray[0]).toBeDefined();
        expect(subsetObject.internalArray[0]).toEqual({
          x: 200,
          y: 200,
          score: 1
        });
        expect(subsetObject.internalArray.length).toEqual(2);

        expect(subsetObject.internalArray).toEqual(supersetObject.internalArray);
        expect(subsetObject.internalNumber).toEqual(supersetObject.internalNumber);
        expect(subsetObject.internalDate).toEqual(supersetObject.internalDate);

        expect(subsetObject.internalArray[0].x).toEqual(200);
        expect(subsetObject.internalNumber).toEqual(4);
        expect(subsetObject.internalDate).toEqual(new Date(10));
        done();
      }, 10);
    });


  });

  describe("equality", function() {
    it("should calculate equality", function() {
      var item1 = new FieldDBObject({
        // debugMode: true,
        id: "123",
        internalObject: new FieldDBObject({
          // debugMode: true,
          some: "thing",
          inside: false
        })
      });
      var item2 = new FieldDBObject({
        // debugMode: true,
        id: "123",
        internalObject: new FieldDBObject({
          // debugMode: true,
          some: "thing",
          inside: false
        })
      });
      expect(item1.equals).toBeDefined();
      expect(item1.internalObject.equals(item2.internalObject)).toBe(true);
      expect(item1.equals(item2)).toBe(true);

      delete item2.internalObject.inside;
      expect(item1.internalObject.equals(item2.internalObject)).toBe(false);
      expect(item1.equals(item2)).toBe(false);

      item2.internalObject.inside = false;
      expect(item1.internalObject.equals(item2.internalObject)).toBe(true);
      expect(item1.equals(item2)).toBe(true);

      delete item1.internalObject.inside;
      expect(item1.internalObject.equals(item2.internalObject)).toBe(false);
      expect(item1.equals(item2)).toBe(false);

    });
  });
});
