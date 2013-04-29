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
		}
	}

});

// Run the tests!
require([ "jasmine-jquery-spec", "PlayerSpec",
		"../tests/libs/backbone/BackboneModelTest",
		"../tests/libs/backbone/JQueryTest"

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
