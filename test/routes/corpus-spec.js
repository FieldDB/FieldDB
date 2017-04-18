var config = require("config");
var expect = require("chai").expect;
var url = require("url");
var UserMask = require("fielddb/api/user/UserMask").UserMask;
var getCorpusMask = require("./../../routes/corpus").getCorpusMask;
var getCorpusMaskFromTitleAsUrl = require("./../../routes/corpus").getCorpusMaskFromTitleAsUrl;
var specIsRunningTooLong = 15000;

var acceptSelfSignedCertificates = {
  strictSSL: false
};
if (process.env.NODE_ENV === "production") {
  acceptSelfSignedCertificates = {};
}

var SAMPLE_USER_MASK = new UserMask({
  fieldDBtype: "UserMask",
  id: "lingllama",
  username: "lingllama",
  gravatar: "54b53868cb4d555b804125f1a3969e87",
  authUrl: "https://auth.lingsync.org",
  collection: "users",
  firstname: "Ling",
  lastname: "Llama",
  email: "lingllama@lingsync.org",
  researchInterest: "Memes",
  affiliation: "http://lingllama.tumblr.com",
  description: "Hi! I'm a sample user, anyone can log in as me (my password is phoneme).",
  version: "v3.2.4",
  startYear: " 2012 - ",
  corpora: [{
    fieldDBtype: "Connection",
    protocol: "https://",
    domain: "corpusdev.lingsync.org",
    port: "",
    dbname: "lingllama-communitycorpus",
    path: "",
    corpusid: "89bc4d7dcc2b1fc9a7bb0f4f4743e705",
    corpusUrls: ["https://corpusdev.lingsync.org/lingllama-communitycorpus"],
    version: "v3.18.25",
    title: "communitycorpus",
    titleAsUrl: "communitycorpus",
    gravatar: "54b53868cb4d555b804125f1a3969e87",
    pouchname: "lingllama-communitycorpus"
  }, {
    fieldDBtype: "Connection",
    protocol: "https://",
    domain: "corpusdev.lingsync.org",
    port: "443",
    dbname: "lingllama-cherokee",
    path: "",
    corpusid: "958227C0-FF0E-46AC-8F7B-579330A24A95",
    corpusUrls: ["https://corpusdev.lingsync.org/lingllama-cherokee"],
    version: "v3.18.25",
    title: "cherokee",
    titleAsUrl: "cherokee",
    gravatar: "54b53868cb4d555b804125f1a3969e87",
    pouchname: "lingllama-cherokee"
  }, {
    fieldDBtype: "Connection",
    protocol: "https://",
    domain: "corpusdev.lingsync.org",
    port: "443",
    dbname: "lingllama-firstcorpus",
    path: "",
    corpusid: "1B6127DC-F156-4F48-B1D8-6F4EBA5848A5",
    corpusUrls: ["https://corpusdev.lingsync.org/lingllama-firstcorpus"],
    version: "v3.18.25",
    title: "firstcorpus",
    titleAsUrl: "firstcorpus",
    gravatar: "54b53868cb4d555b804125f1a3969e87",
    pouchname: "lingllama-firstcorpus"
  }],
  api: "users"
});

