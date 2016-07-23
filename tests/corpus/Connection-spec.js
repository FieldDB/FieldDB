"use strict";
var Connection;
try {
  /* globals FieldDB */
  if (FieldDB) {
    Connection = FieldDB.Connection;
  }
} catch (e) {
  Connection = require("./../../api/corpus/Connection").Connection;
  Connection.URLParser = require("url");
}

describe("Connection ", function() {

  describe("construction", function() {

    it("should load", function() {
      expect(Connection).toBeDefined();
    });

  });

  describe("serialization", function() {

    it("should serialize", function() {
      var connection = new Connection().toJSON();
      expect(connection).toEqual({
        fieldDBtype: 'Connection',
        corpusUrls: undefined,
        brandLowerCase: '',
        version: connection.version,
        dbname: '',
        pouchname: '',
        title: '',
        titleAsUrl: ''
      });
    });

  });

  describe("urls", function() {

    it("should be able to set an auth url", function() {
      var connection = new Connection(Connection.defaultConnection());
      expect(connection.authUrls).toEqual(["https://localhost:3183"]);
      expect(connection.authUrl).toEqual("https://localhost:3183");

      connection.authUrl = "https://auth.anotherserver.ca";
      expect(connection.authUrl).toEqual("https://auth.anotherserver.ca");
      expect(connection.authUrls).toEqual([
        "https://auth.anotherserver.ca",
        "https://localhost:3183"
      ]);

      connection.authUrl = "https://authdev.fieldlinguist.com:3183";
      expect(connection.authUrl).toEqual("https://auth.lingsync.org");
      expect(connection.authUrls).toEqual([
        "https://auth.lingsync.org",
        "https://auth.anotherserver.ca",
        "https://localhost:3183",
      ]);
      connection.authUrl = "https://localhost:3183";
      expect(connection.authUrl).toEqual("https://localhost:3183");
      expect(connection.authUrls).toEqual([
        "https://localhost:3183",
        "https://auth.lingsync.org",
        "https://auth.anotherserver.ca"
      ]);
    });


    it("should be to deduce a dbname if entered invalidly", function() {
      var connection = new Connection();
      connection.dbname = "jenkins-firstcorpus";

      expect(connection.dbname).toEqual("jenkins-firstcorpus");
    });

    it("should be able to figure out a corpus url", function() {
      var connection = new Connection(Connection.defaultConnection());
      connection.dbname = "jenkins-firstcorpus";
      expect(connection.corpusUrl).toEqual("https://localhost:6984/jenkins-firstcorpus");
      expect(connection.corpusUrls).toEqual(["https://localhost:6984/jenkins-firstcorpus"]);

      connection = new Connection(Connection.defaultConnection());
      connection.corpusUrl = "https://corpusdev.anotherserver.ca/jenkins-firstcorpus";
      expect(connection.corpusUrl).toEqual("https://corpusdev.anotherserver.ca/jenkins-firstcorpus");
      expect(connection.corpusUrls).toEqual([
        "https://corpusdev.anotherserver.ca/jenkins-firstcorpus"
      ]);

      connection.corpusUrl = "https://corpus.example.org/jenkins-firstcorpus";
      expect(connection.corpusUrl).toEqual("https://corpus.example.org/jenkins-firstcorpus");
      expect(connection.corpusUrls).toEqual([
        "https://corpus.example.org/jenkins-firstcorpus",
        "https://corpusdev.anotherserver.ca/jenkins-firstcorpus"
      ]);

      connection.corpusUrl = "https://localhost:6984/jenkins-firstcorpus";
      expect(connection.corpusUrl).toEqual("https://localhost:6984/jenkins-firstcorpus");
      expect(connection.corpusUrls).toEqual([
        "https://localhost:6984/jenkins-firstcorpus",
        "https://corpus.example.org/jenkins-firstcorpus",
        "https://corpusdev.anotherserver.ca/jenkins-firstcorpus"
      ]);
    });

    it("should not use a corpus server url without the dbname", function() {
      var connection = new Connection({
        corpusUrls: [
          "https://localhost:6984",
          "https://corpusdev.lingsync.org",
          "https://anothercorpus.url.somewhere",
          "https://corpus.lingsync.org"
        ]
      });
      expect(connection.corpusUrl).toEqual("https://anothercorpus.url.somewhere");

      connection = new Connection(Connection.defaultConnection());
      connection.dbname = "jenkins-firstcorpus";
      expect(connection.corpusUrl).toEqual("https://localhost:6984/jenkins-firstcorpus");
    });

    it("should be able to get a default connection", function() {
      var connection = Connection.defaultConnection();
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
        brandLowerCase: "localhost",
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

    it("should be able to get a couch url from a deprecated connection", function() {
      var connection = new Connection({
        "protocol": "https://",
        "domain": "corpus.example.org",
        "port": "443",
        "pouchname": "lingllama-communitycorpus",
        "path": "",
        "authUrls": ["https://auth.example.org"],
        "userFriendlyServerName": "Example.org",
        "corpusid": "",
        "title": "lingllama-communitycorpus",
        "description": "The details of this corpus are not public.",
        "titleAsUrl": "lingllama-communitycorpus"
      });
      expect(connection.corpusUrl).toEqual("https://corpus.example.org/lingllama-communitycorpus");
    });
  });
});
