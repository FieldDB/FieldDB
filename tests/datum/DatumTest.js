var Datum = require("./../../api/datum/Datum").Datum;
var sample_1_22_datum = require("./../../sample_data/datum_v1.22.1.json");
var SAMPLE_CORPUS = require("./../../api/corpus/corpus.json");

describe("Test Datum", function() {
  it("should load", function() {
    expect(Datum).toBeDefined();

    var datum = new Datum();
    expect(datum).toBeDefined();
  });

  describe("popular fields", function() {
    var datum = new Datum({
      fields: JSON.parse(JSON.stringify(SAMPLE_CORPUS.datumFields))
    });

    it("should get the fields from the corpus", function() {
      expect(datum.fields.length).toEqual(16);
    });

    it("should set the utterance", function() {
      datum.fields.utterance.value = "Noqata";
      expect(datum.fields.utterance.value).toEqual("Noqata");
      expect(datum.fields.utterance.json).toEqual({
        writingSystem: {
          id: '',
          referenceLink: ''
        }
      });
    });

    it("should have a morphemes line ", function() {
      datum.fields.morphemes.value = "noqa-ta";
      expect(datum.fields.morphemes.value).toEqual("noqa-ta");
      expect(datum.fields.morphemes.json).toEqual({
        alternates: []
      });
    });

    it("should have a gloss line ", function() {
      datum.fields.gloss.value = "I-ACC";
      expect(datum.fields.gloss.value).toEqual("I-ACC");
      expect(datum.fields.gloss.json).toEqual({
        language: '',
        alternates: [],
        conventions: {
          id: '',
          tagSet: [],
          referenceLink: ''
        }
      });
    });

    it("should have a translation line ", function() {
      datum.fields.translation.value = "I";
      expect(datum.fields.translation.value).toEqual("I");
      expect(datum.fields.translation.json).toEqual({
        writingSystem: {
          id: '',
          referenceLink: ''
        },
        language: {
          ethnologueUrl: '',
          wikipediaUrl: '',
          iso: '',
          locale: '',
          englishName: '',
          nativeName: '',
          alternateNames: ''
        }
      });
    });

    it("should have grammatical judgement", function() {
      datum.fields.judgement.value = "*";
      expect(datum.fields.judgement.value).toEqual("*");
      expect(datum.fields.judgement.json).toEqual({
        "grammatical": true
      });
    });

    it("should have open ended tags", function() {
      datum.fields.tags.value = "Causative";
      expect(datum.fields.tags.value).toEqual("Causative");
      expect(datum.fields.tags.json).toEqual({
        tags: []
      });
    });

    it("should have a validation status of who checked the data", function() {
      datum.fields.validationStatus.value = "CheckedByPhylis, ToBeCheckedWithRejean";
      expect(datum.fields.validationStatus.value).toEqual("CheckedByPhylis, ToBeCheckedWithRejean");
      expect(datum.fields.validationStatus.json).toEqual({
        tags: []
      });
    });


  });


});

describe("IGT support", function() {
  var datum;
  beforeEach(function() {
    datum = new Datum({
      fields: JSON.parse(JSON.stringify(SAMPLE_CORPUS.datumFields))
    });
  });

  it("should represent IGT data in tuples and parallel text", function() {
    datum.fields.orthography.value = "puppies";
    datum.fields.utterance.value = "pʌpiz";
    datum.fields.morphemes.value = "pʌpi-z";
    datum.fields.allomorphs.value = "pʌpi-z";
    datum.fields.gloss.value = "puppy-pl";

    datum.fields.translation.value = "Des chiens";

    datum.debugMode = true;
    expect(datum.igt).toEqual({
      tuples: [{
        orthography: 'puppies',
        utterance: 'pʌpiz',
        allomorphs: 'pʌpi-z',
        morphemes: 'pʌpi-z',
        gloss: 'puppy-pl',
        syntacticCategory: ''
      }],
      parallelText: {
        orthography: 'puppies',
        utterance: 'pʌpiz',
        translation: 'Des chiens'
      }
    });
  });


  it("should tollerate broken IGT data", function() {
    // datum.fields.orthography.value = "this field has many words";
    datum.fields.utterance.value = "this field has many words";
    datum.fields.morphemes.value = "this field has fewer";
    // datum.fields.allomorphs.value = "this field has many words";
    datum.fields.gloss.value = "this field has many words";

    datum.fields.translation.value = "totally different word count but its okay";

    datum.debugMode = true;
    var igt = datum.igt;

    expect(igt.tuples[4]).toEqual({
      orthography: '',
      utterance: 'words',
      allomorphs: '',
      morphemes: '',
      gloss: 'words',
      syntacticCategory: ''
    });
  });


  it("should tollerate broken IGT data", function() {
    // datum.fields.orthography.value = "this field has many words";
    datum.fields.utterance.value = "this field has fewer";
    datum.fields.morphemes.value = "this field has many more segmentations than the utterance";
    // datum.fields.allomorphs.value = "this field has many words";
    datum.fields.gloss.value = "this field has many words";

    datum.fields.translation.value = "totally different word count but its okay";

    datum.debugMode = true;
    var igt = datum.igt;

    expect(igt.tuples[4]).toEqual({
      orthography: '',
      utterance: 'words',
      allomorphs: '',
      morphemes: '',
      gloss: 'words',
      syntacticCategory: ''
    });
  });


});

describe("Backward compatability with v1.22", function() {

  it("should load v1.22 datum", function() {
    var datum = new Datum(sample_1_22_datum[0]);
    expect(datum).toBeDefined();
    expect(datum.datumFields.length).toEqual(9);
    expect(datum.datumFields.fieldDBtype).toEqual("DatumFields");
    expect(datum.datumStates.length).toEqual(3);
    expect(datum.datumStates.fieldDBtype).toEqual("DatumStates");
    expect(datum.datumTags.length).toEqual(2);
    expect(datum.datumTags.fieldDBtype).toEqual("DatumTags");
    expect(datum.datumFields.utterance.value).toEqual("Jaunpa much'asqami kani.");
  });

});

describe("Syntactic sugar", function() {
  var datum = new Datum(sample_1_22_datum[0]);

  it("should be able to modify fields via a simple object", function() {

    expect(datum.fields.utterance.value).toEqual("Jaunpa much'asqami kani.");
    expect(datum.accessAsObject.utterance).toEqual(datum.fields.utterance.value);
    expect(datum.accessAsObject.utterance).toBe(datum.fields.utterance.value);

    datum.accessAsObject.utterance = "pʌpiz";
    expect(datum.accessAsObject.utterance).toEqual(datum.fields.utterance.value);
    expect(datum.accessAsObject.utterance).toBe(datum.fields.utterance.value);

    // expect(datum.accessAsObject.utterance).toEqual("");
    // expect(datum.fields.utterance.value).toEqual("");


  });

})