describe("corpus routes", function() {
  this.timeout(specIsRunningTooLong);

  it("should load", function() {
    expect(getCorpusMask).to.be.defined;
  });

  describe("normal requests", function() {

    it("should return the corpus mask from the sample corpus", function(done) {
      if (process.env.TRAVIS_PULL_REQUEST && !config.corpus.url) {
        return this.skip();
      }
      var corpusConfig = url.parse(config.corpus.url);

      getCorpusMask("lingllama-communitycorpus", done).then(function(mask) {
        expect(mask).to.be.defined;
        expect(mask._rev).to.deep.equal("39-7f5edbe84b9b74288218f4c108ffa5a1");
        expect(mask.fieldDBtype).to.deep.equal("CorpusMask");
        expect(mask.dbname).to.deep.equal("lingllama-communitycorpus");
        expect(mask.url).to.not.contain(corpusConfig.auth);
        expect(mask.title).to.deep.equal("CommunityCorpus");
        expect(mask.titleAsUrl).to.deep.equal("communitycorpus");
        expect(mask.description).to.deep.equal("This is a corpus which is editable by anyone in the LingSync community. You can add comments to data, import data, leave graffiti and help suggestions for other community members. We think that \"graffiti can give us a unique view into the daily life and customs of a people, for their casual expression encourages the recording of details that more formal writing would tend to ignore\" ref: http://nemingha.hubpages.com/hub/History-of-Graffiti");
        expect(mask.copyright).to.deep.equal("lingllama");
        expect(mask.termsOfUse).to.be.defined;
        expect(mask.termsOfUse.humanReadable).to.contain("Sample: The materials included in this corpus are available");
        // expect(mask.team.gravatar).to.deep.equal("948814f0b1bc8bebd701a9732ab3ebbd");
        expect(mask.team.gravatar).to.deep.equal("54b53868cb4d555b804125f1a3969e87"); // without merge of team.json
        expect(mask.team.username).to.deep.equal("lingllama");
        expect(mask.team.researchInterest).to.deep.equal("Memes");
        expect(mask.team.affiliation).to.deep.equal("http://lingllama.tumblr.com");
        expect(mask.team.description).to.deep.equal("Hi! I'm a sample user, anyone can log in as me (my password is phoneme, 'cause I like memes).");
        expect(mask.license).to.be.defined;
        expect(mask.license.humanReadable).to.contain("This license lets others remix, tweak, and");
        expect(mask.connection.toJSON()).to.deep.equal({
          fieldDBtype: "Connection",
          protocol: "https://",
          domain: mask.connection.domain,
          port: "443",
          dbname: "lingllama-communitycorpus",
          path: "",
          gravatar: "948814f0b1bc8bebd701a9732ab3ebbd",
          website: "",
          corpusid: mask.connection.corpusid,
          corpusUrls: mask.connection.corpusUrls,
          version: mask.connection.version,
          title: "CommunityCorpus",
          titleAsUrl: "communitycorpus",
          brandLowerCase: "",
          pouchname: "lingllama-communitycorpus"
        });
        done();
      }).fail(done);
    });

    it("should return the corpus mask from the community corpus", function(done) {
      getCorpusMask("community-georgian").then(function(mask) {
        expect(mask).to.be.defined;
        expect(mask._rev).to.deep.equal("34-07395ad0101afa726429e92813ae0bb0");
        expect(mask.fieldDBtype).to.deep.equal("CorpusMask");
        expect(mask.dbname).to.deep.equal("community-georgian");
        expect(mask.title).to.deep.equal("Georgian Together");
        expect(mask.titleAsUrl).to.deep.equal("georgian_together");
        expect(mask.description).to.deep.equal("This is a corpus which Georgian Together users can pull data from, and contribute to. To install the Georgian Together app, or find out more about it, visit the Google Play store: https://play.google.com/store/apps/details?id=com.github.opensourcefieldlinguistics.fielddb.lessons.georgian");
        expect(mask.copyright).to.deep.equal("Georgian Together Users");
        expect(mask.termsOfUse).to.be.defined;
        expect(mask.termsOfUse.humanReadable).not.to.contain("Sample: The materials included in this corpus are available");
        // expect(mask.team.gravatar).to.deep.equal("daa4beb95070a68f948c550cee3254bd");
        expect(mask.team.gravatar).to.deep.equal("968b8e7fb72b5ffe2915256c28a9414c"); // without merge of team.json
        expect(mask.team.username).to.deep.equal("community");
        expect(mask.license).to.be.defined;
        expect(mask.license.humanReadable).to.contain("This license lets others remix, tweak, and");
        done();
      }).fail(done);
    });

    it("should return a bleached corpus mask for corpus by default", function(done) {
      if (process.env.TRAVIS_PULL_REQUEST && !config.corpus.url) {
        return this.skip();
      }
      getCorpusMask("teammatetiger-firstcorpus").then(function(mask) {
        expect(mask).to.be.defined;
        expect(mask._rev).to.deep.equal("3-184180c75473a60c09dabc2fde9fe37e");
        expect(mask.fieldDBtype).to.deep.equal("CorpusMask");
        expect(mask.dbname).to.deep.equal("teammatetiger-firstcorpus");
        expect(mask.title).to.deep.equal("Private Corpus");
        expect(mask.titleAsUrl).to.deep.equal("private_corpus");
        expect(mask.description).to.deep.equal("The details of this corpus are not public.");
        expect(mask.copyright).to.deep.equal("teammatetiger");
        expect(mask.termsOfUse).to.be.defined;
        expect(mask.termsOfUse.humanReadable).to.contain("Sample: The materials included in this corpus are available");
        expect(mask.team.gravatar).to.deep.equal("fa988b6264338e873c2eb43328d41e9d");
        expect(mask.team.username).to.deep.equal("teammatetiger");
        expect(mask.license).to.be.defined;
        expect(mask.license.humanReadable).to.contain("This license lets others remix, tweak, and");
        done();
      }).fail(done);

    });

  });

  describe("sanitize requests", function() {

    it("should return 404 if dbname is too short", function(done) {
      getCorpusMask("aa", function(reason) {
        expect(reason).to.be.defined;
        expect(reason.status).to.deep.equal(404);
        expect(reason.userFriendlyErrors[0]).to.deep.equal("This is a strange database identifier, are you sure you didn't mistype it?");
        done();
      }).then(done);
    });

    it("should return 404 if dbname is not a string", function(done) {
      getCorpusMask({
        "not": "astring"
      }, function(reason) {
        expect(reason).to.be.defined;
        expect(reason.status).to.deep.equal(404);
        expect(reason.userFriendlyErrors[0]).to.deep.equal("This is a strange database identifier, are you sure you didn't mistype it?");
        done();
      }).then(done);
    });

    it("should return 404 if dbname contains invalid characters", function(done) {
      getCorpusMask("a.*-haaha script injection attack attempt file:///some/try", function(reason) {
        expect(reason).to.be.defined;
        expect(reason.status).to.deep.equal(404);
        expect(reason.userFriendlyErrors[0]).to.deep.equal("This is a strange database identifier, are you sure you didn't mistype it?");
        done();
      }).then(done);
    });

    it("should be case insensitive", function(done) {
      getCorpusMask("LingLlama-CommunityCorpus", done)
        .then(function(mask) {
          expect(mask).to.be.defined;
          expect(mask.dbname).to.deep.equal("lingllama-communitycorpus");
          expect(mask.title).to.deep.equal("CommunityCorpus");
          done();
        }).fail(done);
    });

  });

  describe("as a user I want a url that looks like the title", function() {

    it("should load", function() {
      expect(getCorpusMaskFromTitleAsUrl).to.be.defined;
    });


    describe("invalid requests", function() {

      it("should return 500 error if usermask is not provided", function(done) {
        getCorpusMaskFromTitleAsUrl(null, "CommunityCorpus", function(err) {
          expect(err.status).to.deep.equal(undefined);
          expect(err.message).to.deep.equal("Server errored, please report this 8234");
          done();
        }).then(done);
      });

      it("should return 404 error if usermask has no corpora", function(done) {
        getCorpusMaskFromTitleAsUrl({
          username: "lingllama"
        }, "CommunityCorpus", function(err) {
          expect(err.status).to.deep.equal(404);
          expect(err.message).to.deep.equal("Couldn't find any corpora for lingllama, if this is an error please report it to us.");
          done();
        }).then(done);
      });

    });


    describe("normal requests", function() {

      it("should return the corpus mask from the sample corpus", function() {
        getCorpusMaskFromTitleAsUrl(SAMPLE_USER_MASK, "CommunityCorpus").then(function(mask) {
          expect(mask).to.be.defined;
          expect(mask._rev).to.deep.equal("39-7f5edbe84b9b74288218f4c108ffa5a1");
          expect(mask.fieldDBtype).to.deep.equal("CorpusMask");
          expect(mask.dbname).to.deep.equal("lingllama-communitycorpus");
          expect(mask.title).to.deep.equal("CommunityCorpus");
          expect(mask.titleAsUrl).to.deep.equal("communitycorpus");
          expect(mask.description).to.deep.equal("This is a corpus which is editable by anyone in the LingSync community. You can add comments to data, import data, leave graffiti and help suggestions for other community members. We think that \"graffiti can give us a unique view into the daily life and customs of a people, for their casual expression encourages the recording of details that more formal writing would tend to ignore\" ref: http://nemingha.hubpages.com/hub/History-of-Graffiti");
          expect(mask.copyright).to.deep.equal("lingllama");
          expect(mask.termsOfUse).to.be.defined;
          expect(mask.termsOfUse.humanReadable).to.contain("Sample: The materials included in this corpus are available");
          // expect(mask.team.gravatar).to.deep.equal("948814f0b1bc8bebd701a9732ab3ebbd");
          expect(mask.team.gravatar).to.deep.equal("54b53868cb4d555b804125f1a3969e87"); // without merge of team.json
          expect(mask.team.username).to.deep.equal("lingllama");
          expect(mask.license).to.be.defined;
          expect(mask.license.humanReadable).to.contain("This license lets others remix, tweak, and");
        });
      });

      it("should use fuzzy find to find a matching corpus", function() {
        getCorpusMaskFromTitleAsUrl(new UserMask({
          username: "community",
          corpora: [{
            titleAsUrl: "georgian",
            dbname: "community-kartuli"
          }, {
            titleAsUrl: "some_informative_title_which_is_longer_and_more_recent",
            dbname: "community-ting_viet"
          }, {
            titleAsUrl: "some_informative_title",
            dbname: "community-georgian"
          }, {
            titleAsUrl: "migmaq",
            dbname: "community-migmaq"
          }]
        }),
          "some_informative_title").then(function(mask) {
          expect(mask).to.be.defined;
          expect(mask).to.be.defined;
          expect(mask._rev).to.deep.equal("34-07395ad0101afa726429e92813ae0bb0");
          expect(mask.fieldDBtype).to.deep.equal("CorpusMask");
          expect(mask.dbname).to.deep.equal("community-georgian");
          expect(mask.title).to.deep.equal("Georgian Together");
          expect(mask.titleAsUrl).to.deep.equal("georgian_together");
        });
      });

      it("should use fuzzy find to find a matching corpus too", function() {
        getCorpusMaskFromTitleAsUrl(new UserMask({
          username: "community",
          corpora: [{
            titleAsUrl: "georgian",
            dbname: "community-kartuli"
          }, {
            titleAsUrl: "some_other_informative_title",
            dbname: "community-ting_viet"
          }, {
            titleAsUrl: "some_informative_title",
            dbname: "community-georgian"
          }, {
            titleAsUrl: "migmaq",
            dbname: "community-migmaq"
          }]
        }),
          "Some_informative_title").then(function(mask) {
          expect(mask).to.be.defined;
          expect(mask._rev).to.deep.equal("34-07395ad0101afa726429e92813ae0bb0");
          expect(mask.fieldDBtype).to.deep.equal("CorpusMask");
          expect(mask.dbname).to.deep.equal("community-georgian");
          expect(mask.title).to.deep.equal("Georgian Together");
          expect(mask.titleAsUrl).to.deep.equal("georgian_together");
          expect(mask.description).to.deep.equal("This is a corpus which Georgian Together users can pull data from, and contribute to. To install the Georgian Together app, or find out more about it, visit the Google Play store: https://play.google.com/store/apps/details?id=com.github.opensourcefieldlinguistics.fielddb.lessons.georgian");
          expect(mask.copyright).to.deep.equal("Georgian Together Users");
          expect(mask.termsOfUse).to.be.defined;
          expect(mask.termsOfUse.humanReadable).not.to.contain("Sample: The materials included in this corpus are available");
          // expect(mask.team.gravatar).to.deep.equal("daa4beb95070a68f948c550cee3254bd");
          expect(mask.team.gravatar).to.deep.equal("968b8e7fb72b5ffe2915256c28a9414c"); // without merge of team.json
          expect(mask.team.username).to.deep.equal("community");
          expect(mask.license).to.be.defined;
          expect(mask.license.humanReadable).to.contain("This license lets others remix, tweak, and");
        });
      });

      it("should use fuzzy find to find the users matching corpus", function() {
        return getCorpusMaskFromTitleAsUrl(new UserMask({
          username: "community",
          corpora: [{
            titleAsUrl: "georgian",
            dbname: "community-georgian"
          }, {
            titleAsUrl: "georgian",
            dbname: "another-georgian"
          }, {
            titleAsUrl: "migmaq",
            dbname: "community-migmaq"
          }]
        }),
          "georgian").then(function(mask) {
          expect(mask).to.be.defined;
          expect(mask.titleAsUrl).to.deep.equal("georgian_together");
        });
      });

    });

  });

});
