var Datum = require('./../../api/datum/Datum').Datum;
var sample_1_22_datum = require('./../../sample_data/datum_v1.22.1.json');

describe("Test Datum", function() {
  it("should load", function() {
    expect(Datum).toBeDefined();

    var datum = new Datum();
    expect(datum).toBeDefined();
  });

  it("should set the utterance", function() {
    var datum = new Datum();
    datum.datumFields.utterance = "Noqata";
    expect(datum.datumFields.utterance).toEqual("Noqata");
  });

  it("should have a gloss line ", function() {
    var datum = new Datum();
    datum.datumFields.gloss = "I-ACC";
    expect(datum.datumFields.gloss).toEqual("I-ACC");
  });

  it("should have a translation line ", function() {
    var datum = new Datum();
    datum.datumFields.translation = "I";
    expect(datum.datumFields.translation).toEqual("I");
  });

  it("should have grammatical tags", function() {
    var datum = new Datum();
    datum.datumFields.judgement = "*";
    expect(datum.datumFields.judgement).toEqual("*");

    datum = new Datum();
    datum.datumFields.tags = "Causative";
    expect(datum.datumFields.tags).toEqual("Causative");
  });

});

describe('Backward compatability with v1.22', function() {

  it("should load v1.22 datum", function() {
    var datum = new Datum(sample_1_22_datum[0]);
    expect(datum).toBeDefined();
    expect(datum.datumFields.length).toEqual(9);
    expect(datum.datumFields.type).toEqual("DatumFields");
    expect(datum.datumStates.length).toEqual(3);
    expect(datum.datumStates.type).toEqual("DatumStates");
    expect(datum.datumTags.length).toEqual(2);
    expect(datum.datumTags.type).toEqual("DatumTags");
    expect(datum.datumFields.utterance.value).toEqual("Jaunpa much'asqami kani.");
  });

});
