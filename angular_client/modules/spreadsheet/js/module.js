/* globals define */
console.log("Loading the Spreadsheet module.");

define(
  ["angular", "js/controllers/SpreadsheetController",
    "js/controllers/SettingsController",
    "js/directives", "js/filters", "js/partials",
    "js/services", "js/private_services"
  ],
  function(angular, SpreadsheetStyleDataEntryController,
    SpreadsheetStyleDataEntrySettingsController,
    SpreadsheetStyleDataEntryDirectives, SpreadsheetStyleDataEntryFilters, SpreadsheetStyleDataEntryPartials,
    SpreadsheetStyleDataEntryServices, SpreadsheetPrivateServices) {

    /**
     * The main Spreadsheet Angular UI module.
     *
     * @type {angular.Module}
     */

    'use strict';
    console.log("loading ", SpreadsheetPrivateServices, SpreadsheetStyleDataEntryServices);

    var SpreadsheetStyleDataEntry = angular
      .module(
        'SpreadsheetStyleDataEntry', ['spreadsheet_services',
          'spreadsheet_private_services',
          'spreadsheet_directives',
          'spreadsheet_filters', 'ui.bootstrap', 'angular-md5'
        ])
      .config(
        [
          '$routeProvider',
          function($routeProvider) {
            window.SpreadsheetStyleDataEntryController = SpreadsheetStyleDataEntryController;
            console.log("Initializing the Spreadsheet module.");
            $routeProvider.when('/corpora_list', {
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
            }).when('/spreadsheet/yalefieldmethodsspring2014template', {
              templateUrl: 'partials/yalefieldmethodsspring2014template.html'
            }).when('/spreadsheet/mcgillfieldmethodsspring2014template', {
              templateUrl: 'partials/mcgillfieldmethodsspring2014template.html'
            }).otherwise({
              redirectTo: '/corpora_list'
            });
          }
        ]);

    SpreadsheetStyleDataEntryPartials.init(SpreadsheetStyleDataEntry);
    return SpreadsheetStyleDataEntry;
  });
