var getUserMask = require("./../../routes/user").getUserMask;
var specIsRunningTooLong = 25000;
var config = require("config");

var acceptSelfSignedCertificates = {
  strictSSL: false
};
if (process.env.NODE_ENV === "production") {
  acceptSelfSignedCertificates = {};
}

describe("user routes", function() {

  it("should load", function() {
    expect(getUserMask).toBeDefined();
  });

  describe("normal requests", function() {
    it("should return the user mask from the sample user", function(done) {
      getUserMask("lingllama", done).then(function(mask) {
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
        expect(mask.corpora.length).toEqual(3);
        var titles = mask.corpora.map(function(connection) {
          return connection.title;
        }).sort();
        expect(titles).toEqual(["CommunityCorpus", "Private Corpus", "Private Corpus"]);
        var gravatars = mask.corpora.map(function(connection) {
          return connection.gravatar;
        }).sort();
        expect(gravatars).toEqual(["4d3b96ec20ff9cdbf4910ea58fcb3a4a", "948814f0b1bc8bebd701a9732ab3ebbd", "d26f111e500355e5259332632982aa87"]);
        done();
      }).fail(done);
    }, specIsRunningTooLong);

    it("should return the user mask from the community user", function(done) {
      getUserMask("community", done).then(function(mask) {
        expect(mask).toBeDefined();
        expect(mask.fieldDBtype).toEqual("UserMask");
        expect(mask.username).toEqual("community");
        expect(mask.lastname).toEqual("Community");
        expect(mask.gravatar).toEqual("968b8e7fb72b5ffe2915256c28a9414c");
        expect(mask.researchInterest).toEqual("none");
        expect(mask.description).toContain("This team manages the community corpora, if you want to contact us or help out, you can email us at community@");
        expect(mask.corpora.length).toEqual(3);

        var titles = mask.corpora.map(function(connection) {
          return connection.title;
        }).sort();
        expect(titles).toEqual(["Georgian Together", "Learn Mi'gmaq", "Private Corpus"]);
        var gravatars = mask.corpora.map(function(connection) {
          return connection.gravatar;
        }).sort();
        expect(gravatars).toEqual(["574e82c91ae041da8cdfa37f6ef4cafe", "daa4beb95070a68f948c550cee3254bd", "e40964a15458c4c395bab9061b875f5d"]);
        done();
        done();
      }).fail(done);
    }, specIsRunningTooLong);

    it("should return a bleached user mask for users by default", function(done) {
      getUserMask("teammatetiger", done).then(function(mask) {
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
        done();
      }).fail(done);
    }, specIsRunningTooLong);

  });

  describe("close enough requests", function() {

    it("should be case insensitive", function(done) {
      getUserMask("LingLlama", done)
        .then(function(results) {
          expect(results).toBeDefined();
          expect(results.username).toEqual("lingllama");
          expect(results.gravatar).toEqual("54b53868cb4d555b804125f1a3969e87");
          expect(results.corpora.length).toEqual(3);
          done();
        }).fail(done);
    }, specIsRunningTooLong);

  });

  describe("sanitize requests", function() {

    it("should return 404 if username is too short", function(done) {
      getUserMask("aa", function(err) {
        expect(err).toBeDefined();
        expect(err.status).toEqual(404);
        expect(err.userFriendlyErrors[0]).toEqual("This is a strange username, are you sure you didn't mistype it?");
        done();
      }).then(done);
    }, specIsRunningTooLong);

    it("should return 404 if username is not a string", function(done) {
      getUserMask({
        "not": "astring"
      }, function(err) {
        expect(err).toBeDefined();
        expect(err.status).toEqual(404);
        expect(err.userFriendlyErrors[0]).toEqual("This is a strange username, are you sure you didn't mistype it?");
        done();
      }).then(done);
    }, specIsRunningTooLong);

    it("should return 404 if username contains invalid characters", function(done) {
      getUserMask("a.*-haaha script injection attack attempt file:///some/try", function(err) {
        expect(err).toBeDefined();
        expect(err.status).toEqual(404);
        expect(err.userFriendlyErrors[0]).toEqual("This is a strange username, are you sure you didn't mistype it?");
        done();
      }).then(done);
    }, specIsRunningTooLong);

  });

});
