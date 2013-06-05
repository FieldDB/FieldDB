console.log("Loading the LingSync Spreadsheet main");

// Set the RequireJS configuration
require.config({
	paths : {
		/* Twitter Bootstrap javascript files */
		"bootstrap" : "libs/bootstrap/js/bootstrap",

		/* jQuery */
		"jquery" : "libs/jquery",

		/* AngularJS */
		"angular" : "libs/angular/angular",
		"angular-resource" : "libs/angular/angular-resource"
	},
	shim : {
		"jquery" : {
			exports : "$"
		},
		"bootstrap" : {
			deps : [ "jquery" ],
			exports : "$"
		},
		"angular" : {
			exports : "angular"
		},
		"angular-resource" : {
			deps : [ "angular" ],
			exports : "angular"
		}
	}
});

/*
 * Declare only the variables that are needed here, the dependencies of the rest
 * will be discovered and loaded as needed by require.js
 */
require([ "bootstrap", "angular-resource", "module.js" ],
		function($, angular, LingSync) {
	console.log("Initializing the LingSync Spreadsheet page.");

	angular.bootstrap(document, [ 'LingSyncSpreadsheet' ]);
});