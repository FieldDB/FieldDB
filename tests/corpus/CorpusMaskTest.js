"use strict";
var CorpusMask;
var Connection;
var Corpora;
var FieldDBObject;
try {
  /* globals FieldDB */
  if (FieldDB) {
    CorpusMask = FieldDB.CorpusMask;
    Connection = FieldDB.Connection;
    Corpora = FieldDB.Corpora;
    FieldDBObject = FieldDB.FieldDBObject;
  }
} catch (e) {
  Connection = require("./../../api/corpus/Connection").Connection;
  Connection.URLParser = require("url");
}

CorpusMask = CorpusMask || require("./../../api/corpus/CorpusMask").CorpusMask;
Connection = Connection || require("./../../api/corpus/Connection").Connection;
Corpora = Corpora || require("./../../api/corpus/Corpora").Corpora;
FieldDBObject = FieldDBObject || require("./../../api/FieldDBObject").FieldDBObject;


describe("CorpusMask ", function() {

  afterEach(function() {
    if (FieldDBObject.application) {
      // console.log("Cleaning up.");
      FieldDBObject.application = null;
    }
  });

  describe("construction", function() {

    it("should load", function() {
      expect(CorpusMask).toBeDefined();
    });

    it("should set the title as url", function() {
      var corpus = new CorpusMask();
      corpus.title = "Private corpus";
      expect(corpus.titleAsUrl).toEqual("private_corpus");
      corpus.title = "Iлｔèｒｎåｔïｏｎɑｌíƶａｔï߀ԉ Of Quechua";
      expect(corpus.titleAsUrl).toEqual("internationalization_of_quechua");

    });

    it("should have unknown defaults if not loaded from the server", function() {
      var corpus = new CorpusMask(CorpusMask.defaults);
      corpus.dbname = "lingllama-communitycorpus";

      var corpusJson = corpus.toJSON("complete");
      expect(corpusJson.fieldDBtype).toEqual("CorpusMask");
      expect(corpusJson.dbname).toEqual("lingllama-communitycorpus");
      expect(corpusJson.version).toEqual(corpus.version);
      expect(corpusJson.dateCreated).toEqual(0);
      expect(corpusJson.dateModified).toEqual(0);
      expect(corpusJson.comments).toEqual([]);
      expect(corpusJson.sessions).toEqual([]);
      expect(corpusJson.datalists).toEqual([]);
      expect(corpusJson.title).toEqual("");
      expect(corpusJson.titleAsUrl).toEqual("");
      expect(corpusJson.description).toEqual("");
      expect(corpusJson.termsOfUse).toEqual({});
      expect(corpusJson.license).toEqual({});
      expect(corpusJson.copyright).toEqual("");
      // expect(corpusJson.connection).toEqual(corpusJson.connection);
      // expect(corpusJson.activityConnection).toEqual(corpusJson.activityConnection);
      expect(corpusJson.publicCorpus).toEqual("");
      expect(corpusJson.validationStati).toEqual([]);
      expect(corpusJson.tags).toEqual([]);
      expect(corpusJson.fields).toEqual([]);
      expect(corpusJson.datumFields).toEqual([]);
      expect(corpusJson.participantFields).toEqual([]);
      expect(corpusJson.speakerFields).toEqual([]);
      expect(corpusJson.conversationFields).toEqual([]);
      expect(corpusJson.sessionFields).toEqual([]);
      expect(corpusJson.prefs).toEqual(corpusJson.prefs);
      expect(corpusJson.team).toEqual({});
      expect(corpusJson.permissions).toEqual([]);
      expect(corpusJson.pouchname).toEqual("lingllama-communitycorpus");
      expect(corpusJson.api).toEqual("corpora");
      expect(corpusJson.team).toEqual({});
      expect(corpusJson.team).toEqual({});

      expect(corpusJson.connection.fieldDBtype).toEqual("Connection");
      expect(corpusJson.connection.dateCreated).toEqual(corpusJson.connection.dateCreated);
      expect(corpusJson.connection.version).toEqual(corpus.version);
      expect(corpusJson.connection.corpusid).toEqual("");
      expect(corpusJson.connection.titleAsUrl).toEqual("");
      expect(corpusJson.connection.dbname).toEqual("");
      expect(corpusJson.connection.pouchname).toEqual("");
      expect(corpusJson.connection.protocol).toEqual("");
      expect(corpusJson.connection.domain).toEqual("");
      expect(corpusJson.connection.port).toEqual("");
      expect(corpusJson.connection.path).toEqual("");
      expect(corpusJson.connection.userFriendlyServerName).toEqual("");
      expect(corpusJson.connection.authUrls).toEqual([]);
      expect(corpusJson.connection.clientUrls).toEqual([]);
      expect(corpusJson.connection.corpusUrls).toEqual([]);
      expect(corpusJson.connection.clientUrls).toEqual([]);
      expect(corpusJson.connection.lexiconUrls).toEqual([]);
      expect(corpusJson.connection.searchUrls).toEqual([]);
      expect(corpusJson.connection.audioUrls).toEqual([]);
      expect(corpusJson.connection.activityUrls).toEqual([]);
      // expect(corpusJson.connection.websiteUrls).toEqual([]);
      expect(corpusJson.connection.title).toEqual("");


      expect(corpusJson.activityConnection.fieldDBtype).toEqual("Connection");
      expect(corpusJson.activityConnection.dateCreated).toEqual(corpusJson.activityConnection.dateCreated);
      expect(corpusJson.activityConnection.version).toEqual(corpus.version);
      expect(corpusJson.activityConnection.corpusid).toEqual("");
      expect(corpusJson.activityConnection.titleAsUrl).toEqual("");
      expect(corpusJson.activityConnection.dbname).toEqual("");
      expect(corpusJson.activityConnection.pouchname).toEqual("");
      expect(corpusJson.activityConnection.protocol).toEqual("");
      expect(corpusJson.activityConnection.domain).toEqual("");
      expect(corpusJson.activityConnection.port).toEqual("");
      expect(corpusJson.activityConnection.path).toEqual("");
      expect(corpusJson.activityConnection.userFriendlyServerName).toEqual("");
      expect(corpusJson.activityConnection.authUrls).toEqual([]);
      expect(corpusJson.activityConnection.clientUrls).toEqual([]);
      expect(corpusJson.activityConnection.corpusUrls).toEqual([]);
      expect(corpusJson.activityConnection.clientUrls).toEqual([]);
      expect(corpusJson.activityConnection.lexiconUrls).toEqual([]);
      expect(corpusJson.activityConnection.searchUrls).toEqual([]);
      expect(corpusJson.activityConnection.audioUrls).toEqual([]);
      expect(corpusJson.activityConnection.activityUrls).toEqual([]);
      // expect(corpusJson.activityConnection.websiteUrls).toEqual([]);
      expect(corpusJson.activityConnection.title).toEqual("");

    });

    it("should be able to have defaults", function() {
      var corpus = new CorpusMask(CorpusMask.prototype.defaults);
      corpus.dbname = "jenkins-anothercorpus";
      expect(corpus.title).toEqual("Private Corpus");
      expect(corpus.titleAsUrl).toEqual("private_corpus");
      expect(corpus.description).toEqual("The details of this corpus are not public.");
      expect(corpus.location).toEqual({
        latitude: 0,
        longitude: 0,
        accuracy: 0
      });

      expect(corpus.dbname).toEqual("jenkins-anothercorpus");
      expect(corpus.connection.parent).toBeDefined();
      expect(corpus.connection.parent).toBe(corpus);
      expect(corpus.connection.dbname).toEqual("jenkins-anothercorpus");
      expect(corpus.connection.titleAsUrl).toEqual("private_corpus");
      expect(corpus.connection.owner).toEqual("jenkins");

      expect(corpus.termsOfUse).toEqual({
        "humanReadable": "Sample: The materials included in this corpus are available for research and educational use. If you want to use the materials for commercial purposes, please notify the author(s) of the corpus (myemail@myemail.org) prior to the use of the materials. Users of this corpus can copy and redistribute the materials included in this corpus, under the condition that the materials copied/redistributed are properly attributed.  Modification of the data in any copied/redistributed work is not allowed unless the data source is properly cited and the details of the modification is clearly mentioned in the work. Some of the items included in this corpus may be subject to further access conditions specified by the owners of the data and/or the authors of the corpus."
      });
      expect(corpus.license).toEqual({
        "title": "Default: Creative Commons Attribution-ShareAlike (CC BY-SA).",
        "humanReadable": "This license lets others remix, tweak, and build upon your work even for commercial purposes, as long as they credit you and license their new creations under the identical terms. This license is often compared to “copyleft” free and open source software licenses. All new works based on yours will carry the same license, so any derivatives will also allow commercial use. This is the license used by Wikipedia, and is recommended for materials that would benefit from incorporating content from Wikipedia and similarly licensed projects.",
        "imageUrl": "https://i.creativecommons.org/l/by/4.0/88x31.png",
        "link": "http://creativecommons.org/licenses/by-sa/3.0/"
      });
      expect(corpus.copyright).toEqual("Default: Add names of the copyright holders of the corpus.");
      expect(corpus.validationStati.length).toEqual(3);
      expect(corpus.validationStati.checked.color).toEqual("green");
      expect(corpus.validationStati.published.color).toEqual("blue");
      expect(corpus.validationStati.approvedlanguagelearningcontent.color).toEqual("green");
      expect(corpus.tags.length).toEqual(0);
      expect(corpus.comments.length).toEqual(0);
      expect(corpus.datumFields.length).toEqual(6);
      expect(corpus.datumFields.judgement.labelNonLinguists).toEqual("Not-a-normal-thing-to-say");
      expect(corpus.datumFields.orthography.labelNonLinguists).toEqual("Written");
      expect(corpus.datumFields.utterance.labelNonLinguists).toEqual("International Phonetic Alphabet (IPA)");
      expect(corpus.datumFields.morphemes.labelNonLinguists).toEqual("Segmentation");
      expect(corpus.datumFields.translation.labelNonLinguists).toEqual("English");
      expect(corpus.sessionFields.length).toEqual(4);
      expect(corpus.sessionFields.dialect.labelNonLinguists).toEqual("Dialect");
      expect(corpus.sessionFields.register.labelNonLinguists).toEqual("Social Register");
      expect(corpus.sessionFields.language.labelNonLinguists).toEqual("Language Name");
      expect(corpus.sessionFields.location.labelNonLinguists).toEqual("Location");
      expect(corpus.speakerFields.length).toEqual(1);
      expect(corpus.speakerFields.anonymouscode.labelNonLinguists).toEqual("Anonymous Code");

    });
  });

  describe("corpus collections", function() {

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
      expect(connection.corpusUrls).toEqual([]);
      expect(connection.corpusUrl).toEqual("https://localhost:6984/jenkins-firstcorpus");
      expect(connection.corpusUrls).toEqual(["https://localhost:6984/jenkins-firstcorpus"]);

      connection.corpusUrl = "https://corpusdev.anotherserver.ca/jenkins-firstcorpus";
      expect(connection.corpusUrl).toEqual("https://corpusdev.anotherserver.ca/jenkins-firstcorpus");
      expect(connection.corpusUrls).toEqual([
        "https://corpusdev.anotherserver.ca/jenkins-firstcorpus",
        "https://localhost:6984/jenkins-firstcorpus"
      ]);

      connection.corpusUrl = "https://corpus.example.org/jenkins-firstcorpus";
      expect(connection.corpusUrl).toEqual("https://corpus.example.org/jenkins-firstcorpus");
      expect(connection.corpusUrls).toEqual([
        "https://corpus.example.org/jenkins-firstcorpus",
        "https://corpusdev.anotherserver.ca/jenkins-firstcorpus",
        "https://localhost:6984/jenkins-firstcorpus"
      ]);

      connection.corpusUrl = "https://localhost:6984/jenkins-firstcorpus";
      expect(connection.corpusUrl).toEqual("https://localhost:6984/jenkins-firstcorpus");
      expect(connection.corpusUrls).toEqual([
        "https://localhost:6984/jenkins-firstcorpus",
        "https://corpus.example.org/jenkins-firstcorpus",
        "https://corpusdev.anotherserver.ca/jenkins-firstcorpus"
      ]);

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

    it("should be able to extract a connection from a mask", function() {
      expect(Corpora).toBeDefined();
      var corpora = new Corpora();
      expect(corpora).toBeDefined();

      var corpus = new CorpusMask({
        _id: "corpus",
        _rev: "3-56789fghj5678dfgh567fghjtyu456",
        title: "Group Data Entry tutorial"
      });
      corpus.connection = {
        "protocol": "https://",
        "domain": "corpus.example.org",
        "port": "443",
        "dbname": "computationalfieldworkshop-group_data_entry_tutorial",
        "path": "",
        "authUrls": ["https://auth.example.org"],
        "userFriendlyServerName": "Example.org",
        "corpusid": "",
        "title": "computatio..._entry_tutoria",
        "description": "The details of this corpus are not public.",
        "titleAsUrl": "computatio____entry_tutoria"
      };

      expect(corpus.connection.pouchname).toEqual("computationalfieldworkshop-group_data_entry_tutorial");
      expect(corpus.connection.title).toEqual(corpus.title);
      expect(corpus.connection.pouchname).toEqual(corpus.connection.pouchname);
      expect(corpus.connection.dbname).toEqual(corpus.connection.pouchname);

      var serializedCorpusConnection = corpus.connection.toJSON();
      expect(serializedCorpusConnection.pouchname).toEqual("computationalfieldworkshop-group_data_entry_tutorial");
      expect(serializedCorpusConnection.title).toEqual(corpus.title);
      expect(serializedCorpusConnection.pouchname).toEqual(corpus.connection.pouchname);
      expect(serializedCorpusConnection.dbname).toEqual(corpus.connection.pouchname);

      //if the parent dbname changes, so should the corpus connection
      var duplicatedCorpus = corpus.clone();
      duplicatedCorpus = new CorpusMask(duplicatedCorpus);
      duplicatedCorpus.dbname = "computationalfieldworkshop-group_data_entry_tutorial_copy";
      expect(duplicatedCorpus.connection.toJSON().dbname).toEqual("computationalfieldworkshop-group_data_entry_tutorial_copy");

      // connections.push(connection.toJSON("complete"));

    });
  });
});
