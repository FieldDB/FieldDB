console.log("Loading the Spreadsheet main");

// Set the RequireJS configuration
require.config({
  paths: {
  	/* AngularJS */
		"angular": "libs/angular/angular",
		"angular-resource": "libs/angular/angular-resource",
		"bootstrap": "libs/angular/ui-bootstrap.min",
		"underscore": "libs/underscore-min",
		"glosser": "libs/glosser/Glosser",
		"recorder": "libs/recorderjs/recorder",
		"sjcl": "libs/sjcl"
	},
	shim: {
		"angular": {
			exports: "angular"
		},
		"angular-resource": {
			deps: ["angular"],
			exports: "angular"
		},
		"bootstrap": {
			deps: ["angular-resource"],
			exports: "angular"
		}
	}
});

/*
 * Declare only the variables that are needed here, the dependencies of the rest
 * will be discovered and loaded as needed by require.js
 */
require(["bootstrap", "underscore", "glosser", "recorder", "sjcl", "js/module.js"],
	function(angular) {
		console.log("Initializing the Spreadsheet page.");

		angular.bootstrap(document, ['SpreadsheetStyleDataEntry']);
	});