"use strict";
var Datum;
var Session;
// var DataList;
var FieldDBObject;
try {
  /* globals FieldDB */
  if (FieldDB) {
    Datum = FieldDB.Datum;
    Session = FieldDB.Session;
    // DataList = FieldDB.DataList;
    FieldDBObject = FieldDB.FieldDBObject;
  }
} catch (e) {}

Datum = Datum || require("./../../api/datum/Datum").Datum;
Session = Session || require("./../../api/datum/Session").Session;
// DataList = DataList || require("./../../api/data_list/DataList").DataList;
FieldDBObject = FieldDBObject || require("./../../api/FieldDBObject").FieldDBObject;

var sample_1_22_datum = require("./../../sample_data/datum_v1.22.1.json");
var specIsRunningTooLong = 5000;

describe("Session: as a linguist I often collect data in an elicitation session", function() {

  beforeEach(function() {
    if (FieldDBObject.application) {
      // console.log("Cleaning up.");
      FieldDBObject.application = null;
    }

    // if (!DataList) {
    //   throw ("DataList has become undefined in this area.");
    // }
    // mockDatabase = {
    //   get: mockDatabase.get,
    //   set: mockDatabase.set,
    //   fetchCollection: mockDatabase.fetchCollection
    // };
  });

  describe("construction", function() {

    it("should load", function() {
      expect(Session).toBeDefined();

      var session = new Session();
      expect(session).toBeDefined();
    });

    it("should set the fields", function() {
      var session = new Session();

      session.fields = session.defaults.fields;
      expect(session.fields.length).toEqual(10);
      expect(session.fields.fieldDBtype).toEqual("DatumFields");
      expect(session.fields._collection.length).toEqual(10);

      expect(session.fields).toBeDefined();
      expect(session.fields.length).toEqual(10);
      expect(session.fields.fieldDBtype).toEqual("DatumFields");

      expect(session.fields.goal).toBeDefined();
      expect(session.goal).toBeDefined();
      expect(session.title).toBeDefined();

      expect(session.fields.source).toBeDefined();
      expect(session.fields.dialect).toBeDefined();
      expect(session.fields.register).toBeDefined();
      expect(session.fields.language).toBeDefined();
      expect(session.fields.location).toBeDefined();

      expect(session.fields.dateElicited).toBeDefined();
      expect(session.dateElicited).toBeDefined();
      expect(session.date).toBeDefined();

      expect(session.fields.participants).toBeDefined();
      expect(session.consultants).toBeDefined();
      expect(session.consultants.length).toEqual(0);
      session.consultants = [{
        username: "tilohash",
        anonymousCode: "TH",
        gravatar: "ouranonymousgravatar"
      }, {
        username: "maryjean",
        anonymousCode: "MJ",
        gravatar: "ouranonymousgravatar"
      }];
      expect(session.consultants).toBeDefined();
      expect(session.consultants.length).toEqual(2);
      expect(session.consultants[0].username).toEqual("maryjean");
      expect(session.consultants[1].username).toEqual("tilohash");
      expect(session.participants.length).toEqual(2);

      session.user = [{
        username: "lingllama",
        gravatar: "9104j3ewaijoi23"
      }];
      expect(session.user).toBeDefined();
      expect(session.user.username).toEqual("lingllama");

      session.user = "Teammate Tiger";
      expect(session.user.username).toEqual("Teammate Tiger");

      session.user = "lingllama, sally, suzie";
      expect(session.user.username).toEqual("suzie");


      session.consultants = "phylis, psaul, pieta";
      expect(session.consultants.map(function(usermask) {
        return usermask.username;
      })).toEqual(["pieta", "psaul", "phylis", "maryjean", "tilohash"]);


      expect(session.fields.datesessionentered).toBeDefined();
      expect(session.fields.device).toBeDefined();
    });

    it("should set the goal", function() {
      var session = new Session();
      expect(session.fields).toBeUndefined();
      session.goal = "Collecting examples of accusative experiencers";
      expect(session.fields.goal.value).toEqual("Collecting examples of accusative experiencers");
    });

    it("should have default fields", function() {
      var session = new Session();
      expect(session.defaults).toBeDefined();
      expect(session.defaults.fields).toBeDefined();
      expect(session.defaults.fields.length).toEqual(10);
    });
  });


  describe("provide syntactic sugar on the list of data in the session ", function() {
    var session;
    beforeEach(function() {
      session = new Session({
        // id: "sessionabc",
        docIds: ["thefirstdocinthissession"],
        // debugMode: true
      });
      // session.initializeDatalist();
    });

    it("should reply to requests for docs", function() {
      expect(session.datalist.docs).toBeDefined();
      // expect(session.datalist.docs).toEqual(" ");
      expect(session.datalist.docs.thefirstdocinthissession).toBeDefined();
      expect(session.datalist.docs.thefirstdocinthissession.id).toEqual("thefirstdocinthissession");

      // expect(session.datalist.docs).toEqual(" ");
      expect(session.docs.thefirstdocinthissession).toBeDefined();
      expect(session.docs.thefirstdocinthissession.id).toEqual("thefirstdocinthissession");
    });

    it("should reply to requests for data", function() {
      expect(session.datalist.docs).toBeDefined();
      expect(session.datalist.docs.thefirstdocinthissession.id).toEqual("thefirstdocinthissession");

      expect(session.data).toBeDefined();
      expect(session.data.thefirstdocinthissession.id).toEqual("thefirstdocinthissession");
    });

    it("should reply to requests for datum", function() {
      expect(session.datalist.docs).toBeDefined();
      expect(session.datalist.docs.thefirstdocinthissession.id).toEqual("thefirstdocinthissession");

      expect(session.datum).toBeDefined();
      expect(session.datum.thefirstdocinthissession.id).toEqual("thefirstdocinthissession");
    });

    describe("spreadsheet or database like apps", function() {
      it("should reply to requests for records", function() {
        expect(session.datalist.docs).toBeDefined();
        expect(session.datalist.docs.thefirstdocinthissession.id).toEqual("thefirstdocinthissession");

        expect(session.records).toBeDefined();
        expect(session.records.thefirstdocinthissession.id).toEqual("thefirstdocinthissession");
      });

      it("should reply to requests for items", function() {
        expect(session.datalist.docs).toBeDefined();
        expect(session.datalist.docs.thefirstdocinthissession.id).toEqual("thefirstdocinthissession");

        expect(session.items).toBeDefined();
        expect(session.items.thefirstdocinthissession.id).toEqual("thefirstdocinthissession");
      });

      it("should reply to requests for entries", function() {
        expect(session.datalist.docs).toBeDefined();
        expect(session.datalist.docs.thefirstdocinthissession.id).toEqual("thefirstdocinthissession");

        expect(session.entries).toBeDefined();
        expect(session.entries.thefirstdocinthissession.id).toEqual("thefirstdocinthissession");
      });
    });

    describe("elan or praat import", function() {
      it("should reply to requests for utterances", function() {
        expect(session.datalist.docs).toBeDefined();
        expect(session.datalist.docs.thefirstdocinthissession.id).toEqual("thefirstdocinthissession");

        expect(session.utterances).toBeDefined();
        expect(session.utterances.thefirstdocinthissession.id).toEqual("thefirstdocinthissession");
      });

      it("should reply to requests for transcriptions", function() {
        expect(session.datalist.docs).toBeDefined();
        expect(session.datalist.docs.thefirstdocinthissession.id).toEqual("thefirstdocinthissession");

        expect(session.transcriptions).toBeDefined();
        expect(session.transcriptions.thefirstdocinthissession.id).toEqual("thefirstdocinthissession");
      });
    });

    describe("published handouts/books import", function() {
      it("should reply to requests for examples", function() {
        expect(session.datalist.docs).toBeDefined();
        expect(session.datalist.docs.thefirstdocinthissession.id).toEqual("thefirstdocinthissession");

        expect(session.examples).toBeDefined();
        expect(session.examples.thefirstdocinthissession.id).toEqual("thefirstdocinthissession");
      });
    });

    describe("language learning lessons", function() {
      it("should reply to requests for cards", function() {
        expect(session).toBeDefined();
        expect(session.datalist.docs).toBeDefined();
        expect(session.datalist.docs.thefirstdocinthissession.id).toEqual("thefirstdocinthissession");

        expect(session.examples).toBeDefined();
        expect(session.examples.thefirstdocinthissession.id).toEqual("thefirstdocinthissession");
      });
    });

  });

  describe("DataList should not be overridden in the test suite.", function() {

    it("should have a datalist synchronously if the session has docIds or docs", function() {
      var session = new Session({
        docIds: ["adocatsessionconstruction"]
      });
      // session.initializeDatalist();
      expect(session).toBeDefined();

      expect(session.docs).toBeDefined();
      expect(session.docs.adocatsessionconstruction).toBeDefined();
      expect(session.docs.adocatsessionconstruction.id).toEqual("adocatsessionconstruction");
    });

  });

  describe("as a data list ", function() {

    it("should NOT have a datalist synchronously if the session has no docIds or docs", function() {
      var session = new Session({
        // docIds: ["adocatsessionconstruction"]
      });
      // session.initializeDatalist();
      expect(session).toBeDefined();

      expect(session.docs).toBeUndefined();
      expect(session.docIds).toBeUndefined();
      expect(session.datalist).toBeUndefined();
    });

    it("should be able to force a datalist if calls initializeDatalist", function() {
      var session = new Session({
        // docIds: ["adocatsessionconstruction"]
      });
      session.initializeDatalist();

      expect(session.docs).toBeDefined();
      expect(session.docs.length).toEqual(0);

      expect(session.docIds).toEqual([]);
      expect(session.docIds.length).toEqual(0);

      expect(session.datalist).toBeDefined();
      expect(session.datalist.length).toEqual(0);
    });

    it("should have docs if set via docIds durring construction", function() {
      var session = new Session({
        docIds: ["thefirstdocinthissession"]
      });

      expect(session.docs).toBeDefined();
      expect(session.docs.thefirstdocinthissession.id).toEqual("thefirstdocinthissession");
    });

    it("should not serialize docs, datalist or docIds", function() {
      var session = new Session({
        docIds: ["thefirstdocinthissession"]
      });
      expect(session).toBeDefined();

      expect(session.docs).toBeDefined();
      expect(session.docs.thefirstdocinthissession.id).toEqual("thefirstdocinthissession");

      var sessionJson = session.toJSON();
      expect(sessionJson.docs).toBeUndefined();
      expect(sessionJson.docIds).toBeUndefined();
      expect(sessionJson.datalist).toBeUndefined();
    });

    //TODO why accept datalist to be created from docis on the session? seems like we only need to add to a session.
    it("should have asychronously have docs if set via docIds after construction", function(done) {
      var session = new Session();
      session.docIds = ["thefirstdocinthissession"];

      expect(session.datalist).toBeDefined();
      expect(session.docs).toBeDefined();
      expect(session.whenReindexedFromApi).toBeDefined();

      session.whenReindexedFromApi.then(function(resultingdatalist) {
        expect(resultingdatalist).toBe(session.datalist);
      }, function(error) {
        // console.log(error);
        if (error.status === 500) {
          expect(error.userFriendlyErrors[0]).toEqual("Error saving a user in the database. ");
        } else if (error.status === 412) {
          expect(error.userFriendlyErrors[0]).toEqual("This datalist doesn't need to be re-indexed. 29834.");
        } else if (error.status === 404) {
          expect(error.userFriendlyErrors[0]).toContain(" Please report this 290323.");
        } else if (error.status === 400) {
          expect(error.userFriendlyErrors[0]).toEqual("CORS not supported, your browser is unable to contact the database.");
        } else if (error.status === 0) {
          expect(error.userFriendlyErrors[0]).toEqual("Unable to contact the server, are you sure you're not offline?");
        } else {
          expect(false).toBeTruthy();
        }
      }).fail(function(error) {
        console.log(error.stack);
        expect(false).toBeTruthy();
      }).done(function() {
        expect(session.docs.thefirstdocinthissession).toBeDefined();
        expect(session.docs.thefirstdocinthissession.id).toEqual("thefirstdocinthissession");
        done();
      });
    }, specIsRunningTooLong);

    //TODO why accept datalist to be created from docis on the session? seems like we only need to add to a session.
    it("should have docs if set via docs after construction", function(done) {
      var session = new Session();
      session.docs = [{
        id: "thefirstdocinthissession"
      }];

      expect(session.datalist).toBeDefined();
      expect(session.docs).toBeDefined();
      expect(session.whenReindexedFromApi).toBeDefined();

      session.whenReindexedFromApi.then(function(resultingdatalist) {
        expect(resultingdatalist).toBe(session.datalist);
      }, function(error) {
        // console.log(error);
        if (error.status === 500) {
          expect(error.userFriendlyErrors[0]).toEqual("Error saving a user in the database. ");
        } else if (error.status === 412) {
          expect(error.userFriendlyErrors[0]).toEqual("This datalist doesn't need to be re-indexed. 29834.");
        } else if (error.status === 404) {
          expect(error.userFriendlyErrors[0]).toContain(" Please report this 290323.");
        } else if (error.status === 400) {
          expect(error.userFriendlyErrors[0]).toEqual("CORS not supported, your browser is unable to contact the database.");
        } else if (error.status === 0) {
          expect(error.userFriendlyErrors[0]).toEqual("Unable to contact the server, are you sure you're not offline?");
        } else {
          expect(false).toBeTruthy();
        }
      }).fail(function(error) {
        console.log(error.stack);
        expect(false).toBeTruthy();
      }).done(function() {
        expect(session.docs.thefirstdocinthissession).toBeDefined();
        expect(session.docs.thefirstdocinthissession.id).toEqual("thefirstdocinthissession");
        done();
      });
    }, specIsRunningTooLong);

    it("should have docs, if docs are added after construction", function(done) {
      var session = new Session({
        // debugMode: true
      });
      session.add([{
        id: "thefirstdocinthissession"
      }]);

      expect(session.docs).toBeDefined();
      expect(session.docIds).toEqual([]);
      expect(session.datalist).toBeDefined();
      expect(session.datalist.title).toBeDefined();
      expect(session.datalist.title.default).toEqual("All data in ");

      expect(session.docs.thefirstdocinthissession).toBeUndefined();

      expect(session.whenReindexedFromApi).toBeDefined();
      session.whenReindexedFromApi.then(function(resultingdatalist) {
        expect(resultingdatalist).toBe(session.datalist);
      }, function(error) {
        // console.log(error);
        if (error.status === 500) {
          expect(error.userFriendlyErrors[0]).toEqual("Error saving a user in the database. ");
        } else if (error.status === 412) {
          expect(error.userFriendlyErrors[0]).toEqual("This datalist doesn't need to be re-indexed. 29834.");
        } else if (error.status === 404) {
          expect(error.userFriendlyErrors[0]).toContain(" Please report this 290323.");
        } else if (error.status === 400) {
          expect(error.userFriendlyErrors[0]).toEqual("CORS not supported, your browser is unable to contact the database.");
        } else if (error.status === 0) {
          expect(error.userFriendlyErrors[0]).toEqual("Unable to contact the server, are you sure you're not offline?");
        } else {
          expect(false).toBeTruthy();
        }
      }).fail(function(error) {
        console.log(error.stack);
        expect(false).toBeTruthy();
      }).done(function() {

        expect(session.docs.thefirstdocinthissession.id).toEqual("thefirstdocinthissession");
        done();
      });
    }, specIsRunningTooLong);


    it("should be able to set title and docIds on the datalist after construction", function() {
      var session = new Session({
        id: "asessionwhichisreal"
      });
      session.initializeDatalist();
      session.datalist.title = "List of data in this session";
      session.datalist.docIds = ["one1", "two", "three"];

      expect(session.datalist.docIds).toBeDefined();
      expect(session.datalist.docIds.length).toEqual(3);
      expect(session.datalist.docIds[0]).toEqual("one1");

      expect(session.docIds).toBeDefined();
      expect(session.docIds.length).toEqual(3);
      expect(session.docIds[0]).toEqual("one1");

      expect(session.datalist.docs).toBeDefined();
      expect(session.datalist.docs.length).toEqual(3);
      expect(session.datalist.docs._collection).toBeDefined();
      expect(session.datalist.docs._collection[0].id).toEqual("one1");
      if (session.datalist.docs._collection[0].fieldDBtype === "FieldDBObject") {
        expect(session.datalist.docs._collection[0].fieldDBtype).toEqual("FieldDBObject");
      } else {
        expect(session.datalist.docs._collection[0].fieldDBtype).toEqual("Datum");
      }

      expect(session.docs).toBeDefined();
      expect(session.docs.length).toEqual(3);
      expect(session.docs._collection[0].id).toEqual("one1");
    });

    it("should not support a datalist of datum ids upon creation", function() {
      var session = new Session({
        id: "asessionwhichisreal",
        datalist: {
          title: "List of data in this session",
          docIds: ["1", "two", "three"]
        }
      });

      expect(session.datalist).toBeUndefined();
      expect(session.docIds).toBeUndefined();
    });

    it("should support a add datum in the right order when data list exists", function(done) {
      var session = new Session({
        // debugMode: true,
        id: "asessionwhichisreal",
      });
      session.docIds = ["One", "two", "three"];

      expect(session.docIds).toEqual(["One", "two", "three"]);
      expect(session.datalist._docIds).toEqual(["One", "two", "three"]);
      // expect(session.datalist.docs).toEqual(" ");
      // expect(session.datalist.tempDocIds).toEqual(["One", "two", "three"]);

      var addedDatum = session.add({
        id: "adatumafterdatlistexists"
      });

      expect(addedDatum).toBeDefined();
      expect(addedDatum.id).toEqual("adatumafterdatlistexists");

      session.whenReindexedFromApi.then(function(resultingdatalist) {
        expect(resultingdatalist).toEqual(" ");
        expect(true).toBeFalsy();
      }, function(error) {
        // console.log(error);
        if (error.status === 500) {
          expect(error.userFriendlyErrors[0]).toEqual("Error saving a user in the database. ");
        } else if (error.status === 412) {
          expect(error.userFriendlyErrors[0]).toEqual("This application has errored. Please notify its developers: Cannot reindex this datalist if the corpus is not specified.");
        } else if (error.status === 404) {
          expect(error.userFriendlyErrors[0]).toContain(" Please report this 290323.");
        } else if (error.status === 400) {
          expect(error.userFriendlyErrors[0]).toEqual("CORS not supported, your browser is unable to contact the database.");
        } else if (error.status === 0) {
          expect(error.userFriendlyErrors[0]).toEqual("Unable to contact the server, are you sure you're not offline?");
        } else {
          expect(false).toBeTruthy();
        }
      }).fail(function(error) {
        console.log(error.stack);
        expect(false).toBeTruthy();
      }).done(function() {

        expect(session.datalist.docIds).toBeDefined();
        expect(session.datalist.docIds.length).toEqual(4);
        expect(session.datalist.docIds[0]).toEqual("One");
        expect(session.datalist.docIds[1]).toEqual("two");
        expect(session.datalist.docIds[2]).toEqual("three");
        expect(session.datalist.docIds[3]).toEqual("adatumafterdatlistexists");

        expect(session.docIds).toBeDefined();
        expect(session.docIds.length).toEqual(4);
        expect(session.docIds[0]).toEqual("One");
        expect(session.docIds[3]).toEqual("adatumafterdatlistexists");
        done();
      });

    }, specIsRunningTooLong);


    it("should support add a datum before the datalist exists", function(done) {
      var session = new Session({
        id: "asessionwhichisreal"
      });
      expect(session.docIds).toBeUndefined();

      session.add({
        id: "anothersimulidatum"
      });

      expect(session.whenReindexedFromApi).toBeDefined();
      session.whenReindexedFromApi.then(function(resultingdatalist) {
        expect(resultingdatalist).toEqual(" ");
        expect(true).toBeFalsy();
      }, function(error) {
        // console.log(error);
        if (error.status === 500) {
          expect(error.userFriendlyErrors[0]).toEqual("Error saving a user in the database. ");
        } else if (error.status === 412) {
          expect(error.userFriendlyErrors[0]).toEqual("This application has errored. Please notify its developers: Cannot reindex this datalist if the corpus is not specified.");
        } else if (error.status === 404) {
          expect(error.userFriendlyErrors[0]).toContain(" Please report this 290323.");
        } else if (error.status === 400) {
          expect(error.userFriendlyErrors[0]).toEqual("CORS not supported, your browser is unable to contact the database.");
        } else if (error.status === 0) {
          expect(error.userFriendlyErrors[0]).toEqual("Unable to contact the server, are you sure you're not offline?");
        } else {
          expect(false).toBeTruthy();
        }
      }).fail(function(error) {
        console.log(error.stack);
        expect(false).toBeTruthy();
      }).done(function() {

        expect(session.datalist.docIds).toBeDefined();
        expect(session.datalist.docIds.length).toEqual(1);
        expect(session.datalist.docIds[0]).toEqual("anothersimulidatum");

        expect(session.docIds).toBeDefined();
        expect(session.docIds.length).toEqual(1);
        expect(session.docIds[0]).toEqual("anothersimulidatum");
        done();
      });

    }, specIsRunningTooLong);


    it("should have doc order jumbled if multiple adds are called before the datalist exists", function(done) {
      var session = new Session({
        id: "asessionwhichisreal"
      });
      expect(session.docIds).toBeUndefined();

      session.add({
        id: "the first one"
      });
      expect(session.whenReindexedFromApi).toBeDefined();

      session.add({
        id: "will be"
      });

      session.add({
        id: "last"
      });

      session.add({
        id: "because the datalist wasnt ready"
      });

      session.whenReindexedFromApi.then(function(resultingdatalist) {
        expect(resultingdatalist).toEqual(" ");
        expect(true).toBeFalsy();
      }, function(error) {
        // console.log(error);
        if (error.status === 500) {
          expect(error.userFriendlyErrors[0]).toEqual("Error saving a user in the database. ");
        } else if (error.status === 412) {
          expect(error.userFriendlyErrors[0]).toEqual("This application has errored. Please notify its developers: Cannot reindex this datalist if the corpus is not specified.");
        } else if (error.status === 404) {
          expect(error.userFriendlyErrors[0]).toContain(" Please report this 290323.");
        } else if (error.status === 400) {
          expect(error.userFriendlyErrors[0]).toEqual("CORS not supported, your browser is unable to contact the database.");
        } else if (error.status === 0) {
          expect(error.userFriendlyErrors[0]).toEqual("Unable to contact the server, are you sure you're not offline?");
        } else {
          expect(false).toBeTruthy();
        }
      }).fail(function(error) {
        console.log(error.stack);
        expect(false).toBeTruthy();
      }).done(function() {

        expect(session.datalist.docIds).toBeDefined();
        expect(session.datalist.docIds.length).toEqual(4);
        expect(session.datalist.docIds[0]).toEqual("will be");
        expect(session.datalist.docIds[1]).toEqual("last");
        expect(session.datalist.docIds[2]).toEqual("because the datalist wasnt ready");
        expect(session.datalist.docIds[3]).toEqual("the first one");

        expect(session.docIds).toBeDefined();
        expect(session.docIds.length).toEqual(4);
        expect(session.docIds).toEqual(["will be", "last", "because the datalist wasnt ready", "the first one"]);
        done();
      });

    }, specIsRunningTooLong);

    it("should will have add events in the right order if client ensures datalist exists", function(done) {
      var session = new Session({
        id: "asessionwhichisreal"
      });
      session.initializeDatalist();

      session.add({
        id: "the first one"
      });
      expect(session.docIds).toEqual(["the first one"]);
      expect(session.whenReindexedFromApi).toBeDefined();

      session.add({
        id: "the second one"
      });

      session.add({
        id: "the last one"
      });

      session.whenReindexedFromApi.then(function(resultingdatalist) {
        expect(resultingdatalist).toEqual(" ");
        expect(true).toBeFalsy();
      }, function(error) {
        // console.log(error);
        if (error.status === 500) {
          expect(error.userFriendlyErrors[0]).toEqual("Error saving a user in the database. ");
        } else if (error.status === 412) {
          expect(error.userFriendlyErrors[0]).toEqual("This application has errored. Please notify its developers: Cannot reindex this datalist if the corpus is not specified.");
        } else if (error.status === 404) {
          expect(error.userFriendlyErrors[0]).toContain(" Please report this 290323.");
        } else if (error.status === 400) {
          expect(error.userFriendlyErrors[0]).toEqual("CORS not supported, your browser is unable to contact the database.");
        } else if (error.status === 0) {
          expect(error.userFriendlyErrors[0]).toEqual("Unable to contact the server, are you sure you're not offline?");
        } else {
          expect(false).toBeTruthy();
        }
      }).fail(function(error) {
        console.log(error.stack);
        expect(false).toBeTruthy();
      }).done(function() {

        expect(session.datalist.docIds).toBeDefined();
        expect(session.datalist.docIds.length).toEqual(3);
        expect(session.datalist.docIds[0]).toEqual("the first one");
        expect(session.datalist.docIds[1]).toEqual("the second one");
        expect(session.datalist.docIds[2]).toEqual("the last one");
        expect(session.datalist.docIds).toEqual(["the first one", "the second one", "the last one"]);

        expect(session.docIds).toBeDefined();
        expect(session.docIds.length).toEqual(3);
        done();
      });

    }, specIsRunningTooLong);


    it("should not serialize an ordered list of datum which are in the session", function() {
      var session = new Session({
        id: "asessionwhichisreal",
        docIds: ["thedocthatwasthereinthebeginning", "andaotherdocthatwasthereinthebeginning"]
      });

      session.add({
        id: "yetanother"
      });

      expect(session.docs).toBeDefined();
      expect(session.docIds).toBeDefined();
      expect(session.docs.length).toEqual(3);
      expect(session.docIds.length).toEqual(3);
      expect(session.docIds[0]).toEqual("thedocthatwasthereinthebeginning");
      expect(session.docIds[1]).toEqual("andaotherdocthatwasthereinthebeginning");
      expect(session.docIds[2]).toEqual("yetanother");

      var serialized = session.toJSON();
      expect(serialized.docIds).toBeUndefined();
      expect(serialized.docs).toBeUndefined();
      expect(serialized.datalist).toBeUndefined();

    });

  });


  describe("serialization", function() {

    it("should serialize v1.22 sessions", function() {
      var session = new Session(JSON.parse(JSON.stringify(sample_1_22_datum[0].session)));

      var sessionJson = session.toJSON();
      expect(sessionJson._id).toBeDefined();
      expect(sessionJson._rev).toBeDefined();
      expect(sessionJson.dbname).toBeDefined();
      expect(sessionJson.dateCreated).toBeDefined();
      expect(sessionJson.fields).toBeDefined();
      expect(sessionJson.fields.length).toEqual(7);
      expect(sessionJson.comments).toBeDefined();
      expect(sessionJson.comments.length).toEqual(0);

      expect(sessionJson.pouchname).toBeDefined();
      expect(sessionJson.sessionFields).toBeUndefined();

      expect(sessionJson.docIds).toBeUndefined();
      expect(sessionJson.docs).toBeUndefined();
      expect(sessionJson.datalist).toBeUndefined();
    });

  });
  describe("Backward compatability with v1.22", function() {


    it("should load v1.22 session", function() {
      var session = new Session(JSON.parse(JSON.stringify(sample_1_22_datum[0].session)));
      expect(session).toBeDefined();
      expect(session.fields).toBeDefined();
      expect(session.fields.length).toEqual(7);
      // expect(session.fields.toJSON()).toEqual();
      expect(session.sessionFields).toBeDefined();
      expect(session.sessionFields.length).toEqual(7);
      expect(session.sessionFields).toEqual(session.fields);
    });

  });
});
