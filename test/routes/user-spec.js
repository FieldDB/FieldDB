var getUserMask = require("./../../routes/user").getUserMask;
var specIsRunningTooLong = 5000;


var deploy_target = process.env.NODE_DEPLOY_TARGET || "local";
var node_config = require("./../../lib/nodeconfig_local"); //always use local node config
var couch_keys = require("./../../lib/couchkeys_" + deploy_target);

var connect = node_config.usersDbConnection.protocol + couch_keys.username + ":" +
  couch_keys.password + "@" + node_config.usersDbConnection.domain +
  ":" + node_config.usersDbConnection.port +
  node_config.usersDbConnection.path;
var nano = require("nano")(connect);


describe("user routes", function() {

  it("should load", function() {
    expect(getUserMask).toBeDefined();
  });

  describe("invalid requests", function() {

    it("should return 500 error if nano is not provided", function(done) {
      getUserMask("lingllama").then(function(mask) {
        console.log(mask);
        expect(true).toBeFalsy();
      }, function(reason) {
        expect(reason).toBeDefined();
        expect(reason).toEqual({
          status: 500,
          userFriendlyErrors: ['Server errored, please report this 5342']
        });
      }).fail(function(exception) {
        console.log(exception.stack);
        expect(exception).toBeUndefined();
      }).done(done);
    }, specIsRunningTooLong);

    it("should return 500 error if usersDbConnectionDBname is not provided", function(done) {
      getUserMask("lingllama", nano).then(function(mask) {
        console.log(mask);
        expect(true).toBeFalsy();
      }, function(reason) {
        expect(reason).toBeDefined();
        expect(reason).toEqual({
          status: 500,
          userFriendlyErrors: ['Server errored, please report this 5342']
        });
      }).fail(function(exception) {
        console.log(exception.stack);
        expect(exception).toBeUndefined();
      }).done(done);
    }, specIsRunningTooLong);

  });


  describe("normal requests", function() {

    it("should return the user mask from the sample user", function(done) {
      getUserMask("lingllama", nano, node_config.usersDbConnection.dbname).then(function(mask) {
        expect(mask).toBeDefined();
        expect(mask.fieldDBtype).toEqual("UserMask");
        expect(mask.username).toEqual("lingllama");
        expect(mask.firstname).toEqual("Ling");
        expect(mask.lastname).toEqual("Llama");
        expect(mask.name).toEqual("Ling Llama");
        expect(mask.gravatar).toEqual("54b53868cb4d555b804125f1a3969e87");
        expect(mask.researchInterest).toEqual("Memes");
        expect(mask.affiliation).toEqual("http://lingllama.tumblr.com");
        expect(mask.description).toEqual("Hi! I'm a sample user, anyone can log in as me (my password is phoneme).");
      }, function(reason) {
        expect(reason).toBeDefined();
        expect(reason).toEqual({
          status: 500,
          userFriendlyErrors: ["Server errored, please report this 6339"]
        });
      }).fail(function(exception) {
        console.log(exception.stack);
        expect(exception).toBeUndefined();
      }).done(done);
    }, specIsRunningTooLong);

    it("should return the user mask from the community user", function(done) {
      getUserMask("community", nano, node_config.usersDbConnection.dbname).then(function(mask) {
        expect(mask).toBeDefined();
        expect(mask.fieldDBtype).toEqual("UserMask");
        expect(mask.username).toEqual("community");
        expect(mask.lastname).toEqual("Community");
        expect(mask.gravatar).toEqual("968b8e7fb72b5ffe2915256c28a9414c");
        expect(mask.researchInterest).toEqual("none");
        expect(mask.description).toContain("This team manages the community corpora, if you want to contact us or help out, you can email us at community@");
      }, function(reason) {
        expect(reason).toBeDefined();
        expect(reason).toEqual({
          status: 500,
          userFriendlyErrors: ["Server errored, please report this 6339"]
        });
      }).fail(function(exception) {
        console.log(exception.stack);
        expect(exception).toBeUndefined();
      }).done(done);
    });

    it("should return a bleached user mask for users by default", function(done) {
      getUserMask("teammatetiger", nano, node_config.usersDbConnection.dbname).then(function(mask) {
        expect(mask).toBeDefined();
        expect(mask.fieldDBtype).toEqual("UserMask");
        expect(mask.username).toEqual("teammatetiger");
        expect(mask.firstname).toEqual("");
        expect(mask.lastname).toEqual("");
        expect(mask.name).toEqual("teammatetiger");
        expect(mask.gravatar).toEqual("34cc621c0b2b797c313432cf88f42033");
        expect(mask.researchInterest).toEqual("No public information available");
        expect(mask.affiliation).toEqual("No public information available");
        expect(mask.description).toEqual("No public information available");
      }, function(reason) {
        expect(reason).toBeDefined();
        expect(reason).toEqual({
          status: 500,
          userFriendlyErrors: ["Server errored, please report this 6339"]
        });
      }).fail(function(exception) {
        console.log(exception.stack);
        expect(exception).toBeUndefined();
      }).done(done);

    }, specIsRunningTooLong);

  });

});
