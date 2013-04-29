//Set the RequireJS configuration

require.config({
	baseUrl : "",

	paths : {
		"Player" : "libs/jasmine/src/Player",
		"Song" : "libs/jasmine/src/Song",
		"jasmine" : "libs/jasmine/jasmine",
		"jasmine-html" : "libs/jasmine/jasmine-html",
		"PlayerSpec" : "libs/jasmine/spec/PlayerSpec",
		"SpecHelper" : "libs/jasmine/spec/SpecHelper"
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
		}
	}

});

// Run the tests!
require([ "jasmine-html", "PlayerSpec"

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
