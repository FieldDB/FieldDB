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
		
		/* Additional Jasmine runner files for XML and console output */
		"JUnitReporter" : "libs/jasmine-reporters/src/jasmine.junit_reporter",
		
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
		"JUnitReporter" : {
			deps : [ "jasmine-html" ],
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
		"libs/backbone/BackboneModelTest", "libs/backbone/JQueryTest", "JUnitReporter"

], function(jasmine) {
	var jasmineEnv = jasmine.getEnv();
	jasmineEnv.updateInterval = 1000;

	if (/PhantomJS/.test(navigator.userAgent)) {
		jasmineEnv.addReporter(new jasmine.TrivialReporter());
		jasmineEnv.addReporter(new jasmine.JUnitXmlReporter());
	} else {
		var htmlReporter = new jasmine.HtmlReporter();

		jasmineEnv.addReporter(htmlReporter);

		jasmineEnv.specFilter = function(spec) {
			return htmlReporter.specFilter(spec);
		};
	}

	jasmineEnv.execute();

});
