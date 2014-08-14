var Datum = require('./../../api/datum/Datum').Datum;

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
