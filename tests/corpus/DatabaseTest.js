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
    it("should not be to resume a login connection in Node", function(done) {
      var db = new Database();
      db.resumeAuthenticationSession().then(function() {
        expect(false).toBeTruthy();
      }, function(error) {
        expect(error).toEqual("CORS not supported, your browser is unable to contact the database.");
      }).done(done);

    }, specIsRunningTooLong);

    it("should be able to set the most recent connection locally encrypted", function() {
      var db = new Database();
      db.connectionInfo = {
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
      var encryptedConnectionInfo;
      try {
        encryptedConnectionInfo = localStorage.getItem("_connectionInfo");
      } catch (e) {
        encryptedConnectionInfo = db._connectionInfo;
      }
      expect(encryptedConnectionInfo).toContain("confidential:");
    });

    it("should be able to get the most recent connection info locally encrypted", function() {
      var db = new Database();
      try {
        localStorage.setItem("_connectionInfo", "confidential:VTJGc2RHVmtYMTlEd0dwSVVobmVzaXI4L3pKV0YvSmZZd0p0SVByQ1dOdDFyeHdTbkxLVUdUUzNta3ZWYkliMVdDYUxrOG5iYXM1bzU3VVNIOHBMcG85d21neTFLWTZoNlY0MlFuOUdCK2UxU0JTMEFQL21ubldkSjlYUXNZZVR5V2JFTHNCNWdRL0dBL2hVRldRSExESlVYWjVzcitQTXVqTFZWcEczbHJHRWJJckoyazNmdWx4bUdyTThFcEsrcEJpRCtHaUwvQ2tNK0lwbFhJOWQ4NmMyNjRSZ0lIekY4SWFady9YUmVta1E0K3B0M1VyZHhMWWc3TXNISTdvL0tNRmEyeEFZMmMwbWhacDBFOHNXK0FrQ1NkcjhraEZwdWExcVpZTWVFaVRFTS96djBXY2d0c3RkcWhldjdZY1A3bEhZVEtYYVBIK0Q5MEMxaE1KbGp3eFRWeDIwbDROZHJEVHRhUGRvTllmU2VRd0dPbWgrQTArQ1plTWZGSDJpcmlBM1NvNUNEMUs4aUR3bFU5YUpYUmg0THZMbEdkb1dYVWJwb3hKOEhVVkdjWnRzLzVFbTFjc3o1M3ZBdTZoTXJJRlFmdmJDam0wVmxNTk93TXVxS1VITy91MDdweXMrZjM3RlBUT2hBREYrb0RFUmJmQ1A5bVo2U2RORXFZc0ZLS045clpBR3BHUGVITnlxZHZUZzVEN2tTYkdaM3FsaGpkUG5TVGt6aWxwSHNCUWxBeStEZ2x0WjI2cTQrdzhrb3EzTU5LZ1JvUjY4MFFHNlBDN084N2oxK1JFN0llbVArMCtObmF5MFNiMFgvNXhpd3FJaTJTVU1GK3ozc0pHTHFyL2ZJY051YlpQdGlCS3UreVhmMjU0OWdPMHY0bzFLY0g2U1BRVnlUVFRCb0ViL3MvT2hBQnN5RHdYUFhpQjJ5ZkdSS0RISy9jUGN1QzVrU3k0dTBKMWxMaXBGenpVYVlZbmpMQ3pCZGZENUQ5NHlGSTBBdnZDaGdJNEN6NFV6TWd0WkRSTVc3eVhoVXBIdXJTRFhwbTlHMFczRDVQOEtvSjZqYXA0VmlqRENIK1lpNjZmbTBBYlZIRW1CV09QLzBxaWMyWUJJVUUxT2xHby8vajJhK1BFYjVEMzgvYVVBM2tqaFBKTkJIUytPSGZTM2s4NTBHQjNKTGRoc0JuRkxMb00vM1VTT3NqQnJPUlhsejlPVkw4Q2prL0dYTEVsNThQcCtnVmZVQkNLK09zc1FTdUR3V0ErZzdHQWdpUGdSRFdOejhPQmJPekYxdDFQZWMvQ3d5SGMrU254M3NpNGQwaVdFV0lQUzgrazhxYUlaK0NSbUVrdnJIVDZTSWNycVd1S1U3MWJFV3d3VHp0dHVNS3NwQUZPVG5tSGZibk9UY1MwbnBISWZNQnB4NlpsRmhZUmlMS1NWdEJqRHYrMUtBYUVvUGgzRzcvSTZ5SjhWRTJkcHU5MENLN3VwZ2pndlhaaW54ZTlmQkt6RHZISEJHWVBPN0pkRFJOMU82dEJKcm9jY3MrcTNPdHJJTStjM1ZwWHJySnlWaDZEV1BTRmo2Y2JKeTNrZDNCWmNjbkFTNzZsZEIvWEE3R1FaTkRXL0FtdndSWGg1RVcrREFrSW5ud3YyOXc9PQ==");
      } catch (e) {
        db._connectionInfo = "confidential:VTJGc2RHVmtYMTlEd0dwSVVobmVzaXI4L3pKV0YvSmZZd0p0SVByQ1dOdDFyeHdTbkxLVUdUUzNta3ZWYkliMVdDYUxrOG5iYXM1bzU3VVNIOHBMcG85d21neTFLWTZoNlY0MlFuOUdCK2UxU0JTMEFQL21ubldkSjlYUXNZZVR5V2JFTHNCNWdRL0dBL2hVRldRSExESlVYWjVzcitQTXVqTFZWcEczbHJHRWJJckoyazNmdWx4bUdyTThFcEsrcEJpRCtHaUwvQ2tNK0lwbFhJOWQ4NmMyNjRSZ0lIekY4SWFady9YUmVta1E0K3B0M1VyZHhMWWc3TXNISTdvL0tNRmEyeEFZMmMwbWhacDBFOHNXK0FrQ1NkcjhraEZwdWExcVpZTWVFaVRFTS96djBXY2d0c3RkcWhldjdZY1A3bEhZVEtYYVBIK0Q5MEMxaE1KbGp3eFRWeDIwbDROZHJEVHRhUGRvTllmU2VRd0dPbWgrQTArQ1plTWZGSDJpcmlBM1NvNUNEMUs4aUR3bFU5YUpYUmg0THZMbEdkb1dYVWJwb3hKOEhVVkdjWnRzLzVFbTFjc3o1M3ZBdTZoTXJJRlFmdmJDam0wVmxNTk93TXVxS1VITy91MDdweXMrZjM3RlBUT2hBREYrb0RFUmJmQ1A5bVo2U2RORXFZc0ZLS045clpBR3BHUGVITnlxZHZUZzVEN2tTYkdaM3FsaGpkUG5TVGt6aWxwSHNCUWxBeStEZ2x0WjI2cTQrdzhrb3EzTU5LZ1JvUjY4MFFHNlBDN084N2oxK1JFN0llbVArMCtObmF5MFNiMFgvNXhpd3FJaTJTVU1GK3ozc0pHTHFyL2ZJY051YlpQdGlCS3UreVhmMjU0OWdPMHY0bzFLY0g2U1BRVnlUVFRCb0ViL3MvT2hBQnN5RHdYUFhpQjJ5ZkdSS0RISy9jUGN1QzVrU3k0dTBKMWxMaXBGenpVYVlZbmpMQ3pCZGZENUQ5NHlGSTBBdnZDaGdJNEN6NFV6TWd0WkRSTVc3eVhoVXBIdXJTRFhwbTlHMFczRDVQOEtvSjZqYXA0VmlqRENIK1lpNjZmbTBBYlZIRW1CV09QLzBxaWMyWUJJVUUxT2xHby8vajJhK1BFYjVEMzgvYVVBM2tqaFBKTkJIUytPSGZTM2s4NTBHQjNKTGRoc0JuRkxMb00vM1VTT3NqQnJPUlhsejlPVkw4Q2prL0dYTEVsNThQcCtnVmZVQkNLK09zc1FTdUR3V0ErZzdHQWdpUGdSRFdOejhPQmJPekYxdDFQZWMvQ3d5SGMrU254M3NpNGQwaVdFV0lQUzgrazhxYUlaK0NSbUVrdnJIVDZTSWNycVd1S1U3MWJFV3d3VHp0dHVNS3NwQUZPVG5tSGZibk9UY1MwbnBISWZNQnB4NlpsRmhZUmlMS1NWdEJqRHYrMUtBYUVvUGgzRzcvSTZ5SjhWRTJkcHU5MENLN3VwZ2pndlhaaW54ZTlmQkt6RHZISEJHWVBPN0pkRFJOMU82dEJKcm9jY3MrcTNPdHJJTStjM1ZwWHJySnlWaDZEV1BTRmo2Y2JKeTNrZDNCWmNjbkFTNzZsZEIvWEE3R1FaTkRXL0FtdndSWGg1RVcrREFrSW5ud3YyOXc9PQ==";
      }
      expect(db.connectionInfo.userCtx.name).toEqual("lingllama");
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
