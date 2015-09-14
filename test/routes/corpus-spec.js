var getCorpusMask = require("./../../routes/corpus").getCorpusMask;
var getCorpusMaskFromTitleAsUrl = require("./../../routes/corpus").getCorpusMaskFromTitleAsUrl;
var specIsRunningTooLong = 5000;


var deploy_target = process.env.NODE_DEPLOY_TARGET || "local";
var node_config = require("./../../lib/nodeconfig_local"); //always use local node config
var couch_keys = require("./../../lib/couchkeys_" + deploy_target);

var connect = node_config.usersDbConnection.protocol + couch_keys.username + ":" +
  couch_keys.password + "@" + node_config.usersDbConnection.domain +
  ":" + node_config.usersDbConnection.port +
  node_config.usersDbConnection.path;
var nano = require("nano")(connect);


describe("corpus routes", function() {

  it("should load", function() {
    expect(getCorpusMask).toBeDefined();
  });

  describe("invalid requests", function() {

    it("should return 500 error if nano is not provided", function(done) {
      getCorpusMask("lingllama-communitycorpus").then(function(mask) {
        console.log(mask);
        expect(true).toBeFalsy();
      }, function(reason) {
        expect(reason).toBeDefined();
        expect(reason).toEqual({
          status: 500,
          userFriendlyErrors: ["Server errored, please report this 3242"]
        });
      }).fail(function(exception) {
        console.log(exception.stack);
        expect(exception).toBeUndefined();
      }).done(done);
    }, specIsRunningTooLong);

  });

  describe("normal requests", function() {

    it("should return the corpus mask from the sample corpus", function(done) {
      getCorpusMask("lingllama-communitycorpus", nano).then(function(mask) {
        expect(mask).toBeDefined();
        expect(mask._rev).toEqual("30-fc45adffdf3215346181cfb275fa892c");
        expect(mask.fieldDBtype).toEqual("CorpusMask");
        expect(mask.dbname).toEqual("lingllama-communitycorpus");
        expect(mask.title).toEqual("CommunityCorpus");
        expect(mask.titleAsUrl).toEqual("communitycorpus");
        expect(mask.description).toEqual("This is a corpus which is editable by anyone in the LingSync community. You can add comments to data, import data, leave graffiti and help suggestions for other community members. We think that \"graffiti can give us a unique view into the daily life and customs of a people, for their casual expression encourages the recording of details that more formal writing would tend to ignore\" ref: http://nemingha.hubpages.com/hub/History-of-Graffiti");
        expect(mask.copyright).toEqual("Default: Add names of the copyright holders of the corpus.");
        expect(mask.termsOfUse).toBeDefined();
        expect(mask.termsOfUse.humanReadable).toContain("Sample: The materials included in this corpus are available");
        // expect(mask.team.gravatar).toEqual("948814f0b1bc8bebd701a9732ab3ebbd");
        expect(mask.team.gravatar).toEqual("54b53868cb4d555b804125f1a3969e87"); // without merge of team.json
        expect(mask.team.username).toEqual("lingllama");
        expect(mask.license).toBeDefined();
        expect(mask.license.humanReadable).toContain("This license lets others remix, tweak, and");
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

    it("should return the corpus mask from the community corpus", function(done) {
      getCorpusMask("community-georgian", nano).then(function(mask) {
        expect(mask).toBeDefined();
        expect(mask._rev).toEqual("27-5265bbfc7d822151608c8ca1078196fd");
        expect(mask.fieldDBtype).toEqual("CorpusMask");
        expect(mask.dbname).toEqual("community-georgian");
        expect(mask.title).toEqual("Georgian Together");
        expect(mask.titleAsUrl).toEqual("georgian_together");
        expect(mask.description).toEqual("This is a corpus which Georgian Together users can pull data from, and contribute to. To install the Georgian Together app, or find out more about it, visit the Google Play store: https://play.google.com/store/apps/details?id=com.github.opensourcefieldlinguistics.fielddb.lessons.georgian");
        expect(mask.copyright).toEqual("Georgian Together Users");
        expect(mask.termsOfUse).toBeDefined();
        expect(mask.termsOfUse.humanReadable).not.toContain("Sample: The materials included in this corpus are available");
        // expect(mask.team.gravatar).toEqual("daa4beb95070a68f948c550cee3254bd");
        expect(mask.team.gravatar).toEqual("968b8e7fb72b5ffe2915256c28a9414c"); // without merge of team.json
        expect(mask.team.username).toEqual("community");
        expect(mask.license).toBeDefined();
        expect(mask.license.humanReadable).toContain("This license lets others remix, tweak, and");
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

    it("should return a bleached corpus mask for corpuss by default", function(done) {
      getCorpusMask("teammatetiger-firstcorpus", nano).then(function(mask) {
        expect(mask).toBeDefined();
        expect(mask._rev).toEqual("3-184180c75473a60c09dabc2fde9fe37e");
        expect(mask.fieldDBtype).toEqual("CorpusMask");
        expect(mask.dbname).toEqual("teammatetiger-firstcorpus");
        expect(mask.title).toEqual("Private Corpus");
        expect(mask.titleAsUrl).toEqual("private_corpus");
        expect(mask.description).toEqual("The details of this corpus are not public.");
        expect(mask.copyright).toEqual("Default: Add names of the copyright holders of the corpus.");
        expect(mask.termsOfUse).toBeDefined();
        expect(mask.termsOfUse.humanReadable).toContain("Sample: The materials included in this corpus are available");
        expect(mask.team.gravatar).toEqual("fa988b6264338e873c2eb43328d41e9d");
        expect(mask.team.username).toEqual("teammatetiger");
        expect(mask.license).toBeDefined();
        expect(mask.license.humanReadable).toContain("This license lets others remix, tweak, and");
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

  describe("sanitize requests", function() {

    it("should return 404 if dbname is too short", function(done) {
      getCorpusMask("aa", nano)
        .then(function(results) {
          console.log(mask);
          expect(true).toBeFalsy();
        }, function(reason) {
          expect(reason).toBeDefined();
          expect(reason.status).toEqual(404);
          expect(reason.userFriendlyErrors[0]).toEqual("This is a strange database identifier, are you sure you didn't mistype it?");
        }).fail(function(exception) {
          console.log(exception.stack);
          expect(exception).toBeUndefined();
        }).done(done);
    }, specIsRunningTooLong);

    it("should return 404 if dbname is not a string", function(done) {
      getCorpusMask({
          "not": "astring"
        }, nano)
        .then(function(results) {
          console.log(mask);
          expect(true).toBeFalsy();
        }, function(reason) {
          expect(reason).toBeDefined();
          expect(reason.status).toEqual(404);
          expect(reason.userFriendlyErrors[0]).toEqual("This is a strange database identifier, are you sure you didn't mistype it?");
        }).fail(function(exception) {
          console.log(exception.stack);
          expect(exception).toBeUndefined();
        }).done(done);
    }, specIsRunningTooLong);

    it("should return 404 if dbname contains invalid characters", function(done) {
      getCorpusMask("a.*-haaha script injection attack attempt file:///some/try", nano)
        .then(function(results) {
          console.log(mask);
          expect(true).toBeFalsy();
        }, function(reason) {
          expect(reason).toBeDefined();
          expect(reason.status).toEqual(404);
          expect(reason.userFriendlyErrors[0]).toEqual("This is a strange database identifier, are you sure you didn't mistype it?");
        }).fail(function(exception) {
          console.log(exception.stack);
          expect(exception).toBeUndefined();
        }).done(done);
    }, specIsRunningTooLong);

    it("should be case insensitive", function(done) {
      getCorpusMask("LingLlama-CommunityCorpus", nano)
        .then(function(results) {
          expect(results).toBeDefined();
          expect(results.dbname).toEqual("lingllama-communitycorpus");
          expect(results.title).toEqual("CommunityCorpus");
        }, function(reason) {
          expect(reason).toBeDefined();
          expect(reason.status).toEqual(404);
          expect(reason.userFriendlyErrors[0]).toEqual("This is a strange database identifier, are you sure you didn't mistype it?");
        }).fail(function(exception) {
          console.log(exception.stack);
          expect(exception).toBeUndefined();
        }).done(done);
    }, specIsRunningTooLong);

  });

});
