/* globals localStorage */
var Database = require("../../api/corpus/Database").Database;

var specIsRunningTooLong = 5000;

describe("Database", function() {
  it("should be load", function() {
    expect(Database).toBeDefined();
  });

  describe("construction options", function() {
    it("should accept a dbname", function() {
      var db = new Database({
        dbname: "lingallama-communitycorpus"
      });
      expect(db.dbname).toEqual("lingallama-communitycorpus");
    });
  });

  describe("crud", function() {
    it("should be able to return a promise for an item from the database", function(done) {
      var db = new Database({
        dbname: "lingallama-communitycorpus"
      });
      db.get("D093j2ae-akmoi3m-2a3wkjen").then(function() {
        expect(false).toBeTruthy();
      }, function(error) {
        expect(error).toEqual("CORS not supported, your browser is unable to contact the database.");
      }).done(done);
    }, specIsRunningTooLong);

    it("should be able to set the revision number after a save", function(done) {
      var db = new Database({
        dbname: "lingallama-communitycorpus"
      });
      db.set({
        id: "testingdbsave" + Date.now()
      }).then(function(resultingdocument) {
        expect(false).toBeTruthy();
        expect(resultingdocument.rev).toBeDefined();
      }, function(error) {
        expect(error).toEqual("CORS not supported, your browser is unable to contact the database.");
      }).done(done);
    }, specIsRunningTooLong);

    it("should throw an error if remove is requested", function() {
      var db = new Database({
        dbname: "lingallama-communitycorpus"
      });
      expect(function() {
        db.remove("D093j2ae-akmoi3m-2a3wkjen");
      }).toThrow("Deleting data is not permitted.");
    });

    it("should provide delete as a syntactic sugar for remove", function() {
      var db = new Database({
        dbname: "lingallama-communitycorpus"
      });
      expect(function() {
        db.delete("D093j2ae-akmoi3m-2a3wkjen");
      }).toThrow("Deleting data is not permitted.");
    });

  });

  describe("connection", function() {
    it("should not be to resume a login session in Node", function(done) {
      var db = new Database();
      db.resumeAuthenticationSession().then(function() {
        expect(false).toBeTruthy();
      }, function(error) {
        expect(error).toEqual("CORS not supported, your browser is unable to contact the database.");
      }).done(done);

    }, specIsRunningTooLong);

    it("should be able to set the most recent session locally encrypted", function() {
      var db = new Database();
      db.session = {
        "ok": true,
        "userCtx": {
          "name": "lingllama",
          "roles": ["computationalfieldworkshop-group_data_entry_tutorial_reader", "fielddbuser", "jessepollak-spring_2013_field_methods_reader", "lingllama-cherokee_admin", "lingllama-cherokee_commenter", "lingllama-cherokee_reader", "lingllama-cherokee_writer", "lingllama-communitycorpus_admin", "lingllama-firstcorpus_admin", "lingllama-firstcorpus_commenter", "lingllama-firstcorpus_reader", "lingllama-firstcorpus_writer", "lingllama-test_corpus_admin", "lingllama-test_corpus_commenter", "lingllama-test_corpus_reader", "lingllama-test_corpus_writer", "teammatetiger-firstcorpus_commenter", "teammatetiger-firstcorpus_reader", "teammatetiger-firstcorpus_writer", "lingllama-communitycorpus_commenter", "lingllama-communitycorpus_reader", "lingllama-communitycorpus_writer"]
        },
        "info": {
          "authentication_db": "_users",
          "authentication_handlers": ["oauth", "cookie", "default"],
          "authenticated": "cookie"
        }
      };
      var encryptedSession;
      try {
        encryptedSession = localStorage.getItem("_session");
      } catch (e) {
        encryptedSession = db._session;
      }
      expect(encryptedSession).toContain("confidential:");
    });

    it("should be able to get the most recent session locally encrypted", function() {
      var db = new Database();
      try {
        localStorage.setItem("_session", "confidential:VTJGc2RHVmtYMTlUQWo0ekxXUzBXZUwvQzc2eGdGTng0K1B4Q2dqNVI3eU9NekFpSWkxa1kxVGdxRndTVHJPcXVMNFFjU0RDYk5YRnYwV0VsRmprT1pnUWpQR3dxK2VmYTFaaUlXWTdHY3VYWGwwZ1pTNzM3WmMvclVFV2d3ck0vZm9QZjRFZDg4SENyOS9LS3JDTHFzczVSZWpRUzU3MVd5bG1zbVVJU2hXUmdiTk9NTFBkcmczUWpzQWIvbi8zbm45WlVsVnM5elZ3eTVOYzVpR09QeXVoazV6UThPVmhhU0puaU9FeDg0UjFMNVRneC8rcWw5VmdtTTcxOTdXMUlHOGE3OXVWclc1NG9meldSUTdTaEcrdUpEWDE3ZEJBQnREZFYvVWtLMTFKSFVQMUNTdktEUm1CWlVnK3I4QjNvMWo2RDU1c2gvLzFkTEE5ck9RTzYzSWtjZllnQWJSZ1lMbHh2UUU5SEFqcTdLTmhRbUdkMGh5cGZ5N1Y1RDZ3Nlh2RUlZeldMeXpZVnU4VkpmOWY0WCt3T1ZvK2VzRjdQWlhpMS9ONHNDQldyNElLWnJFRzdVZVNZSzBWN3Z1eFBOdkJESVRzN1dhMkNTY2dYM3VJZ09OWTFIMjZyOTdZYUl2Q0Y5SHZJYk9saHV1eEJQaExoeTg0R3l6VVA4YVd2RERmMVlwWW5rZFNKaGRtZXBmNURwT1U4YUpKRmptMXliSGh0eVpUbCtSNjAxcUdWZHJSWHVBQmV6eWUzVE5YendYSnNBYWlPdnZueGpQbFg5aTI2cGt5eFkzWTJQR2FHS3FuMWZvalNzR09VWnZjOGRiRXFmZER0dG1CWGxza3Y2Q2VjRk1wVzI5VTdIaENnVWNMWUNzOFdEZ0dZZFU5NXFsUk5xbHJXT3hEdkE2ZzdnSTM3VTZsVGt2QWV0VFAyaW9PbHpJaGNyMHF4U3hPVUNOV3lQeVh1bXc5aldDdnFxQnIyUzcxc21vajVDUHZzdHNrUFVCcU9TVElTNTRleFBTUUNFOFVRb0Y1ZUJUSjJvM1FzRVBJd2ZodzNVOTllaXpRK2pCcnQ1YkVYQUlhYWR5YlBGU0t4bnpHcUQ1dzJmajBZZldvdFlFckNOTVU0b1RlY2JmbkhwaTFyMWMwaVFRbDNCMllTOWJDTC85MkhjdXFpeFVUTTZjUmc1SjhLVnpES1gzK2lZR2VyeVV5RFRHeE5FZm5RTU96Zis1dlZvRWxnOVlQRXl3cGhFRG14SXN6bWxHV0NtV1R2NXI4ZllLUlNpTklsdWE0UFFhZ3RsaVppZUZnWmtPQzRHaGYrS0ZRSHE3TGV3bEV3aDg3dldPVFlWN0dsdStWd0xIWFhrcVBPMElleXNPcXkvY0JidDZQRGszUzI4M3RybmFGczZzQ004SEx5aUlmYUpqSDRkaGtEdXNqRmh3aGs1SEY4d3k0RStYY1BibU12YXpMK3BvUmlzakZuQ29EM2pCbVpyVnB2Nm1tQ2t6N1Zma1RyR3NsU2lGR001em4yZkZzdEN1VlhJWEhRdDZ6YmpSLzF2SHZ1c1NEZytzK2R0M2t5YUs3OUlhSHpKa1Z1cFlvS05uT0FMaXd1WTV2MUZuQmNOUXZJS0RpaitaMVdhZzIwL2puWUE9PQ==");
      } catch (e) {
        db._session = "confidential:VTJGc2RHVmtYMTlUQWo0ekxXUzBXZUwvQzc2eGdGTng0K1B4Q2dqNVI3eU9NekFpSWkxa1kxVGdxRndTVHJPcXVMNFFjU0RDYk5YRnYwV0VsRmprT1pnUWpQR3dxK2VmYTFaaUlXWTdHY3VYWGwwZ1pTNzM3WmMvclVFV2d3ck0vZm9QZjRFZDg4SENyOS9LS3JDTHFzczVSZWpRUzU3MVd5bG1zbVVJU2hXUmdiTk9NTFBkcmczUWpzQWIvbi8zbm45WlVsVnM5elZ3eTVOYzVpR09QeXVoazV6UThPVmhhU0puaU9FeDg0UjFMNVRneC8rcWw5VmdtTTcxOTdXMUlHOGE3OXVWclc1NG9meldSUTdTaEcrdUpEWDE3ZEJBQnREZFYvVWtLMTFKSFVQMUNTdktEUm1CWlVnK3I4QjNvMWo2RDU1c2gvLzFkTEE5ck9RTzYzSWtjZllnQWJSZ1lMbHh2UUU5SEFqcTdLTmhRbUdkMGh5cGZ5N1Y1RDZ3Nlh2RUlZeldMeXpZVnU4VkpmOWY0WCt3T1ZvK2VzRjdQWlhpMS9ONHNDQldyNElLWnJFRzdVZVNZSzBWN3Z1eFBOdkJESVRzN1dhMkNTY2dYM3VJZ09OWTFIMjZyOTdZYUl2Q0Y5SHZJYk9saHV1eEJQaExoeTg0R3l6VVA4YVd2RERmMVlwWW5rZFNKaGRtZXBmNURwT1U4YUpKRmptMXliSGh0eVpUbCtSNjAxcUdWZHJSWHVBQmV6eWUzVE5YendYSnNBYWlPdnZueGpQbFg5aTI2cGt5eFkzWTJQR2FHS3FuMWZvalNzR09VWnZjOGRiRXFmZER0dG1CWGxza3Y2Q2VjRk1wVzI5VTdIaENnVWNMWUNzOFdEZ0dZZFU5NXFsUk5xbHJXT3hEdkE2ZzdnSTM3VTZsVGt2QWV0VFAyaW9PbHpJaGNyMHF4U3hPVUNOV3lQeVh1bXc5aldDdnFxQnIyUzcxc21vajVDUHZzdHNrUFVCcU9TVElTNTRleFBTUUNFOFVRb0Y1ZUJUSjJvM1FzRVBJd2ZodzNVOTllaXpRK2pCcnQ1YkVYQUlhYWR5YlBGU0t4bnpHcUQ1dzJmajBZZldvdFlFckNOTVU0b1RlY2JmbkhwaTFyMWMwaVFRbDNCMllTOWJDTC85MkhjdXFpeFVUTTZjUmc1SjhLVnpES1gzK2lZR2VyeVV5RFRHeE5FZm5RTU96Zis1dlZvRWxnOVlQRXl3cGhFRG14SXN6bWxHV0NtV1R2NXI4ZllLUlNpTklsdWE0UFFhZ3RsaVppZUZnWmtPQzRHaGYrS0ZRSHE3TGV3bEV3aDg3dldPVFlWN0dsdStWd0xIWFhrcVBPMElleXNPcXkvY0JidDZQRGszUzI4M3RybmFGczZzQ004SEx5aUlmYUpqSDRkaGtEdXNqRmh3aGs1SEY4d3k0RStYY1BibU12YXpMK3BvUmlzakZuQ29EM2pCbVpyVnB2Nm1tQ2t6N1Zma1RyR3NsU2lGR001em4yZkZzdEN1VlhJWEhRdDZ6YmpSLzF2SHZ1c1NEZytzK2R0M2t5YUs3OUlhSHpKa1Z1cFlvS05uT0FMaXd1WTV2MUZuQmNOUXZJS0RpaitaMVdhZzIwL2puWUE9PQ==";
      }
      expect(db.session.userCtx.name).toEqual("lingllama");
    });
  });

  describe("login", function() {
    it("should be able to login", function(done) {
      var db = new Database();
      db.login({
        username: "lingllama",
        password: "phoneme"
      }).then(function() {
        expect(false).toBeTruthy();
      }, function(error) {
        expect(error).toEqual("CORS not supported, your browser is unable to contact the database.");
      }).done(done);

    }, specIsRunningTooLong);
  });

  describe("logout", function() {
    it("should be able to logout", function(done) {
      var db = new Database();
      db.login({
        username: "lingllama",
        password: "phoneme"
      }).then(function() {
        expect(false).toBeTruthy();
        db.logout().then(function() {
          expect(db.session).toBeUndefined();
        }, function(error) {
          expect(error).toEqual("CORS not supported, your browser is unable to contact the database.");
        });
      }, function(error) {
        expect(error).toEqual("CORS not supported, your browser is unable to contact the database.");
      }).done(done);
    }, specIsRunningTooLong);
  });

  describe("register", function() {
    it("should be able to register", function(done) {
      var db = new Database();
      db.register({
        username: "testinganonymous" + Date.now(),
        password: "morpheme"
      }).then(function() {
        expect(false).toBeTruthy();

      }, function(error) {
        expect(error).toEqual("CORS not supported, your browser is unable to contact the database.");
      }).done(done);
    }, specIsRunningTooLong);
  });

});

xdescribe("Database: as a team we want to be able to go back in time in the db revisions", function() {
  it("should be able to import from GitHub repository", function() {
    expect(true).toBeTruthy();
  });
});

xdescribe("Database: as a user I want to be able to import via drag and drop", function() {
  it("should detect drag and drop", function() {
    expect(true).toBeTruthy();
  });
});

xdescribe("Database: as a user I want to be able to go offline, but still have the most recent objects in my db available", function() {
  it("should have the most recent entries available", function() {
    expect(true).toBeTruthy();
  });
  it("should store the db offine", function() {
    expect(true).toBeTruthy();
  });
});
