var Corpus = require("../../api/corpus/CorpusMask").CorpusMask;

describe("CorpusMask ", function() {

	it("should load", function() {
		console.log(Corpus);
		expect(Corpus).toBeDefined();
	});

	xit("should have unknown defaults if not loaded from the server", function() {
		var corpus = new Corpus({
			dbname: "lingllama-communitycorpus"
		});
		expect(corpus.toJSON("complete")).toEqual({
			dbname: 'lingllama-communitycorpus',
			version: 'v2.0.1',
			title: 'Unknown',
			titleAsUrl: 'Unknown',
			description: 'The details of this corpus are not available.',
			location: {
				latitude: 0,
				longitude: 0,
				accuracy: 0
			},
			members: [],
			datumStates: [],
			datumFields: [],
			sessionFields: [],
			datalists: [],
			sessions: [],
			couchConnections: [],
			olacConnections: []
		});
	});


	xit("should be able to fillWithDefaults", function() {
		var corpus = new Corpus({
			dbname: "username-afreshcorpus"
		});
		corpus.fillWithDefaults();
		expect(corpus.toJSON()).toEqual({
			dbname: 'username-afreshcorpus',
			version: 'v2.0.1',
			title: 'Private Corpus',
			titleAsUrl: 'PrivateCorpus',
			description: 'The details of this corpus are not public.',
			location: {
				latitude: 0,
				longitude: 0,
				accuracy: 0
			},
			couchConnections: [],
			olacConnections: [],
			termsOfUse: {
				humanReadable: 'Sample: The materials included in this corpus are available for research and educational use. If you want to use the materials for commercial purposes, please notify the author(s) of the corpus (myemail@myemail.org) prior to the use of the materials. Users of this corpus can copy and redistribute the materials included in this corpus, under the condition that the materials copied/redistributed are properly attributed.  Modification of the data in any copied/redistributed work is not allowed unless the data source is properly cited and the details of the modification is clearly mentioned in the work. Some of the items included in this corpus may be subject to further access conditions specified by the owners of the data and/or the authors of the corpus.'
			},
			license: {
				title: 'Default: Creative Commons Attribution-ShareAlike (CC BY-SA).',
				humanReadable: 'This license lets others remix, tweak, and build upon your work even for commercial purposes, as long as they credit you and license their new creations under the identical terms. This license is often compared to “copyleft” free and open source software licenses. All new works based on yours will carry the same license, so any derivatives will also allow commercial use. This is the license used by Wikipedia, and is recommended for materials that would benefit from incorporating content from Wikipedia and similarly licensed projects.',
				imageUrl: '',
				link: 'http://creativecommons.org/licenses/by-sa/3.0/'
			},
			copyright: 'Default: Add names of the copyright holders of the corpus.',
			datumStates: [{
				state: 'Checked*',
				color: 'green'
			}, {
				state: 'Published*',
				color: 'blue'
			}],
			datumFields: [{
				label: 'judgement',
				labelMachine: 'judgement',
				size: '3',
				help: 'Acceptablity judgement (*,#,?  mean this sentence is strange)',
				helpLinguist: 'Gramaticality/acceptablity judgement (Ungrammatical:*, Nonfelicitous:#, Unknown:?)'
			}, {
				label: 'utterance',
				labelMachine: 'utterance',
				help: 'What was said/written',
				helpLinguist: 'Line 1 in examples for handouts (ie, either Orthography, or phonemic/phonetic representation)'
			}, {
				label: 'morphemes',
				labelMachine: 'morphemes',
				help: 'Words divided into prefixes, root and suffixes',
				helpLinguist: 'Morpheme segmentation'
			}, {
				label: 'gloss',
				labelMachine: 'gloss',
				help: 'Translation for each prefix, root and suffix in the words',
				helpLinguist: 'Glosses for morphemes'
			}, {
				label: 'translation',
				labelMachine: 'translation',
				help: 'Translation into English/Spanish/Russian, or simply a language the team is comfortable with. There may also be additional languages in the other fields.',
				helpLinguist: 'The team\'s primary translation. It might not be English, just a language the team is comfortable with. There may also be additional languages in the other fields.'
			}],
			sessionFields: [{
				label: 'dialect',
				labelMachine: 'dialect',
				help: 'Dialect of this example (city, village, region etc)',
				helpLinguist: 'This dialect may precise as the team chooses (province, region, city, village or some other measure of dialect)'
			}, {
				label: 'register',
				labelMachine: 'register',
				help: 'Social register of this example (friends, children speaking with children, formal, religious, ceremonial etc)',
				helpLinguist: 'This is an optional field which indicates the social register of the example (friends, children speaking with children, formal, religious, ceremonial etc)'
			}, {
				label: 'language',
				labelMachine: 'language',
				language: {
					ethnologueUrl: '',
					wikipediaUrl: '',
					iso: '',
					locale: '',
					englishName: '',
					nativeName: '',
					alternateNames: ''
				},
				help: 'This is the langauge (or language family)',
				helpLinguist: 'This is the langauge (or language family)'
			}, {
				label: 'source',
				labelMachine: 'consultant',
				help: 'This is the source of the data (publication, document, person)'
			}, {
				label: 'location',
				labelMachine: 'location',
				location: {
					latitude: 0,
					longitude: 0,
					accuracy: 0
				},
				help: 'This is the gps location of the elicitation session (if available)'
			}, {
				label: 'dateElicited',
				labelMachine: 'dateElicited',
				help: 'This is the date in which the session took place.',
				timestamp: null,
				timestampAccuracy: ''
			}],
			comments: [],
			members: [],
			datalists: [],
			sessions: []
		});
	});
});
