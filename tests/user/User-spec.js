"use strict";
/* globals localStorage */
var User;
try {
  /* globals FieldDB */
  if (FieldDB) {
    User = FieldDB.User;
  }
} catch (e) {}

User = User || require("./../../api/user/User").User;

var SAMPLE_USERS = require("./../../sample_data/user_v1.22.1.json");

describe("User ", function() {

  describe("basic attributes ", function() {

    it("should should have username, firstname, lastname, gravatar, email and other options", function() {
      var json = {
        username: "bill",
        gravatar: "67890954367898765",
        anodfunction: function(input) {
          console.log(input);
        }
      };
      var u = new User(json);
      expect(u.username).toEqual(json.username);
      expect(u.firstname).toBeDefined();
      expect(u.lastname).toBeDefined();
      expect(u.gravatar).toEqual(json.gravatar);
      expect(u.email).toBeDefined();
      expect(u.name).toBeDefined();
      expect(u.affiliation).toBeDefined();
      expect(u.researchInterest).toBeDefined();
      expect(u.description).toBeDefined();

      expect(u.toJSON()).toEqual({
        fieldDBtype: "User",
        _id: "bill",
        username: "bill",
        gravatar: "67890954367898765",
        firstname: "",
        lastname: "",
        email: "",
        affiliation: "",
        researchInterest: "",
        description: "",
        version: u.version,
        api: "users",
        corpora: [],
        datalists: []
      });
    });

    it("should have a name constisting of firstname lastname ", function() {
      var u = new User();
      expect(u.name).toBeDefined();

      u.firstname = "Bill";
      u.lastname = "Smith";
      expect(u.name).toEqual("Bill Smith");
    });

    it("should have a user preferences ", function() {
      var u = new User();
      u.prefs = u.defaults.prefs;
      expect(u.prefs).toBeDefined();
      expect(u.prefs.preferredDashboardType).toEqual("fieldlinguistNormalUser");
    });

    it("should upgrade the old dates from back in the mongoose days", function() {
      var u = new User({
        "created_at": "2012-09-26T12:39:27.795Z",
        "updated_at": "2015-03-04T10:31:52.793Z"
      });
      expect(u.created_at).toEqual("2012-09-26T12:39:27.795Z");
      expect(u.dateCreated).toBeDefined();
      expect(u.dateCreated).toEqual(1348663167795);

      expect(u.updated_at).toEqual("2015-03-04T10:31:52.793Z");
      expect(u.dateModified).toBeDefined();
      expect(u.dateModified).toEqual(1425465112793);
      // expect(u.warnMessages).toEqual(" ");
    });

  });

  describe("resume where user left off", function() {
    it("should guess an appropriate dashboard for a user", function() {
      var u = new User({
        prefs: {},
        appbrand: "phophlo"
      });

      // u.appbrand = "phophlo";
      expect(u.prefs.fieldDBtype).toEqual("UserPreference");
      expect(u.prefs.preferredDashboardType).toEqual("experimenter");
    });

  });

  describe("upgrade data structure", function() {

    it("should have a complete serialization if the user requests ", function() {
      var u = new User();
      u.firstname = "Bill";
      u.lastname = "Smith";

      var result = u.toJSON("complete");
      expect(result).toEqual({
        fieldDBtype: "User",
        username: "",
        dateCreated: u.dateCreated,
        firstname: "Bill",
        lastname: "Smith",
        email: "",
        version: u.version,
        gravatar: "",
        researchInterest: "",
        affiliation: "",
        description: "",
        appbrand: "",
        fields: [],
        prefs: {
          fieldDBtype: "UserPreference",
          dateCreated: result.prefs.dateCreated,
          version: u.version,
          hotkeys: [],
          unicodes: []
        },
        userMask: {
          fieldDBtype: "UserMask",
          username: "",
          dateCreated: result.userMask.dateCreated,
          version: result.userMask.version,
          firstname: "",
          lastname: "",
          gravatar: "",
          researchInterest: "",
          affiliation: "",
          description: "",
          fields: [],
          api: "users"
        },
        mostRecentIds: {},
        activityConnection: {
          fieldDBtype: "Connection",
          version: u.version,
          corpusid: "",
          titleAsUrl: "",
          dbname: "",
          pouchname: "",
          protocol: "",
          domain: "",
          port: "",
          path: "",
          userFriendlyServerName: "",
          authUrls: [],
          clientUrls: [],
          corpusUrls: [],
          lexiconUrls: [],
          searchUrls: [],
          audioUrls: [],
          websiteUrls: [],
          activityUrls: [],
          title: "",
        },
        authUrl: "",
        corpora: [],
        newCorpora: [],
        sessionHistory: [],
        datalistHistory: [],
        datalists: [],
        api: "users"
      });
    });

    it("should have an empty or valid email address", function() {
      var u = new User({
        email: "invalidemail@hi"
      });
      expect(u.email).toEqual("");
    });


    it("should update old servers", function() {
      expect(SAMPLE_USERS[0].appVersionWhenCreated).toEqual("1.22.1");
      expect(SAMPLE_USERS[0].authUrl).toEqual("https://authdev.fieldlinguist.com:3183");
      expect(SAMPLE_USERS[0].corpuses).toEqual([{
        protocol: "https://",
        domain: "ifielddevs.iriscouch.com",
        port: "443",
        pouchname: "sapir-cherokee",
        corpusid: "E038ECA6-AC69-43F3-8EE8-56AD3CDC9162"
      }, {
        protocol: "https://",
        domain: "ifielddevs.iriscouch.com",
        port: "443",
        pouchname: "sapir-firstcorpus",
        corpusid: "60B9B35A-A6E9-4488-BBF7-CB54B09E87C1"
      }]);

      var user = new User(JSON.parse(JSON.stringify(SAMPLE_USERS[0])));
      expect(user.authUrl).toEqual("https://auth.lingsync.org");
      expect(user.corpora.toJSON()[0]).toEqual({
        fieldDBtype: "Connection",
        protocol: "https://",
        domain: "corpus.lingsync.org",
        port: "443",
        dbname: "sapir-cherokee",
        corpusid: "E038ECA6-AC69-43F3-8EE8-56AD3CDC9162",
        // authUrls: ["https://auth.lingsync.org"],
        // path: "",
        corpusUrls: ["https://corpus.lingsync.org/sapir-cherokee"],
        version: user.version,
        pouchname: "sapir-cherokee",
        title: "sapir-cherokee",
        titleAsUrl: "sapir-cherokee"
      });
      expect(user.corpora.toJSON()[1]).toEqual({
        fieldDBtype: "Connection",
        protocol: "https://",
        domain: "corpus.lingsync.org",
        port: "443",
        dbname: "sapir-firstcorpus",
        corpusid: "60B9B35A-A6E9-4488-BBF7-CB54B09E87C1",
        // authUrls: ["https://auth.lingsync.org"],
        // path: "",
        corpusUrls: ["https://corpus.lingsync.org/sapir-firstcorpus"],
        version: user.version,
        pouchname: "sapir-firstcorpus",
        title: "sapir-firstcorpus",
        titleAsUrl: "sapir-firstcorpus"
      });
    });

    it("should serialize deprecated attributse", function() {
      expect(SAMPLE_USERS[0].appVersionWhenCreated).toEqual("1.22.1");
      expect(SAMPLE_USERS[0].corpuses.length).toEqual(2);

      var user = new User(JSON.parse(JSON.stringify(SAMPLE_USERS[0]))).toJSON();
      expect(user.email).toBeDefined();
      expect(user.researchInterest).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.mostRecentIds).toBeDefined();
      expect(user.corpora.length).toEqual(2);
    });

    it("should serialize username as id", function() {
      var user = new User({
        username: "jumbo"
      }).toJSON();
      expect(user.username).toBeDefined();
      expect(user._id).toEqual("jumbo");
      expect(user._id).toEqual(user.username);
    });

  });

  describe("Merging a user from the server side", function() {

    it("should not add relatedData for docs without _id", function() {
      expect(SAMPLE_USERS[0].relatedData).toBeUndefined();
      var user = new User({
        username: "sapir"
      });

      var cloned = user.clone();
      expect(cloned).toBeDefined();
      expect(cloned.username).toEqual("sapir");
      expect(cloned.relatedData).toBeUndefined();

      user.merge("self", new User(JSON.parse(JSON.stringify(SAMPLE_USERS[0]))));
      expect(user.email).toBeDefined();
      expect(user.researchInterest).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.mostRecentIds).toBeDefined();
      expect(user.corpora.length).toEqual(2);

      expect(user.prefs.numVisibleDatum).toEqual(2);
      user.prefs.numVisibleDatum = 5;
      expect(user.prefs.numVisibleDatum).toEqual(5);

      user.merge("self", new User(JSON.parse(JSON.stringify(SAMPLE_USERS[0]))));
      expect(user.prefs.numVisibleDatum).toEqual(5);
      expect(user.relatedData).toBeUndefined();

      cloned = user.clone();
      expect(cloned).toBeDefined();
      expect(cloned.username).toEqual("sapir");
      expect(cloned.relatedData).toEqual([{
        relation: "clonedFrom",
        URI: "sapir?rev=54-9f7e36fb47cb94b5e000c82e93318c4e"
      }]);

    });

  });

  describe("Client side user preferences", function() {

    it("should be able to save the user's prefs for the next app load", function() {
      var user = new User(JSON.parse(JSON.stringify(SAMPLE_USERS[0])));
      expect(user).toBeDefined();
      user.save();

      var sapirKey,
        sapirFromStorage;
      try {
        sapirKey = localStorage.getItem("X09qKvcQn8DnANzGdrZFqCRUutIi2C") + "sapir";
        sapirFromStorage = localStorage.getItem(sapirKey);
      } catch (e) {
        expect(user.constructor.prototype.temp).toBeDefined();
        var thereIsAKeyForSapir = false;
        for (var key in user.constructor.prototype.temp) {
          if (user.constructor.prototype.temp.hasOwnProperty(key) && key.indexOf("sapir") > -1) {
            thereIsAKeyForSapir = true;
          }
        }
        expect(thereIsAKeyForSapir).toBeTruthy();
        sapirKey = user.X09qKvcQn8DnANzGdrZFqCRUutIi2C + "sapir";
        sapirFromStorage = user.constructor.prototype.temp[key];
      }
      expect(sapirKey).toBeDefined();
      expect(sapirFromStorage).toBeDefined();
      expect(sapirFromStorage.indexOf("confidential")).toEqual(0);

      var userTheNextAppLoad = new User({
        username: "sapir"
      });
      userTheNextAppLoad.fetch();
      expect(user.researchInterest).toEqual("Phonemes");

    });

  });

  describe("Cache corpora connections", function() {

    it("should have a list of corpora the user has access to", function() {
      expect(SAMPLE_USERS[0].corpuses).toBeDefined();
      var user = new User(JSON.parse(JSON.stringify(SAMPLE_USERS[0])));
      expect(user.corpora).toBeDefined();
      expect(user.corpora.length).toEqual(2);
    });

    it("should be able to get a connection from the dbname", function() {
      var user = new User(JSON.parse(JSON.stringify(SAMPLE_USERS[0])));
      var connection = user.corpora.findCorpusConnectionFromTitleAsUrl("sapir-cherokee");
      expect(connection).toBeDefined();
      expect(connection.dbname).toEqual("sapir-cherokee");
    });

    it("should be able to get a connection from only the title", function() {
      var user = new User(JSON.parse(JSON.stringify(SAMPLE_USERS[0])));

      user.corpora["sapir-firstcorpus"].title = "Quechua Sample Data";
      expect(user.corpora["sapir-firstcorpus"].title).toEqual("Quechua Sample Data");
      expect(user.corpora["sapir-firstcorpus"]).toBe(user.corpora.collection[1]);

      var connection = user.corpora.findCorpusConnectionFromTitleAsUrl("Quechua Sample Data");
      expect(connection).toBeDefined();
      expect(connection.dbname).toEqual("sapir-firstcorpus");
    });

    it("should be able to get a connection from only the title as url", function() {
      var user = new User(JSON.parse(JSON.stringify(SAMPLE_USERS[0])));
      
      user.corpora["sapir-firstcorpus"].title = "Practice corpus";
      expect(user.corpora["sapir-firstcorpus"].title).toEqual("Practice corpus");
      expect(user.corpora["sapir-firstcorpus"].titleAsUrl).toEqual("practice_corpus");

      var connection = user.corpora.findCorpusConnectionFromTitleAsUrl("practice_corpus");
      expect(connection).toBeDefined();
      expect(connection.dbname).toEqual("sapir-firstcorpus");
    });

    it("should be able to get a connection from only the corpusidentifier and team's username", function() {
      var user = new User(JSON.parse(JSON.stringify(SAMPLE_USERS[0])));
      var connection = user.corpora.findCorpusConnectionFromTitleAsUrl("cherokee", "sapir");
      expect(connection).toBeDefined();
      expect(connection.dbname).toEqual("sapir-cherokee");
    });
  });

  describe("User's profile page", function() {

    it("should not have a user mask if not was in thier user", function() {
      expect(SAMPLE_USERS[0].userMask).toBeUndefined();
      expect(SAMPLE_USERS[0].publicSelf).toBeUndefined();
      var user = new User(JSON.parse(JSON.stringify(SAMPLE_USERS[0])));
      expect(user.userMask).toBeUndefined();
    });

    it("should say no info is available if the user hasnt edited it yet", function() {
      var user = new User(JSON.parse(JSON.stringify(SAMPLE_USERS[0])));
      if (!user.userMask) {
        user.userMask = {};
      }

      expect(user.userMask).toBeDefined();
      expect(user.userMask.username).toEqual("sapir");
      expect(user.userMask.gravatar).toEqual(user.gravatar);
      expect(user.userMask.researchInterest).toEqual("No public information available");
      expect(user.userMask.description).toEqual("No public information available");
      expect(user.userMask.affiliation).toEqual("No public information available");
      expect(user.userMask.name).toEqual(user.userMask.username);
    });

    it("should have the same gravatar as the user, if they haven't customized it", function() {
      var user = new User(JSON.parse(JSON.stringify(SAMPLE_USERS[0])));
      if (!user.userMask) {
        user.userMask = {};
      }

      expect(user.userMask.gravatar).toEqual(user.gravatar);
    });

    it("should have the same gravatar as the user, if they haven't customized it", function() {
      var user = new User(JSON.parse(JSON.stringify(SAMPLE_USERS[0])));
      if (!user.userMask) {
        user.userMask = {
          gravatar: "someothergravatarfortheirpublicpage"
        };
      }

      expect(user.userMask.gravatar).not.toEqual(user.gravatar);
      expect(user.userMask.gravatar).toEqual("someothergravatarfortheirpublicpage");
    });


  });


});