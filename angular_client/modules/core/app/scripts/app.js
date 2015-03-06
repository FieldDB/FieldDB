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
var app = angular.module("fielddbAngularApp", [
  "ngAnimate",
  "ngCookies",
  "ngResource",
  "ngRoute",
  "ngSanitize",
  "ngTouch",
  "angularFileUpload",
  "contenteditable",
  "ang-drag-drop"
]).config(function($routeProvider, $sceDelegateProvider) {
  // console.log($routeProvider);

  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    "self",
    // Allow loading from outer domain.
    "https://youtube.com/**",
    "https://youtu.be/**",
    "https://soundcloud.com/**",
    "https://*.lingsync.org/**",
    "https://localhost:3184/**",
    "https://localhost/**"
  ]);
  if (FieldDB && FieldDB.PsycholinguisticsApp && FieldDB.Contextualizer && FieldDB.User) {
    var fieldDBApp = new FieldDB.PsycholinguisticsApp({
      authentication: {
        user: new FieldDB.User({
          authenticated: false
        })
      },
      contextualizer: new FieldDB.Contextualizer().loadDefaults(),
      online: true,
      apiURL: "https://localhost:3183",
      offlineCouchURL: "https://localhost:6984",
      brand: "LingSync",
      website: "http://example.org",
      basePathname: window.location.origin+ "/#/",
    });
    if (window.location.pathname.indexOf("android_asset") > -1) {
      fieldDBApp.basePathname = window.location.pathname;
    }
  }
  // if (window.location.hash.indexOf("#") > -1) {
  //   fieldDBApp.basePathname = window.location.pathname + "#";
  // }

  // FieldDB.Database.prototype.BASE_DB_URL = "https://corpusdev.example.org";
  // FieldDB.Database.prototype.BASE_AUTH_URL = "https://authdev.example.org";
  // FieldDB.AudioVideo.prototype.BASE_SPEECH_URL = "https://speechdev.example.org";

});
console.log(app);
// app.run(["$route", "$rootScope", "$location",
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
