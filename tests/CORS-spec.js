/* globals document */
"use strict";

var CORS;
try {
  /* globals FieldDB */
  CORS = document.CORS || FieldDB.CORS;
} catch (e) {
  try {
    CORS = require("../api/CORSNode").CORS;
    // CORS = require("../api/CORS").CORS;
  } catch (e) {}
}

var specIsRunningTooLong = 5000;

describe("CORS", function() {

  describe("construction", function() {
    it("should be load", function() {
      expect(CORS).toBeDefined();
    });
  });

  xdescribe("errors", function() {

    it("should know if the user is offline", function(done) {
      var options = {
        url: "https://corpusdev.lingsync.org",
        withCredentials: false
      };
      CORS.makeCORSRequest(options).then(function(results) {
        expect(results.couchdb).toEqual("Welcome");
        expect(results.version).toEqual("1.6.1");
        expect(results.vendor.name).toEqual("Homebrew");
      }, function(reason) {
        expect(reason.status).toEqual(600);
        expect(reason.details.url).toEqual(options.url);
        expect(reason.userFriendlyErrors).toEqual(["Unable to contact the server, you appear to be offline."]);
      }).fail(function(exception) {
        console.log(exception.stack);
        expect(exception).toEqual("unexpected exception while testing");
      }).done(done);
    }, specIsRunningTooLong);

    it("should know if the server is offline", function(done) {
      var options = {
        url: "http://localhost:3111",
        method: "POST",
        data: {
          something: "here"
        }
      };
      CORS.makeCORSRequest(options).then(function(results) {
        expect("successfully contacted http://localhost:3111").toBeUndefined();
        expect(results).toBeUndefined();
      }, function(reason) {
        expect(reason.status).toEqual(610);
        expect(reason.details.data).toEqual(options.data);
        expect(reason.details.method).toEqual(options.method);
        expect(reason.details.url).toEqual(options.url);
      }).fail(function(exception) {
        console.log(exception.stack);
        expect(exception).toEqual("unexpected exception while testing");
      }).done(done);
    }, specIsRunningTooLong);

    it("should know if the server is unreachable", function(done) {
      CORS.makeCORSRequest({
        url: "http://ifield.iriscouch.com:5984/_session",
        method: "POST",
        data: {
          name: "public",
          password: "none"
        }
      }).then(function(results) {
        expect("successfully contacted http://localhost:32222").toBeUndefined();
        expect(results).toBeUndefined();
      }, function(reason) {
        expect(reason).toEqual(" ");
      }).fail(function(exception) {
        console.log(exception.stack);
        expect(exception).toEqual("unexpected exception while testing");
      }).done(done);
    }, 20 * 1000);

    it("should return unauthorized", function(done) {
      var options = {
        url: "https://corpusdev.lingsync.org/public-curldemo",
        method: "POST",
        data: {
          id: "test_unauth_post" + Date.now()
        }
      };
      CORS.makeCORSRequest(options).then(function(results) {
        expect("should not have created a doc when not logged in").toBeUndefined();
        expect(results).toBeUndefined();
      }, function(reason) {
        expect(reason.error).toEqual("unauthorized");
        expect(reason.details.id).toEqual(options.data.id);
        expect(reason.status).toEqual(401);
        expect(reason.userFriendlyErrors).toEqual(["You are not authorized to access this db."]);
      }).fail(function(exception) {
        console.log(exception.stack);
        expect(exception).toEqual("unexpected exception while testing");
      }).done(done);
    }, specIsRunningTooLong);

  });

  describe("servers", function() {

    it("should DELETE", function(done) {
      CORS.makeCORSRequest({
        url: "https://corpusdev.lingsync.org/_session",
        method: "DELETE"
      }).then(function(results) {
        expect(results.ok).toEqual(true);
      }, function(reason) {
        expect(reason).toEqual();
      }).fail(function(exception) {
        console.log(exception.stack);
        expect(exception).toEqual("unexpected exception while testing");
      }).done(done);
    }, specIsRunningTooLong);

    it("should GET", function(done) {
      CORS.makeCORSRequest({
        url: "https://corpusdev.lingsync.org/_session",
      }).then(function(results) {
        expect(results.ok).toEqual(true);
        expect(results.userCtx.name).toEqual(null);
        expect(results.userCtx.roles).toEqual([]);
      }, function(reason) {
        expect(reason).toEqual();
      }).fail(function(exception) {
        console.log(exception.stack);
        expect(exception).toEqual("unexpected exception while testing");
      }).done(done);
    }, specIsRunningTooLong);

    it("should POST", function(done) {
      CORS.makeCORSRequest({
        url: "https://corpusdev.lingsync.org/_session",
        method: "POST",
        data: {
          name: "jenkins",
          password: "phoneme"
        }
      }).then(function(results) {
        expect(results.ok).toEqual(true);
        expect(results.name).toEqual("jenkins");
        expect(results.roles.length).toEqual(29);
      }, function(reason) {
        expect(reason).toEqual("unexpected error");
      }).fail(function(exception) {
        console.log(exception.stack);
        expect(exception).toEqual("unexpected exception while testing");
      }).done(done);
    }, specIsRunningTooLong);

    it("should GET html from node", function(done) {
      var options = {
        url: "https://authdev.lingsync.org",
      };
      CORS.makeCORSRequest(options).then(function(results) {
        expect(results).toContain("<!DOCTYPE html>");
      }, function(reason) {
        expect(reason).toEqual("unexpected error");
      }).fail(function(exception) {
        console.log(exception.stack);
        expect(exception).toEqual("unexpected exception while testing");
      }).done(done);
    }, specIsRunningTooLong);

    it("should GET binary from node", function(done) {
      var options = {
        url: "https://speech.lingsync.org/utterances/community-georgian/orive_gi%C9%A3deba/orive_gi%C9%A3deba.png",
      };
      CORS.makeCORSRequest(options).then(function(results) {
        expect(results).toContain(" ");
      }, function(reason) {
        expect(reason).toEqual("unexpected error");
      }).fail(function(exception) {
        console.log(exception.stack);
        expect(exception).toEqual("unexpected exception while testing");
      }).done(done);
    }, specIsRunningTooLong);

    it("should POST json to node", function(done) {
      var options = {
        url: "https://authdev.lingsync.org/register",
        method: "POST",
        data: {
          username: "jenkins",
          password: "phoneme"
        }
      };
      CORS.makeCORSRequest(options).then(function(results) {
        expect(results).toEqual("Register should have replie that jenkins already exists");
      }, function(reason) {
        expect(reason.status).toEqual(409);
        expect(reason.userFriendlyErrors).toEqual(["Username jenkins already exists, try a different username."]);
        expect(reason.details.data).toEqual(options.data);
        expect(reason.details.method).toEqual(options.method);
        expect(reason.details.url).toEqual(options.url);
      }).fail(function(exception) {
        console.log(exception.stack);
        expect(exception).toEqual("unexpected exception while testing");
      }).done(done);
    }, specIsRunningTooLong);

  });

});
