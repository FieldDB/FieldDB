/* globals localStorage */
"use strict";

var Authentication;
try {
  /* globals FieldDB */
  if (FieldDB) {
    Authentication = FieldDB.Authentication;
  }
} catch (e) {}
Authentication = Authentication || require("./../../api/authentication/Authentication").Authentication;

var SAMPLE_USERS = require("./../../sample_data/user_v1.22.1.json");
var specIsRunningTooLong = 5000;

describe("Authentication ", function() {

  beforeEach(function() {
    try {
      // localStorage.clear();
    } catch (e) {}
  });

  it("should load", function() {
    expect(Authentication).toBeDefined();
  });

  it("should look up the user on the server if the app is online", function(done) {
    var auth = new Authentication();
    expect(auth).toBeDefined();

    auth.login({
      username: "jenkins",
      password: "phoneme",
      authUrl: "https://auth.lingsync.org"
    }).then(function(result) {
      auth.debug("Done authentication");
      expect(result).toBeDefined();
      expect(result).toEqual(auth.user);
      expect(auth.user.username).toEqual("jenkins");
      expect(auth.user._rev).toBeDefined();
      expect(auth.user.researchInterest).toEqual("Automated testing :)");
    }, function(error) {
      auth.debug("Failed authentication");
      expect(error).toBeDefined();
      if (error.userFriendlyErrors[0] === "CORS not supported, your browser is unable to contact the database.") {
        expect(error.userFriendlyErrors).toEqual(["CORS not supported, your browser is unable to contact the database."]);
      } else {
        expect(error.userFriendlyErrors).toEqual(["Unable to contact the server, are you sure you're not offline?"]);
      }
    }).done(done);

  }, specIsRunningTooLong * 2);

  describe("create corpora for users", function() {

    it("should be able to create a new corpus", function(done) {
      var auth = new Authentication({
        user: {
          username: "jenkins",
          rev: "123-1234",
          corpora: [{
            "protocol": "http://",
            "domain": "localhost",
            "port": "5984",
            "dbname": "jenkins-long_distance_anaphors_in_quechua",
            "path": "",
            "authUrl": "https://localhost:3183",
            "userFriendlyServerName": "Localhost"
          }, {
            "protocol": "http://",
            "domain": "localhost",
            "port": "5984",
            "pouchname": "jenkins-firstcorpus",
            "path": "",
            "authUrl": "https://localhost:3183",
            "userFriendlyServerName": "Localhost"
          }]
        }
      });
      expect(auth).toBeDefined();

      auth.newCorpus({
        username: "jenkins",
        password: "phoneme",
        title: "Long distance anaphors in Quechua"
      }).then(function(result) {
        auth.debug("Done creating new corpus");
        expect(result).toBeDefined();
        // expect(result.dbname).toEqual("jenkins-long_distance_anaphors_in_quechua");
      }, function(error) {
        auth.debug("Failed creating new corpus");
        expect(error).toBeDefined();
        if (error.userFriendlyErrors[0] === "CORS not supported, your browser is unable to contact the database.") {
          expect(error.userFriendlyErrors).toEqual(["CORS not supported, your browser is unable to contact the database."]);
        } else {
          expect(error.userFriendlyErrors).toEqual(["Unable to contact the server, are you sure you're not offline?"]);
        }
      }).done(done);

    }, specIsRunningTooLong);


    it("should be require the user to authenticate to create a new corpus", function(done) {
      var auth = new Authentication();
      expect(auth).toBeDefined();

      auth.newCorpus({
        username: "jenkins",
        title: "Long distance anaphors in Quechua"
      }).then(function(result) {
        auth.debug("Done creating new corpus");
        expect(result).toBeDefined();
        expect(result).toEqual("Cannot be succesful in jasmine-node");
      }, function(error) {
        auth.debug("Failed creating new corpus");
        expect(error).toBeDefined();
        expect(error.userFriendlyErrors).toEqual(["You must enter your password to prove that that this is you."]);
      }).done(done);

    }, specIsRunningTooLong);


    it("should require a new corpus title", function(done) {
      var auth = new Authentication();
      expect(auth).toBeDefined();

      auth.newCorpus({
        username: "jenkins",
        password: "phoneme"
      }).then(function(result) {
        auth.debug("Done creating new corpus");
        expect(result).toBeDefined();
        expect(result).toEqual("Cannot be succesful in jasmine-node");
      }, function(error) {
        auth.debug("Failed creating new corpus");
        expect(error).toBeDefined();
        expect(error.userFriendlyErrors).toEqual(["Please supply a title for your new corpus."]);
      }).done(done);

    }, specIsRunningTooLong);

  });

  describe("Offline", function() {
    it("should use a different random encryption key for each device", function() {
      var auth = new Authentication();
      expect(auth).toBeDefined();
    });

    it("should try to look up the user locally upon app load", function(done) {
      var auth = new Authentication();
      expect(auth).toBeDefined();

      expect(auth.resumingSessionPromise).toBeDefined();
      auth.resumingSessionPromise.then(function(result) {
        expect(result).toBe(auth.user);
        expect(auth.user).toBeDefined();
      }, function(error) {
        expect(error).toBeDefined();
        if (error.status === 500) {
          expect(error.userFriendlyErrors).toEqual(["Error saving a user in the database. "]);
        } else if (error.status === 401) {
          expect(error.userFriendlyErrors).toEqual(["Please login."]);
        } else if (error.status === 400) {
          expect(error.userFriendlyErrors).toEqual(["CORS not supported, your browser is unable to contact the database."]);
        } else if (error.status === 0) {
          expect(error.userFriendlyErrors).toEqual(["Unable to contact the server, are you sure you're not offline?"]);
        } else {
          expect(error).toBeFalsy();
          expect(error.status).toBeTruthy();
        }
      }).done(done);

    }, specIsRunningTooLong);


    it("setting the user should indirectly cause the user to be saved locally", function(done) {
      var auth = new Authentication({
        // debugMode: true
      });
      expect(auth).toBeDefined();
      auth.user = {
        username: "sapir",
        // debugMode: true
      };
      expect(auth.user.fieldDBtype).toEqual("User");
      expect(auth.userMask).toBeUndefined();

      expect(SAMPLE_USERS[0].researchInterest).toContain("Phonemes");
      auth.user = JSON.parse(JSON.stringify(SAMPLE_USERS[0]));
      expect(auth.user).toBeDefined();
      expect(auth.user.researchInterest).toContain("Phonemes");

      /* should be saved */
      if (auth.user.constructor.prototype.temp) {
        expect(auth.user.constructor.prototype.temp).toBeDefined();
        expect(auth.user.constructor.prototype.temp[auth.user.constructor.prototype.temp.X09qKvcQn8DnANzGdrZFqCRUutIi2C + "sapir"]).toBeDefined();
        expect(auth.user.constructor.prototype.temp[auth.user.constructor.prototype.temp.X09qKvcQn8DnANzGdrZFqCRUutIi2C + "sapir"]).toContain("confidential");
      } else {
        expect(localStorage.getItem(localStorage.getItem("X09qKvcQn8DnANzGdrZFqCRUutIi2C") + "sapir")).toBeDefined();
        expect(localStorage.getItem(localStorage.getItem("X09qKvcQn8DnANzGdrZFqCRUutIi2C") + "sapir")).toContain("confidential");
      }

      var anotherAuthLoad = new Authentication({
        user: {
          username: "sapir"
        }
      });
      expect(anotherAuthLoad.user.warnMessage).toContain("Refusing to save a user doc which is incomplete");
      anotherAuthLoad.user.warnMessage = "";

      // user has default prefs for now
      expect(anotherAuthLoad.user.prefs).toBeUndefined();
      expect(anotherAuthLoad.user.fieldDBtype).toEqual("User");

      anotherAuthLoad.user.fetch().then(function() {
        if (anotherAuthLoad.user.constructor.prototype.temp) {
          expect(anotherAuthLoad.user.constructor.prototype.temp)
            .toEqual(anotherAuthLoad.user.constructor.prototype.temp);
          expect(anotherAuthLoad.user.constructor.prototype.temp[
              anotherAuthLoad.user.constructor.prototype.temp.X09qKvcQn8DnANzGdrZFqCRUutIi2C + "sapir"
            ])
            .toEqual(anotherAuthLoad.user.constructor.prototype.temp[
              anotherAuthLoad.user.constructor.prototype.temp.X09qKvcQn8DnANzGdrZFqCRUutIi2C + "sapir"
            ]);
        } else {
          expect(localStorage.getItem(localStorage.getItem("X09qKvcQn8DnANzGdrZFqCRUutIi2C") + "sapir")).toBeDefined();
          expect(localStorage.getItem(localStorage.getItem("X09qKvcQn8DnANzGdrZFqCRUutIi2C") + "sapir")).toContain("confidential");
        }
        expect(anotherAuthLoad.user.researchInterest).toContain("Phonemes");
        // user has their own prefs now
        expect(anotherAuthLoad.user.prefs).toBeDefined();
        expect(anotherAuthLoad.user.prefs.unicodes.length).toEqual(20);
        expect(anotherAuthLoad.user.prefs.numVisibleDatum).toEqual(2);
      }).done(done);

    }, specIsRunningTooLong);


    it("should be able to confirm a users identity offline", function(done) {
      var auth = new Authentication({
        user: {
          rev: "11-b56759be3f9f76762c64bb80dd95d23",
          username: "auserwhoknowstheirpassword",
          salt: "$2a$10$UsUudKMbgfBQzn5SDYWyFe",
          hash: "$2a$10$UsUudKMbgfBQzn5SDYWyFe/b47olanTrn.T4txLY/7hD08eJqrQxa",
          lastSyncWithServer: Date.now()
        }
      });
      auth.user.authenticated = true;

      auth.confirmIdentity({
        password: "phoneme"
      }).then(function(confirmation) {
        expect(confirmation).toBeDefined();
        expect(confirmation.info).toBeDefined();
        expect(confirmation.info[0]).toEqual("Verified offline.");
      }, function(error) {
        console.log(error);
        expect(false).toBeTruthy();
      }).fail(function(error) {
        console.log(error.stack);
        expect(false).toBeTruthy();
      }).done(done);
    }, specIsRunningTooLong);

    it("should be reject a users identity offline", function(done) {
      var auth = new Authentication({
        user: {
          rev: "11-b56759be3f9f76762c64bb80dd95d23",
          username: "aforgetfuluser",
          salt: "$2a$10$UsUudKMbgfBQzn5SDYWyFe",
          hash: "$2a$10$UsUudKMbgfBQzn5SDYWyFe/b47olanTrn.T4txLY/7hD08eJqrQxa",
          lastSyncWithServer: Date.now()
        }
      });
      auth.user.authenticated = true;

      auth.confirmIdentity({
        password: "wrongpassword"
      }).then(function(confirmation) {
        expect(confirmation).toBeDefined();
        expect(false).toBeTruthy();
      }, function(error) {
        expect(error).toBeDefined();
        expect(error.userFriendlyErrors).toBeDefined();
        expect(error.userFriendlyErrors[0]).toEqual("Sorry, this doesn't appear to be you.");
      }).fail(function(error) {
        console.log(error.stack);
        expect(false).toBeTruthy();
      }).done(done);
    }, specIsRunningTooLong);


    it("should be detect an invalid user", function(done) {
      var auth = new Authentication({
        user: {
          rev: "11-b56759be3f9f76762c64bb80dd95d23",
          username: "abrokendownloadeduser",
          salt: "$2a$10$UsUudKMbgfBQzn5SDYWyFe",
          hash: "$2a$10$UsUudKMbgfBQzn5SDYWyFe/biaoejo3iD08eJqrQxa",
          lastSyncWithServer: Date.now()
        }
      });
      auth.user.authenticated = true;

      auth.confirmIdentity({
        password: "phoneme"
      }).then(function(confirmation) {
        expect(confirmation).toBeDefined();
        expect(false).toBeTruthy();
      }, function(error) {
        expect(error).toBeDefined();
        expect(error.userFriendlyErrors).toBeDefined();
        expect(error.userFriendlyErrors[0]).toEqual("This app has errored while trying to confirm your identity. Please report this 2892346.");
      }).fail(function(error) {
        console.log(error.stack);
        expect(false).toBeTruthy();
      }).done(done);
    }, specIsRunningTooLong);


  });

  describe("Server interaction", function() {

    it("should be able to register a user", function(done) {
      var auth = new Authentication();
      expect(auth).toBeDefined();

      auth.register({
        username: "jenkins",
        password: "phoneme",
        confirmPassword: "phoneme",
        researchInterest: "Automated testing :)"
      }).then(function(result) {
        auth.debug("Done registering");
        expect(result).toBeDefined();
        expect(result).toEqual(auth.user);
        expect(auth.user.username).toEqual("jenkins");
        expect(auth.user.researchInterest).toEqual("Automated testing :)");
        expect(auth.user.rev).toContain("1-");
      }, function(error) {
        auth.debug("Failed registering");
        expect(error).toBeDefined();
        if (error.status === 500) {
          expect(error.userFriendlyErrors).toEqual(["Error saving a user in the database. "]);
        } else if (error.status === 409) {
          expect(error.userFriendlyErrors).toEqual(["Username jenkins already exists, try a different username."]);
        } else if (error.status === 400) {
          expect(error.userFriendlyErrors).toEqual(["CORS not supported, your browser is unable to contact the database."]);
        } else if (error.status === 0) {
          expect(error.userFriendlyErrors).toEqual(["Unable to contact the server, are you sure you're not offline?"]);
        } else {
          expect(false).toBeTruthy();
        }
      }).done(done);

    }, specIsRunningTooLong);


    it("should not log the user in if the server replies not-authenticated", function(done) {
      var auth = new Authentication();
      try {
        auth.login({
          username: "lingllama",
          password: "hypothesis"
        }).then(function(response) {
          console.error("should not land in the sucess area. ", response);
          expect(true).toBeFalsy();
        }, function(error) {
          auth.debug("Failed authentication");
          expect(error).toBeDefined();
          if (auth.user) {
            expect(auth.user.authenticated).toEqual(false);
          }
          if (error.status === 500) {
            expect(error.userFriendlyErrors).toEqual([" "]);
          } else if (error.status === 401) {
            expect(error.userFriendlyErrors).toEqual(["Username or password is invalid. Please try again."]);
          } else if (error.status === 400) {
            expect(error.userFriendlyErrors).toEqual(["CORS not supported, your browser is unable to contact the database."]);
          } else if (error.status === 0) {
            expect(error.userFriendlyErrors).toEqual(["Unable to contact the server, are you sure you're not offline?"]);
          } else {
            expect(false).toBeTruthy();
          }
        }).done(done);
      } catch (e) {
        expect(e).toEqual(" ");
        done();
      }
    }, specIsRunningTooLong);

    it("should not authenticate if login good username bad password", function(done) {
      var auth = new Authentication();
      try {
        auth.login({
          username: "lingllama",
          password: "hypothesis"
        }).then(function(response) {
          auth.debug("Done authentication");
          console.error("should not land in the sucess area. ", response);
          expect(true).toBeFalsy();
        }, function(error) {
          auth.debug("Failed authentication");
          if (auth.user) {
            expect(auth.user.authenticated).toEqual(false);
          }
          expect(error).toBeDefined();
          if (error.status === 500) {
            expect(error.userFriendlyErrors).toEqual([" "]);
          } else if (error.status === 401) {
            expect(error.userFriendlyErrors).toEqual(["Username or password is invalid. Please try again."]);
          } else if (error.status === 400) {
            expect(error.userFriendlyErrors).toEqual(["CORS not supported, your browser is unable to contact the database."]);
          } else if (error.status === 0) {
            expect(error.userFriendlyErrors).toEqual(["Unable to contact the server, are you sure you're not offline?"]);
          } else {
            expect(false).toBeTruthy();
          }
        }).done(done);
      } catch (e) {
        expect(e).toEqual(" ");
        done();
      }

    }, specIsRunningTooLong);

    it("should not authenticate if login bad username any password", function(done) {
      var auth = new Authentication();
      try {
        auth.login({
          username: "sapri",
          password: "phoneme"
        }).then(function(response) {
          auth.debug("Done authentication");
          console.error("should not land in the sucess area. ", response);
          expect(true).toBeFalsy();
        }, function(error) {
          auth.debug("Failed authentication");
          if (auth.user) {
            expect(auth.user.authenticated).toEqual(false);
          }
          expect(error).toBeDefined();
          if (error.status === 500) {
            expect(error.userFriendlyErrors).toEqual([" "]);
          } else if (error.status === 401) {
            expect(error.userFriendlyErrors).toEqual(["Username or password is invalid. Please try again."]);
          } else if (error.status === 400) {
            expect(error.userFriendlyErrors).toEqual(["CORS not supported, your browser is unable to contact the database."]);
          } else if (error.status === 0) {
            expect(error.userFriendlyErrors).toEqual(["Unable to contact the server, are you sure you're not offline?"]);
          } else {
            expect(false).toBeTruthy();
          }
        }).done(done);
      } catch (e) {
        expect(e).toEqual(" ");
        done();
      }
    }, specIsRunningTooLong);

  });

});
