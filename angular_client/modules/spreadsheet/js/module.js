console.log("Loading the Spreadsheet module.");

'use strict';
define(
  ["angular", "js/controllers/SpreadsheetController",
    "js/controllers/SettingsController",
    "js/directives", "js/filters",
    "js/services", "js/controllers/SandboxController"
  ],
  function(angular, SpreadsheetStyleDataEntryController,
    SpreadsheetStyleDataEntrySettingsController,
    SpreadsheetStyleDataEntryDirectives, SpreadsheetStyleDataEntryFilters,
    SpreadsheetStyleDataEntryServices, SandboxController) {
    /**
     * The main Spreadsheet Angular UI module.
     *
     * @type {angular.Module}
     */

    var SpreadsheetStyleDataEntry = angular
      .module(
        'SpreadsheetStyleDataEntry', ['SpreadsheetStyleDataEntry.services',
          'SpreadsheetStyleDataEntry.directives',
          'SpreadsheetStyleDataEntry.filters', 'ui.bootstrap'
        ])
      .config(
        [
          '$routeProvider',
          function($routeProvider) {
            window.SpreadsheetStyleDataEntryController = SpreadsheetStyleDataEntryController;
            console.log("Initializing the Spreadsheet module.");
            $routeProvider.when('/spreadsheet_main', {
              templateUrl: 'partials/main.html'
            }).when('/settings', {
              templateUrl: 'partials/settings.html',
              controller: SpreadsheetStyleDataEntrySettingsController
            }).when('/corpussettings', {
              templateUrl: 'partials/corpussettings.html'
            }).when('/register', {
              templateUrl: 'partials/register.html'
            }).when('/faq', {
              templateUrl: 'partials/faq.html'
            }).when('/spreadsheet/compacttemplate', {
              templateUrl: 'partials/compacttemplate.html'
            }).when('/spreadsheet/fulltemplate', {
              templateUrl: 'partials/fulltemplate.html'
            }).otherwise({
              redirectTo: '/spreadsheet_main'
            });
          }
        ]);
    return SpreadsheetStyleDataEntry;
  });