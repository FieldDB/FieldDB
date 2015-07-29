var Glosser = require("../../api/glosser/Glosser").Glosser;

var SAMPLE_LEXICONS = require("../../sample_data/lexicon_v1.22.1.json");
var SAMPLE_SEGMENTATION_V3 = SAMPLE_LEXICONS[3];
var optionalD3;
var virtualElement;
var virtualDOM;
var specIsRunningTooLong = 5000;

try {
	optionalD3 = require("d3");
} catch (e) {
	console.log("If you want to run the tests for optional d3 injection for visualization of the Glosser/Lexicon, run `npm install d3` ");
}

try {
	virtualDOM = require("jsdom").jsdom("<html><head></head><body></body></html>");
	virtualElement = virtualDOM.body;
} catch (e) {
	console.log("If you want to run the tests for visualization of the Glosser/Lexicon, run `npm install jsdom@3.0` ");
}

describe("Glosser: as a user I don't want to enter glosses that are already in my data", function() {
	var tinyLexicon = [{
		orthography: "kjun",
		gloss: "why"
	}, {
		orthography: "nahin",
		gloss: "not"
	}];

	var tinyPrecedenceRelation = [{
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

	var tinyPrecedenceRelationsFromCouchDBMapReduce = [{
		"key": {
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
			}
		},
		"value": 1
	}];

	var tinyCorpus = {
		dbname: "jenkins-firstcorpus",
		title: "Community Corpus",
		url: "http://admin:none@localhost:5984/jenkins-firstcorpus"
	};

	describe("construction", function() {

		it("should load", function() {
			expect(Glosser).toBeDefined();
		});

		it("should accept no options", function() {
			var glosser = new Glosser();
			expect(glosser).toBeDefined();
		});

		it("should accept a corpus", function() {
			var glosser = new Glosser({
				corpus: tinyCorpus
			});
			expect(glosser).toBeDefined();
			expect(glosser.corpus.dbname).toEqual("jenkins-firstcorpus");
		});

	});

	describe("conservativeness", function() {
		var glosser;
		beforeEach(function() {
			glosser = new Glosser({
				// debugMode: true
			});
			glosser.morphemeSegmentationKnowledgeBase = SAMPLE_SEGMENTATION_V3;
			expect(glosser.morphemeSegmentationKnowledgeBase).toBeDefined();
			expect(glosser.morphemeSegmentationKnowledgeBase["@-lloqsi-nay"]).toBeDefined();
			expect(glosser.morphemeSegmentationKnowledgeBase["nay-wa-ra"]).toBeDefined();
			expect(glosser.morphemeSegmentationKnowledgeBase["@-khunan-@"]).toBeDefined();
		});

		it("should guess same segmentation if it has seen the word segmented before in another context", function() {
			var datum = {
				utterance: "lloqsinaywaran p\'unchawpaq"
			};
			glosser.guessMorphemesFromUtterance(datum);

			expect(datum.utterance).toEqual("lloqsinaywaran p\'unchawpaq");
			expect(datum.morphemes).toEqual("lloqsi-nay-wa-ra-n p\'unchawpaq");
			expect(datum.gloss).toEqual("?-?-?-?-? ?");

			expect(datum.utteranceWithExplictWordBoundaries).toEqual("@-lloqsi-nay-wa-ra-n-@-p\'unchawpaq-@");
			expect(datum.alternateMorphemeLines).toBeUndefined();
			expect(datum.matchingRules.length).toEqual(6)
			expect(datum.matchingRules).toEqual([{
				segmentation: "@-lloqsi-nay",
				contexts: ["Qaynap\'unchaw lloqsi-nay-wa-ra-n khunan p\'unchawpaq", "Qaynap\'unchaw lloqsi-nay-wa-ra-n khunan p\'unchaw"],
				morphemes: ["@", "lloqsi", "nay"]
			}, {
				segmentation: "lloqsi-nay-wa",
				contexts: ["Qaynap\'unchaw lloqsi-nay-wa-ra-n khunan p\'unchawpaq", "Qaynap\'unchaw lloqsi-nay-wa-ra-n khunan p\'unchaw"],
				morphemes: ["lloqsi", "nay", "wa"]
			}, {
				segmentation: "nay-wa-ra",
				contexts: ["Qaynap\'unchaw lloqsi-nay-wa-ra-n khunan p\'unchawpaq", "Qaynap\'unchaw lloqsi-nay-wa-ra-n khunan p\'unchaw"],
				morphemes: ["nay", "wa", "ra"]
			}, {
				segmentation: "wa-ra-n",
				contexts: ["Qaynap\'unchaw lloqsi-nay-wa-ra-n khunan p\'unchawpaq", "Qaynap\'unchaw lloqsi-nay-wa-ra-n khunan p\'unchaw"],
				morphemes: ["wa", "ra", "n"]
			}, {
				segmentation: "ra-n-@",
				contexts: ["Qaynap\'unchaw lloqsi-nay-wa-ra-n khunan p\'unchawpaq", "Qaynap\'unchaw lloqsi-nay-wa-ra-n khunan p\'unchaw"],
				morphemes: ["ra", "n", "@"]
			}, {
				segmentation: "@-p\'unchawpaq-@",
				contexts: ["Qaynap\'unchaw lloqsi-nay-wa-ra-n khunan p\'unchawpaq"],
				morphemes: ["@", "p\'unchawpaq", "@"]
			}]);

		});

		it("should be possible to set conservative to false to get more alternatives", function() {
			// glosser.debugMode = true;
			glosser.conservative = false;
			var datum = {
				utterance: "lloqsinaywaran khunan"
			};
			glosser.guessMorphemesFromUtterance(datum);

			expect(datum.utterance).toEqual("lloqsinaywaran khunan");
			expect(datum.morphemes).toEqual("lloqsi-nay-wa-ra-n khunan");
			expect(datum.gloss).toEqual("?-?-?-?-? ?");

			expect(datum.alternateMorphemeLines).toEqual(["lloqsi-nay-wa-ra-n khunan", "lloqsinaywaran khunan"]);
		});

		it("should not segment suffixes which it has seen before on a different root", function() {
			// glosser.debugMode = true;
			expect(glosser.morphemeSegmentationKnowledgeBase["victor-ta-@"]).toBeDefined();
			var datumWithKnownSegmentation = {
				utterance: "something Victorta else"
			};
			glosser.guessMorphemesFromUtterance(datumWithKnownSegmentation);

			expect(datumWithKnownSegmentation.utterance).toEqual("something Victorta else");
			expect(datumWithKnownSegmentation.morphemes).toEqual("something victor-ta else");
			expect(datumWithKnownSegmentation.gloss).toEqual("? ?-? ?");

			expect(glosser.morphemeSegmentationKnowledgeBase["noqa-ta-@"]).toBeUndefined();
			var datumwithUnknownSegmentation = {
				utterance: "something Noqata else"
			};
			glosser.guessMorphemesFromUtterance(datumwithUnknownSegmentation);

			expect(datumwithUnknownSegmentation.utterance).toEqual("something Noqata else");
			expect(datumwithUnknownSegmentation.morphemes).toEqual("something noqata else");
			expect(datumwithUnknownSegmentation.morphemes).not.toEqual("something noqa-ta else");
			expect(datumwithUnknownSegmentation.gloss).toEqual("? ? ?");
		});

		it("should segment morpheme sequences up to where it has been seen before", function() {
			// glosser.debugMode = true;
			var datum = {
				utterance: "something tusuyanwaran else"
			};
			glosser.guessMorphemesFromUtterance(datum);

			expect(datum.utterance).toEqual("something tusuyanwaran else");
			expect(datum.morphemes).toEqual("something tusuyanwa-ra-n else");
			expect(datum.gloss).toEqual("? ?-?-? ?");
		});

		it("should be possible to set conservative to false to segment words it hasnt seen before", function() {
			// glosser.debugMode = true;
			glosser.conservative = false;
			var datum = {
				utterance: "Noqata tusuyanwaran"
			};
			glosser.guessMorphemesFromUtterance(datum);

			expect(datum.utterance).toEqual("Noqata tusuyanwaran");
			expect(datum.morphemes).toEqual("noqata tusuyanwa-ra-n");
			expect(datum.gloss).toEqual("? ?-?-?");

			expect(datum.alternateMorphemeLines).toEqual(["noqata tusuyanwa-ra-n", "Noqata tusuyanwaran", "noqata tusuyanwaran"]);
		});

		it("should survive missing redundant rules", function() {
			delete glosser.morphemeSegmentationKnowledgeBase["lloqsi-nay-wa"];
			expect(glosser.morphemeSegmentationKnowledgeBase["lloqsi-nay-wa"]).toBeUndefined();

			var datum = {
				utterance: "lloqsinaywaran khunan"
			};
			glosser.guessMorphemesFromUtterance(datum);

			expect(datum.utterance).toEqual("lloqsinaywaran khunan");
			expect(datum.morphemes).toEqual("lloqsi-nay-wa-ra-n khunan");
			expect(datum.alternateMorphemeLines).toBeUndefined();
			expect(datum.gloss).toEqual("?-?-?-?-? ?");
		});

		it("should conservatively fill IGT if it has incomplete segmentation knowledge", function() {
			delete glosser.morphemeSegmentationKnowledgeBase["@-lloqsi-nay"];
			expect(glosser.morphemeSegmentationKnowledgeBase["@-lloqsi-nay"]).toBeUndefined();
			delete glosser.morphemeSegmentationKnowledgeBase["wa-ra-n"];
			expect(glosser.morphemeSegmentationKnowledgeBase["wa-ra-n"]).toBeUndefined();

			var datum = {
				utterance: "lloqsinaywaran khunan"
			};
			glosser.guessMorphemesFromUtterance(datum);

			expect(datum.utterance).toEqual("lloqsinaywaran khunan");
			expect(datum.morphemes).toEqual("lloqsi-nay-wara-n khunan");
			expect(datum.gloss).toEqual("?-?-?-? ?");
		});

		it("should conservatively fill IGT if it has very incomplete segmentation knowledge", function() {
			delete glosser.morphemeSegmentationKnowledgeBase["@-lloqsi-nay"];
			expect(glosser.morphemeSegmentationKnowledgeBase["@-lloqsi-nay"]).toBeUndefined();
			delete glosser.morphemeSegmentationKnowledgeBase["wa-ra-n"];
			expect(glosser.morphemeSegmentationKnowledgeBase["wa-ra-n"]).toBeUndefined();
			delete glosser.morphemeSegmentationKnowledgeBase["lloqsi-nay-wa"];
			expect(glosser.morphemeSegmentationKnowledgeBase["lloqsi-nay-wa"]).toBeUndefined();

			var datum = {
				utterance: "lloqsinaywaran khunan"
			};
			glosser.guessMorphemesFromUtterance(datum);

			expect(datum.utterance).toEqual("lloqsinaywaran khunan");
			expect(datum.morphemes).toEqual("lloqsinay-wa-ra-n khunan");
			expect(datum.alternateMorphemeLines).toBeUndefined();
			expect(datum.gloss).toEqual("?-?-?-? ?");
		});

	});

	describe("semi-automatic segmentation knowledgebase", function() {

		it("should provide the same map reduce as that in couchdb", function() {
			expect(Glosser.morpheme_n_grams_mapReduce).toBeDefined();
			expect(typeof Glosser.morpheme_n_grams_mapReduce).toEqual("function");

			var result = Glosser.morpheme_n_grams_mapReduce({});
			expect(result).toBeDefined();
			expect(result).toEqual({
				rows: []
			});
		});

		it("should accept custom emit function and rows holder", function() {
			var rows = ["some stuff"];
			var emit = function(key, value) {
				rows.push({
					key: key,
					value: value
				});
			};

			var result = Glosser.morpheme_n_grams_mapReduce({}, emit, rows);
			expect(result).toBeDefined();
			expect(result.rows).toBe(rows);
			expect(result).toEqual({
				rows: ["some stuff"]
			});
		});

		it("should be able to build ngrams using a map reduce", function() {
			var doc = {
				fields: [{
					id: "morphemes",
					mask: "Victor-ta tusu-naya-n"
				}]
			};
			expect(doc).toBeDefined();
			console.log("Testing ngrams");
			var result = Glosser.morpheme_n_grams_mapReduce(doc);

			expect(result.rows).toBeDefined();
			// expect(result.rows).toEqual();
			expect(result.rows.length).toEqual(8);
			expect(result.rows[4].value).toEqual("Victor-ta tusu-naya-n");
		});

		it("should be able to count ngrams in context using a map reduce", function() {
			// var rows = [];
			var doc = {
				fields: [{
					id: "morphemes",
					mask: "Qaynap\'unchaw lloqsi-nay-wa-ra-n khunan p\'unchaw(paq)"
				}]
			};
			expect(doc).toBeDefined();
			console.log("Testing ngrams");
			var result = Glosser.morpheme_n_grams_mapReduce(doc);

			expect(result.rows).toBeDefined();
			expect(result.rows.length).toEqual(26);
			expect(result.rows).toEqual(SAMPLE_SEGMENTATION_V3.rows.slice(0, 26));

			var contexts = {};
			result.rows.map(function(row) {
				if (!contexts[row.value]) {
					contexts[row.value] = 1;
				} else {
					contexts[row.value]++;
				}
			});
			expect(contexts).toEqual({
				"Qaynap\'unchaw lloqsi-nay-wa-ra-n khunan p\'unchawpaq": 13,
				"Qaynap\'unchaw lloqsi-nay-wa-ra-n khunan p\'unchaw": 13
			});

		});

		it("should fill IGT if it has no segmentation knowledge", function() {
			var glosser = new Glosser({
				corpus: tinyCorpus
			});
			expect(glosser.morphemeSegmentationKnowledgeBase).toBeUndefined();

			expect(glosser.guessMorphemesFromUtterance({
				utterance: "rtyuio"
			})).toEqual({
				utterance: "rtyuio",
				morphemes: "rtyuio",
				gloss: "?"
			});

		});

		it("should be able to predict the gloss after downloading rules", function(done) {
			var glosser = new Glosser({
				corpus: tinyCorpus
			});
			expect(glosser).toBeDefined();
			expect(glosser.corpus.dbname).toEqual("jenkins-firstcorpus");

			glosser.downloadPrecedenceRules().then(function(results) {
				expect(glosser.morphemeSegmentationKnowledgeBase.length).toBeGreaterThan(0);
				expect(glosser.morphemeSegmentationKnowledgeBase.length).toEqual(14);
				// expect(glosser.morphemeSegmentationKnowledgeBase).toEqual(14);
				expect(results).toEqual(glosser.morphemeSegmentationKnowledgeBase);
				// Rather than depending on server to have exact words in it, add it now to rules
				glosser.morphemeSegmentationKnowledgeBase["@-rt-yuio"] = 1;

				var datum = {
					utterance: "rtyuio"
				};
				glosser.guessMorphemesFromUtterance(datum);

				expect(datum.utterance).toEqual("rtyuio");
				expect(datum.morphemes).toEqual("rt-yuio");
				expect(datum.gloss).toEqual("?-?");

			}, function(reason) {
				console.warn("If you want to run this test, use CORSNode in the glosser instead of CORS")
				expect(reason.userFriendlyErrors[0]).toEqual("CORS not supported, your browser is unable to contact the database.");
			}).fail(function(exception) {
				console.log(exception.stack);
				expect(exception).toEqual(" unexpected exception while processing rules");
			}).done(done);

		}, specIsRunningTooLong);

	});

	describe("helper methods", function() {
		var glosser;
		beforeEach(function() {
			glosser = new Glosser({
				// debugMode: true
			});

			glosser.morphemeSegmentationKnowledgeBase = SAMPLE_SEGMENTATION_V3;
			expect(glosser.morphemeSegmentationKnowledgeBase).toBeDefined();
			expect(glosser.morphemeSegmentationKnowledgeBase["@-lloqsi-nay"]).toBeDefined();
			expect(glosser.morphemeSegmentationKnowledgeBase["nay-wa-ra"]).toBeDefined();
			expect(glosser.morphemeSegmentationKnowledgeBase["@-khunan-@"]).toBeDefined();
		});

		it("should be able to calculate combinations of segmented words", function() {
			var options = {
				alternateMorphemeLines: ["existing options which we like"],
				columns: [
					["x1", "x2"],
					["y1", "y2"],
					["z1", "z2", "z3", "z4"]
				]
			};
			Glosser.calculateAllAlternativeCombinations(options);
			expect(options.alternateMorphemeLines).toEqual(["existing options which we like", "x1 y1 z1", "x1 y1 z2", "x1 y1 z3", "x1 y1 z4", "x1 y2 z1", "x1 y2 z2", "x1 y2 z3", "x1 y2 z4", "x2 y1 z1", "x2 y1 z2", "x2 y1 z3", "x2 y1 z4", "x2 y2 z1", "x2 y2 z2", "x2 y2 z3", "x2 y2 z4"]);
		});

		it("should be able to sort combinations based injected sort function", function() {
			var options = {
				alternateMorphemeLines: ["existing options which we like", "exist-ing option-s wh-ich we like", "exist-ing option-s which we like"],
				sort: Glosser.sortAlternatesByMoreSegmentation
			};
			Glosser.calculateAllAlternativeCombinations(options);
			expect(options.alternateMorphemeLines).toEqual(["exist-ing option-s wh-ich we like", "exist-ing option-s which we like", "existing options which we like"]);
		});

		it("should be able remove redundant copies in an array without loosing their references", function() {
			var alternateMorphemeLines = ["abcde", "abcde", "abc-de"];

			var uniqueAlternates = Glosser.removeRedundantCopies(alternateMorphemeLines);
			expect(uniqueAlternates).toBe(alternateMorphemeLines);
			expect(uniqueAlternates).toEqual(["abcde", "abc-de"]);
			expect(alternateMorphemeLines).toEqual(["abcde", "abc-de"]);
		});

		it("should be able to find unique combinations", function() {
			var options = {
				alternateMorphemeLines: ["abcde", "abcde", "abc-de"],
				sort: Glosser.sortAlternatesByMoreSegmentation
			};
			Glosser.calculateAllAlternativeCombinations(options);
			expect(options.alternateMorphemeLines).toEqual(["abc-de", "abcde"]);
		});

		it("should findRelevantSegmentationContexts", function() {
			// glosser.debugMode = true;
			var parseInProgress = {
				utteranceWithExplictWordBoundaries: "@lloqsinaywaran@khunan@",
				matchingRules: []
			};
			glosser.findRelevantSegmentationContexts(parseInProgress);

			expect(parseInProgress.utteranceWithExplictWordBoundaries).toEqual("@-lloqsi-nay-wa-ra-n-@-khunan-@");
			expect(parseInProgress.matchingRules.length).toEqual(7);
			expect(parseInProgress.utterance).toBeUndefined();
			expect(parseInProgress.morphemes).toBeUndefined();
		});

		it("should return multiple options if there are only bigrams", function() {
			glosser.morphemeSegmentationKnowledgeBase = {
				"ra-n": 1,
				"@-lloqsi": 1,
				"lloqsi-naywaran": 1,
				"naywaran-@": 1,
				"not-relevant": 1,
				"n-@": 1
			};

			// glosser.debugMode = true;
			var parseInProgress = {
				utteranceWithExplictWordBoundaries: "@lloqsinaywaran@khunan@",
				matchingRules: []
			};
			glosser.findaAllPossibleMorphemeLines(parseInProgress);
			expect(parseInProgress.alternateMorphemeLines).toEqual(["lloqsi-naywaran khunan", "lloqsinaywaran khunan"]);
			// expect(parseInProgress.matchingRules).toEqual(" ");
			expect(parseInProgress.matchingRules.length).toEqual(5);
			expect(parseInProgress.usedRules.map(function(rule) {
				return rule.segmentation;
			})).toEqual(["@-lloqsi", "lloqsi-naywaran", "naywaran-@", "naywaran-@", "n-@", "n-@"]);
			expect(parseInProgress.usedRules.length).toEqual(6);
			expect(parseInProgress.alternateMorphemeSegmentationsByWord["lloqsinaywaran"].fullParses).toEqual(["lloqsi-naywaran", "lloqsinaywaran"]);
			expect(parseInProgress.alternateMorphemeSegmentationsByWord["khunan"].fullParses).toEqual(["khunan"]);
			// expect(parseInProgress.alternateMorphemeSegmentationsByWord).toEqual(" ");
		});

	});

	describe("visualization", function() {

		if (optionalD3) {
			it("should accept an element", function() {
				expect(virtualElement).toBeDefined();
			});

			it("should be able to use an injected d3 if a lexicon with entryRelations is defined", function() {
				var glosser = new Glosser({
					lexicon: JSON.parse(JSON.stringify(tinyLexicon))
				});
				glosser.lexicon.entryRelations = tinyPrecedenceRelationsFromCouchDBMapReduce;
				glosser.lexicon.d3 = optionalD3;
				glosser.lexicon.localDOM = virtualDOM;

				expect(glosser.lexicon.length).toEqual(2);
				expect(glosser.lexicon.collection.length).toEqual(2);

				expect(glosser.lexicon).toBeDefined();
				expect(glosser.lexicon.entryRelations).toBeDefined();
				expect(glosser.lexicon.fieldDBtype).toEqual("Lexicon");

				expect(glosser.render({
					element: virtualElement
				})).toEqual(glosser);
				if (glosser.warnMessage) {
					expect(glosser.warnMessage).not.toContain("d3");
					expect(glosser.warnMessage).not.toContain("visualize");
				}
				if (glosser.lexicon.warnMessage) {
					expect(glosser.lexicon.warnMessage).not.toContain("d3");
					expect(glosser.lexicon.warnMessage).not.toContain("visualize");
				}
			});
		}

		it("should warn about visualizing an empty lexicon", function() {
			var glosser = new Glosser();
			expect(glosser.lexicon).toBeUndefined();
			expect(glosser.render()).toEqual(glosser);
			expect(glosser.warnMessage).toBeDefined();
			expect(glosser.warnMessage).toContain("Cannot visualize an empty lexicon.");
		});

		it("should warn about visualizing a lexicon with no precedence relations", function() {
			var glosser = new Glosser({
				lexicon: tinyLexicon
			});
			expect(glosser.render()).toEqual(glosser);
			expect(glosser.lexicon.warnMessage).toBeDefined();
			expect(glosser.lexicon.warnMessage).toContain("lexicon doesn't know about any entryRelations");
		});

		it("should not require D3", function() {
			var glosser = new Glosser({
				lexicon: JSON.parse(JSON.stringify(tinyLexicon))
			});
			glosser.lexicon.entryRelations = tinyPrecedenceRelationsFromCouchDBMapReduce;

			expect(glosser.lexicon.d3).toBeUndefined();
			expect(glosser.render()).toEqual(glosser);
			expect(glosser.lexicon.d3).toBeUndefined();
			expect(glosser.lexicon.warnMessage).toBeDefined();
			expect(glosser.lexicon.warnMessage).toContain("Lexicon will be unable to render a visual representation of itself.");
		});

		it("should not require the DOM", function() {
			var glosser = new Glosser();
			expect(glosser.localDOM).toBeUndefined();
			expect(glosser.render()).toEqual(glosser);
		});

		it("should accept D3", function() {
			var glosser = new Glosser({
				d3: {
					mocked: "d3 injection"
				}
			});
			expect(glosser).toBeDefined();
			expect(glosser.d3).toEqual({
				mocked: "d3 injection"
			});

		});

	});

	describe("backward compatibility", function() {

		it("should be backward compatible with prototype app", function() {
			var glosser = new Glosser();

			// .downloadPrecedenceRules(dbname, glosserURL, callback);
			// .downloadPrecedenceRules(dbname, callback);
			expect(typeof glosser.downloadPrecedenceRules).toEqual("function");

			// .visualizeMorphemesAsForceDirectedGraph(null, $(this.el).find(".corpus-precedence-rules-visualization")[0], this.model.get("dbname"))
			expect(typeof glosser.visualizeMorphemesAsForceDirectedGraph).toEqual("function");

			// .guessMorphemesFromUtterance(asIGT).morphemes;
			expect(typeof glosser.guessMorphemesFromUtterance).toEqual("function");

			// .guessGlossFromMorphemes(asIGT).gloss;
			expect(typeof glosser.guessGlossFromMorphemes).toEqual("function");

			// .guessUtteranceFromMorphemes(asIGT).utterance;
			expect(typeof glosser.guessUtteranceFromMorphemes).toEqual("function");

			// .morphemefinder(utteranceLine);
			expect(typeof glosser.morphemefinder).toEqual("function");

			// .glossFinder(morphemesLine);
			expect(typeof glosser.glossFinder).toEqual("function");

			// 
			expect(typeof glosser.downloadPrecedenceRules).toEqual("function");

			// 
			expect(typeof glosser.downloadPrecedenceRules).toEqual("function");

			// 
			expect(typeof glosser.downloadPrecedenceRules).toEqual("function");

		});

		it("should be backward compatible with spreadsheet app", function() {
			var glosser = new Glosser();

			// .downloadPrecedenceRules(dbname, optionalUrl, function(entryRelations) {})
			expect(typeof glosser.downloadPrecedenceRules).toEqual("function");

			// .guessMorphemesFromUtterance(tempDatum, !$scope.useAutoGlosser);
			expect(typeof glosser.guessMorphemesFromUtterance).toEqual("function");

			// .guessUtteranceFromMorphemes(tempDatum, !$scope.useAutoGlosser);
			expect(typeof glosser.guessUtteranceFromMorphemes).toEqual("function");

			// .guessGlossFromMorphemes(tempDatum, !$scope.useAutoGlosser);
			expect(typeof glosser.guessGlossFromMorphemes).toEqual("function");

		});

		it("should be backward compatible with the lexicon browser", function() {
			var glosser = new Glosser();

			// .downloadPrecedenceRules(scope.corpus.dbname,  'http://localhost:5984/' + scope.corpus.dbname +  '/_design/lexicon/_view/morphemesPrecedenceContext?group=true&limit=400')
			expect(typeof glosser.downloadPrecedenceRules).toEqual("function");

			// .render()
			expect(typeof glosser.render).toEqual("function");

			// .isWithinConfidenceRange(confidentIGT, mediumHighConfidenceRange), false);
			expect(typeof glosser.isWithinConfidenceRange).toEqual("function");

			// .visualizePrecedenceRelationsAsForceDirectedGraph(scope.corpus.lexicon, glosserElement, false, confidenceRange);
			expect(typeof glosser.visualizePrecedenceRelationsAsForceDirectedGraph).toEqual("function");

		});

	});

});
