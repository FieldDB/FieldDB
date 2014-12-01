var CorpusMask = require("../../api/corpus/CorpusMask").CorpusMask;

describe("CorpusMask ", function() {

  it("should load", function() {
    expect(CorpusMask).toBeDefined();
  });

  it("should set the title as url", function() {
    var corpus = new CorpusMask();
    corpus.title = "Private corpus";
    expect(corpus.titleAsUrl).toEqual("private_corpus");
    corpus.title = "Iлｔèｒｎåｔïｏｎɑｌíƶａｔï߀ԉ";
    expect(corpus.titleAsUrl).toEqual("internationalization");

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
      replicatedCorpusUrls: [],
      olacExportConnections: [],
      publicCorpus: "",
      validationStati: [],
      tags: [],
      datumFields: [],
      participantFields: [],
      speakerFields: [],
      conversationFields: [],
      sessionFields: [],
      prefs: corpusJson.prefs,
      pouchname: "lingllama-communitycorpus",
      api: "corpora"
    });
  });


  it("should be able to have defaults", function() {
    var corpus = new CorpusMask(CorpusMask.prototype.defaults);
    expect(corpus.title).toEqual("Private Corpus");
    expect(corpus.titleAsUrl).toEqual("private_corpus");
    expect(corpus.description).toEqual("The details of this corpus are not public.");
    expect(corpus.location).toEqual({
      latitude: 0,
      longitude: 0,
      accuracy: 0
    });
    expect(corpus.replicatedCorpusUrls).toEqual([]);
    expect(corpus.olacExportConnections).toEqual([]);
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
