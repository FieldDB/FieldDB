var Corpus = require("../../api/corpus/Corpus").Corpus;
var SAMPLE_v1_CORPUS_MODELS = require("../../sample_data/corpus_v1.22.1.json");

describe("Corpus", function() {
  it("should be load", function() {
    expect(Corpus).toBeDefined();
  });

  describe("construction options", function() {
    var corpus;

    beforeEach(function() {
      corpus = new Corpus({
        pouchname: "lingllama-communitycorpus"
      });
    });

    it("should accept v1.22.1 json", function() {
      corpus = new Corpus(SAMPLE_v1_CORPUS_MODELS[0]);
      expect(corpus.dbname).toEqual("sapir-firstcorpus");
      expect(corpus.pouchname).toEqual("sapir-firstcorpus");

      var serialized = corpus.toJSON();
      expect(serialized.pouchname).toBeUndefined();
    });

    it("should accept v2.2 json", function() {
      corpus = new Corpus({
        dbname: "lingllama-communitycorpus"
      });
      expect(corpus.dbname).toEqual("lingllama-communitycorpus");
      expect(corpus.pouchname).toEqual("lingllama-communitycorpus");

      var serialized = corpus.toJSON();
      expect(serialized.pouchname).toBeUndefined();
      expect(serialized.datumfields).toBeUndefined();
    });

  });

  describe("serialization ", function() {


    xit("should clean v1.22.1 to a maximal json", function() {
      var corpus = new Corpus(SAMPLE_v1_CORPUS_MODELS[0]);
      expect(corpus.toJSON("complete")).toEqual('');
    });

    xit("should clean v1.22.1 to a minimaljson", function() {
      var corpus = new Corpus(SAMPLE_v1_CORPUS_MODELS[0]);
      expect(corpus.toJSON(null, "lightweight")).toEqual({
        _id: '60B9B35A-A6E9-4488-BBF7-CB54B09E87C1',
        _rev: '19-863850b93c42a90205017215a45b7668',
        title: 'Sample Corpus',
        titleAsUrl: 'sample_corpus',
        description: 'This is a sample corpus which I made by importing one of my colleagues data files from FileMaker Pro.  It has some comments in it to explain what I did to make the corpus and search it.',
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
        dbname: 'sapir-firstcorpus',
        confidential: {
          secretkey: '8acfb0d3-9ce4-3c02-e7c1-f56b78b705dd'
        },
        publicCorpus: 'Private',
        version: 'v2.0.1'
      });
    });

  });

});

describe("Corpus: as a team we want to be able to go back in time in the corpus revisions", function() {
  it("should be able to import from GitHub repository", function() {
    expect(true).toBeTruthy();
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
