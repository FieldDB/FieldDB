var config = require("config"); 
var url = require("url"); 
var UserMask = require("fielddb/api/user/UserMask").UserMask;
var getCorpusMask = require("./../../routes/corpus").getCorpusMask;
var getCorpusMaskFromTitleAsUrl = require("./../../routes/corpus").getCorpusMaskFromTitleAsUrl;
var specIsRunningTooLong = 5000;

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

  it("should load", function() {
    expect(getCorpusMask).toBeDefined();
  });

  describe("normal requests", function() {

    it("should return the corpus mask from the sample corpus", function(done) {
      var corpusConfig = url.parse(config.corpus.url);

      getCorpusMask("lingllama-communitycorpus").then(function(mask) {
        expect(mask).toBeDefined();
        expect(mask._rev).toEqual("39-7f5edbe84b9b74288218f4c108ffa5a1");
        expect(mask.fieldDBtype).toEqual("CorpusMask");
        expect(mask.dbname).toEqual("lingllama-communitycorpus");
        expect(mask.url).toNotContain(corpusConfig.auth);
        expect(mask.title).toEqual("CommunityCorpus");
        expect(mask.titleAsUrl).toEqual("communitycorpus");
        expect(mask.description).toEqual("This is a corpus which is editable by anyone in the LingSync community. You can add comments to data, import data, leave graffiti and help suggestions for other community members. We think that \"graffiti can give us a unique view into the daily life and customs of a people, for their casual expression encourages the recording of details that more formal writing would tend to ignore\" ref: http://nemingha.hubpages.com/hub/History-of-Graffiti");
        expect(mask.copyright).toEqual("lingllama");
        expect(mask.termsOfUse).toBeDefined();
        expect(mask.termsOfUse.humanReadable).toContain("Sample: The materials included in this corpus are available");
        // expect(mask.team.gravatar).toEqual("948814f0b1bc8bebd701a9732ab3ebbd");
        expect(mask.team.gravatar).toEqual("54b53868cb4d555b804125f1a3969e87"); // without merge of team.json
        expect(mask.team.username).toEqual("lingllama");
        expect(mask.team.researchInterest).toEqual("Memes");
        expect(mask.team.affiliation).toEqual("http://lingllama.tumblr.com");
        expect(mask.team.description).toEqual("Hi! I'm a sample user, anyone can log in as me (my password is phoneme, 'cause I like memes).");
        expect(mask.license).toBeDefined();
        expect(mask.license.humanReadable).toContain("This license lets others remix, tweak, and");
        expect(mask.connection.toJSON()).toEqual({
          fieldDBtype: "Connection",
          protocol: "https://",
          domain: "corpusdev.lingsync.org",
          port: "443",
          dbname: "lingllama-communitycorpus",
          path: "",
          corpusid: mask.connection.corpusid,
          corpusUrls: mask.connection.corpusUrls,
          version: mask.connection.version,
          title: "CommunityCorpus",
          titleAsUrl: "communitycorpus",
          brandLowerCase: "",
          pouchname: "lingllama-communitycorpus"
        });
      },
      function(reason) {
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

    xit("should return the corpus mask from the community corpus", function(done) {
      getCorpusMask("community-georgian").then(function(mask) {
        expect(mask).toBeDefined();
        expect(mask._rev).toEqual("34-07395ad0101afa726429e92813ae0bb0");
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

    xit("should return a bleached corpus mask for corpuss by default", function(done) {
      getCorpusMask("teammatetiger-firstcorpus").then(function(mask) {
        expect(mask).toBeDefined();
        expect(mask._rev).toEqual("3-184180c75473a60c09dabc2fde9fe37e");
        expect(mask.fieldDBtype).toEqual("CorpusMask");
        expect(mask.dbname).toEqual("teammatetiger-firstcorpus");
        expect(mask.title).toEqual("Private Corpus");
        expect(mask.titleAsUrl).toEqual("private_corpus");
        expect(mask.description).toEqual("The details of this corpus are not public.");
        expect(mask.copyright).toEqual("teammatetiger");
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
      getCorpusMask("aa")
        .then(function(mask) {
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
        })
        .then(function(mask) {
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
      getCorpusMask("a.*-haaha script injection attack attempt file:///some/try")
        .then(function(mask) {
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
      getCorpusMask("LingLlama-CommunityCorpus")
        .then(function(mask) {
          expect(mask).toBeDefined();
          expect(mask.dbname).toEqual("lingllama-communitycorpus");
          expect(mask.title).toEqual("CommunityCorpus");
        }, function(reason) {
          expect(reason).toBeDefined();
          expect(reason.status).toEqual(500);
          console.log(reason);
          expect(reason.userFriendlyErrors[0]).toEqual("Server errored, please report this 6339");
        }).fail(function(exception) {
          console.log(exception.stack);
          expect(exception).toBeUndefined();
        }).done(done);
    }, specIsRunningTooLong);

  });

  describe("as a user I want a url that looks like the title", function() {

    it("should load", function() {
      expect(getCorpusMaskFromTitleAsUrl).toBeDefined();
    });


    describe("invalid requests", function() {

      it("should return 500 error if usermask is not provided", function(done) {
        getCorpusMaskFromTitleAsUrl(null, "CommunityCorpus").then(function(mask) {
          console.log(mask);
          expect(true).toBeFalsy();
        }, function(reason) {
          expect(reason).toBeDefined();
          expect(reason).toEqual({
            status: 500,
            userFriendlyErrors: ["Server errored, please report this 8234"]
          });
        }).fail(function(exception) {
          console.log(exception.stack);
          expect(exception).toBeUndefined();
        }).done(done);
      }, specIsRunningTooLong);

      it("should return 404 error if usermask has no corpora", function(done) {
        getCorpusMaskFromTitleAsUrl({
          username: "lingllama"
        }, "CommunityCorpus").then(function(mask) {
          console.log(mask);
          expect(true).toBeFalsy();
        }, function(reason) {
          expect(reason).toBeDefined();
          expect(reason).toEqual({
            status: 404,
            userFriendlyErrors: ["Couldn't find any corpora for lingllama, if this is an error please report it to us."]
          });
        }).fail(function(exception) {
          console.log(exception.stack);
          expect(exception).toBeUndefined();
        }).done(done);
      }, specIsRunningTooLong);

    });


    describe("normal requests", function() {

      xit("should return the corpus mask from the sample corpus", function(done) {
        getCorpusMaskFromTitleAsUrl(SAMPLE_USER_MASK, "CommunityCorpus").then(function(mask) {
          expect(mask).toBeDefined();
          expect(mask._rev).toEqual("39-7f5edbe84b9b74288218f4c108ffa5a1");
          expect(mask.fieldDBtype).toEqual("CorpusMask");
          expect(mask.dbname).toEqual("lingllama-communitycorpus");
          expect(mask.title).toEqual("CommunityCorpus");
          expect(mask.titleAsUrl).toEqual("communitycorpus");
          expect(mask.description).toEqual("This is a corpus which is editable by anyone in the LingSync community. You can add comments to data, import data, leave graffiti and help suggestions for other community members. We think that \"graffiti can give us a unique view into the daily life and customs of a people, for their casual expression encourages the recording of details that more formal writing would tend to ignore\" ref: http://nemingha.hubpages.com/hub/History-of-Graffiti");
          expect(mask.copyright).toEqual("lingllama");
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
            userFriendlyErrors: ["Server errored, please report this 9313"]
          });
        }).fail(function(exception) {
          console.log(exception.stack);
          expect(exception).toBeUndefined();
        }).done(done);
      }, specIsRunningTooLong);

      it("should use fuzzy find to find a matching corpus", function(done) {
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
          expect(mask).toBeDefined();
          expect(mask).toBeDefined();
          expect(mask._rev).toEqual("34-07395ad0101afa726429e92813ae0bb0");
          expect(mask.fieldDBtype).toEqual("CorpusMask");
          expect(mask.dbname).toEqual("community-georgian");
          expect(mask.title).toEqual("Georgian Together");
          expect(mask.titleAsUrl).toEqual("georgian_together");
        }, function(reason) {
          expect(reason).toBeDefined();
          expect(reason).toEqual({
            status: 500,
            error: "not_found",
            userFriendlyErrors: ["Server timed out, please try again later"]
          });
        }).fail(function(exception) {
          console.log(exception.stack);
          expect(exception).toBeUndefined();
        }).done(done);
      });

      it("should use fuzzy find to find a matching corpus too", function(done) {
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
          expect(mask).toBeDefined();
          expect(mask._rev).toEqual("34-07395ad0101afa726429e92813ae0bb0");
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
            status: 404,
            error: "not_found",
            userFriendlyErrors: ["Database details not found"]
          });
        }).fail(function(exception) {
          console.log(exception.stack);
          expect(exception).toBeUndefined();
        }).done(done);
      });

    });

  });

});
