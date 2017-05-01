var config = require("config");
var expect = require("chai").expect;
var supertest = require("supertest");

var api = require("../../server");
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

describe("/v5", function() {
  this.timeout(specIsRunningTooLong);

  describe("GET /api/activity/*", function() {
    it("should return heat map data from the sample activity feeds", function(done) {
      if (process.env.TRAVIS_PULL_REQUEST && !config.corpus.url) {
        return this.skip();
      }

      supertest(api)
        .get("/api/activity/lingllama-communitycorpus")
        .expect("Content-Type", /application\/json; charset=utf-8/i)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          expect(res.body).to.be.defined;
          expect(res.body.rows).to.be.defined;
          expect(res.body.rows.length).to.deep.equal(LINGLLAMA_ACTIVITY_SIZE);

          done();
      });
    });

    it("should return heat map data from the community activity feeds", function(done) {
      if (process.env.TRAVIS_PULL_REQUEST && !config.corpus.url) {
        return this.skip();
      }

      supertest(api)
        .get("/api/activity/community-georgian")
        .expect("Content-Type", /application\/json; charset=utf-8/i)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          expect(res.body).to.be.defined;
          expect(res.body.rows).to.be.defined;
          expect(res.body.rows.length).to.deep.equal(COMMUNITY_GEORGIAN_ACTIVITY_SIZE);

          done();
        });
    });
  });
});
