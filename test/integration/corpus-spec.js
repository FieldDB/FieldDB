"use strict";
var expect = require("chai").expect;
var supertest = require("supertest");
var specIsRunningTooLong = 5000;

var api = require("../../server");

describe("/v1", function() {
  describe("GET /community/georgian", function() {
    it("should display the users profile and corpus details", function(done) {
      var testApp = supertest(api).get("/community/georgian");

      // The react ap contacts the api durring server side render
      process.env.API_BASE_URL = 'http://127.0.0.1:' + testApp.app.address().port;

      testApp
        .expect("Content-Type", /text\/html; charset=UTF-8/i)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }

          expect(res.text).to.contain("<title data-react-helmet=\"true\">Georgian Together - Georgian Together - LingSync.org</title>");
          expect(res.text).to.match(/<h1[^>]*>Georgian Together<\/h1>/);
          expect(res.text).to.contain("community");
          expect(res.text).to.contain("Interests");
          expect(res.text).to.contain("This is the community corpus where Georgian Together can share their examples");
          expect(res.text).to.contain("Affiliation");
          expect(res.text).to.contain("Description");

          expect(res.text).to.contain("https://secure.gravatar.com/avatar/968b8e7fb72b5ffe2915256c28a9414c.jpg?s=200&amp;d=identicon&amp;r=pg");
          expect(res.text).to.contain("https://secure.gravatar.com/avatar/daa4beb95070a68f948c550cee3254bd.jpg?s=96&amp;d=retro&amp;r=pg");

          expect(res.text).to.contain("To install the Georgian Together app");
          expect(res.text).to.contain("notify the author(s) of the corpus (apps");
          expect(res.text).to.match(/©.*Georgian Together Users.*-.*2017/);

          done();
        });
    }, specIsRunningTooLong);
  });
});
