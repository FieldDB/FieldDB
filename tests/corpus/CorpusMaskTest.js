var FieldDBObject = require("../../api/FieldDBObject").FieldDBObject;
var CorpusMask = require("../../api/corpus/CorpusMask").CorpusMask;
var Connection = require("../../api/corpus/Connection").Connection;
var Corpora = require("../../api/corpus/Corpora").Corpora;
var URL = require("url");

describe("CorpusMask ", function() {

  afterEach(function() {
    if (FieldDBObject.application) {
      console.log("Cleaning up.");
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
      var currentVersion = corpus.version;
      corpus.dbname = "lingllama-communitycorpus";
      // delete corpus.prefs;
      var corpusJson = corpus.toJSON("complete");
      expect(corpusJson).toEqual({
        fieldDBtype: "CorpusMask",
        dbname: "lingllama-communitycorpus",
        version: currentVersion,
        dateCreated: 0,
        dateModified: 0,
        comments: [],
        sessions: [],
        datalists: [],
        title: "",
        titleAsUrl: "",
        description: "",
        termsOfUse: {},
        license: {},
        copyright: "",
        connection: {
          fieldDBtype: "Connection",
          dateCreated: corpusJson.connection.dateCreated,
          version: currentVersion,
          corpusid: "",
          titleAsUrl: "",
          dbname: "",
          pouchname: "",
          protocol: "",
          domain: "",
          port: "",
          path: "",
          userFriendlyServerName: "",
          authUrls: [],
          clientUrls: [],
          corpusUrls: [],
          lexiconUrls: [],
          searchUrls: [],
          audioUrls: [],
          activityUrls: [],
          title: "",
        },
        publicCorpus: "",
        validationStati: [],
        tags: [],
        fields: [],
        datumFields: [],
        participantFields: [],
        speakerFields: [],
        conversationFields: [],
        sessionFields: [],
        prefs: corpusJson.prefs,
        team: {},
        permissions: [],
        pouchname: "lingllama-communitycorpus",
        api: "corpora"
      });
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
      var connection = new Connection(Connection.defaultConnection(null, URL));
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
      var connection = new Connection(Connection.defaultConnection(null, URL));
      connection.dbname = "jenkins-firstcorpus";
      expect(connection.corpusUrls).toBeUndefined();
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
      var connection = Connection.defaultConnection(null, URL);
      expect(connection).toEqual({
        fieldDBtype: "Connection",
        protocol: "https://",
        domain: "localhost",
        port: "6984",
        path: "",
        serverLabel: "localhost",
        authUrls: ["https://localhost:3183"],
        // corpusUrls: ["https://localhost:6984"],
        userFriendlyServerName: "Localhost",
        version: connection.version,
        dbname: "",
        pouchname: "",
        title: "",
        titleAsUrl: "",
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
      expect(corpus.connection.toJSON().pouchname).toEqual("computationalfieldworkshop-group_data_entry_tutorial");

      expect(corpus.connection.toJSON().title).toEqual(corpus.title);
      expect(corpus.connection.toJSON().pouchname).toEqual(corpus.connection.pouchname);
      expect(corpus.connection.toJSON().dbname).toEqual(corpus.connection.pouchname);

      //if the parent dbname changes, so should the corpus connection
      var duplicatedCorpus = corpus.clone();
      duplicatedCorpus = new CorpusMask(duplicatedCorpus);
      duplicatedCorpus.dbname = "computationalfieldworkshop-group_data_entry_tutorial_copy";
      expect(duplicatedCorpus.connection.toJSON().dbname).toEqual("computationalfieldworkshop-group_data_entry_tutorial_copy");

      // connections.push(connection.toJSON("complete"));

    });
  });
});
