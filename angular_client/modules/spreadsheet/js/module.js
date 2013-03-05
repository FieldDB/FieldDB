console.log("Loading the LingSync Angular UI module.");

'use strict';
define([ "angular", "js/controllers/LingSyncController", "js/controllers/SettingsController",
		"js/directives/LingSyncDirectives", "js/filters/LingSyncFilters",
		"js/services/LingSyncServices" ], function(angular, LingSyncController, SettingsController,
				LingSyncDirectives, LingSyncFilters, LingSyncServices) {
	/**
	 * The main LingSync Angular UI module.
	 * 
	 * @type {angular.Module}
	 */

	var LingSync = angular.module('LingSync',
			[ 'LingSync.services', 'LingSync.directives', 'LingSync.filters' ]).config(
			[ '$routeProvider', function($routeProvider) {
				window.LingSyncController = LingSyncController;
				console.log("Initializing the LingSync Angular UI module.");
				$routeProvider.when('/lingsync', {
					templateUrl : 'partials/main.html',
				}).when('/settings', {
					templateUrl : 'partials/settings.html',
					controller : SettingsController
				}).when('/lingsync/template1', {
					templateUrl : 'partials/template1.html',
				}).when('/lingsync/template2', {
					templateUrl : 'partials/template2.html',
				}).otherwise({
					redirectTo : '/lingsync'
				});
			} ]);
	return LingSync;
});