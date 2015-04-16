/* globals console, window, document */
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
  "ngAnimate",
  "ngCookies",
  "ngTouch",
  "ngSanitize",
  "ui.router",
  "ui.bootstrap",
  "angularFileUpload",
  "contenteditable"
]).config(function($urlRouterProvider, $sceDelegateProvider, $stateProvider, $locationProvider) {

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
      // basePathname: window.location.origin + "/#", //might be necessary for apache
      basePathname: "/",
    });
  }

  fieldDBApp.knownConnections = FieldDB.Connection.knownConnections;
  fieldDBApp.currentConnection = FieldDB.Connection.defaultConnection(window.location.href, "passByReference");


  fieldDBApp.debug("Loaded fielddbAngular module ");
  fieldDBApp.debug($urlRouterProvider, $stateProvider);

  /* Overriding bug and warn messages to use angular UI components */
  FieldDB.FieldDBObject.bug = function(message) {
    console.warn(message);
  };
  FieldDB.FieldDBObject.warn = function(message) {
    console.warn(message);
  };

  /* Add Event listeners */
  document.addEventListener("logout", function() {
    fieldDBApp.bug("user has logged out, page will reload to clear state and take them to the welcome page.");
  }, false);
  document.addEventListener("authenticate:fail", function() {
    fieldDBApp.warn("user isn't able to see anything, show them the welcome page");
    // fieldDBApp.authentication.error = "";
    console.log("  Redirecting the user to the welcome page");
    //http://joelsaupe.com/programming/angularjs-change-path-without-reloading/
    // $location.path("/welcome", false);
  }, false);

  /* Set up white list of urls where resources (such as images, audio, video or other primary data)
  can be displayed in the app */
  fieldDBApp.whiteListCORS = fieldDBApp.whiteListCORS || [];
  fieldDBApp.whiteListCORS = fieldDBApp.whiteListCORS.concat([
    "https://youtube.com/**",
    "https://youtu.be/**",
    "https://soundcloud.com/**",
    "http://opensourcefieldlinguistics.github.io/**",
    "http://*.example.org/**",
    "https://*.example.org/**",
    "https://localhost:3184/**",
    "https://localhost/**"
  ]);
  $sceDelegateProvider.resourceUrlWhitelist(fieldDBApp.whiteListCORS);

  /* Set up the base path of the app, needed for running in Android assets and/or running in HTML5 mode */
  if (window.location.pathname.indexOf("android_asset") > -1) {
    fieldDBApp.basePathname = window.location.pathname;
  }
  if (window.location.hash.indexOf("#") > -1) {
    fieldDBApp.basePathname = window.location.pathname + "#";
  }
  $locationProvider.html5Mode(true);

  /* Add some default Routes/States which the app knows how to render */
  $urlRouterProvider.otherwise("/corpus");

  $stateProvider
  // HOME STATES AND NESTED VIEWS ========================================
    .state("corpus", {
      url: "/corpus",
      templateUrl: "app/main/main.html"
    })
    // nested list with custom controller
    .state("corpus.fieldlinguist", {
      url: "/fieldlinguist",
      templateUrl: "components/user/consultants-page.html",
      controller: function($scope) {
        $scope.dogs = ["Place", "holders", "for controller"];
      }
    })
    // nested list with just some random string data
    .state("corpus.languageclass", {
      url: "/languageclass",
      templateUrl: "components/user/participants-page.html"
    })
    // ABOUT PAGE AND MULTIPLE NAMED VIEWS =================================
    .state("about", {
      url: "/about",
      templateUrl: "components/corpus/corpus-page.html"
    });

  fieldDBApp.debug("Loaded Angular FieldDB Components ", $stateProvider, $urlRouterProvider, fieldDBApp);
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
