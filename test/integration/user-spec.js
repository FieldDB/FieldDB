"use strict";
var expect = require("chai").expect;
var supertest = require("supertest");
var specIsRunningTooLong = 5000;

var api = require("../../server");

describe("/v1", function() {
  describe("GET lingllama", function() {
    it("should display the users profile and corpora", function(done) {
      this.timeout(specIsRunningTooLong);

      var testApp = supertest(api).get("/lingllama");

      // The react ap contacts the api durring server side render
      process.env.API_BASE_URL = "http://127.0.0.1:" + testApp.app.address().port;

      testApp
        .expect("Content-Type", /text\/html; charset=UTF-8/i)
        .expect(200)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }

          expect(res.text).to.contain("<title data-react-helmet=\"true\">Ling Llama - LingSync.org</title>");
          expect(res.text).to.contain("https://secure.gravatar.com/avatar/54b53868cb4d555b804125f1a3969e87.jpg?s=200&amp;d=identicon&amp;r=pg");
          expect(res.text).to.contain("Ling Llama");
          expect(res.text).to.contain("lingllama");
          expect(res.text).to.contain("Interests");
          expect(res.text).to.contain("Memes");
          expect(res.text).to.contain("Affiliation");
          expect(res.text).to.contain("Description");

          expect(res.text).to.contain("I&#x27;m a sample user, anyone can log in as me");
          expect(res.text).to.contain("https://secure.gravatar.com/avatar/4d3b96ec20ff9cdbf4910ea58fcb3a4a.jpg?s=96&amp;d=retro&amp;r=pg");
          expect(res.text).to.contain("https://secure.gravatar.com/avatar/948814f0b1bc8bebd701a9732ab3ebbd.jpg?s=96&amp;d=retro&amp;r=pg");
          expect(res.text).to.contain("https://secure.gravatar.com/avatar/948814f0b1bc8bebd701a9732ab3ebbd.jpg?s=96&amp;d=retro&amp;r=pg");

          expect(res.text).to.contain("CommunityCorpus");
          expect(res.text).to.contain("This is a corpus which is editable by anyone in the ");
          expect(res.text).to.contain("Private Corpus");
          expect(res.text).to.match(/©.*lingllama.*2012.*-.*2017/);

          done();
        });
    });
  });
});
