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
      templateUrl: 'views/main.html'
    }).when('/settings', {
      templateUrl: 'views/settings.html',
      controller: 'SpreadsheetStyleDataEntrySettingsController'
    }).when('/corpussettings', {
      templateUrl: 'views/corpussettings.html'
    }).when('/register', {
      templateUrl: 'views/register.html'
    }).when('/faq', {
      templateUrl: 'views/faq.html'
    }).when('/spreadsheet/compacttemplate', {
      templateUrl: 'views/compacttemplate.html'
    }).when('/spreadsheet/fulltemplate', {
      templateUrl: 'views/fulltemplate.html'
    }).when('/spreadsheet/yalefieldmethodsspring2014template', {
      templateUrl: 'views/yalefieldmethodsspring2014template.html'
    }).when('/spreadsheet/mcgillfieldmethodsspring2014template', {
      templateUrl: 'views/mcgillfieldmethodsspring2014template.html'
    }).otherwise({
      redirectTo: '/corpora_list'
    });

  });
