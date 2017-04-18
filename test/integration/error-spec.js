"use strict";
var config = require("config");
var expect = require("chai").expect;
var supertest = require("supertest");
var api = require("../../server");

describe("error handling", function() {
  it("should handle route not found", function(done) {
    var testApp = supertest(api).get("/notauser");

    // The react ap contacts the api durring server side render
    process.env.API_BASE_URL = "http://127.0.0.1:" + testApp.app.address().port;

    testApp
      .expect("Content-Type", /text\/html; charset=UTF-8/i)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        expect(res.text).to.contain("Not found");
        expect(res.text).to.contain("Sorry, a user with this username was not found, please try again.");

        done();
      });
  });

  it("should handle corpus not found", function(done) {
    if (process.env.TRAVIS_PULL_REQUEST && !config.corpus.url) {
      return this.skip();
    }

    var testApp = supertest(api).get("/testing/testing-notacorpus");

    // The react ap contacts the api durring server side render
    process.env.API_BASE_URL = "http://127.0.0.1:" + testApp.app.address().port;

    testApp
      .expect("Content-Type", /text\/html; charset=UTF-8/i)
      .end(function(err, res) {
        if (err) {
          return done(err);
        }

        expect(res.text).to.contain("Not found");
        expect(res.text).to.contain("Sorry, the page /testing/testing-notacorpus you are looking for was not found.");

        done();
      });
  });
});
