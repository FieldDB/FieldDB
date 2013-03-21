console.log("Loading the LingSync Spreadsheet module.");

'use strict';
define([ "angular", "js/controllers/LingSyncSpreadsheetController", "js/controllers/LingSyncSpreadsheetSettingsController",
		"js/directives/LingSyncSpreadsheetDirectives", "js/filters/LingSyncSpreadsheetFilters",
		"js/services/LingSyncSpreadsheetServices", "js/controllers/SandboxController" ], function(angular, LingSyncSpreadsheetController, LingSyncSpreadsheetSettingsController,
				LingSyncSpreadsheetDirectives, LingSyncSpreadsheetFilters, LingSyncSpreadsheetServices, SandboxController) {
	/**
	 * The main LingSync Angular UI module.
	 * 
	 * @type {angular.Module}
	 */

	var LingSyncSpreadsheet = angular.module('LingSyncSpreadsheet',
			[ 'LingSyncSpreadsheet.services', 'LingSyncSpreadsheet.directives', 'LingSyncSpreadsheet.filters' ]).config(
			[ '$routeProvider', function($routeProvider) {
				window.LingSyncSpreadsheetController = LingSyncSpreadsheetController;
				console.log("Initializing the LingSync Spreadsheet module.");
				$routeProvider.when('/lingsync_spreadsheet', {
					templateUrl : 'partials/main.html',
				}).when('/settings', {
					templateUrl : 'partials/settings.html',
					controller : LingSyncSpreadsheetSettingsController
				}).when('/sandbox', {
					templateUrl : 'partials/sandbox.html', controller: SandboxController,
				}).when('/lingsync/template1', {
					templateUrl : 'partials/template1.html',
				}).when('/lingsync/template2', {
					templateUrl : 'partials/template2.html',
				}).otherwise({
					redirectTo : '/lingsync_spreadsheet'
				});
			} ]);
	return LingSyncSpreadsheet;
});