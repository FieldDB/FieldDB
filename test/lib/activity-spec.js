var config = require("config");
var expect = require("chai").expect;
var activityHeatMap = require("./../../lib/activity").activityHeatMap;
var specIsRunningTooLong = 5000;
var LINGLLAMA_ACTIVITY_SIZE = 48;
var COMMUNITY_GEORGIAN_ACTIVITY_SIZE = 218;

var acceptSelfSignedCertificates = {
  strictSSL: false
};

if (process.env.NODE_ENV === "production") {
  acceptSelfSignedCertificates = {};
}

if (process.env.OFFLINE) {
  LINGLLAMA_ACTIVITY_SIZE = 14;
  COMMUNITY_GEORGIAN_ACTIVITY_SIZE = 14;
  specIsRunningTooLong = 1000;
}

describe("activity lib", function() {
  this.timeout(specIsRunningTooLong);

  it("should load", function() {
    expect(activityHeatMap).to.be.defined;
  });

  describe("invalid requests", function() {

    it("should return empty data if dbname is not provided", function(done) {
      activityHeatMap(null, done).then(function(results) {
        expect(results).to.be.defined;
        expect(results.rows).to.be.defined;
        expect(results.rows.length).to.deep.equal(0);
      }).done(done);
    });

  });

  describe("normal requests", function() {

    it("should return heat map data from the sample activity feeds", function(done) {
      if (process.env.TRAVIS_PULL_REQUEST && !config.corpus.url) {
        return this.skip();
      }
      activityHeatMap("lingllama-communitycorpus", done).then(function(results) {
        expect(results).to.be.defined;
        expect(results.rows).to.be.defined;
        expect(results.rows.length).to.deep.equal(LINGLLAMA_ACTIVITY_SIZE);
      }).done(done);
    });

    it("should return heat map data from the community activity feeds", function(done) {
      if (process.env.TRAVIS_PULL_REQUEST && !config.corpus.url) {
        return this.skip();
      }
      activityHeatMap("community-georgian", done).then(function(results) {
        expect(results).to.be.defined;
        expect(results.rows).to.be.defined;
        expect(results.rows.length).to.deep.equal(COMMUNITY_GEORGIAN_ACTIVITY_SIZE);
      }).done(done);
    });

  });

  describe("close enough requests", function() {
    it("should use lowercase dbname", function(done) {
      if (process.env.TRAVIS_PULL_REQUEST && !config.corpus.url) {
        return this.skip();
      }

      activityHeatMap("LingLlama-communitycorpus", done).then(function(results) {
        expect(results).to.be.defined;
        expect(results.rows).to.be.defined;
        expect(results.rows.length).to.deep.equal(LINGLLAMA_ACTIVITY_SIZE);
      }).done(done);
    });

    it("should accept activity feed dbname", function(done) {
      if (process.env.TRAVIS_PULL_REQUEST && !config.corpus.url) {
        return this.skip();
      }

      activityHeatMap("lingllama-communitycorpus-activity_feed", done).then(function(results) {
        expect(results).to.be.defined;
        expect(results.rows).to.be.defined;
        expect(results.rows.length).to.deep.equal(LINGLLAMA_ACTIVITY_SIZE);
      }).done(done);
    });
  });

  describe("sanitize requests", function() {

    it("should return empty data if dbname is too short", function(done) {
      activityHeatMap("aa", done).then(function(results) {
        expect(results).to.be.defined;
        expect(results.rows).to.be.defined;
        expect(results.rows.length).to.deep.equal(0);
      }).done(done);
    });

    it("should return empty data if dbname is not a string", function(done) {
      activityHeatMap({
        "not": "astring"
      }, done).then(function(results) {
        expect(results).to.be.defined;
        expect(results.rows).to.be.defined;
        expect(results.rows.length).to.deep.equal(0);
      }).done(done);
    });

    it("should return empty data if dbname contains invalid characters", function(done) {
      activityHeatMap("a.*-haaha script injection attack attempt file:///some/try", done).then(function(results) {
        expect(results).to.be.defined;
        expect(results.rows).to.be.defined;
        expect(results.rows.length).to.deep.equal(0);
      }).done(done);
    });
  });


});
