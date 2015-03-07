/* globals localStorage */
var User = require("../../api/user/User").User;
var SAMPLE_USER = require("./../../sample_data/user_v1.22.1.json");

describe("User ", function() {

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
      username: "bill",
      gravatar: "67890954367898765",
      firstname: "",
      lastname: "",
      email: "",
      affiliation: "",
      researchInterest: "",
      description: "",
      version: u.version,
      api: "users"
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
    expect(u.prefs).toBeDefined();
    expect(u.prefs.preferedDashboardType).toEqual("");
  });

  it("should guess an appropriate dashboard for a user", function() {
    var u = new User({
      appbrand: "phophlo",
      // prefs: {}
    });

    // u.appbrand = "phophlo";
    expect(u.prefs.fieldDBtype).toEqual("UserPreference");
    expect(u.prefs.preferedDashboardType).toEqual("experimenter");
  });

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
      version: u.version,
      prefs: {
        fieldDBtype: "UserPreference",
        dateCreated: result.prefs.dateCreated,
        version: u.version,
        hotkeys: [],
        unicodes: []
      },
      api: "users"
    });
  });

  it("should have an empty or valid email address", function() {
    var u = new User({
      email: "invalidemail@hi"
    });
    expect(u.email).toEqual("");
  });

  describe("upgrade data structure", function() {


    it("should update old servers", function() {
      expect(SAMPLE_USER.appVersionWhenCreated).toEqual("1.22.1");
      expect(SAMPLE_USER.authUrl).toEqual("https://authdev.fieldlinguist.com:3183");
      expect(SAMPLE_USER.corpuses).toEqual([{
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

      var user = new User(JSON.parse(JSON.stringify(SAMPLE_USER)));
      expect(user.authUrl).toEqual("https://authdev.lingsync.org");
      expect(user.corpora).toEqual([{
        protocol: "https://",
        domain: "corpusdev.lingsync.org",
        port: "443",
        pouchname: "sapir-cherokee",
        corpusid: "E038ECA6-AC69-43F3-8EE8-56AD3CDC9162",
        authUrl: "https://authdev.lingsync.org"
      }, {
        protocol: "https://",
        domain: "corpusdev.lingsync.org",
        port: "443",
        pouchname: "sapir-firstcorpus",
        corpusid: "60B9B35A-A6E9-4488-BBF7-CB54B09E87C1",
        authUrl: "https://authdev.lingsync.org"
      }]);
    });


  });

  describe("Client side user preferences", function() {

    it("should be able to save the user's prefs for the next app load", function() {
      var user = new User(JSON.parse(JSON.stringify(SAMPLE_USER)));
      expect(user).toBeDefined();
      user.save();

      var sapirKey,
        sapirFromStorage;
      try {
        sapirKey = localStorage.getItem("X09qKvcQn8DnANzGdrZFqCRUutIi2C") + "sapir";
        sapirFromStorage = localStorage.getItem(sapirKey);
      } catch (e) {
        expect(user.temp).toBeDefined();
        var thereIsAKeyForSapir = false;
        for (var key in user.temp) {
          if (user.temp.hasOwnProperty(key) && key.indexOf("sapir") > -1) {
            thereIsAKeyForSapir = true;
          }
        }
        expect(thereIsAKeyForSapir).toBeTruthy();
        sapirKey = user.X09qKvcQn8DnANzGdrZFqCRUutIi2C + "sapir";
        sapirFromStorage = user.temp[key];
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

});
