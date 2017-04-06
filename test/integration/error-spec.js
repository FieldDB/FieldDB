"use strict";
var config = require("config");
var expect = require("chai").expect;
var supertest = require("supertest");
var api = require("../../server");

describe("error handling", function() {
  it("should handle route not found", function(done) {
    supertest(api)
      .get("/notaroute")
      .expect("Content-Type", /text\/html; charset=UTF-8/i)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        expect(res.text).to.contain("Not found");
        expect(res.text).to.contain("Sorry, but the page you are looking for was not found");

        done();
      });
  });

  it("should handle corpus not found", function(done) {
    if (process.env.TRAVIS_PULL_REQUEST && !config.corpus.url) {
      return this.skip();
    }

    supertest(api)
      .get("/testing/testing-notacorpus")
      .expect("Content-Type", /text\/html; charset=UTF-8/i)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        expect(res.text).to.contain("Not found");
        expect(res.text).to.contain("Sorry, but the page you are looking for was not found");

        done();
      });
  });
});
