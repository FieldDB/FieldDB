var expect = require("chai").expect;
var getUserMask = require("./../../lib/user").getUserMask;
var specIsRunningTooLong = 25000;

var acceptSelfSignedCertificates = {
  strictSSL: false
};
if (process.env.NODE_ENV === "production") {
  acceptSelfSignedCertificates = {};
}

describe("user lib", function() {

  it("should load", function() {
    expect(getUserMask).to.be.defined;
  });

  describe("normal requests", function() {
    it("should return the user mask from the sample user", function(done) {
      getUserMask("lingllama", done).then(function(mask) {
        expect(mask).to.be.defined;
        expect(mask.fieldDBtype).to.deep.equal("UserMask");
        expect(mask.username).to.deep.equal("lingllama");
        expect(mask.firstname).to.deep.equal("Ling");
        expect(mask.lastname).to.deep.equal("Llama");
        expect(mask.name).to.deep.equal("Ling Llama");
        expect(mask.gravatar).to.deep.equal("54b53868cb4d555b804125f1a3969e87");
        expect(mask.researchInterest).to.deep.equal("Memes");
        expect(mask.affiliation).to.deep.equal("http://lingllama.tumblr.com");
        expect(mask.description).to.deep.equal("Hi! I'm a sample user, anyone can log in as me (my password is phoneme).");
        expect(mask.corpora.length).to.deep.equal(3);
        var titles = mask.corpora.map(function(connection) {
          return connection.title;
        }).sort();
        expect(titles).to.deep.equal(["CommunityCorpus", "Private Corpus", "Private Corpus"]);
        var gravatars = mask.corpora.map(function(connection) {
          return connection.gravatar;
        }).sort();
        expect(gravatars).to.deep.equal(["4d3b96ec20ff9cdbf4910ea58fcb3a4a", "948814f0b1bc8bebd701a9732ab3ebbd", "d26f111e500355e5259332632982aa87"]);
        done();
      }).fail(done);
    }, specIsRunningTooLong);

    it("should return the user mask from the community user", function(done) {
      getUserMask("community", done).then(function(mask) {
        expect(mask).to.be.defined;
        expect(mask.fieldDBtype).to.deep.equal("UserMask");
        expect(mask.username).to.deep.equal("community");
        expect(mask.lastname).to.deep.equal("Community");
        expect(mask.gravatar).to.deep.equal("968b8e7fb72b5ffe2915256c28a9414c");
        expect(mask.researchInterest).to.deep.equal("none");
        expect(mask.description).to.contain("This team manages the community corpora, if you want to contact us or help out, you can email us at community@");
        expect(mask.corpora.length).to.deep.equal(3);

        var titles = mask.corpora.map(function(connection) {
          return connection.title;
        }).sort();
        expect(titles).to.deep.equal(["Georgian Together", "Learn Mi'gmaq", "Private Corpus"]);
        var gravatars = mask.corpora.map(function(connection) {
          return connection.gravatar;
        }).sort();
        expect(gravatars).to.deep.equal(["574e82c91ae041da8cdfa37f6ef4cafe", "daa4beb95070a68f948c550cee3254bd", "e40964a15458c4c395bab9061b875f5d"]);
        done();
      }).fail(done);
    }, specIsRunningTooLong);

    it("should return a bleached user mask for users by default", function(done) {
      getUserMask("teammatetiger", done).then(function(mask) {
        expect(mask).to.be.defined;
        expect(mask.fieldDBtype).to.deep.equal("UserMask");
        expect(mask.username).to.deep.equal("teammatetiger");
        expect(mask.firstname).to.deep.equal("");
        expect(mask.lastname).to.deep.equal("");
        expect(mask.name).to.deep.equal("teammatetiger");
        expect(mask.gravatar).to.deep.equal("34cc621c0b2b797c313432cf88f42033");
        expect(mask.researchInterest).to.deep.equal("No public information available");
        expect(mask.affiliation).to.deep.equal("No public information available");
        expect(mask.description).to.deep.equal("No public information available");
        done();
      }).fail(done);
    }, specIsRunningTooLong);

  });

  describe("close enough requests", function() {

    it("should be case insensitive", function(done) {
      getUserMask("LingLlama", done)
        .then(function(results) {
          expect(results).to.be.defined;
          expect(results.username).to.deep.equal("lingllama");
          expect(results.gravatar).to.deep.equal("54b53868cb4d555b804125f1a3969e87");
          expect(results.corpora.length).to.deep.equal(3);
          done();
        }).fail(done);
    }, specIsRunningTooLong);

  });

  describe("sanitize requests", function() {

    it("should return 404 if username is too short", function(done) {
      getUserMask("aa", function(err) {
        expect(err).to.be.defined;
        expect(err.status).to.deep.equal(404);
        expect(err.userFriendlyErrors[0]).to.deep.equal("This is a strange username, are you sure you didn't mistype it?");
        done();
      }).then(done);
    }, specIsRunningTooLong);

    it("should return 404 if username is not a string", function(done) {
      getUserMask({
        "not": "astring"
      }, function(err) {
        expect(err).to.be.defined;
        expect(err.status).to.deep.equal(404);
        expect(err.userFriendlyErrors[0]).to.deep.equal("This is a strange username, are you sure you didn't mistype it?");
        done();
      }).then(done);
    }, specIsRunningTooLong);

    it("should return 404 if username contains invalid characters", function(done) {
      getUserMask("a.*-haaha script injection attack attempt file:///some/try", function(err) {
        expect(err).to.be.defined;
        expect(err.status).to.deep.equal(404);
        expect(err.userFriendlyErrors[0]).to.deep.equal("This is a strange username, are you sure you didn't mistype it?");
        done();
      }).then(done);
    }, specIsRunningTooLong);

  });

});
