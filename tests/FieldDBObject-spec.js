"use strict";
/* globals localStorage, FieldDB*/
var FieldDBObject;
var Q;
try {
  if (FieldDB) {
    FieldDBObject = FieldDB.FieldDBObject;
    Q = FieldDB.Q;
  }
} catch (e) {}
FieldDBObject = FieldDBObject || require("./../api/FieldDBObject").FieldDBObject;
Q = Q || require("q");

var specIsRunningTooLong = 5000;
var mockDatabase = require("./corpus/DatabaseMock").mockDatabase;

describe("FieldDBObject", function() {

  afterEach(function() {
    if (FieldDBObject.application) {
      // console.log("Cleaning up.");
      FieldDBObject.application = null;
    }
    mockDatabase = {
      get: mockDatabase.get,
      set: mockDatabase.set,
      fetchRevisions: mockDatabase.fetchRevisions
    };
    try {
      localStorage.clear();
    } catch (e) {}
  });

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

  describe("deserialization", function() {

    it("should be able to guess its type", function() {
      var mysteryObject = {
        _id: "2389jr9rj490",
        collection: "somethingnotinthesystem"
      };
      mysteryObject = FieldDBObject.convertDocIntoItsType(mysteryObject);
      expect(mysteryObject.fieldDBtype).toEqual("FieldDBObject");
    });

    it("should be mark the previous type if it cant guess its type", function() {
      var wasACommentButFieldDBIsUndefinedInNPMRequireContexts = {
        "text": "How to do something",
        "username": "lingllama",
        "timestamp": "2012-09-26T14:42:05.349Z",
        "gravatar": "weoaeoriaew"
      };
      wasACommentButFieldDBIsUndefinedInNPMRequireContexts = FieldDBObject.convertDocIntoItsType(wasACommentButFieldDBIsUndefinedInNPMRequireContexts);
      if (wasACommentButFieldDBIsUndefinedInNPMRequireContexts.previousFieldDBtype) {
        expect(wasACommentButFieldDBIsUndefinedInNPMRequireContexts).toEqual({
          // _fieldDBtype: "FieldDBObject",
          text: "How to do something",
          username: "lingllama",
          _timestamp: 1348670525349,
          gravatar: "weoaeoriaew",
          previousFieldDBtype: "Comment",
          _dateCreated: wasACommentButFieldDBIsUndefinedInNPMRequireContexts.timestamp
        });
      } else {
        expect(wasACommentButFieldDBIsUndefinedInNPMRequireContexts.fieldDBtype).toEqual("Comment");
        expect(wasACommentButFieldDBIsUndefinedInNPMRequireContexts.previousFieldDBtype).toBeUndefined();
      }
    });

    it("should be use the previous type when guessing type", function() {
      var hadAPreviousType = {
        "text": "How to do something",
        "username": "lingllama",
        "timestamp": "2012-09-26T14:42:05.349Z",
        "gravatar": "weoaeoriaew",
        "previousFieldDBtype": "SomeSpecializedCommentYouCantGuess"
      };
      hadAPreviousType = FieldDBObject.convertDocIntoItsType(hadAPreviousType);
      expect(hadAPreviousType.fieldDBtype).toEqual("FieldDBObject");
      expect(hadAPreviousType.previousFieldDBtype).toEqual("SomeSpecializedCommentYouCantGuess");
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
      expect(resultingJSON.id).toBeUndefined();
      expect(resultingJSON._rev).toEqual("2-123");
      expect(resultingJSON.rev).toBeUndefined();
    });

    it("should not add an id if there was none", function() {
      var resultingJSON = new FieldDBObject({
        some: "attrib"
      }).toJSON();
      expect(resultingJSON.some).toEqual("attrib");

      expect(resultingJSON._id).toBeUndefined();
      expect(resultingJSON.id).toBeUndefined();
      expect(resultingJSON._rev).toBeUndefined();
      expect(resultingJSON.rev).toBeUndefined();
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
  });

  describe("cloning and minimal pairs", function() {
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
            version: datumTypeThing.version,
            relatedData: [{
              URI: "yuioiuni98y932?rev=3-i3orj0jw203j",
              relation: "clonedFrom"
            }]
          },
          version: datumTypeThing.version,
          relatedData: [{
            URI: "9a0j0ejoi32jo?rev=29-903jaoijoiw3ajow",
            relation: "clonedFrom"
          }]
        },
        version: datumTypeThing.version,
        relatedData: [{
          URI: "82u398jaeoiajwo3a?rev=8-ojqa3ja0eios09k3aw",
          relation: "clonedFrom"
        }]
      });

    });

    it("should not effect clone if original object is changed", function() {
      var adatum = new FieldDBObject({
        "tags": "apositive",
        fields: [new FieldDBObject({
          id: "judgement",
          value: "#"
        }), new FieldDBObject({
          id: "utterance",
          value: "noqata tusunayawanmi"
        })]
      });
      var aminimalPair = adatum.clone();

      aminimalPair.fields[1].value = "noqata tusunayami";
      aminimalPair.fields[0].value = "*";

      expect(adatum.fields[0].value).toEqual("#");
      expect(aminimalPair.fields[0].value).toEqual("*");

      adatum.fields[1].value = "noqata tusunayawaanmi";

      expect(adatum.fields[1].value).toEqual("noqata tusunayawaanmi");
      expect(aminimalPair.fields[1].value).toEqual("noqata tusunayami");
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

    it("should be able to return a promise for an item from the database", function(done) {
      var object = new FieldDBObject({
        dbname: "lingallama-communitycorpus",
        id: "D093j2ae-akmoi3m-2a3wkjen",
        corpus: {
          get: mockDatabase.get,
          set: mockDatabase.set
        }
      });

      expect(object.fetching).toEqual(undefined);
      expect(object.loading).toEqual(undefined);

      object.fetch().then(function(resultingdocument) {
        expect(resultingdocument).toEqual(object);

        expect(object.warnMessage).toContain("calling merge with overwrite from server");
        expect(object.fetching).toEqual(false);
        expect(object.loading).toEqual(false);

        expect(object.title).toEqual("Community corpus");
        // return object;
      }, function(error) {
        object.debug(error);
        expect(false).toBeTruthy();
        // return object;
      }).done(done);

      expect(object.fetching).toEqual(true);
      expect(object.loading).toEqual(true);


    }, specIsRunningTooLong);


    it("should refuse to save an item which belongs in another database", function(done) {
      var object = new FieldDBObject({
        dbname: "lingallama-communitycorpus",
      });

      // add a mock database
      object._corpus = {
        get: mockDatabase.get,
        set: mockDatabase.set
      };
      object._corpus.dbname = "jenkins-doesntmatchdb";
      expect(object._corpus).toBeDefined();
      expect(object.corpus.set).toBeDefined();

      object.fossil = {};
      object.save().then(function() {
        expect(false).toBeTruthy();
      }, function(error) {
        expect(error.userFriendlyErrors).toEqual(["This item belongs in the lingallama-communitycorpusdatabase, not in the jenkins-doesntmatchdb database."]);
      }).done(done);
    }, specIsRunningTooLong);


    it("should refuse to fetch an item which has no id", function(done) {
      // FieldDBObject.application = null;
      var object = new FieldDBObject({
        dbname: "lingallama-communitycorpus",
      });

      object.fetch().then(function() {
        expect(false).toBeTruthy();
      }, function(error) {
        expect(error.userFriendlyErrors).toEqual(["This application has errored. Please notify its developers: Cannot fetch data which has no id, or the if database is not currently opened."]);
      }).done(done);
    }, specIsRunningTooLong);

    it("should refuse to fetch if no database can be deduced", function(done) {
      FieldDBObject.application = null;
      var object = new FieldDBObject({
        dbname: "lingallama-communitycorpus",
        id: "D093j2ae-akmoi3m-2a3wkjen",
        corpus: {}
      });

      object.fetch().then(function() {
        expect(false).toBeTruthy();
      }, function(error) {
        expect(error.userFriendlyErrors).toEqual(["This application has errored. Please notify its developers: Cannot fetch data which has no id, or the if database is not currently opened."]);
      }).done(done);
    }, specIsRunningTooLong);

    it("should add the user who saved and other housekeeping before a save of a new item", function() {
      var object = new FieldDBObject({
        dbname: "lingallama-communitycorpus",
        something: "else",
        // debugMode: true
      });

      var snapshot = object.createSaveSnapshot();
      expect(snapshot.fieldDBtype).toEqual("FieldDBObject");
      expect((snapshot.dateCreated + "").length).toEqual(13);
      expect(snapshot.version).toEqual(object.version);
      expect(snapshot.enteredByUser).toBeDefined();
      expect(snapshot.enteredByUser.value).toEqual("unknown");
      expect(snapshot.enteredByUser.json).toBeDefined();
      expect(snapshot.enteredByUser.json.user).toEqual({
        username: "unknown",
        name: "",
        lastname: undefined,
        firstname: undefined,
        gravatar: undefined
      });
      expect(snapshot.enteredByUser.json.software).toBeDefined();
      expect(snapshot.enteredByUser.json.hardware).toBeDefined();

      // {
      //   value: 'unknown',
      //   json: {
      //     user: {
      //       username: 'unknown',
      //       name: "",
      //       lastname: undefined,
      //       firstname: undefined,
      //       gravatar: undefined
      //     },
      //     software: {
      //       version: 'v0.10.29',
      //       appVersion: 'PhantomJS unknown'
      //     },
      //     hardware: {
      //       endianness: 'LE',
      //       platform: 'darwin',
      //       hostname: 'nariakira.local',
      //       type: 'Darwin',
      //       arch: 'x64',
      //       release: '13.4.0',
      //       totalmem: 8589934592,
      //       cpus: 8
      //     }
      //   }
      // }


      expect(snapshot.enteredByUser.value).toEqual("unknown");
      expect(snapshot.enteredByUser.json.user.name).toEqual("");
      expect(snapshot.enteredByUser.json.user.username).toEqual("unknown");
      console.log("hardware", snapshot.enteredByUser.json.hardware);
      if (snapshot.enteredByUser.json.software.appVersion === "PhantomJS unknown") {
        expect(snapshot.enteredByUser.json.software.appVersion).toEqual("PhantomJS unknown");
        expect(snapshot.enteredByUser.json.hardware.cpus).toBeGreaterThan(1);
      } else {
        expect(snapshot.enteredByUser.json.software.appVersion).toBeDefined();
        expect(snapshot.enteredByUser.json.software.appVersion).toContain("Safari");
        expect(snapshot.enteredByUser.json.hardware.cpus).toBeUndefined();
      }


      expect(object.fieldDBtype).toEqual("FieldDBObject");
      expect((object.dateCreated + "").length).toEqual(13);
      expect(object.version).toEqual(object.version);
      expect(object.enteredByUser).toBeDefined();
      expect(object.enteredByUser.value).toEqual("unknown");
      expect(object.enteredByUser.json).toBeDefined();
      expect(object.enteredByUser.json.user).toEqual({
        username: "unknown",
        name: "",
        lastname: undefined,
        firstname: undefined,
        gravatar: undefined
      });
      expect(object.enteredByUser.json.software).toBeDefined();
      expect(object.enteredByUser.json.hardware).toBeDefined();

    });

    it("should add the user who saved and other housekeeping before a save of an existing item", function() {
      var originalObject = {
        dbname: "lingallama-communitycorpus",
        something: "else",
        _id: "67gwes98rdjo",
        _rev: "8-aeifnaoao"
          // debugMode: true
      };

      var object = new FieldDBObject(originalObject);

      var snapshot = object.createSaveSnapshot();
      expect(snapshot.fieldDBtype).toEqual("FieldDBObject");
      expect(snapshot.dateCreated).toEqual(originalObject.dateCreated);

      expect(snapshot.version).toEqual(object.version);
      expect(snapshot.enteredByUser).toEqual(originalObject.enteredByUser);
      expect(snapshot.modifiedByUser).toBeDefined();
      expect(snapshot.modifiedByUser).toBeDefined();
      expect(snapshot.modifiedByUser.value).toEqual("unknown");
      expect(snapshot.modifiedByUser.json).toBeDefined();
      expect(snapshot.modifiedByUser.json.users).toBeDefined();
      expect(snapshot.modifiedByUser.json.users[0]).toBeDefined();
      expect(snapshot.modifiedByUser.json.users[0].username).toEqual("unknown");
      expect(snapshot.modifiedByUser.json.users[0].software).toBeDefined();
      expect(snapshot.modifiedByUser.json.users[0].hardware).toBeDefined();
      // {
      //   users: [{
      //     username: 'unknown',
      //     name: "",
      //     lastname: undefined,
      //     firstname: undefined,
      //     gravatar: undefined,
      //     software: {
      //       version: 'v0.10.29',
      //       appVersion: 'PhantomJS unknown'
      //     },
      //     hardware: {
      //       endianness: 'LE',
      //       platform: 'darwin',
      //       hostname: 'nariakira.local',
      //       type: 'Darwin',
      //       arch: 'x64',
      //       release: '13.4.0',
      //       totalmem: 8589934592,
      //       cpus: 8
      //     }
      //   }]
      // }

      expect(object.fieldDBtype).toEqual("FieldDBObject");

      expect(object.modifiedByUser).toBeDefined();
      expect(object.modifiedByUser).toBeDefined();
      expect(object.modifiedByUser.value).toEqual("unknown");
      expect(object.modifiedByUser.json).toBeDefined();
      expect(object.modifiedByUser.json.users).toBeDefined();
      expect(object.modifiedByUser.json.users[0]).toBeDefined();
      expect(object.modifiedByUser.json.users[0].username).toEqual("unknown");
      expect(object.modifiedByUser.json.users[0].software).toBeDefined();
      expect(object.modifiedByUser.json.users[0].hardware).toBeDefined();

    });

    it("should be able to set the revision number and other housekeeping after a save of a new item", function(done) {
      var object = new FieldDBObject({
        dbname: "lingallama-communitycorpus",
        something: "else",
        corpus: {
          get: mockDatabase.get,
          set: mockDatabase.set,
          dbname: "lingallama-communitycorpus"
        }
        // debugMode: true
      });

      object.fossil = object.toJSON();
      object.something = "must change something in order to do a true save.";

      object.save().then(function(resultingdocument) {
        expect(resultingdocument).toBe(object);

        expect(object.id).toBeDefined();
        expect(object.rev).toBeDefined();
        expect(object.unsaved).toEqual(false);
        expect(object.fossil).toBeDefined();

      }, function(error) {
        object.debug(error);
        expect(true).toBeFalsy();
      }).done(done);

    }, specIsRunningTooLong);

    it("should be able to set the revision number and other housekeeping after a save of an existing item", function(done) {
      var object = new FieldDBObject({
        corpus: {
          get: mockDatabase.get,
          set: mockDatabase.set,
          dbname: "lingallama-communitycorpus"
        },
        dbname: "lingallama-communitycorpus",
        something: "else",
        _rev: "5-ioewmraoimwa",
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

      object.fossil = object.toJSON();
      object.something = "causing a real save";

      object.save().then(function(resultingdocument) {
        expect(resultingdocument).toBe(object);

        expect(object.id).toBeDefined();
        expect(object.rev).toBeDefined();
        expect(object.unsaved).toEqual(false);
        expect(object.fossil).toBeDefined();
        expect(object.modifiedByUser.value).toEqual("inuktitutcleaningbot, unknown");
        expect(object.modifiedByUser.users).toBeUndefined();
        expect(object.modifiedByUser.json.users[0].username).toEqual("inuktitutcleaningbot");
        expect(object.modifiedByUser.json.users[1].username).toEqual("unknown");
        expect(object.modifiedByUser.json.users[1].software.appVersion.length).toBeGreaterThan(10);
        // console.log("hardware", object.modifiedByUser.json.hardware);
        expect(object.modifiedByUser.json.users[1].hardware).toBeDefined();


      }, function(error) {
        expect(error).toEqual(["CORS not supported, your browser is unable to contact the database."]);
      }).done(done);

      expect(object.saving).toEqual(true);

      expect(object.modifiedByUser.value).toEqual("inuktitutcleaningbot, unknown");
      expect(object.modifiedByUser.users).toBeUndefined();
      expect(object.modifiedByUser.json.users[0].username).toEqual("inuktitutcleaningbot");
      expect(object.modifiedByUser.json.users[1].username).toEqual("unknown");
      expect(object.modifiedByUser.json.users[1].software.appVersion.length).toBeGreaterThan(10);
      // console.log("hardware", object.modifiedByUser.json.hardware);
      expect(object.modifiedByUser.json.users[1].hardware).toBeDefined();

    }, specIsRunningTooLong);


    it("should avoid unnecesary saving", function(done) {
      var object = new FieldDBObject({
        id: "2839aj983aja",
        corpus: {
          get: mockDatabase.get,
          set: mockDatabase.set
        }
      });

      expect(object.fossil).toBeUndefined();
      expect(object.unsaved).toEqual(undefined);
      expect(object.calculateUnsaved()).toEqual(undefined);

      object.fetch().then(function(result) {

        // fetch is working
        expect(result).toBe(object);
        expect(object.id).toEqual("2839aj983aja");
        expect(object.rev).toBeDefined();
        expect(object.modifiedByUser.equals({
          _fieldDBtype: "FieldDBObject",
          label: "modifiedByUser",
          value: "inuktitutcleaningbot",
          mask: "inuktitutcleaningbot",
          encrypted: "",
          shouldBeEncrypted: "",
          help: "An array of users who modified the datum",
          showToUserTypes: "all",
          readonly: true,
          users: [{
            gravatar: "968b8e7fb72b5ffe2915256c28a9414c",
            username: "inuktitutcleaningbot",
            collection: "users",
            firstname: "Cleaner",
            lastname: "Bot"
          }],
          userchooseable: "disabled",
          _dateCreated: object.modifiedByUser.dateCreated,
          _version: object.version
        })).toBeTruthy();

        // this was a placeholder because it had no rev, so we should now have a fossil
        expect(object.fossil).toBeDefined();
        expect(object.unsaved).toEqual(false);
        expect(object.calculateUnsaved()).toEqual(false);

        object.warnMessage = "";
        var oldRev = object.rev + "";
        object.save().then(function(result) {
          expect(result).toBe(object);
          expect(object.warnMessage).toContain("Item hasn't really changed, no need to save...");
          expect(object.rev).toEqual(oldRev);
          return object;
        }, function(error) {
          object.debug(error);
          expect(false).toBeTruthy();
          return object;
        });

      }).done(done);

    }, specIsRunningTooLong);


    it("should detect if item was actually changed", function(done) {
      var object = new FieldDBObject({
        corpus: {
          get: mockDatabase.get,
          set: mockDatabase.set,
          dbname: "jenkins-firstcorpus"
        },
        dbname: "jenkins-firstcorpus",
        something: "else",
        _rev: "2-28q9ja9q0ka",
        _id: "weomaoi23o",
        modifiedByUser: {
          "label": "modifiedByUser",
          "value": "quotecleaningbot",
          "mask": "quotecleaningbot",
          "encrypted": "",
          "shouldBeEncrypted": "",
          "help": "An array of users who modified the datum",
          "showToUserTypes": "all",
          "readonly": true,
          "users": [{
            "gravatar": "968b8e7fb72b5ffe2915256c28a9414c",
            "username": "quotecleaningbot",
            "collection": "users",
            "firstname": "Cleaner",
            "lastname": "Bot"
          }],
          "userchooseable": "disabled"
        },
        // debugMode: true
      });

      // When we load an object, we dont know where it comes from we wont set the fossil, since it might not match any database version
      expect(object.fossil).toBeUndefined();
      // It will have an undefined (falsy) status which means to most UIs that it should be saved before they leave the page.
      expect(object.calculateUnsaved()).toEqual(undefined);

      var oldRev = object.rev;
      expect(oldRev).toEqual("2-28q9ja9q0ka");
      object.save().then(function(result) {
        expect(result).toEqual(object);

        // It really saved
        expect(object.rev.length).toBeGreaterThan(13);
        expect(oldRev).not.toEqual(object.rev);

        // It now has an updated fossil
        expect(object.fossil).toBeDefined();
        expect(object.fossil.rev).not.toEqual(oldRev);
        expect(object.unsaved).toEqual(false);
        expect(object.calculateUnsaved()).toEqual(false);

        // Make modifications and it should detect them
        object.fields = [{
          value: "something new"
        }];
        expect(object.unsaved).toEqual(false);
        expect(object.calculateUnsaved()).toEqual(true);
        expect(object.unsaved).toEqual(true);

      }, function(error) {
        object.debug(error);
        expect(true).toBeFalsy();
        return object;
      }).done(done);

    }, specIsRunningTooLong);


    it("should be able set entered by user using database connection info", function(done) {
      var object = new FieldDBObject({
        dbname: "lingallama-communitycorpus",
        something: "else",
        corpus: {
          get: mockDatabase.get,
          set: mockDatabase.set,
          dbname: "lingallama-communitycorpus"
        }
      });
      object.corpus.connectionInfo = {
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
      };
      expect(object.corpus.connectionInfo.userCtx.name).toEqual("teammatetiger");

      object.fossil = object.toJSON();
      object.something = "modified after fossil was created";

      object.save().then(function(resultingdocument) {
        expect(resultingdocument).toEqual(object);
        expect(object.rev.length).toBeGreaterThan(13);

        expect(object.enteredByUser).toBeDefined();
        expect(object.enteredByUser.value).toEqual("teammatetiger");
      }, function(error) {
        object.debug(error);
        expect(true).toBeFalsy();
        return object;
      }).done(done);

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
        corpus: {
          get: mockDatabase.get,
          set: mockDatabase.set,
          dbname: "lingallama-communitycorpus"
        },
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
      object.fossil = object.toJSON();

      object.something = "i changed this after the fossil was created";

      object.save().then(function(resultingdocument) {
        expect(resultingdocument).toEqual(object);
        expect(object.rev.length).toBeGreaterThan(13);

      }, function(error) {
        expect(error).toEqual(["CORS not supported, your browser is unable to contact the database."]);
      }).done(done);

      expect(object.location.value).toEqual("45.5169767,-73.5537868");
      expect(object.location.json.previousLocations).toEqual([{
        "latitude": 21,
        "longitude": 41,
        "accuracy": 20
      }]);
      expect(object.location.json.location.latitude).toEqual(45.5169767);

    }, specIsRunningTooLong);

    var putInTrash = function(done) {
      var object = new FieldDBObject({
        dbname: "lingallama-communitycorpus",
        something: "else",
        corpus: {
          get: mockDatabase.get,
          set: mockDatabase.set,
          dbname: "lingallama-communitycorpus"
        }
      });

      object.delete("I entered this by mistake").then(function(resultingdocument) {
        expect(resultingdocument).toEqual(object);
        expect(object.rev.length).toBeGreaterThan(13);

      }, function(error) {
        expect(error).toEqual(["CORS not supported, your browser is unable to contact the database."]);
      }).done(done);

      expect(object.trashed).toEqual("deleted");
      expect(object.trashedReason).toEqual("I entered this by mistake");

    };
    it("should flag an item as deleted", putInTrash, specIsRunningTooLong);
    it("should be able to put items in the trash", putInTrash, specIsRunningTooLong);

    it("should undelete items", function(done) {
      var object = new FieldDBObject({
        dbname: "lingallama-communitycorpus",
        something: "else",
        trashed: "deleted",
        trashedReason: "I imported this by mistake",
        corpus: {
          get: mockDatabase.get,
          set: mockDatabase.set,
          dbname: "lingallama-communitycorpus"
        }
      });
      object.undelete("I deleted this by mistake").then(function(resultingdocument) {
        expect(resultingdocument).toEqual(object);
        expect(object.rev.length).toBeGreaterThan(13);
      }, function(error) {
        expect(error).toEqual(["CORS not supported, your browser is unable to contact the database."]);
      }).done(done);

      expect(object.trashed).toEqual("restored");
      expect(object.trashedReason).toEqual("I imported this by mistake");
      expect(object.untrashedReason).toEqual("I deleted this by mistake");

    }, specIsRunningTooLong);

    describe("undo", function() {

      it("should not get previous revisions if it hasnt been saved.", function(done) {
        var object = new FieldDBObject({
          dbname: "lingallama-communitycorpus",
          corpus: {
            fetchRevisions: mockDatabase.fetchRevisions,
            url: "https://example.uni.edu/some/path/too/testinguser-firstcorpus"
          }
        });
        expect(object.corpus).toBeDefined();
        expect(object.corpus.fetchRevisions).toBeDefined();
        expect(typeof object.corpus.fetchRevisions).toEqual("function");
        object.fetchRevisions().then(function(revisions) {
          expect(revisions).toBeUndefined();
          expect(object._revisions).toBeUndefined();
        }, function(error) {
          expect(error).toEqual(["CORS not supported, your browser is unable to contact the database."]);
        }).done(done);

      }, specIsRunningTooLong);

      it("should return previous revisions if it has no id but it has revisions", function(done) {
        var object = new FieldDBObject({
          dbname: "lingallama-communitycorpus",
          some: "other document from anotehr server or from another app which has reviisions jsons but no id in this database.",
          _revisions: ["https://localhost:6984/lingallama-communitycorpus/1234490ej0a9ak3q?rev=\"4-23iwoai3jr\""],
          corpus: {
            fetchRevisions: mockDatabase.fetchRevisions
          }
        });
        object.fetchRevisions().then(function(revisions) {
          expect(revisions).toEqual(["https://localhost:6984/lingallama-communitycorpus/1234490ej0a9ak3q?rev=\"4-23iwoai3jr\""]);
          expect(object._revisions).toBeDefined();
        }, function(error) {
          expect(error).toEqual(["CORS not supported, your browser is unable to contact the database."]);
        }).done(done);

      }, specIsRunningTooLong);


      it("should get previous revisions if it has been saved.", function(done) {
        var object = new FieldDBObject({
          dbname: "lingallama-communitycorpus",
          _id: "1234490ej0a9ak3q",
          corpus: {
            fetchRevisions: mockDatabase.fetchRevisions,
            url: "https://example.uni.edu/some/path/too/testinguser-firstcorpus"
          }
        });
        expect(object.corpus).toBeDefined();
        expect(object.corpus.fetchRevisions).toBeDefined();
        expect(typeof object.corpus.fetchRevisions).toEqual("function");
        object.fetchRevisions().then(function(revisions) {
          expect(revisions).toEqual([
            "https://example.uni.edu/some/path/too/testinguser-firstcorpus/1234490ej0a9ak3q?rev=\"3-825cb35de44c433bfb2df415563a19de\"",
            "https://example.uni.edu/some/path/too/testinguser-firstcorpus/1234490ej0a9ak3q?rev=\"2-7051cbe5c8faecd085a3fa619e6e6337\"",
            "https://example.uni.edu/some/path/too/testinguser-firstcorpus/1234490ej0a9ak3q?rev=\"1-967a00dff5e02add41819138abb3284d\""
          ]);
          expect(object._revisions).toBeDefined();
          expect(object._revisions.length).toEqual(3);
        }, function(error) {
          expect(error).toEqual(["CORS not supported, your browser is unable to contact the database."]);
        }).done(done);

      }, specIsRunningTooLong);

    });

  });

  describe("render", function() {
    it("should not error if it has no render function", function() {
      var app = new FieldDBObject();
      expect(app.render).toBeDefined();
      app.debug(app.render);
      app.render();
      expect(app.warnMessage).toBeUndefined();
      // expect(app.warnMessage).toContain("but the render was not injected for this");
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

    it("should accept a render function for each object", function() {
      var app = new FieldDBObject();
      app.render = function() {
        this.warn("I rendered.");
      };
      app.render();
      expect(app.warnMessage).toEqual("I rendered.");
    });
  });

  describe("debugging", function() {
    it("should be able to debug one object if we want", function() {
      var buggy = new FieldDBObject();
      buggy.debugMode = true;
      expect(buggy.debugMode).toEqual(true);
      buggy.debug("This is some debug output", buggy);
      buggy.debugMode = false;
      console.log("It should say \" Done debugMode testing\" after this: ");
      buggy.debug("THERE WAS SOME OUTPUT", buggy);
      if (buggy.debugMode) {
        buggy.debugMode = true;
        buggy.debug("THIS IS SOME HEAVY STRINGIFICATION OUPUT THAT IS AVOIDED", JSON.stringify(buggy), JSON.stringify(FieldDBObject));
      }
      console.log(" Done debugMode testing");

      buggy.warn("This will print a warning with an object also", buggy);
      buggy.bug("This will print an warning in Nodejs\n And show an alert in a browser.");
      buggy.todo("This will print a todo", buggy);
      expect(buggy.toJSON().warnMessage).toBeUndefined();
      expect(buggy.bugMessage).toBeDefined();
      expect(buggy.bugMessage).toContain("And show an alert in a browser.");
      expect(buggy.toJSON().bugMessage).toBeUndefined();
      expect(buggy.toJSON().todoMessage).toBeUndefined();
    });

    it("should not bug about the same message if it has already been bugged and not cleared", function() {
      var buggy = new FieldDBObject();
      expect(buggy.bugMessage).toBeUndefined();
      buggy.bug("This is simulating a problem, please report this.");
      expect(buggy.bugMessage).toEqual("This is simulating a problem, please report this.");
      buggy.bug("This is simulating a problem, please report this.");
      expect(buggy.bugMessage).toEqual("This is simulating a problem, please report this.");
      expect(buggy.warnMessage).toContain("Not repeating bug message: This is simulating a problem, please report this");
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

    it("should be possible for client apps to override the debug function", function() {
      FieldDBObject.internalAttributesToAutoMerge.push("debugMessages");
      FieldDBObject.debug = function(message) {
        this.debugMessages = message;
      };

      var quietDebugging = new FieldDBObject({
        debugMode: true,
        mystuff: "this is me"
      });
      quietDebugging.debug("looking at value of mystuff: " + quietDebugging.mystuff);
      expect(quietDebugging.debugMessages).toEqual("looking at value of mystuff: this is me");
    });


    it("should be possible for client apps to override the todo function", function() {
      FieldDBObject.internalAttributesToAutoMerge.push("todoMessages");
      FieldDBObject.todo = function(message) {
        this.todoMessages = message;
      };
      var quietedTodos = new FieldDBObject({
        mystuff: "this is me"
      });
      quietedTodos.todo("should we override mystuff?");
      expect(quietedTodos.todoMessages).toEqual("should we override mystuff?");
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
        expect(results).toBeDefined();
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
        lessRiskyObject.debug("This confirm should never be rejected, ", results);
        expect(false).toBeTruthy();
      }).done(done);
      expect(lessRiskyObject.confirmMessage).toEqual("Do you want to do this?");

    }, specIsRunningTooLong);
  });

  describe("prompting", function() {
    it("should be able to show a prompt UI and wait asyncronously false case", function(done) {

      var objectToDelete = new FieldDBObject();
      objectToDelete.alwaysReplyToPrompt = "I created this item by mistake";
      expect(objectToDelete.alwaysReplyToPrompt).toBeTruthy();
      objectToDelete.alwaysReplyToPrompt = "";
      expect(objectToDelete.alwaysReplyToPrompt).toBeFalsy();

      objectToDelete.prompt("Why do you want to delete this item?").then(function(results) {
        expect(results).toBeDefined();
        expect(results.message).toEqual("Why do you want to delete this item?");
        expect(objectToDelete.promptMessage).toEqual("Why do you want to delete this item?");
        expect(results.response).toEqual(false);
        expect(true).toBeFalsy();
      }, function(results) {
        expect(results.message).toEqual("Why do you want to delete this item?");
        expect(results.response).toBeFalsy();
        expect(objectToDelete.promptMessage).toEqual("Why do you want to delete this item?");
      }).done(done);

    }, specIsRunningTooLong);

    it("should be able to show a prompt UI and wait asyncronously true case", function(done) {

      var objectWhichNeedsToConfirmUsersIdentity = new FieldDBObject();
      objectWhichNeedsToConfirmUsersIdentity.alwaysReplyToPrompt = "phoneme";
      expect(objectWhichNeedsToConfirmUsersIdentity.alwaysReplyToPrompt).toBeTruthy();
      objectWhichNeedsToConfirmUsersIdentity.prompt("We need to make sure its you. Please enter your password.").then(function(results) {
        expect(objectWhichNeedsToConfirmUsersIdentity.promptMessage).toEqual("We need to make sure its you. Please enter your password.");
        expect(results.response).toEqual("phoneme");
      }, function(results) {
        objectWhichNeedsToConfirmUsersIdentity.debug("This prompt should never be rejected, ", results);
        expect(false).toBeTruthy();
      }).done(done);
      expect(objectWhichNeedsToConfirmUsersIdentity.promptMessage).toEqual("We need to make sure its you. Please enter your password.");

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
      if (aBaseObject.warnMessage) {
        expect(aBaseObject.warnMessage).toEqual("This was already the right type, not converting it.");
      }

      expect(aBaseObject.externalObject.internalString).toEqual("internal");
      expect(aBaseObject.externalObject.internalTrue).toEqual(true);
      expect(aBaseObject.externalObject.internalEmptyString).toEqual("");
      expect(aBaseObject.externalObject.internalBoolean).toEqual(true);
      expect(aBaseObject.externalObject.internalNumber).toEqual(1);
      expect(aBaseObject.externalObject.missingInTarget).toEqual("i'm a old property");
      expect(aBaseObject.externalObject.missingInOriginal).toBeUndefined();
      if (aBaseObject.warnMessage) {
        expect(aBaseObject.externalObject.warnMessage).toEqual("This was already the right type, not converting it.");
      }
      // Make sure atriviallyDifferentObject is as it was
      expect(atriviallyDifferentObject).not.toBe(aBaseObject);
      expect(atriviallyDifferentObject.externalString).toEqual("trivial model");
      expect(atriviallyDifferentObject.externalEqualString).toEqual("merging");
      expect(atriviallyDifferentObject.externalArray).toEqual(["one", "two", "three"]);
      if (aBaseObject.warnMessage) {
        expect(atriviallyDifferentObject.warnMessage).toEqual("This was already the right type, not converting it.");
      }

      expect(atriviallyDifferentObject.externalObject.internalString).toEqual("internal overwrite");
      expect(atriviallyDifferentObject.externalObject.internalTrue).toEqual(true);
      expect(atriviallyDifferentObject.externalObject.internalEmptyString).toEqual("");
      expect(atriviallyDifferentObject.externalObject.internalBoolean).toEqual(false);
      expect(atriviallyDifferentObject.externalObject.internalNumber).toEqual(2);
      expect(atriviallyDifferentObject.externalObject.missingInTarget).toBeUndefined("i'm a old property");
      expect(atriviallyDifferentObject.externalObject.missingInOriginal).toEqual("i'm a new property");
      if (aBaseObject.warnMessage) {
        expect(atriviallyDifferentObject.externalObject.warnMessage).toEqual("This was already the right type, not converting it.");
      }
    });

    it("should be able to ask the user asynchronously what to do if overwrite is not specified false case", function(done) {
      aBaseObject.merge("self", atriviallyDifferentObject);

      Q.allSettled(aBaseObject.confirmMergePromises).then(function() {
        expect(aBaseObject.externalString).toEqual("easy model");
        expect(aBaseObject.externalObject.internalString).toEqual("internal");

        expect(atriviallyDifferentObject.externalString).toEqual("trivial model");
        expect(atriviallyDifferentObject.externalObject.internalString).toEqual("internal overwrite");
      }, function(reason){
        expect(reason).toEqual("");
      }).fail(function(reason){
        expect(reason).toEqual("");
      }).done(done);
      expect(aBaseObject.promptMessage).toContain("I found a conflict for externalString, Do you want to overwrite it from \"easy model\" -> trivial model");
      expect(aBaseObject.externalObject.promptMessage).toContain("I found a conflict for internalString, Do you want to overwrite it from \"internal\" -> internal overwrite");
    }, specIsRunningTooLong);


    it("should be able to ask the user asynchronously what to do if overwrite is not specified  true case", function(done) {
      aBaseObject.alwaysReplyToPrompt = true;
      aBaseObject.externalObject.alwaysReplyToPrompt = true;
      aBaseObject.merge("self", atriviallyDifferentObject);

      Q.allSettled(aBaseObject.confirmMergePromises).then(function() {
        expect(aBaseObject.externalString).toEqual("trivial model");
        expect(aBaseObject.externalObject.internalString).toEqual("internal overwrite");

        expect(atriviallyDifferentObject.externalString).toEqual("trivial model");
        expect(atriviallyDifferentObject.externalObject.internalString).toEqual("internal overwrite");
      }, function(reason){
        expect(reason).toEqual("");
      }).fail(function(reason){
        expect(reason).toEqual("");
      }).done(done);

      expect(aBaseObject.promptMessage).toContain("I found a conflict for externalString, Do you want to overwrite it from \"easy model\" -> trivial model");
      expect(aBaseObject.externalObject.promptMessage).toContain("I found a conflict for internalString, Do you want to overwrite it from \"internal\" -> internal overwrite");
    }, specIsRunningTooLong);

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
      // expect(item1).toEqual();
      // expect(item2).toEqual();
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
