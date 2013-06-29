console.log("Loading the Spreadsheet module.");

'use strict';
define([ "angular", "js/controllers/SpreadsheetController", "js/controllers/SettingsController",
		"js/directives", "js/filters",
		"js/services", "js/controllers/SandboxController" ], function(angular, SpreadsheetStyleDataEntryController, SpreadsheetStyleDataEntrySettingsController,
				SpreadsheetStyleDataEntryDirectives, SpreadsheetStyleDataEntryFilters, SpreadsheetStyleDataEntryServices, SandboxController) {
	/**
	 * The main Spreadsheet Angular UI module.
	 * 
	 * @type {angular.Module}
	 */

	var SpreadsheetStyleDataEntry = angular.module('SpreadsheetStyleDataEntry',
			[ 'SpreadsheetStyleDataEntry.services', 'SpreadsheetStyleDataEntry.directives', 'SpreadsheetStyleDataEntry.filters', 'ui.bootstrap' ]).config(
			[ '$routeProvider', function($routeProvider) {
				window.SpreadsheetStyleDataEntryController = SpreadsheetStyleDataEntryController;
				console.log("Initializing the Spreadsheet module.");
				$routeProvider.when('/spreadsheet_main', {
					templateUrl : 'partials/main.html',
				}).when('/settings', {
					templateUrl : 'partials/settings.html',
					controller : SpreadsheetStyleDataEntrySettingsController
				}).when('/sandbox', {
					templateUrl : 'partials/sandbox.html', controller: SandboxController,
				}).when('/spreadsheet/template1', {
					templateUrl : 'partials/template1.html',
				}).when('/spreadsheet/template2', {
					templateUrl : 'partials/template2.html',
				}).otherwise({
					redirectTo : '/spreadsheet_main'
				});
			} ]);
	return SpreadsheetStyleDataEntry;
});