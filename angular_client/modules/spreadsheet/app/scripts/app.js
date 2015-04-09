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
    'fielddbAngular',
    'ui.router',
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
      fieldDBAppSettings.authentication = {};
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

    // $stateProvider
    //   .state("home", {
    //     url: "/",
    //     templateUrl: "views/corpora_list_and_modals.html"
    //     // controller: "FieldDBController"
    //   });

    // $stateProvider
    // .state('corpora_list', {
    //   url: "/corpora_list",
    //   // controller: "",
    //   templateUrl: 'views/corpora_list_and_modals.html'
    // }).state('welcome', {
    //   url: "/welcome",
    //   // controller: "",
    //   templateUrl: 'views/welcome.html'
    // }).state('settings', {
    //   url: "/settings",
    //   // controller: "",
    //   templateUrl: 'views/settings.html',
    // }).state('corpussettings', {
    //   url: "/corpussettings",
    //   // controller: "",
    //   templateUrl: 'views/corpussettings.html'
    // }).state('register', {
    //   url: "/register",
    //   // controller: "",
    //   templateUrl: 'views/register.html'
    // }).state('faq', {
    //   url: "/faq",
    //   // controller: "",
    //   templateUrl: 'views/faq.html'
    // }).state('/spreadsheet/compacttemplate', {
    //   redirectTo: '/spreadsheet'
    // }).state('/spreadsheet/yalefieldmethodsspring2014template', {
    //   redirectTo: '/spreadsheet'
    // }).state('/spreadsheet/mcgillfieldmethodsfall2014template', {
    //   redirectTo: '/spreadsheet'
    // }).state('/spreadsheet/mcgillfieldmethodsspring2014template', {
    //   redirectTo: '/spreadsheet'
    // }).state('/spreadsheet', {
    //   url: "/spreadsheet",
    //   // controller: "",
    //   templateUrl: 'views/data_entry.html'
    // });

    // $urlRouterProvider.otherwise('/corpora_list');

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
