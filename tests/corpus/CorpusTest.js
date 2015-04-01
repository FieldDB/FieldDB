var Corpus = require("../../api/corpus/Corpus").Corpus;
var SAMPLE_v1_CORPUS_MODELS = require("../../sample_data/corpus_v1.22.1.json");
var DatumFields = require("../../api/datum/DatumFields").DatumFields;

var specIsRunningTooLong = 5000;

describe("Corpus", function() {
  it("should be load", function() {
    expect(Corpus).toBeDefined();
  });

  describe("construction options", function() {

    it("should serialize the pouchname", function() {
      var corpus = new Corpus(SAMPLE_v1_CORPUS_MODELS[0]);
      expect(corpus.dbname).toEqual("sapir-firstcorpus");
      expect(corpus.pouchname).toEqual("sapir-firstcorpus");
      expect(corpus.pouchname).toEqual(corpus.dbname);

      var serialized = corpus.toJSON();
      expect(serialized.pouchname).toBeDefined();
    });

    it("should not add datumfields if they werent there", function() {
      var corpus = new Corpus({
        dbname: "lingllama-communitycorpus"
      });
      expect(corpus.dbname).toEqual("lingllama-communitycorpus");
      expect(corpus.pouchname).toEqual("lingllama-communitycorpus");

      var serialized = corpus.toJSON();
      expect(serialized.pouchname).toBeDefined();
      expect(serialized.datumfields).toBeUndefined();
    });

    it("should not be able to change a dbname if it has been set", function() {
      var corpus = new Corpus(Corpus.prototype.defaults);
      corpus.id = "aneixstingsavedthingy";
      corpus.rev = "3-siamweoiamwoawem";
      expect(corpus.dbname).toEqual("");
      corpus.dbname = "testingdefaultcorpuscreation-kartuli";
      expect(function() {
        corpus.dbname = "adiffernetuser-kartuli";
      }).toThrow("This is the testingdefaultcorpuscreation-kartuli. You cannot change the dbname of an object in this corpus, you must create a clone of the object first.");
    });

    it("should be able to build a corpus by calling defaults", function() {
      var corpus;
      corpus = new Corpus(Corpus.prototype.defaults);
      expect(corpus.confidential).toBeDefined();
      expect(corpus.confidential.secretKey).toBeDefined();
      // expect(corpus.confidential.secretKey.length).toEqual(45);
      expect(corpus.confidential.secretKey.length).toBeGreaterThan(10);
    });

  });

  describe("prefs", function() {
    it("should be possible to set team preferences for a view", function() {
      var corpus = new Corpus(JSON.parse(JSON.stringify(SAMPLE_v1_CORPUS_MODELS[0])));
      expect(corpus.prefs).toBeUndefined();
      corpus.preferredDashboardLayout = "layoutEverythingAtOnce";
      corpus.preferredDatumTemplate = "yalefieldmethodsspring2014template";
      corpus.preferredLocale = "fr";

      var serialized = corpus.toJSON();
      expect(serialized.prefs.fieldDBtype).toEqual("UserPreference");
      expect(serialized.prefs.preferredDashboardLayout).toEqual("layoutEverythingAtOnce");
      expect(serialized.prefs.preferredDatumTemplate).toBeUndefined();
      expect(serialized.prefs.preferredLocale).toEqual("fr");

      corpus.preferredDatumTemplate = "default";
      expect(corpus.preferredDatumTemplate).toBeUndefined();
    });

    it("should be able to reorder corpus fields for spreadsheet fields order", function() {
      var corpus = new Corpus(JSON.parse(JSON.stringify(SAMPLE_v1_CORPUS_MODELS[0])));
      expect(corpus.datumFields.fieldDBtype).toEqual("DatumFields");
      expect(corpus.prefs).toBeUndefined();
      expect(corpus.datumFields.map(function(field) {
        return field.id;
      })).toEqual(["judgement", "utterance", "morphemes", "gloss", "translation", "dateElicited", "notes", "checkedWithConsultant", "dialect"]);

      corpus.preferredDatumTemplate = "yalefieldmethodsspring2014template";
      expect(corpus.datumFields.map(function(field) {
        return field.id;
      })).toEqual(["judgement", "orthography", "utterance", "morphemes", "gloss", "translation", "spanish", "housekeeping", "tags", "dateElicited", "notes", "checkedWithConsultant", "dialect"]);
      expect(corpus.preferredDatumTemplate).toBeUndefined();
      expect(corpus.preferredDatumTemplateAtVersion).toEqual(corpus.version);
    });



  });

  describe("datum creation", function() {
    var corpus;

    beforeEach(function() {
      // console.log(Corpus.prototype.defaults);
      corpus = new Corpus(Corpus.prototype.defaults);
      corpus.dbname = "testingnewdatum-kartuli";
      corpus.title = "ქართული";
    });

    it("should have default datumFields", function() {
      expect(corpus.datumFields instanceof DatumFields).toBeTruthy();
      expect(corpus.datumFields.constructor === DatumFields);
      corpus.debug(corpus.datumFields.utterance);
      corpus.debug(corpus.datumFields.toJSON());
      expect(corpus.datumFields.utterance.labelFieldLinguists).toEqual("Transcription");
      expect(corpus.datumFields.clone()).toBeDefined();
    });

    it("should create a datum with the datumFields of the corpus", function() {
      var datum = corpus.newDatum({
        utterance: "a simple object",
        translation: "with translation",
        novelproperty: "a field which is not known and will be a property not a full field"
      });
      corpus.debug(datum.toJSON());
      expect(datum.datumFields.utterance.labelFieldLinguists).toEqual("Transcription");
      expect(datum.datumFields.utterance.value).toEqual("a simple object");
      expect(datum.datumFields.translation.value).toEqual("with translation");
      expect(datum.datumFields.novelproperty).toBeUndefined();
      expect(datum.novelproperty).toEqual("a field which is not known and will be a property not a full field");
    });

    it("should also create a datum with datumFields asynchonously", function(done) {
      corpus.newDatumAsync().then(function(datum) {
        corpus.debug(datum.toJSON());
        expect(datum.datumFields.utterance.labelFieldLinguists).toEqual("Transcription");
      }).then(done, done);
    }, specIsRunningTooLong);

    it("should create a corpus with a similar structure", function() {
      corpus.datumFields.utterance.value = "the last thing i searched for";

      // add some fields
      expect(corpus.datumFields.length).toEqual(16);
      corpus.datumFields.push(corpus.newField({
        "id": "phonetics"
      }));
      corpus.datumFields.push(corpus.newField({
        "id": "semanticContext"
      }));
      corpus.datumFields.push(corpus.newField({
        "id": "anotherfieldtheteamwantedtohave"
      }));

      // remove some fields
      expect(corpus.datumFields.length).toEqual(19);
      expect(corpus.datumFields.syntactictreelatex).toBeDefined();
      corpus.datumFields.remove(corpus.datumFields.syntactictreelatex);
      expect(corpus.datumFields.syntactictreelatex).toBeUndefined();
      expect(corpus.datumFields.length).toEqual(18);

      expect(corpus.dbname).toEqual("testingnewdatum-kartuli");

      var newcorpus = corpus.newCorpus();
      expect(newcorpus.dbname).toEqual("testingnewdatum-kartulicopy");

      corpus.debug(newcorpus.toJSON());
      expect(newcorpus.title).toEqual("ქართული copy");

      expect(newcorpus.datumFields.utterance).not.toEqual(corpus.datumFields.utterance);
      expect(corpus.datumFields.utterance.value).toEqual("the last thing i searched for");
      expect(newcorpus.datumFields.utterance.value).toEqual("");

      // added fields are there
      expect(newcorpus.datumFields.phonetics).toBeDefined();
      expect(newcorpus.datumFields.semanticContext).toBeDefined();
      expect(newcorpus.datumFields.anotherfieldtheteamwantedtohave).toBeDefined();

      // removed fields are not there
      expect(newcorpus.datumFields.syntactictreelatex).toBeUndefined();

    });

    it("should create a default corpus if called on the user's practice firstcorpus", function() {
      corpus.dbname = "firstcorpus";
      corpus.datumFields.utterance.value = "the last thing i searched for";
      corpus.datumFields.push(corpus.newField({
        "id": "phonetics"
      }));
      corpus.datumFields.push(corpus.newField({
        "id": "semanticContext"
      }));
      corpus.datumFields.push(corpus.newField({
        "id": "anotherfieldtheteamwantedtohave"
      }));

      var newcorpus = corpus.newCorpus({
        title: "Azeri"
      });
      corpus.debug(newcorpus.toJSON());
      expect(newcorpus.title).toEqual("Azeri");
      expect(newcorpus.title).not.toEqual("ქართული copy");

      expect(newcorpus.datumFields.phonetics).toBeUndefined();
      expect(newcorpus.datumFields.semanticContext).toBeUndefined();
      expect(newcorpus.datumFields.anotherfieldtheteamwantedtohave).toBeUndefined();
    });

  });

  describe("datum/speaker/participant field updates", function() {
    var corpus;

    beforeEach(function() {
      // console.log(Corpus.prototype.defaults);
      corpus = new Corpus(Corpus.prototype.defaults);
      corpus.dbname = "testingnewdatum-kartuli";
    });

    it("should update a speaker to have all the current corpus speakerFields in the same order", function(done) {
      expect(corpus.confidential).toBeDefined();
      expect(corpus.confidential.secretkey).toBeDefined();
      expect(corpus.confidential.secretKey.length).toBeGreaterThan(10);

      corpus.newSpeaker().then(function(speaker) {
        corpus.debug(speaker);

        expect(speaker).toBeDefined();
        expect(speaker.confidential).toEqual(corpus.confidential);

        expect(speaker.fields.length).toEqual(8);
        expect(speaker.fields.indexOf("lastname")).toEqual(2);
        speaker.fields = [];
        speaker.fields.add({
          "type": "",
          "_id": "lastname",
          "shouldBeEncrypted": true,
          "encrypted": true,
          "showToUserTypes": "all",
          "defaultfield": true,
          "help": "The last name of the speaker/participant (encrypted)",
          "helpLinguists": "The last name of the speaker/participant (optional, encrypted if speaker should remain anonymous)",
          "version": "v2.0.1",
          "comments": [],
          "labelExperimenters": "Nom de famille",
          "encryptedValue": "confidential:VTJGc2RHVmtYMStRd0JOWGFrQk9sZlp3ZFh3cldNa3NqbWVRMVY4ektSND0=",
          "mask": "xxxxxx",
          "value": "xxxxxx",
          "dbname": "",
          "dateCreated": 0,
          "dateModified": 0
        });
        speaker.fields.add({
          "id": "aFieldFromImport",
          "shouldBeEncrypted": true,
          "encrypted": true,
          "encryptedValue": "confidential:VTJGc2RHVmtYMStRd0JOWGFrQk9sZlp3ZFh3cldNa3NqbWVRMVY4ektSND0=",
          "mask": "xxxxxx xxxxxxxxxxxx ",
          "value": "xxxxxx xxxxxxxxxxxx ",
          "showToUserTypes": "all",
          "defaultfield": true,
          "help": "This field came from import.",
        });
        expect(speaker.fields.lastname.value).toEqual("xxxxxx");
        expect(speaker.fields.afieldfromimport.value).toEqual("xxxxxx xxxxxxxxxxxx");
        expect(speaker.fields.length).toEqual(2);
        corpus.updateSpeakerToCorpusFields(speaker);
        expect(speaker.fields.length).toEqual(9);
        expect(speaker.fields.lastname.value).toEqual("xxxxxx");
        expect(corpus.speakerFields.lastname.value).toEqual("");
        expect(speaker.fields.afieldfromimport.value).toEqual("xxxxxx xxxxxxxxxxxx");
        expect(speaker.fields.indexOf("lastname")).toEqual(corpus.speakerFields.indexOf("lastname"));

        corpus.debug(speaker.toJSON());
      }).then(done, done);
    }, specIsRunningTooLong);

    it("should update a speaker to become a participant with all the participantFields in the same order", function(done) {
      corpus.newSpeaker().then(function(speaker) {
        corpus.debug(speaker);


        // the speaker starts with the expected number
        expect(speaker.fields.length).toEqual(8);
        expect(speaker.fields.indexOf("lastname")).toEqual(2);

        // remove all the fields from the speaker
        speaker.fields = [];
        speaker.fields.add({
          "type": "",
          "_id": "lastname",
          "shouldBeEncrypted": true,
          "encrypted": true,
          "showToUserTypes": "all",
          "defaultfield": true,
          "help": "The last name of the speaker/participant (encrypted)",
          "helpLinguists": "The last name of the speaker/participant (optional, encrypted if speaker should remain anonymous)",
          "version": "v2.0.1",
          "comments": [],
          "labelExperimenters": "Nom de famille",
          "encryptedValue": "confidential:VTJGc2RHVmtYMStRd0JOWGFrQk9sZlp3ZFh3cldNa3NqbWVRMVY4ektSND0=",
          "mask": "xxxxxx",
          "value": "xxxxxx",
          "dbname": "",
          "dateCreated": 0,
          "dateModified": 0
        });
        speaker.fields.add({
          "id": "aFieldFromImport",
          "shouldBeEncrypted": true,
          "encrypted": true,
          "encryptedValue": "confidential:VTJGc2RHVmtYMStRd0JOWGFrQk9sZlp3ZFh3cldNa3NqbWVRMVY4ektSND0=",
          "mask": "xxxxxx xxxxxxxxxxxx ",
          "value": "xxxxxx xxxxxxxxxxxx ",
          "showToUserTypes": "all",
          "defaultfield": true,
          "help": "This field came from import.",
        });
        expect(speaker.fields.lastname.value).toEqual("xxxxxx");
        expect(speaker.fields.afieldfromimport.value).toEqual("xxxxxx xxxxxxxxxxxx");
        expect(speaker.fields.length).toEqual(2);

        // update the speaker to have the fields of the corpus, and cause the corpus to become an experimental corpus if it wasnt already.
        expect(corpus.participantFields).toBeUndefined();
        corpus.updateParticipantToCorpusFields(speaker);
        expect(corpus.participantFields.length).toEqual(10);

        expect(speaker.fields.length).toEqual(11);
        expect(speaker.fields.lastname.value).toEqual("xxxxxx");
        expect(corpus.speakerFields.lastname.value).toEqual("");
        expect(speaker.fields.afieldfromimport.value).toEqual("xxxxxx xxxxxxxxxxxx");
        expect(speaker.fields.indexOf("lastname")).toEqual(corpus.speakerFields.indexOf("lastname"));

      }).then(done, done);
      // console.log(speaker.toJSON());
    }, specIsRunningTooLong);
  });

  describe("serialization ", function() {

    it("should serialize v1.22.1 to a standard json", function() {
      var corpus = new Corpus(JSON.parse(JSON.stringify(SAMPLE_v1_CORPUS_MODELS[0])));
      var serialization = corpus.toJSON();
      expect(serialization.team).toEqual({});
    });

    it("should serialize v2.30.x to a standard json", function() {
      var corpus = new Corpus(JSON.parse(JSON.stringify(SAMPLE_v1_CORPUS_MODELS[1])));
      var serialization = corpus.toJSON();
      expect(serialization.team.gravatar).toEqual("888888we8888888888888");
      expect(serialization.team.username).toEqual("lingllama");

      expect(corpus.connection.gravatar).toEqual("888888we8888888888888");
    });

    xit("should clean v1.22.1 to a maximal json", function() {
      var corpus = new Corpus(SAMPLE_v1_CORPUS_MODELS[0]);
      expect(corpus.toJSON("complete")).toEqual("");
    });

    xit("should clean v1.22.1 to a minimaljson", function() {
      var corpus = new Corpus(SAMPLE_v1_CORPUS_MODELS[0]);
      expect(corpus.toJSON(null, "lightweight")).toEqual({
        _id: "60B9B35A-A6E9-4488-BBF7-CB54B09E87C1",
        _rev: "19-863850b93c42a90205017215a45b7668",
        title: "Sample Corpus",
        titleAsUrl: "sample_corpus",
        description: "This is a sample corpus which I made by importing one of my colleagues data files from FileMaker Pro.  It has some comments in it to explain what I did to make the corpus and search it.",
        datumFields: [{
          "label": "dateElicited",
          "value": "",
          "mask": "",
          "encrypted": "",
          "shouldBeEncrypted": "checked",
          "help": "This field came from file import ",
          "userchooseable": ""
        }, {
          "label": "notes",
          "value": "",
          "mask": "",
          "encrypted": "",
          "shouldBeEncrypted": "checked",
          "help": "This field came from file import ",
          "userchooseable": ""
        }, {
          "label": "checkedWithConsultant",
          "value": "lucia",
          "mask": "lucia",
          "encrypted": "",
          "shouldBeEncrypted": "checked",
          "help": "This field came from file import ",
          "userchooseable": ""
        }, {
          "label": "dialect",
          "value": "",
          "mask": "",
          "encrypted": "",
          "shouldBeEncrypted": "checked",
          "help": "This field came from file import ",
          "userchooseable": ""
        }],
        dbname: "sapir-firstcorpus",
        confidential: {
          secretkey: "8acfb0d3-9ce4-3c02-e7c1-f56b78b705dd"
        },
        publicCorpus: "Private",
        version: "v2.0.1"
      });
    });

  });



  describe("Corpus: as a user I want to be able to merge two corpora", function() {
    var oneCorpus;
    var anotherCorpus;

    beforeEach(function() {
      oneCorpus = new Corpus({
        dbname: "teammatetiger-quechua",
        title: "Quechua Corpus",
        datumFields: [{
          "label": "utterance",
          "help": "Teammate's help info"
        }]
      });
      anotherCorpus = new Corpus({
        dbname: "lingllama-quechua",
        title: "Quechua",
        datumFields: [{
          "label": "utterance",
          "help": "An adapted utterance line for quechua data"
        }]
      });
    });

    it("should merge the corpus details into the first corpus", function() {
      oneCorpus.merge("self", anotherCorpus, "overwrite&changeDBname");
      expect(oneCorpus).toBeDefined();
      expect(oneCorpus.title).toEqual("Quechua");
      expect(oneCorpus.datumFields.utterance.help).toEqual("An adapted utterance line for quechua data");
    });

    it("should be able to ask the user what to do if the corpus details conflict", function() {
      oneCorpus.merge("self", anotherCorpus, "changeDBname");
      expect(oneCorpus).toBeDefined();
      expect(oneCorpus.confirmMessage).toContain("I found a conflict for _dbname, Do you want to overwrite it from \"teammatetiger-quechua\" -> \"lingllama-quechua\"");
      expect(oneCorpus.confirmMessage).toContain("I found a conflict for _title, Do you want to overwrite it from \"Quechua Corpus\" -> \"Quechua\"");
      expect(oneCorpus.confirmMessage).toContain("I found a conflict for _titleAsUrl, Do you want to overwrite it from \"quechua_corpus\" -> \"quechua\"");
    });

    it("should merge the corpus details into a third corpus without affecting the other corpora", function() {
      var aNewCorpus = new Corpus({
        dbname: "comunity-quechua",
        datumFields: [{
          "label": "morphemes",
          "help": "A help text"
        }]
      });
      expect(aNewCorpus.dbname).toEqual("comunity-quechua");
      expect(aNewCorpus.title).toEqual("");

      aNewCorpus.merge(oneCorpus, anotherCorpus, "overwrite&keepDBname");
      expect(aNewCorpus).toBeDefined();

      expect(aNewCorpus.dbname).toEqual("comunity-quechua");
      expect(aNewCorpus.title).toEqual("Quechua");
      expect(aNewCorpus.datumFields.morphemes.help).toEqual("A help text");
      expect(aNewCorpus.datumFields.utterance.help).toEqual("An adapted utterance line for quechua data");

      expect(oneCorpus.dbname).toEqual("teammatetiger-quechua");
      expect(oneCorpus.title).toEqual("Quechua Corpus");
      expect(oneCorpus.datumFields.utterance.help).toEqual("Teammate's help info");
      expect(oneCorpus.datumFields.morphemes).toBeUndefined();

      expect(anotherCorpus.dbname).toEqual("lingllama-quechua");
      expect(anotherCorpus.title).toEqual("Quechua");
      expect(anotherCorpus.datumFields.utterance.help).toEqual("An adapted utterance line for quechua data");
      expect(anotherCorpus.datumFields.morphemes).toBeUndefined();

    });

    xit("should change the dbname of the datum to the target corpus dbname", function() {
      expect(true).toBeTruthy();
    });

  });


  describe("Corpus: as a psycholinguist I want to have any number of fields on my participants.", function() {
    it("should be have speaker fields on participants", function() {
      expect(Corpus.prototype.defaults_psycholinguistics.participantFields.length).toBe(10);
    });
  });


  describe("Corpus: as a team we want to be able to go back in time in the corpus revisions", function() {
    it("should be able to import from GitHub repository", function() {
      expect(true).toBeTruthy();
    });
  });


  describe("Build fields using fields in the corpus", function() {

    it("should find existing fields", function() {
      var corpus = new Corpus();
      var normalizedField = corpus.normalizeFieldWithExistingCorpusFields("lastname");
      expect(normalizedField.id).toEqual("lastname");
      expect(normalizedField.help).toEqual("The last name of the speaker/participant (optional, encrypted if speaker should remain anonymous)");
    });

    it("should ignore empty fields", function() {
      var corpus = new Corpus();
      var normalizedField = corpus.normalizeFieldWithExistingCorpusFields("");
      expect(normalizedField).toBeUndefined();

      normalizedField = corpus.normalizeFieldWithExistingCorpusFields(" ");
      expect(normalizedField).toBeUndefined();

      normalizedField = corpus.normalizeFieldWithExistingCorpusFields({});
      expect(normalizedField).toBeUndefined();

      normalizedField = corpus.normalizeFieldWithExistingCorpusFields({
        id: ""
      });
      expect(normalizedField).toBeUndefined();

      normalizedField = corpus.normalizeFieldWithExistingCorpusFields({
        label: ""
      });
      expect(normalizedField).toBeUndefined();
    });

    it("should create new fields", function() {
      var corpus = new Corpus();
      var normalizedField = corpus.normalizeFieldWithExistingCorpusFields("Seat number");
      expect(normalizedField.id).toEqual("seatNumber");
      expect(normalizedField.labelFieldLinguists).toEqual("Seat number");
      expect(normalizedField.help).toEqual("Put your team's data entry conventions here (if any)...");
    });

    it("should normalize french fields to their english equivalents", function() {
      var corpus = new Corpus();
      var normalizedField = corpus.normalizeFieldWithExistingCorpusFields("Code Permanent");
      expect(normalizedField.id).toEqual("anonymousCode");
      expect(normalizedField.labelExperimenters).toEqual("Code Permanent");
      expect(normalizedField.help).toEqual("A field to anonymously identify language consultants/informants/experiment participants (by default it can be a timestamp, or a combination of experimenter initials, speaker/participant initials etc).");
    });

    it("should find existing non default fields", function() {
      var corpus = new Corpus({
        datumFields: [{
          label: "nodefaultfieldsinthiscorpus"
        }]
      });
      var normalizedField = corpus.normalizeFieldWithExistingCorpusFields("syntacticTreeLatex");
      expect(normalizedField.id).toEqual("syntacticTreeLatex");
      normalizedField = corpus.normalizeFieldWithExistingCorpusFields("utterance");
      expect(normalizedField.id).toEqual("utterance");
      expect(normalizedField.help).toEqual("Put your team's data entry conventions here (if any)...");
    });

  });

  describe("Corpus: as a user I want to be able to import via drag and drop", function() {
    it("should detect drag and drop", function() {
      expect(true).toBeTruthy();
    });
  });

  describe("Corpus: as a user I want to be able to go offline, but still have the most recent objects in my corpus available", function() {
    it("should have the most recent entries available", function() {
      expect(true).toBeTruthy();
    });
    it("should store the corpus offine", function() {
      expect(true).toBeTruthy();
    });
  });

});
