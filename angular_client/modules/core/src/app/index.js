/* globals console, window */
"use strict";
// var angularFieldDB = angular.module("FieldDB", []);
// for (var modelName in FieldDB) {
//   if (!FieldDB.hasOwnProperty(modelName)) {
//     continue;
//   }
//   angularFieldDB.factory("FieldDB" + modelName + "Factory",
//     function() {
//       return FieldDB[modelName];
//     });
// }
angular.module("fielddbAngular", [
  // "ngAnimate",
  "ngCookies",
  "ngTouch",
  "ngSanitize",
  "ui.router",
  "ui.bootstrap",
  "angularFileUpload",
  "contenteditable"
]).config(function($urlRouterProvider, $sceDelegateProvider, $stateProvider) {

  var fieldDBApp;
  if (FieldDB && FieldDB.FieldDBObject && FieldDB.FieldDBObject.application) {
    fieldDBApp = FieldDB.FieldDBObject.application;
  } else {
    fieldDBApp = new FieldDB.App({
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
  }
  fieldDBApp.knownConnections = FieldDB.Connection.knownConnections;
  fieldDBApp.activeConnection = FieldDB.Connection.defaultConnection(window.location.href, "passByReference");

  if (FieldDB.debugMode) {
    console.log("Loaded fielddbAngular module ");
    console.log($urlRouterProvider, $stateProvider);
  }

  FieldDB.FieldDBObject.bug = function(message) {
    console.warn(message);
  };
  FieldDB.FieldDBObject.warn = function(message) {
    console.warn(message);
  };

  fieldDBApp.whiteListCORS = fieldDBApp.whiteListCORS || [];
  fieldDBApp.whiteListCORS = fieldDBApp.whiteListCORS.concat([
    "http://opensourcefieldlinguistics.github.io/**",
    "https://youtube.com/**",
    "https://youtu.be/**",
    "https://soundcloud.com/**",
    "http://*.example.org/**",
    "https://*.example.org/**",
    "https://localhost:3184/**",
    "https://localhost/**"
  ]);

  $sceDelegateProvider.resourceUrlWhitelist(fieldDBApp.whiteListCORS);

  if (window.location.hash.indexOf("#") > -1) {
    fieldDBApp.basePathname = window.location.pathname + "#";
  }

  // FieldDB.Database.prototype.BASE_DB_URL = "https://corpusdev.example.org";
  // FieldDB.Database.prototype.BASE_AUTH_URL = "https://authdev.example.org";
  // FieldDB.AudioVideo.prototype.BASE_SPEECH_URL = "https://speechdev.example.org";

  $stateProvider
    .state("home", {
      url: "/",
      templateUrl: "app/main/main.html",
      controller: "FieldDBController"
    });

  $urlRouterProvider.otherwise("/");

});

console.log("Loaded fielddbAngular module");
// fielddbAngulaModule.run(["$route", "$rootScope", "$location",
//   function($route, $rootScope, $location) {
//     var original = $location.path;
//     $location.path = function(path, reload) {
//       if (reload === false) {
//         var lastRoute = $route.current;
//         var un = $rootScope.$on("$locationChangeSuccess", function() {
//           $route.current = lastRoute;
//           un();
//         });
//       }
//       return original.apply($location, [path]);
//     };
//   }
// ]);
