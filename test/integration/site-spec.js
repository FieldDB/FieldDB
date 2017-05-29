"use strict";
var expect = require("chai").expect;
var supertest = require("supertest");
var specIsRunningTooLong = 5000;

var api = require("../../server");

describe("Site", function() {
  describe("home", function() {
    it("should display the features", function(done) {
      this.timeout(specIsRunningTooLong);

      supertest(api).get("/")
        .expect("Content-Type", /text\/html; charset=UTF-8/i)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }

          expect(res.text).to.contain("<title>LingSync.org</title>");
          expect(res.text).to.contain("A Free Tool for Creating and Maintaining a Shared")
          expect(res.text).to.contain("can contribute remotely to one");
          done();
        });
    });
  });

  describe("technology", function() {
    it("should display info about the technology", function(done) {
      this.timeout(specIsRunningTooLong);

      supertest(api).get("/technology")
        .expect("Content-Type", /text\/html; charset=UTF-8/i)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }

          expect(res.text).to.contain("<title>Technology - LingSync.org</title>");
          expect(res.text).to.contain("<meta name=\"description\" content=\"Lingsync is composed of a number of webservices and application clients");
          expect(res.text).to.contain("linguistics to adapt to your existing organization of the data")
          expect(res.text).to.contain("LaTeX, xml, csv and more, but if you have another format");
          done();
        });
    });
  });

  describe("people", function() {
    it("should display the people", function(done) {
      this.timeout(specIsRunningTooLong);

      supertest(api).get("/people")
        .expect("Content-Type", /text\/html; charset=UTF-8/i)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }

          expect(res.text).to.contain("<title>People - LingSync.org</title>");
          expect(res.text).to.contain("Interns &amp; Contributors")
          done();
        });
    });
  });

  describe("tutorials", function() {
    it("should display the tutorials", function(done) {
      this.timeout(specIsRunningTooLong);

      supertest(api).get("/tutorials")
        .expect("Content-Type", /text\/html; charset=UTF-8/i)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }

          expect(res.text).to.contain("<title>Tutorials - LingSync.org</title>");
          expect(res.text).to.contain("Dative tutorials")
          expect(res.text).to.contain("Spreadsheet tutorial");
          done();
        });
    });
  });

  describe("projects", function() {
    it("should display the projects", function(done) {
      this.timeout(specIsRunningTooLong);

      supertest(api).get("/projects")
        .expect("Content-Type", /text\/html; charset=UTF-8/i)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }

          expect(res.text).to.contain("<title>Projects - LingSync.org</title>");
          expect(res.text).to.contain("Revitalization Partnership")
          done();
        });
    });
  });

  describe("download", function() {
    it("should display the download", function(done) {
      this.timeout(specIsRunningTooLong);

      supertest(api).get("/download")
        .expect("Content-Type", /text\/html; charset=UTF-8/i)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }

          expect(res.text).to.contain("<title>Install - LingSync.org</title>");
          expect(res.text).to.not.contain("spreadsheet.");
          expect(res.text).to.contain(".org/prototype/_design/prototype/corpus.html")
          expect(res.text).to.contain("/lingllama/lingllama-communitycorpus/search/morphemes:nay%20OR%20gloss:des");
          expect(res.text).to.contain("/community/community-georgian/search/orthography:%E1%83%95%E1%83%98%E1%83%AA%E1%83%98");
          done();
        });
    });
  });
});
