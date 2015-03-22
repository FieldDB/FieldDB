var Session = require("./../../api/datum/Session").Session;
var sample_1_22_datum = require("./../../sample_data/datum_v1.22.1.json");

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

  it("should have default  fields", function() {
    var session = new Session();
    expect(session.defaults).toBeDefined();
    expect(session.defaults.fields).toBeDefined();
    expect(session.defaults.fields.length).toEqual(10);
  });

  it("should support an ordered list of datum which are in the session", function() {
    var session = new Session();
    expect(session.docs).toBeDefined();
    session.add({
      id: "asimulidatum"
    });
    expect(session.docs).toBe(session.datalist.docs);
    expect(session.docs).toBe(session.datalist.docs);
    expect(session.defaults.fields.length).toEqual(10);
  });

  describe("datalist-like features", function() {

    it("should support an ordered list of datum which are in the session", function() {
      var session = new Session();
      session.add({
        id: "anothersimulidatum"
      });
      expect(session.docs).toBeDefined();
      expect(session.docs).toBe(session.datalist.docs);
      expect(session.docs).toBe(session.datalist.docs);
      expect(session.defaults.fields.length).toEqual(10);
    });

    it("should serialize an ordered list of datum which are in the session", function() {
      var session = new Session();
      var serialized = session.toJSON();
      expect(serialized.docIds).toBeUndefined();

      session.add({
        id: "yetanother"
      });
      expect(session.docs).toBeDefined();
      expect(session.docIds).toBeDefined();
      expect(session.docIds.length).toEqual(1);
      expect(session.docIds[0]).toEqual("yetanother");

      serialized = session.toJSON();
      expect(serialized.docIds).toBeDefined();
      expect(serialized.docIds.length).toEqual(1);
      expect(serialized.docIds[0]).toEqual("yetanother");
    });

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
