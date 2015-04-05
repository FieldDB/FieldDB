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
      redirectTo: '/spreadsheet/fulltemplate'
    }).when('/spreadsheet/fulltemplate', {
      templateUrl: 'views/fulltemplate.html'
    }).when('/spreadsheet/yalefieldmethodsspring2014template', {
      // templateUrl: 'views/yalefieldmethodsspring2014template.html'
      redirectTo: '/spreadsheet/fulltemplate'
    }).when('/spreadsheet/mcgillfieldmethodsfall2014template', {
      // templateUrl: 'views/mcgillfieldmethodsfall2014template.html'
      redirectTo: '/spreadsheet/fulltemplate'
    }).when('/spreadsheet/mcgillfieldmethodsspring2014template', {
      // templateUrl: 'views/mcgillfieldmethodsspring2014template.html'
      redirectTo: '/spreadsheet/fulltemplate'
    }).when('/spreadsheet', {
      // templateUrl: 'views/mcgillfieldmethodsspring2014template.html'
      redirectTo: '/spreadsheet/fulltemplate'
    }).otherwise({
      redirectTo: '/corpora_list'
    });

    console.warn("removing old lexicons to reduce storage use, and force fresh");
    for (var i = 0; i < localStorage.length; i++) {
      var localStorageKey = localStorage.key(i);
      if (localStorageKey.indexOf("lexiconResults") > -1 || localStorageKey.indexOf("precendenceRules") > -1 || localStorageKey.indexOf("reducedRules") > -1) {
        localStorage.removeItem(localStorageKey);
        console.log("cleaned " + localStorageKey);
      }
    }

  });
