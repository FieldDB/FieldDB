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
    'fielddbAngularApp',
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
      // templateUrl: 'views/compacttemplate.html'
      redirectTo: '/spreadsheet/mcgillfieldmethodsfall2014template'
    }).when('/spreadsheet/fulltemplate', {
      // templateUrl: 'views/fulltemplate.html' //FOR mcgillOnly deployment
      redirectTo: '/spreadsheet/mcgillfieldmethodsfall2014template'
    }).when('/spreadsheet/yalefieldmethodsspring2014template', {
      // templateUrl: 'views/yalefieldmethodsspring2014template.html'
      redirectTo: '/spreadsheet/mcgillfieldmethodsfall2014template'

    }).when('/spreadsheet/mcgillfieldmethodsfall2014template', {
      templateUrl: 'views/mcgillfieldmethodsfall2014template.html'
    }).otherwise({
      redirectTo: '/corpora_list'
    });

  });
