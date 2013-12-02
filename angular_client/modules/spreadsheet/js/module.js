console.log("Loading the Spreadsheet module.");

define(
  ["angular", "js/controllers/SpreadsheetController",
    "js/controllers/SettingsController",
    "js/directives", "js/filters",
    "js/services", "js/private_services"
  ],
  function(angular, SpreadsheetStyleDataEntryController,
    SpreadsheetStyleDataEntrySettingsController,
    SpreadsheetStyleDataEntryDirectives, SpreadsheetStyleDataEntryFilters,
    SpreadsheetStyleDataEntryServices, SpreadsheetPrivateServices) {
    /**
     * The main Spreadsheet Angular UI module.
     *
     * @type {angular.Module}
     */

    'use strict';

    var SpreadsheetStyleDataEntry = angular
      .module(
        'SpreadsheetStyleDataEntry', ['spreadsheet_services',
          'spreadsheet_private_services',
          'spreadsheet_directives',
          'spreadsheet_filters', 'ui.bootstrap'
        ])
      .config(
        [
          '$routeProvider',
          function($routeProvider) {
            window.SpreadsheetStyleDataEntryController = SpreadsheetStyleDataEntryController;
            console.log("Initializing the Spreadsheet module.");
            $routeProvider.when('/settings', {
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
            }).when('/', {
              templateUrl: 'partials/main.html'
            }).otherwise({
              redirectTo: '/'
            });
          }
        ]);
    return SpreadsheetStyleDataEntry;
  });