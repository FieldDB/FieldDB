var Session = require("./../../api/datum/Session").Session;
var sample_1_22_datum = require("./../../sample_data/datum_v1.22.1.json");
var specIsRunningTooLong = 5000;

describe("Session: as a linguist I often collect data in an elicitation session", function() {
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


  describe("provide syntactic sugar on the list of data in the session ", function() {
    var session;
    beforeEach(function() {
      session = new Session({
        docIds: ["thefirstdocinthissession"]
      });
    });

    it("should reply to requests for docs", function() {
      expect(session.datalist.docs).toBeDefined();
      expect(session.datalist.docs.thefirstdocinthissession.id).toEqual("thefirstdocinthissession");

      expect(session.docs).toBeDefined();
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
        expect(session.datalist.docs).toBeDefined();
        expect(session.datalist.docs.thefirstdocinthissession.id).toEqual("thefirstdocinthissession");

        expect(session.examples).toBeDefined();
        expect(session.examples.thefirstdocinthissession.id).toEqual("thefirstdocinthissession");
      });
    });

  });

  describe("as a data list ", function() {

    it("should have docs if set via docIds durring constructino", function() {
      var session = new Session({
        docIds: ["thefirstdocinthissession"]
      });
      expect(session).toBeDefined();

      expect(session.docs).toBeDefined();
      expect(session.docs.thefirstdocinthissession.id).toEqual("thefirstdocinthissession");
    });

    it("should have docs if set via docIds after constructino", function() {
      var session = new Session();
      session.docIds = ["thefirstdocinthissession"];
      expect(session).toBeDefined();

      expect(session.docs).toBeDefined();
      expect(session.docs.thefirstdocinthissession.id).toEqual("thefirstdocinthissession");
    });

    it("should have docs if set via docs after construction", function() {
      var session = new Session();
      session.docs = [{
        id: "thefirstdocinthissession"
      }];
      expect(session).toBeDefined();

      expect(session.docs).toBeDefined();
      expect(session.docs.thefirstdocinthissession.id).toEqual("thefirstdocinthissession");
    });

    it("should have docs if docs are added after construction", function(done) {
      var session = new Session();
      session.add([{
        id: "thefirstdocinthissession"
      }]);

      session.whenReindexedFromApi.then(function() {
        expect(session).toBeDefined();

        expect(session.datalist).toBeDefined();

        expect(session.datalist.docs).toBeDefined();
        expect(session.docs).toBeDefined();

        // expect(session.docs).toBeDefined();
        // expect(session.docs.thefirstdocinthissession.id).toEqual("thefirstdocinthissession");

      }).done(done);
    }, specIsRunningTooLong);


    it("should provide a list of datum ids after datalist", function() {
      var session = new Session({
        id: "asessionwhichisreal"
      });
      session.datalist = {
        // debugMode: true,
        title: "List of data in this session",
        docIds: ["one1", "two", "three"]
      };

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
      expect(session.datalist.docs._collection[0].fieldDBtype).toEqual("FieldDBObject");

      expect(session.docs).toBeDefined();
      expect(session.docs.length).toEqual(3);
      expect(session.docs._collection[0].id).toEqual("one1");
    });

    it("should support a list of datum ids upon creation", function() {
      var session = new Session({
        id: "asessionwhichisreal",
        datalist: {
          title: "List of data in this session",
          docIds: ["1", "two", "three"]
        }
      });

      expect(session.docIds).toBeDefined();
      expect(session.docIds.length).toEqual(3);
      expect(session.docIds[0]).toEqual("1");
    });

    it("should support a list of datum ids upon creation", function() {
      var session = new Session({
        // debugMode: true,
        id: "asessionwhichisreal",
        docIds: ["0", "two", "three"]
      });
      expect(session).toBeDefined();

      expect(session.docIds).toBeDefined();
      expect(session.docIds.length).toEqual(3);
      expect(session.docIds[0]).toEqual("0");
    });

    it("should support a list of datum ids upon creation", function(done) {
      var session = new Session({
        // debugMode: true,
        id: "asessionwhichisreal",
        docIds: ["01"]
      });
      expect(session).toBeDefined();

      expect(session.docIds).toBeDefined();
      expect(session.docIds.length).toEqual(1);
      expect(session.docIds[0]).toEqual("01");


      session.whenReindexedFromApi.then(function() {

        expect(session.datalist.docIds).toBeDefined();
        expect(session.datalist.docIds.length).toEqual(1);
        expect(session.datalist.docIds[0]).toEqual("01");

        expect(session.docIds).toBeDefined();
        expect(session.docIds.length).toEqual(1);
        expect(session.docIds[0]).toEqual("01");

        expect(session.datalist.docs).toBeDefined();
        expect(session.datalist.docs.length).toEqual(1);
        expect(session.datalist.docs._collection[0].id).toEqual("01");

      }).done(done);

    }, specIsRunningTooLong);


    it("should support a add datum when data list exists", function(done) {
      var session = new Session({
        // debugMode: true,
        id: "asessionwhichisreal",
        datalist: {
          title: "List of data in this session",
          docIds: ["One", "two", "three"],
        }
      });
      expect(session).toBeDefined();

      expect(session.datalist.docIds).toBeDefined();
      expect(session.datalist.docIds.length).toEqual(3);
      expect(session.datalist.docIds[0]).toEqual("One");

      expect(session.docIds).toBeDefined();
      expect(session.docIds.length).toEqual(3);
      expect(session.docIds[0]).toEqual("One");

      expect(session.docs).toBeDefined();
      expect(session.docs.length).toEqual(3);
      expect(session.docs._collection).toBeDefined();
      expect(session.docs._collection[0].id).toEqual("One");

      session.add({
        id: "adatumafterdatlistexists"
      });

      expect(session.datalist.docs).toBeDefined();
      expect(session.datalist.docs.length).toEqual(4);
      expect(session.docs._collection).toBeDefined();
      expect(session.docs._collection[0].id).toEqual("One");

      session.whenReindexedFromApi.then(function() {

        expect(session.datalist.docIds).toBeDefined();
        expect(session.datalist.docIds.length).toEqual(4);
        expect(session.datalist.docIds[0]).toEqual("One");

        expect(session.docIds).toBeDefined();
        expect(session.docIds.length).toEqual(4);
        expect(session.docIds[0]).toEqual("One");


      }).done(done);

    }, specIsRunningTooLong);


    it("should support adding ids before the datalist docs exist", function(done) {
      var session = new Session({
        // debugMode: true,
        id: "asessionwhichisreal"
      });
      expect(session.datalist).toBeDefined();
      expect(session.datalist.docIds).toBeDefined();
      expect(session.datalist.docs).toBeUndefined();

      session.datalist = null;
      expect(session.datalist).toBeDefined();
      expect(session.datalist.docIds).toBeDefined();

      session.docIds = ["anidthatshouldbethere", "evenifthedocsisntready"];
      expect(session.docIds).toEqual(["anidthatshouldbethere", "evenifthedocsisntready"]);
      expect(session._docIds).toBeUndefined();

      expect(session.docs).toBeDefined();
      expect(session.docs.anidthatshouldbethere.id).toEqual("anidthatshouldbethere");
      expect(session.docs.evenifthedocsisntready.id).toEqual("evenifthedocsisntready");

      expect(session.whenReindexedFromApi).toBeDefined();

      session.whenReindexedFromApi.then(function() {
        expect(session.docs).toBeDefined();
        expect(session.docs.anidthatshouldbethere.id).toEqual("anidthatshouldbethere");
        expect(session.docs.evenifthedocsisntready.id).toEqual("evenifthedocsisntready");
      }).done(done);

    }, specIsRunningTooLong);


    it("should support add a datum before the datalist exists", function(done) {
      var session = new Session({
        id: "asessionwhichisreal"
      });
      expect(session.docIds).toEqual([]);

      session.add({
        id: "anothersimulidatum"
      });
      expect(session.docIds).toEqual([]);
      expect(session.whenReindexedFromApi).toBeDefined();

      session.whenReindexedFromApi.then(function() {

        expect(session.datalist.docIds).toBeDefined();
        expect(session.datalist.docIds.length).toEqual(1);
        expect(session.datalist.docIds[0]).toEqual("anothersimulidatum");

        expect(session.docIds).toBeDefined();
        expect(session.docIds.length).toEqual(1);
        expect(session.docIds[0]).toEqual("anothersimulidatum");

      }).done(done);

    }, specIsRunningTooLong);


    it("should support a few add events before the datalist exists", function(done) {
      var session = new Session({
        id: "asessionwhichisreal"
      });
      expect(session.docIds).toEqual([]);

      session.add({
        id: "anothersimulidatum"
      });
      expect(session.docIds).toEqual([]);
      expect(session.whenReindexedFromApi).toBeDefined();

      session.add({
        id: "yetanothersimulidatum"
      });

      session.whenReindexedFromApi.then(function() {

        expect(session.datalist.docIds).toBeDefined();
        expect(session.datalist.docIds.length).toEqual(2);
        expect(session.datalist.docIds[0]).toEqual("anothersimulidatum");
        expect(session.datalist.docIds[1]).toEqual("yetanothersimulidatum");

        expect(session.docIds).toBeDefined();
        expect(session.docIds.length).toEqual(2);
        expect(session.docIds[0]).toEqual("anothersimulidatum");
        expect(session.docIds[1]).toEqual("yetanothersimulidatum");

      }).done(done);

    }, specIsRunningTooLong);


    it("should serialize an ordered list of datum which are in the session", function(done) {
      var session = new Session({
        id: "asessionwhichisreal",
        docIds: ["thedocthatwasserialized", "andaotherdocthatwasserialized"]
      });
      var serialized = session.toJSON();
      expect(serialized.docIds).toEqual(["thedocthatwasserialized", "andaotherdocthatwasserialized"]);

      session.add({
        id: "yetanother"
      });

      expect(session.docs).toBeDefined();
      expect(session.docIds).toBeDefined();
      expect(session.docs.length).toEqual(3);
      expect(session.docIds.length).toEqual(3);
      expect(session.docIds[0]).toEqual("thedocthatwasserialized");
      expect(session.docIds[1]).toEqual("andaotherdocthatwasserialized");
      expect(session.docIds[2]).toEqual("yetanother");

      serialized = session.toJSON();
      expect(serialized.docIds).toBeDefined();
      expect(serialized.docIds.length).toEqual(3);
      expect(serialized.docIds[0]).toEqual("thedocthatwasserialized");
      expect(serialized.docIds[1]).toEqual("andaotherdocthatwasserialized");
      expect(serialized.docIds[2]).toEqual("yetanother");

      session.whenReindexedFromApi.then(function() {

        expect(session.docs).toBeDefined();
        expect(session.docIds).toBeDefined();
        expect(session.docs.length).toEqual(3);
        expect(session.docIds.length).toEqual(3);
        expect(session.docIds[0]).toEqual("thedocthatwasserialized");
        expect(session.docIds[1]).toEqual("andaotherdocthatwasserialized");
        expect(session.docIds[2]).toEqual("yetanother");

        serialized = session.toJSON();
        expect(serialized.docIds).toBeDefined();
        expect(serialized.docIds.length).toEqual(3);
        expect(serialized.docIds[0]).toEqual("thedocthatwasserialized");
        expect(serialized.docIds[1]).toEqual("andaotherdocthatwasserialized");
        expect(serialized.docIds[2]).toEqual("yetanother");
      }).done(done);

    }, specIsRunningTooLong);

  });


  xdescribe("Backward compatability with v1.22", function() {


    it("should load v1.22 session", function() {
      var session = new Session(sample_1_22_datum[0].session);
      expect(session).toBeDefined();
      expect(session.fields).toBeDefined();
      expect(session.fields.length).toEqual(7);
      expect(session.fields.toJSON()).toEqual();
      expect(session.sessionFields).toBeDefined();
      expect(session.sessionFields.length).toEqual(7);
      expect(session.sessionFields).toEqual(session.fields);
    });

  });
});
