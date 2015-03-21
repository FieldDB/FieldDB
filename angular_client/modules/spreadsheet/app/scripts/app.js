/* globals FieldDB */
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

    var fieldDBApp = new FieldDB.App({
      authentication: {
        user: new FieldDB.User({
          authenticated: false
        })
      },
      contextualizer: new FieldDB.Contextualizer().loadDefaults(),
      online: true,
      apiURL: "https://localhost:3183",
      offlineCouchURL: "https://localhost:6984",
      brand: "Example",
      brandLowerCase: "example",
      website: "http://example.org",
      faq: "http://app.example.org/#/faq",
      basePathname: window.location.origin + "/#",
    });
    if (window.location.pathname.indexOf("android_asset") > -1) {
      fieldDBApp.basePathname = window.location.pathname;
    }

    $routeProvider.when('/corpora_list', {
      templateUrl: 'views/corpora_list_and_modals.html'
    }).when('/welcome', {
      templateUrl: 'views/corpora_list_and_modals.html'
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
      redirectTo: '/spreadsheet/fulltemplate'
    }).when('/spreadsheet/fulltemplate', {
      templateUrl: 'views/data_entry.html'
    }).when('/spreadsheet/yalefieldmethodsspring2014template', {
      // templateUrl: 'views/yalefieldmethodsspring2014template.html'
      redirectTo: '/spreadsheet/fulltemplate'
    }).when('/spreadsheet/mcgillfieldmethodsfall2014template', {
      // templateUrl: 'views/mcgillfieldmethodsfall2014template.html'
      redirectTo: '/spreadsheet/fulltemplate'
    }).when('/spreadsheet/mcgillfieldmethodsspring2014template', {
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
