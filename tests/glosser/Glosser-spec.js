var Glosser = require("../../api/glosser/Glosser").Glosser;
// var morpheme_n_grams = require("../../couchapp_dev/views/morpheme_n_grams/map").morpheme_n_grams;

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
	virtualDOM = require('jsdom').jsdom('<html><head></head><body></body></html>');
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
			"relation": "preceeds",
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

	describe("semi-automatic glossing", function() {
		var rows;
		var emit = function(key, value) {
			rows.push({
				key: key,
				value: value
			})
		};
		beforeEach(function() {
			rows = [];
		});

		xit("should be able to build ngrams", function() {
			expect(emit).toBeDefined();

			var doc = {
				fields: [{
					id: "morphemes",
					mask: "Victor-ta tusu-naya-n"
				}]
			}
			expect(doc).toBeDefined();
			console.log("Testing ngrams");
			morpheme_n_grams(doc, emit);

			expect(rows).toBeDefined();
			// expect(rows).toEqual();
			expect(rows.length).toEqual(10);
			expect(rows[4].value).toEqual("Victor-ta tusu-naya-n");

		});

		xit("should be able to build ngrams", function() {
			// var rows = [];
			expect(emit).toBeDefined();

			var doc = {
				fields: [{
					id: "morphemes",
					mask: "Qaynap'unchaw lloqsi-nay-wa-ra-n khunan p'unchaw(paq)"
				}]
			}
			expect(doc).toBeDefined();
			console.log("Testing ngrams");
			morpheme_n_grams(doc, emit);

			expect(rows).toBeDefined();
			expect(rows.length).toEqual(30);

			var contexts = {};
			rows.map(function(row) {
				if (!contexts[row.value]) {
					contexts[row.value] = 1
				} else {
					contexts[row.value]++;
				}
			});
			expect(contexts).toEqual({
				"Qaynap'unchaw lloqsi-nay-wa-ra-n khunan p'unchawpaq": 15,
				"Qaynap'unchaw lloqsi-nay-wa-ra-n khunan p'unchaw": 15
			});

		});

		it("should be able to predict the gloss", function(done) {
			var glosser = new Glosser({
				corpus: tinyCorpus
			});
			expect(glosser).toBeDefined();
			expect(glosser.corpus.dbname).toEqual("jenkins-firstcorpus");

			glosser.downloadPrecedenceRules().then(function(results) {
				expect(glosser.morphemePrecedenceRelations.length).toEqual(14);
				expect(results).toEqual(glosser.morphemePrecedenceRelations);
			}, function(reason) {
				expect(reason.userFriendlyErrors[0]).toEqual("CORS not supported, your browser is unable to contact the database.");
			}).fail(function(exception) {
				expect(exception).toEqual(" unexpected exception while processing rules");
			}).done(done);

		}, specIsRunningTooLong);

	});

	xdescribe("visualization", function() {

		if (optionalD3) {
			it("should accept an element", function() {
				expect(virtualElement).toBeDefined();
			});

			it("should be able to use an injected d3 if a lexicon with precedenceRelations is defined", function() {
				var glosser = new Glosser({
					lexicon: JSON.parse(JSON.stringify(tinyLexicon))
				});
				glosser.lexicon.precedenceRelations = tinyPrecedenceRelationsFromCouchDBMapReduce;
				glosser.lexicon.d3 = optionalD3;
				glosser.lexicon.localDOM = virtualDOM;

				expect(glosser.lexicon).toBeDefined();
				expect(glosser.lexicon.precedenceRelations).toBeDefined();
				expect(glosser.lexicon.fieldDBtype).toEqual("Lexicon");

				expect(glosser.render(virtualElement)).toEqual(glosser);
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
			glosser.lexicon.precedenceRelations = tinyPrecedenceRelationsFromCouchDBMapReduce;

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

			// .downloadPrecedenceRules(dbname, optionalUrl, function(precedenceRelations) {})
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
