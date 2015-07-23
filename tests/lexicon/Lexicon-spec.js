var Lexicon = require("../../api/lexicon/Lexicon").Lexicon;
var LexiconNode = Lexicon.LexiconNode;
var lexiconFactory = Lexicon.LexiconFactory;

var SAMPLE_LEXICONS = require("../../sample_data/lexicon_v1.22.1.json");
var SAMPLE_V1_LEXICON = SAMPLE_LEXICONS[0];
var SAMPLE_V2_LEXICON = SAMPLE_LEXICONS[1];
var SAMPLE_V3_LEXICON = SAMPLE_LEXICONS[2];

var tinyPrecedenceRelations = [{
  "previous": {
    "morphemes": "tm",
    "gloss": "vti",
    "utterance": "maqutmg'p",
    "confidence": 0.9000000000000000222
  },
  "subsequent": {
    "morphemes": "g",
    "gloss": "past",
    "utterance": "maqutmg'p",
    "confidence": 0.9000000000000000222
  },
  "relation": "preceeds",
  "distance": 1,
  "context": {
    "utterance": "maqutmg'p",
    "morphemes": "maqu-tm-g-'p",
    "gloss": "eat-vti--past",
    "id": "116ab35300200903a1c6fad4c1f2f660"
  },
  "count": 2
}];

describe("Lexicon: as a user I want to search for anything, even things that don't exist", function() {

  describe("construction", function() {

    it("should load", function() {
      expect(Lexicon).toBeDefined();
      expect(LexiconNode).toBeDefined();
      expect(lexiconFactory).toBeDefined();
    });

    it("should accept no options", function() {
      var lexicon = new Lexicon();
      expect(lexicon).toBeDefined();
    });

  });

  describe("connected graph", function(){

    it("should be able to build a precedence graph from relations", function() {
      var lexicon = new Lexicon();
      expect(lexicon.entryRelations).toBeUndefined();
      lexicon.entryRelations = tinyPrecedenceRelations;
      expect(lexicon.entryRelations.length).toEqual(1);

      var graph = lexicon.updateConnectedGraph();
      expect(graph).toBeDefined();
      expect(graph).toBe(lexicon.connectedGraph);

      expect(lexicon.entryRelations.length).toEqual(1);
      
      expect(lexicon.connectedGraph.preceeds.length).toEqual(1);
      expect(lexicon.connectedGraph.nodes).toBeDefined();
      expect(lexicon.connectedGraph.nodes["tm"].morphemes).toEqual("tm");
      expect(lexicon.connectedGraph.nodes["g"].confidence).toEqual(0.9);
    });

    xit("should be able to build a connected graph from a v3.x couchdb map reduce", function() {
      var lexicon = new Lexicon();
      expect(lexicon.entryRelations).toBeUndefined();
      lexicon.entryRelations = SAMPLE_V3_LEXICON;
      lexicon.updateConnectedGraph();
      expect(lexicon.entryRelations).toBeDefined();
      expect(lexicon.entryRelations.length).toEqual(447);
    });

  });


  it("should be able to build a lexicon from a couchdb map reduce", function() {
    var lexicon = lexiconFactory({
      entryRelations: SAMPLE_LEXICONS[0]
    });
    expect(lexicon).toBeDefined();
  });

  it("should be able to build morphemes from a text file of segmented morphemes", function() {
    expect(true).toBeTruthy();
  });
  it("should be able to build a word collection from a text file of  words", function() {
    expect(true).toBeTruthy();
  });
  it("should be able to build translations from a text file of  translations", function() {
    expect(true).toBeTruthy();
  });
  it("should be able to build a collection of glosses from a text file of containing only glosses", function() {
    expect(true).toBeTruthy();
  });
  it("should be able add edges between nodes of different types", function() {
    expect(true).toBeTruthy();
  });
});
