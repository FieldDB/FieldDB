var Lexicon = require("../../api/lexicon/Lexicon").Lexicon;
var LexiconNode = Lexicon.LexiconNode;
var Contexts = Lexicon.Contexts;
var lexiconFactory = Lexicon.LexiconFactory;

var memoryLoad;
try {
  memoryLoad = require("memory");
} catch (exception) {
  console.log("Cant automate tests for memory heap changes");
  memoryLoad = function() {
    return 0;
  };
}

var SAMPLE_LEXICONS = require("../../sample_data/lexicon_v1.22.1.json");
var SAMPLE_V1_LEXICON = SAMPLE_LEXICONS[0];
var SAMPLE_V2_LEXICON = SAMPLE_LEXICONS[1];
var SAMPLE_V3_LEXICON = SAMPLE_LEXICONS[2];
var SAMPLE_V4_LEXICON = SAMPLE_LEXICONS[3];
var specIsRunningTooLong = 5000;

var mockCorpus = {
  dbname: "jenkins-firstcorpus",
  url: "http://admin:none@localhost:5984/jenkins-firstcorpus"
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
      expect(what).toBeDefined();
      expect(what.morphemes).toEqual("kya");
      expect(what.gloss).toEqual("what");
      expect(what.id).toEqual("kya|what");
      expect(what.headword).toEqual(what.id);

      var which = new LexiconNode({
        corpus: mockCorpus,
        morphemes: "kya",
        gloss: "which"
      });
      expect(which).toBeDefined();
      expect(which.morphemes).toEqual("kya");
      expect(which.gloss).toEqual("which");
      expect(which.id).toEqual("kya|which");
      expect(which.headword).toEqual(which.id);
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
      expect(lexicon.collection.length).toEqual(2);
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

    it("should accept an orthography and lexicon bootstraping function", function() {
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
      expect(lexicon.collection[0].parent).toEqual(lexicon);
      expect(lexicon.collection[0].corpus).toEqual(mockCorpus);
    });

  });

  describe("map reduces", function() {

    it("should accept custom emit function and rows holder", function() {
      var rows = ["some previous stuff"];
      var emit = function(key, value) {
        rows.push({
          key: key,
          value: value
        });
      };

      var result = Lexicon.lexicon_nodes_mapReduce({
        _id: "8h329983jr200023j20",
        session: {
          _id: "98jo3io2qjoiwjesoij32",
          sessionFields: []
        },
        fields: [{
          id: "utterance",
          mask: "Qaynap'unchaw lloqsinaywaran khunan p'unchaw(paq)"
        }, {
          id: "morphemes",
          mask: "qaynap'unchaw lloqsi-nay-wa-ra-n khunan p'unchaw(paq)"
        }, {
          id: "gloss",
          mask: "Yesterday go.out-DES-1OM-3SG now day.for"
        }, {
          id: "translation",
          mask: "`Yesterday, I felt like going out for today.'"
        }]
      }, emit, rows);
      expect(result).toBeDefined();
      expect(result.rows).toBe(rows);
      expect(result.rows[0]).toEqual("some previous stuff");
      expect(result.rows[3]).toEqual({
        key: {
          error: "This datum might need cleaning, one or more of the lines has more \'morphemes\' than it should for an IGT"
        },
        value: {
          reason: {
            fieldwhichHasMoreUnitsThanExpected: "unknown",
            expectedUnits: {
              utterance: "lloqsinaywaran",
              confidence: 1,
              morphemes: "lloqsi-nay-wa-ra-n",
              gloss: "goout-des-om-sg"
            }
          },
          potentiallyInaccurateData: {
            morphemes: "wa",
            gloss: "om",
            confidence: 0.5
          },
          id: "8h329983jr200023j20"
        }
      });
      expect(result.rows[10]).toEqual({
        key: {
          morphemes: "wa",
          gloss: "om",
          confidence: 0.5
        },
        value: "lloqsinaywaran"
      });
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


    it("should be able to add words", function() {
      var lexicon = new Lexicon({
        corpus: mockCorpus,
        // debugMode: true
      });
      expect(lexicon.length).toEqual(0);
      lexicon.add(["one", "two", "words"]);
      expect(lexicon.length).toEqual(3);
      expect(lexicon["one|"].morphemes).toEqual("one");
      expect(lexicon["two|"].morphemes).toEqual("two");
      expect(lexicon["words|"].morphemes).toEqual("words");
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
      expect(entries).toBeDefined();
      expect(entries.length).toEqual(2);
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
      expect(lexicon.length).toEqual(1);
      expect(lexicon.collection.length).toEqual(1);
      expect(simpleEntry.headword).toEqual("kjun|why");
      // expect(simpleEntry.parent).toEqual(lexicon);

      expect(typeof lexicon.find).toEqual("function");
      expect(lexicon.collection.map(function(node) {
        return node.id;
      })).toEqual(["kjun|why"]);

      // must run find on exact node
      // lexicon.debugMode = true;
      var nodesInLexicon = lexicon.find(simpleEntry);
      expect(nodesInLexicon.length).toEqual(1);
      expect(nodesInLexicon[0].morphemes).toEqual("kjun");
      expect(nodesInLexicon[0].gloss).toEqual("why");
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
      expect(lexicon.collection.map(function(node) {
        return node.id;
      })).toEqual(["kju3n|why", "kjjun|because"]);

      expect(lexicon.collection[1].headword).toEqual("kjjun|because");

      expect(typeof lexicon.find).toEqual("function");
      var nodesInLexiconFromSimpleObject = lexicon.find({
        morphemes: "kjjun",
        gloss: "because",
      });
      expect(nodesInLexiconFromSimpleObject).toBeDefined();
      expect(nodesInLexiconFromSimpleObject.length).toEqual(1);
      expect(nodesInLexiconFromSimpleObject.map(function(node) {
        return node.id;
      })).toEqual(["kjjun|because"]);

      expect(nodesInLexiconFromSimpleObject[0]).toBeDefined();
      expect(nodesInLexiconFromSimpleObject[0].headword).toEqual("kjjun|because");
      expect(nodesInLexiconFromSimpleObject[0].morphemes).toEqual("kjjun");
      expect(nodesInLexiconFromSimpleObject[0].gloss).toEqual("because");

      var nodesInLexiconFromHeadword = lexicon.find("kjjun|because");
      expect(nodesInLexiconFromHeadword).toBeDefined();
      expect(nodesInLexiconFromSimpleObject.map(function(node) {
        return node.id;
      })).toEqual(["kjjun|because"]);

      expect(nodesInLexiconFromSimpleObject.length).toEqual(1);
      expect(nodesInLexiconFromSimpleObject[0]).toBeDefined();
      expect(nodesInLexiconFromHeadword[0].morphemes).toEqual("kjjun");
      expect(nodesInLexiconFromHeadword[0].gloss).toEqual("because");
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
        expect(results).toBe(lexicon.collection);
        expect(lexicon.length).toBeGreaterThan(0);
        expect(lexicon.length).toEqual(14);
        expect(lexicon.collection.map(function(entry) {
          return entry.id;
        })).toEqual(["eight|", "eleven|", "five|", "four|", "fourteen|", "nine|", "one|", "seven|", "six|", "ten|", "thirteen|", "three|", "twelve|", "two|"]);

      }, function(reason) {
        console.warn("If you want to run this test, use CORSNode in the lexicon instead of CORS");
        expect(reason).toBeDefined();
        expect(reason.userFriendlyErrors).toBeDefined();
        expect(reason.details).toEqual(" ");
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
      expect(lexicon.connectedGraph).toBeDefined();
      expect(lexicon.connectedGraph.precedes.length).toEqual(1);
      expect(lexicon.connectedGraph.nodes).toBeDefined();
      // expect(lexicon.connectedGraph.nodes).toEqual(" ");
      var tmvti = lexicon.connectedGraph.nodes["tm|vti"];
      expect(tmvti.morphemes).toEqual("tm");
      var gpast = lexicon.connectedGraph.nodes["g|past"];
      expect(lexicon.connectedGraph.nodes["g|past"].confidence).toEqual(0.9);

      expect(lexicon.length).toEqual(2);
      expect(lexicon.collection[1]).toBe(gpast);
      expect(lexicon.find({
        morphemes: "g",
        gloss: "past"
      })[0]).toBe(gpast);

      expect(lexicon.find({
        morphemes: "g",
        gloss: "past"
      })[0].confidence).toEqual(0.9);

      expect(lexicon.collection[0]).toBe(tmvti);
      expect(lexicon.collection[0].headword).toEqual("tm|vti");
      expect(lexicon.collection[0].morphemes).toEqual("tm");
      expect(lexicon.collection[0].gloss).toEqual("vti");

      expect(lexicon.find({
        headword: "tm|vti"
      })[0]).toEqual(tmvti);

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
      expect(lexicon.length).toEqual(45);
    });

  });

  describe("contexts", function() {

    it("should be able to count contexts", function() {
      expect(Contexts).toBeDefined();
      var contexts = new Contexts();
      expect(contexts).toBeDefined();
      contexts.add({
        URL: "",
        morphemes: "noqa-ta",
        count: 14
      });
      expect(contexts.collection.length).toEqual(1);
      expect(contexts["noqa-ta"]).toEqual(contexts.collection[0]);
      expect(contexts.length).toEqual(14);
    });

    it("should be able to add contexts", function() {
      expect(Contexts).toBeDefined();
      var contexts = new Contexts();
      expect(contexts).toBeDefined();
      contexts.add({
        URL: "",
        morphemes: "noqa-ta",
        count: 14
      });
      // contexts.debugMode = true;
      console.log("\n\n");
      contexts.add({
        URL: "",
        morphemes: "noqa-ta",
        count: 2
      });
      expect(contexts.collection.length).toEqual(1);
      expect(contexts["noqa-ta"]).toEqual(contexts.collection[0]);
      expect(contexts.length).toEqual(16);

      expect(contexts.toJSON()).toEqual([{
        morphemes: "noqa-ta",
        count: 16,
        URL: "",
      }]);
    });

    it("should be able to automerge contexts of equivalent nodes", function() {
      var lexicon = new Lexicon();

      var one = lexicon.add({
        morphemes: "one",
        something: "else",
        utterance: "one little"
      });
      expect(lexicon.collection).toBeDefined();
      expect(lexicon.collection.length).toEqual(1);
      expect(one).toBeDefined();
      expect(one.utterance).toEqual("");
      expect(one.contexts.toJSON()).toEqual([{
        URL: "",
        utterance: "one little"
      }]);
      expect(one.count).toEqual(1);

      lexicon.add({
        morphemes: "one",
        another: "property",
        utterance: "another one"
      });

      expect(lexicon.length).toEqual(1);

      expect(one).toBeDefined();
      expect(one.morphemes).toEqual("one");
      expect(one.something).toEqual("else");
      expect(one.utterance).toEqual("");
      expect(one.another).toEqual("property");
      expect(one.contexts.toJSON()).toEqual([{
        URL: "",
        utterance: "one little"
      }, {
        URL: "",
        utterance: "another one"
      }]);
      expect(one.count).toEqual(2);
    });

    it("should be able to automerge contexts of equivalent nodes when adding nodes", function() {

      expect(SAMPLE_V1_LEXICON.rows[221].key.context).toEqual("noqa-ta");
      expect(SAMPLE_V1_LEXICON.rows[221].value).toEqual(14);
      expect(SAMPLE_V1_LEXICON.rows[223].key.context).toEqual("noqa-yku");
      expect(SAMPLE_V1_LEXICON.rows[223].value).toEqual(1);

      var lexicon = new Lexicon([SAMPLE_V1_LEXICON.rows[221], SAMPLE_V1_LEXICON.rows[223]]);
      expect(lexicon).toBeDefined();

      expect(lexicon.length).toEqual(3);
      expect(lexicon.collection.map(function(node) {
        return node.id;
      })).toEqual(["noqa|", "ta|", "yku|"]);

      var noqa = lexicon.collection[0];
      expect(noqa.fieldDBtype).toEqual("LexiconNode");

      expect(noqa.morphemes).toEqual("noqa");
      expect(noqa.utterance).toEqual("");
      expect(noqa.orthography).toEqual("noqa");
      expect(noqa.context).toBeUndefined();
      expect(noqa.contexts.fieldDBtype).toEqual("Contexts");
      expect(noqa.contexts.toJSON()).toEqual([{
        URL: "",
        morphemes: "noqa-ta",
        count: 14
      }, {
        URL: "",
        morphemes: "noqa-yku",
        count: 1
      }]);
      expect(noqa.count).toEqual(15);

    });
  });

  describe("backward compatibility", function() {
    it("should be able to automerge equivalent nodes", function() {
      var lexicon = new Lexicon();

      lexicon.add({
        morphemes: "one",
        something: "else"
      });

      lexicon.add({
        morphemes: "one",
        another: "property"
      });

      expect(lexicon.length).toEqual(1);
      var one = lexicon.find({
        morphemes: "one"
      });
      expect(one).toBeDefined();
      expect(one[0].morphemes).toEqual("one");
      expect(one[0].something).toEqual("else");
      expect(one[0].another).toEqual("property");
    });


    it("should be able to build a lexicon from a couchdb map reduce", function() {
      expect(SAMPLE_V1_LEXICON.rows.length).toEqual(348);
      expect(SAMPLE_V1_LEXICON.rows[0].key.relation).toEqual("precedes");


      var startingMemoryLoad = memoryLoad();

      var lexicon = new Lexicon(SAMPLE_V1_LEXICON);
      expect(lexicon).toBeDefined();
      expect(lexicon.length).toEqual(84);

      expect(lexicon.collection[0].utterance).toEqual("");
      expect(lexicon.collection[0].morphemes).toEqual("allcha");
      expect(lexicon.collection[0].gloss).toEqual("");
      expect(lexicon.collection[0].allomorphs).toEqual("");
      expect(lexicon.collection[0].orthography).toEqual("allcha"); //TOOD should this be empty?
      expect(lexicon.collection[0].contexts.toJSON()).toEqual([{
        morphemes: "allcha-nay-wa-n",
        count: 1,
        URL: ""
      }]);
      expect(lexicon.collection[0].count).toEqual(1);

      expect(lexicon.collection.map(function(node) {
        return node.id; /// + ":" + node.count;
      })).toEqual(["allcha|", "nay|", "ancha|", "ta|", "aqtu|", "ay|", "sunki|",
        "chaya|", "chi|", "ku|", "hall|", "pa|", "hamu|", "hanllari|", "hay|", "ka|",
        "ni|", "kicha|", "n|", "naya|", "kusi|", "lares|", "man|", "lla|", "llank'a|",
        "lloqsi|", "moniki|", "much'a|", "sqa|", "chu|", "na|", "ki|", "kiku|",
        "kunki|", "sanchis|", "sunkichis|", "wa|", "wan|", "wanchis|", "wanki|",
        "wankichis|", "wanku|", "yki|", "nayach'a|", "noqa|", "nchis|", "yku|",
        "obeje|", "p'aki|", "paqari|", "pay|", "kuna|", "pis|", "illa|", "pisi|",
        "punqo|", "punyu|", "puri|", "qan|", "qapari|", "qapri|", "qawa|", "qhepa|",
        "qoniy|", "qonqa|", "ra|", "rayqa|", "ri|", "rupha|", "y|", "sha|", "mi|",
        "suwa|", "t'anta|", "taqsa|", "tusu|", "uhu|", "urma|", "victor|", "wana|",
        "wanyu|", "wesq'a|", "yapaman|", "yuyaypi|"
      ]);
      expect(lexicon.entryRelations.length).toEqual(348);

      var endingMemoryLoad = memoryLoad();
      expect(endingMemoryLoad - startingMemoryLoad).toEqual("memory consumption for v1 lexicon");

      expect(endingMemoryLoad).toBeGreaterThan(startingMemoryLoad);
    });

    it("should be able to build a lexicon from a couchdb map reduce", function() {
      expect(SAMPLE_V2_LEXICON.rows.length).toEqual(1588);
      expect(SAMPLE_V2_LEXICON.rows[0].key.relation).toEqual("follows");

      var startingMemoryLoad = memoryLoad();

      var lexicon = new Lexicon({
        entryRelations: SAMPLE_V2_LEXICON,
        corpus: {
          prefs: {
            maxDistanceForContext: 2
          }
        }
      });
      expect(lexicon).toBeDefined();
      expect(lexicon.length).toEqual(42);
      expect(lexicon.collection.map(function(node) {
        return node.id;
      })).toEqual(["tâ|acc", "anta|", "ta|", "tâ|bread", "pa|break", "aki|door", "n|",
        "nay|acc", "punqo|", "wa|", "erqe|child", "nay|des", "qapari|yell",
        "sunkishis|plplom", "wesqâ|close", "a|door", "nayachâ|comb", "a|", "nay|",
        "llankâ|des", "nayachâ|des", "pa|des", "pâ|des", "acha|", "ku|", "wesqâ|des",
        "pâ|dressrefl", "llankâ|m", "nayachâ|m", "pa|m", "erqe|nom", "qan|nom",
        "wanki|sgm", "pâ|om", "wesqâ|om", "llankâ|sg", "nayachâ|sg", "pa|sg", "pâ|sg",
        "wesqâ|sg", "llankâ|work", "qan|you"
      ]);
      expect(lexicon.entryRelations.length).toEqual(1588);

      var endingMemoryLoad = memoryLoad();
      expect(endingMemoryLoad - startingMemoryLoad).toEqual("memory consumption for v2 lexicon");

      expect(endingMemoryLoad).toBeGreaterThan(startingMemoryLoad);
    });

    it("should be able to build a lexicon from a couchdb map reduce", function() {
      expect(SAMPLE_V3_LEXICON.rows.length).toEqual(447);
      expect(SAMPLE_V3_LEXICON.rows[0].key.relation).toEqual("precedes");

      var startingMemoryLoad = memoryLoad();

      var lexicon = new Lexicon(SAMPLE_V3_LEXICON);
      expect(lexicon).toBeDefined();
      expect(lexicon.length).toEqual(45);
      expect(lexicon.collection.map(function(node) {
        return node.id;
      })).toEqual(["წარმოადგენ|is", "ს|", "შეესაბამებ|relevant", "ა|", "ფ|fundamental",
        "უნდამენტურ|", "ფ|again", "არგლები|", "ფ|f's", "ის|", "ფ|", "სტანდარტებ|standards",
        "რომ|", "ლითაც|", "რეპუტაციაფ|", "მოპასუხე|defendant", "მთავ|important", "არ|",
        "ლარ|payment", "თავისუფლება|freedom", "თავისუფლება|expression", "და|was", "ეკისრა|",
        "და|established", "დგენილ|", "გამოქვეყნ|", "და|", "გამართლება|justify",
        "აღმოჩნდე|required", "ასეთი|such", "ა|is", "ასავალ|asaval", "დასავალის|dasavali",
        "сhrome|chrome", "is|", "χvala|tomorrow", "mde|until", "veb|web", "gverdze|site",
        "sait'ze|site", "universit'et'|university", "shi|", "ebi|pl", "unihack|unihack",
        "isa|isa"
      ]);
      expect(lexicon.entryRelations.length).toEqual(447);

      var endingMemoryLoad = memoryLoad();
      expect(endingMemoryLoad - startingMemoryLoad).toEqual("memory consumption for v3 lexicon");
      expect(endingMemoryLoad).toBeGreaterThan(startingMemoryLoad);
    });


    it("should be able to build a lexicon entity relations from an ngrams couchdb map reduce", function() {
      expect(SAMPLE_V4_LEXICON.rows.length).toEqual(34);
      expect(SAMPLE_V4_LEXICON.rows[0].key).toEqual("@-@-qaynap'unchaw");
      expect(SAMPLE_V4_LEXICON.rows[0].value).toEqual("Qaynap'unchaw lloqsi-nay-wa-ra-n khunan p'unchawpaq");

      var startingMemoryLoad = memoryLoad();

      // var lexicon = new Lexicon(SAMPLE_V4_LEXICON);

      var lexicon = new Lexicon();
      expect(lexicon).toBeDefined();
      lexicon.entryRelations = SAMPLE_V4_LEXICON;
      expect(lexicon.length).toEqual(0);
      expect(lexicon.entryRelations.length).toEqual(36);
      expect(lexicon.entryRelations[12].from.morphemes).toEqual("ra");
      expect(lexicon.entryRelations[12].to.morphemes).toEqual("n");
      expect(lexicon.entryRelations[12].relation).toEqual("precedes");
      if (lexicon.entryRelations[12].count) {
        expect(lexicon.entryRelations[12].count).toEqual(2);
      } else {
        expect(lexicon.entryRelations[12].from.contexts).toEqual(["Qaynap'unchaw lloqsi-nay-wa-ra-n khunan p'unchawpaq", "Qaynap'unchaw lloqsi-nay-wa-ra-n khunan p'unchaw"]);
      }

      lexicon.updateConnectedGraph();
      expect(lexicon.connectedGraph).toBeDefined();
      expect(lexicon.connectedGraph.precedes.length).toEqual(16);
      expect(lexicon.connectedGraph.nodes).toBeDefined();
      expect(lexicon.connectedGraph.nodes["nay|"].morphemes).toEqual("nay");
      expect(lexicon.connectedGraph.nodes["nay|"].contexts.length).toEqual(2);

      expect(lexicon.length).toEqual(13);
      expect(lexicon["nay|"]).toBeDefined();
      expect(lexicon.connectedGraph.nodes["nay|"]).toBe(lexicon["nay|"]);
      expect(lexicon.connectedGraph.nodes["nay|"].morphemes).toBe(lexicon["nay|"].morphemes);

      var endingMemoryLoad = memoryLoad();
      expect(endingMemoryLoad - startingMemoryLoad).toEqual("memory consumption for v4 lexicon");
      expect(endingMemoryLoad).toBeGreaterThan(startingMemoryLoad);
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
