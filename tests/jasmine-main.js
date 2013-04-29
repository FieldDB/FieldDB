//Set the RequireJS configuration

require.config({
	baseUrl : "",

	paths : {
		"jasmine" : "libs/jasmine/jasmine",
		"jasmine-html" : "libs/jasmine/jasmine-html",
		/* Tests to ensure jasmine is running */
		"Player" : "libs/jasmine/src/Player",
		"Song" : "libs/jasmine/src/Song",
		"PlayerSpec" : "libs/jasmine/spec/PlayerSpec",
		"SpecHelper" : "libs/jasmine/spec/SpecHelper",

		"sinon" : "libs/sinon/sinon",

		/* load FieldDB dependencies */
		"$" : "../backbone_client/libs/jquery",
		"_" : "../backbone_client/libs/underscore",
		"backbone" : "../backbone_client/libs/backbone",

		/* load tests for dependencies */
		"jasmine-jquery" : "libs/backbone/jasmine-jquery",
		"jasmine-ajax" : "libs/backbone/mock-ajax",
		"jasmine-jquery-spec" : "libs/backbone/jasmine-jquery-spec",

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
		"libs/backbone/BackboneModelTest", "libs/backbone/JQueryTest"

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
