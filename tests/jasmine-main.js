//Set the RequireJS configuration

require.config({
	baseUrl : "../backbone_client/",

	paths : {
		"jasmine" : "../tests/libs/jasmine/jasmine",
		"jasmine-html" : "../tests/libs/jasmine/jasmine-html",
		/* Tests to ensure jasmine is running */
		"Player" : "../tests/libs/jasmine/src/Player",
		"Song" : "../tests/libs/jasmine/src/Song",
		"PlayerSpec" : "../tests/libs/jasmine/spec/PlayerSpec",
		"SpecHelper" : "../tests/libs/jasmine/spec/SpecHelper",

		"sinon" : "../tests/libs/sinon/sinon",

		/* load FieldDB dependencies */
		"handlebars" : "libs/handlebars.runtime",
		"compiledTemplates" : "libs/compiled_handlebars",
		"$" : "libs/jquery",
		"_" : "libs/underscore",
		"backbone" : "libs/backbone",

		/* load tests for dependencies */
		"jasmine-jquery" : "../tests/libs/backbone/jasmine-jquery",
		"jasmine-ajax" : "../tests/libs/backbone/mock-ajax",
		"jasmine-jquery-spec" : "../tests/libs/backbone/jasmine-jquery-spec",

	},
	shim : {
		"jasmine-html" : {
			deps : [ "jasmine" ],
			exports : "jasmine"
		},
		"SpecHelper" : {
			deps : [ "jasmine-html" ],
			exports : "jasmine"
		},
		"PlayerSpec" : {
			deps : [ "SpecHelper", "Player", "Song" ],
			exports : "PlayerSpec"
		},

		"sinon" : {
			deps : [ "jasmine-html" ],
			exports : "sinon"
		},

		"jasmine-jquery" : {
			deps : [ "jasmine-html", "$" ],
			exports : "jasmine"
		},
		"jasmine-ajax" : {
			deps : [ "jasmine-jquery", "jasmine-html", "$" ],
			exports : "jasmine"
		},
		"jasmine-jquery-spec" : {
			deps : [ "jasmine-ajax" ],
			exports : "jasmine"
		},

		"backbone" : {
			deps : [ "_", "$" ],
			exports : "Backbone"
		},
		"handlebars" : {
			deps : [ "backbone", "$" ],
			exports : "Handlebars"
		},
		"compiledTemplates" : {
			deps : [ "handlebars" ],
			exports : "Handlebars"
		}
	}

});

// Run the tests!
require([ "jasmine-html", "compiledTemplates",
/* These tests need to run, or no backbone tests will run */
"PlayerSpec", "../tests/libs/backbone/JQueryTest",
		"../tests/libs/backbone/BackboneModelTest",
/* Test dependancies, run once in a while */
// "jasmine-jquery-spec"
], function(jasmine) {
	var jasmineEnv = jasmine.getEnv();
	jasmineEnv.updateInterval = 1000;

	var htmlReporter = new jasmine.HtmlReporter();

	jasmineEnv.addReporter(htmlReporter);

	jasmineEnv.specFilter = function(spec) {
		return htmlReporter.specFilter(spec);
	};

	jasmineEnv.execute();

});
