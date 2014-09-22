console.log("Loading the Spreadsheet main");

// Set the RequireJS configuration
require.config({
  paths: {
  		/* AngularJS */
		"angular": "bower_components/angular/angular",
    "angular-resource": "bower_components/angular-resource/angular-resource",
    "angular-cookies": "bower_components/angular-cookies/angular-cookies",
    "angular-sanitize": "bower_components/angular-sanitize/angular-sanitize",
    "angular-animate": "bower_components/angular-animate/angular-animate",
    "angular-touch": "bower_components/angular-touch/angular-touch",
    "angular-route": "bower_components/angular-route/angular-route",
    /* if you modify/add to these modules, please add them to the tests by putting them in karma.conf.js */
		"bootstrap": "libs/angular/ui-bootstrap.min",
		"_": "bower_components/underscore/underscore",
		"Glosser": "bower_components/fielddb-glosser/fielddb-glosser",
		"angular-md5": "bower_components/angular-md5/angular-md5",
		"recorder": "libs/recorderjs/recorder",
    "recorderWorker": "libs/recorderjs/recorderWorker.js",
		"sjcl": "libs/sjcl",
		"Q": "bower_components/q/q"
	},
	shim: {
		"angular": {
			exports: "angular"
		},
		"angular-md5": {
			deps: ["angular"],
			exports: "angular"
		},
		"angular-resource": {
			deps: ["angular-md5"],
			exports: "angular"
		},
		"bootstrap": {
			deps: ["angular-resource"],
			exports: "angular"
		},
		"Glosser": {
			deps: ["_"],
			exports: "Glosser"
		},
		"Q": {
			exports: "Q"
		}
	}
});

/*
 * Declare only the variables that are needed here, the dependencies of the rest
 * will be discovered and loaded as needed by require.js
 */
require(["bootstrap", "_", "Glosser", "Q", "recorder", "sjcl", "js/module.js"],
	function(angular, _, Glosser, Q) {
		window.Q = Q; //TODO upgrade angular so we can use angular promises which are not unfolded... or use yo angular to use angular wiht out require...
		console.log("Initializing the Spreadsheet page.");
		angular.bootstrap(document, ['SpreadsheetStyleDataEntry']);
	});
