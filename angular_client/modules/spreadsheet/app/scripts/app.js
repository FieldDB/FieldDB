'use strict';

/**
 * @ngdoc overview
 * @name spreadsheetApp
 * @description
 * # spreadsheetApp
 *
 * Main module of the application.
 */
angular
  .module('spreadsheetApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'angular-md5',
    'ui.bootstrap'
  ])
  .config(function($routeProvider) {

    $routeProvider.when('/corpora_list', {
      templateUrl: 'partials/main.html'
    }).when('/settings', {
      templateUrl: 'partials/settings.html',
      controller: 'SpreadsheetStyleDataEntrySettingsController'
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

  });
