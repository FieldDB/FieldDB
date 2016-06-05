define([
  "backbone",
  "authentication/Authentication",
  "sinon"
], function(
  Backbone,
  Authentication,
  sinon
) {
  "use strict";

  function registerTests() {
    describe("Authentication ", function() {
      describe("initialization", function() {
        it("should load the decrypter for the most recent user", function() {
          var authentication = new Authentication({
            filledWithDefaults: true
          });

          expect(authentication).toBeDefined();
          expect(authentication.get("confidential")).toBeDefined();
          expect(authentication.get("confidential").get("secretkey")).toBeDefined();
        });
      });

      it("should look up the user on the server if the app is online", function() {
        expect(Authentication).toBeDefined();
      });

      it("should look up the user locally if the app is offline", function() {
        expect(Authentication).toBeDefined();
      });

      it("should not log the user in if the server replies not-authenticated", function() {
        expect(Authentication).toBeDefined();
      });

      describe("As a team I would like users to be authenticated", function() {
        var authentication;

        beforeEach(function() {
          window.alert = sinon.spy();
          window.app = {
            changePouch: sinon.spy()
          };

          authentication = new Authentication({
            confidential: new Authentication.prototype.internalModels.confidential({})
          });
        });

        it("should not authenticate if login good username bad password", function(done) {
          authentication.authenticate(new Backbone.Model({
            username: "lingllama",
            password: "hypothesis"
          }), function() {
            expect(authentication.get("state")).not.toEqual("renderLoggedIn");

            done();
          }, function(message) {
            expect(message).toEqual("Username or password is invalid. Please try again.");

            done();
          });
        });

        it("should not authenticate if login bad username any password", function(done) {
          authentication.authenticate(new Backbone.Model({
            username: "sapri",
            password: "phoneme"
          }), function() {
            expect(authentication.get("state")).not.toEqual("renderLoggedIn");

            done();
          }, function(message) {
            expect(message).toEqual("Username or password is invalid. Please try again.");

            done();
          });
        });

        it("should authenticate if login good username good password", function(done) {
          authentication.authenticate(new Backbone.Model({
            username: "lingllama",
            password: "phoneme"
          }), function(sucessful) {
            expect(sucessful).toEqual(true);
            expect(authentication.get("state")).toEqual("renderLoggedIn");

            done();
          }, function(err) {
            expect(err).toBeUndefined();

            done();
          });
        }, 10 * 1000);
      });
    });
  }

  return {
    describe: registerTests
  };
});
