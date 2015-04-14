"use strict";
/* globals localStorage */
var Database;
try {
  /* globals FieldDB */
  if (FieldDB) {
    Database = FieldDB.Database;
  }
} catch (e) {
  Database = require("./../../api/corpus/Database").Database;
  Database.URLParser = require("url");
}

var specIsRunningTooLong = 5000;

describe("Database", function() {
  it("should be load", function() {
    expect(Database).toBeDefined();
  });

  describe("construction options", function() {
    it("should accept a dbname", function() {
      var db = new Database({
        dbname: "jenkins-firstcorpus"
      });
      expect(db.dbname).toEqual("jenkins-firstcorpus");
    });
  });

  describe("crud", function() {
    it("should be able to return a promise for an item from the database", function(done) {
      var db = new Database({
        dbname: "jenkins-firstcorpus"
      });
      db.get("team").then(function(result) {
        expect(result).toBeDefined();
        expect(result).toEqual({
          "_id": "team",
          "_rev": "1-d773c350f0c6cf5e3de7d58d39b04ee5",
          "gravatar": "ab63a76362c3972ac83d5cb8830fdb51",
          "username": "jenkins",
          "collection": "users",
          "firstname": "",
          "lastname": "",
          "subtitle": "",
          "email": "",
          "researchInterest": "No public information available",
          "affiliation": "No public information available",
          "description": "No public information available"
        });
      }, function(error) {
        if (error.status >= 500) {
          expect(error.userFriendlyErrors).toEqual(["Server is not responding for request to open the user `jenkins`. Please report this error. "]);
        } else if (error.status === 401) {
          expect(error.userFriendlyErrors).toEqual(["You are not authorized to access this db."]);
        } else if (error.status === 400) {
          expect(error.userFriendlyErrors).toEqual(["CORS not supported, your browser is unable to contact the database."]);
        } else if (error.status === 0) {
          expect(error.userFriendlyErrors).toEqual(["Unable to contact the server, are you sure you're not offline?"]);
        } else {
          expect(false).toBeTruthy();
        }

      }).done(done);
    }, specIsRunningTooLong);

    it("should be able to set the revision number after a save", function(done) {
      var db = new Database({
        dbname: "jenkins-firstcorpus"
      });
      db.set({
        _id: "testingdbsave" + Date.now()
      }).then(function(resultingdocument) {
        expect(resultingdocument).toBeDefined();
        expect(resultingdocument.rev).toBeDefined();
        expect(resultingdocument.rev).toContain("1-");
      }, function(error) {
        if (error.status >= 500) {
          expect(error.userFriendlyErrors).toEqual(["Server is not responding for request to open the user `jenkins`. Please report this error. "]);
        } else if (error.status === 401) {
          expect(error.userFriendlyErrors).toEqual(["You are not authorized to access this db."]);
        } else if (error.status === 400) {
          expect(error.userFriendlyErrors).toEqual(["CORS not supported, your browser is unable to contact the database."]);
        } else if (error.status === 0) {
          expect(error.userFriendlyErrors).toEqual(["Unable to contact the server, are you sure you're not offline?"]);
        } else {
          expect(false).toBeTruthy();
        }

      }).done(done);
    }, specIsRunningTooLong);

    it("should throw an error if remove is requested", function() {
      var db = new Database({
        dbname: "jenkins-firstcorpus"
      });
      expect(function() {
        db.remove("D093j2ae-akmoi3m-2a3wkjen");
      }).toThrow(new Error("Deleting data is not permitted."));
    });

    it("should provide delete as a syntactic sugar for remove", function() {
      var db = new Database({
        dbname: "jenkins-firstcorpus"
      });
      expect(function() {
        db.delete("D093j2ae-akmoi3m-2a3wkjen");
      }).toThrow(new Error("Deleting data is not permitted."));
    });

  });

  describe("connection", function() {
    it("should not be to resume a login connection in Node", function(done) {
      var db = new Database();
      db.resumeAuthenticationSession().then(function(resumedCouchDBSession) {
        expect(resumedCouchDBSession).toBeDefined();
        expect(resumedCouchDBSession.username).toEqual("jenkins");
        expect(resumedCouchDBSession.roles).toBeDefined();
        expect(resumedCouchDBSession.roles.length).toBeGreaterThan(4);
      }, function(error) {
        if (error.status >= 500) {
          expect(error.userFriendlyErrors).toEqual(["Server is not responding for request to open the user `jenkins`. Please report this error. "]);
        } else if (error.status === 401) {
          expect(error.userFriendlyErrors).toEqual(["Please login."]);
        } else if (error.status === 400) {
          expect(error.userFriendlyErrors).toEqual(["CORS not supported, your browser is unable to contact the database."]);
        } else if (error.status === 0) {
          expect(error.userFriendlyErrors).toEqual(["Unable to contact the server, are you sure you're not offline?"]);
        } else {
          expect(false).toBeTruthy();
        }

      }).done(done);

    }, specIsRunningTooLong);

    it("should be able to set the most recent connection locally encrypted", function() {
      var db = new Database();
      db.connectionInfo = {
        "ok": true,
        "userCtx": {
          "name": "jenkins",
          "roles": ["computationalfieldworkshop-group_data_entry_tutorial_reader", "fielddbuser", "jessepollak-spring_2013_field_methods_reader", "jenkins-cherokee_admin", "jenkins-cherokee_commenter", "jenkins-cherokee_reader", "jenkins-cherokee_writer", "jenkins-firstcorpus_admin", "jenkins-firstcorpus_admin", "jenkins-firstcorpus_commenter", "jenkins-firstcorpus_reader", "jenkins-firstcorpus_writer", "jenkins-test_corpus_admin", "jenkins-test_corpus_commenter", "jenkins-test_corpus_reader", "jenkins-test_corpus_writer", "teammatetiger-firstcorpus_commenter", "teammatetiger-firstcorpus_reader", "teammatetiger-firstcorpus_writer", "jenkins-firstcorpus_commenter", "jenkins-firstcorpus_reader", "jenkins-firstcorpus_writer"]
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

    it("should be able to get a default connection", function() {
      var connection = Database.defaultConnection();
      expect(connection).toEqual({
        fieldDBtype: "Connection",
        protocol: "https://",
        domain: "localhost",
        port: "6984",
        path: "",
        serverLabel: "localhost",
        authUrls: ["https://localhost:3183"],
        websiteUrls: ["https://localhost:3182"],
        userFriendlyServerName: "Localhost",
        version: connection.version,
        corpusid: "",
        titleAsUrl: "",
        clientUrls: [],
        corpusUrls: [],
        lexiconUrls: [],
        searchUrls: [],
        audioUrls: [],
        activityUrls: [],
        title: ""
      });
    });


    it("should be able to extrapolate a connection", function() {
      var db = new Database();
      db.url = "https://corpus.lingsync.org";
      expect(db.toJSON().connection).toEqual({
        fieldDBtype: "Connection",
        protocol: "https://",
        domain: "corpus.lingsync.org",
        port: "443",
        path: "",
        serverLabel: "production",
        brandLowerCase: "lingsync",
        authUrls: ["https://auth.lingsync.org"],
        websiteUrls: ["http://lingsync.org"],
        userFriendlyServerName: "LingSync.org",
        version: db.version,
        clientUrls: [],
        corpusUrls: ["https://corpus.lingsync.org"],
        lexiconUrls: [],
        searchUrls: [],
        audioUrls: [],
        activityUrls: [],
        corpusid: "",
        titleAsUrl: "",
        dbname: "",
        pouchname: "",
        title: ""
      });
    });

    it("should be able to get a couch url from a deprecated connection", function() {
      var db = new Database();
      var connection = {
        "protocol": "https://",
        "domain": "corpus.example.org",
        "port": "443",
        "pouchname": "jenkins-firstcorpus",
        "path": "",
        "authUrl": "https://auth.example.org",
        "userFriendlyServerName": "Example.org",
        "corpusid": "",
        "title": "jenkins-firstcorpus",
        "description": "The details of this corpus are not public.",
        "titleAsUrl": "jenkins-firstcorpus"
      };
      db.connection = connection;
      expect(db.couchSessionUrl).toEqual("https://corpus.example.org/_session");
    });

  });

  describe("login", function() {

    it("should be able to login on a couchdb", function(done) {
      var db = new Database();
      db.login({
        name: "jenkins",
        password: "phoneme"
      }).then(function(couchdbSessionLoginResult) {
        expect(couchdbSessionLoginResult).toBeDefined();
        expect(couchdbSessionLoginResult.ok).toEqual(true);
        expect(couchdbSessionLoginResult.name).toEqual("jenkins");
        expect(couchdbSessionLoginResult.roles).toBeDefined();
        expect(couchdbSessionLoginResult.roles.length).toBeGreaterThan(4);
      }, function(error) {
        if (error.userFriendlyErrors[0] === "CORS not supported, your browser is unable to contact the database.") {
          expect(error.status).toEqual(400);
          expect(error.userFriendlyErrors).toEqual(["CORS not supported, your browser is unable to contact the database."]);
        } else {
          expect(error.status).toEqual(0);
          expect(error.userFriendlyErrors).toEqual(["Unable to contact the server, are you sure you're not offline?"]);
        }
      }).done(done);
    }, specIsRunningTooLong);

    it("should be able to login on a fielddb auth server", function(done) {
      var db = new Database();
      db.login({
        username: "jenkins",
        password: "phoneme"
      }).then(function(resultingFielddbUser) {
        expect(resultingFielddbUser).toBeDefined();
        expect(resultingFielddbUser.username).toEqual("jenkins");
        expect(resultingFielddbUser.username).toEqual(resultingFielddbUser._id);
        expect(resultingFielddbUser._rev).toBeDefined();
      }, function(error) {
        if (error.status === 500) {
          expect(error.userFriendlyErrors).toEqual(["Server is not responding for request to open the user `jenkins`. Please report this error. "]);
        } else if (error.status === 400) {
          expect(error.userFriendlyErrors).toEqual(["CORS not supported, your browser is unable to contact the database."]);
        } else if (error.status === 0) {
          expect(error.userFriendlyErrors).toEqual(["Unable to contact the server, are you sure you're not offline?"]);
        } else {
          expect(false).toBeTruthy();
        }
      }).done(done);
    }, specIsRunningTooLong);


    it("should return instructions is user forgets to put a username", function(done) {
      var db = new Database();
      db.login({
        username: "",
        password: "phoneme"
      }).then(function() {
        expect(false).toBeTruthy();
      }, function(error) {
        expect(error.userFriendlyErrors).toEqual(["Please supply a username."]);
      }).done(done);

    }, specIsRunningTooLong);

    it("should return instructions is user forgets to put a password", function(done) {
      var db = new Database();
      db.login({
        username: "jenkins",
        password: ""
      }).then(function() {
        expect(false).toBeTruthy();
      }, function(error) {
        expect(error.userFriendlyErrors).toEqual(["Please supply a password."]);
      }).done(done);

    }, specIsRunningTooLong);

    it("should return instructions is user enters an impossible username", function(done) {
      var db = new Database();
      db.login({
        username: "Ling Llamâ's-friend",
        password: "phoneme"
      }).then(function() {
        expect(false).toBeTruthy();
      }, function(error) {
        expect(error.userFriendlyErrors).toContain("You asked to use Ling Llamâ's-friend but we would reccomend using this instead: lingllamasfriend the following are a list of reason's why.");
        expect(error.userFriendlyErrors).toContain("The identifier has to be lowercase so that it can be used in your CouchDB database names.");
        expect(error.userFriendlyErrors).toContain("We are using - as a reserved symbol in database URIs (Uniform Resource Identifiers), so you can't use it in your username.");
        expect(error.userFriendlyErrors).toContain("You have to use ascii characters in your identifiers because your identifier is used in your in web urls, so its better if you can use something more web friendly.");
        expect(error.userFriendlyErrors).toContain("You have some characters which web servers wouldn't trust in your identifier.");
      }).done(done);

    }, specIsRunningTooLong);

    it("should tell user there is a bug if the client didnt provide any login details", function(done) {
      var db = new Database();
      db.login().then(function() {
        expect(false).toBeTruthy();
      }, function(error) {
        expect(error.userFriendlyErrors).toEqual(["This application has errored, please contact us."]);
      }).done(done);

    }, specIsRunningTooLong);
  });

  describe("logout", function() {
    it("should be able to logout", function(done) {
      var db = new Database();
      try {
        localStorage.setItem("_connectionInfo", "confidential:VTJGc2RHVmtYMTlEd0dwSVVobmVzaXI4L3pKV0YvSmZZd0p0SVByQ1dOdDFyeHdTbkxLVUdUUzNta3ZWYkliMVdDYUxrOG5iYXM1bzU3VVNIOHBMcG85d21neTFLWTZoNlY0MlFuOUdCK2UxU0JTMEFQL21ubldkSjlYUXNZZVR5V2JFTHNCNWdRL0dBL2hVRldRSExESlVYWjVzcitQTXVqTFZWcEczbHJHRWJJckoyazNmdWx4bUdyTThFcEsrcEJpRCtHaUwvQ2tNK0lwbFhJOWQ4NmMyNjRSZ0lIekY4SWFady9YUmVta1E0K3B0M1VyZHhMWWc3TXNISTdvL0tNRmEyeEFZMmMwbWhacDBFOHNXK0FrQ1NkcjhraEZwdWExcVpZTWVFaVRFTS96djBXY2d0c3RkcWhldjdZY1A3bEhZVEtYYVBIK0Q5MEMxaE1KbGp3eFRWeDIwbDROZHJEVHRhUGRvTllmU2VRd0dPbWgrQTArQ1plTWZGSDJpcmlBM1NvNUNEMUs4aUR3bFU5YUpYUmg0THZMbEdkb1dYVWJwb3hKOEhVVkdjWnRzLzVFbTFjc3o1M3ZBdTZoTXJJRlFmdmJDam0wVmxNTk93TXVxS1VITy91MDdweXMrZjM3RlBUT2hBREYrb0RFUmJmQ1A5bVo2U2RORXFZc0ZLS045clpBR3BHUGVITnlxZHZUZzVEN2tTYkdaM3FsaGpkUG5TVGt6aWxwSHNCUWxBeStEZ2x0WjI2cTQrdzhrb3EzTU5LZ1JvUjY4MFFHNlBDN084N2oxK1JFN0llbVArMCtObmF5MFNiMFgvNXhpd3FJaTJTVU1GK3ozc0pHTHFyL2ZJY051YlpQdGlCS3UreVhmMjU0OWdPMHY0bzFLY0g2U1BRVnlUVFRCb0ViL3MvT2hBQnN5RHdYUFhpQjJ5ZkdSS0RISy9jUGN1QzVrU3k0dTBKMWxMaXBGenpVYVlZbmpMQ3pCZGZENUQ5NHlGSTBBdnZDaGdJNEN6NFV6TWd0WkRSTVc3eVhoVXBIdXJTRFhwbTlHMFczRDVQOEtvSjZqYXA0VmlqRENIK1lpNjZmbTBBYlZIRW1CV09QLzBxaWMyWUJJVUUxT2xHby8vajJhK1BFYjVEMzgvYVVBM2tqaFBKTkJIUytPSGZTM2s4NTBHQjNKTGRoc0JuRkxMb00vM1VTT3NqQnJPUlhsejlPVkw4Q2prL0dYTEVsNThQcCtnVmZVQkNLK09zc1FTdUR3V0ErZzdHQWdpUGdSRFdOejhPQmJPekYxdDFQZWMvQ3d5SGMrU254M3NpNGQwaVdFV0lQUzgrazhxYUlaK0NSbUVrdnJIVDZTSWNycVd1S1U3MWJFV3d3VHp0dHVNS3NwQUZPVG5tSGZibk9UY1MwbnBISWZNQnB4NlpsRmhZUmlMS1NWdEJqRHYrMUtBYUVvUGgzRzcvSTZ5SjhWRTJkcHU5MENLN3VwZ2pndlhaaW54ZTlmQkt6RHZISEJHWVBPN0pkRFJOMU82dEJKcm9jY3MrcTNPdHJJTStjM1ZwWHJySnlWaDZEV1BTRmo2Y2JKeTNrZDNCWmNjbkFTNzZsZEIvWEE3R1FaTkRXL0FtdndSWGg1RVcrREFrSW5ud3YyOXc9PQ==");
      } catch (e) {
        db._connectionInfo = "confidential:VTJGc2RHVmtYMTlEd0dwSVVobmVzaXI4L3pKV0YvSmZZd0p0SVByQ1dOdDFyeHdTbkxLVUdUUzNta3ZWYkliMVdDYUxrOG5iYXM1bzU3VVNIOHBMcG85d21neTFLWTZoNlY0MlFuOUdCK2UxU0JTMEFQL21ubldkSjlYUXNZZVR5V2JFTHNCNWdRL0dBL2hVRldRSExESlVYWjVzcitQTXVqTFZWcEczbHJHRWJJckoyazNmdWx4bUdyTThFcEsrcEJpRCtHaUwvQ2tNK0lwbFhJOWQ4NmMyNjRSZ0lIekY4SWFady9YUmVta1E0K3B0M1VyZHhMWWc3TXNISTdvL0tNRmEyeEFZMmMwbWhacDBFOHNXK0FrQ1NkcjhraEZwdWExcVpZTWVFaVRFTS96djBXY2d0c3RkcWhldjdZY1A3bEhZVEtYYVBIK0Q5MEMxaE1KbGp3eFRWeDIwbDROZHJEVHRhUGRvTllmU2VRd0dPbWgrQTArQ1plTWZGSDJpcmlBM1NvNUNEMUs4aUR3bFU5YUpYUmg0THZMbEdkb1dYVWJwb3hKOEhVVkdjWnRzLzVFbTFjc3o1M3ZBdTZoTXJJRlFmdmJDam0wVmxNTk93TXVxS1VITy91MDdweXMrZjM3RlBUT2hBREYrb0RFUmJmQ1A5bVo2U2RORXFZc0ZLS045clpBR3BHUGVITnlxZHZUZzVEN2tTYkdaM3FsaGpkUG5TVGt6aWxwSHNCUWxBeStEZ2x0WjI2cTQrdzhrb3EzTU5LZ1JvUjY4MFFHNlBDN084N2oxK1JFN0llbVArMCtObmF5MFNiMFgvNXhpd3FJaTJTVU1GK3ozc0pHTHFyL2ZJY051YlpQdGlCS3UreVhmMjU0OWdPMHY0bzFLY0g2U1BRVnlUVFRCb0ViL3MvT2hBQnN5RHdYUFhpQjJ5ZkdSS0RISy9jUGN1QzVrU3k0dTBKMWxMaXBGenpVYVlZbmpMQ3pCZGZENUQ5NHlGSTBBdnZDaGdJNEN6NFV6TWd0WkRSTVc3eVhoVXBIdXJTRFhwbTlHMFczRDVQOEtvSjZqYXA0VmlqRENIK1lpNjZmbTBBYlZIRW1CV09QLzBxaWMyWUJJVUUxT2xHby8vajJhK1BFYjVEMzgvYVVBM2tqaFBKTkJIUytPSGZTM2s4NTBHQjNKTGRoc0JuRkxMb00vM1VTT3NqQnJPUlhsejlPVkw4Q2prL0dYTEVsNThQcCtnVmZVQkNLK09zc1FTdUR3V0ErZzdHQWdpUGdSRFdOejhPQmJPekYxdDFQZWMvQ3d5SGMrU254M3NpNGQwaVdFV0lQUzgrazhxYUlaK0NSbUVrdnJIVDZTSWNycVd1S1U3MWJFV3d3VHp0dHVNS3NwQUZPVG5tSGZibk9UY1MwbnBISWZNQnB4NlpsRmhZUmlMS1NWdEJqRHYrMUtBYUVvUGgzRzcvSTZ5SjhWRTJkcHU5MENLN3VwZ2pndlhaaW54ZTlmQkt6RHZISEJHWVBPN0pkRFJOMU82dEJKcm9jY3MrcTNPdHJJTStjM1ZwWHJySnlWaDZEV1BTRmo2Y2JKeTNrZDNCWmNjbkFTNzZsZEIvWEE3R1FaTkRXL0FtdndSWGg1RVcrREFrSW5ud3YyOXc9PQ==";
      }
      db.logout().then(function() {
        expect(db.connectionInfo).toBeUndefined();
      }, function(error) {
        if (error.userFriendlyErrors[0] === "CORS not supported, your browser is unable to contact the database.") {
          expect(error.status).toEqual(400);
          expect(error.userFriendlyErrors).toEqual(["CORS not supported, your browser is unable to contact the database."]);
        } else {
          expect(error.status).toEqual(0);
          expect(error.userFriendlyErrors).toEqual(["Unable to contact the server, are you sure you're not offline?"]);
        }
      }).done(done);
    }, specIsRunningTooLong);

    it("should be able to logout of any couchdb", function(done) {
      var db = new Database();
      try {
        localStorage.setItem("_connectionInfo", "confidential:VTJGc2RHVmtYMTlEd0dwSVVobmVzaXI4L3pKV0YvSmZZd0p0SVByQ1dOdDFyeHdTbkxLVUdUUzNta3ZWYkliMVdDYUxrOG5iYXM1bzU3VVNIOHBMcG85d21neTFLWTZoNlY0MlFuOUdCK2UxU0JTMEFQL21ubldkSjlYUXNZZVR5V2JFTHNCNWdRL0dBL2hVRldRSExESlVYWjVzcitQTXVqTFZWcEczbHJHRWJJckoyazNmdWx4bUdyTThFcEsrcEJpRCtHaUwvQ2tNK0lwbFhJOWQ4NmMyNjRSZ0lIekY4SWFady9YUmVta1E0K3B0M1VyZHhMWWc3TXNISTdvL0tNRmEyeEFZMmMwbWhacDBFOHNXK0FrQ1NkcjhraEZwdWExcVpZTWVFaVRFTS96djBXY2d0c3RkcWhldjdZY1A3bEhZVEtYYVBIK0Q5MEMxaE1KbGp3eFRWeDIwbDROZHJEVHRhUGRvTllmU2VRd0dPbWgrQTArQ1plTWZGSDJpcmlBM1NvNUNEMUs4aUR3bFU5YUpYUmg0THZMbEdkb1dYVWJwb3hKOEhVVkdjWnRzLzVFbTFjc3o1M3ZBdTZoTXJJRlFmdmJDam0wVmxNTk93TXVxS1VITy91MDdweXMrZjM3RlBUT2hBREYrb0RFUmJmQ1A5bVo2U2RORXFZc0ZLS045clpBR3BHUGVITnlxZHZUZzVEN2tTYkdaM3FsaGpkUG5TVGt6aWxwSHNCUWxBeStEZ2x0WjI2cTQrdzhrb3EzTU5LZ1JvUjY4MFFHNlBDN084N2oxK1JFN0llbVArMCtObmF5MFNiMFgvNXhpd3FJaTJTVU1GK3ozc0pHTHFyL2ZJY051YlpQdGlCS3UreVhmMjU0OWdPMHY0bzFLY0g2U1BRVnlUVFRCb0ViL3MvT2hBQnN5RHdYUFhpQjJ5ZkdSS0RISy9jUGN1QzVrU3k0dTBKMWxMaXBGenpVYVlZbmpMQ3pCZGZENUQ5NHlGSTBBdnZDaGdJNEN6NFV6TWd0WkRSTVc3eVhoVXBIdXJTRFhwbTlHMFczRDVQOEtvSjZqYXA0VmlqRENIK1lpNjZmbTBBYlZIRW1CV09QLzBxaWMyWUJJVUUxT2xHby8vajJhK1BFYjVEMzgvYVVBM2tqaFBKTkJIUytPSGZTM2s4NTBHQjNKTGRoc0JuRkxMb00vM1VTT3NqQnJPUlhsejlPVkw4Q2prL0dYTEVsNThQcCtnVmZVQkNLK09zc1FTdUR3V0ErZzdHQWdpUGdSRFdOejhPQmJPekYxdDFQZWMvQ3d5SGMrU254M3NpNGQwaVdFV0lQUzgrazhxYUlaK0NSbUVrdnJIVDZTSWNycVd1S1U3MWJFV3d3VHp0dHVNS3NwQUZPVG5tSGZibk9UY1MwbnBISWZNQnB4NlpsRmhZUmlMS1NWdEJqRHYrMUtBYUVvUGgzRzcvSTZ5SjhWRTJkcHU5MENLN3VwZ2pndlhaaW54ZTlmQkt6RHZISEJHWVBPN0pkRFJOMU82dEJKcm9jY3MrcTNPdHJJTStjM1ZwWHJySnlWaDZEV1BTRmo2Y2JKeTNrZDNCWmNjbkFTNzZsZEIvWEE3R1FaTkRXL0FtdndSWGg1RVcrREFrSW5ud3YyOXc9PQ==");
      } catch (e) {
        db._connectionInfo = "confidential:VTJGc2RHVmtYMTlEd0dwSVVobmVzaXI4L3pKV0YvSmZZd0p0SVByQ1dOdDFyeHdTbkxLVUdUUzNta3ZWYkliMVdDYUxrOG5iYXM1bzU3VVNIOHBMcG85d21neTFLWTZoNlY0MlFuOUdCK2UxU0JTMEFQL21ubldkSjlYUXNZZVR5V2JFTHNCNWdRL0dBL2hVRldRSExESlVYWjVzcitQTXVqTFZWcEczbHJHRWJJckoyazNmdWx4bUdyTThFcEsrcEJpRCtHaUwvQ2tNK0lwbFhJOWQ4NmMyNjRSZ0lIekY4SWFady9YUmVta1E0K3B0M1VyZHhMWWc3TXNISTdvL0tNRmEyeEFZMmMwbWhacDBFOHNXK0FrQ1NkcjhraEZwdWExcVpZTWVFaVRFTS96djBXY2d0c3RkcWhldjdZY1A3bEhZVEtYYVBIK0Q5MEMxaE1KbGp3eFRWeDIwbDROZHJEVHRhUGRvTllmU2VRd0dPbWgrQTArQ1plTWZGSDJpcmlBM1NvNUNEMUs4aUR3bFU5YUpYUmg0THZMbEdkb1dYVWJwb3hKOEhVVkdjWnRzLzVFbTFjc3o1M3ZBdTZoTXJJRlFmdmJDam0wVmxNTk93TXVxS1VITy91MDdweXMrZjM3RlBUT2hBREYrb0RFUmJmQ1A5bVo2U2RORXFZc0ZLS045clpBR3BHUGVITnlxZHZUZzVEN2tTYkdaM3FsaGpkUG5TVGt6aWxwSHNCUWxBeStEZ2x0WjI2cTQrdzhrb3EzTU5LZ1JvUjY4MFFHNlBDN084N2oxK1JFN0llbVArMCtObmF5MFNiMFgvNXhpd3FJaTJTVU1GK3ozc0pHTHFyL2ZJY051YlpQdGlCS3UreVhmMjU0OWdPMHY0bzFLY0g2U1BRVnlUVFRCb0ViL3MvT2hBQnN5RHdYUFhpQjJ5ZkdSS0RISy9jUGN1QzVrU3k0dTBKMWxMaXBGenpVYVlZbmpMQ3pCZGZENUQ5NHlGSTBBdnZDaGdJNEN6NFV6TWd0WkRSTVc3eVhoVXBIdXJTRFhwbTlHMFczRDVQOEtvSjZqYXA0VmlqRENIK1lpNjZmbTBBYlZIRW1CV09QLzBxaWMyWUJJVUUxT2xHby8vajJhK1BFYjVEMzgvYVVBM2tqaFBKTkJIUytPSGZTM2s4NTBHQjNKTGRoc0JuRkxMb00vM1VTT3NqQnJPUlhsejlPVkw4Q2prL0dYTEVsNThQcCtnVmZVQkNLK09zc1FTdUR3V0ErZzdHQWdpUGdSRFdOejhPQmJPekYxdDFQZWMvQ3d5SGMrU254M3NpNGQwaVdFV0lQUzgrazhxYUlaK0NSbUVrdnJIVDZTSWNycVd1S1U3MWJFV3d3VHp0dHVNS3NwQUZPVG5tSGZibk9UY1MwbnBISWZNQnB4NlpsRmhZUmlMS1NWdEJqRHYrMUtBYUVvUGgzRzcvSTZ5SjhWRTJkcHU5MENLN3VwZ2pndlhaaW54ZTlmQkt6RHZISEJHWVBPN0pkRFJOMU82dEJKcm9jY3MrcTNPdHJJTStjM1ZwWHJySnlWaDZEV1BTRmo2Y2JKeTNrZDNCWmNjbkFTNzZsZEIvWEE3R1FaTkRXL0FtdndSWGg1RVcrREFrSW5ud3YyOXc9PQ==";
      }
      db.logout("https://ifielddevs.iriscouch.com/_session").then(function() {
        expect(db.connectionInfo).toBeUndefined();
      }, function(error) {
        if (error.userFriendlyErrors[0] === "CORS not supported, your browser is unable to contact the database.") {
          expect(error.status).toEqual(400);
          expect(error.userFriendlyErrors).toEqual(["CORS not supported, your browser is unable to contact the database."]);
        } else {
          expect(error.status).toEqual(0);
          expect(error.userFriendlyErrors).toEqual(["Unable to contact the server, are you sure you're not offline?"]);
        }
      }).done(done);
    }, specIsRunningTooLong);


    it("should refuse to logout of non-couchdb urls", function(done) {
      var db = new Database();
      try {
        localStorage.setItem("_connectionInfo", "confidential:VTJGc2RHVmtYMTlEd0dwSVVobmVzaXI4L3pKV0YvSmZZd0p0SVByQ1dOdDFyeHdTbkxLVUdUUzNta3ZWYkliMVdDYUxrOG5iYXM1bzU3VVNIOHBMcG85d21neTFLWTZoNlY0MlFuOUdCK2UxU0JTMEFQL21ubldkSjlYUXNZZVR5V2JFTHNCNWdRL0dBL2hVRldRSExESlVYWjVzcitQTXVqTFZWcEczbHJHRWJJckoyazNmdWx4bUdyTThFcEsrcEJpRCtHaUwvQ2tNK0lwbFhJOWQ4NmMyNjRSZ0lIekY4SWFady9YUmVta1E0K3B0M1VyZHhMWWc3TXNISTdvL0tNRmEyeEFZMmMwbWhacDBFOHNXK0FrQ1NkcjhraEZwdWExcVpZTWVFaVRFTS96djBXY2d0c3RkcWhldjdZY1A3bEhZVEtYYVBIK0Q5MEMxaE1KbGp3eFRWeDIwbDROZHJEVHRhUGRvTllmU2VRd0dPbWgrQTArQ1plTWZGSDJpcmlBM1NvNUNEMUs4aUR3bFU5YUpYUmg0THZMbEdkb1dYVWJwb3hKOEhVVkdjWnRzLzVFbTFjc3o1M3ZBdTZoTXJJRlFmdmJDam0wVmxNTk93TXVxS1VITy91MDdweXMrZjM3RlBUT2hBREYrb0RFUmJmQ1A5bVo2U2RORXFZc0ZLS045clpBR3BHUGVITnlxZHZUZzVEN2tTYkdaM3FsaGpkUG5TVGt6aWxwSHNCUWxBeStEZ2x0WjI2cTQrdzhrb3EzTU5LZ1JvUjY4MFFHNlBDN084N2oxK1JFN0llbVArMCtObmF5MFNiMFgvNXhpd3FJaTJTVU1GK3ozc0pHTHFyL2ZJY051YlpQdGlCS3UreVhmMjU0OWdPMHY0bzFLY0g2U1BRVnlUVFRCb0ViL3MvT2hBQnN5RHdYUFhpQjJ5ZkdSS0RISy9jUGN1QzVrU3k0dTBKMWxMaXBGenpVYVlZbmpMQ3pCZGZENUQ5NHlGSTBBdnZDaGdJNEN6NFV6TWd0WkRSTVc3eVhoVXBIdXJTRFhwbTlHMFczRDVQOEtvSjZqYXA0VmlqRENIK1lpNjZmbTBBYlZIRW1CV09QLzBxaWMyWUJJVUUxT2xHby8vajJhK1BFYjVEMzgvYVVBM2tqaFBKTkJIUytPSGZTM2s4NTBHQjNKTGRoc0JuRkxMb00vM1VTT3NqQnJPUlhsejlPVkw4Q2prL0dYTEVsNThQcCtnVmZVQkNLK09zc1FTdUR3V0ErZzdHQWdpUGdSRFdOejhPQmJPekYxdDFQZWMvQ3d5SGMrU254M3NpNGQwaVdFV0lQUzgrazhxYUlaK0NSbUVrdnJIVDZTSWNycVd1S1U3MWJFV3d3VHp0dHVNS3NwQUZPVG5tSGZibk9UY1MwbnBISWZNQnB4NlpsRmhZUmlMS1NWdEJqRHYrMUtBYUVvUGgzRzcvSTZ5SjhWRTJkcHU5MENLN3VwZ2pndlhaaW54ZTlmQkt6RHZISEJHWVBPN0pkRFJOMU82dEJKcm9jY3MrcTNPdHJJTStjM1ZwWHJySnlWaDZEV1BTRmo2Y2JKeTNrZDNCWmNjbkFTNzZsZEIvWEE3R1FaTkRXL0FtdndSWGg1RVcrREFrSW5ud3YyOXc9PQ==");
      } catch (e) {
        db._connectionInfo = "confidential:VTJGc2RHVmtYMTlEd0dwSVVobmVzaXI4L3pKV0YvSmZZd0p0SVByQ1dOdDFyeHdTbkxLVUdUUzNta3ZWYkliMVdDYUxrOG5iYXM1bzU3VVNIOHBMcG85d21neTFLWTZoNlY0MlFuOUdCK2UxU0JTMEFQL21ubldkSjlYUXNZZVR5V2JFTHNCNWdRL0dBL2hVRldRSExESlVYWjVzcitQTXVqTFZWcEczbHJHRWJJckoyazNmdWx4bUdyTThFcEsrcEJpRCtHaUwvQ2tNK0lwbFhJOWQ4NmMyNjRSZ0lIekY4SWFady9YUmVta1E0K3B0M1VyZHhMWWc3TXNISTdvL0tNRmEyeEFZMmMwbWhacDBFOHNXK0FrQ1NkcjhraEZwdWExcVpZTWVFaVRFTS96djBXY2d0c3RkcWhldjdZY1A3bEhZVEtYYVBIK0Q5MEMxaE1KbGp3eFRWeDIwbDROZHJEVHRhUGRvTllmU2VRd0dPbWgrQTArQ1plTWZGSDJpcmlBM1NvNUNEMUs4aUR3bFU5YUpYUmg0THZMbEdkb1dYVWJwb3hKOEhVVkdjWnRzLzVFbTFjc3o1M3ZBdTZoTXJJRlFmdmJDam0wVmxNTk93TXVxS1VITy91MDdweXMrZjM3RlBUT2hBREYrb0RFUmJmQ1A5bVo2U2RORXFZc0ZLS045clpBR3BHUGVITnlxZHZUZzVEN2tTYkdaM3FsaGpkUG5TVGt6aWxwSHNCUWxBeStEZ2x0WjI2cTQrdzhrb3EzTU5LZ1JvUjY4MFFHNlBDN084N2oxK1JFN0llbVArMCtObmF5MFNiMFgvNXhpd3FJaTJTVU1GK3ozc0pHTHFyL2ZJY051YlpQdGlCS3UreVhmMjU0OWdPMHY0bzFLY0g2U1BRVnlUVFRCb0ViL3MvT2hBQnN5RHdYUFhpQjJ5ZkdSS0RISy9jUGN1QzVrU3k0dTBKMWxMaXBGenpVYVlZbmpMQ3pCZGZENUQ5NHlGSTBBdnZDaGdJNEN6NFV6TWd0WkRSTVc3eVhoVXBIdXJTRFhwbTlHMFczRDVQOEtvSjZqYXA0VmlqRENIK1lpNjZmbTBBYlZIRW1CV09QLzBxaWMyWUJJVUUxT2xHby8vajJhK1BFYjVEMzgvYVVBM2tqaFBKTkJIUytPSGZTM2s4NTBHQjNKTGRoc0JuRkxMb00vM1VTT3NqQnJPUlhsejlPVkw4Q2prL0dYTEVsNThQcCtnVmZVQkNLK09zc1FTdUR3V0ErZzdHQWdpUGdSRFdOejhPQmJPekYxdDFQZWMvQ3d5SGMrU254M3NpNGQwaVdFV0lQUzgrazhxYUlaK0NSbUVrdnJIVDZTSWNycVd1S1U3MWJFV3d3VHp0dHVNS3NwQUZPVG5tSGZibk9UY1MwbnBISWZNQnB4NlpsRmhZUmlMS1NWdEJqRHYrMUtBYUVvUGgzRzcvSTZ5SjhWRTJkcHU5MENLN3VwZ2pndlhaaW54ZTlmQkt6RHZISEJHWVBPN0pkRFJOMU82dEJKcm9jY3MrcTNPdHJJTStjM1ZwWHJySnlWaDZEV1BTRmo2Y2JKeTNrZDNCWmNjbkFTNzZsZEIvWEE3R1FaTkRXL0FtdndSWGg1RVcrREFrSW5ud3YyOXc9PQ==";
      }
      db.logout("https://ifielddevs.example.com/auth").then(function() {
        expect(db.connectionInfo).toBeUndefined();
      }, function(error) {
        expect(error.status).toEqual(412);
        expect(error.userFriendlyErrors).toEqual(["You cannot log out of https://ifielddevs.example.com/auth using this application."]);
      }).done(done);
    }, specIsRunningTooLong);

  });

  describe("register", function() {
    it("should be able to register", function(done) {
      var db = new Database();
      db.register({
        username: "testinganonymous" + Date.now(),
        password: "morpheme",
        confirmPassword: "morpheme"
      }).then(function(result) {
        expect(result).toBeDefined();
        expect(result.username).toContain("testinganonymous");
        expect(result.username).toEqual(result._id);
        expect(result.corpora).toBeDefined();
        expect(result.corpora.length).toEqual(1);
        expect(result.corpora[0].dbname).toEqual(result.username + "-firstcorpus");
      }, function(error) {
        expect(error.details.authUrl).toEqual("https://localhost:3183");
        expect(error.details.connection.userFriendlyServerName).toEqual("Localhost");
        expect(error.details.connection.serverLabel).toEqual("localhost");
        if (error.status === 500) {
          expect(error.userFriendlyErrors).toEqual(["Error saving a user in the database. "]);
        } else if (error.status === 400) {
          expect(error.userFriendlyErrors).toEqual(["CORS not supported, your browser is unable to contact the database."]);
        } else if (error.status === 0) {
          expect(error.userFriendlyErrors).toEqual(["Unable to contact the server, are you sure you're not offline?"]);
        } else {
          expect(false).toBeTruthy();
        }
      }).done(done);
    }, specIsRunningTooLong);

    it("should be able to register to any valid auth server", function(done) {
      var db = new Database();
      db.register({
        username: "testinganonymouswordclouduser" + Date.now(),
        password: "morpheme",
        confirmPassword: "morpheme",
        authUrl: "https://auth.linguistics.miauniversity.edu:3222/some/virtual/host"
      }).then(function() {
        expect(false).toBeTruthy();
      }, function(error) {
        expect(error.details.authUrl).toEqual("https://auth.linguistics.miauniversity.edu:3222/some/virtual/host");
        expect(error.details.connection).toEqual({
          fieldDBtype: "Connection",
          protocol: "https://",
          domain: "auth.linguistics.miauniversity.edu",
          port: "3222",
          path: "some/virtual/host",
          serverLabel: "miauniversity",
          brandLowerCase: "miauniversity",
          authUrls: ["https://auth.linguistics.miauniversity.edu:3222/some/virtual/host"],
          userFriendlyServerName: "miauniversity.edu",
          version: db.version,
          corpusid: "",
          clientUrls: [],
          corpusUrls: [],
          lexiconUrls: [],
          searchUrls: [],
          audioUrls: [],
          websiteUrls: [],
          activityUrls: []
        });
        if (error.status === 500) {
          expect(error.userFriendlyErrors).toEqual(["Error saving a user in the database. "]);
        } else if (error.status === 400) {
          expect(error.userFriendlyErrors).toEqual(["CORS not supported, your browser is unable to contact the database."]);
        } else if (error.status === 0) {
          expect(error.userFriendlyErrors).toEqual(["Unable to contact the server, are you sure you're not offline?"]);
        } else {
          expect(false).toBeTruthy();
        }
      }).done(done);
    }, specIsRunningTooLong);

    it("should be able to register a new user if its a new corpus (wordcloud users)", function(done) {
      var db = new Database();
      db.dbname = "anonymouseuser123-wordclouddb";
      db.register().then(function() {
        expect(false).toBeTruthy();
      }, function(error) {
        expect(error.details.username).toEqual("anonymouseuser123");
        expect(error.details.authUrl).toEqual("https://auth.lingsync.org");
        expect(error.details.connection.serverLabel).toEqual("production");
        expect(error.details.connection.brand).toEqual("LingSync.org");
        if (error.status === 500) {
          if (error.userFriendlyErrors && error.userFriendlyErrors[0] && error.userFriendlyErrors[0].indexOf("already exists, try a different username.") > -1) {
            expect(error.userFriendlyErrors[0]).toContain("already exists, try a different username.");
          } else {
            expect(error.userFriendlyErrors).toEqual(["Error saving a user in the database. "]);
          }
        } else if (error.status === 409) {
          expect(error.userFriendlyErrors).toEqual(["Username anonymouseuser123 already exists, try a different username."]);
        } else if (error.status === 400) {
          expect(error.userFriendlyErrors).toEqual(["CORS not supported, your browser is unable to contact the database."]);
        } else if (error.status === 0) {
          expect(error.userFriendlyErrors).toEqual(["Unable to contact the server, are you sure you're not offline?"]);
        } else {
          expect(false).toBeTruthy();
        }
      }).done(done);
    }, specIsRunningTooLong * 2);

    it("should tell user there is a bug if the client didnt provide any register details", function(done) {
      var db = new Database();
      db.register().then(function() {
        expect(false).toBeTruthy();
      }, function(error) {
        expect(error.userFriendlyErrors).toEqual(["This application has errored, please contact us."]);
      }).done(done);

    }, specIsRunningTooLong);

    it("should return instructions is user forgets to put a username", function(done) {
      var db = new Database();
      db.register({
        username: "",
        password: "phoneme"
      }).then(function() {
        expect(false).toBeTruthy();
      }, function(error) {
        expect(error.userFriendlyErrors).toEqual(["Please supply a username."]);
      }).done(done);

    }, specIsRunningTooLong);

    it("should return instructions is user forgets to put a password", function(done) {
      var db = new Database();
      db.register({
        username: "jenkins",
        password: ""
      }).then(function() {
        expect(false).toBeTruthy();
      }, function(error) {
        expect(error.userFriendlyErrors).toEqual(["Please supply a password."]);
      }).done(done);

    }, specIsRunningTooLong);

    it("should return instructions is user enters an impossible username", function(done) {
      var db = new Database();
      db.register({
        username: "Ling Llamâ's-friend",
        password: "phoneme",
        confirmPassword: "phoneme"
      }).then(function() {
        expect(false).toBeTruthy();
      }, function(error) {
        expect(error.userFriendlyErrors).toContain("You asked to use Ling Llamâ's-friend but we would reccomend using this instead: lingllamasfriend the following are a list of reason's why.");
        expect(error.userFriendlyErrors).toContain("The identifier has to be lowercase so that it can be used in your CouchDB database names.");
        expect(error.userFriendlyErrors).toContain("We are using - as a reserved symbol in database URIs (Uniform Resource Identifiers), so you can't use it in your username.");
        expect(error.userFriendlyErrors).toContain("You have to use ascii characters in your identifiers because your identifier is used in your in web urls, so its better if you can use something more web friendly.");
        expect(error.userFriendlyErrors).toContain("You have some characters which web servers wouldn't trust in your identifier.");
      }).done(done);

    }, specIsRunningTooLong);


  });


  describe("Database: as a team we want to be able to go back in time in the db revisions", function() {
    it("should be able to find urls of previous revisions", function(done) {
      var db = new Database({
        dbname: "jenkins-firstcorpus"
      });
      expect(db).toBeDefined();

      db.login({
        name: "jenkins",
        password: "phoneme"
      }).then(function() {

        db.fetchRevisions("team").then(function(resultingdocument) {
          expect(resultingdocument).toBeDefined();
          expect(resultingdocument.length).toEqual(1);
          expect(resultingdocument[0]).toContain("jenkins-firstcorpus/team?rev=\"1-");
        }, function(error) {
          expect(error).toBeDefined();
          expect(error.userFriendlyErrors).toBeDefined();
          if (error.status === 500) {
            expect(error.userFriendlyErrors).toEqual([" "]);
          } else if (error.status === 400) {
            expect(error.userFriendlyErrors).toEqual(["CORS not supported, your browser is unable to contact the database."]);
          } else if (error.status === 0) {
            expect(error.userFriendlyErrors).toEqual(["Unable to contact the server, are you sure you're not offline?"]);
          } else {
            expect(false).toBeTruthy();
          }
        }).done(done);

      }, function(error) {
        expect(error).toBeDefined();
        expect(error.userFriendlyErrors).toBeDefined();
        if (error.status === 500) {
          expect(error.userFriendlyErrors).toEqual([" "]);
        } else if (error.status === 400) {
          expect(error.userFriendlyErrors).toEqual(["CORS not supported, your browser is unable to contact the database."]);
        } else if (error.status === 0) {
          expect(error.userFriendlyErrors).toEqual(["Unable to contact the server, are you sure you're not offline?"]);
        } else {
          expect(false).toBeTruthy();
        }
        done();
      });
    }, specIsRunningTooLong);

    it("should be able to import from GitHub repository", function() {
      expect(true).toBeTruthy();
    });

  });

  describe("Database: as a user I want to be able to import via drag and drop", function() {
    it("should detect drag and drop", function() {
      expect(true).toBeTruthy();
    });
  });

  describe("Database: as a user I want to be able to go offline, but still have the most recent objects in my db available", function() {
    it("should have the most recent entries available", function() {
      expect(true).toBeTruthy();
    });
    it("should store the db offine", function() {
      expect(true).toBeTruthy();
    });
  });

});
