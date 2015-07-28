var Lexicon = require("../../api/lexicon/Lexicon").Lexicon;
var LexiconNode = Lexicon.LexiconNode;
var lexiconFactory = Lexicon.LexiconFactory;

var SAMPLE_LEXICONS = require("../../sample_data/lexicon_v1.22.1.json");
var SAMPLE_V1_LEXICON = SAMPLE_LEXICONS[0];
var SAMPLE_V2_LEXICON = SAMPLE_LEXICONS[1];
var SAMPLE_V3_LEXICON = SAMPLE_LEXICONS[2];
var specIsRunningTooLong = 5000;

var mockCorpus = {
  dbname: "jenkins-firstcorpus"
};
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
  "relation": "precedes",
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

  describe("lexicon nodes", function() {

    it("should load", function() {
      expect(LexiconNode).toBeDefined();
    });

    it("should accept no options", function() {
      var word = new LexiconNode({
        corpus: mockCorpus
      });
      expect(word).toBeDefined();
      word.morphemes = "kya";
      expect(word.morphemes).toEqual("kya");
      expect(word.fields.morphemes).toBeDefined();
      expect(word.fields.morphemes.value).toEqual("kya");
      expect(word.fields.morphemes.help).toEqual("Words divided into prefixes, root and suffixes using a - between each eg: un-forget-able.");
    });

    it("should accept an object", function() {
      var word = new LexiconNode({
        corpus: mockCorpus,
        morphemes: "kya"
      });
      expect(word).toBeDefined();
      expect(word.morphemes).toEqual("kya");
      expect(word.fields.morphemes).toBeDefined();
      expect(word.fields.morphemes.value).toEqual("kya");
      expect(word.fields.morphemes.help).toEqual("Words divided into prefixes, root and suffixes using a - between each eg: un-forget-able.");
    });

    it("should have an id/headword formed of morphemes and gloss", function() {
      var what = new LexiconNode({
        corpus: mockCorpus,
        morphemes: "kya",
        gloss: "what"
      });
      var which = new LexiconNode({
        corpus: mockCorpus,
        morphemes: "kya",
        gloss: "which"
      });
      expect(what).toBeDefined();
      expect(what.morphemes).toEqual("kya");
      expect(what.gloss).toEqual("what");
      expect(what.id).toEqual("kya|what");
      expect(what.headword).toEqual(what.id);
    });

  });

  describe("construction", function() {

    it("should load", function() {
      expect(Lexicon).toBeDefined();
      expect(lexiconFactory).toBeDefined();
    });

    it("should accept no options", function() {
      var lexicon = new Lexicon();
      expect(lexicon).toBeDefined();
    });

    it("should accept an array of entries", function() {
      var lexicon = new Lexicon([{
        morphemes: "one",
        gloss: "one"
      }, {
        morphemes: "two",
        gloss: "two"
      }]);
      expect(lexicon).toBeDefined();
      expect(lexicon.length).toEqual(2);
    });

    it("should accept options", function() {
      var lexicon = new Lexicon({
        corpus: mockCorpus,
        something: "else",
        collection: [{
          morphemes: "one",
          gloss: "one"
        }, {
          morphemes: "two",
          gloss: "two"
        }]
      });
      expect(lexicon).toBeDefined();
      expect(lexicon.length).toEqual(2);
      expect(lexicon.something).toEqual("else");
    });

    it("should set itself as parent on its lexicon nodes", function() {
      var lexicon = new Lexicon({
        corpus: mockCorpus,
        something: "else",
        collection: [{
          morphemes: "one",
          gloss: "one"
        }, {
          morphemes: "two",
          gloss: "two"
        }]
      });
      expect(lexicon).toBeDefined();
      expect(lexicon.length).toEqual(2);
      expect(lexicon.root.value.parent).toEqual(lexicon);
      expect(lexicon.root.value.corpus).toEqual(mockCorpus);
    });

    it("should accept an equality function for keeping nodes unique", function() {
      var everythingIsEqualLexicon = new Lexicon({
        corpus: mockCorpus,
        collection: [{
          morphemes: "one",
          gloss: "one"
        }, {
          morphemes: "different",
          gloss: "completely"
        }],
        equals: function(a, b) {
          this.warn("custom equal")
          return true;
        }
      });
      expect(everythingIsEqualLexicon).toBeDefined();
      expect(everythingIsEqualLexicon.length).toEqual(1);

      var fromTheLexicon = everythingIsEqualLexicon.find({
        morphemes: "one",
        gloss: "one"
      });

      expect(fromTheLexicon.morphemes).toEqual("one");
      expect(fromTheLexicon.id).toEqual("one|one");
      expect(fromTheLexicon.fieldDBtype).toEqual("LexiconNode");

      expect(everythingIsEqualLexicon.find({
        morphemes: "different",
        gloss: "completely"
      }).morphemes).toEqual("one");

      var everythingIsDifferentLexicon = new Lexicon({
        collection: [{
          morphemes: "one",
          gloss: "one"
        }, {
          morphemes: "one",
          gloss: "one"
        }],
        equals: function(a, b) {
          this.warn("custom equal")
          return false;
        },
        compare: function(a, b) {
          this.warn("custom compare")
          return 1;
        }
      });
      expect(everythingIsDifferentLexicon.length).toEqual(2);
    });

  });


  describe("entries", function() {

    it("should be able to add lexical entries", function() {
      var lexicon = new Lexicon({
        corpus: mockCorpus
      });
      expect(lexicon.length).toEqual(0);
      lexicon.add({
        morphemes: "kjun",
        gloss: "why"
      });
      expect(lexicon.length).toEqual(1);
    });

    it("should be able to add multiple lexical entries", function() {
      var lexicon = new Lexicon({
        corpus: mockCorpus
      });
      expect(lexicon.length).toEqual(0);
      var entries = [{
        morphemes: "kjun",
        gloss: "why"
      }, {
        morphemes: "kja",
        gloss: "what"
      }];
      entries = lexicon.add(entries);
      expect(lexicon.length).toEqual(2);
      expect(entries[0].headword).toEqual("kjun|why");
      expect(entries[1].headword).toEqual("kja|what");
    });

    it("should be able to push lexical entries", function() {
      var lexicon = new Lexicon({
        corpus: mockCorpus
      });
      expect(lexicon.length).toEqual(0);
      lexicon.push({
        morphemes: "kjun",
        gloss: "why"
      });
      expect(lexicon.length).toEqual(1);
    });

    it("should be able to unshift lexical entries", function() {
      var lexicon = new Lexicon({
        corpus: mockCorpus
      });
      expect(lexicon.length).toEqual(0);
      lexicon.push({
        morphemes: "kjun",
        gloss: "why"
      });
      expect(lexicon.length).toEqual(1);
    });

    it("should be able to find lexical entries", function() {
      var lexicon = new Lexicon({
        corpus: mockCorpus
      });
      expect(lexicon.length).toEqual(0);
      var simpleEntry = {
        morphemes: "kjun",
        gloss: "why"
      };

      // Add returns what was added
      simpleEntry = lexicon.add(simpleEntry);
      expect(simpleEntry.headword).toEqual("kjun|why");
      expect(simpleEntry.parent).toEqual(lexicon);
      expect(typeof lexicon.find).toEqual("function");

      // must runfind on exact node
      var nodeInLexicon = lexicon.find(simpleEntry);
      expect(nodeInLexicon.morphemes).toEqual("kjun");
      expect(nodeInLexicon.gloss).toEqual("why");
    });

    it("should be able to find multiple matching lexical entries", function() {
      var lexiconJson = [{
        morphemes: "kju3n",
        gloss: "why"
      }, {
        morphemes: "kjjun",
        gloss: "because"
      }];

      var lexicon = new Lexicon({
        corpus: mockCorpus
      });
      lexiconJson = lexicon.add(lexiconJson);
      expect(lexicon.length).toEqual(2);
      expect(lexicon.root.value.headword).toEqual("kjjun|because");

      expect(typeof lexicon.find).toEqual("function");

      var nodesInLexiconFromSimpleObject = lexicon.find(lexiconJson[1]);
      expect(nodesInLexiconFromSimpleObject).toBeDefined();
      expect(nodesInLexiconFromSimpleObject.headword).toEqual("kjjun|because");
      expect(nodesInLexiconFromSimpleObject.morphemes).toEqual("kjjun");
      expect(nodesInLexiconFromSimpleObject.gloss).toEqual("because");

      nodesInLexiconFromSimpleObject = lexicon.find({
        morphemes: "kjjun",
        gloss: "because",
        debugMode: true
      });
      expect(nodesInLexiconFromSimpleObject).toBeDefined();
      expect(nodesInLexiconFromSimpleObject.headword).toEqual("kjjun|because");
      expect(nodesInLexiconFromSimpleObject.morphemes).toEqual("kjjun");
      expect(nodesInLexiconFromSimpleObject.gloss).toEqual("because");

      var nodesInLexiconFromHeadword = new Lexicon.LexiconNode({
        headword: "kjjun|because"
      });
      expect(nodesInLexiconFromHeadword.headword).toEqual("kjjun|because");
      lexicon.contentEquals = Lexicon.LexiconNode.prototype.uniqueEntriesOnHeadword;

      nodesInLexiconFromHeadword = lexicon.find(nodesInLexiconFromHeadword);
      expect(nodesInLexiconFromHeadword).toBeDefined();
      expect(nodesInLexiconFromHeadword.morphemes).toEqual("kjjun");
      expect(nodesInLexiconFromHeadword.gloss).toEqual("because");
    });

  });
  describe("persistance", function() {

    it("should be able to fetch itself", function(done) {
      var lexicon = new Lexicon({
        corpus: mockCorpus
      });
      expect(lexicon).toBeDefined();
      expect(lexicon.corpus.dbname).toEqual("jenkins-firstcorpus");

      lexicon.fetch().then(function(results) {
        expect(lexicon.length).toBeGreaterThan(0);
        expect(lexicon.length).toEqual(14);


      }, function(reason) {
        console.warn("If you want to run this test, use CORSNode in the lexicon instead of CORS")
        expect(reason.userFriendlyErrors[0]).toEqual("CORS not supported, your browser is unable to contact the database.");
      }).fail(function(exception) {
        console.log(exception.stack);
        expect(exception).toEqual(" unexpected exception while processing rules");
      }).done(done);

    }, specIsRunningTooLong);

  });

  describe("connected graph", function() {

    it("should be able to build a precedence graph from relations", function() {
      var lexicon = new Lexicon({
        corpus: mockCorpus
      });
      expect(lexicon.entryRelations).toBeUndefined();
      lexicon.entryRelations = tinyPrecedenceRelations;
      expect(lexicon.entryRelations.length).toEqual(1);

      var graph = lexicon.updateConnectedGraph();
      expect(graph).toBeDefined();
      expect(graph).toBe(lexicon.connectedGraph);

      expect(lexicon.entryRelations.length).toEqual(1);
      expect(lexicon.connectedGraph.precedes.length).toEqual(1);
      expect(lexicon.connectedGraph.nodes).toBeDefined();
      // expect(lexicon.connectedGraph.nodes).toEqual(" ");
      var tmvti = lexicon.connectedGraph.nodes["tm|vti"];
      expect(tmvti.morphemes).toEqual("tm");
      var gpast = lexicon.connectedGraph.nodes["g|past"];
      expect(lexicon.connectedGraph.nodes["g|past"].confidence).toEqual(0.9);

      expect(lexicon.length).toEqual(2);
      expect(lexicon.root.value).toBe(gpast);
      expect(lexicon.find({
        morphemes: "g",
        gloss: "past"
      })).toBe(gpast);

      expect(lexicon.find({
        morphemes: "g",
        gloss: "past"
      }).confidence).toEqual(0.9);

      lexicon.delete(gpast);
      expect(lexicon.root.value).toBe(tmvti);
      expect(lexicon.root.value.headword).toEqual("tm|vti");
      expect(lexicon.root.value.morphemes).toEqual("tm");
      expect(lexicon.root.value.gloss).toEqual("vti");

      expect(lexicon.find({
        headword: "tm|vti"
      })).toEqual(tmvti);

    });

    it("should be able to build a connected graph from a v3.x couchdb map reduce", function() {
      var lexicon = new Lexicon({
        corpus: mockCorpus
      });
      expect(lexicon.entryRelations).toBeUndefined();
      lexicon.entryRelations = SAMPLE_V3_LEXICON;
      lexicon.updateConnectedGraph();
      expect(lexicon.entryRelations).toBeDefined();
      expect(lexicon.entryRelations.length).toEqual(447);
      expect(lexicon.length).toEqual(56);
    });

  });

  describe("backward compatibility", function() {
    it("should be able to automerge equivalent nodes", function() {
      var lexicon = new Lexicon();

      lexicon.add({
        morphemes: "one",
        something: "else"
      });

      lexicon.addOrMerge({
        morphemes: "one",
        another: "property"
      });

      expect(lexicon.length).toEqual(1);
      var one = lexicon.find({
        morphemes: "one"
      });
      expect(one).toBeDefined();
      expect(one.morphemes).toEqual("one");
      expect(one.something).toEqual("else");
      expect(one.another).toEqual("property");
    });

    it("should be able to build a lexicon from a couchdb map reduce", function() {
      expect(SAMPLE_V1_LEXICON.rows.length).toEqual(348);
      expect(SAMPLE_V1_LEXICON.rows[0].key.relation).toEqual("precedes");

      var lexicon = new Lexicon(SAMPLE_V1_LEXICON);
      expect(lexicon).toBeDefined();
      expect(lexicon.entryRelations.length).toEqual(348);
    });
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
