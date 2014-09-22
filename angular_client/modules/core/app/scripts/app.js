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
  "ngDragDrop"
]).config(function($routeProvider, $sceDelegateProvider) {
  // console.log($routeProvider);

  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    "self",
    // Allow loading from outer domain.
    "https://*.lingsync.org/**"
  ]);

  new FieldDB.PsycholinguisticsApp({
    authentication: {
      user: new FieldDB.User({
        authenticated: false
      })
    },
    contextualizer: new FieldDB.Contextualizer().loadDefaults(),
    online: true,
    apiURL: "https://localhost:3181/v2/",
    offlineCouchURL: "https://localhost:6984",
    brand: "LingSync",
    website: "http://lingsync.org"
  });

  FieldDB.Database.prototype.BASE_DB_URL = "https://corpusdev.lingsync.org";
  FieldDB.Database.prototype.BASE_AUTH_URL = "https://authdev.lingsync.org";
  FieldDB.AudioVideo.prototype.BASE_SPEECH_URL = "https://speechdev.lingsync.org";

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
