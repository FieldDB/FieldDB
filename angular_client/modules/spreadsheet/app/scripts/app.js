/* globals FieldDB, alert */
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

    var fieldDBAppSettings;

    if (!FieldDB) {
      alert("Unable to load the app. Please notifiy us of this error. ");
    }

    fieldDBAppSettings = {
      online: true,
      brand: 'Example',
      brandLowerCase: 'example',
      website: 'http://example.org',
      faq: 'http://app.example.org/#/faq',
      tagline: 'A Free Tool for Creating and Maintaining a Shared Database For Communities, Linguists and Language Learners',
      // basePathname: window.location.origin + '/#',
      basePathname: window.location.origin + '/',
      whiteListCORS: [
        // Allow same origin resource loads.
        'self',
        // Allow loading from outer domain.
        'https://*.example.org/**',
        'http://*.example.org/**'
      ]
    };

    console.log("Ensuring FieldDB app is ready. ");

    if (!FieldDB.FieldDBObject.application) {
      console.log("    Creating a app ");
      FieldDB.FieldDBObject.application = new FieldDB.App(fieldDBAppSettings);
    } else {
      console.log("    An application is already available, it might be a Montage application, or a fielddb app.", FieldDB.FieldDBObject.application);
      for (var property in fieldDBAppSettings) {
        if (!fieldDBAppSettings.hasOwnProperty(property)) {
          continue;
        }
        FieldDB.FieldDBObject.application[property] = fieldDBAppSettings[property];
      }
    }

    if (window.location.pathname.indexOf("android_asset") > -1) {
      FieldDB.FieldDBObject.application.basePathname = window.location.pathname;
    }

    FieldDB.FieldDBObject.application.authentication.dispatchEvent("appready");

    $routeProvider.when('/corpora_list', {
      templateUrl: 'views/corpora_list_and_modals.html'
    }).when('/welcome', {
      templateUrl: 'views/welcome.html'
    }).when('/settings', {
      templateUrl: 'views/settings.html',
    }).when('/corpussettings', {
      templateUrl: 'views/corpussettings.html'
    }).when('/register', {
      templateUrl: 'views/register.html'
    }).when('/faq', {
      templateUrl: 'views/faq.html'
    }).when('/spreadsheet/compacttemplate', {
      redirectTo: '/spreadsheet'
    }).when('/spreadsheet/yalefieldmethodsspring2014template', {
      redirectTo: '/spreadsheet'
    }).when('/spreadsheet/mcgillfieldmethodsfall2014template', {
      redirectTo: '/spreadsheet'
    }).when('/spreadsheet/mcgillfieldmethodsspring2014template', {
      redirectTo: '/spreadsheet'
    }).when('/spreadsheet', {
      templateUrl: 'views/data_entry.html'
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
